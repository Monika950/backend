# Backend (NestJS) — Treasure Hunt App

A NestJS backend for a treasure hunt application featuring authentication, user management, hunts, locations, user progress, answers, real-time tracking via Socket.IO, and user notifications via REST + WebSockets.

## Tech Stack

- Node.js + TypeScript
- NestJS
- TypeORM (PostgreSQL)
- Socket.IO (Gateway)
- JWT authentication
- ESLint + Prettier

## Architecture Overview

Modules:

- Auth: Registration, login, logout, refresh, change/reset password, JWT guard
- User: Users CRUD and profile
- Treasure Hunt: Create/update/delete, join via 6-digit code, owners/participants management
- Location: Locations for hunts with order_index, question, correctAnswer
- User Progress: Start, update position, complete location, abandon, retrieve progress
- User Answer: Submit answers per location (basic scaffolding)
- Tracking: Socket.IO gateway under /tracking (join/leave/update_position)
- Notifications:
  - Entity: notification (id, userId, huntId?, type, payload JSONB, readAt, createdAt)
  - Service: create/list/mark-read/mark-read-batch; emits `notifications:new` to user rooms
  - Controller: REST for listing and marking read
  - Gateway: /notifications namespace; JWT handshake; users join `user:{id}` rooms

Key hooks wired:

- On joinByCode -> Notification HUNT_JOINED
- On start progress -> Notification HUNT_STARTED
- On complete (when hunt finishes) -> Notification HUNT_COMPLETED
- On abandon -> Notification HUNT_ABANDONED

## Requirements

- Node.js 18+ (recommended)
- PostgreSQL 13+ (Docker compose provided)
- Environment variables in `.env`

## Environment Variables (.env example)

```
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=treasure_hunt
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres

# Logging & schema sync (sync true is only for local dev)
DATABASE_LOGGING=false
DATABASE_SYNCHRONIZE=false

# JWT secret for auth + WS handshake
JWT_SECRET=supersecretjwt
```

Notes:

- For local development only, you can set `DATABASE_SYNCHRONIZE=true` to let TypeORM auto-create tables. In staging/production, use migrations.

## Install

```
npm install
```

## Database (Docker)

Start PostgreSQL via docker-compose:

```
npm run postgre:up
```

Reset database (remove container + volumes, recreate, run migrations):

```
npm run postgre:reset
```

Bring all compose services up (if you add more in docker-compose.yaml):

```
npm run compose:up
```

## Migrations

DataSource: `src/database/data-source.ts` (migrations at `src/database/migration`).

Generate a migration by diff (will fail with “No changes” if synchronize already created tables):

```
npm run typeorm -- -d src/database/data-source.ts migration:generate src/database/migration/SomeName
```

Create an empty migration (manual content):

```
npm run typeorm migration:create src/database/migration/SomeName
```

Run migrations:

```
npm run typeorm -- -d src/database/data-source.ts migration:run
```

Show migrations:

```
npm run typeorm -- -d src/database/data-source.ts migration:show
```

Revert last migration:

```
npm run typeorm -- -d src/database/data-source.ts migration:revert
```

Notifications migration:

- `1767715240095-NotificationsInit.ts` creates indexes and handles already-existing `notification` table gracefully (idempotent).

## Development

Watch mode:

```
npm run start:dev
```

Build:

```
npm run build
```

Production mode (after build):

```
npm run start:prod
```

Formatting and lint:

```
npm run format
npm run lint
```

Tip: If you see “Delete ␍” warnings (CRLF line endings), configure your editor to use LF and rerun `npm run lint`.

## Seeding

Seed the database (adjust seed content as needed):

```
npm run seed
```

## API Overview

Base URL: `http://localhost:3000`

- Auth
  - POST /auth/register
  - POST /auth/login
  - POST /auth/logout
  - POST /auth/refresh
  - GET /auth/me
  - PATCH /auth/change-password
  - POST /auth/forgot-password
  - POST /auth/reset-password

- Users
  - GET /users
  - GET /users/me
  - GET /users/:id
  - POST /users
  - PATCH /users/:id
  - DELETE /users/:id

- Treasure Hunt
  - POST /treasure-hunt
  - GET /treasure-hunt
  - GET /treasure-hunt/:id
  - PATCH /treasure-hunt/:id
  - DELETE /treasure-hunt/:id
  - POST /treasure-hunt/join (join by code)
  - POST /treasure-hunt/:id/owners/:userId (add owner)
  - GET /treasure-hunt/:id/participants
  - PATCH /treasure-hunt/:id/participants/:userId (change role)

- Location
  - POST /location
  - GET /location/hunt/:treasureHuntId
  - GET /location/:id
  - PATCH /location/:id
  - DELETE /location/:id

- User Progress
  - POST /user-progress/start
  - PATCH /user-progress/update-position
  - PATCH /user-progress/complete-location
  - PATCH /user-progress/abandon
  - GET /user-progress/:huntId

- User Answer (basic)
  - POST /user-answer
  - GET /user-answer/hunt/:huntId

