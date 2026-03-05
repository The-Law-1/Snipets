#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -f ".env" ]]; then
	set -a
	# shellcheck source=/dev/null
	source .env
	set +a
fi

required_vars=(SUPABASE_URL SUPABASE_ANON_KEY EDGE_URL SNIPPETS_WEB_APP_URL)
for var_name in "${required_vars[@]}"; do
	if [[ -z "${!var_name:-}" ]]; then
		echo "Missing required env var: ${var_name}" >&2
		echo "Set it in your shell or in ChromeExt/.env" >&2
		exit 1
	fi
done

mkdir -p dist

escape_js_string() {
	local value="$1"
	value="${value//\\/\\\\}"
	value="${value//\"/\\\"}"
	printf '%s' "$value"
}

supabase_url_escaped="$(escape_js_string "$SUPABASE_URL")"
supabase_anon_key_escaped="$(escape_js_string "$SUPABASE_ANON_KEY")"
edge_url_escaped="$(escape_js_string "$EDGE_URL")"
snippets_web_app_url_escaped="$(escape_js_string "$SNIPPETS_WEB_APP_URL")"

ignore_files=(
	"env.d.ts",
	"types.ts"
)

for file in src/*.ts; do
	if [[ " ${ignore_files[*]} " == *" $(basename "$file") "* ]]; then
		echo "Skipping $file (in ignore list)"
		continue
	fi
	outfile="dist/$(basename "$file" .ts).js"
	npx esbuild "$file" \
		--bundle \
		--platform=browser \
		--outfile="$outfile" \
		--define:process.env.SUPABASE_URL=\"$supabase_url_escaped\" \
		--define:process.env.SUPABASE_ANON_KEY=\"$supabase_anon_key_escaped\" \
		--define:process.env.EDGE_URL=\"$edge_url_escaped\" \
		--define:process.env.SNIPPETS_WEB_APP_URL=\"$snippets_web_app_url_escaped\"
done

echo "Build complete: env vars injected at build time."