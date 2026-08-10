# Production Deployment Guide

## Docker

```bash
docker compose up -d
```

## Environment

Configure `.env` values:

- PORT
- DATABASE_URL
- REDIS_URL
- OPENAI_API_KEY
- DEEPSEEK_TOKEN

## Health Check

```bash
curl http://localhost:3000/health
```

## Production checklist

- Enable TLS
- Configure PostgreSQL backups
- Configure Redis persistence
- Monitor `/metrics`
