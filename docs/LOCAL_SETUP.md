# Local Development Setup Guide

Since Docker has been removed, you need to run MongoDB, Redis, and the application services manually.

## 1. Prerequisites

### Database & Cache
- **MongoDB**: Must be running locally on port `27017`.
- **Redis**: Must be running locally on port `6379`.

### Installing Redis on Windows (via WSL)
The easiest way to run Redis on Windows is using WSL (Windows Subsystem for Linux).

**Important:** Check your WSL distribution first.
```powershell
wsl cat /etc/os-release
```
If it says "Docker Desktop", you need to install a full Linux distribution like Ubuntu.

1.  **Install Ubuntu (if not already installed)**:
    ```powershell
    wsl --install -d Ubuntu
    ```
    *Restart your terminal after installation.*

2.  **Open Ubuntu**:
    Run `wsl -d Ubuntu` or open "Ubuntu" from your Start menu.

3.  **Install Redis (inside Ubuntu)**:
    ```bash
    sudo apt-get update
    sudo apt-get install redis-server -y
    ```

4.  **Start Redis**:
    ```bash
    sudo service redis-server start
    ```

5.  **Verify**:
    ```bash
    redis-cli ping
    # Output should be: PONG
    ```

## 2. Starting the Services

You will need **3 separate terminals**.

### Terminal 1: Backend
```powershell
cd backend
npm install
npm run dev
```
*Expected Output:* `Server running on port 5000` and `MongoDB connected successfully`.

### Terminal 2: Recommender Service (Python)
Make sure you have Python 3.9+ installed.

```powershell
cd recommender

# Create virtual env if not exists
# python -m venv .venv

# Activate virtual environment
.\.venv\Scripts\Activate

pip install -r requirements.txt
python main.py
```
*Expected Output:* `Uvicorn running on http://0.0.0.0:8000`.

### Terminal 3: Frontend
```powershell
cd frontend
npm install
npm run dev
```
*Expected Output:* `Local: http://localhost:5173`.
