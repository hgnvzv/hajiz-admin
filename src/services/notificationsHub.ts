import * as signalR from '@microsoft/signalr'
import { NOTIFICATIONS_HUB_URL } from '@/api'
import type { AdminNotification } from '@/utils/notificationNavigation'

type NotificationHandler = (payload: AdminNotification) => void

let connection: signalR.HubConnection | null = null
let handler: NotificationHandler | null = null

function getToken() {
  return localStorage.getItem('admin_token') || localStorage.getItem('hajiz_admin_token') || ''
}

export async function connectNotificationsHub(onNotification: NotificationHandler) {
  const token = getToken()
  if (!token) return

  handler = onNotification
  if (connection?.state === signalR.HubConnectionState.Connected) return

  if (connection) {
    await disconnectNotificationsHub()
  }

  connection = new signalR.HubConnectionBuilder()
    .withUrl(NOTIFICATIONS_HUB_URL, {
      accessTokenFactory: () => getToken(),
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000])
    .configureLogging(signalR.LogLevel.Warning)
    .build()

  connection.on('notification', (payload: AdminNotification) => {
    handler?.(payload)
  })

  try {
    await connection.start()
  } catch {
    /* REST polling remains fallback */
  }
}

export async function disconnectNotificationsHub() {
  handler = null
  if (!connection) return
  try {
    await connection.stop()
  } catch {
    /* ignore */
  }
  connection = null
}

export function isNotificationsHubConnected() {
  return connection?.state === signalR.HubConnectionState.Connected
}
