import type { ButtonHTMLAttributes } from "react";

export function Button({ children, className = "", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`py-2 px-4 rounded ${className}`}>
      {children}
    </button>
  );
}
