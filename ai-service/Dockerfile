<<<<<<< HEAD
FROM python:3.11-slim
=======
FROM python:3.12-slim
>>>>>>> Branch_Nam_ML

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

<<<<<<< HEAD
COPY requirements.txt .

=======
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
>>>>>>> Branch_Nam_ML
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app

<<<<<<< HEAD
EXPOSE 8001

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8001"]
=======
RUN mkdir -p /app/models

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://127.0.0.1:8000/health')"

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
>>>>>>> Branch_Nam_ML
