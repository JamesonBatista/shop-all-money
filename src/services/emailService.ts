import type { CartItem, StoreTheme } from '../types'
import { formatBRL } from '../utils/currency'

export function buildPurchaseEmailHtml(params: {
  customerName: string
  storeName: string
  items: CartItem[]
  total: number
  theme: StoreTheme
}): string {
  const { customerName, storeName, items, total, theme } = params
  const rows = items
    .map(
      (item) => `
      <tr>
        <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);">
          <img src="${item.image}" alt="${item.name}" width="64" height="64"
            style="border-radius:10px;object-fit:cover;vertical-align:middle;margin-right:14px;" />
          <span style="font-size:15px;font-weight:500;">${item.name}</span>
          <div style="opacity:0.7;font-size:13px;margin-top:4px;">Qtd ${item.quantity}</div>
        </td>
        <td style="padding:14px 0;border-bottom:1px solid rgba(255,255,255,0.08);text-align:right;white-space:nowrap;">
          ${formatBRL(item.price * item.quantity)}
        </td>
      </tr>`,
    )
    .join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8" /><title>Compra confirmada — ${storeName}</title></head>
<body style="margin:0;padding:0;background:${theme.background};font-family:Georgia,'Times New Roman',serif;color:${theme.text};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${theme.background};padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:${theme.surface};border-radius:20px;overflow:hidden;box-shadow:0 20px 60px rgba(0,0,0,0.35);">
        <tr>
          <td style="background:linear-gradient(135deg, ${theme.primary}, ${theme.secondary});padding:36px 32px;text-align:center;">
            <div style="font-size:12px;letter-spacing:0.28em;text-transform:uppercase;opacity:0.85;">Bank Shop × ${storeName}</div>
            <h1 style="margin:12px 0 0;font-size:32px;font-weight:600;color:${theme.accent};">Compra confirmada</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 8px;font-size:16px;">Olá, <strong>${customerName}</strong>.</p>
            <p style="margin:0 0 28px;opacity:0.8;line-height:1.55;">
              Sua compra na <strong>${storeName}</strong> foi processada com sucesso.
              O valor já foi abatido do seu crédito Bank Shop.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0">${rows}</table>
            <div style="margin-top:28px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.12);display:flex;justify-content:space-between;">
              <span style="letter-spacing:0.12em;text-transform:uppercase;font-size:12px;opacity:0.7;">Total</span>
              <strong style="font-size:22px;color:${theme.accent};">${formatBRL(total)}</strong>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 32px;text-align:center;font-size:12px;opacity:0.55;">
            Bank Shop — crédito digital & marketplace de luxo
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

/**
 * Sends purchase confirmation via FormSubmit (client-side friendly).
 * Falls back to opening a mailto if the network request fails.
 */
export async function sendPurchaseEmail(params: {
  to: string
  customerName: string
  storeName: string
  items: CartItem[]
  total: number
  theme: StoreTheme
}): Promise<'sent' | 'queued' | 'failed'> {
  const html = buildPurchaseEmailHtml(params)
  const subject = `Compra confirmada — ${params.storeName} | Bank Shop`

  try {
    const response = await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(params.to)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        _subject: subject,
        _template: 'table',
        name: params.customerName,
        message: `Compra na ${params.storeName} no valor de ${formatBRL(params.total)}.`,
        html,
        _captcha: 'false',
      }),
    })

    if (response.ok) return 'sent'
  } catch {
    // fall through
  }

  try {
    const body = encodeURIComponent(
      `Olá ${params.customerName},\n\nSua compra na ${params.storeName} (${formatBRL(params.total)}) foi confirmada.\n\nBank Shop`,
    )
    window.open(`mailto:${params.to}?subject=${encodeURIComponent(subject)}&body=${body}`, '_blank')
    return 'queued'
  } catch {
    return 'failed'
  }
}
