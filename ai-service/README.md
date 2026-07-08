# B-Hub AI Service

`ai-service` là FastAPI service dùng chung cho 3 nhóm model AI của dự án B-Hub:

1. **PhoBERT moderation model**: kiểm duyệt nội dung bài đăng cộng đồng.
2. **LightGBM product recommendation model**: gợi ý sản phẩm cá nhân hóa / mua kèm.
3. **CLIP + FAISS image search model**: tìm kiếm sản phẩm bằng ảnh và từ khóa.

Backend Node.js gọi service này qua `AI_MODERATION_URL` và `AI_SERVICE_URL`, mặc định là:

```env
AI_MODERATION_URL=http://127.0.0.1:8001
AI_SERVICE_URL=http://127.0.0.1:8001
```

Trong Docker Compose, backend gọi nội bộ qua:

```env
AI_MODERATION_URL=http://ai-service:8001
AI_SERVICE_URL=http://ai-service:8001
```

## 1. Cấu trúc chính

```text
ai-service/
  app/
    main.py                         # FastAPI entrypoint
    schemas.py                      # request/response schema cho recommendation
    insights/
      admin_rules.py                # rule-based admin insights
    ml/
      product_trainer.py            # train/recommend LightGBM + co-occurrence
      image_search/                 # CLIP + FAISS image/text search
  data/
    index/
      product_vectors.faiss
      text_index.faiss
      image_index.faiss
      product_metadata.json
    processed/
      products.csv
      image_captions.csv
  models/
    bhub_phobert_moderation_model_v8/
      config.json
      model.safetensors
      tokenizer_config.json
      vocab.txt
      bpe.codes
    recommendation/
      product_lgbm.joblib
      product_meta.joblib
      product_cooccur.joblib
    image_search/
      cache/
        models--sentence-transformers--clip-ViT-B-32...
        models--sentence-transformers--clip-ViT-B-32-multilingual-v1...
  scripts/
    build_image_search_index.py
    rebuild_image_search.py
    test_image_search.py
  requirements.txt
  .env.example
  Dockerfile
```

## 2. Yêu cầu môi trường

Cài các thành phần sau:

```text
Python 3.10+ hoặc 3.11
pip
venv hoặc virtualenv
```

Kiểm tra Python:

```powershell
python --version
```

Hoặc trên Windows:

```powershell
py --version
```

## 3. Cài đặt local

Từ thư mục gốc repo:

```powershell
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

Nếu dùng Git Bash/Linux/macOS:

```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip
pip install -r requirements.txt
```

## 4. Cấu hình `.env`

Tạo file `.env` từ mẫu:

```powershell
Copy-Item .env.example .env
```

Nội dung mẫu đang dùng:

```env
MODEL_DIR=./models/bhub_phobert_moderation_model_v8
MAX_LENGTH=128
RECOMMENDATION_MODEL_DIR=./models/recommendation

