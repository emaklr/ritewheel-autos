export function Card({ children, className }: any) {
  return <div className={`shadow-xl ${className}`}>{children}</div>;
}

export function CardContent({ children, className }: any) {
  return <div className={className}>{children}</div>;
}