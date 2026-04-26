import { useEffect, useRef } from 'react';
import { useTheme, FESTIVAL_PALETTES } from '../../context/ThemeContext';

function runHoliParticles(canvas, ctx) {
    const colors = FESTIVAL_PALETTES.holi.particleColors;
    const particles = [];
    let animId;

    class Particle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -20;
            this.r = Math.random() * 14 + 6;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = Math.random() * 1.5 + 0.5;
            this.opacity = Math.random() * 0.5 + 0.3;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            this.shape = Math.random() > 0.5 ? 'circle' : 'blob';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            if (this.y > canvas.height + 20) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.r, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.ellipse(0, 0, this.r, this.r * 0.6, 0, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < 60; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runDiwaliParticles(canvas, ctx) {
    const particles = [];
    let animId;

    class Sparkle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 3 + 1;
            this.color = Math.random() > 0.5 ? '#FFD700' : Math.random() > 0.5 ? '#FF6B00' : '#FFF8E7';
            this.vy = -(Math.random() * 1.5 + 0.5);
            this.vx = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random();
            this.twinkle = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.twinkle += 0.08;
            this.opacity = (Math.sin(this.twinkle) + 1) / 2;
            if (this.y < -10) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity * 0.8;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            for (let i = 0; i < 4; i++) {
                const angle = (i / 4) * Math.PI * 2;
                const outerX = Math.cos(angle) * this.size * 2;
                const outerY = Math.sin(angle) * this.size * 2;
                const innerAngle = angle + Math.PI / 4;
                const innerX = Math.cos(innerAngle) * this.size * 0.5;
                const innerY = Math.sin(innerAngle) * this.size * 0.5;
                if (i === 0) ctx.moveTo(outerX, outerY);
                else ctx.lineTo(outerX, outerY);
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    class Firework {
        constructor() { this.reset(); }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.6;
            this.particles = [];
            this.active = false;
            this.timer = Math.random() * 200;
            this.color = ['#FFD700', '#FF6B00', '#FF0000', '#FFF8E7'][Math.floor(Math.random() * 4)];
        }
        burst() {
            this.active = true;
            this.particles = [];
            for (let i = 0; i < 20; i++) {
                const angle = (i / 20) * Math.PI * 2;
                this.particles.push({
                    x: this.x, y: this.y,
                    vx: Math.cos(angle) * (Math.random() * 3 + 1),
                    vy: Math.sin(angle) * (Math.random() * 3 + 1),
                    life: 1, color: this.color
                });
            }
        }
        update() {
            if (!this.active) {
                this.timer--;
                if (this.timer <= 0) this.burst();
                return;
            }
            this.particles.forEach(p => {
                p.x += p.vx; p.y += p.vy;
                p.vy += 0.05;
                p.life -= 0.02;
                p.vx *= 0.98; p.vy *= 0.98;
            });
            this.particles = this.particles.filter(p => p.life > 0);
            if (this.particles.length === 0) this.reset();
        }
        draw() {
            this.particles.forEach(p => {
                ctx.save();
                ctx.globalAlpha = p.life * 0.8;
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 4;
                ctx.beginPath();
                ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            });
        }
    }

    for (let i = 0; i < 80; i++) particles.push(new Sparkle());
    const fireworks = [new Firework(), new Firework(), new Firework()];

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        fireworks.forEach(f => { f.update(); f.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runNavratriParticles(canvas, ctx) {
    let animId;
    let rotation = 0;
    const colors = FESTIVAL_PALETTES.navratri.particleColors;

    function drawMandala(cx, cy, r, rot, alpha) {
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.translate(cx, cy);
        ctx.rotate(rot);
        const petals = 8;
        for (let i = 0; i < petals; i++) {
            const angle = (i / petals) * Math.PI * 2;
            const color = colors[i % colors.length];
            ctx.save();
            ctx.rotate(angle);
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(r * 0.5, 0, r * 0.3, r * 0.12, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = 'white';
            ctx.beginPath();
            ctx.arc(r * 0.5, 0, r * 0.04, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        ctx.beginPath();
        ctx.arc(0, 0, r * 0.15, 0, Math.PI * 2);
        ctx.fillStyle = colors[Math.floor(rotation * 0.5) % colors.length];
        ctx.fill();
        ctx.restore();
    }

    const orbs = Array.from({ length: 12 }, (_, i) => ({
        angle: (i / 12) * Math.PI * 2,
        speed: (Math.random() * 0.005 + 0.003) * (i % 2 === 0 ? 1 : -1),
        r: Math.random() * 6 + 4,
        orbitR: Math.random() * 80 + 60,
        color: colors[i % colors.length],
        cx: canvas.width * 0.5,
        cy: canvas.height * 0.5,
    }));

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        rotation += 0.003;

        const corners = [
            [80, 80], [canvas.width - 80, 80],
            [80, canvas.height - 80], [canvas.width - 80, canvas.height - 80],
        ];
        corners.forEach(([cx, cy]) => {
            drawMandala(cx, cy, 60, rotation, 0.15);
            drawMandala(cx, cy, 35, -rotation * 1.5, 0.1);
        });

        drawMandala(canvas.width / 2, canvas.height / 2, 120, rotation * 0.5, 0.08);
        drawMandala(canvas.width / 2, canvas.height / 2, 70, -rotation, 0.06);

        orbs.forEach(orb => {
            orb.angle += orb.speed;
            const x = orb.cx + Math.cos(orb.angle) * orb.orbitR;
            const y = orb.cy + Math.sin(orb.angle) * orb.orbitR;
            ctx.save();
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = orb.color;
            ctx.shadowColor = orb.color;
            ctx.shadowBlur = 8;
            ctx.beginPath();
            ctx.arc(x, y, orb.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });

        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runEidParticles(canvas, ctx) {
    const colors = FESTIVAL_PALETTES.eid.particleColors;
    let animId;
    let time = 0;
    const stars = [];
    const crescents = [];

    class FloatingStar {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -30;
            this.size = Math.random() * 3 + 1.5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vy = Math.random() * 0.5 + 0.2;
            this.vx = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.2;
            this.twinkle = Math.random() * Math.PI * 2;
            this.twinkleSpeed = Math.random() * 0.03 + 0.02;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.twinkle += this.twinkleSpeed;
            this.opacity = (Math.sin(this.twinkle) + 1) / 2 * 0.5 + 0.1;
            if (this.y > canvas.height + 20) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 8;
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const x = Math.cos(angle) * this.size * 2;
                const y = Math.sin(angle) * this.size * 2;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    }

    class Crescent {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height * 0.5;
            this.size = Math.random() * 30 + 20;
            this.opacity = Math.random() * 0.08 + 0.04;
            this.driftSpeed = (Math.random() - 0.5) * 0.15;
        }
        update() {
            this.x += this.driftSpeed;
            if (this.x > canvas.width + 50) this.x = -50;
            if (this.x < -50) this.x = canvas.width + 50;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = '#06D6A0';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = canvas.height > 0 ? 'rgb(240,255,248)' : '#F0FFF8';
            ctx.beginPath();
            ctx.arc(this.x + this.size * 0.35, this.y - this.size * 0.1, this.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 50; i++) stars.push(new FloatingStar());
    for (let i = 0; i < 4; i++) crescents.push(new Crescent());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time++;
        crescents.forEach(c => { c.update(); c.draw(); });
        stars.forEach(s => { s.update(); s.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runChristmasParticles(canvas, ctx) {
    const particles = [];
    let animId;

    class Snowflake {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -10;
            this.size = Math.random() * 4 + 2;
            this.vy = Math.random() * 1 + 0.3;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.6 + 0.2;
            this.wobble = Math.random() * Math.PI * 2;
            this.wobbleSpeed = Math.random() * 0.02 + 0.01;
            this.color = Math.random() > 0.7 ? '#FFD700' : Math.random() > 0.5 ? '#C62828' : '#FFFFFF';
        }
        update() {
            this.wobble += this.wobbleSpeed;
            this.x += this.vx + Math.sin(this.wobble) * 0.5;
            this.y += this.vy;
            if (this.y > canvas.height + 10) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 4;
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i / 6) * Math.PI * 2;
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(angle) * this.size, Math.sin(angle) * this.size);
            }
            ctx.strokeStyle = this.color;
            ctx.lineWidth = 1;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 70; i++) particles.push(new Snowflake());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runRakhiParticles(canvas, ctx) {
    const colors = FESTIVAL_PALETTES.rakhi.particleColors;
    const particles = [];
    let animId;

    class HeartParticle {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
            this.size = Math.random() * 8 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vy = -(Math.random() * 1 + 0.3);
            this.vx = (Math.random() - 0.5) * 0.5;
            this.opacity = Math.random() * 0.4 + 0.15;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.02;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            if (this.y < -20) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            const s = this.size;
            ctx.moveTo(0, s * 0.3);
            ctx.bezierCurveTo(s * 0.5, -s * 0.3, s, s * 0.1, 0, s);
            ctx.bezierCurveTo(-s, s * 0.1, -s * 0.5, -s * 0.3, 0, s * 0.3);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 40; i++) particles.push(new HeartParticle());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runFireParticles(canvas, ctx, themeId) {
    const palette = FESTIVAL_PALETTES[themeId] || FESTIVAL_PALETTES.default;
    const colors = palette.particleColors;
    const particles = [];
    let animId;

    class Ember {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 10;
            this.size = Math.random() * 4 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vy = -(Math.random() * 1.5 + 0.5);
            this.vx = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.life = 1;
            this.decay = Math.random() * 0.005 + 0.002;
            this.wobble = Math.random() * Math.PI * 2;
        }
        update() {
            this.wobble += 0.03;
            this.x += this.vx + Math.sin(this.wobble) * 0.3;
            this.y += this.vy;
            this.life -= this.decay;
            this.opacity = this.life * 0.5;
            if (this.life <= 0 || this.y < -10) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.shadowColor = this.color;
            ctx.shadowBlur = 6;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 50; i++) particles.push(new Ember());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runOnamParticles(canvas, ctx) {
    const colors = FESTIVAL_PALETTES.onam.particleColors;
    const petals = [];
    let animId;

    class Petal {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -20;
            this.size = Math.random() * 8 + 5;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vy = Math.random() * 1 + 0.3;
            this.vx = (Math.random() - 0.5) * 1;
            this.opacity = Math.random() * 0.4 + 0.2;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotSpeed = (Math.random() - 0.5) * 0.03;
            this.wobble = Math.random() * Math.PI * 2;
        }
        update() {
            this.wobble += 0.02;
            this.x += this.vx + Math.sin(this.wobble) * 0.5;
            this.y += this.vy;
            this.rotation += this.rotSpeed;
            if (this.y > canvas.height + 20) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.beginPath();
            ctx.ellipse(0, 0, this.size, this.size * 0.4, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 45; i++) petals.push(new Petal());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

function runDefaultParticles(canvas, ctx) {
    const colors = FESTIVAL_PALETTES.default.particleColors;
    const particles = [];
    let animId;

    class Dot {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : -10;
            this.size = Math.random() * 3 + 1;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.vy = Math.random() * 0.5 + 0.1;
            this.vx = (Math.random() - 0.5) * 0.2;
            this.opacity = Math.random() * 0.2 + 0.05;
            this.twinkle = Math.random() * Math.PI * 2;
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.twinkle += 0.02;
            this.opacity = (Math.sin(this.twinkle) + 1) / 2 * 0.15 + 0.05;
            if (this.y > canvas.height + 10) this.reset();
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 30; i++) particles.push(new Dot());

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        animId = requestAnimationFrame(animate);
    }
    animate();
    return () => cancelAnimationFrame(animId);
}

const PARTICLE_RUNNERS = {
    holi: runHoliParticles,
    diwali: runDiwaliParticles,
    navratri: runNavratriParticles,
    eid: runEidParticles,
    christmas: runChristmasParticles,
    rakhi: runRakhiParticles,
    onam: runOnamParticles,
    lohri: (c, x) => runFireParticles(c, x, 'lohri'),
    dussehra: (c, x) => runFireParticles(c, x, 'dussehra'),
    pongal: (c, x) => runFireParticles(c, x, 'pongal'),
    default: runDefaultParticles,
};

const ParticleLayer = () => {
    const { theme } = useTheme();
    const canvasRef = useRef(null);
    const cleanupRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        if (cleanupRef.current) cleanupRef.current();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const runner = PARTICLE_RUNNERS[theme] || PARTICLE_RUNNERS.default;
        cleanupRef.current = runner(canvas, ctx);

        return () => {
            window.removeEventListener('resize', resize);
            if (cleanupRef.current) cleanupRef.current();
        };
    }, [theme]);

    return (
        <canvas
            ref={canvasRef}
            id="festival-canvas"
            style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
        />
    );
};

export default ParticleLayer;
