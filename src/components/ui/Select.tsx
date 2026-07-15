import type { SelectHTMLAttributes } from 'react'
import './ui.css'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  options: { value: string; label: string }[]
  placeholder?: string
}

export function Select({
  label,
  error,
  options,
  placeholder,
  id,
  className = '',
  ...props
}: SelectProps) {
  const selectId = id || props.name || label
  return (
    <label className={`bs-field ${className}`.trim()} htmlFor={selectId}>
      <span className="bs-field__label">{label}</span>
      <select id={selectId} className={`bs-field__input ${error ? 'is-error' : ''}`} {...props}>
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? <span className="bs-field__error">{error}</span> : null}
    </label>
  )
}
