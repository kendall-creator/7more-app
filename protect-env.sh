#!/bin/bash
# Environment Variable Protection Script
# This script ensures your .env file is never lost

ENV_FILE="/home/user/workspace/.env"
BACKUP_FILE="/home/user/workspace/.env.backup"

# If .env doesn't exist but backup does, restore it
if [ ! -f "$ENV_FILE" ] && [ -f "$BACKUP_FILE" ]; then
    echo "⚠️ .env file missing! Restoring from backup..."
    cp "$BACKUP_FILE" "$ENV_FILE"
    chmod 600 "$ENV_FILE"
    echo "✅ .env file restored successfully!"
fi

# If .env exists, update the backup
if [ -f "$ENV_FILE" ]; then
    cp "$ENV_FILE" "$BACKUP_FILE"
    chmod 400 "$BACKUP_FILE"
fi

echo "Environment variables are protected."
