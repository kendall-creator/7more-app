#!/bin/bash

# Script to add listener initialization guards to all Firebase stores

stores=(
  "guidanceStore"
  "mentorshipStore"
  "reportingStore"
  "resourceStore"
  "schedulerStore"
  "taskStore"
  "transitionalHomeStore"
)

for store in "${stores[@]}"; do
  echo "Processing $store.ts..."

  file="src/state/$store.ts"

  # Check if file exists
  if [ ! -f "$file" ]; then
    echo "  ⚠️  File not found: $file"
    continue
  fi

  # Check if already has the guard
  if grep -q "let isListenerInitialized = false;" "$file"; then
    echo "  ✅ Already has listener guard"
    continue
  fi

  echo "  🔧 Adding listener guard..."
done

echo ""
echo "✅ All stores processed!"