- Notifications
  - GET /notifications
    - Query: read=true|false, page, limit
  - PATCH /notifications/:id/read
  - PATCH /notifications/read-batch
    - Body: { ids: string[] }

- Uploads (S3 pre-signed)
  - POST /uploads/presign
    - Body: { kind: "location"|"hunt", filename, contentType, size }
  - POST /uploads/presign-download
    - Body: { key }

Authorization:

- All protected endpoints require `Authorization: Bearer <JWT>`.

## Realtime (WebSockets)

Authentication:

- Pass JWT via Socket.IO `auth.token`, or via `Authorization: Bearer <JWT>` header in the handshake.
- Unauthenticated clients are disconnected.

Namespaces:

- `/tracking`
- `/notifications`

Events (tracking namespace):

- Client -> Server: `tracking:join`
  - Payload: `{ huntId: string }`
- Client -> Server: `tracking:leave`
  - Payload: `{ huntId: string }`
- Client -> Server: `tracking:update_position`
  - Payload: `{ huntId: string, lat: number, lng: number, ts?: string }`
  - Note: server rate-limits to 1 update/sec per user.
- Server -> Clients in `hunt:{huntId}` room: `tracking:participant_joined`
  - Payload: `{ userId: string }`
- Server -> Clients in `hunt:{huntId}` room: `tracking:participant_left`
  - Payload: `{ userId: string }`
- Server -> Clients in `hunt:{huntId}` room: `tracking:position_updated`
  - Payload: `{ userId: string, lat: number, lng: number, ts: string, currentLocationId: string | null }`

Events (notifications namespace):

- Server -> Client in `user:{userId}` room: `notifications:new`
  - Payload: `{ id: string, type: string, payload: object | null, huntId: string | null, readAt: string | null, createdAt: string }`
- Server -> Client in `user:{userId}` room: `notifications:read`
  - Payload: `{ id: string, readAt: string }`
- Server -> Client in `user:{userId}` room: `notifications:read_batch`
  - Payload: `{ ids: string[], readAt: string }`

Client example (socket.io-client):

```ts
import { io } from 'socket.io-client';

const token = '<JWT>';
const notifications = io('http://localhost:3000/notifications', {
  auth: { token },
});

notifications.on('notifications:new', (n) => {
  console.log('New notification:', n);
});
notifications.on('notifications:read', (n) => {
  console.log('Read notification:', n);
});
notifications.on('notifications:read_batch', (n) => {
  console.log('Read batch:', n);
});
```

## WebSockets

### Tracking — namespace `/tracking`

- Handshake: pass JWT via `auth.token` or `Authorization: Bearer <JWT>` header
- Rooms: per-hunt rooms
- Events:
  - `tracking:join` — join a hunt room
  - `tracking:leave` — leave a hunt room
  - `tracking:update_position` — push lat/lng; server broadcasts

Client example (socket.io-client):

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/tracking', {
  auth: { token: '<JWT>' },
});
socket.emit('tracking:join', { huntId: '<uuid>' });
socket.emit('tracking:update_position', {
  huntId: '<uuid>',
  lat: 42.7,
  lng: 23.3,
});
socket.on('tracking:position', (payload) => {
  console.log('Position update:', payload);
});
```

### Notifications — namespace `/notifications`

- Handshake: pass JWT via `auth.token` or `Authorization: Bearer <JWT>` header
- Server joins client to `user:{id}` room on connect
- Event: `notifications:new` — emitted on actions: join/start/complete/abandon

Client example:

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000/notifications', {
  auth: { token: '<JWT>' },
});
socket.on('notifications:new', (n) => {
  console.log('New notification:', n);
});
```

## Project Scripts

From `package.json`:

- build: `nest build`
- format: `prettier --write "src/**/*.ts" "test/**/*.ts"`
- start: `ts-node src/index.ts`
- start:dev: `nest start --watch`
- start:prod: `node dist/main`
- lint: `eslint "{src,apps,libs,test}/**/*.ts" --fix`
- test, test:watch, test:cov, test:e2e
- typeorm: `typeorm-ts-node-commonjs` (use `-d src/database/data-source.ts`)
- migration:create, migration:generate (cross-platform)
- migration:run/show/revert
- postgre:up/rm/reset
- compose:up
- ssl:generate (dev script in secrets)
- seed

## Troubleshooting

- DI errors like “NotificationsService at index [N] is not available”:
  - Ensure the module providing that service exports it and the consumer module imports the provider module.
  - Example: `TreasureHuntModule` exports `TreasureHuntService`; `LocationModule` imports `TreasureHuntModule` and does not provide `TreasureHuntService` itself.

- CRLF line endings warnings (Windows):
  - Configure editor to use LF line endings and rerun `npm run lint`.

- Migrations say “No changes found”:
  - If `DATABASE_SYNCHRONIZE=true`, TypeORM may have already created tables. Use `migration:create` to add an explicit migration.

## License

UNLICENSED (private project). Adjust as needed.
