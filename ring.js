/* v07 · Muon — the g−2 storage ring, seen from above.
   Muons circulate in a 14 m ring; each carries a spin arrow that precesses
   ahead of its momentum (the anomalous precession that the experiment
   measures). Muons decay; the positron curls inward and hits one of the 24
   calorimeter stations on the inside of the ring. The pointer nudges nearby
   muons. Static frame under prefers-reduced-motion; the loop pauses while
   the hero is off screen or the tab is hidden. No dependencies. */
(function () {
    "use strict";
    var canvas = document.getElementById("ring");
    if (!canvas || !canvas.getContext) return;
    var ctx = canvas.getContext("2d", { alpha: false });
    var hero = canvas.parentElement;
    var note = document.getElementById("hero-note");
    var title = hero.querySelector(".titleblock");

    var GROUND = "#0b1526";
    var STEEL = "143, 179, 230"; // magnet blue, for the ring
    var IVORY = "238, 231, 217"; // muons
    var AMBER = "242, 182, 86"; // spin arrows, positrons, calorimeters

    var reduceMQ = window.matchMedia("(prefers-reduced-motion: reduce)");
    var W = 0, H = 0, cx = 0, cy = 0, R = 0, ringW = 0, narrow = false;
    var muons = [], tracks = [], flashes = [], calos = [];
    var N_CALO = 24;
    var OMEGA = (2 * Math.PI) / 9; // one orbit in ~9 s
    var SPIN_RATIO = 1 / 6; // spin gains on momentum by one turn per 6 orbits
    // (the real ratio is about 1/29; exaggerated so the precession is visible)
    var INJECT = -Math.PI * 0.62; // inflector position on the ring
    var pointer = { x: -1e4, y: -1e4, t: 0 };
    var running = false, visible = true, raf = 0, last = 0, seedRand = 1;

    function rnd() { // deterministic PRNG so the reduced-motion frame is stable
        seedRand = (seedRand * 16807) % 2147483647;
        return (seedRand - 1) / 2147483646;
    }

    var TAU = 2 * Math.PI;

    function norm(a) { // wrap an angle into [0, 2pi)
        a = a % TAU;
        return a < 0 ? a + TAU : a;
    }

    function count() { return narrow ? 22 : 40; }

    function resize() {
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        var r = hero.getBoundingClientRect();
        W = Math.max(1, Math.round(r.width));
        H = Math.max(1, Math.round(r.height));
        canvas.width = Math.round(W * dpr);
        canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        narrow = W < 900;
        if (narrow) {
            // Phones: the whole ring sits in the clear band above the title block.
            var band = H * 0.3;
            if (title) {
                band = title.getBoundingClientRect().top - r.top;
            }
            band = Math.max(120, Math.min(band, H * 0.5));
            cx = W * 0.5;
            cy = band * 0.5;
            R = Math.min(W * 0.4, band * 0.5 - 16);
        } else {
            // Desktop: the ring clears the text column and stays whole in frame.
            cx = W * 0.67; cy = H * 0.5;
            R = Math.min(H * 0.38, (W - cx) / 1.24, W * 0.26);
        }
        ringW = Math.max(R * 0.12, 13);
        calos = [];
        for (var i = 0; i < N_CALO; i++) {
            calos.push({ a: (i / N_CALO) * 2 * Math.PI, hit: 0 });
        }
        var want = count();
        while (muons.length < want) muons.push(spawn(true));
        muons.length = want;
        if (!running) drawFrame();
    }

    function spawn(anywhere) {
        return {
            th: anywhere ? rnd() * 2 * Math.PI : INJECT,
            w: OMEGA * (0.94 + rnd() * 0.12),
            amp: ringW * (0.08 + rnd() * 0.22), // betatron amplitude
            nu: 0.4 + rnd() * 0.5, // betatron tune (visual)
            ph: rnd() * 2 * Math.PI,
            b: rnd() * 2 * Math.PI, // betatron phase, advanced with the orbit
            spin: anywhere ? rnd() * 2 * Math.PI : 0,
            life: 6 + -Math.log(1 - rnd()) * 14, // exponential, mean ~20 s
            age: anywhere ? rnd() * 4 : 0,
            dr: 0, dv: 0
        };
    }

    function pos(m) {
        var r = R + m.amp * Math.sin(m.b + m.ph) + m.dr;
        return { x: cx + r * Math.cos(m.th), y: cy + r * Math.sin(m.th), r: r };
    }

    function step(dt) {
        var i, m, p;
        for (i = 0; i < muons.length; i++) {
            m = muons[i];
            m.age += dt;
            m.life -= dt;
            var adv = (m.w + m.dv) * dt;
            m.th = norm(m.th + adv);
            m.b += m.nu * 6 * adv;
            m.spin += m.w * SPIN_RATIO * dt;
            m.dr *= Math.exp(-dt * 1.8);
            m.dv *= Math.exp(-dt * 1.2);
            // pointer: push muons radially away from the pointer, and hurry them a little
            if (pointer.t > 0) {
                p = pos(m);
                var dx = p.x - pointer.x, dy = p.y - pointer.y;
                var d = Math.sqrt(dx * dx + dy * dy);
                var reach = Math.max(90, ringW * 4);
                if (d < reach && d > 0.01) {
                    var k = (1 - d / reach);
                    var radial = (dx * Math.cos(m.th) + dy * Math.sin(m.th)) / d;
                    m.dr += radial * k * ringW * 2.2 * dt;
                    m.dv += k * OMEGA * 0.4 * dt;
                }
            }
            var lim = ringW * 0.85;
            if (m.dr > lim) m.dr = lim;
            if (m.dr < -lim) m.dr = -lim;
            if (m.life <= 0) {
                decay(m);
                muons[i] = spawn(false);
            }
        }
        for (i = tracks.length - 1; i >= 0; i--) {
            tracks[i].t += dt;
            if (tracks[i].t > 1.4) tracks.splice(i, 1);
        }
        for (i = flashes.length - 1; i >= 0; i--) {
            flashes[i].t += dt;
            if (flashes[i].t > 0.6) flashes.splice(i, 1);
        }
        for (i = 0; i < calos.length; i++) {
            if (calos[i].hit > 0) calos[i].hit = Math.max(0, calos[i].hit - dt);
        }
        pointer.t = Math.max(0, pointer.t - dt);
    }

    function decay(m) {
        var p = pos(m);
        // the positron curls inward and lands on a calorimeter a little downstream
        var ahead = norm(m.th + 0.18 + rnd() * 0.5);
        var best = 0, bestD = 1e9, j, dA;
        for (j = 0; j < calos.length; j++) {
            dA = Math.abs(((calos[j].a - ahead + Math.PI * 3) % TAU) - Math.PI);
            if (dA < bestD) { bestD = dA; best = j; }
        }
        var c = calos[best];
        c.hit = 0.7;
        var rc = R - ringW * 0.62;
        var cxp = cx + rc * Math.cos(c.a), cyp = cy + rc * Math.sin(c.a);
        // Control point: half way round the short arc to that station, so the
        // track curls inward instead of cutting across the ring.
        var mid = m.th + norm(c.a - m.th) / 2;
        var rm = R - ringW * 0.15;
        tracks.push({
            x0: p.x, y0: p.y,
            x1: cx + rm * Math.cos(mid), y1: cy + rm * Math.sin(mid),
            x2: cxp, y2: cyp, t: 0
        });
        flashes.push({ x: p.x, y: p.y, t: 0 });
    }

    function drawFrame() {
        var i, m, p;
        ctx.fillStyle = GROUND;
        ctx.fillRect(0, 0, W, H);

        // the magnet: a thin annulus with two hairline edges
        ctx.beginPath();
        ctx.arc(cx, cy, R + ringW / 2, 0, 2 * Math.PI);
        ctx.arc(cx, cy, R - ringW / 2, 0, 2 * Math.PI, true);
        ctx.fillStyle = "rgba(" + STEEL + ", 0.085)";
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "rgba(" + STEEL + ", 0.34)";
        ctx.beginPath(); ctx.arc(cx, cy, R + ringW / 2, 0, 2 * Math.PI); ctx.stroke();
        ctx.beginPath(); ctx.arc(cx, cy, R - ringW / 2, 0, 2 * Math.PI); ctx.stroke();
        // the ideal orbit
        ctx.strokeStyle = "rgba(" + STEEL + ", 0.12)";
        ctx.setLineDash([2, 6]);
        ctx.beginPath(); ctx.arc(cx, cy, R, 0, 2 * Math.PI); ctx.stroke();
        ctx.setLineDash([]);

        // inflector mark
        ctx.strokeStyle = "rgba(" + STEEL + ", 0.45)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx + (R + ringW * 0.5) * Math.cos(INJECT), cy + (R + ringW * 0.5) * Math.sin(INJECT));
        ctx.lineTo(cx + (R + ringW * 1.1) * Math.cos(INJECT), cy + (R + ringW * 1.1) * Math.sin(INJECT));
        ctx.stroke();

        // 24 calorimeter stations on the inside of the ring
        var cw = Math.max(5, ringW * 0.42), ch = Math.max(2, ringW * 0.16);
        for (i = 0; i < calos.length; i++) {
            var c = calos[i];
            var rc = R - ringW * 0.62;
            ctx.save();
            ctx.translate(cx + rc * Math.cos(c.a), cy + rc * Math.sin(c.a));
            ctx.rotate(c.a);
            var a = 0.32 + c.hit * 0.95;
            ctx.fillStyle = "rgba(" + AMBER + ", " + Math.min(1, a) + ")";
            ctx.fillRect(-ch / 2, -cw / 2, ch, cw);
            if (c.hit > 0) {
                ctx.shadowColor = "rgba(" + AMBER + ", 0.9)";
                ctx.shadowBlur = 10 * c.hit;
                ctx.fillRect(-ch / 2, -cw / 2, ch, cw);
            }
            ctx.restore();
        }

        // positron tracks
        for (i = 0; i < tracks.length; i++) {
            var t = tracks[i];
            var f = t.t < 0.25 ? t.t / 0.25 : 1;
            var alpha = 1 - Math.max(0, (t.t - 0.25) / 1.15);
            ctx.strokeStyle = "rgba(255, 208, 138, " + (0.9 * alpha) + ")";
            ctx.lineWidth = 1.4;
            ctx.beginPath();
            ctx.moveTo(t.x0, t.y0);
            if (f < 1) {
                // grow the curve as the positron flies
                var q = f;
                var bx = (1 - q) * ((1 - q) * t.x0 + q * t.x1) + q * ((1 - q) * t.x1 + q * t.x2);
                var by = (1 - q) * ((1 - q) * t.y0 + q * t.y1) + q * ((1 - q) * t.y1 + q * t.y2);
                var c1x = (1 - q) * t.x0 + q * t.x1, c1y = (1 - q) * t.y0 + q * t.y1;
                ctx.quadraticCurveTo(c1x, c1y, bx, by);
            } else {
                ctx.quadraticCurveTo(t.x1, t.y1, t.x2, t.y2);
            }
            ctx.stroke();
        }

        // decay flashes
        for (i = 0; i < flashes.length; i++) {
            var fl = flashes[i];
            var k = fl.t / 0.6;
            ctx.strokeStyle = "rgba(" + IVORY + ", " + (0.8 * (1 - k)) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.arc(fl.x, fl.y, 2 + k * 14, 0, 2 * Math.PI); ctx.stroke();
        }

        // muons: a short trail, a dot, and the spin arrow ahead of the momentum
        var arrow = Math.max(8, ringW * 0.55);
        for (i = 0; i < muons.length; i++) {
            m = muons[i];
            p = pos(m);
            var fade = Math.min(1, m.age / 0.6);
            var trail = 0.22;
            ctx.strokeStyle = "rgba(" + IVORY + ", " + (0.28 * fade) + ")";
            ctx.lineWidth = 1.2;
            ctx.beginPath();
            ctx.arc(cx, cy, p.r, m.th - trail, m.th);
            ctx.stroke();

            ctx.fillStyle = "rgba(" + IVORY + ", " + (0.95 * fade) + ")";
            ctx.beginPath(); ctx.arc(p.x, p.y, 2.1, 0, 2 * Math.PI); ctx.fill();

            var dir = m.th + Math.PI / 2; // momentum: tangent, direction of travel
            var s = dir + m.spin; // spin: leads the momentum by the anomalous angle
            var ex = p.x + arrow * Math.cos(s), ey = p.y + arrow * Math.sin(s);
            ctx.strokeStyle = "rgba(" + AMBER + ", " + (0.9 * fade) + ")";
            ctx.lineWidth = 1.3;
            ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey);
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 3.5 * Math.cos(s - 0.5), ey - 3.5 * Math.sin(s - 0.5));
            ctx.moveTo(ex, ey);
            ctx.lineTo(ex - 3.5 * Math.cos(s + 0.5), ey - 3.5 * Math.sin(s + 0.5));
            ctx.stroke();
        }
    }

    function loop(now) {
        if (!running) return;
        var dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
        last = now;
        step(dt);
        drawFrame();
        raf = window.requestAnimationFrame(loop);
    }

    function wants() {
        return visible && !document.hidden && !reduceMQ.matches;
    }

    function update() {
        var should = wants();
        if (should && !running) {
            running = true; last = 0;
            raf = window.requestAnimationFrame(loop);
        } else if (!should && running) {
            running = false;
            window.cancelAnimationFrame(raf);
        }
        if (note) {
            note.hidden = false;
            if (reduceMQ.matches) {
                note.textContent = "A still of muons in the g−2 storage ring, seen from above: the amber spin arrow of each muon leads its direction of travel; positron tracks run inward to the calorimeters.";
            }
        }
    }

    function staticFrame() {
        // Pre-run the simulation so the still frame has tracks and a settled beam.
        seedRand = 7;
        var i;
        for (i = 0; i < muons.length; i++) muons[i] = spawn(true);
        // Spread the beam evenly, so the one still frame shows the whole ring.
        for (i = 0; i < muons.length; i++) {
            muons[i].th = norm((i / muons.length) * TAU + rnd() * 0.1);
        }
        // Decay these late in the pre-run so their positron tracks are still
        // on screen (tracks live 1.4 s) when the still frame is drawn at t = 3 s.
        for (i = 0; i < 5; i++) { muons[(i * 7) % muons.length].life = 1.95 + i * 0.24; }
        for (i = 0; i < 90; i++) step(1 / 30);
        drawFrame();
    }

    hero.addEventListener("pointermove", function (e) {
        var r = canvas.getBoundingClientRect();
        pointer.x = e.clientX - r.left;
        pointer.y = e.clientY - r.top;
        pointer.t = 0.4;
    }, { passive: true });
    hero.addEventListener("pointerleave", function () { pointer.t = 0; });

    if ("IntersectionObserver" in window) {
        new IntersectionObserver(function (entries) {
            visible = entries[0].isIntersecting;
            update();
        }, { threshold: 0.02 }).observe(hero);
    }
    document.addEventListener("visibilitychange", update);
    if (reduceMQ.addEventListener) {
        reduceMQ.addEventListener("change", function () { update(); if (reduceMQ.matches) staticFrame(); });
    }

    var resizeTimer = 0;
    window.addEventListener("resize", function () {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function () { resize(); if (reduceMQ.matches) staticFrame(); }, 120);
    });

    resize();
    if (reduceMQ.matches) staticFrame();
    update();

    // Web fonts change the height of the title block, and with it the ring's band.
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(function () {
            resize();
            if (reduceMQ.matches) staticFrame();
        });
    }
})();
