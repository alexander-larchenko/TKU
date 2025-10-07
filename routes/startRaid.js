// Selector for the start raid button
const startRaidButtonSelector = '.startRaid.clickable';

// Timestamp formatter for logs: YYYY-MM-DD HH:mm:ss
function nowTs(){
    try{
        const d = new Date();
        const pad = n => String(n).padStart(2,'0');
        return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    }catch(_){
        try { return new Date().toISOString(); } catch(__){ return '' }
    }
}

// Format milliseconds into Xm Ys
function fmtMs(ms){
    try{
        const s = Math.floor(ms/1000);
        const m = Math.floor(s/60);
        const sec = s % 60;
        return `${m}m ${sec}s`;
    }catch(_){ return `${ms}ms`; }
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
        try { fire('pointerover'); } catch (_) {}
        try { fire('mouseover'); } catch (_) {}
        try { fire('pointerenter', {bubbles: false}); } catch (_) {}
        try { fire('mouseenter', {bubbles: false}); } catch (_) {}
        try { fire('pointermove'); } catch (_) {}
        try { fire('mousemove'); } catch (_) {}

        // Press
        const downOk = fire('pointerdown');
        const mdownOk = fire('mousedown');

        // Focus if possible
        try {
            if (typeof el.focus === 'function') el.focus({preventScroll: true});
        } catch (_) {
            try { el.focus(); } catch (_) {}
        }

        // Release and click
        const upOk = fire('pointerup');
        const mupOk = fire('mouseup');
        const clickOk = fire('click');

        return !!(downOk && mdownOk && upOk && mupOk && clickOk);
    } catch (e) {
        try { console.warn(`[${nowTs()}] simulateUserClick error, falling back to element.click():`, e); } catch(_){ }
        try {
            if (el && typeof el.click === 'function') {
                el.click();
                return true;
            }
        } catch (_) {}
        return false;
    }
}

// Start a loop that tries to find the start raid button and click it, then waits 7–15 minutes and repeats
(function initStartRaidLoop(){
    try {
        if (typeof window !== 'undefined') {
            if (window.__startRaidLoopRunning) {
                // already running
                return;
            }
            window.__startRaidLoopRunning = true;
        }

        const minMs = 7 * 60 * 1000; // 7 minutes
        const maxMs = 15 * 60 * 1000; // 15 minutes

        const tick = () => {
            try {
                const btn = document.querySelector(startRaidButtonSelector);
                if (btn) {
                    try {
                        const ok = simulateUserClick(btn);
                        if (!ok && typeof btn.click === 'function') {
                            btn.click();
                        }
                        try { console.log(`[${nowTs()}] startRaid: button click attempted`); } catch(_){ }
                    } catch (e) {
                        try { console.warn(`[${nowTs()}] startRaid: simulateUserClick failed, fallback to .click()`, e); } catch(_){ }
                        try { if (typeof btn.click === 'function') btn.click(); } catch(_){}
                    }
                } else {
                    try { console.log(`[${nowTs()}] startRaid: button not found for selector ${startRaidButtonSelector}`); } catch(_){ }
                }
            } catch (e) {
                try { console.warn(`[${nowTs()}] startRaid: tick error`, e); } catch(_){ }
            } finally {
                const delay = Math.floor(minMs + Math.random() * (maxMs - minMs + 1));
                try { console.log(`[${nowTs()}] startRaid: next tick scheduled in ${fmtMs(delay)} (${delay} ms)`); } catch(_){ }
                setTimeout(tick, delay);
            }
        };

        // kick off immediately
        setTimeout(tick, 0);
    } catch (e) {
        try { console.warn(`[${nowTs()}] startRaid: init error`, e); } catch(_){ }
    }
})();
