import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AnimatedBackground } from '../../components/layout/AnimatedBackground'
import { Button } from '../../components/ui/Button'
import { CurrencyInput } from '../../components/ui/CurrencyInput'
import { Modal } from '../../components/ui/Modal'
import { useAuth } from '../../context/AuthContext'
import { formatBRL } from '../../utils/currency'
import './Bank.css'
import { CardsPanel } from './panels/CardsPanel'
import { InvestPanel } from './panels/InvestPanel'
import { PixPanel } from './panels/PixPanel'
import { StatementPanel } from './panels/StatementPanel'
import { TransferPanel } from './panels/TransferPanel'

type PanelId = 'pix' | 'transfer' | 'cards' | 'invest' | 'extract' | null

const QUICK_ACTIONS = [
  { id: 'pix', icon: '⬡', title: 'Área Pix', desc: 'Chaves e transferências', enabled: true },
  { id: 'transfer', icon: '⇄', title: 'Transferir', desc: 'Entre contas Bank Shop', enabled: true },
  { id: 'pay', icon: '▣', title: 'Pagar', desc: 'Em breve', enabled: false },
  { id: 'cards', icon: '▭', title: 'Cartões', desc: 'Histórico de compras', enabled: true },
  { id: 'invest', icon: '◈', title: 'Investir', desc: '0,5% ao dia', enabled: true },
  { id: 'loan', icon: '◆', title: 'Empréstimos', desc: 'Em breve', enabled: false },
  { id: 'extract', icon: '☰', title: 'Extrato', desc: 'Movimentações', enabled: true },
  { id: 'help', icon: '?', title: 'Atendimento', desc: 'Em breve', enabled: false },
] as const

const PANEL_TITLES: Record<Exclude<PanelId, null>, string> = {
  pix: 'Área Pix',
  transfer: 'Transferir',
  cards: 'Cartões',
  invest: 'Investir',
  extract: 'Extrato',
}

export function BankDashboard() {
  const { user, logout, deposit, lastYieldCredit, clearYieldNotice } = useAuth()
  const navigate = useNavigate()
  const [depositOpen, setDepositOpen] = useState(false)
  const [depositDisplay, setDepositDisplay] = useState('')
  const [depositValue, setDepositValue] = useState(0)
  const [depositError, setDepositError] = useState('')
  const [toast, setToast] = useState('')
  const [busy, setBusy] = useState(false)
  const [panel, setPanel] = useState<PanelId>(null)

  useEffect(() => {
    if (lastYieldCredit > 0) {
      setToast(`Rendimento creditado: ${formatBRL(lastYieldCredit)}`)
      const t = window.setTimeout(() => {
        clearYieldNotice()
        setToast('')
      }, 4000)
      return () => window.clearTimeout(t)
    }
  }, [lastYieldCredit, clearYieldNotice])

  if (!user) return null

  function showToast(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(''), 2600)
  }

  async function handleDeposit() {
    setDepositError('')
    setBusy(true)
    try {
      await deposit(depositValue)
      setDepositOpen(false)
      setDepositDisplay('')
      setDepositValue(0)
      showToast('Depósito realizado com sucesso.')
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : 'Falha no depósito.')
    } finally {
      setBusy(false)
    }
  }

  function openPanel(id: PanelId) {
    setPanel(id)
  }

  return (
    <div className="bank-page">
      <AnimatedBackground />

      <header className="bank-top">
        <div className="bank-brand">
          Bank<span>Shop</span>
        </div>
        <div className="bank-top__actions">
          <Button variant="ghost" onClick={logout}>
            Sair
          </Button>
        </div>
      </header>

      <div className="bank-grid">
        <motion.section
          className="bank-hero-balance"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <div className="bank-hero-balance__label">Saldo disponível</div>
          <motion.h1
            className="bank-hero-balance__value"
            key={user.balance}
            initial={{ opacity: 0.4, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {formatBRL(user.balance)}
          </motion.h1>
          <p className="bank-hero-balance__meta">
            Olá, {user.fullName.split(' ')[0]} — cartão {user.cardOperator}
          </p>
          <div className="bank-hero-balance__cta">
            <Button variant="gold" onClick={() => setDepositOpen(true)}>
              Depositar dinheiro
            </Button>
            <Button variant="primary" onClick={() => navigate('/loja')}>
              Ir para a Loja
            </Button>
          </div>
        </motion.section>

        <motion.aside
          className="bank-panel"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.08 }}
        >
          <h2>Dados da conta</h2>
          <div className="bank-info-list">
            <div className="bank-info-row">
              <span>Titular</span>
              <span>{user.fullName}</span>
            </div>
            <div className="bank-info-row">
              <span>Agência</span>
              <span>{user.agency}</span>
            </div>
            <div className="bank-info-row">
              <span>Conta</span>
              <span data-testid="account-number">{user.accountNumber}</span>
            </div>
            <div className="bank-info-row">
              <span>E-mail</span>
              <span>{user.email}</span>
            </div>
            <div className="bank-info-row">
              <span>Operadora</span>
              <span>{user.cardOperator}</span>
            </div>
          </div>
        </motion.aside>
      </div>

      <section className="bank-actions">
        {QUICK_ACTIONS.map((action, index) => (
          <motion.button
            key={action.id}
            type="button"
            className={`bank-action ${action.enabled ? '' : 'is-disabled'}`.trim()}
            disabled={!action.enabled}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index }}
            onClick={() => {
              if (!action.enabled) return
              openPanel(action.id as PanelId)
            }}
          >
            <div className="bank-action__icon">{action.icon}</div>
            <strong>{action.title}</strong>
            <p>{action.desc}</p>
          </motion.button>
        ))}
      </section>

      <Modal open={depositOpen} title="Depositar" onClose={() => setDepositOpen(false)}>
        <div className="deposit-form">
          <CurrencyInput
            label="Valor do depósito"
            value={depositDisplay}
            onChange={(formatted, numeric) => {
              setDepositDisplay(formatted)
              setDepositValue(numeric)
              setDepositError('')
            }}
            error={depositError}
          />
          <p style={{ margin: 0, color: 'var(--bs-muted)', fontSize: '0.9rem' }}>
            Saldo atual: {formatBRL(user.balance)}
          </p>
          <Button variant="gold" onClick={handleDeposit} disabled={busy || depositValue <= 0}>
            {busy ? 'Depositando…' : 'Confirmar depósito'}
          </Button>
        </div>
      </Modal>

      <Modal
        open={panel !== null}
        title={panel ? PANEL_TITLES[panel] : ''}
        onClose={() => setPanel(null)}
        size="lg"
      >
        <div className="bank-modal-body">
          {panel === 'pix' ? <PixPanel onDone={() => undefined} /> : null}
          {panel === 'transfer' ? <TransferPanel onDone={() => undefined} /> : null}
          {panel === 'cards' ? <CardsPanel /> : null}
          {panel === 'invest' ? <InvestPanel onDone={() => undefined} /> : null}
          {panel === 'extract' ? <StatementPanel /> : null}
        </div>
      </Modal>

      {toast ? (
        <motion.div
          className="bank-toast"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {toast}
        </motion.div>
      ) : null}
    </div>
  )
}
