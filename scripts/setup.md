# 🚀 Project Setup Guide

Follow the steps below to set up and run the project on your local machine.

---

## 🧩 Prerequisites

Make sure the following are installed:

- Git
- Go
- Node
- yarn
- PowerShell (Windows users)
- Terminal / Bash (macOS & Linux users)

---

## ⚙️ Setup Instructions

### 1. Clone the forked repository
```bash
git clone <your-repository-url>
```

### 2. Prepare startup scripts

- Windows (PowerShell)
    ```powershell
    # Allow running local scripts for the current session
    Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process -Force
    ```
    (No chmod needed on Windows; ensure the script path is correct.)

- macOS / Linux
    ```bash
    chmod +x ./scripts/start-dev.sh
    ```

### 3. Run the startup script

- Windows (PowerShell)
    ```powershell
    .\scripts\start-dev.ps1
    ```

- macOS / Linux
    ```bash
    ./scripts/start-dev.sh
    ```

The script prompt for your system password (sudo) to start required background services.
![setup-example](./passwordInput.png)


### 4. Automatic terminal setup

After entering your password, the script will open three terminals automatically. Each terminal runs a different part of the application (API, GRAPHQL & UI). You do not need to start them manually.

### 5. Access the application

Once the frontend finishes building, open:

https://localhost:8185

Credentials:

| Username | Password |
|----------|----------|
| admin    | litmus   |

---