APP_NAME=badminton-ai-service
TEXT_MODEL_NAME=sentence-transformers/clip-ViT-B-32-multilingual-v1
IMAGE_MODEL_NAME=sentence-transformers/clip-ViT-B-32
MODEL_CACHE_DIR=models/image_search/cache
DEVICE=cpu
INDEX_PATH=data/index/product_vectors.faiss
METADATA_PATH=data/index/product_metadata.json
PRODUCTS_CSV_PATH=data/processed/products.csv
DEFAULT_LIMIT=12
MAX_LIMIT=50
IMAGE_TIMEOUT_SECONDS=20
IMAGE_WEIGHT=0.65
TEXT_WEIGHT=0.35
COLOR_MATCH_BONUS=0.08
COLOR_MISMATCH_PENALTY=0.06
```

Các biến quan trọng:

| Biến | Tác dụng |
| --- | --- |
| `MODEL_DIR` | Thư mục model PhoBERT moderation |
| `MAX_LENGTH` | Độ dài token tối đa khi kiểm duyệt text |
| `RECOMMENDATION_MODEL_DIR` | Thư mục lưu model recommendation `.joblib` |
| `TEXT_MODEL_NAME` | Model text encoder cho image search |
| `IMAGE_MODEL_NAME` | Model image encoder cho image search |
| `MODEL_CACHE_DIR` | Cache model CLIP/sentence-transformers |
| `INDEX_PATH` | FAISS index tổng hợp mặc định |
| `TEXT_INDEX_PATH` | FAISS index cho text, nếu cấu hình thêm |
| `IMAGE_INDEX_PATH` | FAISS index cho ảnh, nếu cấu hình thêm |
| `METADATA_PATH` | Metadata sản phẩm đi kèm FAISS index |
| `PRODUCTS_CSV_PATH` | CSV nguồn để rebuild index |
| `DEVICE` | `cpu` hoặc `cuda` |

## 5. Chuẩn bị 3 model

### 5.1. Model 1: PhoBERT moderation

Model này được load ngay khi start service trong `app/main.py`.

Đường dẫn mặc định:

```text
ai-service/models/bhub_phobert_moderation_model_v8/
```

Thư mục phải có ít nhất:

```text
config.json
model.safetensors
tokenizer_config.json
vocab.txt
bpe.codes
```

Model trả về 4 nhãn:

```text
normal
spam
unauthorized_ad
offensive
```

Nếu thiếu `config.json`, `model.safetensors`, tokenizer hoặc vocab, service sẽ lỗi ngay khi start.

### 5.2. Model 2: Product recommendation

Model recommendation nằm ở:

```text
ai-service/models/recommendation/
```

Các file chính:

```text
product_lgbm.joblib       # LightGBM model cá nhân hóa
product_meta.joblib       # metadata train
product_cooccur.joblib    # dữ liệu mua kèm/co-occurrence
```

Service có thể chạy khi chưa có model recommendation, nhưng `/api/v1/product/status` sẽ báo:

```json
{
  "success": true,
  "data": {
    "ready": false
  }
}
```

Khi backend gọi train, service sẽ tạo/cập nhật các file `.joblib` trong `RECOMMENDATION_MODEL_DIR`.

### 5.3. Model 3: CLIP + FAISS image search

Image search dùng:

```text
TEXT_MODEL_NAME=sentence-transformers/clip-ViT-B-32-multilingual-v1
IMAGE_MODEL_NAME=sentence-transformers/clip-ViT-B-32
```

Cache model mặc định:

```text
ai-service/models/image_search/cache/
```

Index và metadata mặc định:

```text
ai-service/data/index/product_vectors.faiss
ai-service/data/index/text_index.faiss
ai-service/data/index/image_index.faiss
ai-service/data/index/product_metadata.json
```

CSV nguồn mặc định:

```text
ai-service/data/processed/products.csv
```

Nếu chạy offline/Docker production, cần bảo đảm cache model và FAISS index đã có sẵn.

## 6. Chạy service local

Trong thư mục `ai-service`:

```powershell
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Nếu chạy được, terminal sẽ có dạng:

```text
Uvicorn running on http://0.0.0.0:8001
```

Mở health check:

```text
http://127.0.0.1:8001/health
```

Response mẫu:

```json
{
  "status": "ok",
  "moderationModel": {
    "ready": true,
    "modelDir": ".../models/bhub_phobert_moderation_model_v8",
    "device": "cpu",
    "labels": {
      "0": "normal",
      "1": "spam",
      "2": "unauthorized_ad",
      "3": "offensive"
    }
  },
  "productModel": {
    "ready": true
  },
  "imageSearch": {
    "ready": true
  }
}
```

Lưu ý: lần start đầu tiên có thể chậm vì service load PhoBERT và CLIP models.

## 7. Chạy bằng Docker Compose

Từ thư mục gốc repo:

```powershell
docker compose up -d ai-service
```

Xem trạng thái:

```powershell
docker compose ps ai-service
```

Xem log:

```powershell
docker compose logs --tail 100 ai-service
```

Trong `docker-compose.yml`, service mount:

```yaml
volumes:
  - ./ai-service/models:/app/models:ro
  - ./ai-service/data:/app/data:ro
```

