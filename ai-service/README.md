# B-Hub AI Recommendation Service

Python microservice gợi ý **sản phẩm mua kèm / cá nhân hóa** (LightGBM + market-basket co-occurrence) và **rule-based insights** cho Admin.

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
| GET | `/health` | Health check + trạng thái model sản phẩm |
| POST | `/api/v1/recommend/admin` | Phân tích lấp đầy + khách cần voucher |
| GET | `/api/v1/product/status` | Trạng thái model gợi ý sản phẩm |
| POST | `/api/v1/product/train` | Huấn luyện gợi ý sản phẩm (LightGBM + co-occurrence) |
| POST | `/api/v1/recommend/product` | Gợi ý sản phẩm (cá nhân hóa / mua kèm) |

## Luồng gợi ý sản phẩm

- **Mua kèm (related)**: market-basket co-occurrence — sản phẩm thường mua chung trong một đơn.
- **Cá nhân hóa (user)**: LightGBM xếp hạng (userId, productId, categoryId); fallback theo danh mục đã mua + phổ biến.
- **User mới**: sản phẩm phổ biến.

## Luồng Admin (rule-based)

- Tỷ lệ lấp đầy theo chi nhánh / khung giờ
- Khung giờ thấp điểm → gợi ý tạo khuyến mãi
- Khách quay lại / cần voucher kích hoạt

Model lưu tại volume `ai_models` (Docker) hoặc thư mục `models/`.
