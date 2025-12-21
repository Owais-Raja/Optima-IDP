# Optima IDP

Optima IDP is an intelligent Individual Development Plan platform that connects employees with personalized learning resources and career path recommendations.

## Project Structure

- **backend/**: Node.js/Express API server
- **recommender/**: Python/FastAPI AI recommendation service
- **frontend/**: React/Vite web application
- **docs/**: Detailed documentation

## Setup Instructions

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- MongoDB (running locally on port 27017)
- Redis (running locally on port 6379)

### Configuration
A `.env` file is located at the root of the project containing configuration for both services.

### Running the Project

You will need to run the services in separate terminals.

**1. Backend**
```bash
cd backend
npm install
npm run dev
```

**2. Recommender Service**
```bash
cd recommender
# Create/Activate virtual environment
python -m venv .venv
.\.venv\Scripts\Activate
# Install dependencies
pip install -r requirements.txt
# Run service
python main.py
```

**3. Frontend**
```bash
cd frontend
npm install
npm run dev
```

For more details, see [LOCAL_SETUP.md](docs/LOCAL_SETUP.md).
