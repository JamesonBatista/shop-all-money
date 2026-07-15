import { useId } from 'react'
import { formatCurrencyInput, parseCurrencyInput } from '../../utils/currency'
import './ui.css'

interface CurrencyInputProps {
  label: string
  value: string
  onChange: (formatted: string, numeric: number) => void
  error?: string
  placeholder?: string
}

export function CurrencyInput({
  label,
  value,
  onChange,
  error,
  placeholder = 'R$ 0,00',
}: CurrencyInputProps) {
  const id = useId()
  return (
    <label className="bs-field" htmlFor={id}>
      <span className="bs-field__label">{label}</span>
      <input
        id={id}
        className={`bs-field__input ${error ? 'is-error' : ''}`}
        inputMode="numeric"
        placeholder={placeholder}
        value={value}
        onChange={(e) => {
          const formatted = formatCurrencyInput(e.target.value)
          onChange(formatted, parseCurrencyInput(formatted))
        }}
      />
      {error ? <span className="bs-field__error">{error}</span> : null}
    </label>
  )
}
