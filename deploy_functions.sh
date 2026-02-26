#! /bin/bash

echo "Deploying function: $1..."

set -a; source .env; set +a; npx supabase functions deploy $1 --project-ref ${SUPABASE_PROJECT_REF} --no-verify-jwt

echo "Function $1 deployed successfully!"