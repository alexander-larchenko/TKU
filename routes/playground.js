// Centralized configuration for selectors, timings, and retry counts
const CONFIG = {
    selectors: {
        serverTime: '#servertime>.clickable',
        attack: '.clickableContainer.missionType3',
        raid: '.clickableContainer.missionType4',
        siege: '.clickableContainer.missionType47',
        continueButton: '.send-troops .buttonContainer .next.clickable',
        arrivalTime: '.arrivalTime span:nth-child(2)',
        sendTroopsButton: '.sendTroops.clickable',
        troopsInputs: {
            phalanx: '.inputTroops .unit1 input',
            sword: '.inputTroops .unit2 input',
            scout: '.inputTroops .unit3 input',
            thunder: '.inputTroops .unit4 input',
            druid: '.inputTroops .unit5 input',
            haeduan: '.inputTroops .unit6 input',
            taran: '.inputTroops .unit7 input',
            cata: '.inputTroops .unit8 input',
            leader: '.inputTroops .unit9 input',
            settler: '.inputTroops .unit10 input',
            hero: '.inputTroops .hero input',
        }
    },
    intervals: {
        checkMs: 500, // polling interval for waitUntilTime
        postSelectContinueDelayMs: 200, // delay before checking/clicking Continue after selecting attack type
        ensureContinueTotalMs: 5000, // total time to keep trying to enable Continue
        ensureContinueIntervalMs: 500, // interval between retry cycles for Continue
        toggleDelayMs: 100, // delay between toggling attack types
        postContinueFirstArrivalDelayMs: 500, // delay before first arrival-time check or send click
        arrivalVerifyMaxChecks: 10, // number of arrival checks
        arrivalVerifyIntervalMs: 500, // interval between arrival checks
        sendTroopsMaxRetries: 3, // retries when sendTroops button not found
        sendTroopsRetryDelayMs: 500, // delay between retries for sendTroops
    }
};

// Parses a time string in format "hh:mm:ss" to total seconds (number)
function parseHmsToSeconds(hms) {
    if (typeof hms !== 'string') return NaN;
    const parts = hms.trim().split(':');
    if (parts.length !== 3) return NaN;
    const [hh, mm, ss] = parts.map(Number);
    if ([hh, mm, ss].some(n => Number.isNaN(n))) return NaN;
    return hh * 3600 + mm * 60 + ss;
}

