import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useParams } from "react-router-dom";
import type { AiChatContextType } from "../types/ai";

export type AiPageHints = {
  branchId?: number;
  courtId?: number;
  productId?: number;
  suggestedContext?: AiChatContextType;
};

type AIChatContextValue = {
  isOpen: boolean;
  openChat: () => void;
  closeChat: () => void;
  toggleChat: () => void;
  pageHints: AiPageHints;
  activeContext: AiChatContextType;
  setActiveContext: (ctx: AiChatContextType) => void;
};

const AIChatContext = createContext<AIChatContextValue | null>(null);

const inferContextFromPath = (pathname: string): AiChatContextType => {
  if (
    pathname.includes("/branches") ||
    pathname.includes("/bookings") ||
    pathname.includes("/courts") ||
    pathname.includes("/checkout/booking")
  ) {
    return "booking";
  }
  if (
    pathname.includes("/product") ||
    pathname.includes("/products") ||
    pathname.includes("/cart") ||
    pathname.includes("/checkout")
  ) {
    return "shopping";
  }
  if (
    pathname.includes("/posts") ||
    pathname.includes("/become-coach") ||
    pathname.includes("/my-classes") ||
    pathname.includes("/coach/")
  ) {
    return "coach";
  }
  return "general";
};

export const AIChatProvider = ({ children }: { children: ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeContext, setActiveContext] =
    useState<AiChatContextType>("general");
  const location = useLocation();
  const params = useParams();

  const pageHints = useMemo((): AiPageHints => {
    const hints: AiPageHints = {
      suggestedContext: inferContextFromPath(location.pathname),
    };

    const branchId = params.branchId ? Number(params.branchId) : undefined;
    const productId = params.id
      ? Number(params.id)
      : params.productId
        ? Number(params.productId)
        : undefined;

    if (branchId && !Number.isNaN(branchId)) hints.branchId = branchId;
    if (productId && !Number.isNaN(productId) && location.pathname.includes("/product")) {
      hints.productId = productId;
    }

    return hints;
  }, [location.pathname, params.branchId, params.id, params.productId]);

  useEffect(() => {
    if (pageHints.suggestedContext) {
      setActiveContext(pageHints.suggestedContext);
    }
  }, [pageHints.suggestedContext, location.pathname]);

  const openChat = useCallback(() => setIsOpen(true), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const toggleChat = useCallback(() => setIsOpen((v) => !v), []);

  const value = useMemo(
    () => ({
      isOpen,
      openChat,
      closeChat,
      toggleChat,
      pageHints,
      activeContext,
      setActiveContext,
    }),
    [isOpen, openChat, closeChat, toggleChat, pageHints, activeContext],
  );

  return (
    <AIChatContext.Provider value={value}>{children}</AIChatContext.Provider>
  );
};

export const useAIChat = () => {
  const ctx = useContext(AIChatContext);
  if (!ctx) {
    throw new Error("useAIChat must be used within AIChatProvider");
  }
  return ctx;
};

export default AIChatContext;
