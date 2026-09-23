!(function () {
    'use strict';
    const WEBHOOK_URL = 'https://hook.eu2.make.com/awlgw75udlsuft5mf6gpn1f5s1i9tgxb',
      TOTAL_STEPS = 8,
      STEP_NAMES = { 1: 'Part 1 of 8: About You', 2: 'Part 2 of 8: Prior Wills', 3: 'Part 3 of 8: Scope of Estate', 4: 'Part 4 of 8: Executors', 5: 'Part 5 of 8: Funeral Wishes', 6: 'Part 6 of 8: Beneficiaries', 7: 'Part 7 of 8: Guardianship', 8: 'Part 8 of 8: Confirmation' };
    function getStorageKey() {
      const cid = getCaseId();
      return cid ? 'sw_q_draft_' + cid : null;
    }
    const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      PHONE_REGEX = /^\+\d{7,15}$/,
      PASSPORT_REGEX = /^[A-Z0-9]{6,}$/i,
      EID_REGEX = /^784-\d{4}-\d{7}-\d$/,
      MAX_AGE_YEARS = 120,
      MIN_TESTATOR_AGE_DEFAULT = 18,
      MIN_TESTATOR_AGE_STRICT_CHANNELS = 21,
      STRICT_AGE_CHANNELS = ['difc', 'adgm'],
      MIN_EXECUTOR_AGE = 18,
      MIN_GUARDIAN_AGE = 18,
      MAX_BLOCKS = {},
      MAX_FILE_MB = 10,
      FILE_TYPES = 'application/pdf,image/jpeg,image/jpg,image/png,image/webp,image/heic',
      UPLOAD_MAP = [
        [/^q5_passport$/, 'testator_a_passport_file', 'Upload passport (PDF/image, max 10MB)'],
        [/^q5_passport_b$/, 'testator_b_passport_file', 'Upload passport (max 10MB)'],
        [/^executor_(\d+)_passport$/, 'executor_$1_passport_file', 'Upload executor passport (PDF/image, max 10MB)'],
        [/^executor_b_(\d+)_passport$/, 'executor_b_$1_passport_file', 'Upload executor passport (max 10MB)'],
        [/^sub_executor_(\d+)_passport$/, 'sub_executor_$1_passport_file', 'Upload substitute executor passport (max 10MB)'],
        [/^perm_guardian_passport$/, 'perm_guardian_passport_file', 'Upload guardian passport (max 10MB)'],
        [/^sub_perm_passport$/, 'sub_perm_passport_file', 'Upload substitute guardian passport (PDF/image, max 10MB)'],
        [/^interim_passport$/, 'interim_passport_file', 'Upload interim guardian passport (max 10MB)'],
        [/^sub_interim_passport$/, 'sub_interim_passport_file', 'Upload substitute interim guardian passport (PDF/image, max 10MB)'],
        [/^primary_ben_(\d+)_passport$/, 'primary_ben_$1_passport_file', 'Upload beneficiary passport (max 10MB)'],
        [/^secondary_ben_(\d+)_passport$/, 'secondary_ben_$1_passport_file', 'Upload beneficiary passport (max 10MB)'],
        [/^child_(\d+)_passport$/, 'child_$1_passport_file', 'Upload child passport (PDF/image, max 10MB)'],
      ],
      COUNTRIES = ['Afghanistan', 'Albania', 'Algeria', 'Andorra', 'Angola', 'Antigua and Barbuda', 'Argentina', 'Armenia', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas', 'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bhutan', 'Bolivia', 'Bosnia and Herzegovina', 'Botswana', 'Brazil', 'Brunei', 'Bulgaria', 'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark', 'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea', 'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia', 'Georgia', 'Germany', 'Ghana', 'Greece', 'Grenada', 'Guatemala', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hungary', 'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Israel', 'Italy', 'Ivory Coast', 'Jamaica', 'Japan', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kosovo', 'Kuwait', 'Kyrgyzstan', 'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands', 'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia', 'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay', 'Peru', 'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Rwanda', 'Saint Kitts and Nevis', 'Saint Lucia', 'Samoa', 'San Marino', 'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia', 'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka', 'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga', 'Trinidad and Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu', 'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan', 'Vanuatu', 'Vatican City', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'],
      OPTIONAL_FIELDS = new Set([]),
      _RO_BASE = { q7_marital: ['single', 'married', 'divorced', 'widowed'], q8_residency: ['yes', 'no', 'citizen'], q10_religion: ['non-muslim', 'muslim'], q12_prior_will: ['no', 'yes-uae', 'yes-other', 'yes-both'], q13_revocation: ['full', 'partial', 'none'], q14_scope: ['uae-only', 'worldwide', 'worldwide-except'], q15_executor_count: ['sole', 'joint'], q17_has_substitute: ['yes', 'no'], q19_disposition: ['burial', 'cremation', 'no-preference', 'other'], q20_location_pref: ['yes', 'no'], q21_directions_pref: ['yes', 'no'], q22_beneficiary_count: ['sole', 'multiple'], q24_has_secondary: ['yes', 'no'], q26_has_bequests: ['yes', 'no'], q28_has_minors: ['yes', 'no'], q30_has_perm_guardian: ['yes', 'no'], q32_has_sub_perm: ['yes', 'no'], q34_has_interim: ['yes', 'no'], q36_has_sub_interim: ['yes', 'no'], q38_additional: ['yes', 'no'] },
      RADIO_OPTIONS = Object.assign({ bequest_1_type: ['percentage', 'cash', 'asset', 'other'] }, _RO_BASE, Object.fromEntries(Object.entries(_RO_BASE).map(([k, v]) => [k + '_b', v])));
    let currentStep = 1,
      caseId = null;
    const $ = (sel, root = document) => root.querySelector(sel),
      $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
    function getCaseId() {
      const p = new URLSearchParams(window.location.search);
      return p.get('case_id') || sessionStorage.getItem('sw_case_id') || null;
    }
    function getChannel() {
      try {
        const p = new URLSearchParams(window.location.search);
        return (p.get('channel') || sessionStorage.getItem('sw_channel') || '').toLowerCase();
      } catch (e) {
        return '';
      }
    }
    function getPackage() {
      try {
        const p = new URLSearchParams(window.location.search);
        return (p.get('package') || sessionStorage.getItem('sw_package') || '').toLowerCase();
      } catch (e) {
        return '';
      }
    }
    function isStrictAgeChannel() {
      return -1 !== STRICT_AGE_CHANNELS.indexOf(getChannel());
    }
    function getRequiredTestatorAge() {
      return isStrictAgeChannel() ? MIN_TESTATOR_AGE_STRICT_CHANNELS : MIN_TESTATOR_AGE_DEFAULT;
    }
    function calcAge(s) {
      if (!s) return null;
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      const t = new Date();
      let a = t.getFullYear() - d.getFullYear();
      const m = t.getMonth() - d.getMonth();
      return ((m < 0 || (0 === m && t.getDate() < d.getDate())) && a--, a);
    }
    function validateDOB(s, minAge, label) {
      if (!s) return null;
      const d = new Date(s);
      if (isNaN(d.getTime())) return 'Invalid date';
      const n = new Date();
      if (d > n) return 'Date of birth cannot be in the future';
      const c = new Date(n.getFullYear() - MAX_AGE_YEARS, n.getMonth(), n.getDate());
      if (d < c) return 'Date of birth cannot be more than ' + MAX_AGE_YEARS + ' years ago';
      if (null != minAge) {
        const a = calcAge(s);
        if (null != a && a < minAge) return (label || 'Person') + ' must be at least ' + minAge + ' years old';
      }
      return null;
    }
    function constrainDateInputs() {
      const n = new Date(),
        today = n.toISOString().slice(0, 10),
        minDob = new Date(n.getFullYear() - MAX_AGE_YEARS, n.getMonth(), n.getDate()).toISOString().slice(0, 10);
      $$('input[type="date"]').forEach((i) => {
        (i.hasAttribute('max') || i.setAttribute('max', today), i.hasAttribute('min') || i.setAttribute('min', minDob));
      });
    }
    function convertCountryFields() {
      const optionsHtml = '<option value="">Select a country</option>' + COUNTRIES.map((c) => '<option value="' + c + '">' + c + '</option>').join('');
      $$('input[name*="nationality"],select[name*="nationality"],input[name*="country"],select[name*="country"],input[name$="_pob"],input[name$="_pob_b"],select[name$="_pob"],select[name$="_pob_b"]').forEach((el) => {
        if ('SELECT' === el.tagName) return void (el.dataset.swPopulated || ((el.innerHTML = optionsHtml), (el.dataset.swPopulated = '1')));
        const sel = document.createElement('select');
        (Array.from(el.attributes).forEach((a) => sel.setAttribute(a.name, a.value)), el.classList.length && (sel.className = el.className), (sel.innerHTML = optionsHtml), (sel.dataset.swPopulated = '1'), el.value && (sel.value = el.value), el.parentNode.replaceChild(sel, el));
      });
    }
    function prefillUaePhones() {
      $$('input[name*="phone"],input[name*="mobile"]').forEach((el) => {
        'hidden' !== el.type && ((el.value && el.value.trim()) || (el.value = '+971 '));
      });
    }
    const COUPLES_MODE_ENABLED = !0;
    function isCouplesMode() {
      return COUPLES_MODE_ENABLED && 'couples' === getPackage();
    }
    const COUPLES_ORDER = [1, 9, 2, 3, 4, 5, 6, 7, 8];
    const COUPLES_TOTAL = 9;
    const MIRROR_RADIOS = ['q7_marital', 'q8_residency', 'q12_prior_will', 'q13_revocation', 'q14_scope', 'q15_executor_count', 'q17_has_substitute', 'q19_disposition', 'q20_location_pref', 'q21_directions_pref', 'q22_beneficiary_count', 'q24_has_secondary', 'q26_has_bequests', 'q28_has_minors', 'q30_has_perm_guardian', 'q32_has_sub_perm', 'q34_has_interim', 'q36_has_sub_interim', 'q38_additional'];
    const MIRROR_TEXT = ['q9_address', 'q11_marriage_country', 'q14_excluded_jurisdictions', 'q19_other_disposition', 'q20_location_details', 'q21_directions_details', 'q38_additional_details'];
    function mirrorAtoB() {
      if (!isCouplesMode()) return;
      MIRROR_TEXT.forEach(function (n) {
        const a = $('[name="' + n + '"]'),
          b = $('[name="' + n + '_b"]');
        if (a && b && 'file' !== a.type && b.value !== a.value) b.value = a.value;
      });
      MIRROR_RADIOS.forEach(function (n) {
        const v = getRadioValue(n);
        if (null !== v) setRadioValue(n + '_b', v);
      });
    }
    function stepName(n) {
      return 9 === n ? 'Spouse Details' : STEP_NAMES[n] || 'Part ' + n + ' of ' + TOTAL_STEPS;
    }
    function getUploadCfg(name) {
      if (!name) return null;
      for (const c of UPLOAD_MAP) {
        const m = name.match(c[0]);
        if (m) {
          let n = c[1];
          for (let i = 1; i < m.length; i++) n = n.replace('$' + i, m[i]);
          return { name: n, label: c[2] };
        }
      }
      return null;
    }
    function validateFile(inp) {
      const w = inp.closest('.sw-q-upload-field') || inp.closest('.sw-q-field');
      if (w) {
        const e = w.querySelector('.sw-q-field-error');
        e && e.remove();
      }
      if ((inp.classList.remove('sw-q-invalid'), !inp.files || !inp.files.length)) return !0;
      const f = inp.files[0];
      return f.size > 1048576 * MAX_FILE_MB ? (inp.classList.add('sw-q-invalid'), addErrorToWrap(w, 'File too large. Max ' + MAX_FILE_MB + 'MB.'), (inp.value = ''), !1) : -1 !== FILE_TYPES.indexOf(f.type) || (inp.classList.add('sw-q-invalid'), addErrorToWrap(w, 'Only PDF or image (JPG/PNG/WebP/HEIC) allowed.'), (inp.value = ''), !1);
    }
    function injectUploadAfter(passportInp) {
      const cfg = getUploadCfg(passportInp.getAttribute('name'));
      if (!cfg) return;
      const par = passportInp.parentNode;
      if (!par) return;
      if (!isCouplesMode() && 'b' === passportInp.getAttribute('data-testator')) return;
      if (!isVisible(passportInp)) return;
      // Remove any pre-existing upload field for this exact file name (prevents duplicates after clone/renumber/reuse).
      $$('.sw-q-upload-field', par).forEach(function (w) {
        var fi = w.querySelector('input[type="file"]');
        if (fi && fi.getAttribute('name') === cfg.name) w.remove();
      });
      if (par.querySelector(':scope > .sw-q-upload-field[data-for="' + cfg.name + '"]')) return;
      const w = document.createElement('div');
      ((w.className = 'sw-q-upload-field'), w.setAttribute('data-for', cfg.name));
      const t = passportInp.getAttribute('data-testator');
      t && w.setAttribute('data-testator', t);
      const l = document.createElement('div');
      ((l.className = 'sw-q-label'), (l.textContent = cfg.label));
      const f = document.createElement('input');
      ((f.type = 'file'),
        (f.name = cfg.name),
        (f.className = 'sw-q-input sw-q-file-input'),
        (f.accept = FILE_TYPES),
        (f.required = !0),
        t && f.setAttribute('data-testator', t),
        f.addEventListener('change', function () {
          validateFile(f);
        }),
        w.appendChild(l),
        w.appendChild(f),
        par.insertBefore(w, passportInp.nextSibling));
    }
    function removeOrphanedUploads() {
      $$('.sw-q-upload-field').forEach((w) => {
        const fi = w.querySelector('input[type="file"]');
        fi && (isCouplesMode() || 'b' !== fi.getAttribute('data-testator') || w.remove());
      });
    }
    function injectAllUploads() {
      (removeOrphanedUploads(),
        $$('input[type="text"]').forEach((i) => {
          getUploadCfg(i.getAttribute('name')) && injectUploadAfter(i);
        }),
        $$('[data-block="bequest"]').forEach((b) => {
          const idx = b.dataset.blockIndex || '1',
            tR = $$('input[type="radio"][name="bequest_' + idx + '_type"]', b),
            m = ['percentage', 'cash', 'asset', 'other'],
            cI = tR.findIndex((r) => r.checked),
            tV = cI >= 0 ? m[cI] : null,
            ex = b.querySelector(':scope > .sw-q-upload-field[data-for^="bequest_"]');
          if ('asset' === tV) {
            if (ex) return;
            const w = document.createElement('div');
            ((w.className = 'sw-q-upload-field'), w.setAttribute('data-for', 'bequest_' + idx + '_file'));
            const l = document.createElement('div');
            ((l.className = 'sw-q-label'), (l.textContent = 'Upload supporting document (PDF/image, max 10MB)'));
            const f = document.createElement('input');
            ((f.type = 'file'),
              (f.name = 'bequest_' + idx + '_file'),
              (f.className = 'sw-q-input sw-q-file-input'),
              (f.accept = FILE_TYPES),
              (f.required = !0),
              f.addEventListener('change', function () {
                validateFile(f);
              }),
              w.appendChild(l),
              w.appendChild(f),
              b.appendChild(w));
          } else ex && ex.remove();
        }));
    }
    function getEidUploadLabel(eidName) {
      const sfx = ' Emirates ID (PDF/image, max 10MB)';
      return 'Upload' + (eidName.includes('executor') ? ' executor' : eidName.startsWith('perm_guardian') || eidName.startsWith('sub_perm') ? ' guardian' : eidName.startsWith('interim') || eidName.startsWith('sub_interim') ? ' interim guardian' : eidName.includes('primary_ben') || eidName.includes('secondary_ben') ? ' beneficiary' : eidName.includes('child') ? ' child' : '') + sfx;
    }
    function injectEidUploadAfter(eidInp) {
      const eidName = eidInp.getAttribute('name');
      if (!eidName) return;
      const fileName = eidName + '_file',
        par = eidInp.parentNode;
      if (!par) return;
      if (!isCouplesMode() && 'b' === eidInp.getAttribute('data-testator')) return;
      if (!isVisible(eidInp)) return;
      const ex = par.querySelector('.sw-q-upload-field[data-for="' + fileName + '"]'),
        hasValue = eidInp.value && eidInp.value.trim().length > 0;
      if (hasValue) {
        // Remove any pre-existing upload field for this exact file name (prevents duplicates after clone/renumber/reuse).
        $$('.sw-q-upload-field', par).forEach(function (w) {
          var fi = w.querySelector('input[type="file"]');
          if (fi && fi.getAttribute('name') === fileName) w.remove();
        });
        const w = document.createElement('div');
        ((w.className = 'sw-q-upload-field'), w.setAttribute('data-for', fileName));
        const t = eidInp.getAttribute('data-testator');
        t && w.setAttribute('data-testator', t);
        const l = document.createElement('div');
        ((l.className = 'sw-q-label'), (l.textContent = getEidUploadLabel(eidName)));
        const f = document.createElement('input');
        ((f.type = 'file'),
          (f.name = fileName),
          (f.className = 'sw-q-input sw-q-file-input'),
          (f.accept = FILE_TYPES),
          t && f.setAttribute('data-testator', t),
          f.addEventListener('change', function () {
            validateFile(f);
          }),
          w.appendChild(l),
          w.appendChild(f),
          par.insertBefore(w, eidInp.nextSibling));
      } else ex && ex.remove();
    }
    function injectAllEidUploads() {
      $$('input[name$="_emirates_id"],input[name$="_emirates_id_b"]').forEach((i) => injectEidUploadAfter(i));
    }
    function wireEidUploadListeners() {
      $$('input[name$="_emirates_id"],input[name$="_emirates_id_b"]').forEach((i) => {
        i.dataset.swEidWired ||
          ((i.dataset.swEidWired = '1'),
          i.addEventListener('input', function () {
            injectEidUploadAfter(i);
          }));
      });
    }
    function injectCouplesStyles() {
      if (document.getElementById('sw-couples-q-styles')) return;
      const s = document.createElement('style');
      ((s.id = 'sw-couples-q-styles'), (s.textContent = `body:not(.sw-couples-mode) .sw-q-a-label,body:not(.sw-couples-mode) .sw-q-b-label,body:not(.sw-couples-mode) .sw-q-b-wrap,body:not(.sw-couples-mode) .sw-q-input-b,body:not(.sw-couples-mode) .sw-q-textarea-b,body:not(.sw-couples-mode) [data-testator="b"],body:not(.sw-couples-mode) [data-q-mirror="b"],body:not(.sw-couples-mode) .sw-q-radio-row:has(input[data-testator="b"]){display:none!important}\n[data-q-mirror="a"]{display:block}\nbody.sw-couples-mode [data-q-mirror="b"]:not([data-step="9"] [data-q-mirror="b"]){display:none!important}\nbody:not(.sw-couples-mode) .sw-couples-only{display:none!important}`), document.head.appendChild(s));
    }
    function tagBSideFields() {
      $$('input,textarea,select').forEach((el) => {
        if ('b' === el.getAttribute('data-testator') && (el.classList.contains('sw-q-input-b') || el.classList.add('sw-q-input-b'), ('INPUT' === el.tagName && 'radio' !== el.type && 'checkbox' !== el.type && 'file' !== el.type) || 'TEXTAREA' === el.tagName ? el.classList.contains('w-input') || el.classList.add('w-input') : 'SELECT' === el.tagName && (el.classList.contains('w-select') || el.classList.add('w-select')), 'radio' === el.type || 'checkbox' === el.type)) {
          const wfLabel = el.closest('label.w-radio,label.w-checkbox,.sw-q-radio-row');
          wfLabel && !wfLabel.classList.contains('sw-q-b-wrap') && wfLabel.classList.add('sw-q-b-wrap');
        }
      });
    }
    function wireCouplesMode() {
      (injectCouplesStyles(), tagBSideFields(), isCouplesMode() && document.body.classList.add('sw-couples-mode'));
    }
    function getRadioValue(name) {
      const i = $$('input[type="radio"][name="' + name + '"]');
      if (!i.length) return null;
      const c = i.findIndex((r) => r.checked);
      if (-1 === c) return null;
      const m = RADIO_OPTIONS[name];
      return m ? m[c] || null : String(c);
    }
    function setRadioValue(name, v) {
      const i = $$('input[type="radio"][name="' + name + '"]'),
        m = RADIO_OPTIONS[name];
      if (!m) return;
      const x = m.indexOf(v);
      x < 0 || x >= i.length || (i[x].checked = !0);
    }
    function injectStyles() {
      if (document.getElementById('sw-q-runtime-styles')) return;
      const s = document.createElement('style');
      ((s.id = 'sw-q-runtime-styles'), (s.textContent = `.sw-q-radio-row.sw-q-radio-checked{border:2px solid #1e4381!important;background-color:#eff4f8!important;padding:9px 13px!important}\n.sw-q-radio-row.sw-q-radio-checked>span{font-weight:600!important;color:#121f2f!important}\n.sw-q-invalid{border-color:#c0392b!important;background-color:#fdf2f0!important}\n.sw-q-field-error{color:#c0392b;font-size:12px;margin-top:6px;font-weight:600}\n.sw-q-error-banner{background:#fdf2f0;border:1px solid #c0392b;color:#c0392b;padding:14px 18px;border-radius:6px;margin-bottom:20px;font-size:13px;font-weight:600;line-height:1.5}\n.sw-q-block-remove{margin-top:12px;background:transparent;border:1px solid rgba(192,57,43,.3);color:#c0392b;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-radius:4px;cursor:pointer}\n.sw-q-block-remove:hover{background:#fdf2f0}\n[data-add-block].sw-q-add-disabled{opacity:.4!important;pointer-events:none!important}\n.sw-q-excl-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}\n.sw-q-excl-tag{display:inline-flex;align-items:center;gap:8px;background:#eff4f8;border:1px solid #1e4381;color:#121f2f;border-radius:16px;padding:5px 6px 5px 12px;font-size:13px;font-weight:600;line-height:1}\n.sw-q-excl-tag-x{border:none;background:transparent;color:#1e4381;font-size:16px;font-weight:700;line-height:1;cursor:pointer;padding:0 4px}\n.sw-q-excl-tag-x:hover{color:#c0392b}\n.sw-q-uploaded-state{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:13px;color:#1e4381;font-weight:600;line-height:1.4}\n.sw-q-uploaded-state-icon{color:#27ae60;font-size:15px}\n.sw-q-uploaded-state-view{color:#1e4381;font-size:12px;text-decoration:underline}\n.sw-q-uploaded-state-remove{background:transparent;border:none;color:#c0392b;font-size:12px;text-decoration:underline;cursor:pointer;padding:0;font-family:inherit}\n.sw-q-uploaded-state-remove:hover{color:#922b21}\n.sw-q-locked{background-color:#f2f4f7!important;color:#5b6673!important;cursor:not-allowed!important;pointer-events:none}\n.sw-q-reuse-notice{background:#eff4f8;border:1px solid #1e4381;border-radius:8px;padding:12px 16px;margin:55px 0 16px;font-size:13px;line-height:1.5;color:#121f2f}\n.sw-q-reuse-notice-title{font-weight:700;color:#1e4381;display:block;margin-bottom:4px}\n.sw-q-reuse-notice-sub{display:block;margin-bottom:10px}\n.sw-q-reuse-notice-btn{background:#1e4381;border:none;color:#fff;font-size:12px;font-weight:700;letter-spacing:.04em;padding:8px 14px;border-radius:4px;cursor:pointer;font-family:inherit}\n.sw-q-reuse-notice-btn:hover{background:#152f5c}\n.sw-q-reuse-highlight{outline:3px solid #1e4381!important;outline-offset:3px;transition:outline .2s}`), document.head.appendChild(s));
    }
    function updateRadioStates() {
      $$('.sw-q-radio-row').forEach((r) => {
        const i = r.querySelector('input[type="radio"],input[type="checkbox"]');
        i && i.checked ? r.classList.add('sw-q-radio-checked') : r.classList.remove('sw-q-radio-checked');
      });
    }
    function showStep(n) {
      const max = isCouplesMode() ? COUPLES_TOTAL : TOTAL_STEPS;
      if (n < 1 || n > max) return;
      if (9 === n && !isCouplesMode()) return;
      ($$('[data-step]').forEach((el) => {
        el.classList.toggle('sw-q-step-active', parseInt(el.dataset.step) === n);
      }),
        (currentStep = n),
        updateProgress(),
        updateStepIndicator(),
        updateNavButtons(),
        clearAllErrors(),
        applyConditionals(),
        injectAllUploads(),
        injectAllEidUploads(),
        wireEidUploadListeners(),
        rebuildPersonDropdowns(),
        injectExcludedJurisdictionPickers(),
        swReapplyReuseLocks(),
        swRenderUploadedState(),
        updateShareTotal(),
        window.scrollTo({ top: 0, behavior: 'smooth' }),
        window._sw_init_done && saveDraft());
    }
    function updateProgress() {
      const f = $('[data-progress-fill]');
      if (f) {
        let p;
        if (isCouplesMode()) {
          const idx = COUPLES_ORDER.indexOf(currentStep);
          p = ((idx < 0 ? currentStep : idx + 1) / COUPLES_ORDER.length) * 100 + '%';
        } else {
          p = (currentStep / TOTAL_STEPS) * 100 + '%';
        }
        (f.style.setProperty('width', p, 'important'), f.style.setProperty('display', 'block', 'important'), f.style.setProperty('height', '100%', 'important'));
      }
    }
    function updateStepIndicator() {
      const i = $('[data-step-indicator]');
      i && (i.textContent = isCouplesMode() ? stepName(currentStep) : STEP_NAMES[currentStep] || 'Part ' + currentStep + ' of ' + TOTAL_STEPS);
    }
    function updateNavButtons() {
      const b = $('[data-q-back]'),
        n = $('[data-q-next]');
      (b && (b.style.visibility = currentStep > 1 ? 'visible' : 'hidden'), n && (n.textContent = currentStep === TOTAL_STEPS ? 'Submit →' : 'Continue →'));
    }
    function nextStep() {
      if (!validateCurrentStep()) return;
      if (isCouplesMode()) mirrorAtoB();
      if (currentStep === TOTAL_STEPS) return void submitForm();
      let t;
      if (isCouplesMode()) {
        const i = COUPLES_ORDER.indexOf(currentStep),
          n = i < 0 ? currentStep + 1 : COUPLES_ORDER[i + 1];
        t = n;
        7 !== t || shouldShowGuardianship() || (t = 8);
      } else {
        t = currentStep + 1;
        7 !== t || shouldShowGuardianship() || (t = 8);
      }
      showStep(t);
    }
    function prevStep() {
      let t;
      if (isCouplesMode()) {
        const i = COUPLES_ORDER.indexOf(currentStep);
        t = i <= 0 ? COUPLES_ORDER[0] : COUPLES_ORDER[i - 1];
        7 !== t || shouldShowGuardianship() || (t = 6);
      } else {
        t = currentStep - 1;
        7 !== t || shouldShowGuardianship() || (t = 6);
      }
      (t < 1 && (t = 1), showStep(t));
    }
    function shouldShowGuardianship() {
      // Always show Part G (step 7). The q28_has_minors radio inside
      // step 7 drives whether the guardianship sub-questions appear.
      return true;
    }
    function clearAllErrors() {
      ($$('.sw-q-invalid').forEach((e) => e.classList.remove('sw-q-invalid')), $$('.sw-q-field-error').forEach((e) => e.remove()), $$('.sw-q-error-banner').forEach((e) => e.remove()));
    }
    function addErrorToWrap(wrap, msg) {
      if (wrap && !wrap.querySelector('.sw-q-field-error')) {
        const e = document.createElement('div');
        ((e.className = 'sw-q-field-error'), (e.textContent = msg), wrap.appendChild(e));
      }
    }
    function markFieldError(field, message) {
      (field.classList.add('sw-q-invalid'), addErrorToWrap(field.closest('.sw-q-field'), message || 'This field is required'));
    }
    function showErrorBanner(message) {
      const s = $('[data-step="' + currentStep + '"]');
      if (!s) return;
      const b = document.createElement('div');
      ((b.className = 'sw-q-error-banner'), (b.textContent = message), s.insertBefore(b, s.firstChild.nextSibling));
    }
    function getTestatorIdentities() {
      const g = (n) => (($('input[name="' + n + '"]') || {}).value || '').trim();
      return { a: { name: g('q1_full_name').toLowerCase(), passport: g('q5_passport').toUpperCase() }, b: { name: g('q1_full_name_b').toLowerCase(), passport: g('q5_passport_b').toUpperCase() } };
    }
    function matchesTestator(name, passport) {
      if (isCouplesMode()) return null;
      const ids = getTestatorIdentities(),
        n = (name || '').trim().toLowerCase(),
        p = (passport || '').trim().toUpperCase();
      if (n && ids.a.name && n === ids.a.name) return { t: 'a', field: 'name' };
      if (p && ids.a.passport && p === ids.a.passport) return { t: 'a', field: 'passport' };
      return null;
    }
    function markRadioGroupInvalid(name, stepEl, errMsg, wrapSel) {
      $$('input[name="' + name + '"]', stepEl).forEach((inp) => {
        const r = inp.closest('.sw-q-radio-row');
        r && r.classList.add('sw-q-invalid');
      });
      const fi = $('input[name="' + name + '"]', stepEl),
        fw = fi ? fi.closest(wrapSel || '.sw-q-field') : null;
      return (addErrorToWrap(fw, errMsg), fi);
    }
    function validateCurrentStep() {
      clearAllErrors();
      const stepEl = $('[data-step="' + currentStep + '"]');
      if (!stepEl) return !0;
      const requiredFields = $$('input[required],textarea[required],select[required]', stepEl)
          .filter((e) => isVisible(e))
          .filter((e) => !OPTIONAL_FIELDS.has(e.name)),
        groups = new Set();
      let firstInvalid = null,
        invalidCount = 0;
      for (const field of requiredFields) {
        let isInvalid = !1;
        if ('radio' === field.type) {
          if (groups.has(field.name)) continue;
          (groups.add(field.name), $('input[name="' + field.name + '"]:checked', stepEl) || ((isInvalid = !0), markRadioGroupInvalid(field.name, stepEl, 'Please choose an option')));
        } else if ('checkbox' === field.type) {
          if (!field.checked) {
            isInvalid = !0;
            const r = field.closest('.sw-q-radio-row');
            (r && r.classList.add('sw-q-invalid'), addErrorToWrap(field.closest('.sw-q-field') || (r && r.closest('.sw-q-field')), 'Please confirm to continue'));
          }
        } else 'file' === field.type ? (field.files && field.files.length) || swUploadedFiles[field.name] || ((isInvalid = !0), markFieldError(field, 'Please upload this document to continue')) : (field.value && field.value.trim()) || ((isInvalid = !0), markFieldError(field, 'This field is required'));
        isInvalid && (invalidCount++, firstInvalid || (firstInvalid = field));
      }
      if (
        ($$('input[type="file"]', stepEl).forEach((f) => {
          isVisible(f) && !validateFile(f) && (invalidCount++, firstInvalid || (firstInvalid = f));
        }),
        isCouplesMode() && 9 !== currentStep)
      ) {
        const bInputs = $$('input[data-testator="b"],textarea[data-testator="b"]', stepEl)
          .filter((e) => isVisible(e) && 'radio' !== e.type && 'checkbox' !== e.type && 'file' !== e.type)
          .filter((e) => !OPTIONAL_FIELDS.has(e.name));
        for (const f of bInputs) {
          if (f.closest('[data-block="executor-b"]')) continue;
          const qN = f.dataset.q,
            aI = $('input[data-q="' + qN + '"][data-testator="a"],textarea[data-q="' + qN + '"][data-testator="a"]', stepEl),
            wR = aI && aI.hasAttribute('required') && !OPTIONAL_FIELDS.has(aI.name);
          !wR || (f.value && f.value.trim()) || (markFieldError(f, 'This field is required for Testator B'), invalidCount++, firstInvalid || (firstInvalid = f));
        }
        const bR = new Set();
        if (
          ($$('input[type="radio"][data-testator="b"]', stepEl).forEach((r) => {
            r.name && isVisible(r) && !OPTIONAL_FIELDS.has(r.name) && bR.add(r.name);
          }),
          bR.forEach((name) => {
            const aN = name.replace(/_b$/, '');
            if (!OPTIONAL_FIELDS.has(aN) && $('input[type="radio"][name="' + aN + '"][required]', stepEl) && !$('input[type="radio"][name="' + name + '"]:checked', stepEl)) {
              const fi = markRadioGroupInvalid(name, stepEl, 'Please choose an option for Testator B', '.sw-q-b-wrap, .sw-q-field');
              (invalidCount++, firstInvalid || (firstInvalid = fi));
            }
          }),
          8 === currentStep)
        ) {
          const bC = $('input[type="checkbox"][name="confirm_accuracy_b"]', stepEl);
          if (bC && isVisible(bC) && !bC.checked) {
            const r = bC.closest('.sw-q-radio-row');
            (r && r.classList.add('sw-q-invalid'), addErrorToWrap(bC.closest('.sw-q-b-wrap, .sw-q-field') || (r && r.closest('.sw-q-b-wrap, .sw-q-field')), 'Testator B must confirm to continue'), invalidCount++, firstInvalid || (firstInvalid = bC));
          }
        }
      }
      const formatChecks = [
        { pattern: /^email/i, regex: EMAIL_REGEX, msg: 'Enter a valid email address' },
        { pattern: /(mobile|phone)/i, regex: PHONE_REGEX, msg: 'Enter international format (e.g. +971501234567)' },
        { pattern: /(emirates_id|^eid|_eid|eid_)/i, regex: EID_REGEX, msg: 'Enter Emirates ID in format 784-YYYY-NNNNNNN-N' },
        { pattern: /passport/i, regex: PASSPORT_REGEX, msg: 'Passport must be at least 6 alphanumeric characters' },
      ];
      ($$('input[type="text"],input[type="email"],input[type="tel"]', stepEl).forEach((f) => {
        if (!f.name || !isVisible(f)) return;
        const v = (f.value || '').trim();
        if (v)
          for (const c of formatChecks)
            if (c.pattern.test(f.name) && !c.regex.test(v)) {
              (markFieldError(f, c.msg), invalidCount++, firstInvalid || (firstInvalid = f));
              break;
            }
      }),
        $$('input[type="date"],input[name*="dob"]', stepEl).forEach((f) => {
          if (!f.name || !isVisible(f) || !f.value) return;
          let minAge = null,
            label = 'Person',
            soft = !1;
          /^q3_dob/.test(f.name) ? ((minAge = getRequiredTestatorAge()), (label = f.name.endsWith('_b') ? 'Testator B' : 'Testator A')) : /exec/i.test(f.name) ? ((minAge = MIN_EXECUTOR_AGE), (label = 'Executor'), (soft = !0)) : /guardian|sub_perm|interim/i.test(f.name) && ((minAge = MIN_GUARDIAN_AGE), (label = 'Guardian'), (soft = !0));
          if (soft && null != minAge) {
            const a = calcAge(f.value);
            const w = f.closest('.sw-q-field') || f.parentNode;
            let ack = w.querySelector('.sw-q-minor-ack');
            if (null != a && a < minAge) {
              if (!ack) {
                ack = document.createElement('label');
                ack.className = 'sw-q-minor-ack';
                ack.style.cssText = 'display:block;margin-top:8px;color:#c0392b;font-size:13px;font-weight:600;line-height:1.4;cursor:pointer';
                const cb = document.createElement('input');
                cb.type = 'checkbox';
                cb.className = 'sw-q-minor-ack-cb';
                cb.style.marginRight = '8px';
                const sp = document.createElement('span');
                sp.textContent = 'Warning: The person you have nominated is under the age of majority (18). Their legal capacity to act as executor, guardian or custodian will generally be assessed when the nomination takes effect, rather than when it is made. However, the relevant authority may decline to notarise the Will on this basis. You may proceed if the nomination is intentional. I confirm I wish to continue.';
                ack.appendChild(cb);
                ack.appendChild(sp);
                w.appendChild(ack);
              }
              const cb = ack.querySelector('.sw-q-minor-ack-cb');
              if (!cb.checked) {
                f.classList.add('sw-q-invalid');
                (invalidCount++, firstInvalid || (firstInvalid = f));
              }
              return;
            } else {
              ack && ack.remove();
            }
          }
          const er = validateDOB(f.value, minAge, label);
          er && (markFieldError(f, er), invalidCount++, firstInvalid || (firstInvalid = f));
        }));
      const personBlocks = $$('[data-block="executor"],[data-block="executor-b"],[data-block="substitute_executor"],[data-block="primary_beneficiary"],[data-block="secondary_beneficiary"],[data-block="guardian"],[data-block="sub_guardian"],[data-block="interim_guardian"],[data-block="sub_interim_guardian"]', stepEl);
      function findDuplicates(sel, label) {
        const blocks = $$(sel, stepEl),
          seen = {};
        blocks.forEach((b) => {
          const n = ($('input[name*="name"]:not([name*="confirm"])', b) || {}).value || '',
            p = ($('input[name*="passport"]:not([type="file"])', b) || {}).value || '';
          if (!n && !p) return;
          const key = n.trim().toLowerCase() + '|' + p.trim().toUpperCase();
          if ('|' !== key)
            if (seen[key]) {
              const t = $('input[name*="name"]:not([name*="confirm"])', b) || $('input', b);
              t && (markFieldError(t, 'Duplicate ' + label + ' detected'), invalidCount++, firstInvalid || (firstInvalid = t));
            } else seen[key] = !0;
        });
      }
      if (
        (personBlocks.forEach((block) => {
          const nF = $('input[name*="name"]:not([name*="confirm"])', block),
            pF = $('input[name*="passport"]:not([type="file"])', block),
            n = nF ? nF.value : '',
            p = pF ? pF.value : '';
          if (!n && !p) return;
          const m = matchesTestator(n, p);
          if (m) {
            const t = 'passport' === m.field ? pF || nF : nF || pF,
              role = block.dataset.block.replace(/_/g, ' ').replace('-b', ' (B)');
            (markFieldError(t, 'This ' + role + '’s ' + m.field + ' matches Testator ' + m.t.toUpperCase() + '.'), invalidCount++, firstInvalid || (firstInvalid = t));
          }
        }),
        4 === currentStep && (findDuplicates('[data-block="executor"]', 'executor'), findDuplicates('[data-block="executor-b"]', 'Testator B executor'), findDuplicates('[data-block="sub-executor"]', 'substitute executor')),
        6 === currentStep && (findDuplicates('[data-block="primary-beneficiary"]', 'beneficiary'), findDuplicates('[data-block="secondary-beneficiary"]', 'secondary beneficiary')),
        6 === currentStep)
      ) {
        const sE = validateBeneficiaryShares();
        if (sE) return (showErrorBanner(sE), !1);
        if ('multiple' === getRadioValue('q22_beneficiary_count')) {
          const bens = $$('[data-block="primary-beneficiary"]', stepEl).filter((b) => {
            const n = ($('input[name*="name"]:not([name*="confirm"])', b) || {}).value || '';
            return n.trim();
          });
          if (bens.length < 1) return (showErrorBanner('At least one beneficiary is required when "Multiple beneficiaries" is selected'), !1);
        }
      }
      if (8 === currentStep && 0 === invalidCount) {
        const fn = ($('input[name="q1_full_name"]') || {}).value || '',
          rt = ($('input[name="confirm_name"]') || {}).value || '';
        if (fn.trim().toLowerCase() !== rt.trim().toLowerCase()) {
          const rF = $('input[name="confirm_name"]');
          return (rF && markFieldError(rF, 'Must match your legal name from Part A'), showErrorBanner('Retyped name does not match Part A.'), !1);
        }
      }
      // ── Conditional-required rules ──────────────────────────────────────
      // Each rule only fires on the step where the fields live, and only
      // when the controlling condition is met AND the field is visible.
      // Fields in OPTIONAL_FIELDS are intentionally left there (they default
      // to optional); these rules explicitly enforce them when revealed.
      // Helper: require a text/select field by name when visible + empty.
      const swRequireField = (name, msg) => {
        const f = $('[name="' + name + '"]', stepEl);
        if (f && isVisible(f) && !(f.value && f.value.trim())) {
          markFieldError(f, msg || 'This field is required');
          invalidCount++;
          firstInvalid || (firstInvalid = f);
        }
      };
      // Helper: require a radio group by name when visible + unchecked.
      const swRequireRadio = (name, msg) => {
        const r = $('input[type="radio"][name="' + name + '"]', stepEl);
        if (r && isVisible(r) && !$('input[type="radio"][name="' + name + '"]:checked', stepEl)) {
          const fi = markRadioGroupInvalid(name, stepEl, msg || 'Please choose an option');
          invalidCount++;
          firstInvalid || (firstInvalid = fi);
        }
      };
      // Step 2 — Prior wills
      if (2 === currentStep) {
        if (getRadioValue('q12_prior_will') && 'no' !== getRadioValue('q12_prior_will')) {
          $$('input[type="text"],textarea,select', stepEl).forEach((f) => {
            const wrap = f.closest('[data-conditional="has-prior-will"]');
            if (wrap && isVisible(f) && !(f.value && f.value.trim())) {
              markFieldError(f, 'This field is required');
              invalidCount++;
              firstInvalid || (firstInvalid = f);
            }
          });
        }
        if (isCouplesMode() && getRadioValue('q12_prior_will_b') && 'no' !== getRadioValue('q12_prior_will_b')) {
          $$('input[type="text"],textarea,select', stepEl).forEach((f) => {
            const wrap = f.closest('[data-conditional="has-prior-will-b"]');
            if (wrap && isVisible(f) && !(f.value && f.value.trim())) {
              markFieldError(f, 'This field is required');
              invalidCount++;
              firstInvalid || (firstInvalid = f);
            }
          });
        }
      }
      // Step 3 — Excluded jurisdictions
      if (3 === currentStep) {
        if ('worldwide-except' === getRadioValue('q14_scope')) {
          const ejf = $('[name="q14_excluded_jurisdictions"]', stepEl);
          if (ejf && !(ejf.value && ejf.value.trim())) {
            markFieldError(ejf, 'Please select at least one jurisdiction to exclude');
            invalidCount++;
            firstInvalid || (firstInvalid = ejf);
          }
        }
        if (isCouplesMode() && 'worldwide-except' === getRadioValue('q14_scope_b')) {
          const ejfb = $('[name="q14_excluded_jurisdictions_b"]', stepEl);
          if (ejfb && !(ejfb.value && ejfb.value.trim())) {
            markFieldError(ejfb, 'Please select at least one jurisdiction to exclude');
            invalidCount++;
            firstInvalid || (firstInvalid = ejfb);
          }
        }
      }
      // Step 5 — Funeral wishes conditionals
      if (5 === currentStep) {
        if ('other' === getRadioValue('q19_disposition'))      swRequireField('q19_other_disposition');
        if ('yes'   === getRadioValue('q20_location_pref'))    swRequireField('q20_location_details');
        if ('yes'   === getRadioValue('q21_directions_pref'))  swRequireField('q21_directions_details');
        if (isCouplesMode()) {
          if ('other' === getRadioValue('q19_disposition_b'))     swRequireField('q19_other_disposition_b');
          if ('yes'   === getRadioValue('q20_location_pref_b'))   swRequireField('q20_location_details_b');
          if ('yes'   === getRadioValue('q21_directions_pref_b')) swRequireField('q21_directions_details_b');
        }
      }
      // Step 7 — Guardian sections
      if (7 === currentStep) {
        // For each guardian section: when "yes" is chosen, require the
        // revealed identity fields that are visible and non-empty.
        const swRequireGuardianFields = (prefix) => {
          ['full_name','relationship','nationality','dob','pob','passport'].forEach((attr) => {
            const name = prefix + '_' + attr;
            const f = $('[name="' + name + '"]', stepEl);
            if (f && isVisible(f) && !(f.value && f.value.trim())) {
              markFieldError(f, 'This field is required');
              invalidCount++;
              firstInvalid || (firstInvalid = f);
            }
          });
        };
        if ('yes' === getRadioValue('q30_has_perm_guardian'))  swRequireGuardianFields('perm_guardian');
        if ('yes' === getRadioValue('q32_has_sub_perm'))       swRequireGuardianFields('sub_perm');
        if ('yes' === getRadioValue('q34_has_interim'))        swRequireGuardianFields('interim');
        if ('yes' === getRadioValue('q36_has_sub_interim'))    swRequireGuardianFields('sub_interim');
      }
      // Step 8 — Additional wishes + incapacity directives
      if (8 === currentStep) {
        // Additional wishes
        if ('yes' === getRadioValue('q38_additional'))   swRequireField('q38_additional_details');
        if (isCouplesMode() && 'yes' === getRadioValue('q38_additional_b')) swRequireField('q38_additional_details_b');
        // Incapacity (Gold/Couples/Platinum — section hidden on Silver via data-incap-section)
        swRequireRadio('q39_incapacity');
        if ('0' === getRadioValue('q39_incapacity')) {
          swRequireRadio('q40_incap_guardian_choice');
          swRequireRadio('q41_endoflife');
          if ('1' === getRadioValue('q40_incap_guardian_choice')) {
            ['q40_incap_guardian_name','q40_incap_guardian_rel','q40_incap_guardian_nat','q40_incap_guardian_dob','q40_incap_guardian_passport'].forEach((n) => swRequireField(n));
          }
        }
      }
      // ── End conditional-required rules ──────────────────────────────────
      if (firstInvalid) {
        showErrorBanner(invalidCount + ' ' + (1 === invalidCount ? 'field needs' : 'fields need') + ' your attention. Please review the highlighted ' + (1 === invalidCount ? 'field' : 'fields') + ' below.');
        const t = firstInvalid.closest('.sw-q-field, .sw-q-b-wrap') || firstInvalid;
        t.scrollIntoView({ behavior: 'smooth', block: 'center' });
        try {
          firstInvalid.focus({ preventScroll: !0 });
        } catch (e) {}
        return !1;
      }
      return !0;
    }
    function parseShareValue(v) {
      if (((v = (v || '').trim()), !v)) return null;
      if ('all' === v.toLowerCase()) return 100;
      if (/^\d+(\.\d+)?%?$/.test(v)) return parseFloat(v.replace('%', ''));
      if (/^\d+(\.\d+)?\s*\/\s*\d+(\.\d+)?$/.test(v)) {
        const p = v.split('/'),
          a = parseFloat(p[0]),
          d = parseFloat(p[1]);
        if (d > 0) return (a / d) * 100;
      }
      return NaN;
    }
    function validateBeneficiaryShares() {
      const allShareInputs = $$('input[name^="primary_ben_"][name$="_share"], input[name^="secondary_ben_"][name$="_share"]').filter((e) => isVisible(e));
      let formatErrors = [];
      if (
        (allShareInputs.forEach((input) => {
          if ((input.classList.remove('sw-q-invalid'), !input.value.trim())) return;
          const num = parseShareValue(input.value);
          (isNaN(num) || (null !== num && num < 0)) && (input.classList.add('sw-q-invalid'), formatErrors.push(input.value));
        }),
        formatErrors.length > 0)
      )
        return 'Invalid share value: "' + formatErrors[0] + '". Use 50, 50%, 1/3 or "all".';
      function checkGroup(prefix, label) {
        const all = $$('input[name^="' + prefix + '"][name$="_share"]').filter((e) => isVisible(e));
        if (!all.length) return null;
        const empty = all.filter((e) => !e.value.trim());
        if (empty.length > 0) return (empty.forEach((i) => i.classList.add('sw-q-invalid')), 'Please enter a share of estate for every ' + label + '. Use 50, 50%, 1/3 or "all".');
        const filled = all.filter((e) => e.value.trim());
        if (!filled.length) return null;
        let total = 0;
        for (const input of filled) {
          const num = parseShareValue(input.value);
          null === num || isNaN(num) || (total += num);
        }
        return Math.abs(total - 100) > 0.5 ? (filled.forEach((i) => i.classList.add('sw-q-invalid')), label.charAt(0).toUpperCase() + label.slice(1) + ' shares must total 100% (currently ' + total.toFixed(1) + '%). Use numbers (50), percentages (50%), fractions (1/3), or "all".') : null;
      }
      const pE = checkGroup('primary_ben_', 'beneficiary');
      if (pE) return pE;
      if ('yes' === getRadioValue('q24_has_secondary')) {
        const sE = checkGroup('secondary_ben_', 'secondary beneficiary');
        if (sE) return sE;
      }
      return null;
    }
    function updateShareTotal() {
      if (($$('.sw-q-share-total').forEach((e) => e.remove()), 6 !== currentStep)) return;
      if ('multiple' !== getRadioValue('q22_beneficiary_count')) return;
      const sI = $$('input[name^="primary_ben_"][name$="_share"]').filter((e) => isVisible(e));
      if (sI.length < 2) return;
      let total = 0;
      for (const input of sI) {
        const num = parseShareValue(input.value);
        null === num || isNaN(num) || (total += num);
      }
      const last = sI[sI.length - 1],
        c = last.closest('[data-block-list="primary_beneficiary"]') || last.closest('.sw-q-field') || last.parentElement;
      if (!c) return;
      const t = document.createElement('div');
      ((t.className = 'sw-q-share-total'), Math.abs(total - 100) <= 0.5 ? (t.classList.add('sw-q-share-ok'), (t.textContent = '✓ Shares total 100%')) : total > 100 ? (t.classList.add('sw-q-share-over'), (t.textContent = 'Shares total ' + total.toFixed(1) + '% (over by ' + (total - 100).toFixed(1) + '%)')) : (t.textContent = 'Shares total ' + total.toFixed(1) + '% — need ' + (100 - total).toFixed(1) + '% more'), c.appendChild(t));
    }
    function isVisible(el) {
      for (; el && el !== document.body; ) {
        const s = window.getComputedStyle(el);
        if ('none' === s.display || 'hidden' === s.visibility) return !1;
        el = el.parentElement;
      }
      return !0;
    }
    function applyConditionals() {
      showHide('[data-conditional="muslim-only"]', 'muslim' === getRadioValue('q10_religion'));
      const qB = $$('input[type="checkbox"][name^="q11_criterion"][data-testator="a"]');
      showHide('[data-conditional="marriage-civil"]', qB.length >= 2 && qB[1] && qB[1].checked);
      const q12 = getRadioValue('q12_prior_will');
      if (
        (showHide('[data-conditional="has-prior-will"]', q12 && 'no' !== q12),
        showHide('[data-conditional="scope-except"]', 'worldwide-except' === getRadioValue('q14_scope')),
        showHide('[data-conditional="joint-executor"]', 'joint' === getRadioValue('q15_executor_count')),
        showHide('[data-conditional="couples-only-execs"]', false),
        showHide('[data-conditional="has-substitute"]', 'yes' === getRadioValue('q17_has_substitute')),
        showHide('[data-conditional="disposition-other"]', 'other' === getRadioValue('q19_disposition')),
        showHide('[data-conditional="location-yes"]', 'yes' === getRadioValue('q20_location_pref')),
        showHide('[data-conditional="incap-yes"]', '0' === getRadioValue('q39_incapacity')),
        showHide('[data-conditional="incap-guardian-other"]', '0' === getRadioValue('q39_incapacity') && '1' === getRadioValue('q40_incap_guardian_choice')),
        showHide('[data-conditional="directions-yes"]', 'yes' === getRadioValue('q21_directions_pref')),
        showHide('[data-conditional="multiple-beneficiaries"]', 'multiple' === getRadioValue('q22_beneficiary_count')),
        showHide('[data-conditional="has-secondary"]', 'yes' === getRadioValue('q24_has_secondary')),
        showHide('[data-conditional="has-bequests"]', 'yes' === getRadioValue('q26_has_bequests')),
        $$('[data-block="bequest"]').forEach((b) => {
          const idx = b.dataset.blockIndex || '1',
            tR = $$('input[type="radio"][name="bequest_' + idx + '_type"]', b),
            m = ['percentage', 'cash', 'asset', 'other'],
            cI = tR.findIndex((r) => r.checked),
            tV = cI >= 0 ? m[cI] : null,
            n = $('[data-conditional="asset-bequest"]', b);
          n && ('asset' === tV ? n.style.setProperty('display', 'block', 'important') : n.style.setProperty('display', 'none', 'important'));
        }),
        showHide('[data-conditional="has-minors"]', 'yes' === getRadioValue('q28_has_minors')),
        showHide('[data-conditional="has-perm-guardian"]', 'yes' === getRadioValue('q30_has_perm_guardian')),
        showHide('[data-conditional="has-sub-perm"]', 'yes' === getRadioValue('q32_has_sub_perm')),
        showHide('[data-conditional="has-interim"]', 'yes' === getRadioValue('q34_has_interim')),
        showHide('[data-conditional="has-sub-interim"]', 'yes' === getRadioValue('q36_has_sub_interim')),
        showHide('[data-conditional="additional-yes"]', 'yes' === getRadioValue('q38_additional')),
        isCouplesMode())
      ) {
        showHide('[data-conditional="muslim-only-b"]', 'muslim' === getRadioValue('q10_religion_b'));
        const qBb = $$('input[type="checkbox"][data-testator="b"][name^="q11_criterion"]');
        showHide('[data-conditional="marriage-civil-b"]', qBb.length >= 2 && qBb[1] && qBb[1].checked);
        const q12b = getRadioValue('q12_prior_will_b');
        (showHide('[data-conditional="has-prior-will-b"]', q12b && 'no' !== q12b), showHide('[data-conditional="scope-except-b"]', 'worldwide-except' === getRadioValue('q14_scope_b')), showHide('[data-conditional="disposition-other-b"]', 'other' === getRadioValue('q19_disposition_b')), showHide('[data-conditional="location-yes-b"]', 'yes' === getRadioValue('q20_location_pref_b')), showHide('[data-conditional="directions-yes-b"]', 'yes' === getRadioValue('q21_directions_pref_b')), showHide('[data-conditional="additional-yes-b"]', 'yes' === getRadioValue('q38_additional_b')));
      } else
        ['muslim-only-b', 'marriage-civil-b', 'has-prior-will-b', 'scope-except-b', 'disposition-other-b', 'location-yes-b', 'directions-yes-b', 'additional-yes-b'].forEach((c) => {
          showHide('[data-conditional="' + c + '"]', !1);
        });
      (updateAddButtonStates(), updateShareTotal(), injectAllUploads(), rebuildPersonDropdowns(), injectExcludedJurisdictionPickers(), swRenderUploadedState());
    }
    function showHide(selector, condition) {
      $$(selector).forEach((el) => {
        condition
          ? (el.style.setProperty('display', 'block', 'important'),
            $$('.inline-div-0, .inline-div-1, .inline-div-2', el).forEach((c) => {
              c.hasAttribute('data-conditional') || c.style.setProperty('display', 'block', 'important');
            }))
          : el.style.setProperty('display', 'none', 'important');
      });
    }
    function updateAddButtonStates() {
      $$('[data-add-block]').forEach((btn) => {
        const bt = btn.dataset.addBlock,
          max = MAX_BLOCKS[bt];
        if (!max) return void btn.classList.remove('sw-q-add-disabled');
        const list = $('[data-block-list="' + bt + '"]'),
          ct = list ? $$('[data-block="' + bt + '"]', list).length : 0;
        ct >= max ? (btn.classList.add('sw-q-add-disabled'), btn.dataset.originalText || (btn.dataset.originalText = btn.textContent), (btn.textContent = btn.dataset.originalText + ' (max ' + max + ')')) : (btn.classList.remove('sw-q-add-disabled'), btn.dataset.originalText && (btn.textContent = btn.dataset.originalText));
      });
    }
    function addBlock(blockType) {
      const list = $('[data-block-list="' + blockType + '"]');
      if (!list) return;
      const existing = $$('[data-block="' + blockType + '"]', list);
      if (!existing.length) return;
      const max = MAX_BLOCKS[blockType];
      if (max && existing.length >= max) return void alert('Maximum of ' + max + ' ' + blockType.replace(/_/g, ' ').replace('-b', ' (Testator B)') + (max > 1 ? 's' : '') + ' allowed.');
      const template = existing[0],
        newIndex = existing.length + 1,
        clone = template.cloneNode(!0);
      clone.dataset.blockIndex = newIndex;
      const title = $('.sw-q-block-title', clone);
      if (
        (title && (title.textContent = title.textContent.replace(/\d+/, newIndex)),
        $$('input,textarea,select', clone).forEach((input) => {
          (input.name && (input.name = input.name.replace(/_\d+_/, '_' + newIndex + '_').replace(/_\d+$/, '_' + newIndex)), 'radio' === input.type || 'checkbox' === input.type ? (input.checked = !1) : (input.value = ''), input.classList.remove('sw-q-invalid'), input.dataset && (delete input.dataset.swPopulated, delete input.dataset.swEidWired));
        }),
        $$('.sw-q-upload-field', clone).forEach((u) => u.remove()),
        $$('.sw-q-person-picker', clone).forEach((u) => u.remove()),
        // Reset any locked-reuse state so the new block starts fresh/editable.
        $$('.sw-q-reuse-notice', clone).forEach((n) => n.remove()),
        clone.removeAttribute('data-reused-from'),
        $$('.sw-q-locked', clone).forEach((el) => el.classList.remove('sw-q-locked')),
        $$('input,select,textarea', clone).forEach((el) => {
          ((el.readOnly = !1), (el._swLockGuard = null), (el._swLockRevert = null), (el._swLockedValue = null));
        }),
        // Clear any inherited state maps for the clone's (new-index) names.
        swPurgeBlockState(clone),
        $$('.sw-q-radio-row', clone).forEach((r) => r.classList.remove('sw-q-radio-checked', 'sw-q-invalid')),
        $$('.sw-q-field-error', clone).forEach((e) => e.remove()),
        !$('.sw-q-block-remove', clone))
      ) {
        const removeBtn = document.createElement('button');
        ((removeBtn.type = 'button'),
          (removeBtn.className = 'sw-q-block-remove'),
          (removeBtn.textContent = '× Remove'),
          removeBtn.addEventListener('click', () => {
            (swPurgeBlockState(clone), clone.remove(), renumberBlocks(blockType), applyConditionals(), saveDraft());
          }),
          clone.appendChild(removeBtn));
      }
      (list.appendChild(clone), convertCountryFields(), prefillUaePhones(), injectAllUploads(), injectAllEidUploads(), wireEidUploadListeners(), updateAddButtonStates(), saveDraft());
    }
    function renumberBlocks(blockType) {
      const list = $('[data-block-list="' + blockType + '"]');
      if (!list) return;
      // Field names are about to change; purge stale reuse/lock/doc markers
      // for every block of this type so a marker can't re-apply to a block
      // that inherits an old name. Genuine reuses re-establish on next
      // rebuildPersonDropdowns / user action.
      $$('[data-block="' + blockType + '"]', list).forEach((block) => swPurgeBlockState(block));
      list &&
        $$('[data-block="' + blockType + '"]', list).forEach((block, i) => {
          const newIdx = i + 1;
          block.dataset.blockIndex = newIdx;
          const title = $('.sw-q-block-title', block);
          (title && (title.textContent = title.textContent.replace(/\d+/, newIdx)),
            $$('input,textarea,select', block).forEach((input) => {
              input.name && (input.name = input.name.replace(/_\d+_/, '_' + newIdx + '_').replace(/_\d+$/, '_' + newIdx));
            }));
        });
    }
    function saveDraft() {
      try {
        const k = getStorageKey();
        if (!k) return;
        const d = collectFormData();
        // Preserve a one-time creation timestamp so the 30-day expiry runs
        // from when the draft was FIRST created, not from each save.
        try {
          const existingRaw = localStorage.getItem(k);
          const existing = existingRaw ? JSON.parse(existingRaw) : null;
          d._createdAt = existing && existing._createdAt ? existing._createdAt : new Date().toISOString();
        } catch (e) {
          d._createdAt = new Date().toISOString();
        }
        ((d._step = currentStep), (d._savedAt = new Date().toISOString()), localStorage.setItem(k, JSON.stringify(d)));
      } catch (e) {}
    }
    function hasRealAnswers(d) {
      if (!d || 'object' != typeof d) return !1;
      for (const k in d) {
        if ('_' === k.charAt(0)) continue;
        const v = d[k];
        if (null != v && !(('string' == typeof v && '' === v.trim()) || (Array.isArray(v) && 0 === v.length))) return !0;
      }
      return !1;
    }
    function checkForDraft() {
      try {
        const k = getStorageKey();
        if (!k) return null;
        const r = localStorage.getItem(k);
        if (!r) return null;
        const d = JSON.parse(r),
          a = d._createdAt ? Date.now() - new Date(d._createdAt).getTime() : 0;
        return a > 30 * 24 * 60 * 60 * 1e3 ? (localStorage.removeItem(k), null) : hasRealAnswers(d) ? d : (localStorage.removeItem(k), null);
      } catch (e) {
        return null;
      }
    }
    function applyDraftData(data) {
      if (!data || 'object' != typeof data) return;
      const blockCounts = {};
      Object.keys(data).forEach((k) => {
        const m = k.match(/^(executor_b|executor|sub_executor|primary_ben|secondary_ben|bequest)_(\d+)_/);
        if (m) {
          const t = m[1],
            n = parseInt(m[2]);
          blockCounts[t] = Math.max(blockCounts[t] || 1, n);
        }
      });
      const blockMap = { executor: 'executor', executor_b: 'executor-b', sub_executor: 'sub-executor', primary_ben: 'primary-beneficiary', secondary_ben: 'secondary-beneficiary', bequest: 'bequest' };
      Object.entries(blockCounts).forEach(([k, n]) => {
        const bt = blockMap[k];
        if (!bt) return;
        const list = $('[data-block-list="' + bt + '"]');
        if (!list) return;
        const have = $$('[data-block="' + bt + '"]', list).length;
        for (let i = have; i < n; i++) addBlock(bt);
      });
      Object.entries(data).forEach(([key, value]) => {
        if (key.startsWith('_')) return;
        if ('case_id' === key || 'submitted_at' === key) return;
        if (RADIO_OPTIONS[key] && 'string' == typeof value) return void setRadioValue(key, value);
        const fields = $$('[name="' + key + '"]');
        fields.length &&
          (Array.isArray(value) && fields.length > 1 && 'checkbox' === fields[0].type
            ? fields.forEach((cb, i) => {
                cb.checked = -1 !== value.indexOf(i);
              })
            : 1 !== fields.length || 'checkbox' !== fields[0].type
              ? fields.length > 1 && 'radio' === fields[0].type
                ? fields.forEach((r) => {
                    r.value === value && (r.checked = !0);
                  })
                : fields.forEach((field) => {
                    'radio' !== field.type && 'checkbox' !== field.type && 'file' !== field.type && (field.value = null == value ? '' : value);
                  })
              : (fields[0].checked = !!value));
      });
      // Restore uploaded-file references BEFORE the UI rebuilds so
      // swRenderUploadedState and validation can use them immediately.
      if (data._uploadedFiles && 'object' == typeof data._uploadedFiles) {
        Object.assign(swUploadedFiles, data._uploadedFiles);
      }
      // Restore reused-block markers so locks + notices can be re-applied.
      if (data._reusedBlocks && 'object' == typeof data._reusedBlocks) {
        Object.assign(swReusedBlocks, data._reusedBlocks);
      }
      requestAnimationFrame(() => {
        (data._step && showStep(data._step),
          updateRadioStates(),
          applyConditionals(),
          rebuildPersonDropdowns(),
          injectExcludedJurisdictionPickers(),
          swReapplyReuseLocks(),
          swRenderUploadedState(),
          requestAnimationFrame(() => {
            (applyConditionals(), rebuildPersonDropdowns(), injectExcludedJurisdictionPickers(), swReapplyReuseLocks(), swRenderUploadedState(), saveDraft());
          }));
      });
    }
    function showResumeBanner(data) {
      const stepEl = $('[data-step="1"]');
      if (!stepEl) return;
      const banner = document.createElement('div');
      ((banner.className = 'sw-q-resume-banner'),
        (banner.innerHTML = '<div><strong>Draft found.</strong> Continue or start fresh? Files not saved.</div><div><button type="button" data-resume-yes>Continue</button><button type="button" data-resume-no>Start fresh</button></div>'),
        stepEl.insertBefore(banner, stepEl.firstChild),
        banner.querySelector('[data-resume-yes]').addEventListener('click', () => {
          (applyDraftData(data), banner.remove());
        }),
        banner.querySelector('[data-resume-no]').addEventListener('click', () => {
          try {
            const k = getStorageKey();
            k && localStorage.removeItem(k);
          } catch (e) {}
          banner.remove();
        }));
    }
    function clearDraft() {
      try {
        const k = getStorageKey();
        k && localStorage.removeItem(k);
      } catch (e) {}
    }
    function collectFormData() {
      const data = {},
        root = $('form') || document,
        radioGroupNames = new Set();
      ($$('input[type="radio"]', root).forEach((r) => {
        r.name && radioGroupNames.add(r.name);
      }),
        radioGroupNames.forEach((name) => {
          const val = getRadioValue(name);
          null !== val && (data[name] = val);
        }),
        $$('input[type="checkbox"]', root).forEach((cb) => {
          if (!cb.name) return;
          const sameName = $$('input[type="checkbox"][name="' + cb.name + '"]', root);
          sameName.length > 1 ? Array.isArray(data[cb.name]) || (data[cb.name] = sameName.reduce((acc, c, i) => (c.checked && acc.push(i), acc), [])) : (data[cb.name] = cb.checked);
        }),
        $$('input,textarea,select', root).forEach((field) => {
          field.name && 'radio' !== field.type && 'checkbox' !== field.type && 'file' !== field.type && (data[field.name] = field.value);
        }),
        isCouplesMode() && (data._couples = !0));
      const pkg = getPackage();
      pkg && (data._package = pkg);
      const ch = getChannel();
      if (Object.keys(swUploadedFiles).length) data._uploadedFiles = swUploadedFiles;
      if (Object.keys(swReusedBlocks).length) data._reusedBlocks = swReusedBlocks;
      return (ch && (data._channel = ch), data);
    }
    async function shrinkImg(f) {
      if (!/^image\//.test(f.type) || f.size < 4e5) return f;
      try {
        const b = await createImageBitmap(f),
          s = Math.min(1, 1600 / Math.max(b.width, b.height)),
          c = document.createElement('canvas');
        ((c.width = (b.width * s) | 0), (c.height = (b.height * s) | 0), c.getContext('2d').drawImage(b, 0, 0, c.width, c.height));
        const l = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.8));
        return l && l.size < f.size ? new File([l], f.name.replace(/\.\w+$/, '.jpg'), { type: 'image/jpeg' }) : f;
      } catch (e) {
        return f;
      }
    }
    async function buildSubmissionFormData() {
      const fd = new FormData(),
        td = collectFormData();
      for (const k in td) {
        const v = td[k];
        null != v && ('object' == typeof v ? fd.append(k, JSON.stringify(v)) : fd.append(k, String(v)));
      }
      const physicalFields = new Set();
      for (const i of $$('input[type="file"]')) {
        if (i.files && i.files[0]) {
          const f = await shrinkImg(i.files[0]);
          fd.append(i.name, f, f.name);
          physicalFields.add(i.name);
        }
      }
      // Append persisted R2 references for fields with no physical file
      // at submit time (e.g. after a refresh). Worker/Make must be updated
      // to read persisted_files and merge them into its files-to-SharePoint
      // loop using the url (Make-secret /file/ link) in each entry.
      const persistedRefs = Object.keys(swUploadedFiles)
        .filter(function (n) { return !physicalFields.has(n); })
        .map(function (n) {
          var r = swUploadedFiles[n];
          return { field: n, key: r.key, filename: r.filename, url: r.url };
        });
      if (persistedRefs.length) fd.append('persisted_files', JSON.stringify(persistedRefs));
      return fd;
    }
    async function submitForm() {
      if (isCouplesMode()) mirrorAtoB();
      const fd = await buildSubmissionFormData(),
        cid = caseId || getCaseId() || 'LOCAL-' + Date.now();
      (fd.append('case_id', cid), fd.append('submitted_at', new Date().toISOString()));
      const next = $('[data-q-next]');
      next && ((next.disabled = !0), (next.textContent = 'Submitting…'));
      const URLS = ['https://salloum-submit.salloumlawbusiness.workers.dev/'];
      let submitOk = !1,
        lastErr = null;
      for (let a = 1; a <= 3 && !submitOk; a++) {
        for (const u of URLS) {
          try {
            const r = await fetch(u, { method: 'POST', body: fd });
            if (r.ok) {
              submitOk = !0;
              break;
            }
            lastErr = new Error('HTTP ' + r.status);
          } catch (e) {
            lastErr = e;
          }
        }
        if (!submitOk && a < 3) await new Promise((r) => setTimeout(r, 1500 * a));
      }
      if (!submitOk) return (next && ((next.disabled = !1), (next.textContent = 'Submit »')), void showErrorBanner("Couldn't send (" + ((lastErr && lastErr.message) || '?') + '). Ref: ' + cid));
      (clearDraft(), (window.location.href = '/wills-services/questionnaire-complete?case_id=' + encodeURIComponent(cid)));
    }
    /* ============================================================
       PERSON AUTO-POPULATE FEATURE (additive)
       Lets a user reuse a person entered elsewhere in the form.
       Reads people from every person-holder, builds a dropdown on
       each person-APPOINTING block/section, and copies identity
       fields on selection. Copy-on-select only (no locking/sync).
       ============================================================ */
    /* ============================================================
       BACKGROUND FILE UPLOAD ON SELECT (Stage 2, additive)
       On every valid file-input change, silently POSTs the file to
       the /upload endpoint. On success records the reference in
       swUploadedFiles keyed by field name. Submit still works as
       today; this is read-only from the submission flow's perspective.
       ============================================================ */
    var swUploadedFiles = {}; // { [fieldName]: { key, filename, url } }
    var SW_UPLOAD_ENDPOINT = 'https://salloum-submit.salloumlawbusiness.workers.dev/upload';
    function swUploadFileInBackground(fileInput) {
      if (!fileInput || !fileInput.files || !fileInput.files[0]) return;
      var name = fileInput.getAttribute('name');
      if (!name) return;
      var file = fileInput.files[0];
      var cid = caseId || getCaseId() || null;
      var fd = new FormData();
      fd.append('file', file, file.name);
      fd.append('field', name);
      if (cid) fd.append('case_id', cid);
      fetch(SW_UPLOAD_ENDPOINT, { method: 'POST', body: fd })
        .then(function (r) {
          return r.ok ? r.json() : Promise.reject('HTTP ' + r.status);
        })
        .then(function (data) {
          if (data && data.ok) { swUploadedFiles[name] = { key: data.key, filename: data.filename, url: data.url, viewUrl: data.viewUrl, viewToken: data.viewToken }; swRenderUploadedState(); swPropagateDocFromSourceFile(name); }
        })
        .catch(function () {
          // Silent — submission still sends the raw file as fallback.
        });
    }
    // Canonical identity attribute order (source of truth for copy).
    var SW_PERSON_ATTRS = ['full_name', 'relationship', 'nationality', 'dob', 'pob', 'passport', 'emirates_id'];
    // Read a single field value by name (trimmed). Uses existing $ helper.
    function swFieldVal(name) {
      var el = $('[name="' + name + '"]');
      return el && 'file' !== el.type ? (el.value || '').trim() : '';
    }
    // Build one canonical person object from a set of field names.
    // fieldNames maps attr -> field name (or null when the role lacks it).
    function swReadPerson(fieldNames, source) {
      var p = { source: source };
      SW_PERSON_ATTRS.forEach(function (a) {
        p[a] = fieldNames[a] ? swFieldVal(fieldNames[a]) : '';
      });
      return p;
    }
    // Dedup key: full_name (lower/trim) + '|' + passport (upper/trim).
    function swPersonKey(p) {
      return (p.full_name || '').trim().toLowerCase() + '|' + (p.passport || '').trim().toUpperCase();
    }
    // Field-name builders per role/prefix.
    function swBlockFields(prefix, n) {
      // prefix e.g. 'executor', 'executor_b', 'sub_executor', 'primary_ben', 'secondary_ben'
      var base = prefix + '_' + n + '_';
      return { full_name: base + 'full_name', relationship: base + 'relationship', nationality: base + 'nationality', dob: base + 'dob', pob: base + 'pob', passport: base + 'passport', emirates_id: base + 'emirates_id' };
    }
    function swChildFields(n) {
      // Children have NO relationship, NO pob.
      var base = 'child_' + n + '_';
      return { full_name: base + 'full_name', relationship: null, nationality: base + 'nationality', dob: base + 'dob', pob: null, passport: base + 'passport', emirates_id: base + 'emirates_id' };
    }
    function swGuardianFields(prefix) {
      // prefix e.g. 'perm_guardian', 'sub_perm', 'interim', 'sub_interim'
      return { full_name: prefix + '_full_name', relationship: prefix + '_relationship', nationality: prefix + '_nationality', dob: prefix + '_dob', pob: prefix + '_pob', passport: prefix + '_passport', emirates_id: prefix + '_emirates_id' };
    }
    // Incapacity guardian ("a different person") — non-standard field names,
    // no place-of-birth, no Emirates ID.
    function swIncapGuardianFields() {
      return { full_name: 'q40_incap_guardian_name', relationship: 'q40_incap_guardian_rel', nationality: 'q40_incap_guardian_nat', dob: 'q40_incap_guardian_dob', pob: null, passport: 'q40_incap_guardian_passport', emirates_id: null };
    }
    function swTestatorFields(suffix) {
      // Testators have NO relationship. pob = q4_pob. suffix '' or '_b'.
      return { full_name: 'q1_full_name' + suffix, relationship: null, nationality: 'q2_nationality' + suffix, dob: 'q3_dob' + suffix, pob: 'q4_pob' + suffix, passport: 'q5_passport' + suffix, emirates_id: 'q6_emirates_id' + suffix };
    }
    // Count how many blocks of a given hyphenated data-block type exist.
    function swBlockIndices(dataBlock) {
      var list = $('[data-block-list="' + dataBlock + '"]');
      var blocks = list ? $$('[data-block="' + dataBlock + '"]', list) : $$('[data-block="' + dataBlock + '"]');
      return blocks.map(function (b, i) {
        return b.dataset.blockIndex || String(i + 1);
      });
    }
    // Build the person registry from the whole form.
    function buildPersonRegistry() {
      var people = [];
      // Testators — passport file names are UPLOAD_MAP special cases.
      // _sourceStep / _sourceScrollName let the "Take me back" button find
      // where the person was originally entered.
      var tA = swReadPerson(swTestatorFields(''), 'Testator A');
      tA._passportFileField = 'testator_a_passport_file';
      tA._eidFileField = 'q6_emirates_id_file';
      tA._sourceStep = 1;
      tA._sourceScrollName = 'q1_full_name';
      people.push(tA);
      if (isCouplesMode()) {
        var tB = swReadPerson(swTestatorFields('_b'), 'Testator B');
        tB._passportFileField = 'testator_b_passport_file';
        tB._eidFileField = 'q6_emirates_id_b_file';
        tB._sourceStep = 9;
        tB._sourceScrollName = 'q1_full_name_b';
        people.push(tB);
      }
      // Repeatable person blocks (hyphenated data-block, underscored field prefix)
      var blockSpecs = [
        { db: 'executor', prefix: 'executor', label: 'Executor', step: 4 },
        { db: 'executor-b', prefix: 'executor_b', label: 'Executor (B)', step: 4 },
        { db: 'sub-executor', prefix: 'sub_executor', label: 'Substitute executor', step: 4 },
        { db: 'primary-beneficiary', prefix: 'primary_ben', label: 'Beneficiary', step: 6 },
        { db: 'secondary-beneficiary', prefix: 'secondary_ben', label: 'Secondary beneficiary', step: 6 },
      ];
      blockSpecs.forEach(function (spec) {
        swBlockIndices(spec.db).forEach(function (idx) {
          var fn = swBlockFields(spec.prefix, idx);
          var p = swReadPerson(fn, spec.label + ' ' + idx);
          p._passportFileField = fn.passport ? fn.passport + '_file' : null;
          p._eidFileField = fn.emirates_id ? fn.emirates_id + '_file' : null;
          p._sourceStep = spec.step;
          p._sourceScrollName = fn.full_name;
          people.push(p);
        });
      });
      // Children (a source of people, per firm decision)
      swBlockIndices('child').forEach(function (idx) {
        var fn = swChildFields(idx);
        var p = swReadPerson(fn, 'Child ' + idx);
        p._passportFileField = fn.passport ? fn.passport + '_file' : null;
        p._eidFileField = fn.emirates_id ? fn.emirates_id + '_file' : null;
        p._sourceStep = 6;
        p._sourceScrollName = fn.full_name;
        people.push(p);
      });
      // Fixed guardian sections
      var guardianSpecs = [
        { prefix: 'perm_guardian', label: 'Permanent guardian' },
        { prefix: 'sub_perm', label: 'Substitute permanent guardian' },
        { prefix: 'interim', label: 'Interim guardian' },
        { prefix: 'sub_interim', label: 'Substitute interim guardian' },
      ];
      guardianSpecs.forEach(function (spec) {
        var fn = swGuardianFields(spec.prefix);
        var p = swReadPerson(fn, spec.label);
        p._passportFileField = fn.passport ? fn.passport + '_file' : null;
        p._eidFileField = fn.emirates_id ? fn.emirates_id + '_file' : null;
        p._sourceStep = 7;
        p._sourceScrollName = fn.full_name;
        people.push(p);
      });
      // Keep only people with a name OR passport; dedup by key.
      var seen = {},
        out = [];
      people.forEach(function (p) {
        if (!(p.full_name || p.passport)) return;
        var key = swPersonKey(p);
        if (seen[key]) return;
        seen[key] = !0;
        out.push(p);
      });
      return out;
    }
    // Set one target field from a value, firing input+change so existing
    // listeners (validation, draft save, EID upload injection) run.
    function swSetField(name, value) {
      var el = $('[name="' + name + '"]');
      if (!el || 'file' === el.type) return;
      el.value = null == value ? '' : value;
      try {
        el.dispatchEvent(new Event('input', { bubbles: !0 }));
      } catch (e) {}
      try {
        el.dispatchEvent(new Event('change', { bubbles: !0 }));
      } catch (e) {}
    }
    // Resolve a target field mapping. `fields` may be a plain object
    // (fixed roles like guardians) or a function returning one, evaluated
    // at call time so block indices stay correct after add/remove/renumber.
    function swResolveFields(fields) {
      return 'function' == typeof fields ? fields() : fields;
    }
    // Copy a canonical person's attributes into a target role's fields.
    function swPopulateTarget(fields, person) {
      var fieldNames = swResolveFields(fields);
      if (!fieldNames) return;
      SW_PERSON_ATTRS.forEach(function (a) {
        if (!fieldNames[a]) return; // target lacks this field
        swSetField(fieldNames[a], person ? person[a] || '' : '');
      });
    }
    // Handle a dropdown selection: populate from registry or clear.
    function swOnPersonSelect(sel, fields) {
      var idx = sel.value;
      // Resolve target field names now (lazy resolver) to get passport/EID base names.
      var targetFieldNames = swResolveFields(fields);
      var targetPassportFile = targetFieldNames && targetFieldNames.passport ? targetFieldNames.passport + '_file' : null;
      var targetEidFile = targetFieldNames && targetFieldNames.emirates_id ? targetFieldNames.emirates_id + '_file' : null;
      if ('' === idx) {
        // Deselect: unlock identity fields + docs, clear, remove notice.
        swClearReuseLock(targetFieldNames);
        swPopulateTarget(fields, null); // clear text fields for fresh entry
        // Also clear any carried doc references so the block isn't stale.
        if (targetPassportFile) delete swUploadedFiles[targetPassportFile];
        if (targetEidFile) delete swUploadedFiles[targetEidFile];
        swRenderUploadedState();
        saveDraft();
        return;
      }
      var registry = buildPersonRegistry();
      var person = registry[parseInt(idx, 10)];
      if (!person) return;
      swPopulateTarget(fields, person);
      // Carry the source person's uploaded documents to the target role.
      if (targetPassportFile && person._passportFileField && swUploadedFiles[person._passportFileField]) {
        swUploadedFiles[targetPassportFile] = Object.assign({}, swUploadedFiles[person._passportFileField]);
      }
      if (targetEidFile && person._eidFileField && swUploadedFiles[person._eidFileField]) {
        swUploadedFiles[targetEidFile] = Object.assign({}, swUploadedFiles[person._eidFileField]);
      }
      // Lock the identity fields + carried docs and show the notice.
      swApplyReuseLock(targetFieldNames, person);
      swRenderUploadedState();
      saveDraft();
    }
    // Build/refresh the <option> list of a dropdown from the registry.
    function swFillDropdownOptions(sel) {
      var registry = buildPersonRegistry();
      var prev = sel.value;
      sel.innerHTML = '';
      var first = document.createElement('option');
      ((first.value = ''), (first.textContent = '— Enter a new person —'));
      sel.appendChild(first);
      registry.forEach(function (p, i) {
        var o = document.createElement('option');
        ((o.value = String(i)), (o.textContent = (p.full_name || '(no name)') + ' — ' + p.source));
        sel.appendChild(o);
      });
      // Preserve prior selection index if still valid; else reset to new.
      sel.value = prev && sel.querySelector('option[value="' + prev + '"]') ? prev : '';
    }
    // Inject (once) a dropdown at the top of a container, or refresh it.
    // container: the element to prepend into. fields: target mapping or
    // a function returning it (resolved at select time).
    function swInjectDropdown(container, fields, anchorBefore) {
      if (!container) return;
      var existing = container.querySelector(':scope > .sw-q-person-picker');
      if (existing) {
        var s = existing.querySelector('select');
        if (s) swFillDropdownOptions(s);
        return;
      }
      var wrap = document.createElement('div');
      wrap.className = 'sw-q-field sw-q-person-picker';
      var label = document.createElement('div');
      ((label.className = 'sw-q-label'), (label.textContent = 'Reuse a person already entered'));
      var sel = document.createElement('select');
      sel.className = 'sw-q-input';
      sel.addEventListener('change', function () {
        swOnPersonSelect(sel, fields);
      });
      (wrap.appendChild(label), wrap.appendChild(sel), swFillDropdownOptions(sel));
      if (anchorBefore && anchorBefore.parentNode === container) container.insertBefore(wrap, anchorBefore);
      else container.insertBefore(wrap, container.firstChild);
    }
    // Rebuild registry + inject/refresh all appointing dropdowns.
    // Appointing targets: executors, sub-executors, beneficiaries, and
    // the four guardian sections. NOT children (source only).
    function rebuildPersonDropdowns() {
      // Repeatable appointing blocks.
      var appointSpecs = [
        { db: 'executor', prefix: 'executor' },
        { db: 'executor-b', prefix: 'executor_b' },
        { db: 'sub-executor', prefix: 'sub_executor' },
        { db: 'primary-beneficiary', prefix: 'primary_ben' },
        { db: 'secondary-beneficiary', prefix: 'secondary_ben' },
      ];
      appointSpecs.forEach(function (spec) {
        $$('[data-block="' + spec.db + '"]').forEach(function (block) {
          // Resolve field names lazily from the block's LIVE index so the
          // mapping stays correct after add/remove/renumber.
          var resolver = function () {
            return swBlockFields(spec.prefix, block.dataset.blockIndex || '1');
          };
          swInjectDropdown(block, resolver, block.firstChild);
        });
      });
      // Bequest blocks: only recipient (full_name) and relationship are
      // person-identity fields. All other attrs are null (not present).
      $$('[data-block="bequest"]').forEach(function (block) {
        var resolver = function () {
          var idx = block.dataset.blockIndex || '1';
          return { full_name: 'bequest_' + idx + '_recipient', relationship: 'bequest_' + idx + '_relationship', nationality: null, dob: null, pob: null, passport: null, emirates_id: null };
        };
        swInjectDropdown(block, resolver, block.firstChild);
      });
      // Child blocks: reuse a person already entered (e.g. a beneficiary).
      // Children have full_name, nationality, dob, passport, emirates_id;
      // relationship and pob are null (swChildFields handles this).
      $$('[data-block="child"]').forEach(function (block) {
        var resolver = function () {
          return swChildFields(block.dataset.blockIndex || '1');
        };
        swInjectDropdown(block, resolver, block.firstChild);
      });
      // Fixed guardian sections: anchor to the container of the first
      // identity field (full_name) for that guardian.
      var guardianPrefixes = ['perm_guardian', 'sub_perm', 'interim', 'sub_interim'];
      guardianPrefixes.forEach(function (prefix) {
        var nameInp = $('[name="' + prefix + '_full_name"]');
        if (!nameInp) return;
        var field = nameInp.closest('.sw-q-field') || nameInp.parentNode;
        var container = field && field.parentNode;
        if (!container) return;
        swInjectDropdown(container, swGuardianFields(prefix), field);
      });
      // Incapacity guardian ("a different person") section. Uses the same
      // container resolution as swReuseContainer so the dropdown, notice and
      // data-reused-from tag all land on the same block. swInjectDropdown
      // guards duplicates. Visibility is handled by the existing conditional
      // (hidden on Silver / when "executors named above" is chosen).
      var incapNameInp = $('[name="q40_incap_guardian_name"]');
      if (incapNameInp) {
        var incapContainer = swReuseContainer('q40_incap_guardian_name');
        if (incapContainer) swInjectDropdown(incapContainer, swIncapGuardianFields(), incapContainer.firstChild);
      }
    }
    /* ============================================================
       EXCLUDED JURISDICTIONS MULTI-SELECT (additive)
       Replaces the single q14_excluded_jurisdictions text input with a
       country picker (select + removable tags). The submittable value
       stays a hidden input named q14_excluded_jurisdictions holding a
       comma-joined string, so submission / draft / mirroring are
       unchanged. Same for the _b (Testator B) side.
       ============================================================ */
    var SW_EXCL_FIELDS = ['q14_excluded_jurisdictions', 'q14_excluded_jurisdictions_b'];
    // Parse a comma-joined string into a clean, de-duped array of names.
    function swExclParse(str) {
      var seen = {},
        out = [];
      (str || '')
        .split(',')
        .map(function (s) {
          return s.trim();
        })
        .forEach(function (c) {
          if (!c) return;
          var k = c.toLowerCase();
          if (seen[k]) return;
          seen[k] = !0;
          out.push(c);
        });
      return out;
    }
    // Write the array back to the hidden field and fire input+change so
    // draft-save and mirroring pick up the new value.
    function swExclSetValue(hidden, arr) {
      hidden.value = arr.join(', ');
      try {
        hidden.dispatchEvent(new Event('input', { bubbles: !0 }));
      } catch (e) {}
      try {
        hidden.dispatchEvent(new Event('change', { bubbles: !0 }));
      } catch (e) {}
    }
    // Render the tag chips for a picker from its hidden field's value.
    function swExclRenderTags(picker) {
      var hidden = picker._swHidden,
        tagWrap = picker._swTags;
      if (!hidden || !tagWrap) return;
      var arr = swExclParse(hidden.value);
      tagWrap.innerHTML = '';
      arr.forEach(function (country) {
        var chip = document.createElement('span');
        chip.className = 'sw-q-excl-tag';
        var txt = document.createElement('span');
        txt.textContent = country;
        var x = document.createElement('button');
        ((x.type = 'button'), (x.className = 'sw-q-excl-tag-x'), (x.textContent = '×'), x.setAttribute('aria-label', 'Remove ' + country));
        x.addEventListener('click', function () {
          var next = swExclParse(hidden.value).filter(function (c) {
            return c.toLowerCase() !== country.toLowerCase();
          });
          (swExclSetValue(hidden, next), swExclRenderTags(picker));
        });
        (chip.appendChild(txt), chip.appendChild(x), tagWrap.appendChild(chip));
      });
    }
    // Rebuild tags for ALL injected excluded-jurisdiction pickers from
    // their hidden field values (used after mirror / draft restore).
    function swExclRebuildAll() {
      $$('.sw-q-excl-picker').forEach(function (picker) {
        swExclRenderTags(picker);
      });
    }
    // Build the country <select> "add on choose" element.
    function swExclBuildSelect(hidden, picker) {
      var sel = document.createElement('select');
      sel.className = 'sw-q-input sw-q-excl-select';
      var ph = document.createElement('option');
      ((ph.value = ''), (ph.textContent = 'Select a country to add (you can add multiple)'));
      sel.appendChild(ph);
      COUNTRIES.forEach(function (c) {
        var o = document.createElement('option');
        ((o.value = c), (o.textContent = c));
        sel.appendChild(o);
      });
      sel.addEventListener('change', function () {
        var c = sel.value;
        if (!c) return;
        var arr = swExclParse(hidden.value);
        if (
          !arr.some(function (x) {
            return x.toLowerCase() === c.toLowerCase();
          })
        ) {
          (arr.push(c), swExclSetValue(hidden, arr), swExclRenderTags(picker));
        }
        sel.value = ''; // reset to placeholder so another can be added
      });
      return sel;
    }
    // Inject the picker for one field name, converting the existing
    // visible input into a hidden field. Idempotent (guarded).
    function swInjectExclPicker(fieldName) {
      var existing = $('[name="' + fieldName + '"]');
      if (!existing) return;
      // Already converted + picker present? Just refresh tags.
      if (existing.dataset && existing.dataset.swExclHidden) {
        var pk = existing.parentNode && existing.parentNode.querySelector(':scope > .sw-q-excl-picker[data-for="' + fieldName + '"]');
        if (pk) return void swExclRenderTags(pk);
      }
      var parent = existing.parentNode;
      if (!parent) return;
      // Convert existing element to a hidden input preserving name+value.
      var hidden = existing;
      if ('hidden' !== hidden.type || 'INPUT' !== hidden.tagName) {
        var h = document.createElement('input');
        ((h.type = 'hidden'), (h.name = fieldName), (h.value = existing.value || ''));
        (parent.replaceChild(h, existing), (hidden = h));
      }
      hidden.dataset.swExclHidden = '1';
      // Build the picker UI right after the hidden field.
      var picker = document.createElement('div');
      ((picker.className = 'sw-q-field sw-q-excl-picker'), picker.setAttribute('data-for', fieldName));
      var label = document.createElement('div');
      ((label.className = 'sw-q-label'), (label.textContent = 'Add one or more jurisdictions to exclude (select each country; you can add several)'));
      var sel = swExclBuildSelect(hidden, picker);
      var tags = document.createElement('div');
      tags.className = 'sw-q-excl-tags';
      ((picker._swHidden = hidden), (picker._swTags = tags));
      (picker.appendChild(label), picker.appendChild(sel), picker.appendChild(tags));
      parent.insertBefore(picker, hidden.nextSibling);
      swExclRenderTags(picker);
    }
    // Inject/refresh both A- and B-side pickers.
    function injectExcludedJurisdictionPickers() {
      SW_EXCL_FIELDS.forEach(function (n) {
        swInjectExclPicker(n);
      });
      swExclRebuildAll();
    }
    /* ============================================================
       REUSED-PERSON LOCKING (additive)
       When a person is reused into a role, their IDENTITY fields are
       populated AND locked (read-only) in that location; role-specific
       fields (share, bequest type/details) stay editable. A notice with
       a "Take me back to edit" button lets the client jump to the source.
       Only the whitelisted identity fields are ever locked.
       ============================================================ */
    // Attributes that count as identity (subset of SW_PERSON_ATTRS present
    // on the target). Only these field names are ever locked.
    var SW_LOCK_ATTRS = ['full_name', 'relationship', 'nationality', 'dob', 'pob', 'passport', 'emirates_id'];
    // Module state: which target blocks are currently "reused" (keyed by the
    // block's full_name field name — stable per block instance). Persisted to
    // the draft as _reusedBlocks and re-applied on restore.
    var swReusedBlocks = {}; // { [targetFullNameField]: { sourceStep, sourceScrollName } }
    // File fields currently locked (carried docs that must not be replaced).
    var swLockedFileFields = {};
    // Purge all reuse/lock/doc markers keyed by a block's field names. Used
    // on block remove/renumber and clone cleanup so a stale marker never
    // re-applies to a different block instance that inherited a field name.
    function swPurgeBlockState(block) {
      if (!block) return;
      $$('input,select,textarea', block).forEach(function (el) {
        var n = el.getAttribute && el.getAttribute('name');
        if (!n) return;
        delete swReusedBlocks[n];
        delete swLockedFileFields[n];
        delete swUploadedFiles[n];
        // also the _file variants for identity fields
        delete swLockedFileFields[n + '_file'];
        delete swUploadedFiles[n + '_file'];
      });
    }
    // Locate the DOM container for a target block from its full_name field.
    function swReuseContainer(fullNameField) {
      var el = $('[name="' + fullNameField + '"]');
      if (!el) return null;
      return el.closest('[data-block]') || el.closest('[data-conditional="incap-guardian-other"]') || (el.closest('.sw-q-field') && el.closest('.sw-q-field').parentNode) || el.parentNode;
    }
    // Lock one field element (readOnly for text/date; guarded for selects).
    function swLockFieldEl(el) {
      if (!el) return;
      el.classList.add('sw-q-locked');
      if ('SELECT' === el.tagName) {
        // A <select> can't be readOnly; keep it enabled (so value submits)
        // but revert any change and block interaction.
        if (!el._swLockGuard) {
          el._swLockGuard = function (e) {
            e.preventDefault();
          };
          el._swLockRevert = function () {
            if (null != el._swLockedValue) el.value = el._swLockedValue;
          };
          el._swLockedValue = el.value;
          el.addEventListener('mousedown', el._swLockGuard);
          el.addEventListener('keydown', el._swLockGuard);
          el.addEventListener('change', el._swLockRevert);
        } else {
          el._swLockedValue = el.value;
        }
      } else {
        el.readOnly = true;
      }
    }
    // Unlock one field element.
    function swUnlockFieldEl(el) {
      if (!el) return;
      el.classList.remove('sw-q-locked');
      if ('SELECT' === el.tagName) {
        if (el._swLockGuard) {
          el.removeEventListener('mousedown', el._swLockGuard);
          el.removeEventListener('keydown', el._swLockGuard);
          el.removeEventListener('change', el._swLockRevert);
          el._swLockGuard = null;
          el._swLockRevert = null;
          el._swLockedValue = null;
        }
      } else {
        el.readOnly = false;
      }
    }
    // Lock all whitelisted identity fields of a target (from resolved names).
    function swLockIdentityFields(fieldNames, lock) {
      if (!fieldNames) return;
      SW_LOCK_ATTRS.forEach(function (a) {
        if (!fieldNames[a]) return; // target lacks this identity field
        var el = $('[name="' + fieldNames[a] + '"]');
        if (!el || 'file' === el.type) return;
        lock ? swLockFieldEl(el) : swUnlockFieldEl(el);
      });
    }
    // Insert (or refresh) the reuse notice at the top of the block.
    function swInsertReuseNotice(container, sourceStep, sourceScrollName) {
      if (!container) return;
      if (container.querySelector(':scope > .sw-q-reuse-notice')) return; // guard dup
      var notice = document.createElement('div');
      notice.className = 'sw-q-reuse-notice';
      var title = document.createElement('span');
      ((title.className = 'sw-q-reuse-notice-title'), (title.textContent = 'These details are locked because this person was already added elsewhere.'));
      var sub = document.createElement('span');
      ((sub.className = 'sw-q-reuse-notice-sub'), (sub.textContent = 'To change their name, ID or other personal details, edit them where you first added this person.'));
      var btn = document.createElement('button');
      ((btn.type = 'button'), (btn.className = 'sw-q-reuse-notice-btn'), (btn.textContent = 'Take me back to edit'));
      btn.addEventListener('click', function () {
        swNavigateToSource(sourceStep, sourceScrollName);
      });
      (notice.appendChild(title), notice.appendChild(sub), notice.appendChild(btn));
      container.insertBefore(notice, container.firstChild);
    }
    function swRemoveReuseNotice(container) {
      if (!container) return;
      var n = container.querySelector(':scope > .sw-q-reuse-notice');
      if (n) n.remove();
    }
    // Navigate to the source person's step and scroll/highlight their block.
    function swNavigateToSource(step, scrollName) {
      if (step) showStep(step);
      requestAnimationFrame(function () {
        var el = scrollName ? $('[name="' + scrollName + '"]') : null;
        var target = el ? el.closest('[data-block]') || el.closest('.sw-q-field') || el : null;
        if (target) {
          target.scrollIntoView({ behavior: 'smooth', block: 'center' });
          target.classList.add('sw-q-reuse-highlight');
          setTimeout(function () {
            target.classList.remove('sw-q-reuse-highlight');
          }, 2000);
        }
      });
    }
    // Apply the full locked+notice+doc-lock state for a reused block.
    function swApplyReuseLock(fieldNames, person) {
      if (!fieldNames || !fieldNames.full_name) return;
      swLockIdentityFields(fieldNames, true);
      // Lock carried document fields (no Remove / no replace).
      var passportFile = fieldNames.passport ? fieldNames.passport + '_file' : null;
      var eidFile = fieldNames.emirates_id ? fieldNames.emirates_id + '_file' : null;
      if (passportFile) swLockedFileFields[passportFile] = true;
      if (eidFile) swLockedFileFields[eidFile] = true;
      var container = swReuseContainer(fieldNames.full_name);
      var existing = swReusedBlocks[fieldNames.full_name];
      var step = person ? person._sourceStep : existing && existing.sourceStep;
      var scrollName = person ? person._sourceScrollName : existing && existing.sourceScrollName;
      // Stable source-slot key (link by SLOT, not by name). Derived from the
      // source person's full_name field (its _sourceScrollName).
      var sourceKey = person ? (swSlotFromFieldName(person._sourceScrollName) || {}).sourceKey : existing && existing.sourceKey;
      // When re-selecting a DIFFERENT person into this block, remove the old
      // notice first so its "Take me back" button re-wires to the NEW source.
      // (On restore person is null; keep the existing notice as-is.)
      if (person) swRemoveReuseNotice(container);
      swInsertReuseNotice(container, step, scrollName);
      // Tag the target block so propagation can find it by source slot
      // (always overwrite so switching A->B fully re-links to B).
      if (container && sourceKey) container.setAttribute('data-reused-from', sourceKey);
      swReusedBlocks[fieldNames.full_name] = { sourceStep: step, sourceScrollName: scrollName, sourceKey: sourceKey, targetFieldNames: fieldNames };
    }
    // Remove the locked state for a reused block.
    function swClearReuseLock(fieldNames) {
      if (!fieldNames || !fieldNames.full_name) return;
      swLockIdentityFields(fieldNames, false);
      var passportFile = fieldNames.passport ? fieldNames.passport + '_file' : null;
      var eidFile = fieldNames.emirates_id ? fieldNames.emirates_id + '_file' : null;
      if (passportFile) delete swLockedFileFields[passportFile];
      if (eidFile) delete swLockedFileFields[eidFile];
      var container = swReuseContainer(fieldNames.full_name);
      swRemoveReuseNotice(container);
      if (container) container.removeAttribute('data-reused-from');
      delete swReusedBlocks[fieldNames.full_name];
    }
    // Re-apply all reuse locks from swReusedBlocks (after draft restore /
    // dropdown rebuild). Re-derives the target field names from the
    // full_name field's block so indices stay correct.
    function swReapplyReuseLocks() {
      Object.keys(swReusedBlocks).forEach(function (fullNameField) {
        // Only re-lock if the block still exists AND its full_name field is
        // genuinely populated. Otherwise the marker is stale (block removed
        // or renumbered) — drop it instead of locking the wrong block.
        var el = $('[name="' + fullNameField + '"]');
        if (!el || !(el.value && el.value.trim())) {
          delete swReusedBlocks[fullNameField];
          return;
        }
        var fieldNames = swDeriveFieldNamesFromFullName(fullNameField);
        if (fieldNames) swApplyReuseLock(fieldNames, null);
      });
    }
    // Given a full_name field name, reconstruct the identity field map for
    // that role (handles blocks, bequests, guardians, testators).
    function swDeriveFieldNamesFromFullName(fullNameField) {
      if (!fullNameField) return null;
      // Bequest: bequest_N_recipient
      var mB = fullNameField.match(/^bequest_(\d+)_recipient$/);
      if (mB) return { full_name: 'bequest_' + mB[1] + '_recipient', relationship: 'bequest_' + mB[1] + '_relationship', nationality: null, dob: null, pob: null, passport: null, emirates_id: null };
      // Testators
      if ('q1_full_name' === fullNameField) return swTestatorFields('');
      if ('q1_full_name_b' === fullNameField) return swTestatorFields('_b');
      // Incapacity guardian (non-standard names).
      if ('q40_incap_guardian_name' === fullNameField) return swIncapGuardianFields();
      // Blocks: <prefix>_<N>_full_name
      var mBlk = fullNameField.match(/^(.*)_(\d+)_full_name$/);
      if (mBlk) {
        if ('child' === mBlk[1]) return swChildFields(mBlk[2]);
        return swBlockFields(mBlk[1], mBlk[2]);
      }
      // Guardians: <prefix>_full_name
      var mG = fullNameField.match(/^(.*)_full_name$/);
      if (mG) return swGuardianFields(mG[1]);
      return null;
    }
    /* ============================================================
       LIVE SOURCE→COPY PROPAGATION (additive)
       When a person's identity fields are edited at their SOURCE slot,
       the changes flow to every locked reused copy. Copies are linked to
       their source by a stable slot key (data-reused-from), NOT by name,
       so editing the name never breaks the link. Only whitelisted
       identity fields propagate; role-specific fields are untouched.
       ============================================================ */
    var swPropagating = false; // re-entrancy guard
    // Derive a stable source-slot key from any field NAME.
    // Returns { sourceKey, fieldNames } or null if not an identity slot.
    function swSlotFromFieldName(name) {
      if (!name) return null;
      // Testators (A / B) — any of their identity fields map to the slot.
      if (/^(q1_full_name|q2_nationality|q3_dob|q4_pob|q5_passport|q6_emirates_id)_b$/.test(name)) return { sourceKey: 'testator:b', fieldNames: swTestatorFields('_b') };
      if (/^(q1_full_name|q2_nationality|q3_dob|q4_pob|q5_passport|q6_emirates_id)$/.test(name)) return { sourceKey: 'testator:a', fieldNames: swTestatorFields('') };
      // Bequest: bequest_N_recipient / _relationship
      var mBq = name.match(/^bequest_(\d+)_(recipient|relationship)$/);
      if (mBq) return { sourceKey: 'bequest:' + mBq[1], fieldNames: { full_name: 'bequest_' + mBq[1] + '_recipient', relationship: 'bequest_' + mBq[1] + '_relationship', nationality: null, dob: null, pob: null, passport: null, emirates_id: null } };
      // Repeatable blocks: <prefix>_<N>_<attr>
      var mBlk = name.match(/^(executor_b|executor|sub_executor|primary_ben|secondary_ben|child)_(\d+)_(full_name|relationship|nationality|dob|pob|passport|emirates_id)$/);
      if (mBlk) {
        var prefix = mBlk[1],
          idx = mBlk[2];
        return { sourceKey: prefix + ':' + idx, fieldNames: 'child' === prefix ? swChildFields(idx) : swBlockFields(prefix, idx) };
      }
      // Guardians: <prefix>_<attr>
      var mG = name.match(/^(perm_guardian|sub_perm|interim|sub_interim)_(full_name|relationship|nationality|dob|pob|passport|emirates_id)$/);
      if (mG) return { sourceKey: 'guardian:' + mG[1], fieldNames: swGuardianFields(mG[1]) };
      return null;
    }
    // Set a value on a (possibly locked) target field programmatically.
    // readOnly blocks user typing, not script; for locked selects we also
    // update the guard's remembered value so its revert doesn't fight us.
    function swSetLockedValue(name, value) {
      var el = $('[name="' + name + '"]');
      if (!el || 'file' === el.type) return;
      el.value = null == value ? '' : value;
      if ('SELECT' === el.tagName && null != el._swLockedValue) el._swLockedValue = el.value;
    }
    // Copy identity values + carried docs from a source slot to one target.
    function swPropagateOneTarget(sourceFieldNames, targetFieldNames) {
      if (!sourceFieldNames || !targetFieldNames) return;
      SW_LOCK_ATTRS.forEach(function (a) {
        if (!sourceFieldNames[a] || !targetFieldNames[a]) return;
        var src = $('[name="' + sourceFieldNames[a] + '"]');
        if (!src || 'file' === src.type) return;
        swSetLockedValue(targetFieldNames[a], src.value);
      });
      // Mirror carried documents (locked copy tracks the source doc).
      var srcPassportFile = sourceFieldNames.passport ? sourceFieldNames.passport + '_file' : null;
      var srcEidFile = sourceFieldNames.emirates_id ? sourceFieldNames.emirates_id + '_file' : null;
      var tgtPassportFile = targetFieldNames.passport ? targetFieldNames.passport + '_file' : null;
      var tgtEidFile = targetFieldNames.emirates_id ? targetFieldNames.emirates_id + '_file' : null;
      if (tgtPassportFile) {
        if (srcPassportFile && swUploadedFiles[srcPassportFile]) swUploadedFiles[tgtPassportFile] = Object.assign({}, swUploadedFiles[srcPassportFile]);
      }
      if (tgtEidFile) {
        if (srcEidFile && swUploadedFiles[srcEidFile]) swUploadedFiles[tgtEidFile] = Object.assign({}, swUploadedFiles[srcEidFile]);
      }
    }
    // Given a source slot key, propagate to all locked copies of it.
    function swPropagateFromSource(sourceKey, sourceFieldNames) {
      if (!sourceKey || swPropagating) return;
      var copies = $$('[data-reused-from="' + sourceKey + '"]');
      if (!copies.length) return;
      swPropagating = true;
      try {
        copies.forEach(function (block) {
          // The target's full_name field identifies its marker/field map.
          // Also matches bequest recipient and the incap guardian name field.
          var nameInp = $('input[name$="full_name"],input[name$="recipient"],input[name="q40_incap_guardian_name"]', block) || $('input[name$="full_name"]', block);
          var targetFullName = nameInp ? nameInp.getAttribute('name') : null;
          // Re-derive target field names from the LIVE name field so
          // add/remove/renumber can't leave a stale mapping.
          var targetFieldNames = targetFullName ? swDeriveFieldNamesFromFullName(targetFullName) : null;
          swPropagateOneTarget(sourceFieldNames, targetFieldNames);
        });
      } finally {
        swPropagating = false;
      }
      swRenderUploadedState();
      saveDraft();
    }
    // A source document changed: derive its slot and propagate docs to copies.
    function swPropagateDocFromSourceFile(fileFieldName) {
      if (!fileFieldName) return;
      // Map the UPLOAD file field back to its owning identity slot.
      var baseName = null;
      if ('testator_a_passport_file' === fileFieldName) baseName = 'q5_passport';
      else if ('testator_b_passport_file' === fileFieldName) baseName = 'q5_passport_b';
      else baseName = fileFieldName.replace(/_file$/, ''); // e.g. executor_1_passport, q6_emirates_id
      var slot = swSlotFromFieldName(baseName);
      if (slot) swPropagateFromSource(slot.sourceKey, slot.fieldNames);
    }
    // Handle a source-field change: derive slot, propagate to its copies.
    function swMaybePropagate(fieldName) {
      var slot = swSlotFromFieldName(fieldName);
      if (!slot) return;
      // A locked copy is never a source: its input is readOnly (or a locked
      // select), so a user edit can't originate here. The change listener
      // only fires from an editable source, so no extra guard is needed —
      // but skip if this slot has no live copies.
      swPropagateFromSource(slot.sourceKey, slot.fieldNames);
    }
    /* ============================================================
       UPLOADED-FILE STATE RENDERING (Spec 3B, additive)
       For every file input whose name is in swUploadedFiles, renders
       (once, guarded) a status row showing ✓ filename + View link
       inside the .sw-q-upload-field wrapper. The <input type="file">
       stays present so the user can replace the file.
       ============================================================ */
    function swRenderUploadedState() {
      $$('input[type="file"]').forEach(function (inp) {
        var name = inp.getAttribute('name');
        if (!name) return;
        var ref = swUploadedFiles[name];
        var wrap = inp.closest('.sw-q-upload-field');
        if (!wrap) return;
        // Remove any existing status row so it can be refreshed.
        var existing = wrap.querySelector('.sw-q-uploaded-state');
        if (existing) existing.remove();
        // If this field is no longer locked, ensure its input is visible again.
        if (!swLockedFileFields[name] && 'none' === inp.style.display) inp.style.display = '';
        // If no reference recorded, nothing to show.
        if (!ref || !ref.filename) return;
        var row = document.createElement('div');
        row.className = 'sw-q-uploaded-state';
        var icon = document.createElement('span');
        ((icon.className = 'sw-q-uploaded-state-icon'), (icon.textContent = '✓'));
        var fname = document.createElement('span');
        fname.textContent = ref.filename;
        row.appendChild(icon);
        row.appendChild(fname);
        if (ref.viewUrl) {
          var viewLink = document.createElement('a');
          ((viewLink.className = 'sw-q-uploaded-state-view'),
            (viewLink.href = ref.viewUrl),
            (viewLink.target = '_blank'),
            viewLink.setAttribute('rel', 'noopener'),
            (viewLink.textContent = 'View'));
          row.appendChild(viewLink);
        }
        var isLocked = !!swLockedFileFields[name];
        if (isLocked) {
          // Carried doc from a reused person: cannot be replaced here.
          // Hide the file input; do NOT show a Remove button.
          inp.style.display = 'none';
        } else {
          // Ensure the input is visible/usable (e.g. after unlock).
          if ('none' === inp.style.display) inp.style.display = '';
          // Remove button: detaches the file from the form (R2 lifecycle handles actual deletion).
          var removeBtn = document.createElement('button');
          removeBtn.type = 'button';
          removeBtn.className = 'sw-q-uploaded-state-remove';
          removeBtn.textContent = 'Remove';
          removeBtn.addEventListener('click', function () {
            delete swUploadedFiles[name];
            row.remove();
            saveDraft();
          });
          row.appendChild(removeBtn);
        }
        // Insert after the file input so it sits below it.
        inp.parentNode.insertBefore(row, inp.nextSibling);
      });
    }
    function saveAndExit() {
      (clearTimeout(window._sw_save_t), saveDraft(), alert('Progress saved. You can return within 30 days. Your answers and uploaded documents are kept until then.'), (window.location.href = '/wills-services'));
    }
    function init() {
      if ('silver' === getPackage()) {
        var x = $('[data-incap-section]');
        x && (x.style.display = 'none');
      }
      (injectStyles(), wireCouplesMode());
      $$('[data-step="9"] input,[data-step="9"] select,[data-step="9"] textarea').forEach(function (el) {
        if (el.id && /^q\d/.test(el.id) && el.id.endsWith('_b')) {
          if (el.name.startsWith('field-')) el.name = el.id;
          if (el.id === 'q3_dob_b' && el.tagName === 'INPUT') el.type = 'date';
        }
      });
      (constrainDateInputs(), convertCountryFields(), prefillUaePhones(), (caseId = getCaseId()));
      const back = $('[data-q-back]'),
        next = $('[data-q-next]'),
        save = $('[data-q-save]');
      (back && back.addEventListener('click', prevStep),
        next && next.addEventListener('click', nextStep),
        save && save.addEventListener('click', saveAndExit),
        document.addEventListener('change', (e) => {
          const t = e.target;
          !t ||
            ('INPUT' !== t.tagName && 'TEXTAREA' !== t.tagName && 'SELECT' !== t.tagName) ||
            (t.closest('.sw-q-page, form, [data-step]') &&
              (applyConditionals(),
              updateRadioStates(),
              $$('.sw-q-invalid').forEach((el) => {
                ('INPUT' === el.tagName || 'TEXTAREA' === el.tagName || 'SELECT' === el.tagName) && 'file' !== el.type && el.value && el.value.trim() && el.classList.remove('sw-q-invalid');
              }),
              saveDraft()));
        }),
        // Background upload on file-input select (Stage 2).
        document.addEventListener('change', (e) => {
          const t = e.target;
          if (t && 'INPUT' === t.tagName && 'file' === t.type && t.closest('.sw-q-page, form, [data-step]')) {
            if (validateFile(t)) swUploadFileInBackground(t);
          }
        }),
        // Live source→copy propagation: when an identity field at a SOURCE
        // slot changes, push the change to all locked reused copies.
        document.addEventListener('input', (e) => {
          const t = e.target;
          if (t && t.name && ('INPUT' === t.tagName || 'SELECT' === t.tagName || 'TEXTAREA' === t.tagName) && t.closest('.sw-q-page, form, [data-step]')) swMaybePropagate(t.name);
        }),
        document.addEventListener('change', (e) => {
          const t = e.target;
          if (t && t.name && 'SELECT' === t.tagName && t.closest('.sw-q-page, form, [data-step]')) swMaybePropagate(t.name);
        }),
        document.addEventListener('input', (e) => {
          const t = e.target;
          if (t && ('INPUT' === t.tagName || 'TEXTAREA' === t.tagName || 'SELECT' === t.tagName) && t.closest('.sw-q-page, form, [data-step]') && (clearTimeout(window._sw_save_t), (window._sw_save_t = setTimeout(saveDraft, 800)), t.name && /^primary_ben_\d+_share$/.test(t.name) && updateShareTotal(), t.classList && t.classList.contains('sw-q-invalid') && t.value && t.value.trim())) {
            t.classList.remove('sw-q-invalid');
            const fw = t.closest('.sw-q-field');
            if (fw) {
              const er = fw.querySelector('.sw-q-field-error');
              er && er.remove();
            }
          }
        }),
        document.addEventListener(
          'blur',
          (e) => {
            const t = e.target;
            !t || ('INPUT' !== t.tagName && 'TEXTAREA' !== t.tagName && 'SELECT' !== t.tagName) || ('radio' !== t.type && 'checkbox' !== t.type && t.closest('.sw-q-page, form, [data-step]') && (clearTimeout(window._sw_save_t), saveDraft()));
          },
          !0,
        ),
        window.addEventListener('beforeunload', () => {
          clearTimeout(window._sw_save_t);
          try {
            saveDraft();
          } catch (e) {}
        }),
        document.addEventListener('visibilitychange', () => {
          if ('hidden' === document.visibilityState) {
            clearTimeout(window._sw_save_t);
            try {
              saveDraft();
            } catch (e) {}
          }
        }),
        document.addEventListener('click', (e) => {
          if (!e.target.closest('.sw-q-page')) return;
          const row = e.target.closest('.sw-q-radio-row');
          if (!row) return void setTimeout(updateRadioStates, 0);
          const input = row.querySelector('input[type="radio"],input[type="checkbox"]');
          if (!input) return void setTimeout(updateRadioStates, 0);
          const clickedInput = e.target === input,
            nativeLabel = e.target.closest('label.w-checkbox, label.w-radio'),
            clickedNativeLabel = nativeLabel && nativeLabel.contains(input);
          clickedInput || clickedNativeLabel || 'A' === e.target.tagName
            ? setTimeout(() => {
                (input.dispatchEvent(new Event('change', { bubbles: !0 })), updateRadioStates());
              }, 0)
            : ('radio' === input.type ? input.checked || ((input.checked = !0), input.dispatchEvent(new Event('change', { bubbles: !0 }))) : ((input.checked = !input.checked), input.dispatchEvent(new Event('change', { bubbles: !0 }))), setTimeout(updateRadioStates, 0));
        }),
        document.addEventListener('click', (e) => {
          const btn = e.target.closest('[data-add-block]');
          btn && !btn.classList.contains('sw-q-add-disabled') ? (e.preventDefault(), addBlock(btn.dataset.addBlock), applyConditionals()) : btn && btn.classList.contains('sw-q-add-disabled') && e.preventDefault();
        }));
      try {
        localStorage.removeItem('sw_q_draft');
      } catch (e) {}
      if (isCouplesMode()) {
        document.body.classList.add('sw-couples-mode');
        $$('[data-testator="b"],[data-q-mirror="b"],.sw-q-b-label,.sw-q-a-label,.sw-q-b-wrap').forEach(function (el) {
          el.closest('[data-step="9"]') || el.style.setProperty('display', 'none', 'important');
        });
        $$('[data-step="9"] *').forEach(function (el) {
          el.style.removeProperty('display');
        });
        $$('[data-q-mirror="a"]').forEach(function (el) {
          if (el.closest('[data-step="9"]')) return;
          el.style.setProperty('width', '100%', 'important');
          el.style.setProperty('grid-column', '1 / -1', 'important');
          const f = el.closest('.sw-q-field');
          if (f) {
            f.style.setProperty('grid-column', '1 / -1', 'important');
            f.style.setProperty('width', '100%', 'important');
          }
        });
        const s2 = $('[data-step="2"]');
        if (s2 && !$('.sw-q-mirror-notice', s2)) {
          const mn = document.createElement('div');
          ((mn.className = 'sw-q-mirror-notice'), mn.setAttribute('style', 'background:#eff4f8;border:1px solid #1e4381;border-radius:8px;padding:14px 18px;margin-bottom:20px;font-size:13px;color:#121f2f;line-height:1.5;font-family:Montserrat,Arial,sans-serif'), (mn.innerHTML = "<strong style='color:#1e4381;'>Mirror will:</strong> You complete one set of instructions. Each spouse gives their own identity details. Anyone named as executor, beneficiary or guardian is mirrored into your spouse's will."));
          s2.insertBefore(mn, s2.firstChild ? s2.firstChild.nextSibling : null);
        }
      }
      const draft = checkForDraft();
      (showStep(1),
        requestAnimationFrame(() => {
          (applyConditionals(), updateRadioStates(), injectAllUploads(), injectAllEidUploads(), wireEidUploadListeners(), injectExcludedJurisdictionPickers(), isCouplesMode() && mirrorAtoB(), swExclRebuildAll(), draft && showResumeBanner(draft), (window._sw_init_done = !0));
        }));
    }
    'loading' === document.readyState ? document.addEventListener('DOMContentLoaded', init) : init();
  })();