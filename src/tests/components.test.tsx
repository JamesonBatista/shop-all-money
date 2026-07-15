import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import { BackButton } from '../components/ui/BackButton'
import { Button } from '../components/ui/Button'
import { CurrencyInput } from '../components/ui/CurrencyInput'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'

describe('componentes UI', () => {
  it('Button dispara onClick', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>Ok</Button>)
    await user.click(screen.getByRole('button', { name: /ok/i }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('Input atualiza valor', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [value, setValue] = useState('')
      return (
        <Input label="Nome" name="nome" value={value} onChange={(e) => setValue(e.target.value)} />
      )
    }
    render(<Harness />)
    await user.type(screen.getByLabelText(/nome/i), 'Bank')
    expect(screen.getByLabelText(/nome/i)).toHaveValue('Bank')
  })

  it('Select lista operadoras', async () => {
    const user = userEvent.setup()
    function Harness() {
      const [value, setValue] = useState('')
      return (
        <Select
          label="Cartão"
          name="card"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Escolha"
          options={[
            { value: 'Visa', label: 'Visa' },
            { value: 'Elo', label: 'Elo' },
          ]}
        />
      )
    }
    render(<Harness />)
    await user.selectOptions(screen.getByLabelText(/cartão/i), 'Elo')
    expect(screen.getByLabelText(/cartão/i)).toHaveValue('Elo')
  })

  it('CurrencyInput formata em BRL', () => {
    function Harness() {
      const [display, setDisplay] = useState('')
      const [numeric, setNumeric] = useState(0)
      return (
        <>
          <CurrencyInput
            label="Crédito"
            value={display}
            onChange={(formatted, value) => {
              setDisplay(formatted)
              setNumeric(value)
            }}
          />
          <output data-testid="numeric">{numeric}</output>
        </>
      )
    }
    render(<Harness />)
    const input = screen.getByLabelText(/crédito/i)
    fireEvent.change(input, { target: { value: '12345' } })
    expect(screen.getByTestId('numeric')).toHaveTextContent('123.45')
    expect((input as HTMLInputElement).value).toMatch(/123,45/)
  })

  it('BackButton navega', async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter initialEntries={['/loja']}>
        <BackButton to="/banco" label="Voltar ao banco" />
      </MemoryRouter>,
    )
    expect(screen.getByRole('button', { name: /voltar ao banco/i })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /voltar ao banco/i }))
  })
})
