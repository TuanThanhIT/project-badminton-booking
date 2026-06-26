"""Fine-tune the multilingual text tower with image-caption pairs.

For a graduation project, start with zero-shot CLIP. Fine-tune only after you
have verified that your own product captions improve retrieval quality.
"""

import argparse
from pathlib import Path

import pandas as pd
from sentence_transformers import InputExample, SentenceTransformer, losses
from torch.utils.data import DataLoader


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--dataset", type=Path, default=Path("data/processed/image_captions.csv"))
    parser.add_argument("--base-model", default="sentence-transformers/clip-ViT-B-32-multilingual-v1")
    parser.add_argument("--output", type=Path, default=Path("artifacts/models/clip-multilingual-badminton"))
    parser.add_argument("--epochs", type=int, default=1)
    parser.add_argument("--batch-size", type=int, default=16)
    args = parser.parse_args()

    rows = pd.read_csv(args.dataset).fillna("")
    examples = [
        InputExample(texts=[row["caption"], row["caption"]])
        for row in rows.to_dict(orient="records")
        if row.get("caption")
    ]
    model = SentenceTransformer(args.base_model)
    loader = DataLoader(examples, shuffle=True, batch_size=args.batch_size)
    train_loss = losses.MultipleNegativesRankingLoss(model)

    args.output.parent.mkdir(parents=True, exist_ok=True)
    model.fit(train_objectives=[(loader, train_loss)], epochs=args.epochs, output_path=str(args.output))
    print(f"Saved fine-tuned text model to {args.output}")


if __name__ == "__main__":
    main()
