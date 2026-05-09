export function apiMessage(err: unknown, fallback = 'حدث خطأ غير متوقع'): string {
  const e = err as {
    response?: { data?: { message?: string; error?: string } }
    message?: string
  }
  const d = e.response?.data
  return (typeof d?.message === 'string' && d.message) ||
    (typeof d?.error === 'string' && d.error) ||
    e.message ||
    fallback
}
