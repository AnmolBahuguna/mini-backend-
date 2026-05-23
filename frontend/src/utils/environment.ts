/**
 * Environment validation and security configuration
 */

// Required environment variables
const REQUIRED_ENV_VARS = [
  'VITE_API_BASE_URL'
] as const

// Optional environment variables with defaults
const OPTIONAL_ENV_VARS = {
  'VITE_SUPABASE_URL': '',
  'VITE_SUPABASE_ANON_KEY': '',
  'VITE_ENVIRONMENT': 'development',
  'VITE_LOG_LEVEL': 'info'
} as const

interface EnvValidationResult {
  isValid: boolean
  missing: string[]
  warnings: string[]
  config: Record<string, string>
}

/**
 * Validate environment variables
 */
export function validateEnvironment(): EnvValidationResult {
  const missing: string[] = []
  const warnings: string[] = []
  const config: Record<string, string> = {}

  // Check required variables
  for (const envVar of REQUIRED_ENV_VARS) {
    const value = import.meta.env[envVar]
    if (!value) {
      missing.push(envVar)
    } else {
      config[envVar] = value
    }
  }

  // Check optional variables
  for (const [envVar, defaultValue] of Object.entries(OPTIONAL_ENV_VARS)) {
    const value = import.meta.env[envVar] || defaultValue
    config[envVar] = value

    // Add warnings for missing optional vars that should be present in production
    if (!import.meta.env[envVar] && import.meta.env.PROD) {
      if (envVar === 'VITE_SUPABASE_URL' || envVar === 'VITE_SUPABASE_ANON_KEY') {
        warnings.push(`${envVar} is recommended in production`)
      }
    }
  }

  // Validate API URL format
  if (config.VITE_API_BASE_URL) {
    try {
      new URL(config.VITE_API_BASE_URL)
    } catch {
      warnings.push('VITE_API_BASE_URL is not a valid URL')
    }
  }

  // Validate Supabase URL format
  if (config.VITE_SUPABASE_URL) {
    try {
      const url = new URL(config.VITE_SUPABASE_URL)
      if (!['https:', 'http:'].includes(url.protocol)) {
        warnings.push('VITE_SUPABASE_URL should use HTTPS in production')
      }
    } catch {
      warnings.push('VITE_SUPABASE_URL is not a valid URL')
    }
  }

  return {
    isValid: missing.length === 0,
    missing,
    warnings,
    config
  }
}

/**
 * Get security configuration based on environment
 */
export function getSecurityConfig() {
  const isDev = import.meta.env.DEV
  const isTest = import.meta.env.MODE === 'test'
  const isProd = import.meta.env.PROD

  return {
    // Enable/disable features based on environment
    enableConsoleLogging: isDev || isTest,
    enableErrorReporting: isProd,
    enableAnalytics: isProd,
    enableDebugTools: isDev,
    
    // Security headers (for reference - actual headers set by server)
    securityHeaders: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
      ...(isProd && {
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
      })
    },
    
    // Rate limiting
    rateLimiting: {
      apiRequests: isDev ? 1000 : 100,
      loginAttempts: isDev ? 50 : 5,
      reportSubmissions: isDev ? 100 : 10
    },
    
    // Session configuration
    session: {
      timeout: isDev ? 24 * 60 * 60 * 1000 : 30 * 60 * 1000, // 24h dev, 30min prod
      refreshThreshold: 5 * 60 * 1000 // 5 minutes before expiry
    }
  }
}

/**
 * Check if the application is running securely
 */
export function checkSecurityRequirements(): { secure: boolean; issues: string[] } {
  const issues: string[] = []
  
  // Check HTTPS in production
  if (import.meta.env.PROD && typeof window !== 'undefined') {
    if (window.location.protocol !== 'https:') {
      issues.push('Application should be served over HTTPS in production')
    }
  }
  
  // Check for console warnings in production
  if (import.meta.env.PROD && import.meta.env.DEV) {
    issues.push('Development mode should not be enabled in production')
  }
  
  // Check environment variables
  const envValidation = validateEnvironment()
  if (!envValidation.isValid) {
    issues.push(`Missing required environment variables: ${envValidation.missing.join(', ')}`)
  }
  
  return {
    secure: issues.length === 0,
    issues
  }
}

/**
 * Initialize security measures
 */
export function initializeSecurity() {
  // Validate environment
  const envValidation = validateEnvironment()
  if (!envValidation.isValid) {
    console.error('❌ Environment validation failed:', envValidation.missing)
  }
  
  if (envValidation.warnings.length > 0) {
    console.warn('⚠️ Environment warnings:', envValidation.warnings)
  }
  
  // Check security requirements
  const securityCheck = checkSecurityRequirements()
  if (!securityCheck.secure) {
    console.error('🔒 Security issues detected:', securityCheck.issues)
  }
  
  // Log security configuration in development
  if (import.meta.env.DEV) {
    const securityConfig = getSecurityConfig()
    // Keep dev-only security diagnostics silent in production builds.
    void securityConfig
  }
  
  return {
    envValidation,
    securityCheck,
    secure: securityCheck.secure && envValidation.isValid
  }
}
