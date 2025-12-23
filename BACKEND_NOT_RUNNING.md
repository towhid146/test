# "Failed to Fetch" Error - Troubleshooting Guide

## ✋ STOP! First Check This:

### 1. Is the Backend Server Running?

**Check in terminal:**

```bash
cd d:\projects\test\backend
npm run dev
```

You should see:

```
Server is running on port 5000
Environment: development
```

If NOT running → That's your problem! The frontend can't reach a server that isn't running.

---

## Step-by-Step Fix:

### Step 1: Start MongoDB

Make sure MongoDB is running on your system:

**Option A - MongoDB Desktop Service:**

- Check Windows Services (services.msc)
- Look for "MongoDB" service
- Make sure it's "Running"

**Option B - MongoDB via Docker:**

```bash
docker run -d -p 27017:27017 --name mongodb mongo
```

**Option C - Verify MongoDB connection:**
Open new terminal and type:

```bash
mongosh
```

Should connect without error.

---

### Step 2: Start Backend Server

Open a terminal and run:

```bash
cd d:\projects\test\backend
npm run dev
```

**Expected output:**

```
Server is running on port 5000
Environment: development
MongoDB Connected: localhost
```

**If you get ERRORS:**

❌ Error: "Cannot find module"

- Solution: `npm install`

❌ Error: "connect ECONNREFUSED 127.0.0.1:27017"

- Solution: Start MongoDB first

❌ Error: "port 5000 already in use"

- Solution: Kill process on port 5000
  ```bash
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

---

### Step 3: Test Backend is Working

Open new terminal and test:

```bash
curl http://localhost:5000/api/health
```

Should return:

```json
{ "success": true, "message": "Server is running" }
```

If this fails → Backend isn't running properly

---

### Step 4: Frontend API URL Check

The frontend expects backend at: `http://localhost:5000/api`

**Check these files have correct URL:**

✓ sponsor-signup.html - line ~1005

```javascript
fetch("http://localhost:5000/api/auth/sponsor/register", {
```

✓ sponsee-signup.html - line ~760

```javascript
fetch("http://localhost:5000/api/auth/sponsee/register", {
```

✓ login.html - line ~353

```javascript
const API_URL = "http://localhost:5000/api";
```

If URL is different → Update it!

---

## Complete Startup Sequence:

1. **Start MongoDB:**

   ```bash
   mongosh
   # or check Windows Services
   ```

2. **Start Backend (new terminal):**

   ```bash
   cd d:\projects\test\backend
   npm run dev
   ```

3. **Open Frontend (same or new terminal):**

   ```bash
   # Open browser and go to:
   file:///d:/projects/test/index.html
   # OR use Live Server extension
   ```

4. **Test the flow:**
   - Navigate to Sign Up
   - Fill form
   - Click Submit
   - Should see success message ✅

---

## Checklist:

- [ ] MongoDB is running
- [ ] Backend server started with `npm run dev`
- [ ] Backend shows "Server is running on port 5000"
- [ ] Backend shows "MongoDB Connected"
- [ ] Frontend URL is `http://localhost:5000/api`
- [ ] No errors in browser console (F12)
- [ ] No errors in backend terminal

---

## Browser Console Debugging:

1. Open your website
2. Press F12 (Developer Tools)
3. Go to Console tab
4. Try signing up
5. Look for error messages
6. Screenshot and note the error

Common console errors:

```
Failed to fetch                      → Backend not running
net::ERR_NAME_NOT_RESOLVED           → Wrong domain name
CORS error                           → CORS not enabled
404 Not Found                        → Wrong API endpoint
```

---

## If Still Having Issues:

### Check Network Tab (F12):

1. Open Developer Tools
2. Go to Network tab
3. Try to sign up
4. Look for the API request (e.g., sponsor/register)
5. Click it and check:
   - Status: Should be 201 or 200
   - Response: Check what backend returned
   - Request: Verify JSON is correct

### Backend Logs:

Check terminal where you ran `npm run dev`:

- Should show request received
- Should show response sent
- Look for any errors

Example:

```
POST /api/auth/sponsor/register
Sponsor registered successfully
```

---

## Quick Commands Reference:

```bash
# Start backend
cd d:\projects\test\backend && npm run dev

# Check if MongoDB running
mongosh

# Kill process on port 5000
netstat -ano | findstr :5000
taskkill /PID <PID_NUMBER> /F

# Restart everything
# 1. Close all terminals
# 2. Start MongoDB
# 3. Start backend
# 4. Open frontend in browser
```

---

## Still Stuck?

Run this test command from backend folder:

```bash
node -e "
const http = require('http');
http.get('http://localhost:5000/api/health', (res) => {
  console.log('Backend is responding!');
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Response:', data));
}).on('error', (err) => {
  console.log('Backend NOT responding:', err.message);
});
"
```

This will tell you if backend is running.
