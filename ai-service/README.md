# B-Hub AI Recommendation Service

Python microservice dùng **LightGBMClassifier** để gợi ý đặt sân và **rule-based insights** cho Admin.

## Kiến trúc

```
Backend (Node.js)  →  AI Service (FastAPI + LightGBM)  →  JSON
Backend (Node.js)  →  OpenAI (gpt-4o-mini)             →  câu trả lời tự nhiên (optional)
```

## Chạy local

```bash
cd ai-service
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend cần `AI_SERVICE_URL=http://localhost:8000`.

## API

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/health` | Health check + trạng thái model |
| POST | `/api/v1/train` | Huấn luyện LightGBM từ booking records |
| POST | `/api/v1/recommend/user` | Gợi ý chi nhánh / khung giờ |
| POST | `/api/v1/recommend/admin` | Phân tích lấp đầy + khách cần voucher |

## Luồng User

- **Có lịch sử đặt**: LightGBM xếp hạng (branchId, hour, dayOfWeek) hoặc heuristic nếu chưa train.
- **User mới**: Sân phổ biến + khung giờ cao điểm + mã giảm giá đang active.

## Luồng Admin (rule-based)

- Tỷ lệ lấp đầy theo chi nhánh / khung giờ
- Khung giờ thấp điểm → gợi ý tạo khuyến mãi
- Khách quay lại / cần voucher kích hoạt

Model lưu tại volume `ai_models` (Docker) hoặc thư mục `models/`.
