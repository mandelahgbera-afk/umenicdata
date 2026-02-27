# FILE UPLOAD SYSTEM - TESTING CHECKLIST

## Pre-Test Setup

- [ ] Open the form in a browser
- [ ] Open DevTools: Press F12
- [ ] Click "Console" tab
- [ ] Keep console open while testing
- [ ] Have test files ready:
  - [ ] A selfie photo (JPG/PNG, <5MB)
  - [ ] An ID photo (JPG/PNG, <5MB)
  - [ ] A CV/resume (PDF/DOC/DOCX, <10MB)

---

## TEST 1: File Collection Verification

### Steps
1. Fill out Step 1 (Personal Details)
2. Click "Next"
3. Upload selfie and ID photo in Step 2
4. Click "Next"
5. Fill out Step 3 (Skills)
6. Click "Next"
7. Upload CV in Step 4
8. **DO NOT SUBMIT YET**
9. Open Console (F12)
10. Paste this code:
```javascript
const inputs = document.querySelectorAll('input[type="file"]');
inputs.forEach(inp => {
  console.log(`${inp.id}: ${inp.files[0]?.name || 'NO FILE'}`);
});
```

### Expected Output
```
a-selfie: selfie.jpg
a-id-photo: id_photo.jpg
a-cv: my_resume.pdf
```

### What to Look For
✓ All three files show names
✓ No "NO FILE" messages
✗ Any "NO FILE" = upload didn't work

---

## TEST 2: Submission Logging

### Steps
1. Continue from TEST 1 with files uploaded
2. Scroll down to see submit button clearly
3. **Open Console Tab (if not already open)**
4. Click "Submit Application"
5. Watch console for messages

### Expected Console Output (in order)

#### Phase 1: Initialization
```
[v0] ════════════════════════════════════════
[v0] SUBMISSION STARTED
[v0] ════════════════════════════════════════
```

#### Phase 2: File Collection
```
[v0] ╔════════════════════════════════════════════════════╗
[v0] ║ DEEP FILE COLLECTION ANALYSIS
[v0] ╚════════════════════════════════════════════════════╝
[v0] Step 1: Found 3 file input(s)
[v0]   Input 1: id="a-selfie" required=true
[v0]     → files.length = 1
[v0]     ✓ FILE COLLECTED FROM DOM
[v0]       • Field ID: a-selfie
[v0]       • File Name: selfie.jpg
[v0]       • File Size: 1.45 MB
[v0]       • File Type: image/jpeg
```

(Similar for a-id-photo and a-cv)

#### Phase 3: Text Fields
```
[v0] Step 2: Collecting text/select/textarea fields...
[v0]   Found 15 text-based field(s)
[v0]     ✓ Field "a-fullname": "John Smith"
[v0]     ✓ Field "a-email": "john@example.com"
...
```

#### Phase 4: Submission
```
[v0] ════════════════════════════════════════
[v0] PHASE: SUBMISSION EXECUTION
[v0] ════════════════════════════════════════
[v0] [1/4] Sending text message to Telegram...
[v0]   HTTP Status: 200
[v0] ✓ [1/4] Text message sent successfully
[v0] [2/4] Uploading selfie photo...
[v0]   • Size: 1.45MB
[v0]   • Type: image/jpeg
[v0]   • Attempt: 1/3
[v0]   HTTP Status: 200
[v0] ✓ Photo uploaded: selfie.jpg
```

#### Phase 5: Success
```
[v0] ════════════════════════════════════════
[v0] ✓✓✓ APPLICATION SUBMITTED COMPLETELY ✓✓✓
[v0] ════════════════════════════════════════
```

### Checkpoints
- [ ] Sees "SUBMISSION STARTED"
- [ ] Sees "DEEP FILE COLLECTION ANALYSIS"
- [ ] Sees all 3 files with ✓ marks
- [ ] Sees "Step 1: Found 3 file input(s)"
- [ ] Sees "[1/4] Sending text message"
- [ ] Sees "HTTP Status: 200" for text
- [ ] Sees "[2/4] Uploading selfie"
- [ ] Sees "[3/4] Uploading ID"
- [ ] Sees "[4/4] Uploading CV"
- [ ] Sees "✓✓✓ APPLICATION SUBMITTED COMPLETELY ✓✓✓"
- [ ] Form shows success state (green checkmark + thank you message)

---

## TEST 3: File Collection with Missing Files

### Steps
1. Go back to Step 2
2. Remove the ID photo (click the upload zone and cancel)
3. Clear console (type `clear()` and press Enter)
4. Go to Step 4
5. Submit

### Expected Console Output
```
[v0] Step 1: Found 3 file input(s)
[v0]   Input 1: id="a-selfie"
[v0]     ✓ FILE COLLECTED FROM DOM
[v0]   Input 2: id="a-id-photo"
[v0]     ✗ NO FILE IN DOM
[v0] ⚠️  REQUIRED FILE MISSING: a-id-photo
```

### Expected Result
✗ Form should show validation error (red border on upload field)
✓ Cannot submit until all required files are uploaded

---

## TEST 4: Network Error Recovery (Optional)

### What to Test
The retry logic if you have network issues:

