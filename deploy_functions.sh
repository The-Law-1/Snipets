#! /bin/bash

if [ -z "$1" ]; then
  echo "Usage: $0 <function-name>"
  exit 1
fi

echo "Deploying function: $1..."

set -a; source .env; set +a; npx supabase functions deploy $1 --project-ref ${SUPABASE_PROJECT_REF} --no-verify-jwt

if [ $? -ne 0 ]; then
  echo "Failed to deploy function $1"
  exit 1
fi

echo "Function $1 deployed successfully!"