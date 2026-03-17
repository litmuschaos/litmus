# Litmus Local Development Setup Script for Windows
# This script launches all required services in separate PowerShell windows

$ErrorActionPreference = "Stop"

$SCRIPT_DIR = Split-Path -Parent $MyInvocation.MyCommand.Path
$PROJECT_ROOT = Split-Path -Parent $SCRIPT_DIR

$MONGO_VERSION = "4.2"
$DB_USER = "admin"
$DB_PASSWORD = "1234"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "Starting Litmus Local Development Environment" "Green"

# Function to check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    }
    catch {
        Write-ColorOutput "Docker is not running. Please start Docker Desktop and try again." "Red"
        exit 1
    }
}

# Function to check and update hosts file
function Update-HostsFile {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'High')]
    param()

    $hostsPath = "$env:SystemRoot\System32\drivers\etc\hosts"
    $hostsContent = Get-Content $hostsPath -Raw
   
    if ($hostsContent -notmatch "127\.0\.0\.1\s+m1\s+m2\s+m3") {
        Write-ColorOutput "Hosts file missing MongoDB entries. Adding them..." "Yellow"
       
        $isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
       
        if (-not $isAdmin) {
            Write-ColorOutput "This script needs to be run as Administrator to modify the hosts file." "Red"
            Write-ColorOutput "Please right-click PowerShell and select 'Run as Administrator', then run this script again." "Yellow"
            exit 1
        }

        if ($PSCmdlet.ShouldProcess($hostsPath, "Add MongoDB host entries (m1 m2 m3)")) {
            Add-Content -Path $hostsPath -Value "`n127.0.0.1 m1 m2 m3"
            Write-ColorOutput "Hosts entry added successfully." "Green"
        }
    }
}

# Function to wait for MongoDB to be ready
function Wait-ForMongo {
    param(
        [int]$Port,
        [int]$MaxAttempts = 30
    )
   
    Write-Host "Waiting for MongoDB on port $Port..."
   
    for ($attempt = 0; $attempt -lt $MaxAttempts; $attempt++) {
        try {
            docker exec m1 mongo --port $Port --eval "db.runCommand({ ping: 1 })" 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "MongoDB is ready on port $Port"
                return $true
            }
        }
        catch {
        Write-ColorOutput "MongoDB not ready yet (attempt $($attempt + 1)/$MaxAttempts)" "Yellow"
        }
        Start-Sleep -Seconds 1
    }
   
    Write-ColorOutput "MongoDB failed to start on port $Port" "Red"
    return $false
}

function Initialize-MongoDBCluster {
    Write-ColorOutput "Setting up MongoDB cluster..." "Green"
    Write-Host "Cleaning up existing containers..."

    $containers = @("m1", "m2", "m3")

    foreach ($c in $containers) {
        $exists = docker ps -a --format "{{.Names}}" | Where-Object { $_ -eq $c }
        if ($exists) {
            Write-Host "Removing existing container: $c"
            docker rm -f $c | Out-Null
        } else {
            Write-Host "Container not found: $c (skipping)"
        }
    }

    $networkName = "mongo-cluster"
    $networkExists = docker network ls --format "{{.Name}}" | Where-Object { $_ -eq $networkName }
    if ($networkExists) {
        Write-Host "Docker network '$networkName' already exists (reusing)"
    } else {
        Write-Host "Creating Docker network: $networkName"
        docker network create $networkName | Out-Null
    }

    Write-Host "Pulling MongoDB image..."
    docker pull mongo:$MONGO_VERSION | Out-Null

    Write-Host "Starting MongoDB containers..."
    docker run -d --net $networkName -p 27015:27015 --name m1 mongo:$MONGO_VERSION mongod --replSet rs0 --port 27015 | Out-Null
    docker run -d --net $networkName -p 27016:27016 --name m2 mongo:$MONGO_VERSION mongod --replSet rs0 --port 27016 | Out-Null
    docker run -d --net $networkName -p 27017:27017 --name m3 mongo:$MONGO_VERSION mongod --replSet rs0 --port 27017 | Out-Null

    # Wait for primary node container to be up
    if (-not (Wait-ForMongo -Port 27015)) {
        return $false
    }

    # Check if replica set already initiated
    Write-Host "Checking replica set status..."
    $isInitiated = docker exec m1 mongo --port 27015 --quiet --eval "rs.status().ok" 2>$null

    if ($isInitiated -eq "1") {
        Write-Host "Replica set already initiated. Skipping rs.initiate()."
    } else {
       Write-Host "Checking replica set status..."
$replicaStatus = docker exec m1 mongo --port 27015 --quiet --eval "try { rs.status().ok } catch(e) { print(e.code); }" 2>$null

if ($replicaStatus -eq "1") {
    Write-Host "Replica set already initialized. Skipping rs.initiate()."
} else {
    Write-Host "Initializing replica set..."

    $rsConfig = "rs.initiate({_id:'rs0',members:[{_id:0,host:'m1:27015'},{_id:1,host:'m2:27016'},{_id:2,host:'m3:27017'}]})"

    $initOutput = docker exec m1 mongo --port 27015 --quiet --eval "$rsConfig" 2>&1
    Write-Host $initOutput

    if ($LASTEXITCODE -ne 0 -and ($initOutput -notmatch "AlreadyInitialized")) {
        Write-ColorOutput "Failed to run rs.initiate (exit code $LASTEXITCODE)" "Red"
        return $false
    }
}
    # Wait for primary election
    Write-Host "Waiting for primary election..."
    $maxWaitSeconds = 60
    $elapsed = 0
    $primaryElected = $false

    while ($elapsed -lt $maxWaitSeconds) {
        try {
            $result = docker exec m1 mongo --port 27015 --quiet --eval "rs.isMaster().ismaster" 2>$null
            if ($result -match "true") {
                Write-Host "Primary elected successfully"
                $primaryElected = $true
                break
            }
        } catch {
            Write-ColorOutput "Error checking primary status: $_" "Yellow"
        }

        Write-Host "Waiting for primary... ($elapsed/$maxWaitSeconds seconds)"
        Start-Sleep -Seconds 3
        $elapsed += 3
    }

    if (-not $primaryElected) {
        Write-ColorOutput "Timeout waiting for primary election" "Red"
        return $false
    }

    Start-Sleep -Seconds 3

    Write-Host "Creating admin user (if not exists)..."
    $createUserCmd = @"
db = db.getSiblingDB('admin');
if (!db.getUser('$DB_USER')) {
    db.createUser({
        user:'$DB_USER',
        pwd:'$DB_PASSWORD',
        roles:[{role:'root',db:'admin'}]
    });
} else {
    print('User $DB_USER already exists, skipping createUser');
}
"@

    docker exec m1 mongo --port 27015 --quiet --eval $createUserCmd

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Failed to create admin user" "Red"
        return $false
    }

    Write-ColorOutput "MongoDB setup complete!" "Green"
    return $true
}
}

