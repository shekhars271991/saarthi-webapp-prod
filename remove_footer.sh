#!/bin/bash

# Script to remove Footer component from all page components
# since Footer is now in the root layout

echo "Removing Footer component from all page components..."

# List of pages to update
pages=(
  "app/my-trips/page.tsx"
  "app/outstation/page.tsx"
  "app/airport-transfer/page.tsx"
  "app/create-account/page.tsx"
  "app/privacy-and-policy/page.tsx"
  "app/terms-and-conditions/page.tsx"
  "app/hourly-rental/page.tsx"
  "app/our-services/page.tsx"
  "app/login/page.tsx"
  "app/cancellation-refund/page.tsx"
)

for page in "${pages[@]}"; do
  if [ -f "$page" ]; then
    echo "Processing $page..."
    
    # Remove Footer import
    sed -i '' '/import.*Footer.*from/d' "$page"
    
    # Remove Footer usage
    sed -i '' '/<Footer/d' "$page"
    sed -i '' '/Footer \/>/d' "$page"
    
    echo "✓ Updated $page"
  else
    echo "⚠ File $page not found"
  fi
done

echo "Done! All pages have been updated."
