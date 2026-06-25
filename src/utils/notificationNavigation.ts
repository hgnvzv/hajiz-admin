export interface AdminNotification {
  id: string
  title: string
  body: string
  type: string
  isRead: boolean
  sentAt?: string
  createdAt?: string
}

export function notificationType(row: Record<string, unknown> | AdminNotification) {
  return String(row.type ?? (row as Record<string, unknown>).notificationType ?? (row as Record<string, unknown>).targetType ?? '')
}

export function notificationTargetRoute(row: Record<string, unknown> | AdminNotification) {
  if (notificationType(row) === 'credits_topup_request') {
    return { path: '/credits/top-up-requests', query: { status: 'Pending' } }
  }
  return null
}
