#!/bin/bash
# Bulk upload env vars to Vercel agora project (production + preview + development)
# Usage: bash upload-env-to-vercel.sh

set -e

PROJECT_DIR="/Users/pretosmediagroupllc/Documents/GitHub/agora"
ENV_FILE="$PROJECT_DIR/apps/web/.env.local"

# Skip lines starting with # and blank lines, and known non-app vars
SKIP_VARS=(
  "VERCEL_OIDC_TOKEN"
)

add_var() {
  local KEY="$1"
  local VALUE="$2"
  
  # Skip if in skip list
  for skip in "${SKIP_VARS[@]}"; do
    if [[ "$KEY" == "$skip" ]]; then
      echo "⏭️  Skipping $KEY"
      return
    fi
  done
  
  echo "➕ Adding $KEY..."
  echo "$VALUE" | vercel env add "$KEY" production --force 2>&1 || echo "⚠️  Failed to add $KEY to production"
  echo "$VALUE" | vercel env add "$KEY" preview --force 2>&1 || echo "⚠️  Failed to add $KEY to preview"
  echo "$VALUE" | vercel env add "$KEY" development --force 2>&1 || echo "⚠️  Failed to add $KEY to development"
}

# Parse .env.local
while IFS='=' read -r key rest; do
  # Skip empty lines and comments
  [[ -z "$key" || "$key" == \#* ]] && continue
  
  # Clean up the key (remove leading/trailing spaces)
  key=$(echo "$key" | xargs)
  
  # Get value (everything after first =), strip surrounding quotes
  value=$(echo "$rest" | sed 's/^"\(.*\)"$/\1/' | sed "s/^'\(.*\)'$/\1/")
  
  # Skip empty values
  [[ -z "$value" ]] && continue
  
  add_var "$key" "$value"
  
done < "$ENV_FILE"

echo ""
echo "✅ Done uploading env vars!"
echo ""
vercel env ls
