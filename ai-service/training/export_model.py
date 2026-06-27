"""Export a locally fine-tuned SentenceTransformer model.

The train script saves directly to models/image_search by default; this file
is kept as a clear hook if you later need ONNX/quantization export.
"""

import argparse
from pathlib import Path

from sentence_transformers import SentenceTransformer


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--model", type=Path, required=True)
    parser.add_argument("--output", type=Path, default=Path("models/image_search/exported"))
    args = parser.parse_args()

    model = SentenceTransformer(str(args.model))
    args.output.mkdir(parents=True, exist_ok=True)
    model.save(str(args.output))
    print(f"Exported model to {args.output}")


if __name__ == "__main__":
    main()
