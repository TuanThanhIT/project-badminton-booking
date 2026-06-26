"""Tiny retrieval evaluator for product image/text pairs.

This measures whether each caption retrieves its own product near the top.
Use it before and after fine-tuning to prove the model improved.
"""

import argparse
from pathlib import Path
import sys

import pandas as pd

sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.modules.embedding.clip_encoder import get_clip_encoder
from app.modules.retrieval.faiss_store import FaissStore
from app.modules.retrieval.metadata_store import MetadataStore


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--captions", type=Path, default=Path("data/processed/image_captions.csv"))
    parser.add_argument("--top-k", type=int, default=5)
    args = parser.parse_args()

    rows = pd.read_csv(args.captions).fillna("")
    encoder = get_clip_encoder()
    store = FaissStore.load(Path("data/index/product_vectors.faiss"))
    metadata = MetadataStore.load(Path("data/index/product_metadata.json"))

    hits = 0
    total = 0
    for row in rows.to_dict(orient="records"):
        vector = encoder.encode_text(row["caption"])[0]
        results = store.search(vector, args.top_k)
        product_ids = {metadata.get(index)["product_id"] for index, _score in results}
        hits += str(row["product_id"]) in product_ids
        total += 1

    print({"top_k": args.top_k, "recall": hits / max(total, 1), "total": total})


if __name__ == "__main__":
    main()
