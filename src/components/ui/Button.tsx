import type { ButtonHTMLAttributes, ReactNode } from 'react'
import './ui.css'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'gold'
  children: ReactNode
}

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button className={`bs-btn bs-btn--${variant} ${className}`.trim()} {...props}>
      <span className="bs-btn__label">{children}</span>
    </button>
  )
}
