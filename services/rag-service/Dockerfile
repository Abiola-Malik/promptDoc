FROM python:3.11-slim
RUN pip install uv --quiet
WORKDIR /app
COPY requirements.lock .
RUN uv pip install --system -r requirements.lock
COPY . .
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]