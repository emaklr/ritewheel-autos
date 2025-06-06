export function Button({ children, className, onClick }: any) {
  return <button onClick={onClick} className={`py-2 px-4 rounded ${className}`}>{children}</button>;
}