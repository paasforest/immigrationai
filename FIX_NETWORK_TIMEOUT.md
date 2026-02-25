# 🔧 Fixing Persistent Network Timeout

## Problem
npm keeps timing out when trying to download packages from registry.npmjs.org. This is a network connectivity issue.

## Solution 1: Use Alternative Registry (Recommended)

The official npm registry might be slow or blocked in your region. Use a mirror:

```bash
cd /home/immigrant/immigration_ai

# Switch to Chinese mirror (often much faster)
npm config set registry https://registry.npmmirror.com

# Install
npm install
```

Or use the script:
```bash
./install-with-mirror.sh
```

**To switch back to official registry later:**
```bash
npm config set registry https://registry.npmjs.org
```

## Solution 2: Maximum Timeout Settings

If you want to stick with official registry, increase timeouts significantly:

```bash
cd /home/immigrant/immigration_ai

# Set very high timeouts
npm config set fetch-timeout 300000  # 5 minutes
npm config set fetch-retry-mintimeout 60000  # 1 minute
npm config set fetch-retry-maxtimeout 600000  # 10 minutes
npm config set fetch-retries 20

# Clear cache
npm cache clean --force

# Try installing
npm install
```

## Solution 3: Check Proxy Settings

If you're behind a proxy or have proxy settings misconfigured:

```bash
# Check if proxy is set
echo $HTTP_PROXY
echo $HTTPS_PROXY
npm config get proxy
npm config get https-proxy

# If you're NOT behind a proxy but these are set, remove them:
unset HTTP_PROXY
unset HTTPS_PROXY
npm config delete proxy
npm config delete https-proxy

# Then try installing again
npm install
```

## Solution 4: Install Offline (If You Have Cached Packages)

If you've partially downloaded packages before:

```bash
cd /home/immigrant/immigration_ai

# Try installing from cache
npm install --prefer-offline --offline=false
```

## Solution 5: Use Different Network

If your current network is unstable:

1. **Try mobile hotspot** - Connect your laptop to phone's hotspot
2. **Try different WiFi** - Use a different network
3. **Try VPN** - If npmjs.org is blocked in your region

## Solution 6: Install Core Packages First

Install essential packages first, then the rest:

```bash
cd /home/immigrant/immigration_ai

# Install Next.js and React first
npm install --no-save next@13.5.1 react@18.2.0 react-dom@18.2.0

# Then install everything else
npm install
```

## Solution 7: Manual Package Installation

If network is extremely unstable, install packages one by one:

```bash
cd /home/immigrant/immigration_ai

# Install core dependencies
npm install next react react-dom typescript

# Install UI libraries
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu

# Continue with other packages...
# (This is tedious but works if network is very unstable)
```

## Solution 8: Copy node_modules from Another Machine

If you have access to another machine with working internet:

1. On the other machine:
   ```bash
   cd /path/to/immigration_ai
   npm install
   tar -czf node_modules.tar.gz node_modules
   ```

2. Copy to this machine:
   ```bash
   scp node_modules.tar.gz user@this-machine:/home/immigrant/immigration_ai/
   ```

3. Extract:
   ```bash
   cd /home/immigrant/immigration_ai
   tar -xzf node_modules.tar.gz
   ```

## Recommended Approach

**Start with Solution 1 (Alternative Registry)** - it's the fastest and most reliable:

```bash
cd /home/immigrant/immigration_ai
npm config set registry https://registry.npmmirror.com
npm install
```

This Chinese mirror is often 10x faster than the official registry in many regions.

## Verify Installation

After successful install:

```bash
# Check if Next.js is installed
ls node_modules/next

# Check if React is installed
ls node_modules/react

# Try running dev server
npm run dev
```

## If Nothing Works

1. **Check internet connection**: `ping google.com`
2. **Check DNS**: `nslookup registry.npmjs.org`
3. **Try from terminal**: `curl https://registry.npmjs.org` (should return JSON)
4. **Check firewall**: Make sure port 443 (HTTPS) is not blocked
5. **Contact network admin**: If on corporate network, they might be blocking npm

## Success!

Once `npm install` completes, you'll see:
```
added 1234 packages, and audited 1235 packages in 5m
```

Then you can:
```bash
# Install backend
cd backend && npm install

# Start development
cd ..
npm run dev
```
