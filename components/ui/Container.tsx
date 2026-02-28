import type { ReactNode } from "react";

/**
 * Container — コンテンツの最大幅+左右パディングを統一するラッパー。
 */
export default function Container({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "section" | "main";
}) {
  return (
    <Tag className={`mx-auto w-full max-w-4xl px-4 sm:px-6 ${className}`}>
      {children}
    </Tag>
  );
}
