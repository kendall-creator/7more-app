#!/bin/bash

# Automatic Backup System - Prevents Code Loss
# Creates snapshots before any potentially destructive operations

BACKUP_DIR="/home/user/workspace/.code-backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Function to create a backup
create_backup() {
    local backup_name="backup_${TIMESTAMP}"
    local backup_path="${BACKUP_DIR}/${backup_name}"

    echo "📦 Creating backup: ${backup_name}"

    # Create git bundle (complete repository backup)
    git bundle create "${backup_path}.bundle" --all

    # Create tar backup of working directory (excluding node_modules)
    tar -czf "${backup_path}.tar.gz" \
        --exclude='node_modules' \
        --exclude='web-app/node_modules' \
        --exclude='backend/node_modules' \
        --exclude='.code-backups' \
        --exclude='dist' \
        --exclude='.expo' \
        .

    echo "✅ Backup created: ${backup_name}"
    echo "   Bundle: ${backup_path}.bundle"
    echo "   Archive: ${backup_path}.tar.gz"

    # Keep only last 10 backups (delete older ones)
    ls -t "${BACKUP_DIR}"/backup_*.bundle 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
    ls -t "${BACKUP_DIR}"/backup_*.tar.gz 2>/dev/null | tail -n +11 | xargs rm -f 2>/dev/null || true
}

# Function to list backups
list_backups() {
    echo "📋 Available backups:"
    ls -lht "${BACKUP_DIR}"/backup_*.bundle 2>/dev/null | awk '{print $9}' | xargs -n1 basename | sed 's/.bundle$//' || echo "No backups found"
}

# Function to restore from backup
restore_backup() {
    local backup_name="$1"

    if [ -z "$backup_name" ]; then
        echo "❌ Error: Please specify a backup name"
        list_backups
        return 1
    fi

    local backup_path="${BACKUP_DIR}/${backup_name}"

    if [ ! -f "${backup_path}.bundle" ]; then
        echo "❌ Error: Backup not found: ${backup_name}"
        list_backups
        return 1
    fi

    echo "⚠️  WARNING: This will restore your code to ${backup_name}"
    echo "   Current changes will be lost!"
    read -p "Continue? (yes/no): " confirm

    if [ "$confirm" != "yes" ]; then
        echo "❌ Restore cancelled"
        return 1
    fi

    # Restore from bundle
    git fetch "${backup_path}.bundle" main:backup-restore
    git reset --hard backup-restore
    git branch -D backup-restore

    echo "✅ Code restored from: ${backup_name}"
}

# Main command handling
case "$1" in
    create|backup)
        create_backup
        ;;
    list|ls)
        list_backups
        ;;
    restore)
        restore_backup "$2"
        ;;
    *)
        echo "🛡️  Code Protection System"
        echo ""
        echo "Usage:"
        echo "  $0 create          - Create a backup now"
        echo "  $0 list            - List all backups"
        echo "  $0 restore <name>  - Restore from a backup"
        echo ""
        echo "Backups are stored in: ${BACKUP_DIR}"
        echo "Last 10 backups are kept automatically"
        ;;
esac
