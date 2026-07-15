import { motion } from 'framer-motion'
import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

export function LoginPage() {
  const { login, user, loading } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  if (!loading && user) return <Navigate to="/banco" replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate('/banco')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-page">
      <AnimatedBackground />
      <motion.div
        className="auth-shell"
        initial={{ opacity: 0, scale: 0.98, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <aside className="auth-brand">
          <motion.div
            className="auth-float"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3.5, repeat: Infinity }}
          >
            Private Banking
          </motion.div>
          <h2 className="auth-brand__mark">
            Bank
            <span>Shop</span>
          </h2>
          <p className="auth-brand__line">
            Crédito digital e marketplace de luxo em uma única experiência.
          </p>
        </aside>

        <section className="auth-panel">
          <h1>Acesse sua conta</h1>
          <p className="auth-panel__sub">Entre com o e-mail cadastrado no Bank Shop.</p>

          <form className="auth-form" onSubmit={onSubmit} noValidate>
            {error ? (
              <div className="auth-alert" role="alert">
                {error}
              </div>
            ) : null}
            <Input
              label="E-mail"
              type="email"
              name="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Senha"
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="auth-actions">
              <Button type="submit" variant="gold" disabled={submitting}>
                {submitting ? 'Entrando…' : 'Entrar no banco'}
              </Button>
            </div>
          </form>

          <p className="auth-switch">
            Ainda não tem conta?{' '}
            <button
              type="button"
              className="auth-switch__link"
              data-testid="go-register"
              onClick={() => navigate('/registro')}
            >
              Criar registro
            </button>
          </p>
        </section>
      </motion.div>
    </div>
  )
}
