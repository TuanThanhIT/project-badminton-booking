"""Build a fine-tuning CSV from product metadata.

Output columns:
- image_url: local path or public URL
- caption: Vietnamese product caption
- product_id: product identifier
"""

import argparse
from pathlib import Path

import pandas as pd


def build_caption(row: dict) -> str:
    parts = [
        row.get("name"),
        row.get("brand"),
        row.get("category"),
        f"màu {row.get('color')}" if row.get("color") else None,
        row.get("description"),
    ]
    return " ".join(str(part) for part in parts if part)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--products", type=Path, default=Path("data/processed/products.csv"))
    parser.add_argument("--output", type=Path, default=Path("data/processed/image_captions.csv"))
    args = parser.parse_args()

    products = pd.read_csv(args.products).fillna("")
    rows = [
        {
            "image_url": row["image_url"],
            "caption": build_caption(row),
            "product_id": row["product_id"],
        }
        for row in products.to_dict(orient="records")
    ]
    args.output.parent.mkdir(parents=True, exist_ok=True)
    pd.DataFrame(rows).to_csv(args.output, index=False)
    print(f"Wrote {len(rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
