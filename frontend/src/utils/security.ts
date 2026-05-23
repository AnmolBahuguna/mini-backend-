/**
 * Security utilities for input sanitization and XSS prevention
 */

type DomPurifyLike = {
  sanitize: (html: string, config?: Record<string, unknown>) => string
}

// Optional DOMPurify integration.
// Kept as `null` by default to avoid bundling/require() usage.
// If you want DOMPurify, add it as a dependency and wire it here via ESM import.
const DOMPurify: DomPurifyLike | null = null

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
  if (!html || typeof html !== 'string') return ''
  
  if (DOMPurify) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br'],
      ALLOWED_ATTR: ['href', 'title', 'target'],
      ALLOW_DATA_ATTR: false
    })
  }
  
  // Fallback sanitization
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, '')
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
    .replace(/<[^>]*>/g, (match) => {
      // Allow only safe tags
      const allowedTags = ['b', 'i', 'em', 'strong', 'p', 'br']
      const tagName = match.replace(/[<>]/g, '').split(' ')[0].toLowerCase()
      return allowedTags.includes(tagName) ? match : ''
    })
}

/**
 * Sanitize text input to prevent injection attacks
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return ''
  
  return text
    .trim()
    .slice(0, 1000) // Limit length
    .replace(/[<>]/g, '') // Remove HTML brackets
    .replace(/javascript:/gi, '') // Remove javascript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .replace(/data:/gi, '') // Remove data protocol
    .replace(/vbscript:/gi, '') // Remove vbscript protocol
    .replace(/file:/gi, '') // Remove file protocol
    .replace(/ftp:/gi, '') // Remove ftp protocol
}

/**
 * Validate and sanitize URLs
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') return ''
  
  const sanitized = sanitizeText(url)
  
  // Allow only safe protocols
  const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
  try {
    const parsedUrl = new URL(sanitized)
    if (!allowedProtocols.includes(parsedUrl.protocol)) {
      return ''
    }
    return sanitized
  } catch {
    // Invalid URL, return empty
    return ''
  }
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email.trim())
}

/**
 * Validate phone number (Indian format)
 */
export function validatePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false
  
  const cleaned = phone.replace(/[\s-]/g, '')
  const phoneRegex = /^(\+91|0)?[6-9]\d{9}$/
  return phoneRegex.test(cleaned)
}

/**
 * Validate UPI ID format
 */
export function validateUpiId(upi: string): boolean {
  if (!upi || typeof upi !== 'string') return false
  
  const upiRegex = /^[\w.+%-]+@[\w-]+$/
  return upiRegex.test(upi.trim())
}

/**
 * Create a safe redirect URL
 */
export function createSafeRedirectUrl(url: string, fallback: string = '/'): string {
  try {
    const sanitizedUrl = sanitizeUrl(url)
    if (!sanitizedUrl) return fallback
    
    const parsedUrl = new URL(sanitizedUrl, window.location.origin)
    
    // Only allow same-origin redirects
    if (parsedUrl.origin !== window.location.origin) {
      return fallback
    }
    
    return sanitizedUrl
  } catch {
    return fallback
  }
}

/**
 * Generate a secure random string
 */
export function generateSecureRandom(length: number = 32): string {
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }
  
  // Fallback for older browsers
  return Math.random().toString(36).substring(2, 2 + length)
}

/**
 * Rate limiting utility
 */
export class RateLimiter {
  private requests: number[] = []
  private maxRequests: number
  private windowMs: number
  
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
  }
  
  isAllowed(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter(time => now - time < this.windowMs)
    
    if (this.requests.length >= this.maxRequests) {
      return false
    }
    
    this.requests.push(now)
    return true
  }
  
  reset(): void {
    this.requests = []
  }
}

/**
 * Content Security Policy helper
 */
export const cspDirectives = {
  'default-src': ["'self'"],
  'script-src': ["'self'", "'unsafe-inline'"], // Remove unsafe-inline in production
  'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
  'font-src': ["'self'", 'https://fonts.gstatic.com'],
  'img-src': ["'self'", 'data:', 'https:'],
  'connect-src': ["'self'", 'https://api.supabase.co'],
  'frame-ancestors': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
}
