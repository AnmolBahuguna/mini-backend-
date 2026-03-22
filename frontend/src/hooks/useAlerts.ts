import { useMemo, useState } from 'react'
import type { AlertRecord } from '../types/threat'

const mockAlerts: AlertRecord[] = [
  { id: '1', title: 'UPI phishing campaign', region: 'Delhi', severity: 'HIGH', time: '10 mins ago', description: 'Mass refund phishing links reported.', affectedCount: 230 },
  { id: '2', title: 'Fake job offer scam', region: 'Uttar Pradesh', severity: 'MEDIUM', time: '30 mins ago', description: 'Advance-fee recruitment fraud trend.', affectedCount: 170 },
  { id: '3', title: 'Deepfake blackmail cluster', region: 'Maharashtra', severity: 'CRITICAL', time: '55 mins ago', description: 'Targeted extortion via manipulated media.', affectedCount: 90 },
]

export function useAlerts() {
  const [severity, setSeverity] = useState('All')

  const alerts = useMemo(
    () => mockAlerts.filter((alert) => (severity === 'All' ? true : alert.severity === severity)),
    [severity],
  )

  return {
    alerts,
    severity,
    setSeverity,
  }
}
