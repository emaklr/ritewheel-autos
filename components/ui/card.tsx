import type { HTMLAttributes, PropsWithChildren } from "react";

type CardProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Card({ children, className = "", ...props }: CardProps) {
  return <div {...props} className={`shadow-xl ${className}`}>{children}</div>;
}

export function CardContent({ children, className = "", ...props }: CardProps) {
  return <div {...props} className={className}>{children}</div>;
}
