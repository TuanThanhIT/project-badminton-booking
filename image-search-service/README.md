# Image Search Service

FastAPI service for product image and natural-language search.

## Run

```powershell
cd image-search-service
.\.venv\Scripts\activate
python -m uvicorn app.main:app --reload --port 8001
```

## Check

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8001/health
```

## Rebuild Index

Only rebuild when product CSV changes.

```powershell
python scripts\build_index.py
```