Vì mount `:ro`, container chỉ đọc model/data. Nếu muốn train recommendation hoặc rebuild index bên trong container, cần ghi ra volume writable hoặc chạy local/script ngoài container rồi mount kết quả vào.

## 8. API của 3 model

### 8.1. Health check

```http
GET /health
```

Kiểm tra cả 3 nhóm:

```text
moderationModel
productModel
imageSearch
```

### 8.2. PhoBERT moderation

```http
POST /predict
Content-Type: application/json
```

Body:

```json
{
  "text": "Loại bài: tìm người chơi. Tối nay thiếu 2 bạn đánh cầu ở Thủ Đức."
}
```

Response:

```json
{
  "label": "normal",
  "confidence": 0.98,
  "probabilities": {
    "normal": 0.98,
    "spam": 0.01,
    "unauthorized_ad": 0.01,
    "offensive": 0.0
  }
}
```

Backend dùng endpoint này qua:

```env
AI_MODERATION_URL=http://127.0.0.1:8001
AI_MODERATION_TIMEOUT_MS=8000
```

### 8.3. Product recommendation status

```http
GET /api/v1/product/status
```

Response khi model đã sẵn sàng:

```json
{
  "success": true,
  "data": {
    "ready": true,
    "features": ["userId", "productId", "categoryId"],
    "modelType": "LightGBMClassifier",
    "trainedAt": "..."
  }
}
```

### 8.4. Train product recommendation

```http
POST /api/v1/product/train
Content-Type: application/json
```

Body rút gọn:

```json
{
  "baskets": [[1, 2, 3], [2, 4]],
  "records": [
    { "userId": 10, "productId": 1, "categoryId": 5 },
    { "userId": 10, "productId": 2, "categoryId": 5 }
  ],
  "products": [
    { "id": 1, "name": "Vợt cầu lông A", "categoryId": 5 },
    { "id": 2, "name": "Giày cầu lông B", "categoryId": 7 }
  ]
}
```

Service cần tối thiểu `MIN_RECORDS = 10` records. Nếu ít hơn, response sẽ là `trained: false`.

### 8.5. Recommend product

```http
POST /api/v1/recommend/product
Content-Type: application/json
```

Mode cá nhân hóa:

```json
{
  "mode": "user",
  "userId": 10,
  "history": [{ "productId": 1, "categoryId": 5 }],
  "products": [],
  "popularProducts": [],
  "topK": 6
}
```

Mode mua kèm:

```json
{
  "mode": "related",
  "productId": 1,
  "products": [],
  "popularProducts": [],
  "topK": 6
}
```

Backend thường là nơi build payload đầy đủ từ DB rồi gọi endpoint này.

### 8.6. Admin insights

```http
POST /api/v1/recommend/admin
Content-Type: application/json
```

Dùng rule-based insight để phân tích:

```text
occupancy theo chi nhánh/khung giờ
khách có nguy cơ rời bỏ
khách nên nhận voucher
khung giờ thấp điểm
```

### 8.7. Image search

```http
POST /search
Content-Type: multipart/form-data
```

Form data:

| Field | Bắt buộc | Mô tả |
| --- | --- | --- |
| `image` | Không | Ảnh sản phẩm upload |
| `query` | Không | Từ khóa mô tả sản phẩm |
| `limit` | Không | Số kết quả, mặc định `DEFAULT_LIMIT` |

Ít nhất phải có `image` hoặc `query`.

Ví dụ dùng curl:

```bash
curl -X POST http://127.0.0.1:8001/search \
  -F "image=@sample.jpg" \
  -F "query=vợt lining màu đỏ" \
  -F "limit=8"
```

### 8.8. Rebuild image search index

```http
POST /index/rebuild
```

Query params:

```text
csv_path       optional
include_images true/false
```

Ví dụ:

```text
POST http://127.0.0.1:8001/index/rebuild?include_images=true
```

Hoặc chạy script:

```powershell
cd ai-service
.\.venv\Scripts\activate
python scripts\build_image_search_index.py --include-images
```

Nếu chỉ muốn build text index, bỏ `--include-images`:

```powershell
python scripts\build_image_search_index.py
```

