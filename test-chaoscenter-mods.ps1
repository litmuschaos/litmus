# test-chaoscenter-mods.ps1
# Run from repo root (where the litmus folder exists) or pass -Root to chaoscenter path.
param(
  [string]$ChaosCenter = ".\litmus\chaoscenter",
  [string]$GoVersion = "1.25"
)

$ErrorActionPreference = "Stop"
$startDir = Get-Location
$logsDir = Join-Path $startDir "go_mod_update_logs"
New-Item -ItemType Directory -Force -Path $logsDir | Out-Null

# Discover all go.mod files inside ChaosCenter (depth arbitrary)
$gomods = Get-ChildItem -Path $ChaosCenter -Recurse -Filter "go.mod" -File

if (-not $gomods) {
  Write-Host "No go.mod files found under $ChaosCenter"
  exit 1
}

$results = @()

Write-Host "Found $($gomods.Count) modules. Updating to go $GoVersion, tidying, building, and testing..." -ForegroundColor Cyan

foreach ($gm in $gomods) {
  $moduleDir = $gm.Directory.FullName
  $relPath   = Resolve-Path -LiteralPath $moduleDir | ForEach-Object {
    $_.Path.Substring((Resolve-Path .).Path.Length).TrimStart('\')
  }
  $name = Split-Path $moduleDir -Leaf
  $log  = Join-Path $logsDir ("{0}-{1:yyyyMMdd_HHmmss}.log" -f $name,(Get-Date))

  $status = @{
    Module = $name
    Path   = $relPath
    Update = "SKIP"
    Tidy   = "SKIP"
    Build  = "SKIP"
    Test   = "SKIP"
    Log    = $log
  }

  Write-Host "`n=== $relPath ===" -ForegroundColor Yellow
  Push-Location $moduleDir
  try {
    # 1) Update 'go' directive in go.mod to requested version (in-place)
    Write-Host "Updating go.mod go directive to $GoVersion"
    "== update go directive ==" | Tee-Object -FilePath $log -Append | Out-Null
    # Replace 'go x.y' line; preserves comments/other lines
    $gomodText = Get-Content -Raw -LiteralPath "go.mod"
    $gomodText = $gomodText -replace "(?m)^\s*go\s+\d+\.\d+\s*$","go $GoVersion"
    $gomodText | Set-Content -LiteralPath "go.mod"
    $status.Update = "OK"

    # 2) Tidy dependencies (recommended in multi-module workspaces) [go.work guidance] [web:19][web:4]
    Write-Host "go mod tidy..."
    "== go mod tidy ==" | Tee-Object -FilePath $log -Append | Out-Null
    & go mod tidy 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
    if ($LASTEXITCODE -eq 0) { $status.Tidy = "OK" } else { $status.Tidy = "FAIL" }

    # 3) Build all packages in the module [web:12]
    Write-Host "go build ./..."
    "== go build ./... ==" | Tee-Object -FilePath $log -Append | Out-Null
    & go build ./... 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
    if ($LASTEXITCODE -eq 0) { $status.Build = "OK" } else { $status.Build = "FAIL" }

    # 4) Test all packages in the module (race + fresh run) [web:2][web:12]
    Write-Host "go test ./... -race -count=1 -v"
    "== go test ./... -race -count=1 -v ==" | Tee-Object -FilePath $log -Append | Out-Null
    & go test ./... -race -count=1 -v 2>&1 | Tee-Object -FilePath $log -Append | Out-Null
    if ($LASTEXITCODE -eq 0) { $status.Test = "OK" } else { $status.Test = "FAIL" }
  }
  finally {
    Pop-Location
  }

  $results += [pscustomobject]$status
}

Write-Host "`n===== SUMMARY =====" -ForegroundColor Cyan
$results | Sort-Object Path | Format-Table Module,Path,Update,Tidy,Build,Test,Log -AutoSize

# Exit non-zero if any step failed
$failed = $results | Where-Object { $_.Update -eq "FAIL" -or $_.Tidy -eq "FAIL" -or $_.Build -eq "FAIL" -or $_.Test -eq "FAIL" }
if ($failed) { exit 1 } else { exit 0 }
