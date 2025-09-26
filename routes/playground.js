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

var attackSelector = CONFIG.selectors.attack;
var raidSelector = CONFIG.selectors.raid;
var siegeSelector = CONFIG.selectors.siege;


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

// Default dummy function to execute when the time is reached or passed
function testFunc(attackType) {
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
// Checks every 500 ms. When condition is met, clears the interval and calls onReached or fallback testFunc.
// Returns the interval id so that the caller can clear it manually if needed.
function waitUntilTime(targetTime, attackTypeOrCallback, maybeCallback, troopsInput, arrivalTime) {
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

    // Track rollover and absolute comparison context
    let _dayOffset = 0; // increments by 86400 when server time wraps past midnight
    let _lastCurrentSeconds = null;

    const intervalId = setInterval(function () {
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
                    testFunc(attackType);
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
            testFunc(alt);
        } catch (e) {
            console.warn(`${logP}: error selecting alternate attack type '${alt}':`, e);
        }

        setTimeout(() => {
            try {
                testFunc(attackType);
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
            const ok = simulateUserClick(btn);
            if (ok) {
                console.log('clickSendTroopsButton: sendTroops button clicked (simulated user interaction)');
                return true;
            }
            if (typeof btn.click === 'function') {
                btn.click();
                console.log('clickSendTroopsButton: sendTroops button clicked via .click() fallback');
                return true;
            }
            console.warn('clickSendTroopsButton: sendTroops button could not be clicked');
            return false;
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
                return;
            }
            // Found on a retry, try clicking now
            const ok = simulateUserClick(btn);
            if (ok) {
                console.log('clickSendTroopsButton: sendTroops button clicked on retry (simulated user interaction)');
                return;
            }
            if (typeof btn.click === 'function') {
                btn.click();
                console.log('clickSendTroopsButton: sendTroops button clicked on retry via .click() fallback');
                return;
            }
            console.warn('clickSendTroopsButton: sendTroops button found on retry but could not be clicked.');
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
// With attackType provided (will use testFunc by default):
// waitUntilTime('01:39:10', 'raid');
// With custom callback receiving attackType:
// waitUntilTime('01:39:10', 'siege', function(type){ console.log('Custom callback for', type); });
// Example with troopsInput and arrivalTime:
const troops = {
    phalanx: 5000,
    sword: 0,
    druid: 0,
    haeduan: 0
};
//siege with cata
// waitUntilTime('1:18:28', 'siege', null, { ...troops, taran: 1, cata: 1 }, '10:00:01');
//siege with taran only
// waitUntilTime('1:26:55', 'siege', null, { ...troops, taran: 1 }, '10:00:01');
//raid with cata
// waitUntilTime('1:55:20', 'raid', null, { ...troops, cata: 1 }, '10:00:01');
//raid with taran
waitUntilTime('1:59:28', 'raid', null, { ...troops, taran: 1 }, '10:00:01');
