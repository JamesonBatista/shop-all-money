import { motion } from 'framer-motion'
import { useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Button } from '../../components/ui/Button'
import {
  clearAdminSession,
  getAnalyticsSnapshot,
  hasAdminSession,
  type AnalyticsEvent,
} from '../../firebase/analytics'
import { formatBRL } from '../../utils/currency'
import './Admin.css'

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

function eventLabel(event: AnalyticsEvent) {
  switch (event.type) {
    case 'visit':
      return 'Visita'
    case 'register':
      return `Cadastro${event.label ? ` · ${event.label}` : ''}`
    case 'login':
      return 'Login'
    case 'purchase':
      return `Compra${event.label ? ` · ${event.label}` : ''}`
    case 'transfer':
      return 'Transferência'
    case 'pix':
      return 'Pix'
    case 'invest':
      return `Investimento${event.label ? ` · ${event.label}` : ''}`
    default:
      return event.type
  }
}

export function AdminDashboard() {
  const navigate = useNavigate()
  const stats = useMemo(() => getAnalyticsSnapshot(), [])

  if (!hasAdminSession()) {
    return <Navigate to="/login" replace />
  }

  const cards = [
    { label: 'Visitas totais', value: String(stats.totalVisits) },
    { label: 'Visitantes únicos', value: String(stats.uniqueVisitors) },
    { label: 'Cadastros', value: String(stats.registrations) },
    { label: 'Usuários no sistema', value: String(stats.liveUsers) },
    { label: 'Compras', value: String(stats.purchases) },
    { label: 'Volume em compras', value: formatBRL(stats.purchaseVolume) },
    { label: 'Transferências', value: String(stats.transfers) },
    { label: 'Pix', value: String(stats.pixTransfers) },
    { label: 'Investimentos', value: String(stats.investments) },
    { label: 'Lançamentos no ledger', value: String(stats.liveLedgerCount) },
  ]

  return (
    <div className="admin-page">
      <div className="admin-wrap">
        <header className="admin-head">
          <div>
            <p className="admin-eyebrow">Bank Shop · Internal</p>
            <h1>Painel de impacto</h1>
            <p className="admin-sub">
              Acompanhe acessos, cadastros e atividade financeira da aplicação.
              {stats.lastVisitAt ? ` Última visita: ${formatWhen(stats.lastVisitAt)}.` : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              clearAdminSession()
              navigate('/login')
            }}
          >
            Sair do painel
          </Button>
        </header>

        <section className="admin-grid">
          {cards.map((card, index) => (
            <motion.article
              key={card.label}
              className="admin-card"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(index * 0.04, 0.35) }}
            >
              <span>{card.label}</span>
              <strong>{card.value}</strong>
            </motion.article>
          ))}
        </section>

        <section className="admin-events">
          <h2>Eventos recentes</h2>
          {stats.events.length === 0 ? (
            <p className="admin-empty">Nenhum evento registrado ainda.</p>
          ) : (
            <ul>
              {stats.events.slice(0, 40).map((event) => (
                <li key={event.id}>
                  <span className="admin-event-type">{eventLabel(event)}</span>
                  <span className="admin-event-time">{formatWhen(event.at)}</span>
                  {typeof event.meta?.total === 'number' ? (
                    <span className="admin-event-meta">{formatBRL(event.meta.total)}</span>
                  ) : typeof event.meta?.amount === 'number' ? (
                    <span className="admin-event-meta">{formatBRL(event.meta.amount)}</span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
