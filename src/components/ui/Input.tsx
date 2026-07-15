import type { InputHTMLAttributes } from 'react'
import './ui.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
}

export function Input({ label, error, id, className = '', ...props }: InputProps) {
  const inputId = id || props.name || label
  return (
    <label className={`bs-field ${className}`.trim()} htmlFor={inputId}>
      <span className="bs-field__label">{label}</span>
      <input id={inputId} className={`bs-field__input ${error ? 'is-error' : ''}`} {...props} />
      {error ? <span className="bs-field__error">{error}</span> : null}
    </label>
  )
}
