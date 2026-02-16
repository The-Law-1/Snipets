# Edge Functions Architecture

This project uses separate Supabase Edge Functions for each API route, providing better isolation, easier debugging, and cleaner organization.

## Structure

Each edge function is self-contained with its own `lib` folder containing shared utilities:

```
supabase/functions/
├── snippets/           # Snippet CRUD operations
│   ├── index.ts
│   └── lib/
│       ├── auth.ts
│       ├── env.ts
│       └── http.ts
├── articles/           # Article aggregation
│   ├── index.ts
│   └── lib/
├── auth/              # User profile creation
│   ├── index.ts
│   └── lib/
├── users/             # User search & follow
│   ├── index.ts
│   └── lib/
└── feed/              # Social feed
    ├── index.ts
    └── lib/
```

## API Endpoints

### Snippets Function
**Base URL:** `/functions/v1/snippets`

- `GET /` - List user's snippets (with optional `?title=` search)
- `POST /` - Create new snippet
- `DELETE /:id` - Delete snippet by ID

### Articles Function
**Base URL:** `/functions/v1/articles`

- `GET /` - Get articles grouped by title with snippet counts (with optional `?title=` search)

### Auth Function
**Base URL:** `/functions/v1/auth`

- `POST /profile` - Create user profile with username

### Users Function
**Base URL:** `/functions/v1/users`

- `GET /search?q=` - Search users by username
- `POST /follow?username=` - Follow a user by username

### Feed Function
**Base URL:** `/functions/v1/feed`

- `GET /` - Get snippets from followed users

## Authentication

All endpoints (except user search) require Bearer token authentication:

```
Authorization: Bearer <jwt_token>
```

The token is automatically validated using Supabase Auth, and RLS policies are enforced.

## CORS Configuration

CORS is configured per-function and can be customized via the `CORS_ALLOW_ORIGINS` environment variable:

```bash
# Allow all origins (default)
CORS_ALLOW_ORIGINS=*

# Allow specific origins
CORS_ALLOW_ORIGINS=https://example.com,https://app.example.com
```

## Shared Libraries

Each function has its own `lib/` folder with three core utilities:

### `lib/auth.ts`
- `getBearerToken(request)` - Extract JWT from Authorization header
- `createSupabaseClient(token?)` - Create authenticated Supabase client
- `requireUser(request)` - Validate token and return user + client

### `lib/http.ts`
- `getCorsHeaders(request)` - Generate CORS headers
- `jsonResponse(body, status, headers)` - Create JSON response
- `parseJson<T>(request)` - Parse and validate JSON body

### `lib/env.ts`
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key

## Development

### Local Testing
```bash
# Start Supabase locally
supabase start

# Serve all functions
supabase functions serve

# Test a specific function
curl http://localhost:54321/functions/v1/snippets \
  -H "Authorization: Bearer <token>"
```

### Deployment
```bash
# Deploy all functions
supabase functions deploy snippets
supabase functions deploy articles
supabase functions deploy auth
supabase functions deploy users
supabase functions deploy feed

# Or deploy individually
supabase functions deploy snippets
```

## Benefits of This Architecture

1. **Isolation** - Each function is independent, failures don't cascade
2. **Debugging** - Easier to trace issues to specific functions
3. **Performance** - Functions only load code they need
4. **Scaling** - Individual functions can scale independently
5. **Development** - Teams can work on different functions without conflicts
6. **Deployment** - Deploy and rollback individual functions
7. **Monitoring** - Separate logs and metrics per function

## Migration from Monolithic API

The previous architecture used a single `api` function with route handlers. This has been refactored into separate functions:

| Old Route | New Function |
|-----------|--------------|
| `/api/snippets` | `/snippets` |
| `/api/articles` | `/articles` |
| `/api/auth/profile` | `/auth/profile` |
| `/api/users/*` | `/users/*` |
| `/api/feed` | `/feed` |

Frontend applications need to update their API base URLs accordingly.
