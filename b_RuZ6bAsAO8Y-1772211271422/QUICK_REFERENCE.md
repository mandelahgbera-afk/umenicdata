# QUICK REFERENCE - FILE UPLOAD FIX

## Console Commands for Debugging

### Check if files are in DOM
```javascript
const inputs = document.querySelectorAll('input[type="file"]');
inputs.forEach(inp => {
  console.log(`${inp.id}: ${inp.files[0]?.name || 'NO FILE'}`);
});
```

### Check form data collection
```javascript
const form = document.querySelector('.apply-form-area');
const data = new FormData(form);
for (let [key, value] of data) {
  if (value instanceof File) {
    console.log(`${key}: ${value.name} (${(value.size/1024/1024).toFixed(2)}MB)`);
  }
}
```

### Check Telegram config
```javascript
console.log('Bot Token:', window.TG_BOT_TOKEN ? 'SET' : 'MISSING');
console.log('Chat ID:', window.TG_CHAT_ID ? 'SET' : 'MISSING');
```

---

## Expected Console Messages

### ✓ SUCCESS Pattern
```
[v0] SUBMISSION STARTED
[v0] DEEP FILE COLLECTION ANALYSIS
[v0] Step 1: Found 3 file input(s)
[v0] ✓ FILE COLLECTED FROM DOM
[v0] [1/4] Sending text message...
[v0] HTTP Status: 200
[v0] ✓ [1/4] Text message sent successfully
[v0] [2/4] Uploading selfie...
[v0] ✓ Selfie uploaded: filename.jpg
[v0] ✓✓✓ APPLICATION SUBMITTED COMPLETELY ✓✓✓
```

### ✗ FAILURE Pattern (Missing File)
```
[v0] Input 1: id="a-selfie"
[v0] ✗ NO FILE IN DOM
[v0] ⚠️ REQUIRED FILE MISSING: a-selfie
```

### ✗ NETWORK ERROR Pattern
```
[v0] [1/4] Sending text message (attempt 1/3)...
[v0] Retrying text message in 1 second...
[v0] [1/4] Sending text message (attempt 2/3)...
[v0] Retrying text message in 1 second...
[v0] [1/4] Sending text message (attempt 3/3)...
[v0] ✗ [1/4] Text message FAILED
```

---

## Troubleshooting Quick Guide

### Problem: Files show "NO FILE IN DOM"
```
✓ Make sure files are uploaded (see filename displayed)
✓ Wait for upload zone to show "✓ filename.jpg"
✓ Refresh page and try uploading again
✓ Check browser cache isn't interfering
```

### Problem: "HTTP Status: 401"
```
✓ Check config.js has correct BOT_TOKEN
✓ Check config.js has correct CHAT_ID
✓ Verify bot wasn't deleted in Telegram
✓ Get new token from @BotFather if needed
```

### Problem: "HTTP Status: 400"
```
✓ Check CHAT_ID doesn't have typos
✓ Make sure bot has access to the chat
✓ Send a test message to the bot manually
✓ Check @BotFather that bot is active
```

### Problem: Form hangs (no messages in console)
```
✓ Check internet connection
✓ Check browser network tab for stuck requests
✓ Hard refresh page (Ctrl+Shift+R or Cmd+Shift+R)
✓ Check if form validation is blocking submission
✓ Try different browser (Chrome, Firefox, Safari)
```

### Problem: Files uploaded but don't appear in Telegram
```
✓ Check console for upload success: "HTTP Status: 200"
✓ Check Telegram chat for files (may be hidden)
✓ Check bot has permissions in the chat
✓ Try uploading a different file
✓ Check if bot is muted/archived
```

---

## File Upload Timeouts

| Operation | Timeout | What It Means |
|-----------|---------|--------------|
| Text Message | 15 sec | Send form data to Telegram |
| Photo Upload | 30 sec | Send image files |
| Document Upload | 30 sec | Send PDF/DOC files |

If operation takes longer → automatically aborts and retries

---

## HTTP Status Codes

| Code | Meaning | What To Do |
|------|---------|-----------|
| 200 | Success | All good! Files uploaded |
| 400 | Bad Request | Check CHAT_ID format |
| 401 | Unauthorized | Check BOT_TOKEN in config.js |
| 403 | Forbidden | Bot doesn't have permission |
| 413 | Too Large | File exceeds size limit (50MB) |
| 500 | Server Error | Telegram API problem, try again |

---

## Retry Logic

```
Attempt 1: Try to send → Fail
            ↓ (1 second wait)
Attempt 2: Try again → Fail
            ↓ (2 second wait)
Attempt 3: Final try → Fail or Success
```

