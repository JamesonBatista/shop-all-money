import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

interface BackButtonProps {
  to?: string
  label?: string
}

export function BackButton({ to, label = 'Voltar' }: BackButtonProps) {
  const navigate = useNavigate()
  return (
    <Button
      type="button"
      variant="ghost"
      className="bs-back"
      onClick={() => (to ? navigate(to) : navigate(-1))}
    >
      ← {label}
    </Button>
  )
}