function formatSecondsToHms(totalSeconds) {
    if (!Number.isFinite(totalSeconds) || totalSeconds < 0) totalSeconds = 0;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const pad = (n) => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

// Lightweight UI overlay to control waitUntilTime and display status
// Helper to parse settingsString per specification
function parseSettingsString(settingsString){
    try{
        if (!settingsString || typeof settingsString !== 'string') return null;
        let raw = settingsString.trim();
        if (!raw) return null;
        // Normalize edge case: some sources add a newline after speed marker with a lone number, e.g. '(Скорость: 3 -50%)\t1\n'
        // Remove that newline so the stray number does not become its own line and confuse troop parsing.
        raw = raw.replace(/(\(\s*Скорость\s*:\s*[34](?:\s*-\s*50%\s*)?\)\s*\d+)\s*\r?\n/gi, '$1 ');
        // General normalization: remove all newlines except those located before a line that looks like a village name with coordinates "Name (x|y)"
        // 1) Unify newlines to \n
        let _norm = raw.replace(/\r\n/g, '\n');
        // 2) Keep newlines only if the following line starts with something containing coordinates in parentheses.
        //    This preserves separators between plan entries that start with a starting village line.
        const keepNewlineAheadOfCoords = /\n+(?=\s*.*\(\s*[-+]?\d+\s*\|\s*[-+]?\d+\s*\))/g;
        _norm = _norm.replace(keepNewlineAheadOfCoords, '\n');
        // 3) Replace any other newlines with a space to avoid breaking parsing within a single entry.
        raw = _norm.replace(/\n+/g, ' ');
        const text = raw.replace(/\u00A0/g, ' ').replace(/[\t]+/g, ' ').replace(/[ ]{2,}/g, ' ').trim();
        // Extract time tokens (first two are targetTime and arrivalTime)
        const timeMatches = text.match(/\b\d{1,2}:\d{2}:\d{2}\b/g) || [];
        const targetTime = timeMatches[0] || undefined;
        const arrivalTime = timeMatches[1] || undefined;
        // Detect speed/attack mapping
        let attackType = undefined; // 'raid' | 'siege'
        let attackLabel = undefined; // 'taranRaid'|'cataRaid'|'taranSiege'|'cataSiege'
        const speedRe = /\(\s*Скорость\s*:\s*([34])(?:\s*-\s*50%\s*)?\)/i;
        const speedMatch = text.match(speedRe);
        if (speedMatch){
            const num = speedMatch[1];
            const hasPenalty = /-\s*50%/.test(speedMatch[0]);
            if (num === '4' && !hasPenalty){ attackType='raid'; attackLabel='taranRaid'; }
            if (num === '3' && !hasPenalty){ attackType='raid'; attackLabel='cataRaid'; }
            if (num === '4' && hasPenalty){ attackType='siege'; attackLabel='taranSiege'; }
            if (num === '3' && hasPenalty){ attackType='siege'; attackLabel='cataSiege'; }
        }
        // Troops tail parsing. Robustly detect a trailing line like "* 500" (or 'x 500')
        // Enhancement: support unit suffix 'haed'/'haeduan' as in '1500haed' meaning 1500 haeduan instead of phalanx
        let troopsDelta = {};
        let baseCount = undefined;
        let unitKey = 'phalanx';
        try {
            const lines = String(raw).split(/\r?\n/).map(s=>s.trim()).filter(s=>s.length>0);
            // Find the LAST line that starts with '*' or 'x' followed by a number, optionally suffixed with 'haed'/'haeduan'
            for (let i = lines.length - 1; i >= 0; i--) {
                const lm = lines[i].match(/^([*xX])\s*(\d+)\s*(haed(?:uan)?)?\s*$/i);
                if (lm) {
                    baseCount = parseInt(lm[2], 10);
                    if (lm[3]) unitKey = 'haeduan';
                    break;
                }
            }
            if (!Number.isFinite(baseCount)){
                // Fallback: inspect the last non-empty line for patterns like:
                //  - "2500"
                //  - "2500 haed" or "2500haed" (haeduan)
                //  - "2500 druid"
                //  - "2500 + sword"
                const tail = lines[lines.length - 1] || '';
                let m = tail.match(/(\d+)\s*haed(?:uan)?\s*$/i) || tail.match(/(\d+)haed(?:uan)?$/i);
                if (m) {
                    baseCount = parseInt(m[1], 10);
                    unitKey = 'haeduan';
                } else {
                    m = tail.match(/(\d+)\s*(druid)?\s*(?:\+\s*sword)?\s*$/i);
                    if (m) { baseCount = parseInt(m[1], 10); }
                }
            }
        } catch(_) { /* ignore */ }
        if (Number.isFinite(baseCount)){
            // Determine modifiers: druid and/or +sword based on the last line content only
            const lines = String(raw).split(/\r?\n/).map(s=>s.trim()).filter(s=>s.length>0);
            const tail = lines[lines.length - 1] || '';
            const hasDruid = /\bdruid\b/i.test(tail);
            const hasSword = /\+\s*sword/i.test(tail) || /\bsword\b/i.test(tail);
            if (baseCount>0){
                troopsDelta[unitKey] = (troopsDelta[unitKey]||0) + baseCount;
                if (hasDruid){ troopsDelta.druid = (troopsDelta.druid||0) + baseCount; }
                if (hasSword){ troopsDelta.sword = (troopsDelta.sword||0) + 1; }
            }
            // Requirement: if tail specifies 'druid' or '+sword', force simple raid attack selection
            if (hasDruid || hasSword){
                attackType = 'raid';
                attackLabel = 'simple';
            }
        }
        return { targetTime, arrivalTime, attackType, attackLabel, troopsDelta };
    }catch(e){
        console.warn('parseSettingsString error:', e);
        return null;
    }
}

(function(){
    const UI_ID = 'waitUntilOverlay';
    function ensureUI(){
        let el = document.getElementById(UI_ID);
        if (el) return window.WaitUntilUI;
        el = document.createElement('div');
        el.id = UI_ID;
        el.style.position = 'fixed';
        el.style.top = '8px';
        el.style.right = '8px';
        el.style.left = '';
        el.style.transform = '';
        el.style.zIndex = '999999';
        el.style.background = 'rgba(0,0,0,0.8)';
        el.style.color = '#fff';
        el.style.padding = '10px 12px';
        el.style.borderRadius = '8px';
        el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.4)';
        el.style.font = '16px/1.4 Arial, sans-serif';
        el.style.maxWidth = '92vw';
        el.style.minWidth = '280px';

        // Build form
        const form = document.createElement('form');
        form.style.display = 'grid';
        form.style.gridTemplateColumns = 'auto auto auto auto auto';
        form.style.gap = '6px 10px';
        form.style.alignItems = 'center';

        function label(text){ const l = document.createElement('label'); l.textContent = text; return l; }
        function inputText(placeholder, value){ const i=document.createElement('input'); i.type='text'; i.placeholder=placeholder; if(value!=null) i.value=value; i.style.width='90px'; return i; }
        function inputNum(){ const i=document.createElement('input'); i.type='number'; i.min='0'; i.step='1'; i.style.width='70px'; return i; }
        function makeRadio(name, value, labelText){ const wrap=document.createElement('label'); wrap.style.display='inline-flex'; wrap.style.alignItems='center'; wrap.style.gap='4px'; const r=document.createElement('input'); r.type='radio'; r.name=name; r.value=value; wrap.appendChild(r); const sp=document.createElement('span'); sp.textContent=labelText; wrap.appendChild(sp); return {wrap, input:r}; }

        // settingsString at the very top
        const settingsStringInput = document.createElement('input');
        settingsStringInput.type = 'text';
        settingsStringInput.placeholder = 'Paste settingsString here';
        settingsStringInput.style.width = '100%';
        settingsStringInput.style.gridColumn = '1 / -1';
        form.appendChild(label('settingsString:'));
        // Make label span first column and input span rest
        const settingsRow = document.createElement('div');
        settingsRow.style.display='contents';
        form.appendChild(settingsStringInput);

        const targetTimeInput = inputText('hh:mm:ss', '00:00:00');
        const radioGroupLabel = 'attackOption';
        const r1 = makeRadio(radioGroupLabel, 'simple', 'simple attack (raid)');
        const r2 = makeRadio(radioGroupLabel, 'taranRaid', 'taran raid');
        const r3 = makeRadio(radioGroupLabel, 'cataRaid', 'cata raid');
        const r4 = makeRadio(radioGroupLabel, 'taranSiege', 'taran siege');
        const r5 = makeRadio(radioGroupLabel, 'cataSiege', 'cata siege');
        r2.input.checked = true;
        // Helper to programmatically select an attack option radio
        function setAttackOption(opt){
            try{
                const map = { simple: r1, taranRaid: r2, cataRaid: r3, taranSiege: r4, cataSiege: r5 };
                [r1,r2,r3,r4,r5].forEach(x=>{ if(x && x.input) x.input.checked = false; });
                if (map[opt] && map[opt].input) { map[opt].input.checked = true; }
            }catch(_){ /* noop */ }
        }
        const arrivalTimeInput = inputText('hh:mm:ss', '10:00:01');

        form.appendChild(label('targetTime:'));
        form.appendChild(targetTimeInput);

        // Attack options header and vertical group (start on new line)
        const attackHeader = document.createElement('div');
        attackHeader.style.gridColumn = '1 / -1';
        attackHeader.style.marginTop = '4px';
        attackHeader.textContent = 'attack:';
        form.appendChild(attackHeader);

        const attackGroup = document.createElement('div');
        attackGroup.style.gridColumn = '1 / -1';
        attackGroup.style.display = 'flex';
        attackGroup.style.flexDirection = 'column';
        attackGroup.style.alignItems = 'flex-start';
        attackGroup.style.gap = '4px';
        attackGroup.appendChild(r1.wrap);
        attackGroup.appendChild(r2.wrap);
        attackGroup.appendChild(r3.wrap);
        attackGroup.appendChild(r4.wrap);
        attackGroup.appendChild(r5.wrap);
        form.appendChild(attackGroup);

        // Troops row header
        const troopsHeader = document.createElement('div');
        troopsHeader.style.gridColumn = '1 / -1';
        troopsHeader.style.marginTop = '4px';
        troopsHeader.textContent = 'Troops (enter numbers):';
        form.appendChild(troopsHeader);

        const troopsInputs = {};
        const troopKeys = Object.keys((CONFIG && CONFIG.selectors && CONFIG.selectors.troopsInputs) || {}).filter(k => !['leader','settler','taran','cata'].includes(k));
        troopKeys.forEach(k => {
            form.appendChild(label(k+':'));
            const inp = inputNum();
            inp.placeholder = '0';
            inp.value = '';
            troopsInputs[k] = inp;
            form.appendChild(inp);
            // fill row with empty spans to keep grid aligned per 5 columns
            form.appendChild(document.createElement('span'));
            form.appendChild(document.createElement('span'));
            form.appendChild(document.createElement('span'));
        });

        const arrLbl = label('arrivalTime:');
        arrLbl.style.marginTop='4px';
        arrivalTimeInput.style.marginTop='4px';
        form.appendChild(arrLbl);
        form.appendChild(arrivalTimeInput);

        const submitBtn = document.createElement('button');
        submitBtn.type = 'submit';
        submitBtn.textContent = 'SUBMIT Start waitUntilTime';
        submitBtn.style.marginLeft = '8px';
        form.appendChild(submitBtn);

        const closeBtn = document.createElement('button');
        closeBtn.type = 'button';
        closeBtn.textContent = '✕';
        closeBtn.title = 'Hide panel';
        closeBtn.style.marginLeft = '8px';
        closeBtn.style.background = '#c0392b';
        closeBtn.style.color = '#fff';
        closeBtn.style.border = 'none';
        closeBtn.style.padding = '4px 8px';
        closeBtn.style.borderRadius = '4px';
        closeBtn.onclick = () => { el.style.display = 'none'; };
        form.appendChild(closeBtn);

        // Edit button (visible when form is hidden)
        const editBtn = document.createElement('button');
        editBtn.type = 'button';
        editBtn.textContent = 'Edit';
        editBtn.title = 'Edit parameters';
        editBtn.style.display = 'none';
        editBtn.style.marginLeft = '8px';
        editBtn.style.background = '#444';
        editBtn.style.color = '#fff';
        editBtn.style.border = 'none';
        editBtn.style.padding = '4px 8px';
        editBtn.style.borderRadius = '4px';
        editBtn.onclick = () => { form.style.display = 'grid'; editBtn.style.display = 'none'; try{ settingsStringInput.focus(); settingsStringInput.select(); }catch(_){ } };

        el.appendChild(form);
        el.appendChild(editBtn);

        const status = document.createElement('div');
        status.style.marginTop = '6px';
        status.style.borderTop = '1px solid rgba(255,255,255,0.2)';
        status.style.paddingTop = '6px';
        status.textContent = 'Status: ready.';
        el.appendChild(status);

        document.body.appendChild(el);
        try{ setTimeout(()=>{ settingsStringInput.focus(); settingsStringInput.select(); }, 0); }catch(_){ }

        const UI = {
            el, form, status, editBtn, settingsStringInput,
            show(){ el.style.display=''; try{ settingsStringInput.focus(); settingsStringInput.select(); }catch(_){ } },
            setAccepted(params){
                // Save first so helper can use it
                this.currentParams = params;
                const p = this.currentParams || {};
                const escapeHtml = (s) => String(s)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');
                const labelForOption = (opt) => ({
                    simple: 'simple attack (raid)',
                    taranRaid: 'taran raid',
                    cataRaid: 'cata raid',
                    taranSiege: 'taran siege',
                    cataSiege: 'cata siege'
                })[opt];
                const colorForOption = (opt) => ({
                    simple: '#ffffff',
                    taranRaid: '#90ee90',
                    cataRaid: '#add8e6',
                    taranSiege: '#006400',
                    cataSiege: 'blue'
                })[opt] || '#ffffff';

                const parts = [];
                if (p.targetTime) parts.push(`targetTime=${escapeHtml(p.targetTime)}`);
                // Show attack type based on selected radio option (preferred over attackType param)
                const opt = p.attackOption || (function(){ try{ const v = window.WaitUntilUI && window.WaitUntilUI.getFormValues && window.WaitUntilUI.getFormValues(); return v && v.attackOption; } catch(_){ return undefined; } })() || 'simple';
                const label = labelForOption(opt) || opt;
                const color = colorForOption(opt);
                parts.push(`attackType=<span style="color:${color};font-size:20px;font-weight:700;">${escapeHtml(label)}</span>`);
                if (p.arrivalTime) parts.push(`arrivalTime=${escapeHtml(p.arrivalTime)}`);
                if (p.troops && Object.keys(p.troops).length>0) parts.push(`troops=${escapeHtml(JSON.stringify(p.troops))}`);

                status.style.color = '#fff';
                status.innerHTML = 'Status: parameters accepted: ' + parts.join('; ');
                // After accepting parameters, hide the form and show the Edit button
                try { form.style.display = 'none'; } catch(_){}
                try { editBtn.style.display = 'inline-block'; } catch(_){}
            },
            setCountdown(info){
                status.style.color = '#fff';
                const p = this.currentParams || {};
                const escapeHtml = (s) => String(s)
                    .replace(/&/g, '&amp;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#039;');

                // Derive attack mode to colorize attackType
                const getAttackMode = (pp) => {
                    const t = (pp && pp.troops) || {};
                    const hasTaran = Number(t.taran) > 0;
                    const hasCata = Number(t.cata) > 0;
                    if (pp.attackType === 'siege') {
                        if (hasCata) return 'cataSiege';
                        if (hasTaran) return 'taranSiege';
                    } else { // raid/attack treated as raid for coloring
                        if (hasCata) return 'cataRaid';
                        if (hasTaran) return 'taranRaid';
                    }
                    return 'simple';
                };
                const colorForMode = (mode) => ({
                    simple: '#ffffff',
                    taranRaid: '#90ee90',
                    cataRaid: '#add8e6',
                    taranSiege: '#006400',
                    cataSiege: 'blue'
                })[mode] || '#ffffff';

                // Prepare params lines
                const targetVal = p.targetTime ? String(p.targetTime) : '';
                const arrivalVal = p.arrivalTime ? String(p.arrivalTime) : '';
                const troopsVal = (p.troops && Object.keys(p.troops).length>0) ? JSON.stringify(p.troops) : '';

                // Attack type from selected radio option (leave unchanged formatting)
                const opt = p.attackOption || (function(){ try{ const v = window.WaitUntilUI && window.WaitUntilUI.getFormValues && window.WaitUntilUI.getFormValues(); return v && v.attackOption; } catch(_){ return undefined; } })() || 'simple';
                const labelForOption = (o) => ({
                    simple: 'simple attack (raid)',
                    taranRaid: 'taran raid',
                    cataRaid: 'cata raid',
                    taranSiege: 'taran siege',
                    cataSiege: 'cata siege'
                })[o];
                const colorForOption = (o) => ({
                    simple: '#ffffff',
                    taranRaid: '#90ee90',
                    cataRaid: '#add8e6',
                    taranSiege: '#006400',
                    cataSiege: 'blue'
                })[o] || '#ffffff';
                const optLabel = labelForOption(opt) || opt;
                const typeStr = (this.currentParams && this.currentParams.attackType) ? String(this.currentParams.attackType) : '';
                const attackHtml = `<div>attackLabel=<span style="color:${colorForOption(opt)};font-size:20px;font-weight:700;">${escapeHtml(optLabel)}</span>${typeStr ? `; attackType=${escapeHtml(typeStr)}` : ''}</div>`;

                // Build targetTime and arrivalTime on one line
                let targetArrivalHtml = '';
                if (targetVal || arrivalVal){
                    const parts = [];
                    if (targetVal) parts.push(`targetTime=${escapeHtml(targetVal)}`);
                    if (arrivalVal) parts.push(`arrivalTime=${escapeHtml(arrivalVal)}`);
                    targetArrivalHtml = `<div>${parts.join('; ')}</div>`;
                }
                const troopsHtml = troopsVal ? `<div>troops=${escapeHtml(troopsVal)}</div>` : '';
                const paramsHtml = attackHtml + targetArrivalHtml + troopsHtml;

                // Build current and target on one line
                const cur = info && info.current ? `current: ${escapeHtml(info.current)}` : '';
                const tgt = info && info.target ? `target: ${escapeHtml(info.target)}` : '';
                let currentTargetHtml = '';
                if (cur || tgt){
                    const parts = [];
                    if (cur) parts.push(cur);
                    if (tgt) parts.push(tgt);
                    currentTargetHtml = `<div style="color:#ffffff;">${parts.join(' | ')}</div>`;
                }
                const remainingHtml = info && info.remaining ? `<div style="color:#ff4d4f;font-size:24px;font-weight:700;">remaining: ${escapeHtml(info.remaining)}</div>` : '';

                // No extra blank line after remaining; attackType left unchanged
                status.innerHTML = `Status: waiting —<br>${currentTargetHtml}${remainingHtml}${paramsHtml}`;
            },
            setSuccess(params, actualArrivalSeconds){
                const p = params || this.currentParams || {};
                const parts = [];
                try { parts.push(`targetTime=${String(p.targetTime||'')}`); } catch(_){}
                try { parts.push(`attackType=${String(p.attackType||'')}`); } catch(_){}
                try { if (p.attackOption) parts.push(`attackOption=${String(p.attackOption)}`); } catch(_){}
                try { if (p.troops && Object.keys(p.troops).length>0) parts.push(`troops=${JSON.stringify(p.troops)}`); } catch(_){}
                let arrivalInfo = '';
                if (Number.isFinite(actualArrivalSeconds)) {
                    try {
                        arrivalInfo = ` (arrival verified: ${formatSecondsToHms(actualArrivalSeconds)})`;
                    } catch(_){}
                }
                status.style.color = '#2ecc71';
                status.style.fontSize = '20px';
                status.innerHTML = `Status: executed successfully${arrivalInfo}.<br><span style="font-size:14px;color:#fff;">Params: ${parts.join('; ')}</span>`;
            },
            setError(text){ status.style.color = '#ff4d4f'; status.textContent = 'Status: error — ' + text; },
            currentParams: undefined,
            getFormValues(){
                const settingsString = String(settingsStringInput.value||'').trim();
                const targetTime = String(targetTimeInput.value||'').trim();
                const arrivalTime = String(arrivalTimeInput.value||'').trim();
                const troops = {};
                for (const k of troopKeys){
                    const v = Number(troopsInputs[k].value);
                    if (Number.isFinite(v) && v>0){ troops[k]=Math.floor(v); }
                }
                let attackOption = 'simple';
                const sel = [r1,r2,r3,r4,r5].find(x=>x && x.input && x.input.checked);
                if (sel) attackOption = sel.input.value;
                return { settingsString, targetTime, troops, arrivalTime, attackOption };
            }
        };
        window.WaitUntilUI = UI;

        form.addEventListener('submit', function(ev){
            ev.preventDefault();
            try{
                const v = UI.getFormValues();
                UI.show();

                let targetTime = v.targetTime;
                let arrivalTime = v.arrivalTime;
                let attackOption = v.attackOption;
                const baseTroops = v.troops || {};
                const finalTroops = { ...baseTroops };

                // If settingsString provided, parse and prioritize
                let settingsParsed = null;
                if (v.settingsString){
                    settingsParsed = parseSettingsString(v.settingsString);
                    if (!settingsParsed){
                        UI.setError('Unable to parse settingsString. Please check the format.');
                        return;
                    }
                    if (settingsParsed.targetTime) targetTime = settingsParsed.targetTime;
                    if (settingsParsed.arrivalTime) arrivalTime = settingsParsed.arrivalTime;
                    if (settingsParsed.attackLabel) {
                        attackOption = settingsParsed.attackLabel;
                        // reflect in UI radio selection
                        try { if (typeof setAttackOption === 'function') setAttackOption(attackOption); } catch(_){ }
                    }
                    // merge troops deltas
                    if (settingsParsed.troopsDelta && Object.keys(settingsParsed.troopsDelta).length){
                        for (const k in settingsParsed.troopsDelta){
                            finalTroops[k] = (finalTroops[k]||0) + settingsParsed.troopsDelta[k];
                        }
                        // Mark that troopsDelta was already applied to avoid double-application in waitUntilTime
                        settingsParsed.appliedTroopsDelta = true;
                    }
                }

                // Build final params based on (possibly overridden) attack option
                let attackType = 'raid';
                let typeFromLabel = 'raid';
                switch (attackOption) {
                    case 'taranRaid':
                        finalTroops.taran = (finalTroops.taran||0) + 1;
                        typeFromLabel = 'raid';
                        break;
                    case 'cataRaid':
                        finalTroops.cata = (finalTroops.cata||0) + 1;
                        typeFromLabel = 'raid';
                        break;
                    case 'taranSiege':
                        finalTroops.taran = (finalTroops.taran||0) + 1;
                        typeFromLabel = 'siege';
                        break;
                    case 'cataSiege':
                        finalTroops.taran = (finalTroops.taran||0) + 1;
                        finalTroops.cata = (finalTroops.cata||0) + 1;
                        typeFromLabel = 'siege';
                        break;
                    case 'simple':
                    default:
                        typeFromLabel = 'raid';
                        break;
                }
                // If settings provided explicit attackType, respect it; otherwise derive from label
                if (settingsParsed && settingsParsed.attackType) {
                    attackType = settingsParsed.attackType;
                } else {
                    attackType = typeFromLabel;
                }

                // Siege validation: total troops must be >= 1000
                if (attackType === 'siege') {
                    const total = Object.values(finalTroops).reduce((a,b)=>a + (Number.isFinite(b)?b:0), 0);
                    if (total < 1000) {
                        UI.setError(`For siege, total troops must be >= 1000. Current total: ${total}.`);
                        return; // abort submit
                    }
                }

                // Populate UI troop inputs with the computed values (from settingsString/base + attack option)
                try {
                    const keys = Object.keys(troopsInputs || {});
                    keys.forEach(k => {
                        const val = finalTroops[k];
                        if (Number.isFinite(val) && val > 0) {
                            troopsInputs[k].value = String(Math.floor(val));
                        } else {
                            troopsInputs[k].value = '';
                        }
                    });
                } catch(_) { /* noop */ }

                // Set accepted with final params
                const accepted = { targetTime, attackType, attackOption, troops: finalTroops, arrivalTime: arrivalTime || undefined };
                if (settingsParsed) accepted.settingsStringParsed = settingsParsed;
                UI.setAccepted(accepted);

                // Stop previous wait cycle if any
                try { if (window.WaitUntilIntervalId) { clearInterval(window.WaitUntilIntervalId); window.WaitUntilIntervalId = undefined; } } catch(_){ }

                if (targetTime){
                    if (!arrivalTime) {
                        // call without arrival param if empty
                        waitUntilTime(targetTime, attackType, null, Object.keys(finalTroops).length? finalTroops: undefined);
                    } else {
                        waitUntilTime(targetTime, attackType, null, Object.keys(finalTroops).length? finalTroops: undefined, arrivalTime);
                    }
                }
            }catch(e){ console.warn('UI submit error', e); UI.setError(String(e)); }
        });

        return UI;
    }
    window.ensureWaitUntilUI = ensureUI;
})();

