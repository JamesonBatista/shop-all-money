import { fireEvent, screen } from '@testing-library/react'

/** Sets currency input by raw digit string (centavos), bypassing per-keystroke formatting. */
export function setCurrencyDigits(label: RegExp | string, digits: string) {
  const input = screen.getByLabelText(label)
  fireEvent.change(input, { target: { value: digits } })
  return input
}

export function expectMoneyText(value: number) {
  const formatted = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)

  const normalize = (s: string) => s.replace(/\u00a0/g, ' ').replace(/\s/g, ' ').trim()
  const target = normalize(formatted)

  const matches = screen.getAllByText((_, node) => {
    if (!node || !(node instanceof HTMLElement)) return false
    if (node.children.length > 0) return false
    return normalize(node.textContent || '') === target
  })
  expect(matches.length).toBeGreaterThan(0)
  return matches[0]
}
