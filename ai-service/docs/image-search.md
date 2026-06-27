# Image Search In AI Service

Image search now runs inside `ai-service`. Do not start a separate
`image-search-service` container.

## Structure

```text
ai-service/
  app/
    ml/
      image_search/
        api/
        config/
        embeddings/
        image_processing/
        retrieval/
        schemas/
        services/
        text_processing/
  data/
    processed/products.csv
    processed/image_captions.csv
    index/product_vectors.faiss
    index/product_metadata.json
  models/
    image_search/
      cache/
      clip-multilingual-badminton/
  scripts/
    build_image_search_index.py
    rebuild_image_search.py
    test_image_search.py
  training/
    build_dataset.py
    evaluate_retrieval.py
    export_model.py
    train_clip.py
```

## Run

Start the unified service on port `8001`:

```bash
cd ai-service
uvicorn app.main:app --reload --port 8001
```

Build or rebuild the FAISS index:

```bash
cd ai-service
python scripts/build_image_search_index.py
```

Downloaded SentenceTransformer model files and fine-tuned image-search models
belong under `models/image_search/`. The default runtime cache is:

```text
models/image_search/cache
```

If you fine-tune the text tower, the default output is:

```text
models/image_search/clip-multilingual-badminton
```

Search by image and text:

```bash
curl -X POST http://localhost:8001/search ^
  -F "image=@D:\path\to\racket.jpg" ^
  -F "query=tim san pham tuong tu nhung mau trang" ^
  -F "limit=12"
```

## Data

`data/processed/products.csv` must contain at least:

```csv
product_id,name,image_url
```

Recommended columns:

```csv
brand,category,color,description,product_url,price
```

Export the catalog CSV from the backend:

```bash
cd backend
npm run export:image-search
```

The index builder saves:

```text
data/index/product_vectors.faiss
data/index/product_metadata.json
```
