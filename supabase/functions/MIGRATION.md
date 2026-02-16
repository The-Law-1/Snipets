# Migration Guide: Monolithic API → Separate Edge Functions

This guide explains how to migrate from the old monolithic `api` function to the new separated edge functions architecture.

## What Changed?

### Before (Monolithic)
```
/functions/v1/api/snippets        → GET, POST, DELETE
/functions/v1/api/articles        → GET
/functions/v1/api/auth/profile    → POST
/functions/v1/api/users/search    → GET
/functions/v1/api/users/follow    → POST
/functions/v1/api/feed            → GET
```

### After (Separated)
```
/functions/v1/snippets            → GET, POST, DELETE
/functions/v1/articles            → GET
/functions/v1/auth/profile        → POST
/functions/v1/users/search        → GET
/functions/v1/users/follow        → POST
/functions/v1/feed                → GET
```

## Migration Steps

### 1. Deploy New Functions

Deploy all the new edge functions:

```bash
cd supabase/functions

# Deploy each function individually
supabase functions deploy snippets
supabase functions deploy articles
supabase functions deploy auth
supabase functions deploy users
supabase functions deploy feed
```

### 2. Update Environment Variables

The functions use the same environment variables, so no changes needed:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `CORS_ALLOW_ORIGINS` (optional)

### 3. Update Frontend Configuration

#### Web Application

Update your `.env` file:

**Before:**
```env
VITE_EDGE_URL=https://your-project.supabase.co/functions/v1/api
```

**After:**
```env
VITE_EDGE_URL=https://your-project.supabase.co/functions/v1
```

The frontend code already constructs the correct paths (`/snippets`, `/articles`, etc.), so no code changes are needed—just update the environment variable.

#### Chrome Extension

Update the endpoint in the extension options:

**Before:**
```
https://your-project.supabase.co/functions/v1/api
```

**After:**
```
https://your-project.supabase.co/functions/v1
```

### 4. Test All Endpoints

Test each function individually:

```bash
# Test snippets
curl https://your-project.supabase.co/functions/v1/snippets \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test articles
curl https://your-project.supabase.co/functions/v1/articles \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test auth profile creation
curl https://your-project.supabase.co/functions/v1/auth/profile \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser"}'

# Test user search
curl "https://your-project.supabase.co/functions/v1/users/search?q=test"

# Test follow user
curl "https://your-project.supabase.co/functions/v1/users/follow?username=testuser" \
  -X POST \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test feed
curl https://your-project.supabase.co/functions/v1/feed \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Remove Old API Function (Optional)

Once you've verified everything works, you can delete the old `api` function:

```bash
# Delete the old function from Supabase dashboard
# Or use CLI (if available in your Supabase CLI version)
supabase functions delete api

# Remove the local directory
rm -rf supabase/functions/api
```

## Rollback Plan

If you encounter issues, you can quickly rollback:

### Option 1: Keep Both Running

Keep both the old `api` function and new functions running simultaneously. Route gradually by updating environment variables per-client.

### Option 2: Redeploy Old Function

If you removed the old function and need to restore it:

```bash
# Restore from git
git checkout HEAD~1 -- supabase/functions/api

# Redeploy
supabase functions deploy api
```

## Benefits of New Architecture

✅ **Better Isolation** - Each function is independent
✅ **Easier Debugging** - Logs and errors are scoped to specific functions
✅ **Faster Cold Starts** - Functions only load needed code
✅ **Independent Scaling** - High-traffic endpoints scale independently
✅ **Cleaner Deployment** - Deploy/rollback individual functions
✅ **Better DX** - Each function has its own focused codebase

## Troubleshooting

### Function Not Found (404)

- Verify function is deployed: `supabase functions list`
- Check environment variable doesn't include `/api` suffix
- Ensure URL doesn't have double slashes

### CORS Errors

- Check `CORS_ALLOW_ORIGINS` environment variable
- Verify frontend origin is included in allowed origins
- Test with browser dev tools network tab

### Authentication Errors (401)

- Verify token is being sent in `Authorization: Bearer <token>` header
- Check token is valid (not expired)
- Ensure `SUPABASE_ANON_KEY` environment variable is set correctly

### TypeScript Import Errors

Each function has its own `lib/` folder with copies of shared utilities. This is intentional for isolation. If you need to update utilities, update all copies or consider creating a shared module (advanced).

## Questions?

See [supabase/functions/README.md](./README.md) for detailed documentation on the new architecture.