// Plan Settings UI: shows a large textarea to paste multiline plan and a submit button
(function(){
    function ensurePlanUI(){
        try{
            if (window.PlanSettingsUI && window.PlanSettingsUI.root && document.body.contains(window.PlanSettingsUI.root)){
                return window.PlanSettingsUI;
            }
            const root = document.createElement('div');
            root.id = 'PlanSettingsUI';
            root.style.position = 'fixed';
            root.style.zIndex = 2147483000;
            root.style.left = '10%';
            root.style.top = '10%';
            root.style.width = '80%';
            root.style.maxHeight = '80%';
            root.style.overflow = 'auto';
            root.style.background = 'rgba(24,24,28,0.97)';
            root.style.color = '#eee';
            root.style.border = '1px solid #666';
            root.style.borderRadius = '8px';
            root.style.boxShadow = '0 8px 24px rgba(0,0,0,0.5)';
            root.style.padding = '12px';
            root.style.fontFamily = 'Segoe UI, Arial, sans-serif';
            root.style.display = 'none';

            const header = document.createElement('div');
            header.textContent = 'Plan Settings';
            header.style.fontSize = '16px';
            header.style.fontWeight = 'bold';
            header.style.marginBottom = '8px';
            header.style.cursor = 'move';
            header.style.userSelect = 'none';

            const ta = document.createElement('textarea');
            ta.id = 'planSettingsString';
            ta.placeholder = 'Paste your plan here...';
            ta.style.width = '100%';
            ta.style.minHeight = '500px';
            ta.style.boxSizing = 'border-box';
            ta.style.fontFamily = 'Consolas, monospace';
            ta.style.fontSize = '12px';
            ta.style.padding = '8px';
            ta.style.border = '1px solid #555';
            ta.style.borderRadius = '6px';
            ta.style.background = '#1e1f25';
            ta.style.color = '#eaeaea';

            const controls = document.createElement('div');
            controls.style.display = 'flex';
            controls.style.gap = '8px';
            controls.style.marginTop = '8px';
            
            const submitBtn = document.createElement('button');
            submitBtn.textContent = 'Submit';
            submitBtn.style.padding = '6px 12px';
            submitBtn.style.cursor = 'pointer';
            submitBtn.className = 'clickable';

            const closeBtn = document.createElement('button');
            closeBtn.textContent = 'Close';
            closeBtn.style.padding = '6px 12px';
            closeBtn.style.cursor = 'pointer';

            const status = document.createElement('div');
            status.style.marginTop = '6px';
            status.style.fontSize = '12px';
            status.style.opacity = '0.9';
            status.textContent = 'Status: ready. Paste your plan and press Submit.';

            controls.appendChild(submitBtn);
            controls.appendChild(closeBtn);

            root.appendChild(header);
            root.appendChild(ta);
            root.appendChild(controls);
            root.appendChild(status);

            document.body.appendChild(root);

            const UI = {
                root, textarea: ta, submitBtn, closeBtn, status,
                _drag:{active:false,dx:0,dy:0},
                _cancelToken: 0,
                show(){ root.style.display = 'block'; },
                hide(){ root.style.display = 'none'; },
                setStatus(t){ try{ status.textContent = String(t||''); }catch(_){} },
                enterReadOnly(){ try{ ta.style.display='none'; submitBtn.textContent='Edit'; }catch(_){} },
                enterEdit(){ try{ ta.style.display='block'; submitBtn.textContent='Submit'; }catch(_){} },
                isEditMode(){ return submitBtn.textContent === 'Submit'; },
                cancelCurrent(){
                    try { this._cancelToken++; } catch(_){ }
                    try { if (window.WaitUntilIntervalId) { clearInterval(window.WaitUntilIntervalId); window.WaitUntilIntervalId = undefined; } } catch(_){ }
                    try { if (window.WaitUntilUI){ window.WaitUntilUI.setSuccess = function(){}; window.WaitUntilUI.setError = function(){}; } } catch(_){ }
                },
                clearStatus(){ try{ status.innerHTML='Status: ready. Paste your plan and press Submit.'; }catch(_){} }
            };

            // Dragging behavior for the Plan UI
            (function(){
                const onPointerDown = (e)=>{
                    try{
                        UI._drag.active = true;
                        const rect = root.getBoundingClientRect();
                        UI._drag.dx = e.clientX - rect.left;
                        UI._drag.dy = e.clientY - rect.top;
                        root.setPointerCapture && root.setPointerCapture(e.pointerId||1);
                        e.preventDefault();
                    }catch(_){ }
                };
                const onPointerMove = (e)=>{
                    if (!UI._drag.active) return;
                    try{
                        const x = Math.max(0, Math.min(window.innerWidth - 40, e.clientX - UI._drag.dx));
                        const y = Math.max(0, Math.min(window.innerHeight - 40, e.clientY - UI._drag.dy));
                        root.style.left = x + 'px';
                        root.style.top = y + 'px';
                        root.style.right = '';
                        root.style.bottom = '';
                    }catch(_){ }
                };
                const onPointerUp = (e)=>{
                    UI._drag.active = false;
                    try{ root.releasePointerCapture && root.releasePointerCapture(e.pointerId||1); }catch(_){ }
                };
                header.addEventListener('pointerdown', onPointerDown);
                window.addEventListener('pointermove', onPointerMove);
                window.addEventListener('pointerup', onPointerUp);
            })();

            closeBtn.addEventListener('click', ()=> UI.hide());

            // Attach submit handler that parses, sorts by adjusted targetTime, and executes the plan sequentially
            submitBtn.addEventListener('click', ()=>{
                try{
                    // Toggle Edit/ReadOnly modes and prepare cancellation token
                    if (UI && typeof UI.isEditMode === 'function' && UI.isEditMode()){
                        try { UI.cancelCurrent(); UI.clearStatus(); UI.enterReadOnly(); } catch(_){}
                    } else {
                        try { UI.cancelCurrent(); UI.enterEdit(); } catch(_){}
                        return;
                    }
                    const myToken = (UI._cancelToken = (UI._cancelToken||0) + 1);
                    const isCancelled = ()=> UI._cancelToken !== myToken;
                    const escapeHtml = (s)=> String(s==null?'':s).replace(/[&<>"']/g, c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[c]));
                    const sleep = (ms)=> new Promise(res=> setTimeout(res, ms));
                    const adjustedSortSeconds = (hms)=>{
                        const secs = parseHmsToSeconds(hms);
                        if (!Number.isFinite(secs)) return Number.POSITIVE_INFINITY;
                        const twelve = 12*3600;
                        return secs < twelve ? secs + 24*3600 : secs;
                    };
                    const waitUntilTimeOnce = (targetTime, attackType, troopsInput, arrivalTime, attackOption)=>{
                        return new Promise(resolve=>{
                            try{
                                const UIRef = window.WaitUntilUI || {};
                                const origSucc = UIRef.setSuccess ? UIRef.setSuccess.bind(UIRef) : null;
                                const origErr  = UIRef.setError ? UIRef.setError.bind(UIRef) : null;
                                let done = false;
                                const restore = ()=>{
                                    try{ if (UIRef && typeof UIRef.setSuccess === 'function' && origSucc) UIRef.setSuccess = origSucc; }catch(_){}
                                    try{ if (UIRef && typeof UIRef.setError === 'function' && origErr) UIRef.setError = origErr; }catch(_){}
                                };
                                // Global hook so that even if WaitUntilUI object is replaced later, our plan can still resolve
                                try {
                                    const myHook = function(isOk, params, actualArrivalSecondsOrError){
                                        if (done) return;
                                        done = true;
                                        restore();
                                        try{ if (typeof isCancelled === 'function' && isCancelled()) { if (window.__PlanWaitHook === myHook) { window.__PlanWaitHook = null; } resolve({ ok:false, error: 'cancelled' }); return; } }catch(_){ }
                                        if (isOk) {
                                            resolve({ ok:true, params, actualArrivalSeconds: actualArrivalSecondsOrError });
                                        } else {
                                            resolve({ ok:false, error: String(actualArrivalSecondsOrError||'') });
                                        }
                                        if (window.__PlanWaitHook === myHook) { window.__PlanWaitHook = null; }
                                    };
                                    window.__PlanWaitHook = myHook;
                                } catch(_){ }
                                if (UIRef){
                                    UIRef.setSuccess = function(params, actualArrivalSeconds){
                                        try{ if (origSucc) origSucc(params, actualArrivalSeconds); }catch(_){}
                                        if (!done){
                                            done = true; restore();
                                            try{ if (typeof isCancelled === 'function' && isCancelled()) { resolve({ ok:false, error: 'cancelled' }); return; } }catch(_){ }
                                            resolve({ ok:true, params, actualArrivalSeconds });
                                        }
                                    };
                                    UIRef.setError = function(text){
                                        try{ if (origErr) origErr(text); }catch(_){}
                                        if (!done){
                                            done = true; restore();
                                            try{ if (typeof isCancelled === 'function' && isCancelled()) { resolve({ ok:false, error: 'cancelled' }); return; } }catch(_){ }
                                            resolve({ ok:false, error: String(text||'') });
                                        }
                                    };
                                }
                                // Reflect accepted params in WaitUntil UI before starting
                                try {
                                    if (UIRef && typeof UIRef.setAccepted === 'function') {
                                        UIRef.setAccepted({ targetTime, attackType, attackOption, troops: troopsInput, arrivalTime });
                                    }
                                } catch(_){}
                                // Kick off waitUntilTime with provided params
                                try {
                                    if (arrivalTime) {
                                        waitUntilTime(targetTime, attackType, null, troopsInput, arrivalTime);
                                    } else {
                                        waitUntilTime(targetTime, attackType, null, troopsInput);
                                    }
                                } catch (startErr) {
                                    restore();
                                    resolve({ ok:false, error: 'waitUntilTime start error: ' + startErr });
                                }
                            }catch(e){
                                resolve({ ok:false, error: 'waitUntilTimeOnce error: ' + e });
                            }
                        });
                    };
                    const formatCoords = (c)=> c && typeof c==='object' ? `(${c.x}|${c.y})` : '';

                    const rawText = String(ta.value||'');
                    // Normalize newlines to \n and join any newline(s) immediately before a '*' (troops line) into the same line
                    let text = rawText.replace(/\r\n/g,'\n').replace(/\r/g,'\n');
                    text = text.replace(/\n\s*\*/g, ' *');
                    const lines = text.split('\n').map(s=>s.trim()).filter(s=>s);
                    const results = [];
                    for (const line of lines){
                        // Extract starting village name and coordinates from the beginning
                        const startRx = /^\s*(.*?)\s*\(\s*([+-]?\d+)\s*\|\s*([+-]?\d+)\s*\)\s*/u;
                        const m1 = line.match(startRx);
                        if (!m1){ continue; }
                        const startingVillageName = m1[1].trim();
                        const sx = parseInt(m1[2],10), sy = parseInt(m1[3],10);
                        let rest = line.slice(m1[0].length);

                        // Extract target village name and coordinates next
                        const targetRx = /^(.*?)\s*\(\s*([+-]?\d+)\s*\|\s*([+-]?\d+)\s*\)\s*/u;
                        const m2 = rest.match(targetRx);
                        if (!m2){ continue; }
                        const targetVillageName = m2[1].trim();
                        const tx = parseInt(m2[2],10), ty = parseInt(m2[3],10);
                        rest = rest.slice(m2[0].length);

                        // Find all hh:mm:ss occurrences in the remainder
                        const timeIt = [...rest.matchAll(/\b\d{1,2}:\d{2}:\d{2}\b/g)];
                        let settingsString = '';
                        if (timeIt.length >= 1){
                            // Start from the FIRST time token so that targetTime (after date) and arrivalTime are both included
                            const firstIdx = timeIt[0].index;
                            settingsString = rest.slice(firstIdx).trim();
                        } else {
                            // Fallback: take the whole rest hoping parseSettingsString can handle it
                            settingsString = rest.trim();
                        }

                        const parsed = parseSettingsString(settingsString);

                        results.push({
                            startingVillageName,
                            startingVillageCoordinates: { x: sx, y: sy },
                            targetVillageName,
                            targetVillageCoordinates: { x: tx, y: ty },
                            settingsString,
                            settingsParsed: parsed || null
                        });
                    }

                    // Sort by adjusted targetTime (add 24h if < 12h)
                    const sortable = results.map((r, idx)=>{
                        const tt = r && r.settingsParsed ? r.settingsParsed.targetTime : undefined;
                        const key = adjustedSortSeconds(tt);
                        return { key, idx, r };
                    }).sort((a,b)=> a.key - b.key);
                    const ordered = sortable.map(x=> x.r);

                    console.log('Plan parsed results (ordered):', ordered);
                    UI.setStatus(`Parsed ${ordered.length} line(s). Executing in time order...`);
                    UI.planResults = ordered;

                    // Execute sequentially
                    (async function executeQueue(){
                        for (let i=0; i<ordered.length; i++){
                            const item = ordered[i];
                            try{
                                const sp = item.settingsParsed || {};
                                const tt = sp.targetTime;
                                const arr = sp.arrivalTime;
                                // Derive attack option and final troops same as WaitUntilTime UI
                                let attackOption = sp.attackLabel || 'simple';
                                let finalTroops = {};
                                if (sp.troopsDelta && Object.keys(sp.troopsDelta).length){ finalTroops = { ...sp.troopsDelta }; }
                                let typeFromLabel = 'raid';
                                switch (attackOption) {
                                    case 'taranRaid':
                                        finalTroops.taran = (finalTroops.taran||0) + 1;
                                        typeFromLabel = 'raid';
                                        break;
                                    case 'cataRaid':
                                        finalTroops.cata = (finalTroops.cata||0) + 1;
                                        typeFromLabel = 'raid';
                                        break;
                                    case 'taranSiege':
                                        finalTroops.taran = (finalTroops.taran||0) + 1;
                                        typeFromLabel = 'siege';
                                        break;
                                    case 'cataSiege':
                                        finalTroops.taran = (finalTroops.taran||0) + 1;
                                        finalTroops.cata = (finalTroops.cata||0) + 1;
                                        typeFromLabel = 'siege';
                                        break;
                                    case 'simple':
                                    default:
                                        typeFromLabel = 'raid';
                                        break;
                                }
                                const finalAttackType = (sp && sp.attackType) ? sp.attackType : typeFromLabel;

                                // Log start
                                const startLine = `Executing ${i+1}/${ordered.length}: ${escapeHtml(item.startingVillageName)} -> ${escapeHtml(item.targetVillageName)} ${escapeHtml(formatCoords(item.targetVillageCoordinates))} at ${escapeHtml(tt||'?')}...`;
                                UI.status.innerHTML = (UI.status.innerHTML ? UI.status.innerHTML + '<br>' : '') + startLine;

                                // 1. Select village
                                try { selectVillage(item.startingVillageName); } catch(_){}
                                await sleep(500);

                                // 2. Open send troops and select target
                                try { sendTroops(item.targetVillageName, item.targetVillageCoordinates); } catch(_){}

                                // 3. Wait until time
                                const res = await waitUntilTimeOnce(tt, finalAttackType, Object.keys(finalTroops).length? finalTroops: undefined, arr, attackOption);

                                // 4. Log results to Plan UI with color highlighting
                                const okText = res && res.ok ? 'SUCCESS' : `FAIL${res && res.error ? ': '+escapeHtml(res.error):''}`;
                                let details = '';
                                if (res && res.ok) {
                                    const verifiedArrival = (res && Number.isFinite(res.actualArrivalSeconds)) ? formatSecondsToHms(res.actualArrivalSeconds) : (res && res.params && res.params.arrivalTime ? res.params.arrivalTime : '?');
                                    const usedAttackType = (res && res.params && res.params.attackType) ? res.params.attackType : (finalAttackType || 'attack');
                                    const usedAttackLabel = (res && res.params && res.params.attackOption) ? res.params.attackOption : (attackOption || '');
                                    const troopsObj = (res && res.params && res.params.troops && typeof res.params.troops === 'object') ? res.params.troops : (finalTroops || {});
                                    const troopPairs = Object.entries(troopsObj || {}).filter(([k,v]) => Number(v) > 0).map(([k,v]) => `${escapeHtml(k)}:${escapeHtml(String(v))}`);
                                    const troopsStr = troopPairs.length ? troopPairs.join(', ') : 'none';
                                    details = ` [arrival: ${escapeHtml(verifiedArrival)}; troops: ${troopsStr}; type: ${escapeHtml(usedAttackType)}${usedAttackLabel ? ` (${escapeHtml(usedAttackLabel)})` : ''}]`;
                                }
                                const color = (res && res.ok) ? '#2e7d32' : '#c62828';
                                const line = `${escapeHtml(item.startingVillageName)} -> ${escapeHtml(item.targetVillageName)} ${escapeHtml(formatCoords(item.targetVillageCoordinates))} at ${escapeHtml(tt||'?')} = ${okText}${details}`;
                                const coloredLine = `<span style="color: ${color}">${line}</span>`;
                                UI.status.innerHTML = (UI.status.innerHTML ? UI.status.innerHTML + '<br>' : '') + coloredLine;

                            } catch (stepErr){
                                const line = `${escapeHtml(item.startingVillageName)} -> ${escapeHtml(item.targetVillageName)} ${escapeHtml(formatCoords(item.targetVillageCoordinates))} at ${escapeHtml((item.settingsParsed||{}).targetTime||'?')} = FAIL: ${escapeHtml(stepErr)}`;
                                const coloredLine = `<span style="color: #c62828">${line}</span>`;
                                UI.status.innerHTML = (UI.status.innerHTML ? UI.status.innerHTML + '<br>' : '') + coloredLine;
                            }
                        }
                        UI.status.innerHTML = (UI.status.innerHTML ? UI.status.innerHTML + '<br>' : '') + 'Plan execution finished.';
                    })();

                }catch(e){
                    console.warn('Plan submit error', e);
                    UI.setStatus('Error: ' + e);
                }
            });

            window.PlanSettingsUI = UI;
            return UI;
        }catch(e){ console.warn('ensurePlanUI error', e); return null; }
    }
    window.ensurePlanUI = ensurePlanUI;
})();

var attackSelector = CONFIG.selectors.attack;
var raidSelector = CONFIG.selectors.raid;
var siegeSelector = CONFIG.selectors.siege;

// Shows the Plan Settings UI and returns the UI instance
function runPlan(){
    try{
        let ui = null;
        if (typeof window.ensurePlanUI === 'function'){
            ui = window.ensurePlanUI();
        } else if (typeof ensurePlanUI === 'function'){
            ui = ensurePlanUI();
        }
        if (ui && typeof ui.show === 'function'){
            ui.show();
            try{ ui.setStatus('Status: ready. Paste your plan and press Submit.'); }catch(_){ }
        }
        return ui || null;
    }catch(e){ console.warn('runPlan error', e); return null; }
}

// Dispatches a realistic sequence of pointer/mouse events to mimic a real user click
function simulateUserClick(el) {
    try {
        if (!el || !(el instanceof Element)) return false;

        // Basic clickability/visibility checks
        const style = window.getComputedStyle(el);
        const rects = el.getClientRects();
        const visible = rects.length > 0 && style.visibility !== 'hidden' && style.display !== 'none' && style.pointerEvents !== 'none';
        if (!visible) {
            // Try bringing element into view first
            try {
                el.scrollIntoView({block: 'center', inline: 'center', behavior: 'instant'});
            } catch (_) {
                try {
                    el.scrollIntoView();
                } catch (_) {
                }
            }
        }

        // After potential scroll, recompute rect
        const rect = el.getBoundingClientRect();
        if (!rect || rect.width === 0 || rect.height === 0) {
            // Fallback later to el.click()
        }

        const cx = Math.floor(rect.left + rect.width / 2);
        const cy = Math.floor(rect.top + rect.height / 2);

        // Helper to create and dispatch events with realistic props
        const fire = (type, opts = {}) => {
            const base = {
                bubbles: true,
                cancelable: true,
                composed: true,
                view: window,
                clientX: cx,
                clientY: cy,
                screenX: (window.screenX || 0) + cx,
                screenY: (window.screenY || 0) + cy,
                button: 0,
                buttons: type === 'mousedown' ? 1 : 0,
                relatedTarget: null,
            };
            let ev;
            try {
                if (window.PointerEvent) {
                    ev = new PointerEvent(type, {
                        pointerId: 1,
                        pointerType: 'mouse',
                        isPrimary: true, ...base, ...opts
                    });
                } else {
                    ev = new MouseEvent(type, {...base, ...opts});
                }
            } catch (_) {
                // Older browsers: use deprecated initMouseEvent as last resort
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent(type, base.bubbles, base.cancelable, window, 0, base.screenX, base.screenY, base.clientX, base.clientY, false, false, false, false, base.button, null);
            }
            return el.dispatchEvent(ev);
        };

        // Move/hover over element
        try {
            fire('pointerover');
        } catch (_) {
        }
        try {
            fire('mouseover');
        } catch (_) {
        }
        try {
            fire('pointerenter', {bubbles: false});
        } catch (_) {
        }
        try {
            fire('mouseenter', {bubbles: false});
        } catch (_) {
        }
        try {
            fire('pointermove');
        } catch (_) {
        }
        try {
            fire('mousemove');
        } catch (_) {
        }

        // Press
        const downOk = fire('pointerdown');
        const mdownOk = fire('mousedown');

        // Focus if possible
        try {
            if (typeof el.focus === 'function') el.focus({preventScroll: true});
        } catch (_) {
            try {
                el.focus();
            } catch (_) {
            }
        }

        // Release and click
        const upOk = fire('pointerup');
        const mupOk = fire('mouseup');
        const clickOk = fire('click');

        return !!(downOk && mdownOk && upOk && mupOk && clickOk);
    } catch (e) {
        console.warn('simulateUserClick error, falling back to element.click():', e);
        try {
            if (el && typeof el.click === 'function') {
                el.click();
                return true;
            }
        } catch (_) {
        }
        return false;
    }
}

// Simulate moving the cursor to the center of the screen/viewport
// Simulate realistic user typing into a text input/textarea
function simulateUserTyping(input, text, opts) {
    try {
        if (!input) return false;
        const options = Object.assign({ clear: true, minDelayMs: 50, maxDelayMs: 150 }, opts || {});

        // Ensure the field is focused before typing
        try { simulateUserClick(input); } catch(_) {}
        try { if (typeof input.focus === 'function') input.focus({preventScroll: true}); } catch(_) { try { input.focus(); } catch(_) {} }
        try { if (document.activeElement !== input && typeof input.focus === 'function') input.focus(); } catch(_) {}

        // Optionally clear existing content (notify listeners)
        if (options.clear) {
            try {
                input.value = '';
                const clearEv = new Event('input', {bubbles: true, cancelable: false});
                input.dispatchEvent(clearEv);
            } catch(_) {}
        }

        const str = String(text ?? '');
        let i = 0;
        const typeNext = () => {
            if (i >= str.length) {
                // Final change event to signal completion
                try {
                    const changeEv = new Event('change', {bubbles: true, cancelable: false});
                    input.dispatchEvent(changeEv);
                } catch(_) {}
                return;
            }

            const ch = str[i++];

            // keydown
            try {
                const kd = new KeyboardEvent('keydown', { key: ch, code: undefined, bubbles: true, cancelable: true });
                input.dispatchEvent(kd);
            } catch(_) {}

            // Update value like real typing
            input.value += ch;

            // input event (use InputEvent when available)
            try {
                let ie;
                if (typeof InputEvent === 'function') {
                    ie = new InputEvent('input', { bubbles: true, cancelable: false, data: ch, inputType: 'insertText' });
                } else {
                    ie = new Event('input', { bubbles: true, cancelable: false });
                }
                input.dispatchEvent(ie);
            } catch(_) {}

            // keyup
            try {
                const ku = new KeyboardEvent('keyup', { key: ch, code: undefined, bubbles: true, cancelable: true });
                input.dispatchEvent(ku);
            } catch(_) {}

            // Schedule next character with a small random delay (50–150ms by default)
            const min = Math.max(0, Number(options.minDelayMs) || 50);
            const max = Math.max(min, Number(options.maxDelayMs) || 150);
            const delay = Math.floor(min + Math.random() * (max - min + 1));
            setTimeout(typeNext, delay);
        };

        // Start typing asynchronously
        setTimeout(typeNext, 0);
        return true; // indicate typing has started successfully
    } catch (e) {
        try { console.warn('simulateUserTyping error:', e); } catch(_) {}
        return false;
    }
}

function moveCursorToScreenCenter() {
    try {
        const cx = Math.max(0, Math.floor(window.innerWidth / 2));
        const cy = Math.max(0, Math.floor(window.innerHeight / 2));
        const target = document.elementFromPoint(cx, cy) || document.body || document.documentElement;
        if (!target) return false;

        const base = {
            bubbles: true,
            cancelable: true,
            composed: true,
            view: window,
            clientX: cx,
            clientY: cy,
            screenX: (window.screenX || 0) + cx,
            screenY: (window.screenY || 0) + cy,
        };
        const dispatch = (type) => {
            let ev;
            try {
                if (window.PointerEvent) {
                    ev = new PointerEvent(type, {pointerId: 1, pointerType: 'mouse', isPrimary: true, ...base});
                } else {
                    ev = new MouseEvent(type, base);
                }
            } catch (_) {
                ev = document.createEvent('MouseEvents');
                ev.initMouseEvent(type, base.bubbles, base.cancelable, window, 0, base.screenX, base.screenY, base.clientX, base.clientY, false, false, false, false, 0, null);
            }
            try { return target.dispatchEvent(ev); } catch(_) { return false; }
        };

        // Fire move-related events at the target under the center point
        try { dispatch('pointermove'); } catch(_) {}
        try { dispatch('mousemove'); } catch(_) {}
        return true;
    } catch (e) {
        try { console.warn('moveCursorToScreenCenter error:', e); } catch(_) {}
        return false;
    }
}

// Default dummy function to execute when the time is reached or passed
function selectAttackType(attackType) {
    // Determine which selector string to use based on attackType
    let selector = null;
    switch (attackType) {
        case 'raid':
            selector = raidSelector;
            break;
        case 'siege':
            selector = siegeSelector;
            break;
        case 'attack':
        default:
            selector = attackSelector;
            break;
    }

    if (selector && typeof selector === 'string') {
        const elToClick = document.querySelector(selector);
        if (elToClick) {
            const ok = simulateUserClick(elToClick);
            if (ok) {
                console.log(`testFunc executed successfully: '${attackType || 'attack'}' element clicked (simulated user interaction)`);
            } else if (typeof elToClick.click === 'function') {
                // Last-resort fallback
                elToClick.click();
                console.log(`testFunc fallback: '${attackType || 'attack'}' element clicked via .click()`);
            } else {
                console.warn(`testFunc warning: element for '${attackType || 'attack'}' not clickable (selector: '${selector}')`);
            }
        } else {
            console.warn(`testFunc warning: element for '${attackType || 'attack'}' not found using selector '${selector}'`);
        }
    } else {
        console.warn(`testFunc warning: invalid selector for '${attackType || 'attack'}'`);
    }
}

// Waits until the live DOM time (#servertime>.clickable) reaches or passes targetTime ("hh:mm:ss")
// Checks every 500 ms. When condition is met, clears the interval and calls onReached or fallback selectAttackType.
// Returns the interval id so that the caller can clear it manually if needed.
function waitUntilTime(targetTime, attackTypeOrCallback, maybeCallback, troopsInput, arrivalTime) {
    // Ensure UI is visible as soon as function is called
    try { if (typeof window.ensureWaitUntilUI === 'function') { const ui = window.ensureWaitUntilUI(); ui.show(); } } catch(_){}

    // New behavior: if called without arguments, just show the UI and wait for user submit
    if (arguments.length === 0 || typeof targetTime === 'undefined' || targetTime === null || String(targetTime).trim() === '') {
        try {
            if (window.WaitUntilUI && window.WaitUntilUI.status) {
                window.WaitUntilUI.status.textContent = 'Status: ready. Please set parameters and press Start.';
            }
        } catch(_){}
        return; // do not start until user submits the form
    }

    const targetSeconds = parseHmsToSeconds(targetTime);
    if (!Number.isFinite(targetSeconds)) {
        throw new Error('waitUntilTime: targetTime must be in format "hh:mm:ss"');
    }

    // Normalize parameters for backward compatibility
    let attackType = 'attack';
    let onReached = undefined;
    let troops = undefined;

    // 2nd argument can be: function (callback) | string (attackType) | object (troops)
    if (typeof attackTypeOrCallback === 'function') {
        onReached = attackTypeOrCallback;
    } else if (typeof attackTypeOrCallback === 'string') {
        attackType = attackTypeOrCallback.trim();
    } else if (attackTypeOrCallback && typeof attackTypeOrCallback === 'object') {
        troops = attackTypeOrCallback;
    }

    // 3rd argument can be: function (callback) | object (troops)
    if (typeof maybeCallback === 'function') {
        onReached = maybeCallback;
    } else if (!troops && maybeCallback && typeof maybeCallback === 'object') {
        troops = maybeCallback;
    }

    // 4th argument is explicitly troopsInput (optional)
    if (!troops && troopsInput && typeof troopsInput === 'object') {
        troops = troopsInput;
    }

    // If UI has settingsStringParsed, prioritize its values
    try {
        const ui = window.WaitUntilUI;
        if (ui && ui.currentParams && ui.currentParams.settingsStringParsed) {
            const sp = ui.currentParams.settingsStringParsed;
            if (sp && sp.targetTime) {
                // Override targetTime only if a valid time string
                const ts = parseHmsToSeconds(sp.targetTime);
                if (Number.isFinite(ts)) {
                    targetTime = sp.targetTime;
                }
            }
            if (sp && sp.arrivalTime) {
                const as = parseHmsToSeconds(sp.arrivalTime);
                if (Number.isFinite(as)) {
                    arrivalTime = sp.arrivalTime;
                }
            }
            if (sp && sp.attackType) {
                attackType = sp.attackType;
            }
            if (sp && sp.troopsDelta && typeof sp.troopsDelta === 'object' && sp.appliedTroopsDelta !== true) {
                troops = { ...(troops||{}), ...Object.keys(sp.troopsDelta).reduce((acc,k)=>{ acc[k]=(troops&&troops[k]?troops[k]:0) + sp.troopsDelta[k]; return acc; }, {}) };
            }
        }
    } catch(_){ }

    // Validate attackType
    const allowed = ['attack', 'raid', 'siege'];
    if (!allowed.includes(attackType)) {
        console.warn(`waitUntilTime: invalid attackType '${attackType}', defaulting to 'attack'`);
        attackType = 'attack';
    }

    // Parse arrivalTime if provided
    let arrivalSeconds = undefined;
    if (typeof arrivalTime === 'string') {
        const s = parseHmsToSeconds(arrivalTime);
        if (Number.isFinite(s)) {
            arrivalSeconds = s;
            console.log(`waitUntilTime: arrivalTime parameter accepted: ${arrivalTime} (${s}s)`);
        } else {
            console.warn(`waitUntilTime: invalid arrivalTime '${arrivalTime}'; skipping arrival verification`);
        }
    }

    // Update UI with accepted params (ensure attackOption is preserved if provided via UI or settings)
    try {
        if (window.WaitUntilUI) {
            let attackOption;
            try {
                const ui = window.WaitUntilUI;
                const cp = ui && ui.currentParams ? ui.currentParams : undefined;
                if (cp && cp.attackOption) {
                    attackOption = cp.attackOption;
                } else if (cp && cp.settingsStringParsed && cp.settingsStringParsed.attackLabel) {
                    attackOption = cp.settingsStringParsed.attackLabel;
                }
            } catch(_) {}
            window.WaitUntilUI.setAccepted({
                targetTime: String(targetTime),
                attackType,
                attackOption,
                troops: troops || {},
                arrivalTime: typeof arrivalTime === 'string' ? arrivalTime : undefined
            });
        }
    } catch(_){}

    // Track rollover and absolute comparison context
    let _dayOffset = 0; // increments by 86400 when server time wraps past midnight
    let _lastCurrentSeconds = null;

    try { if (window.WaitUntilIntervalId) { clearInterval(window.WaitUntilIntervalId); window.WaitUntilIntervalId = undefined; } } catch(_){}
    const intervalId = setInterval(function () {
        window.WaitUntilIntervalId = intervalId;
        // Read the current time fresh on every tick (it is updated externally)
        const el = document.querySelector(CONFIG.selectors.serverTime);
        const currentStr = el && typeof el.textContent === 'string' ? el.textContent.trim() : '';
        const currentSeconds = parseHmsToSeconds(currentStr);

        // If current time is unavailable or malformed, just skip this tick
        if (!Number.isFinite(currentSeconds)) return;

        // Detect midnight rollover to keep a monotonic absolute current time
        if (_lastCurrentSeconds !== null && currentSeconds < _lastCurrentSeconds) {
            _dayOffset += 86400;
            console.log(`waitUntilTime: detected server time rollover past midnight; advancing day offset to ${_dayOffset}s`);
        }
        _lastCurrentSeconds = currentSeconds;
        const currentAbs = currentSeconds + _dayOffset;

        // Compute absolute target for this tick. If current>=12h and target<12h, treat target as next day (add 24h) for this comparison.
        let targetAbs = targetSeconds + _dayOffset;
        if (currentSeconds >= 12 * 3600 && targetSeconds < 12 * 3600) {
            targetAbs += 86400;
        }

        // Update UI countdown on every check
        try {
            if (window.WaitUntilUI) {
                const remaining = Math.max(0, Math.floor(targetAbs - currentAbs));
                window.WaitUntilUI.setCountdown({ current: currentStr, target: String(targetTime), remaining: formatSecondsToHms(remaining) });
            }
        } catch(_){}

        if (currentAbs >= targetAbs) {
            clearInterval(intervalId);
            try {
                if (typeof onReached === 'function') {
                    // Provide both attackType and troops to custom callback; extra params are ignored by simple callbacks
                    onReached(attackType, troops);
                } else {
                    if (troops) {
                        console.log('waitUntilTime: filling troops inputs before executing action...', troops);
                        try {
                            fillTroopsInputs(troops);
                        } catch (err) {
                            console.warn('waitUntilTime: error while filling troops inputs:', err);
                        }
                    } else {
                        console.log('waitUntilTime: no troopsInput provided, skipping troops fill');
                    }
                    selectAttackType(attackType);
                    // After selecting attack type, wait ~postSelectContinueDelayMs then handle Continue button with retries if disabled
                    setTimeout(function () {
                        try {
                            ensureContinueEnabledAndClick(attackType, CONFIG.intervals.ensureContinueTotalMs, function () {
                                if (Number.isFinite(arrivalSeconds)) {
                                    console.log(`waitUntilTime: Continue clicked; will verify arrival time against '${arrivalTime}'`);
                                    try {
                                        verifyArrivalAndSend(arrivalSeconds, CONFIG.intervals.arrivalVerifyMaxChecks, CONFIG.intervals.arrivalVerifyIntervalMs);
                                    } catch (e) {
                                        console.warn('waitUntilTime: error during arrival verification routine:', e);
                                    }
                                } else {
                                    // No arrivalTime provided: read current arrival time from page, log it, then click Send Troops
                                    setTimeout(() => {
                                        try {
                                            const el = document.querySelector(CONFIG.selectors.arrivalTime);
                                            const arrivalStr = el && typeof el.textContent === 'string' ? el.textContent.trim() : '';
                                            const pageSecs = getArrivalTimeOnPageSeconds();
                                            console.log(`waitUntilTime: no arrivalTime param provided; current arrival time on page is '${arrivalStr || 'N/A'}' (${Number.isFinite(pageSecs) ? pageSecs + 's' : 'invalid'}) — proceeding to click Send Troops.`);
                                            try {
                                                if (window.WaitUntilUI && window.WaitUntilUI.currentParams) {
                                                    window.WaitUntilUI.setSuccess(window.WaitUntilUI.currentParams, pageSecs);
                                                }
                                                try { if (typeof window.__PlanWaitHook === 'function') { window.__PlanWaitHook(true, window.WaitUntilUI ? window.WaitUntilUI.currentParams : undefined, pageSecs); } } catch(_){ }
                                            } catch(_){}
                                            try {
                                                clickSendTroopsButton();
                                            } catch (e2) {
                                                console.warn('waitUntilTime: error clicking sendTroops without verification:', e2);
                                            }
                                        } catch (e1) {
                                            console.warn('waitUntilTime: error obtaining arrival time before sending:', e1);
                                            try {
                                                clickSendTroopsButton();
                                            } catch (e2) {
                                                console.warn('waitUntilTime: error clicking sendTroops without verification:', e2);
                                            }
                                        }
                                    }, CONFIG.intervals.postContinueFirstArrivalDelayMs);
                                }
                            });
                        } catch (err) {
                            console.warn('waitUntilTime: error while handling continue button with retries:', err);
                        }
                    }, CONFIG.intervals.postSelectContinueDelayMs);
                }
                console.log(`waitUntilTime: executed action for '${attackType}' at ${currentStr}`);
            } catch (e) {
                console.error('waitUntilTime: error running callback:', e);
            }
        }
    }, CONFIG.intervals.checkMs);

    return intervalId;
}

var troopsInputsElems = CONFIG.selectors.troopsInputs;

// Fills the troops inputs based on the provided mapping and quantities
function fillTroopsInputs(troopsInput) {
    if (!troopsInput || typeof troopsInput !== 'object') {
        console.log('fillTroopsInputs: no valid troopsInput provided, nothing to fill');
        return;
    }

    let filled = 0;
    let total = 0;
    try {
        const entries = Object.entries(troopsInput);
        total = entries.length;
        console.log(`fillTroopsInputs: starting to fill ${total} troop type(s)`);
        for (const [unitName, amountRaw] of entries) {
            const selector = troopsInputsElems && troopsInputsElems[unitName];
            if (!selector) {
                console.warn(`fillTroopsInputs: no selector mapping for unit '${unitName}', skipping`);
                continue;
            }

            const input = document.querySelector(selector);
            if (!input) {
                console.warn(`fillTroopsInputs: input element not found for unit '${unitName}' using selector '${selector}'`);
                continue;
            }

            let amount = Number(amountRaw);
            if (!Number.isFinite(amount) || amount < 0) {
                console.warn(`fillTroopsInputs: invalid amount '${amountRaw}' for unit '${unitName}', skipping`);
                continue;
            }
            amount = Math.floor(amount);

            try {
                if (typeof input.scrollIntoView === 'function') input.scrollIntoView({
                    block: 'center',
                    inline: 'nearest'
                });
            } catch (_) {
            }
            try {
                if (typeof input.focus === 'function') input.focus({preventScroll: true});
            } catch (_) {
                try {
                    input.focus();
                } catch (_) {
                }
            }

            // Set the value
            input.value = String(amount);

            // Dispatch typical events to simulate user typing
            try {
                input.dispatchEvent(new Event('input', {bubbles: true, cancelable: true}));
            } catch (_) {
            }
            try {
                input.dispatchEvent(new Event('change', {bubbles: true, cancelable: true}));
            } catch (_) {
            }

            filled++;
            console.log(`fillTroopsInputs: set ${amount} for '${unitName}' using '${selector}'`);
        }
    } catch (err) {
        console.warn('fillTroopsInputs: error while filling troops:', err);
    }
    console.log(`fillTroopsInputs: completed. Filled ${filled}/${total} provided troop type(s).`);
}

var continueButtonSelector = CONFIG.selectors.continueButton;


// Clicks the continue button if enabled; logs a message if disabled
function clickContinueButton() {
    try {
        const selector = typeof continueButtonSelector === 'string' && continueButtonSelector.trim()
            ? continueButtonSelector.trim()
            : '.send-troops .buttonContainer .next.clickable';

        const btn = document.querySelector(selector);
        if (!btn) {
            console.warn(`clickContinueButton: continue button not found using selector '${selector}'`);
            return false;
        }

        const isDisabled = !!(btn.classList && btn.classList.contains('disabled'));
        if (isDisabled) {
            console.log('clickContinueButton: continue button is disabled; skipping click');
            return false;
        }

        const ok = simulateUserClick(btn);
        if (ok) {
            console.log('clickContinueButton: continue button clicked (simulated user interaction)');
            return true;
        }

        if (typeof btn.click === 'function') {
            btn.click();
            console.log('clickContinueButton: continue button clicked via .click() fallback');
            return true;
        }

        console.warn('clickContinueButton: continue button could not be clicked');
        return false;
    } catch (e) {
        console.warn('clickContinueButton: error attempting to click continue button:', e);
        return false;
    }
}


// Helper: returns the continue button and whether it is disabled
function getContinueButtonState() {
    const selector = typeof continueButtonSelector === 'string' && continueButtonSelector.trim()
        ? continueButtonSelector.trim()
        : '.send-troops .buttonContainer .next.clickable';
    const btn = document.querySelector(selector);
    const disabled = !btn || !!(btn.classList && btn.classList.contains('disabled'));
    return {btn, disabled, selector};
}

// Helper: choose an alternate attack type to toggle to
function chooseAlternateAttackType(desired) {
    const order = ['attack', 'raid', 'siege'];
    const others = order.filter(t => t !== desired);
    const exists = (t) => {
        try {
            switch (t) {
                case 'raid':
                    return !!document.querySelector(raidSelector);
                case 'siege':
                    return !!document.querySelector(siegeSelector);
                case 'attack':
                default:
                    return !!document.querySelector(attackSelector);
            }
        } catch (_) {
            return false;
        }
    };
    for (const t of others) {
        if (exists(t)) return t;
    }
    return others[0] || 'attack';
}

// Ensures the continue button becomes enabled; performs toggling of attack type and retries for up to totalMs
// onSuccess (optional): a callback invoked immediately after a successful Continue click
function ensureContinueEnabledAndClick(attackType, totalMs, onSuccess) {
    const logP = 'ensureContinueEnabledAndClick';
    const maxMs = Number.isFinite(totalMs) ? Math.max(0, Math.floor(totalMs)) : CONFIG.intervals.ensureContinueTotalMs;
    const intervalMs = CONFIG.intervals.ensureContinueIntervalMs;
    const start = Date.now();
    let attempts = 0;
    let inFlight = false;

    const tryClickIfEnabled = () => {
        const {btn, disabled, selector} = getContinueButtonState();
        if (!btn) {
            console.warn(`${logP}: continue button not found with selector '${selector}'. Will keep retrying until timeout.`);
        }
        if (!disabled) {
            console.log(`${logP}: continue button is enabled; clicking now.`);
            const clicked = clickContinueButton();
            if (clicked && typeof onSuccess === 'function') {
                try {
                    onSuccess();
                } catch (e) {
                    console.warn(`${logP}: onSuccess callback error:`, e);
                }
            }
            return true;
        }
        return false;
    };

    // Immediate check before scheduling retries
    if (tryClickIfEnabled()) return true;

    const timer = setInterval(() => {
        if (Date.now() - start >= maxMs) {
            clearInterval(timer);
            console.log(`${logP}: continue button still disabled after ${attempts} attempt(s) and ${maxMs}ms; stopping.`);
            try { if (window.WaitUntilUI && typeof window.WaitUntilUI.setError === 'function') { window.WaitUntilUI.setError('Continue button not enabled/clickable in time'); } } catch(_){}
            try { if (typeof window.__PlanWaitHook === 'function') { window.__PlanWaitHook(false, null, 'Continue button not enabled/clickable in time'); } } catch(_){}
            return;
        }
        if (inFlight) {
            // Prevent overlapping sequences
            return;
        }
        const remaining = maxMs - (Date.now() - start);
        attempts++;
        inFlight = true;

        const alt = chooseAlternateAttackType(attackType);
        console.log(`${logP}: attempt ${attempts}: button disabled. Toggling to '${alt}' then back to '${attackType}'. Remaining window ~${remaining}ms.`);
        try {
            selectAttackType(alt);
        } catch (e) {
            console.warn(`${logP}: error selecting alternate attack type '${alt}':`, e);
        }

        setTimeout(() => {
            try {
                selectAttackType(attackType);
            } catch (e) {
                console.warn(`${logP}: error re-selecting desired attack type '${attackType}':`, e);
            }

            setTimeout(() => {
                const {disabled} = getContinueButtonState();
                if (!disabled) {
                    console.log(`${logP}: continue button became enabled after attempt ${attempts}; clicking.`);
                    try {
                        const clicked = clickContinueButton();
                        if (clicked && typeof onSuccess === 'function') {
                            try {
                                onSuccess();
                            } catch (e) {
                                console.warn(`${logP}: onSuccess callback error:`, e);
                            }
                        }
                    } catch (e) {
                        console.warn(`${logP}: error clicking continue after enable:`, e);
                    }
                    clearInterval(timer);
                } else {
                    console.log(`${logP}: continue button still disabled after attempt ${attempts}. Next check in ${intervalMs}ms.`);
                }
                inFlight = false;
            }, CONFIG.intervals.toggleDelayMs);
        }, CONFIG.intervals.toggleDelayMs);
    }, intervalMs);

    return false;
}

// Helper: read arrival time from page and return seconds (NaN if unavailable)
function getArrivalTimeOnPageSeconds() {
    try {
        const el = document.querySelector(CONFIG.selectors.arrivalTime);
        const str = el && typeof el.textContent === 'string' ? el.textContent.trim() : '';
        const secs = parseHmsToSeconds(str);
        if (!Number.isFinite(secs)) {
            console.warn(`getArrivalTimeOnPageSeconds: could not parse arrival time from '${str}'`);
        }
        return secs;
    } catch (e) {
        console.warn('getArrivalTimeOnPageSeconds: error reading arrival time from page:', e);
        return NaN;
    }
}

var sendTroopsButtonSelector = CONFIG.selectors.sendTroopsButton;

// Clicks the Send Troops button. If not found, retries up to 3 times with 500ms delay between attempts.
function clickSendTroopsButton(maxRetries = CONFIG.intervals.sendTroopsMaxRetries, retryDelayMs = CONFIG.intervals.sendTroopsRetryDelayMs) {
    try {
        const selector = typeof sendTroopsButtonSelector === 'string' && sendTroopsButtonSelector.trim()
            ? sendTroopsButtonSelector.trim()
            : '.sendTroops.clickable';

        const tryOnce = () => {
            const btn = document.querySelector(selector);
            if (!btn) {
                return false;
            }
            // Defer ANY click (simulated or native) to allow plan promise/hook resolution and UI updates before potential navigation
            setTimeout(() => {
                try {
                    const okSim = simulateUserClick(btn);
                    if (!okSim && typeof btn.click === 'function') {
                        // Additional tiny deferral for native click
                        setTimeout(() => { try { btn.click(); } catch(_) {} }, 50);
                    }
                } catch(_) {}
            }, 0);
            console.log('clickSendTroopsButton: scheduled sendTroops button click (deferred)');
            return true;
        };

        // First immediate attempt
        const immediate = tryOnce();
        if (immediate) return true;

        // If not found or not clickable, and we specifically couldn't even find it, schedule retries for not found case
        let attempts = 0;
        const retry = () => {
            attempts++;
            const btn = document.querySelector(selector);
            if (!btn) {
                if (attempts <= maxRetries) {
                    console.warn(`clickSendTroopsButton: button not found using selector '${selector}'. Retry ${attempts}/${maxRetries} in ${retryDelayMs}ms.`);
                    setTimeout(retry, retryDelayMs);
                    return;
                }
                console.warn(`clickSendTroopsButton: button not found after ${maxRetries} retries. Giving up.`);
                try { if (window.WaitUntilUI && typeof window.WaitUntilUI.setError === 'function') { window.WaitUntilUI.setError('Send Troops button not found'); } } catch(_){}
                try { if (typeof window.__PlanWaitHook === 'function') { window.__PlanWaitHook(false, null, 'Send Troops button not found'); } } catch(_){ }
                return;
            }
            // Found on a retry: also defer the click to avoid interrupting the plan loop before it can continue
            setTimeout(() => {
                try {
                    const okSim = simulateUserClick(btn);
                    if (!okSim && typeof btn.click === 'function') {
                        setTimeout(() => { try { btn.click(); } catch(_) {} }, 50);
                    }
                } catch(_) {}
            }, 0);
            console.log('clickSendTroopsButton: scheduled sendTroops button click on retry (deferred)');
        };

        // Only retry if it wasn't found at all initially
        console.warn(`clickSendTroopsButton: button not found using selector '${selector}'. Will retry up to ${maxRetries} time(s) every ${retryDelayMs}ms.`);
        setTimeout(retry, retryDelayMs);
        return false;
    } catch (e) {
        console.warn('clickSendTroopsButton: error attempting to click sendTroops button:', e);
        return false;
    }
}

// Verifies arrival time (up to maxChecks) and clicks Send Troops when page time >= desired
function verifyArrivalAndSend(arrivalSeconds, maxChecks = 10, intervalMs = 500) {
    const logP = 'verifyArrivalAndSend';
    let attempts = 0;
    console.log(`${logP}: will verify arrival time up to ${maxChecks} times every ${intervalMs}ms.`);

    const check = () => {
        const pageSecs = getArrivalTimeOnPageSeconds();
        if (Number.isFinite(pageSecs)) {
            if (pageSecs >= arrivalSeconds) {
                console.log(`${logP}: arrival time on page (${pageSecs}s) >= desired (${arrivalSeconds}s). Clicking Send Troops.`);
                try {
                    if (window.WaitUntilUI && window.WaitUntilUI.currentParams) {
                        window.WaitUntilUI.setSuccess(window.WaitUntilUI.currentParams, pageSecs);
                    }
                    try { if (typeof window.__PlanWaitHook === 'function') { window.__PlanWaitHook(true, window.WaitUntilUI ? window.WaitUntilUI.currentParams : undefined, pageSecs); } } catch(_){ }
                } catch(_){}
                try {
                    clickSendTroopsButton();
                } catch (e) {
                    console.warn(`${logP}: error clicking sendTroops:`, e);
                }
                return; // done
            } else {
                console.log(`${logP}: arrival time on page (${pageSecs}s) is earlier than desired (${arrivalSeconds}s); will re-check.`);
            }
        } else {
            console.log(`${logP}: arrival time on page is unavailable or invalid; will re-check.`);
        }
        attempts++;
        if (attempts >= maxChecks) {
            console.log(`${logP}: condition not met after ${attempts} checks; stopping.`);
            try { if (window.WaitUntilUI && typeof window.WaitUntilUI.setError === 'function') { window.WaitUntilUI.setError('Arrival verification timed out or condition not met'); } } catch(_){ }
            try { if (typeof window.__PlanWaitHook === 'function') { window.__PlanWaitHook(false, null, 'Arrival verification timed out or condition not met'); } } catch(_){ }
            return;
        }
        setTimeout(check, intervalMs);
    };

    // Wait ~postContinueFirstArrivalDelayMs after Continue click before the first verification
    setTimeout(check, CONFIG.intervals.postContinueFirstArrivalDelayMs);
}

// Example invocations
// Keeps backward compatibility (no attackType provided):
// waitUntilTime('01:39:10');
// With attackType provided (will use selectAttackType by default):
// waitUntilTime('01:39:10', 'raid');
// With custom callback receiving attackType:
// waitUntilTime('01:39:10', 'siege', function(type){ console.log('Custom callback for', type); });
// Example with troopsInput and arrivalTime:
const troops = {
    phalanx: 1500,
    sword: 0,
    druid: 0,
    haeduan: 0
};

// Selects a village by opening the dropdown, then after 100ms clicks the entry matching villageName.
function selectVillage(villageName) {
    const villageListSelector = '#villageList .dropdownContainer .clickable';
    const villagesInDropdownSelector = '.villageListDropDown .villageEntry';
    try {
        const el = document.querySelector(villageListSelector);
        if (!el) {
            console.warn(`selectVillage: element not found with selector '${villageListSelector}' for village '${villageName}'`);
            return false;
        }
        let opened = false;
        // Prefer realistic user click imitation
        try {
            opened = !!simulateUserClick(el);
        } catch (e) {
            console.warn('selectVillage: simulateUserClick threw, will fallback to .click()', e);
        }
        // Fallback to native click if simulation didn’t report success
        if (!opened && typeof el.click === 'function') {
            el.click();
            opened = true;
        }
        if (!opened) {
            console.warn('selectVillage: element is not clickable (no simulate success and no .click)');
            return false;
        }
        // After opening dropdown, wait 100ms and select the matching village by text
        setTimeout(() => {
            try {
                const nodes = document.querySelectorAll(villagesInDropdownSelector);
                if (!nodes || nodes.length === 0) {
                    console.warn(`selectVillage: no elements found for villagesInDropdownSelector '${villagesInDropdownSelector}'`);
                    return;
                }
                const list = Array.from(nodes);
                const target = list.find(n => {
                    try {
                        return (n && typeof n.textContent === 'string' && n.textContent.trim() === String(villageName).trim());
                    } catch {
                        return false;
                    }
                });
                if (!target) {
                    console.warn(`selectVillage: village '${villageName}' not found in dropdown`);
                    return;
                }
                try {
                    const ok2 = simulateUserClick(target);
                    if (!ok2 && typeof target.click === 'function') {
                        target.click();
                    }
                    console.log(`selectVillage: selected village '${villageName}' from dropdown`);
                    try { moveCursorToScreenCenter(); } catch(_) {}
                } catch (e2) {
                    if (target && typeof target.click === 'function') {
                        target.click();
                        console.log(`selectVillage: selected village '${villageName}' from dropdown via .click() fallback after error`);
                        try { moveCursorToScreenCenter(); } catch(_) {}
                    } else {
                        console.warn('selectVillage: could not click target village element', e2);
                    }
                }
            } catch (inner) {
                console.warn('selectVillage: error while processing dropdown selection', inner);
            }
        }, 100);
        // Return true to indicate the process has been initiated successfully
        return true;
    } catch (e) {
        console.warn('selectVillage: unexpected error:', e);
        return false;
    }
}

// Adds a function to open the Troops tab, click Send Troops, then focus target input and type query
function sendTroops(villageNameAndCoordinates) {
    const troopsButtonSelector = '#subNavigation .troop';
    const sendTroopsButtonSelector = '.sendTroops.clickable';
    const targetInputSelector = '.chooseTarget.searchVillage .targetInput';
    const initialDelayMs = 200; // wait after opening troops tab
    const initialDelayTargetInputMs = 500; // wait after opening Send Troops and before locating the target input
    const retryDelayMs = 200;   // wait between retries for Send Troops button and target input
    const maxRetries = 3;

    // Build search text "(X|Y) Name". Supports either:
    // - sendTroops('Name (X|Y)') legacy single-string input
    // - sendTroops(name, {x, y}) new signature
    let searchText = null;
    let villageNameOnly = null;
    let villageNameDotsPartial = null;
    let villageNamePartial = null;

    // Helper: derive partial name per rules
    const getVillageNamePartial = (nm) => {
        if (!nm) return nm;
        const s = String(nm);
        // If ends with '..', take before '..'
        const idxDots = s.indexOf('..');
        if (idxDots >= 0) {
            return s.slice(0, idxDots).trim();
        }
        // If contains number, take before first digit
        const mNum = s.match(/^(.*?)(\d)/);
        if (mNum) {
            return mNum[1].trim();
        }
        return s.trim();
    };

    try {
        // New signature handling: (name, coordinates)
        if (arguments.length >= 2 && typeof arguments[0] === 'string' && arguments[1] && typeof arguments[1] === 'object') {
            const name = String(arguments[0]).trim();
            const coords = arguments[1] || {};
            const x = (coords.x ?? coords.X ?? coords[0]);
            const y = (coords.y ?? coords.Y ?? coords[1]);
            if (x != null && y != null) {
                villageNameOnly = name;
                villageNameDotsPartial = (typeof name === 'string' && name.includes('..')) ? name.slice(0, name.indexOf('..')).trim() : null;
                searchText = `(${x}|${y})`;
            }
        }
        // Legacy single-string input parsing
        if (!searchText && typeof villageNameAndCoordinates === 'string') {
            const m = villageNameAndCoordinates.match(/^\s*(.*?)\s*\(([-+]?\d+)\|([-+]?\d+)\)\s*$/u);
            if (m) {
                const name = m[1].trim();
                const x = m[2];
                const y = m[3];
                villageNameOnly = name;
                villageNameDotsPartial = (typeof name === 'string' && name.includes('..')) ? name.slice(0, name.indexOf('..')).trim() : null;
                searchText = `(${x}|${y})`;
            } else {
                // Fallback: if it already looks like it starts with (X|Y), keep as-is
                if (/^\s*\([-+]?\d+\|[-+]?\d+\)/.test(villageNameAndCoordinates)) {
                    // Extract coords and type only coordinates; also try to extract full village name if present after coords
                    try {
                        const mCoords = villageNameAndCoordinates.match(/^\s*\(([-+]?\d+)\|([-+]?\d+)\)/);
                        if (mCoords) {
                            const x2 = mCoords[1];
                            const y2 = mCoords[2];
                            searchText = `(${x2}|${y2})`;
                        } else {
                            searchText = villageNameAndCoordinates.trim();
                        }
                    } catch(_) {
                        searchText = villageNameAndCoordinates.trim();
                    }
                    try {
                        const m2 = villageNameAndCoordinates.match(/^\s*\([-+]?\d+\|[-+]?\d+\)\s*(.*)$/u);
                        villageNameOnly = m2 && m2[1] ? m2[1].trim() : null;
                        if (villageNameOnly) {
                            villageNameDotsPartial = villageNameOnly.includes('..') ? villageNameOnly.slice(0, villageNameOnly.indexOf('..')).trim() : null;
                        }
                    } catch(_) {}
                } else {
                    // If string doesn't contain coordinates, assume whole string is the name
                    villageNameOnly = villageNameAndCoordinates.trim();
                    villageNamePartial = getVillageNamePartial(villageNameOnly);
                }
            }
        }
    } catch (_) { /* noop */ }

    try {
        // 1) Locate and click the Troops button
        const troopsBtn = document.querySelector(troopsButtonSelector);
        if (!troopsBtn) {
            console.warn(`sendTroops: troops button not found with selector '${troopsButtonSelector}'`);
            return false;
        }
        let opened = false;
        try {
            opened = !!simulateUserClick(troopsBtn);
        } catch (e) {
            console.warn('sendTroops: simulateUserClick threw for troops button, will fallback to .click()', e);
        }
        if (!opened && typeof troopsBtn.click === 'function') {
            troopsBtn.click();
            opened = true;
        }
        if (!opened) {
            console.warn('sendTroops: troops button is not clickable (no simulate success and no .click)');
            return false;
        }

        // 2) After 200ms, attempt to find and click the Send Troops button, retry up to 3 times
        let attempts = 0;
        const tryFindAndClickSend = () => {
            const btn = document.querySelector(sendTroopsButtonSelector);
            if (btn) {
                try {
                    const ok = simulateUserClick(btn);
                    if (!ok && typeof btn.click === 'function') {
                        btn.click();
                    }
                    console.log('sendTroops: Send Troops button clicked');
                } catch (e2) {
                    if (btn && typeof btn.click === 'function') {
                        btn.click();
                        console.log('sendTroops: Send Troops button clicked via .click() fallback after error');
                    } else {
                        console.warn('sendTroops: could not click Send Troops button', e2);
                    }
                }

                // 3) After clicking Send Troops, wait 200ms and try to focus and fill the target input
                let tiAttempts = 0;
                const tryFindTargetInput = () => {
                    const input = document.querySelector(targetInputSelector);
                    if (input) {
                        try {
                            // Focus/click input
                            try { simulateUserClick(input); } catch(_) { }
                            try { if (typeof input.focus === 'function') input.focus({preventScroll: true}); } catch(_) { try { input.focus(); } catch(_) {} }

                            if (searchText) {
                                let typedOk = false;
                                try {
                                    typedOk = simulateUserTyping(input, searchText, { clear: true });
                                } catch(_) {}
                                if (!typedOk) {
                                    // Fallback to direct assignment with events if typing simulation fails
                                    input.value = searchText;
                                    try {
                                        const ev = new Event('input', {bubbles: true, cancelable: false});
                                        input.dispatchEvent(ev);
                                    } catch(_) {}
                                    try {
                                        const ev2 = new Event('change', {bubbles: true, cancelable: false});
                                        input.dispatchEvent(ev2);
                                    } catch(_) {}
                                }
                                console.log(`sendTroops: ${typedOk ? 'typed' : 'filled'} target input with '${searchText}'`);

                                // Wait until typing completes (input.value matches searchText), then wait 500ms before searching results
                                const ensureTypedThenSearch = () => {
                                    const proceedToSearch = () => {
                                        setTimeout(() => {
                                            const itemsSelector = 'ul.ui-autocomplete.serverautocomplete li';
                                            const nameSelector = '.resultRow .resultName';
                                            let srAttempts = 0;
                                            const tryFindInResults = () => {
                                                const items = document.querySelectorAll(itemsSelector);
                                                if (items && items.length) {
                                                    const arr = Array.from(items);
                                                    // If no villageName provided, click the first result's name span
                                                    if (!villageNameOnly) {
                                                        try {
                                                            const first = arr[0];
                                                            const span = first && first.querySelector(nameSelector);
                                                            if (span) {
                                                                const okClick = simulateUserClick(span);
                                                                if (!okClick && typeof span.click === 'function') span.click();
                                                                console.log(`sendTroops: village name empty — selected first autocomplete result.`);
                                                                return; // done
                                                            }
                                                        } catch (eFirst) {
                                                            console.warn('sendTroops: error clicking first autocomplete result:', eFirst);
                                                            return;
                                                        }
                                                    }
                                                    // Otherwise, match by rule: if villageName has '..', use substring before '..' (contains); else exact full-name match
                                                    const match = arr.find(li => {
                                                        try {
                                                            const span = li.querySelector(nameSelector);
                                                            const txt = span && span.textContent ? span.textContent.trim() : '';
                                                            if (!villageNameOnly) return false;
                                                            if (villageNameDotsPartial) {
                                                                return txt.toLowerCase().includes(villageNameDotsPartial.toLowerCase());
                                                            }
                                                            return txt === villageNameOnly;
                                                        } catch(_) { return false; }
                                                    });
                                                    if (match) {
                                                        try {
                                                            const span = match.querySelector(nameSelector);
                                                            if (span) {
                                                                const okClick = simulateUserClick(span);
                                                                if (!okClick && typeof span.click === 'function') span.click();
                                                                console.log(`sendTroops: selected village result ${villageNameDotsPartial ? `containing '${villageNameDotsPartial}'` : `'${villageNameOnly}'`} from autocomplete.`);
                                                                return; // done
                                                            }
                                                        } catch(e3) {
                                                            console.warn('sendTroops: error clicking result span:', e3);
                                                            return;
                                                        }
                                                    }
                                                }
                                                srAttempts++;
                                                if (srAttempts < maxRetries) {
                                                    setTimeout(tryFindInResults, retryDelayMs);
                                                } else {
                                                    if (!villageNameOnly) {
                                                        console.warn(`sendTroops: no autocomplete item clickable as first result after ${srAttempts} attempt(s).`);
                                                    } else {
                                                        if (villageNameDotsPartial) {
                                                            console.warn(`sendTroops: matching search result containing '${villageNameDotsPartial}' not found after ${srAttempts} attempt(s).`);
                                                        } else {
                                                            console.warn(`sendTroops: matching search result for '${villageNameOnly}' not found after ${srAttempts} attempt(s).`);
                                                        }
                                                    }
                                                }
                                            };
                                            tryFindInResults();
                                        }, 500);
                                    };

                                    // If we typed asynchronously, wait until the value equals the full text or timeout
                                    const maxWaitMs = 4000;
                                    const start = Date.now();
                                    const poll = () => {
                                        try {
                                            if (String(input.value) === String(searchText)) {
                                                proceedToSearch();
                                                return;
                                            }
                                        } catch(_) {}
                                        if (Date.now() - start >= maxWaitMs) {
                                            proceedToSearch();
                                            return;
                                        }
                                        setTimeout(poll, 100);
                                    };
                                    poll();
                                };
                                ensureTypedThenSearch();
                            } else {
                                console.warn('sendTroops: no valid villageNameAndCoordinates provided to fill target input.');
                            }
                        } catch (fillErr) {
                            console.warn('sendTroops: error filling target input:', fillErr);
                        }
                        return; // done
                    }
                    tiAttempts++;
                    if (tiAttempts < maxRetries) {
                        setTimeout(tryFindTargetInput, retryDelayMs);
                    } else {
                        console.warn(`sendTroops: target input not found after ${tiAttempts} attempt(s).`);
                    }
                };

                setTimeout(tryFindTargetInput, initialDelayTargetInputMs);
                return; // done with Send click path
            }
            attempts++;
            if (attempts < maxRetries) {
                setTimeout(tryFindAndClickSend, retryDelayMs);
            } else {
                console.warn(`sendTroops: Send Troops button not found after ${attempts} attempt(s).`);
            }
        };

        setTimeout(tryFindAndClickSend, initialDelayMs);
        return true; // process initiated
    } catch (e) {
        console.warn('sendTroops: unexpected error:', e);
        return false;
    }
}


//siege with cata
// waitUntilTime('1:18:28', 'siege', null, { ...troops, taran: 1, cata: 1 }, '10:00:01');
//siege with taran only
// waitUntilTime('1:26:55', 'siege', null, { ...troops, taran: 1 }, '10:00:01');
//raid with cata
// waitUntilTime('1:55:20', 'raid', null, { ...troops, cata: 1 }, '10:00:01');
//raid with taran
// waitUntilTime('22:43:25', 'raid', null, { ...troops, taran: 1 }, '10:00:01');
// New usage: call without arguments to open the UI and wait for user input
// waitUntilTime();
// selectVillage('C09');
// setTimeout(() => {sendTroops('Пумба (-19|13)') }, 1000);
runPlan();
