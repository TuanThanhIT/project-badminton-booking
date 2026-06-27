from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.ml.image_search.services.index_service import IndexService


def main() -> None:
    result = IndexService().build_from_csv()
    print(result)


if __name__ == "__main__":
    main()
