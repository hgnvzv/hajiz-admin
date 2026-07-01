const ERROR_CODE_MESSAGES: Record<string, string> = {
  CUSTOMER_WALLET_DISABLED: 'محفظة الزبون معطّلة',
  WALLET_PAUSED: 'رصيد المزوّد منتهٍ',
}

export function apiMessage(err: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  const e = err as {
    response?: { data?: { message?: string; error?: string; errorCode?: string } }
    message?: string
  }
  const d = e.response?.data
  const code = String(d?.errorCode ?? '')
  if (code === 'VALIDATION_FAILED' && typeof d?.message === 'string' && d.message) {
    return d.message
  }
  if (code && ERROR_CODE_MESSAGES[code]) return ERROR_CODE_MESSAGES[code]
  return (typeof d?.message === 'string' && d.message) ||
    (typeof d?.error === 'string' && d.error) ||
    e.message ||
    fallback
}
