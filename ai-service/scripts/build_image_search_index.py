from pathlib import Path
import sys
import argparse

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.image_search.services.index_service import IndexService


def main() -> None:
    parser = argparse.ArgumentParser(description="Build FAISS indexes for product search.")
    parser.add_argument(
        "--include-images",
        action="store_true",
        help="Download product images and build image_index.faiss in addition to text_index.faiss.",
    )
    parser.add_argument("--csv-path", type=Path, default=None)
    args = parser.parse_args()

    result = IndexService().build_from_csv(args.csv_path, include_images=args.include_images)
    print(result)


if __name__ == "__main__":
    main()
