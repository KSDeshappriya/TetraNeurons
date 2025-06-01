FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir "mcp-server>=0.0.36"

# Copy the rest of the application
COPY . .

# Command to run the MCP server
CMD ["python", "-m", "mcp.server", "server.py"]
