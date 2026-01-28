# Rate Limiting Configuration

This document describes the rate limiting implementation for the WayFind authentication system.

## Overview

Rate limiting has been implemented to protect against brute force attacks and API abuse. Different endpoints have different rate limits based on their sensitivity.

## Rate Limiting Policies

### 1. Authentication Endpoints (`authLimiter`)
**Endpoints:** `/auth/login`, `/auth/refresh`, `/adventurers` (signup)
- **Limit:** 5 requests per 15 minutes per IP
- **Purpose:** Prevent brute force login attacks
- **Response:** HTTP 429 with retry information

### 2. General API (`generalLimiter`)
**Endpoints:** All other API endpoints
- **Limit:** 100 requests per 15 minutes per IP
- **Purpose:** Prevent API abuse while allowing normal usage
- **Response:** HTTP 429 with retry information

### 3. Strict Operations (`strictLimiter`)
**Endpoints:** Reserved for future sensitive operations
- **Limit:** 3 requests per hour per IP
- **Purpose:** Maximum protection for critical operations

## Configuration

Rate limits can be configured via environment variables:

```bash
# Authentication rate limiting
AUTH_RATE_LIMIT_WINDOW_MS=900000    # 15 minutes in milliseconds
AUTH_RATE_LIMIT_MAX=5               # Max requests per window

# General API rate limiting
GENERAL_RATE_LIMIT_WINDOW_MS=900000 # 15 minutes in milliseconds
GENERAL_RATE_LIMIT_MAX=100          # Max requests per window

# Strict rate limiting
STRICT_RATE_LIMIT_WINDOW_MS=3600000 # 1 hour in milliseconds
STRICT_RATE_LIMIT_MAX=3             # Max requests per window
```

## Response Format

When rate limits are exceeded, the API returns:

```json
{
  "error": "Too many authentication attempts from this IP",
  "message": "Please wait 15 minutes before trying again",
  "retryAfter": "15 minutes",
  "timestamp": "2026-01-26T01:30:00.000Z",
  "type": "RATE_LIMIT_AUTH"
}
```

## Headers

Rate limiting information is included in response headers:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining in current window
- `RateLimit-Reset`: Time when the rate limit window resets

## Security Features

### 1. IP-based Tracking
- Rate limits are tracked per IP address
- Prevents distributed attacks from single IP

### 2. Detailed Logging
- All rate limit violations are logged with:
  - Client IP address
  - Endpoint accessed
  - User-Agent string
  - Timestamp

### 3. Graduated Response
- Different limits for different endpoint types
- More restrictive limits for authentication endpoints
- Allows normal API usage while preventing abuse

## Testing

Use the provided test script to verify rate limiting:

```bash
node rate-limit-test.js
```

This will test:
1. Authentication endpoint rate limiting
2. General API rate limiting
3. User creation rate limiting

## Production Considerations

### 1. Reverse Proxy Integration
Consider implementing additional rate limiting at the reverse proxy level (nginx, CloudFlare) for enhanced protection.

### 2. Database Rate Limiting
For additional protection, consider storing rate limit data in Redis for distributed deployments.

### 3. Monitoring
Monitor rate limiting logs to identify:
- Potential attacks
- Legitimate users hitting limits
- Need to adjust limits

### 4. Whitelist Support
Consider implementing IP whitelist for known safe sources (monitoring systems, etc.).

## Example Implementation

```javascript
// Custom rate limiter for specific needs
const customLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // 10 requests per minute
  message: 'Custom rate limit exceeded',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply to specific route
app.use('/api/sensitive-endpoint', customLimiter, sensitiveHandler);
```

## Troubleshooting

### Users Reporting "Too Many Requests"
1. Check if limits are too restrictive
2. Verify user is not making excessive requests
3. Consider implementing user-specific rate limiting

### Rate Limiting Not Working
1. Verify middleware order (rate limiters should be early in chain)
2. Check if proxy is forwarding real IP addresses
3. Ensure express-rate-limit is properly installed

### Performance Issues
1. Consider using Redis store for rate limiting data
2. Monitor memory usage with in-memory rate limiting
3. Adjust window sizes and limits as needed