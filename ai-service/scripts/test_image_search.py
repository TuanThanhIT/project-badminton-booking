import argparse
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from PIL import Image

from app.ml.image_search.services.search_service import SearchService


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--image", type=Path, default=None)
    parser.add_argument("--query", default="tìm sản phẩm tương tự nhưng màu trắng")
    parser.add_argument("--limit", type=int, default=5)
    args = parser.parse_args()

    image = Image.open(args.image).convert("RGB") if args.image else None
    result = SearchService().search(image=image, query=args.query, limit=args.limit)
    for item in result["results"]:
        print(f'{item["score"]:.4f} | {item["product_id"]} | {item["name"]} | {item.get("color", "")}')


if __name__ == "__main__":
    main()
