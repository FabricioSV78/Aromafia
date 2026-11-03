import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'tertiary';
}

/** Actions only. Navigation must use an anchor with a real href. */
export function Button({
  children,
  variant = 'primary',
  type = 'button',
  className = '',
  ...props
}: ButtonProps) {
  return (
    <button {...props} type={type} className={`button button--${variant} ${className}`.trim()}>
      {children}
    </button>
  );
}
