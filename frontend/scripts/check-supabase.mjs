// Quick Supabase connectivity check. Loads VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// from process env or .env.local/.env in the frontend directory.
import fs from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

function loadEnvFile(filename) {
  const full = path.resolve(process.cwd(), filename)
  if (!fs.existsSync(full)) return {}
  const env = {}
  const lines = fs.readFileSync(full, 'utf8').split(/\r?\n/)
  for (const line of lines) {
    if (!line || line.trim().startsWith('#')) continue
    const match = line.match(/^([A-Za-z0-9_]+)\s*=\s*(.*)$/)
    if (match) {
      env[match[1]] = match[2]
    }
  }
  return env
}

const fileEnv = {
  ...loadEnvFile('.env.local'),
  ...loadEnvFile('.env'),
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || fileEnv.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || fileEnv.VITE_SUPABASE_ANON_KEY
const table = process.env.SUPABASE_CHECK_TABLE || 'alerts'

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Set env vars or create .env.local.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)
console.log(`Checking Supabase connectivity at ${supabaseUrl} (table: ${table})...`)

try {
  const { data, error } = await supabase.from(table).select('id', { count: 'estimated' }).limit(1)
  if (error) {
    console.error('Supabase query failed:', error.message)
    process.exit(1)
  }
  const rows = Array.isArray(data) ? data.length : 0
  console.log(`Success: reachable and RLS allowed. Returned ${rows} row(s).`)
  process.exit(0)
} catch (err) {
  console.error('Unexpected error while checking Supabase:', err)
  process.exit(1)
}