Only retries on:
- ✓ Timeout (AbortError)
- ✓ Network failure ("Failed to fetch")

Does NOT retry on:
- ✗ HTTP 401 (credentials wrong)
- ✗ HTTP 400 (bad data)
- ✗ HTTP 403 (permission denied)

---

## Log Symbols

| Symbol | Meaning |
|--------|---------|
| ✓ | Success |
| ✗ | Failure |
| ⚠ | Warning (non-critical) |
| ○ | Info (optional file skipped) |
| [1/4] | Step 1 of 4 |
| [v0] | Log prefix (easy to find) |

---

## Critical Flow Diagram

```
START FORM SUBMISSION
        ↓
   VALIDATE FORM ← User must fill all required fields
        ↓
  COLLECT FILES ← Log: "DEEP FILE COLLECTION ANALYSIS"
        ├─ Scan file inputs
        ├─ Extract files from DOM
        ├─ Check file existence
        └─ Log each file (name, size, type)
        ↓
  SEND TEXT MESSAGE (CRITICAL)
        ├─ 15 second timeout
        ├─ Retry up to 2 times
        └─ If fails → REJECT submission
        ↓
  SEND SELFIE (NON-CRITICAL)
        ├─ 30 second timeout
        ├─ Retry up to 2 times
        └─ If fails → WARN but continue
        ↓
  SEND ID PHOTO (NON-CRITICAL)
        ├─ 30 second timeout
        ├─ Retry up to 2 times
        └─ If fails → WARN but continue
        ↓
  SEND CV (NON-CRITICAL)
        ├─ 30 second timeout
        ├─ Retry up to 2 times
        └─ If fails → WARN but continue
        ↓
  SHOW SUCCESS PAGE
        └─ Clear form, show checkmark, say thank you
```

---

## Files to Check

### Main File
- `apply.js` - Contains all the fixes (Lines 349-796)

### Configuration
- `config.js` - Telegram credentials
  ```javascript
  window.TG_BOT_TOKEN = '...' // Required
  window.TG_CHAT_ID = '...'   // Required
  ```

### Reference Docs
- `FILE_UPLOAD_FIX_DOCUMENTATION.md` - Full technical details
- `BULLETPROOF_CHANGES.md` - Line-by-line changelog
- `TEST_CHECKLIST.md` - Testing procedures
- `FIX_SUMMARY.txt` - This implementation summary

---

## Key Functions

### collectFormData()
**What**: Extracts all form data from DOM
**Where**: Lines 349-448
**Returns**: Object with all fields + files
**Logs**: 9 phases of collection analysis

### sendTextMessage(formDataObj, retryCount, maxRetries)
**What**: Sends application text to Telegram
**Where**: Lines 450-560
**Timeout**: 15 seconds
**Retries**: 2 (3 total attempts)

### sendPhotoToTelegram(file, caption, retryCount, maxRetries)
**What**: Sends photos (selfie, ID) to Telegram
**Where**: Lines 562-678
**Timeout**: 30 seconds
**Retries**: 2 (3 total attempts)

### sendDocumentToTelegram(file, caption, retryCount, maxRetries)
**What**: Sends CV/documents to Telegram
**Where**: Lines 680-796
**Timeout**: 30 seconds
**Retries**: 2 (3 total attempts)

---

## Testing One-Liners

### Test: Can form be submitted?
```javascript
document.getElementById('submit-application').click();
// Watch console for collection logs
```

### Test: Are files detected?
```javascript
console.log('Files:', 
  [document.getElementById('a-selfie'),
   document.getElementById('a-id-photo'),
   document.getElementById('a-cv')].map(inp => 
    inp.id + ': ' + (inp.files[0]?.name || 'MISSING')
  )
);
```

### Test: Are credentials set?
```javascript
console.log('Config:', {
  token: window.TG_BOT_TOKEN ? 'SET' : 'MISSING',
  chatId: window.TG_CHAT_ID ? 'SET' : 'MISSING'
});
```

---

## Summary Checklist

- [ ] Files upload and display filename
- [ ] Form validates all required fields
- [ ] Console shows "DEEP FILE COLLECTION ANALYSIS"
- [ ] Console shows all 4 submission steps [1/4] through [4/4]
- [ ] Console shows "HTTP Status: 200" for each upload
- [ ] Console shows "✓✓✓ APPLICATION SUBMITTED COMPLETELY"
- [ ] Success page appears with checkmark
- [ ] Files appear in Telegram chat
- [ ] No console errors or warnings
- [ ] Submission completes in <30 seconds

If all ✓, the fix is working correctly!

---

*Last Updated: 2026-02-27*
*Version: 1.0 - Production Ready*
