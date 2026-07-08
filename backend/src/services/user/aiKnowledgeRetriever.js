import { AI_CONTEXT } from "../../constants/aiConstant.js";
import { AI_KNOWLEDGE_CHUNKS } from "./aiKnowledgeChunks.js";
import { normalizeText, tokenize } from "./aiTextUtils.js";

const DEFAULT_TOP_K = 3;
const MIN_SCORE = 1.5;

const chunkDocTokens = (chunk) => {
  const keywordText = (chunk.keywords || []).join(" ");
  return tokenize(`${chunk.title} ${chunk.content} ${keywordText}`);
};

const avgDocLength =
  AI_KNOWLEDGE_CHUNKS.reduce((sum, chunk) => sum + chunkDocTokens(chunk).length, 0) /
  Math.max(AI_KNOWLEDGE_CHUNKS.length, 1);

/** BM25-lite: k1=1.2, b=0.75 */
const bm25Score = (queryTokens, docTokens) => {
  if (!queryTokens.length || !docTokens.length) return 0;

  const docLen = docTokens.length;
  const tfMap = new Map();
  for (const token of docTokens) {
    tfMap.set(token, (tfMap.get(token) || 0) + 1);
  }

  const k1 = 1.2;
  const b = 0.75;
  let score = 0;

  for (const term of queryTokens) {
    const tf = tfMap.get(term) || 0;
    if (!tf) continue;

    const idf = Math.log(
      1 + (AI_KNOWLEDGE_CHUNKS.length - 1 + 0.5) / (1 + 0.5),
    );
    const numerator = tf * (k1 + 1);
    const denominator = tf + k1 * (1 - b + (b * docLen) / avgDocLength);
    score += idf * (numerator / denominator);
  }

  return score;
};

const keywordBoost = (chunk, queryNorm) => {
  let boost = 0;
  for (const keyword of chunk.keywords || []) {
    const kw = normalizeText(keyword);
    if (!kw) continue;
    if (queryNorm.includes(kw)) boost += 2.5;
    else if (kw.split(" ").some((part) => part.length >= 3 && queryNorm.includes(part))) {
      boost += 1;
    }
  }
  return boost;
};

/**
 * Truy xuất top-k chunk liên quan (RAG retrieval).
 * @returns {{ chunks: Array, scores: Array<{ id: string, score: number }> }}
 */
export const retrieveKnowledgeChunks = (
  query,
  { context = AI_CONTEXT.GENERAL, topK = DEFAULT_TOP_K } = {},
) => {
  const queryNorm = normalizeText(query);
  const queryTokens = tokenize(query);
  if (!queryNorm) {
    return { chunks: [], scores: [] };
  }

  const candidates = AI_KNOWLEDGE_CHUNKS.filter(
    (chunk) => !chunk.contexts?.length || chunk.contexts.includes(context),
  );

  const ranked = candidates
    .map((chunk) => {
      const docTokens = chunkDocTokens(chunk);
      const score =
        bm25Score(queryTokens, docTokens) +
        keywordBoost(chunk, queryNorm) +
        (chunk.contexts?.includes(context) ? 0.3 : 0);

      return { chunk, score };
    })
    .filter((item) => item.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return {
    chunks: ranked.map((item) => item.chunk),
    scores: ranked.map((item) => ({ id: item.chunk.id, score: Number(item.score.toFixed(3)) })),
  };
};

export const formatRetrievedKnowledge = (chunks) => {
  if (!chunks?.length) return "";
  return chunks
    .map((chunk, index) => `[${index + 1}] ${chunk.title}\n${chunk.content}`)
    .join("\n\n");
};

export default retrieveKnowledgeChunks;
