# Badminton Image Search Service

Microservice này tìm sản phẩm bằng ảnh và câu hỏi tự nhiên, ví dụ: upload ảnh vợt cầu lông và nhập `tìm sản phẩm tương tự nhưng màu trắng`.

## Cách chạy

```bash
cd image-search-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8010
```

Build index sau khi có dữ liệu:

```bash
python scripts/build_index.py
```

Gọi API:

```bash
curl -X POST http://localhost:8010/search ^
  -F "image=@D:\path\to\racket.jpg" ^
  -F "query=tìm sản phẩm tương tự nhưng màu trắng" ^
  -F "limit=12"
```

## Format dữ liệu

File `data/processed/products.csv` cần ít nhất 3 cột:

```csv
product_id,name,image_url
```

Các cột nên có thêm để search tốt hơn:

```csv
brand,category,color,description,product_url,price
```

`image_url` có thể là URL public hoặc đường dẫn local. Khi build index, service sẽ tải ảnh, encode vector và lưu:

- `data/index/product_vectors.faiss`
- `data/index/product_metadata.json`

## Phương pháp hoạt động

CLIP đưa ảnh và text về cùng một không gian vector. Ảnh vợt được encode thành vector ảnh; câu tiếng Việt như `tìm sản phẩm tương tự nhưng màu trắng` được encode thành vector text bằng `sentence-transformers/clip-ViT-B-32-multilingual-v1`. Vector query là trung bình có trọng số giữa ảnh và text.

Index sản phẩm được build từ ảnh sản phẩm cộng với metadata text như tên, hãng, danh mục, màu, mô tả. Vì vector đã normalize L2, FAISS `IndexFlatIP` tương đương cosine similarity. Kết quả đầu tiên là các sản phẩm gần nhất trong không gian ngữ nghĩa.

Riêng điều kiện màu được xử lý thêm bằng parser rule-based. Query có `màu trắng` sẽ được chuẩn hóa thành `white`. Sau khi FAISS trả candidate, reranker cộng điểm nếu metadata sản phẩm có màu trắng và trừ nhẹ nếu màu khác. Cách này ổn hơn việc kỳ vọng CLIP tự hiểu chính xác mọi ràng buộc màu trong câu dài.

## Vì sao tách image model và text model?

Model `sentence-transformers/clip-ViT-B-32-multilingual-v1` mạnh ở multilingual text và được align với CLIP. Với ảnh, service mặc định dùng `sentence-transformers/clip-ViT-B-32`. Hai vector cùng kích thước và cùng không gian CLIP nên có thể so sánh trực tiếp. Nếu bạn có model fine-tuned riêng, đổi `TEXT_MODEL_NAME` hoặc `IMAGE_MODEL_NAME` trong `.env`.

## Tìm tài liệu và dữ liệu training

Nguồn dữ liệu tốt nhất là chính catalog của bạn: ảnh sản phẩm, tên sản phẩm, category, brand, variant color, description, và hành vi click/mua nếu có. Tạo caption tiếng Việt theo mẫu:

```text
vợt cầu lông Yonex Astrox 88D Pro màu trắng xanh, dòng vợt tấn công, thân cứng
```

Nên có cả positive và hard negative:

- Positive: ảnh sản phẩm A khớp caption/metadata của A.
- Hard negative: cùng loại nhưng khác màu, cùng màu nhưng khác loại, cùng hãng nhưng khác dòng.
- Query thực tế: `tìm vợt giống hình nhưng màu trắng`, `áo cầu lông xanh giống mẫu này`, `túi đựng vợt màu đen`.

Tài liệu nên tìm bằng các từ khóa:

- `CLIP contrastive learning image text retrieval`
- `sentence-transformers CLIP multilingual`
- `MultipleNegativesRankingLoss sentence-transformers`
- `FAISS cosine similarity normalized embeddings`
- `image text retrieval recall@k evaluation`

## Fine-tuning

Giai đoạn đầu không cần train, chỉ cần zero-shot + rerank màu. Fine-tune khi bạn đã có dữ liệu đủ sạch, thường từ vài nghìn cặp ảnh-caption trở lên.

Quy trình đề xuất:

1. Export catalog thành `products.csv`.
2. Chạy `python training/build_dataset.py` để tạo `image_captions.csv`.
3. Đánh giá baseline bằng `python training/evaluate_retrieval.py --top-k 5`.
4. Fine-tune text tower với `python training/train_clip.py`.
5. Đổi `TEXT_MODEL_NAME` sang model trong `artifacts/models/...`.
6. Build lại index và đo lại Recall@K.

Lưu ý: file `train_clip.py` hiện là baseline tối giản để bạn có khung nghiên cứu. Fine-tune chuẩn hơn nên dùng cặp image-caption thật và loss contrastive giữa ảnh và text; nếu dữ liệu ít hoặc nhiễu, zero-shot thường ổn định hơn.
