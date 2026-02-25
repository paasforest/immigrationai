# 🚀 Quick Setup Instructions

## ⚠️ Important: Run Commands from Project Directory

You need to be **inside the project directory** to run these commands.

### Step 1: Navigate to Project Directory

```bash
cd /home/immigrant/immigration_ai
```

### Step 2: Fix Permissions

**Option A: Use the script (Easiest)**
```bash
cd /home/immigrant/immigration_ai
./fix-permissions.sh
```

**Option B: Manual commands**
```bash
cd /home/immigrant/immigration_ai
sudo chown -R $USER:$USER node_modules backend/node_modules
```

### Step 3: Install Dependencies

```bash
# Make sure you're in the project directory
cd /home/immigrant/immigration_ai

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### Step 4: Start Development

```bash
# Make sure you're in the project directory
cd /home/immigrant/immigration_ai

# Start frontend (connects to production API)
npm run dev
```

---

## 🐛 Common Error

If you see:
```
chown: cannot access 'node_modules': No such file or directory
```

**Solution**: You're not in the project directory. Run:
```bash
cd /home/immigrant/immigration_ai
```
Then try again.

---

## ✅ Verify You're in the Right Directory

Run this to check:
```bash
pwd
# Should show: /home/immigrant/immigration_ai

ls package.json
# Should show: package.json (not "No such file")
```

If you see the file, you're in the right place! ✅
