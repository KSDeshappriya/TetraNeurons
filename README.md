# TetraNeurons

### Project Setup

```bash
# Clone the repository
git clone https://github.com/Adhishtanaka/TetraNeurons.git
cd TetraNeurons
```

### Install and Run Frontend

```bash
cd frontend
npm install
npm run dev
```

> This will start the frontend on [http://localhost:5173](http://localhost:5173) by default.

### Install and Run Backend

```bash
cd backend

# Create virtual environment (only first time)
python -m venv .venv

# Activate virtual environment
# On Windows:
.venv\Scripts\activate
# On macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run FastAPI backend
fastapi dev main.py
```
> This will start the backend at [http://localhost:8000](http://localhost:8000) by default.


