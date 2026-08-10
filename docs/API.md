# API Compatibility

## Chat Completion

POST `/v1/chat/completions`

Example:

```json
{
  "model":"deepseek-chat",
  "messages":[
    {
      "role":"user",
      "content":"hello"
    }
  ]
}
```

## Models

GET `/v1/models`

Compatible with OpenAI SDK model listing.

## Streaming

Set:

```json
{
  "stream":true
}
```

The response uses Server Sent Events compatible with OpenAI streaming format.
