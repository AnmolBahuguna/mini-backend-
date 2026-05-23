# Security Policy

## Reporting Security Issues

If you discover a security vulnerability, please email security@example.com instead of using the issue tracker. Please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if available)

## Supported Versions

| Version | Status | Support |
|---------|--------|---------|
| 1.0.x   | Active | Full Support |
| 0.9.x   | EOL    | No Support |

## Security Best Practices

### Authentication
- Passwords are hashed using bcrypt
- JWT tokens expire after 24 hours
- Refresh tokens are used for renewed access

### API Security
- All endpoints require authentication
- Rate limiting prevents abuse
- Input validation on all endpoints

### Data Protection
- Sensitive data is encrypted at rest
- HTTPS is enforced in production
- Database credentials are environment-based

### Dependencies
- Regular security audits with `npm audit` and `pip audit`
- Automated updates for critical vulnerabilities
- Dependencies kept up-to-date

## Vulnerability Disclosure

- We aim to respond to security reports within 48 hours
- We'll work with you to verify and patch vulnerabilities
- Credit will be given to responsible reporters

## Security Updates

Security updates are released as soon as feasible and are marked as critical.