function Start-ServiceWindow {
    [CmdletBinding(SupportsShouldProcess = $true, ConfirmImpact = 'Medium')]
    param(
        [string]$Title,
        [string]$Command
    )

    $psCommand = @"
Set-Location '$PROJECT_ROOT'
Write-Host '=== $Title ===' -ForegroundColor Cyan
$Command
Write-Host ''
Write-Host 'Press any key to close this window...' -ForegroundColor Yellow
`$null = `$Host.UI.RawUI.ReadKey('NoEcho,IncludeKeyDown')
"@

    if ($PSCmdlet.ShouldProcess("PowerShell window for '$Title'", "Start service window")) {
        Start-Process powershell -ArgumentList "-NoExit", "-Command", $psCommand
        Start-Sleep -Seconds 1
    }
}

function Get-EnvFileContent {
    param([string]$FilePath)
   
    if (Test-Path $FilePath) {
        $envVars = @{}
        Get-Content $FilePath | ForEach-Object {
            if ($_ -match '^([^=]+)=(.*)$') {
                $envVars[$matches[1]] = $matches[2]
            }
        }
        return $envVars
    }
    return @{}
}

# Main execution
function Main {
    Test-Docker
   
    Update-HostsFile
   
    if (-not (Initialize-MongoDBCluster)) {
        Write-ColorOutput "MongoDB setup failed. Exiting." "Red"
        exit 1
    }
   
    Write-ColorOutput "MongoDB is ready. Launching application services..." "Green"
    Start-Sleep -Seconds 2
   
    # Launch API server
    Write-Host "Launching API server..."
    $apiEnvFile = Join-Path $SCRIPT_DIR ".env.auth"
    $apiEnvVars = ""
    if (Test-Path $apiEnvFile) {
        $envContent = Get-EnvFileContent $apiEnvFile
        $apiEnvVars = ($envContent.GetEnumerator() | ForEach-Object { "`$env:$($_.Key)='$($_.Value)'" }) -join "; "
    }
    $apiCmd = "$apiEnvVars; Set-Location '$PROJECT_ROOT\chaoscenter\authentication\api'; go run main.go"
    Start-ServiceWindow -Title "Litmus API" -Command $apiCmd
   
    Start-Sleep -Seconds 3
   
    # Launch GraphQL server
    Write-Host "Launching GraphQL server..."
    $graphqlEnvFile = Join-Path $SCRIPT_DIR ".env.api"
    $graphqlEnvVars = ""
    if (Test-Path $graphqlEnvFile) {
        $envContent = Get-EnvFileContent $graphqlEnvFile
        $graphqlEnvVars = ($envContent.GetEnumerator() | ForEach-Object { "`$env:$($_.Key)='$($_.Value)'" }) -join "; "
    }
    $graphqlCmd = "$graphqlEnvVars; Set-Location '$PROJECT_ROOT\chaoscenter\graphql\server'; go run server.go"
    Start-ServiceWindow -Title "Litmus GraphQL" -Command $graphqlCmd
   
    Start-Sleep -Seconds 2
   
    # Launch Frontend
    Write-Host "Launching Frontend..."
    $frontendCmd = "Set-Location '$PROJECT_ROOT\chaoscenter\web'; yarn; yarn generate-certificate:win; yarn dev"
    Start-ServiceWindow -Title "Litmus Frontend" -Command $frontendCmd
   
    Write-ColorOutput "`nAll services launched successfully!" "Green"
    Write-ColorOutput "Note: Check individual PowerShell windows for service status" "Yellow"
    Write-Host ""
    Write-Host "Services:"
    Write-Host "  - MongoDB: ports 27015, 27016, 27017"
    Write-Host "  - API: check API window for port"
    Write-Host "  - GraphQL: check GraphQL window for port"
    Write-Host "  - Frontend: check Frontend window for port"
    Write-Host ""
    Write-Host "To stop MongoDB, run: docker rm -f m1 m2 m3 2>$null || $true"
}

Main