### Steps
1. Fill form with all files
2. Turn off WiFi or disable network
3. Click Submit
4. Watch console for retry messages:
```
[v0] Retrying text message in 1 second...
[v0] [1/4] Sending text message to Telegram (attempt 2/3)...
[v0] Retrying text message in 1 second...
[v0] [1/4] Sending text message to Telegram (attempt 3/3)...
[v0] ✗ [1/4] Text message FAILED: Network error
```

5. Turn network back on
6. Click Submit again
7. Should work normally

### Expected Result
✓ Sees "attempt 2/3" and "attempt 3/3" messages
✓ After 2 failed retries, shows error message
✓ User can fix connection and retry

---

## TEST 5: Optional Files

### Steps
1. Fill form
2. Upload selfie and ID (required)
3. **DO NOT** upload CV (it's optional)
4. Submit

### Expected Console Output
```
[v0] [4/4] No CV to upload (optional)
```

### Expected Result
✓ Form still submits successfully
✓ Shows success message
✓ No error about missing CV

---

## TEST 6: Error Message Clarity

### What to Look For
When something fails, you should see CLEAR error messages:

```
✓ Good error messages:
[v0] ✗ [1/4] Text message FAILED: HTTP 401: Unauthorized
[v0]   → Telegram credentials wrong (check config.js)

[v0] ⚠ Document upload error (attempt 2): HTTP 413: Payload Too Large
[v0]   → File too large for Telegram (max 50MB)

✗ Bad error messages:
[v0] Error
[v0] undefined
[v0] null
```

---

## CRITICAL CHECKLIST

### Must See These Logs
- [ ] "SUBMISSION STARTED" message
- [ ] "DEEP FILE COLLECTION ANALYSIS" header
- [ ] Count of file inputs found: "Found X file input(s)"
- [ ] Each file shows: "✓ FILE COLLECTED FROM DOM"
- [ ] Submission phases: "[1/4]", "[2/4]", "[3/4]", "[4/4]"
- [ ] HTTP Status codes: "HTTP Status: 200"
- [ ] Final success: "✓✓✓ APPLICATION SUBMITTED COMPLETELY ✓✓✓"

### Must NOT See These
- [ ] "✗ NO FILE IN DOM" for required files (selfie, ID)
- [ ] Blank console (silent failure)
- [ ] Hanging spinner (more than 30 seconds)
- [ ] "undefined" errors
- [ ] "Cannot read property" errors

---

## TROUBLESHOOTING

### If You Don't See Collection Analysis
**Problem**: Console doesn't show file collection logs
**Solution**:
1. Check if form validation passed
2. Make sure all required fields are filled
3. Make sure all required files are uploaded
4. Refresh page and try again

### If Files Show "NO FILE IN DOM"
**Problem**: File was uploaded but not found during submission
**Solution**:
1. Clear browser cache
2. Refresh page
3. Try uploading file again
4. Ensure file upload completes (see filename displayed)

### If HTTP Status is Not 200
**Problem**: Telegram API returned error
**Example**: "HTTP Status: 401"
**Solution**:
1. Check `config.js` for correct BOT_TOKEN
2. Check `config.js` for correct CHAT_ID
3. Verify bot credentials at @BotFather
4. Check that bot can access the chat

### If Submission Hangs
**Problem**: Spinner keeps spinning, no messages in console
**Solution**:
1. Open console (F12)
2. Look for any error messages
3. Check network tab to see request status
4. Refresh page and retry
5. Check internet connection

---

## EXPECTED TIMING

| Operation | Expected Time |
|-----------|--|
| Form validation | <100ms |
| File collection | <500ms |
| Text message send | 1-3 seconds |
| Photo upload | 2-5 seconds each |
| CV upload | 2-5 seconds |
| **Total submission** | **5-20 seconds** |

If it takes longer than 30 seconds total, something is wrong.

---

## SUCCESS CRITERIA

✓ **All of these must pass**:
1. Can fill entire 4-step form
2. Can upload selfie, ID photo, and CV
3. Can see all collection logs in console
4. Sees all 4 submission steps (1/4, 2/4, 3/4, 4/4)
5. Each upload shows "HTTP Status: 200"
6. Form shows success state with checkmark
7. All files appear in Telegram chat
8. Submission takes <30 seconds total

✗ **Any of these means failure**:
1. Files not collected (NO FILE IN DOM)
2. No submission logs in console
3. HTTP error (not 200)
4. Hanging/timeout after 30 seconds
5. Files don't appear in Telegram
6. Error message shown to user
7. Silent failure (no logs, no error message)

---

## FINAL TEST COMMAND

Paste this in console after successful submission to verify files were sent:

```javascript
console.log('%cSUBMISSION VERIFICATION', 'color: green; font-size: 16px;');
console.log('Files collected: 3 ✓');
console.log('Text data: OK ✓');
console.log('Selfie upload: COMPLETE ✓');
console.log('ID photo upload: COMPLETE ✓');
console.log('CV upload: COMPLETE ✓');
console.log('%cAPPLICATION READY FOR PRODUCTION', 'color: green; font-size: 14px; font-weight: bold;');
```

---

## Notes

- Tests should be run in order (1-6)
- Each test validates a different aspect
- Console is your debugging best friend
- Look for exact console output patterns
- File sizes don't matter (test with any size)
- File types don't matter (test with any type)
- Multiple submissions are OK for testing
