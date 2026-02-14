
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create a non-root user
RUN adduser --disabled-password --gecos "" appuser && chown -R appuser /app
USER appuser

# Expose port
EXPOSE 8000

# Command to run the application
# Using generic uvicorn command, can be overridden by docker-compose for dev/prod
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
