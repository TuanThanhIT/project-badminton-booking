from pathlib import Path
import sys

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.services.index_service import IndexService


def main() -> None:
    print(IndexService().build_from_csv())


if __name__ == "__main__":
    main()

