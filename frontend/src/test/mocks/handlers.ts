import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('http://localhost:8000/api/dashboard/', async () => {
    return HttpResponse.json({
      total_reports: 3600,
      accuracy_rate: 97.5,
      total_contributors: 52000,
      threats_prevented: 1890,
    })
  }),

  http.post('http://localhost:8000/api/threat-check/', async () => {
    return HttpResponse.json({
      id: 'threat-1',
      entity: 'example.com',
      entity_type: 'url',
      drs_score: 9.1,
      risk_level: 'HIGH',
      scam_type: 'VERIFIED',
      reports_count: 3,
      geo_tags: ['Delhi'],
      api_results: {
        virustotal: '12/70',
        safeBrowsing: 'Flagged as phishing',
      },
      cached: false,
    })
  }),

  http.get('http://localhost:8000/api/threat-check/:id/enrichment/', async () => {
    return HttpResponse.json({
      ready: true,
      ai_summary: 'Potential phishing intent detected. Exercise caution.',
    })
  }),

  http.get('http://localhost:8000/api/alerts/', async () => {
    return HttpResponse.json({
      results: [
        {
          id: 'alert-1',
          title: 'UPI phishing campaign',
          region: 'Delhi',
          severity: 'HIGH',
          time: '10 mins ago',
          description: 'Mass refund phishing links reported.',
          affectedCount: 230,
        },
      ],
    })
  }),

  http.get('http://localhost:8000/api/reports/', async () => {
    return HttpResponse.json({
      results: [
        {
          id: 'r1',
          title: 'Fake UPI Cashback Link',
        },
      ],
      next: null,
    })
  }),

  http.post('http://localhost:8000/api/reports/', async () => {
    return HttpResponse.json({
      id: 'RPT-2026-001',
      message: 'Report submitted',
    })
  }),

  http.post('http://localhost:8000/api/chatbot/', async () => {
    return HttpResponse.json({
      response: 'You are not at fault. Preserve evidence and contact 1930.',
    })
  }),

  http.post('http://localhost:8000/api/panic/', async () => {
    return HttpResponse.json({ ok: true })
  }),

  http.post('http://localhost:8000/api/evidence/', async () => {
    return HttpResponse.json({ id: 'ev-1', tx_hash: '0xabc' })
  }),

  http.get('http://localhost:8000/api/evidence/', async () => {
    return HttpResponse.json({
      results: [
        {
          id: 'ev-1',
          file_name: 'chat.png.enc',
          hash: 'abcd1234',
          tx_hash: '0xabc',
        },
      ],
    })
  }),

  http.delete('http://localhost:8000/api/evidence/:id/', async () => {
    return HttpResponse.json({ ok: true })
  }),

  http.get('http://localhost:8000/api/profile/', async () => {
    return HttpResponse.json({
      name: 'Test User',
      state: 'Delhi',
    })
  }),
]