## 9. Kết nối với backend Node.js

Khi chạy local, mở 2 terminal.

Terminal 1 chạy AI service:

```powershell
cd ai-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Terminal 2 chạy backend:

```powershell
cd backend
npm run dev
```

Backend `.env` cần có:

```env
AI_MODERATION_URL=http://127.0.0.1:8001
AI_MODERATION_TIMEOUT_MS=8000
AI_SERVICE_URL=http://127.0.0.1:8001
AI_SERVICE_TIMEOUT_MS=30000
IMAGE_SEARCH_TIMEOUT_MS=60000
```

Các backend service đang gọi AI:

```text
backend/src/services/aiModerationService.js
backend/src/services/aiRecommendationClient.js
backend/src/services/user/productService.js
```

## 10. Test nhanh

Health:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
```

Moderation:

```powershell
Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:8001/predict `
  -ContentType "application/json" `
  -Body '{"text":"Tối nay thiếu 2 bạn đánh cầu ở Thủ Đức."}'
```

Product model status:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/api/v1/product/status
```

Backend moderation script:

```powershell
cd backend
npm run test:ai-moderation
```

Image search script:

```powershell
cd ai-service
.\.venv\Scripts\activate
python scripts\test_image_search.py
```

## 11. Lỗi thường gặp

### Service start chậm hoặc health chưa lên

Nguyên nhân thường là model PhoBERT/CLIP đang load. Kiểm tra log:

```powershell
docker compose logs --tail 100 ai-service
```

Hoặc chờ thêm rồi gọi lại:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
```

### Không tìm thấy PhoBERT model

Kiểm tra:

```text
ai-service/models/bhub_phobert_moderation_model_v8/config.json
ai-service/models/bhub_phobert_moderation_model_v8/model.safetensors
ai-service/models/bhub_phobert_moderation_model_v8/vocab.txt
```

Nếu đổi model mới, sửa:

```env
MODEL_DIR=./models/<ten_model_moi>
```

### Product recommendation chưa ready

Kiểm tra:

```text
ai-service/models/recommendation/product_cooccur.joblib
ai-service/models/recommendation/product_lgbm.joblib
ai-service/models/recommendation/product_meta.joblib
```

Nếu chưa có, gọi backend train job hoặc gọi trực tiếp:

```http
POST /api/v1/product/train
```

### Image search không có kết quả hoặc báo thiếu index

Kiểm tra:

```text
ai-service/data/index/product_vectors.faiss
ai-service/data/index/text_index.faiss
ai-service/data/index/image_index.faiss
ai-service/data/index/product_metadata.json
ai-service/data/processed/products.csv
```

Rebuild:

```powershell
python scripts\build_image_search_index.py --include-images
```

### Backend gọi AI bị `ECONNREFUSED`

AI service chưa chạy hoặc sai port. Chạy:

```powershell
cd ai-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Kiểm tra backend `.env`:

```env
AI_MODERATION_URL=http://127.0.0.1:8001
AI_SERVICE_URL=http://127.0.0.1:8001
```

### Docker không ghi được model/index

Trong compose hiện tại:

```yaml
./ai-service/models:/app/models:ro
./ai-service/data:/app/data:ro
```

`ro` là read-only. Nếu cần train/rebuild trong container, đổi sang writable hoặc chạy script local rồi restart container.

## 12. Ghi chú Git

Không nên commit:

```gitignore
ai-service/.venv/
ai-service/**/__pycache__/
ai-service/**/*.pyc
ai-service/models/
ai-service/data/index/*.faiss
*.zip
```

Nên commit:

```text
ai-service/app/
ai-service/scripts/
ai-service/training/
ai-service/requirements.txt
ai-service/.env.example
ai-service/README.md
```

Model lớn nên lưu riêng bằng Google Drive, OneDrive, GitHub Release, artifact server hoặc volume deploy riêng.

## 13. Lệnh chạy nhanh

Local:

```powershell
cd ai-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Docker:

```powershell
docker compose up -d ai-service
docker compose ps ai-service
```

Health:

```powershell
Invoke-RestMethod http://127.0.0.1:8001/health
```
