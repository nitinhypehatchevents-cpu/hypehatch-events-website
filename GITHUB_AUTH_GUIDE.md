# 🔐 GitHub Authentication Guide

## Option 1: Personal Access Token (Easiest)

### Step 1: Create Personal Access Token

1. **Go to GitHub:**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Your Profile → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click **"Generate new token"** → **"Generate new token (classic)"**
   - **Note:** "Hypehatch Events Push"
   - **Expiration:** Choose 90 days or No expiration
   - **Scopes:** Check **"repo"** (full control of private repositories)
   - Click **"Generate token"**

3. **Copy the Token:**
   - ⚠️ **IMPORTANT:** Copy the token immediately (you won't see it again!)
   - It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

### Step 2: Push Using Token

When you run `git push`, it will ask for:
- **Username:** Your GitHub username (`nitinhypehatchevents-cpu`)
- **Password:** Paste your **Personal Access Token** (not your GitHub password!)

---

## Option 2: Use SSH (More Secure)

### Step 1: Generate SSH Key

```bash
# Generate SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# Press Enter to accept default location
# Press Enter for no passphrase (or set one)

# Copy public key
cat ~/.ssh/id_ed25519.pub
```

### Step 2: Add SSH Key to GitHub

1. **Copy the SSH key** (from above command)
2. **Go to GitHub:**
   - https://github.com/settings/keys
   - Click **"New SSH key"**
   - **Title:** "MacBook Air"
   - **Key:** Paste your SSH public key
   - Click **"Add SSH key"**

### Step 3: Change Remote to SSH

```bash
cd "/Volumes/Nitin Exter/Hypehatch Events Website/website"
git remote set-url origin git@github.com:nitinhypehatchevents-cpu/hypehatch-events-website.git
git push -u origin main
```

---

## Option 3: GitHub CLI (Alternative)

```bash
# Install GitHub CLI
brew install gh

# Login
gh auth login

# Follow prompts, then push
git push -u origin main
```

---

## Quick Push Command (After Authentication)

```bash
cd "/Volumes/Nitin Exter/Hypehatch Events Website/website"
git push -u origin main
```


