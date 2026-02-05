# Corgi Design Backend
FROM python:3.12-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 8080

# Environment variables
ENV HOST=0.0.0.0
ENV PORT=8080
ENV AI_PROVIDER=openai
ENV AI_LOG_ENABLED=true
ENV AI_LOG_FILE=logs/ai_requests.log

# Run the application
CMD ["sh", "-c", "uvicorn main:app --host 0.0.0.0 --port ${PORT:-8080}"]
