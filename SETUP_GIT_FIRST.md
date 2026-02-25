# 🔧 Setup Git First

## Quick Setup

Run this to configure git properly:

```bash
cd /home/immigrant/immigration_ai
./setup-git.sh
```

This will:
1. ✅ Fix git ownership
2. ✅ Set your email: paasforest@gmail.com
3. ✅ Set your username: paasforest
4. ✅ Configure remote with PAT

## Then Deploy

After setup, run:
```bash
./fix-and-deploy.sh
```

## Manual Setup (Alternative)

If you prefer manual setup:

```bash
cd /home/immigrant/immigration_ai

# Fix ownership
git config --global --add safe.directory /home/immigrant/immigration_ai
sudo chown -R $USER:$USER .git

# Configure user
git config user.email "paasforest@gmail.com"
git config user.name "paasforest"

# Configure remote
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/paasforest/immigrationai.git
```

---

**Run `./setup-git.sh` first, then `./fix-and-deploy.sh`!** 🚀
