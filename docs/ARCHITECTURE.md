# Architecture

```
OpenAI SDK
    |
    v
API Gateway
    |
    +-- Auth
    +-- Rate Limit
    +-- Router
    +-- Provider Manager
    |
    +-- DeepSeek Provider
    +-- OpenAI Provider

Storage:
- PostgreSQL
- Redis

Observability:
- Metrics
- Logs
- Trace
```

The gateway exposes OpenAI compatible APIs while allowing multiple model providers behind a unified routing layer.
