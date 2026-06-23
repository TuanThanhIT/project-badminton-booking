# B-Hub AI Moderation Service

AI service dùng để kiểm duyệt bài đăng cộng đồng trong hệ thống B-Hub.

Service này sử dụng FastAPI để chạy model PhoBERT đã fine-tune cho 4 nhãn:

```text
normal
spam
unauthorized_ad
offensive
```

Backend NodeJS sẽ gọi AI service qua API `/predict`.

---

## 1. Cấu trúc thư mục

Cấu trúc chuẩn của `ai-service`:

```text
ai-service/
  app/
    main.py
  models/
    bhub_phobert_moderation_model_v4/
      config.json
      model.safetensors
      tokenizer_config.json
      special_tokens_map.json
      vocab.txt
      ...
  requirements.txt
  README.md
  .env.example
```

Lưu ý:

```text
.venv/
models/
__pycache__/
*.pyc
*.zip
```

không nên commit lên Git.

---

## 2. Yêu cầu môi trường

Cần cài:

```text
Python 3.10+
pip
virtualenv hoặc venv
```

Kiểm tra Python:

```bash
python --version
```

Hoặc:

```bash
py --version
```

---

## 3. Tạo môi trường ảo

Di chuyển vào thư mục `ai-service`:

```bash
cd ai-service
```

Tạo virtual environment:

```bash
python -m venv .venv
```

Nếu dùng Windows PowerShell, kích hoạt môi trường:

```powershell
.\.venv\Scripts\activate
```

Nếu dùng Git Bash/Linux/macOS:

```bash
source .venv/bin/activate
```

Sau khi activate thành công, terminal sẽ hiện dạng:

```text
(.venv)
```

---

## 4. Cài thư viện

Chạy lệnh:

```bash
pip install -r requirements.txt
```

Nếu pip quá cũ, có thể nâng cấp trước:

```bash
python -m pip install --upgrade pip
```

---

## 5. Tải model AI

Do model khá nặng nên không lưu trực tiếp trong Git.

Tải file model từ link được cung cấp riêng, ví dụ:

```text
bhub_phobert_moderation_model_v4.zip
```

Sau khi tải về, giải nén vào thư mục:

```text
ai-service/models/bhub_phobert_moderation_model_v4/
```

Cấu trúc sau khi giải nén phải giống như sau:

```text
ai-service/
  models/
    bhub_phobert_moderation_model_v4/
      config.json
      model.safetensors
      tokenizer_config.json
      special_tokens_map.json
      vocab.txt
```

Nếu thiếu `config.json` hoặc `model.safetensors`, service sẽ không chạy được.

---

## 6. Tạo file môi trường

Tạo file `.env` trong thư mục `ai-service` nếu project đã hỗ trợ đọc `.env`.

Ví dụ:

```env
MODEL_DIR=./models/bhub_phobert_moderation_model_v4
MAX_LENGTH=128
```

Nếu code đang dùng đường dẫn mặc định trong `app/main.py`, có thể không cần tạo `.env`.

Mặc định model sẽ được load từ:

```text
ai-service/models/bhub_phobert_moderation_model_v4
```

---

## 7. Chạy AI service

Trong thư mục `ai-service`, chạy:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Nếu chạy thành công, terminal sẽ hiện dạng:

```text
Uvicorn running on http://0.0.0.0:8001
```

---

## 8. Kiểm tra service

Mở trình duyệt:

```text
http://127.0.0.1:8001/health
```

Nếu thành công sẽ trả về dạng:

```json
{
  "status": "ok",
  "message": "AI service is running",
  "model_loaded": true,
  "device": "cpu",
  "labels": {
    "0": "normal",
    "1": "spam",
    "2": "unauthorized_ad",
    "3": "offensive"
  }
}
```

---

## 9. Test API predict

Có thể test bằng Postman hoặc curl.

Endpoint:

```text
POST http://127.0.0.1:8001/predict
```

Body:

```json
{
  "text": "Loại bài: tìm người chơi. Tối nay thiếu 2 bạn đánh cầu ở Thủ Đức. Tiền sân chia đều."
}
```

Response mẫu:

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

---

## 10. Kết nối với backend NodeJS

Trong backend, cấu hình biến môi trường:

```env
AI_MODERATION_URL=http://127.0.0.1:8001
AI_MODERATION_TIMEOUT_MS=8000
```

Khi chạy local, cần mở 2 terminal:

Terminal 1 chạy AI service:

```bash
cd ai-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Terminal 2 chạy backend:

```bash
cd backend
npm run dev
```

Backend sẽ gọi AI service thông qua:

```text
http://127.0.0.1:8001/predict
```

---

## 11. Test từ backend

Nếu backend có script test AI moderation, chạy:

```bash
cd backend
npm run test:ai-moderation
```

Expected:

```text
NORMAL -> ALLOW
SPAM -> BLOCK
UNAUTHORIZED_AD -> REVIEW
OFFENSIVE -> BLOCK
```

---

## 12. Khi thay model mới

Ví dụ train lại model V5, giải nén vào:

```text
ai-service/models/bhub_phobert_moderation_model_v5/
```

Sau đó đổi `MODEL_DIR`:

```env
MODEL_DIR=./models/bhub_phobert_moderation_model_v5
MAX_LENGTH=128
```

Restart AI service:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Kiểm tra lại:

```text
http://127.0.0.1:8001/health
```

Đảm bảo `model_dir` đang trỏ tới model mới.

---

## 13. Các lỗi thường gặp

### Lỗi thiếu thư viện

Nếu gặp lỗi kiểu:

```text
ModuleNotFoundError
```

Chạy lại:

```bash
pip install -r requirements.txt
```

---

### Lỗi không tìm thấy model

Nếu gặp lỗi khi load model, kiểm tra lại thư mục:

```text
ai-service/models/bhub_phobert_moderation_model_v4/
```

Bên trong phải có:

```text
config.json
model.safetensors hoặc pytorch_model.bin
tokenizer_config.json
vocab.txt
```

---

### Lỗi backend gọi AI bị ECONNREFUSED

Lỗi này nghĩa là AI service chưa chạy.

Cần chạy:

```bash
cd ai-service
.\.venv\Scripts\activate
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

---

### Lỗi port 8001 đã được dùng

Đổi port khác:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8002 --reload
```

Sau đó sửa backend:

```env
AI_MODERATION_URL=http://127.0.0.1:8002
```

---

## 14. Ghi chú Git

Không commit các file local/generated:

```gitignore
ai-service/.venv/
ai-service/**/__pycache__/
ai-service/**/*.pyc
ai-service/models/
*.zip
```

Chỉ nên commit:

```text
ai-service/app/main.py
ai-service/requirements.txt
ai-service/README.md
ai-service/.env.example
```

Model nên được lưu riêng bằng Google Drive, OneDrive, GitHub Release hoặc nơi lưu trữ riêng.

---

## 15. Tóm tắt chạy nhanh

```bash
cd ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload
```

Sau đó mở:

```text
http://127.0.0.1:8001/health
```
