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
      MAX_BLOCKS = { executor: 2, 'executor-b': 2, substitute_executor: 2, 'sub-executor': 2, guardian: 1, sub_guardian: 1, interim_guardian: 1, sub_interim_guardian: 1 },
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
      OPTIONAL_FIELDS = new Set(['q19_disposition', 'q19_other_disposition', 'q20_location_pref', 'q20_location_details', 'q21_directions_pref', 'q21_directions_details', 'q38_additional', 'q38_additional_details'].flatMap((n) => [n, n + '_b'])),
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
        if (ex) return;
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
      ((s.id = 'sw-q-runtime-styles'), (s.textContent = `.sw-q-radio-row.sw-q-radio-checked{border:2px solid #1e4381!important;background-color:#eff4f8!important;padding:9px 13px!important}\n.sw-q-radio-row.sw-q-radio-checked>span{font-weight:600!important;color:#121f2f!important}\n.sw-q-invalid{border-color:#c0392b!important;background-color:#fdf2f0!important}\n.sw-q-field-error{color:#c0392b;font-size:12px;margin-top:6px;font-weight:600}\n.sw-q-error-banner{background:#fdf2f0;border:1px solid #c0392b;color:#c0392b;padding:14px 18px;border-radius:6px;margin-bottom:20px;font-size:13px;font-weight:600;line-height:1.5}\n.sw-q-block-remove{margin-top:12px;background:transparent;border:1px solid rgba(192,57,43,.3);color:#c0392b;padding:8px 14px;font-size:11px;font-weight:700;letter-spacing:.06em;text-transform:uppercase;border-radius:4px;cursor:pointer}\n.sw-q-block-remove:hover{background:#fdf2f0}\n[data-add-block].sw-q-add-disabled{opacity:.4!important;pointer-events:none!important}\n.sw-q-excl-tags{display:flex;flex-wrap:wrap;gap:8px;margin-top:10px}\n.sw-q-excl-tag{display:inline-flex;align-items:center;gap:8px;background:#eff4f8;border:1px solid #1e4381;color:#121f2f;border-radius:16px;padding:5px 6px 5px 12px;font-size:13px;font-weight:600;line-height:1}\n.sw-q-excl-tag-x{border:none;background:transparent;color:#1e4381;font-size:16px;font-weight:700;line-height:1;cursor:pointer;padding:0 4px}\n.sw-q-excl-tag-x:hover{color:#c0392b}\n.sw-q-uploaded-state{display:flex;align-items:center;gap:10px;margin-top:8px;font-size:13px;color:#1e4381;font-weight:600;line-height:1.4}\n.sw-q-uploaded-state-icon{color:#27ae60;font-size:15px}\n.sw-q-uploaded-state-view{color:#1e4381;font-size:12px;text-decoration:underline}`), document.head.appendChild(s));
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
        $$('.sw-q-radio-row', clone).forEach((r) => r.classList.remove('sw-q-radio-checked', 'sw-q-invalid')),
        $$('.sw-q-field-error', clone).forEach((e) => e.remove()),
        !$('.sw-q-block-remove', clone))
      ) {
        const removeBtn = document.createElement('button');
        ((removeBtn.type = 'button'),
          (removeBtn.className = 'sw-q-block-remove'),
          (removeBtn.textContent = '× Remove'),
          removeBtn.addEventListener('click', () => {
            (clone.remove(), renumberBlocks(blockType), applyConditionals(), saveDraft());
          }),
          clone.appendChild(removeBtn));
      }
      (list.appendChild(clone), convertCountryFields(), prefillUaePhones(), injectAllUploads(), injectAllEidUploads(), wireEidUploadListeners(), updateAddButtonStates(), saveDraft());
    }
    function renumberBlocks(blockType) {
      const list = $('[data-block-list="' + blockType + '"]');
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
          a = d._savedAt ? Date.now() - new Date(d._savedAt).getTime() : 0;
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
      requestAnimationFrame(() => {
        (data._step && showStep(data._step),
          updateRadioStates(),
          applyConditionals(),
          rebuildPersonDropdowns(),
          injectExcludedJurisdictionPickers(),
          swRenderUploadedState(),
          requestAnimationFrame(() => {
            (applyConditionals(), rebuildPersonDropdowns(), injectExcludedJurisdictionPickers(), swRenderUploadedState(), saveDraft());
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
      for (const i of $$('input[type="file"]')) {
        if (i.files && i.files[0]) {
          const f = await shrinkImg(i.files[0]);
          fd.append(i.name, f, f.name);
        }
      }
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
          if (data && data.ok) { swUploadedFiles[name] = { key: data.key, filename: data.filename, url: data.url }; swRenderUploadedState(); }
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
      // Testators
      people.push(swReadPerson(swTestatorFields(''), 'Testator A'));
      if (isCouplesMode()) people.push(swReadPerson(swTestatorFields('_b'), 'Testator B'));
      // Repeatable person blocks (hyphenated data-block, underscored field prefix)
      var blockSpecs = [
        { db: 'executor', prefix: 'executor', label: 'Executor' },
        { db: 'executor-b', prefix: 'executor_b', label: 'Executor (B)' },
        { db: 'sub-executor', prefix: 'sub_executor', label: 'Substitute executor' },
        { db: 'primary-beneficiary', prefix: 'primary_ben', label: 'Beneficiary' },
        { db: 'secondary-beneficiary', prefix: 'secondary_ben', label: 'Secondary beneficiary' },
      ];
      blockSpecs.forEach(function (spec) {
        swBlockIndices(spec.db).forEach(function (idx) {
          people.push(swReadPerson(swBlockFields(spec.prefix, idx), spec.label + ' ' + idx));
        });
      });
      // Children (a source of people, per firm decision)
      swBlockIndices('child').forEach(function (idx) {
        people.push(swReadPerson(swChildFields(idx), 'Child ' + idx));
      });
      // Fixed guardian sections
      var guardianSpecs = [
        { prefix: 'perm_guardian', label: 'Permanent guardian' },
        { prefix: 'sub_perm', label: 'Substitute permanent guardian' },
        { prefix: 'interim', label: 'Interim guardian' },
        { prefix: 'sub_interim', label: 'Substitute interim guardian' },
      ];
      guardianSpecs.forEach(function (spec) {
        people.push(swReadPerson(swGuardianFields(spec.prefix), spec.label));
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
      if ('' === idx) {
        swPopulateTarget(fields, null); // clear for fresh entry
        return;
      }
      var registry = buildPersonRegistry();
      var person = registry[parseInt(idx, 10)];
      if (!person) return;
      swPopulateTarget(fields, person);
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
        if (ref.url) {
          var viewLink = document.createElement('a');
          ((viewLink.className = 'sw-q-uploaded-state-view'),
            (viewLink.href = ref.url),
            (viewLink.target = '_blank'),
            viewLink.setAttribute('rel', 'noopener'),
            (viewLink.textContent = 'View'));
          row.appendChild(viewLink);
        }
        // Insert after the file input so it sits below it.
        inp.parentNode.insertBefore(row, inp.nextSibling);
      });
    }
    function saveAndExit() {
      (clearTimeout(window._sw_save_t), saveDraft(), alert('Progress saved. Return within 7 days. Files must be re-uploaded.'), (window.location.href = '/wills-services'));
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