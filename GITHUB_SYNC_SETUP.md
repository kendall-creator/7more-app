# GitHub Sync Setup for Vibecode → GitHub → Vercel

## Current Situation

Your project has two git remotes:
- **origin** (Vibecode): `git.vibecodeapp.com` - where commits from this environment go
- **github** (GitHub): `github.com/kendall-creator/7more-app` - where Vercel is watching

Right now, pushes only go to Vibecode's git server, so Vercel never sees them.

## Solution: Auto-Sync Script

I've created a sync script that will push commits from Vibecode to GitHub, which will then trigger Vercel deployments.

## Setup Steps

### 1. Create a GitHub Personal Access Token

1. Go to: https://github.com/settings/tokens
2. Click **"Generate new token (classic)"**
3. Give it a name: `Vibecode Sync Token`
4. Check the **`repo`** scope (full control of private repositories)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### 2. Add Token to Vibecode Environment

1. Open the **ENV tab** in your Vibecode app
2. Add a new environment variable:
   - Name: `GITHUB_TOKEN`
   - Value: `ghp_xxxxxxxxxxxxxxxxxxxx` (your token)
3. Save and restart if needed

### 3. Test the Sync

Run the sync script manually:

```bash
./sync-to-github.sh
```

This will:
- ✅ Push all commits to GitHub
- ✅ Trigger Vercel deployment automatically
- ✅ Show success/error messages

### 4. Automatic Sync (Optional)

Once `GITHUB_TOKEN` is set, every commit will automatically sync to GitHub via a post-commit hook.

## Manual Sync Anytime

To manually sync the latest commits to GitHub:

```bash
./sync-to-github.sh
```

## Verify It's Working

After syncing:
1. Check GitHub: https://github.com/kendall-creator/7more-app/commits/main
2. Check Vercel: You should see a new deployment starting

## Troubleshooting

### "GITHUB_TOKEN not set"
- Make sure you added it in the ENV tab
- Restart the Vibecode environment if needed

### "Push failed"
- Check that the token has `repo` permissions
- Verify the repository exists: `kendall-creator/7more-app`
- Check if there are conflicts between Vibecode and GitHub versions

### "Authentication failed"
- The token might be expired or invalid
- Generate a new token and update the ENV variable

## How It Works

```
Vibecode Git → (sync script) → GitHub → (webhook) → Vercel Deployment
```

1. You commit in Vibecode
2. Commit goes to `git.vibecodeapp.com`
3. Post-commit hook runs `sync-to-github.sh`
4. Script pushes to GitHub using token authentication
5. GitHub webhook triggers Vercel deployment
6. Vercel builds the `web-app/` directory

## Files Created

- **`sync-to-github.sh`** - Manual sync script
- **`.git/hooks/post-commit`** - Automatic sync after commits
- **`GITHUB_SYNC_SETUP.md`** - This guide

---

**Next Step:** Add `GITHUB_TOKEN` to your Vibecode ENV tab, then run `./sync-to-github.sh`
