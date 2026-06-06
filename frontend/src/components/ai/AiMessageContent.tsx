import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

type Segment =
  | { type: "text"; value: string }
  | { type: "bold"; value: string }
  | { type: "link"; label: string; href: string };

const INLINE_PATTERN =
  /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(https?:\/\/[^\s)]+)/g;

const normalizeHref = (
  href: string,
): { kind: "internal" | "external"; path: string } => {
  const trimmed = href.trim();
  if (trimmed.startsWith("/")) {
    return { kind: "internal", path: trimmed };
  }
  try {
    const url = new URL(trimmed);
    const host = url.hostname.toLowerCase();
    if (
      host === "b-hub.vn" ||
      host.endsWith(".b-hub.vn") ||
      host === "localhost" ||
      host === "127.0.0.1"
    ) {
      return {
        kind: "internal",
        path: url.pathname + url.search + url.hash,
      };
    }
    return { kind: "external", path: trimmed };
  } catch {
    return { kind: "internal", path: trimmed.startsWith("/") ? trimmed : `/${trimmed}` };
  }
};

const parseInlineSegments = (line: string): Segment[] => {
  const segments: Segment[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  INLINE_PATTERN.lastIndex = 0;
  while ((match = INLINE_PATTERN.exec(line)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: "text", value: line.slice(lastIndex, match.index) });
    }
    if (match[1] && match[2]) {
      segments.push({ type: "link", label: match[1], href: match[2] });
    } else if (match[3]) {
      segments.push({ type: "bold", value: match[3] });
    } else if (match[4]) {
      const { kind, path } = normalizeHref(match[4]);
      if (kind === "internal") {
        segments.push({ type: "link", label: "Xem tại đây", href: path });
      } else {
        segments.push({ type: "link", label: match[4], href: path });
      }
    }
    lastIndex = INLINE_PATTERN.lastIndex;
  }

  if (lastIndex < line.length) {
    segments.push({ type: "text", value: line.slice(lastIndex) });
  }

  return segments.length > 0 ? segments : [{ type: "text", value: line }];
};

const ChatLink = ({
  href,
  children,
  onNavigate,
}: {
  href: string;
  children: ReactNode;
  onNavigate?: () => void;
}) => {
  const { kind, path } = normalizeHref(href);
  const className =
    "font-medium text-sky-600 underline underline-offset-2 hover:text-sky-700";

  if (kind === "internal") {
    return (
      <Link to={path} className={className} onClick={onNavigate}>
        {children}
      </Link>
    );
  }

  return (
    <a
      href={path}
      className={className}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
};

const renderInline = (line: string, onNavigate?: () => void) =>
  parseInlineSegments(line).map((seg, i) => {
    if (seg.type === "bold") {
      return (
        <strong key={i} className="font-semibold text-gray-900">
          {seg.value}
        </strong>
      );
    }
    if (seg.type === "link") {
      return (
        <ChatLink key={i} href={seg.href} onNavigate={onNavigate}>
          {seg.label}
        </ChatLink>
      );
    }
    return <Fragment key={i}>{seg.value}</Fragment>;
  });

type AiMessageContentProps = {
  content: string;
  isUser?: boolean;
  onNavigate?: () => void;
};

const AiMessageContent = ({
  content,
  isUser,
  onNavigate,
}: AiMessageContentProps) => {
  if (isUser) {
    return <>{content}</>;
  }

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, index) => {
        const trimmed = line.trim();
        if (!trimmed) {
          return <div key={index} className="h-1" />;
        }

        const bulletMatch = trimmed.match(/^[-•*]\s+(.+)/);
        if (bulletMatch) {
          return (
            <div key={index} className="flex gap-2 pl-0.5">
              <span className="mt-0.5 shrink-0 text-sky-500">•</span>
              <span className="min-w-0 flex-1">
                {renderInline(bulletMatch[1], onNavigate)}
              </span>
            </div>
          );
        }

        return (
          <p key={index} className="m-0">
            {renderInline(trimmed, onNavigate)}
          </p>
        );
      })}
    </div>
  );
};

export default AiMessageContent;
