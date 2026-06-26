import { Link } from "react-router-dom";

export type AiChatCard = {
  type: "product" | "court";
  id?: number;
  name?: string;
  price?: number | null;
  image?: string | null;
  url?: string;
  branchName?: string;
};

const AI_CARDS_PREFIX = "<<AI_CARDS>>";
const AI_CARDS_SUFFIX = "<<END_AI_CARDS>>";

export const parseAiMessageContent = (content: string) => {
  const start = content.indexOf(AI_CARDS_PREFIX);
  if (start === -1) {
    return { text: content, cards: [] as AiChatCard[] };
  }
  const end = content.indexOf(AI_CARDS_SUFFIX, start);
  if (end === -1) {
    return { text: content, cards: [] as AiChatCard[] };
  }
  const text = `${content.slice(0, start)}${content.slice(end + AI_CARDS_SUFFIX.length)}`.trim();
  try {
    const parsed = JSON.parse(
      content.slice(start + AI_CARDS_PREFIX.length, end),
    );
    return {
      text,
      cards: Array.isArray(parsed) ? (parsed as AiChatCard[]) : [],
    };
  } catch {
    return { text: content, cards: [] as AiChatCard[] };
  }
};

const formatPrice = (value?: number | null) =>
  value != null
    ? `${value.toLocaleString("vi-VN", { maximumFractionDigits: 0 })}₫`
    : "";

type AiChatCardsProps = {
  cards: AiChatCard[];
  onNavigate?: () => void;
};

export const AiChatCards = ({ cards, onNavigate }: AiChatCardsProps) => {
  if (!cards.length) return null;

  return (
    <div className="mt-3 grid gap-2 sm:grid-cols-2">
      {cards.map((card, index) => {
        const href =
          card.url ||
          (card.type === "product" && card.id
            ? `/product/${card.id}`
            : card.url || "#");
        const title =
          card.name ||
          (card.type === "court" ? "Sân" : `Sản phẩm #${card.id ?? index}`);

        return (
          <Link
            key={`${card.type}-${card.id ?? index}`}
            to={href}
            onClick={onNavigate}
            className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-2.5 transition hover:border-sky-300 hover:bg-sky-50"
          >
            {card.type === "product" && card.image ? (
              <img
                src={card.image}
                alt={title}
                className="h-14 w-14 shrink-0 rounded-lg object-cover bg-white"
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-xs font-semibold text-sky-700">
                {card.type === "court" ? "Sân" : "SP"}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-2 text-sm font-semibold text-slate-800">
                {title}
              </p>
              {card.branchName ? (
                <p className="text-xs text-slate-500">{card.branchName}</p>
              ) : null}
              {card.price != null ? (
                <p className="mt-1 text-sm font-bold text-sky-700">
                  {formatPrice(card.price)}
                </p>
              ) : null}
            </div>
          </Link>
        );
      })}
    </div>
  );
};
