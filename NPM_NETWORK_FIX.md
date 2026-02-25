# 🔧 Fixing npm Network Timeout Issues

## Problem
You're getting `ERR_SOCKET_TIMEOUT` when trying to install npm packages. This is a network connectivity issue.

## Quick Fix Options

### Option 1: Increase npm Timeout (Recommended First)

```bash
cd /home/immigrant/immigration_ai

# Increase timeout settings
npm config set fetch-timeout 60000
npm config set fetch-retry-mintimeout 20000
npm config set fetch-retry-maxtimeout 120000
npm config set fetch-retries 5

# Try installing again
npm install
```

### Option 2: Use the Fix Script

```bash
cd /home/immigrant/immigration_ai
./fix-npm-install.sh
```

### Option 3: Clear Cache and Retry

```bash
cd /home/immigrant/immigration_ai

# Clear npm cache
npm cache clean --force

# Try installing again
npm install
```

### Option 4: Install with Offline Preference

If packages were partially downloaded:

```bash
cd /home/immigrant/immigration_ai
npm install --prefer-offline
```

### Option 5: Use Alternative Registry (If npmjs.org is blocked)

If you're in a region where npmjs.org is slow/blocked:

```bash
cd /home/immigrant/immigration_ai

# Use Chinese mirror (often faster in some regions)
npm config set registry https://registry.npmmirror.com

# Or use Taobao mirror
# npm config set registry https://registry.npmmirror.com

# Install
npm install

# To revert back to official registry later:
# npm config set registry https://registry.npmjs.org
```

### Option 6: Check Proxy Settings

If you're behind a proxy:

```bash
# Check if proxy is set
echo $HTTP_PROXY
echo $HTTPS_PROXY

# If you're NOT behind a proxy but these are set, unset them:
unset HTTP_PROXY
unset HTTPS_PROXY

# Then try npm install again
npm install
```

### Option 7: Install in Smaller Batches

If network is very unstable:

```bash
cd /home/immigrant/immigration_ai

# Install core dependencies first
npm install --no-save next@13.5.1 react@18.2.0 react-dom@18.2.0

# Then install everything else
npm install
```

## Verify Network Connection

Test if you can reach npm registry:

```bash
# Test connection (should return HTTP 200)
curl -I https://registry.npmjs.org

# Or test with timeout
curl --max-time 10 https://registry.npmjs.org
```

## After Successful Install

Once `npm install` completes:

```bash
# Install backend dependencies
cd backend
npm install
cd ..

# Start development server
npm run dev
```

## Common Causes

1. **Slow/unstable internet connection** - Use increased timeout (Option 1)
2. **Firewall blocking npmjs.org** - Use alternative registry (Option 5)
3. **Proxy misconfiguration** - Check proxy settings (Option 6)
4. **DNS issues** - Try using IP or different DNS server
5. **VPN issues** - Try disconnecting/reconnecting VPN

## Still Having Issues?

1. Check your internet connection: `ping google.com`
2. Try from a different network (mobile hotspot, etc.)
3. Check if your firewall/antivirus is blocking npm
4. Try installing at a different time (network might be congested)

## Success Indicators

When `npm install` works, you'll see:
- ✅ Packages downloading
- ✅ Progress bars
- ✅ "added X packages" message
- ✅ No timeout errors

Then you can run `npm run dev` successfully!
