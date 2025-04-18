# Chat App with Auth, Excel Import & Task Filter

## Features
- User registration & login (JWT Auth)
- Import chat history via Excel (.xlsx)
- Task filter by status (completed/pending)
- Written in TypeScript
- Uses MySQL

## Getting Started



 Run the App

npm run dev
```

### 4. API Endpoints

- `POST /api/register`
- `POST /api/login`
- `POST /api/import-chat` (upload Excel with `sender` and `message`)
- `GET /api/tasks?status=pending|completed`