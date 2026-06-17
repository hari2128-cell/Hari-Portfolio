// ═══════════════════════════════════════════════
//   ENGINEER'S ODYSSEY — CINEMATIC ENGINE v2
// ═══════════════════════════════════════════════

class DivineCursor {
    constructor() {
        this.dot = document.getElementById('cursor-dot');
        this.ring = document.getElementById('cursor-ring');
        this.rune = document.getElementById('cursor-rune');
        this.trailCanvas = document.getElementById('cursor-trail');
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.ringX = this.mouseX;
        this.ringY = this.mouseY;
        this.isHovering = false;
        this.raf = null;
        this.init();
    }
    init() {
        const els = [this.dot, this.ring, this.trailCanvas, this.rune];
        if (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
            els.forEach(el => el && (el.style.display = 'none'));
            document.body.style.cursor = 'auto';
            return;
        }
        if (this.trailCanvas) this.trailCanvas.style.display = 'none';
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        }, { passive: true });
        document.addEventListener('mousedown', () => this.dot?.classList.add('clicking'));
        document.addEventListener('mouseup', () => this.dot?.classList.remove('clicking'));
        const hoverTargets = 'a, button, .arsenal-chest, .lab-rail-item, .learning-satellite, .work-cinema-card, .beyond-card, .edu-entry, .detail-item, .epi-link, .hud-dot, .hero-cta, .achievement-house';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                this.isHovering = true;
                this.ring?.classList.add('hovering');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (!e.target.closest(hoverTargets)) {
                this.isHovering = false;
                this.ring?.classList.remove('hovering');
            }
        });
        this.animate();
    }
    animate() {
        this.ringX += (this.mouseX - this.ringX) * 0.16;
        this.ringY += (this.mouseY - this.ringY) * 0.16;
        const x = this.mouseX, y = this.mouseY;
        if (this.dot) this.dot.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;
        if (this.ring) this.ring.style.transform = `translate3d(${this.ringX - 15}px, ${this.ringY - 15}px, 0)`;
        this.raf = requestAnimationFrame(() => this.animate());
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.particleCount = window.innerWidth < 768 ? 8 : 18;
        this.running = true;
        this.init();
    }
    init() {
        this.resize();
        this.createParticles();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; }, { passive: true });
        document.addEventListener('visibilitychange', () => {
            this.running = !document.hidden;
            if (this.running) this.animate();
        });
        this.animate();
    }
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    createParticles() {
        this.particles = Array.from({ length: this.particleCount }, () => ({
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 0.5,
            baseSize: Math.random() * 2 + 0.5,
            opacity: Math.random() * 0.5 + 0.1,
            pulseSpeed: Math.random() * 0.03 + 0.01,
            pulseOffset: Math.random() * Math.PI * 2,
            color: Math.random() > 0.7 ? 'rgba(77,232,255,' : 'rgba(196,164,90,'
        }));
    }
    animate() {
        if (!this.running || !this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() * 0.001;
        const len = this.particles.length;
        for (let i = 0; i < len; i++) {
            const p = this.particles[i];
            const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y, dist = Math.hypot(dx, dy);
            if (dist < 160) {
                const force = (160 - dist) / 160;
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force * 0.04;
                p.vy += Math.sin(angle) * force * 0.04;
            }
            p.vx *= 0.99; p.vy *= 0.99;
            p.x += p.vx; p.y += p.vy;
            if (p.x < -50) p.x = this.canvas.width + 50;
            if (p.x > this.canvas.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.canvas.height + 50;
            if (p.y > this.canvas.height + 50) p.y = -50;
            const pulse = Math.sin(time * p.pulseSpeed * 100 + p.pulseOffset) * 0.5 + 0.5;
            p.size = p.baseSize + pulse * 1.2;
            const alpha = p.opacity * (0.5 + pulse * 0.5);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + alpha + ')';
            this.ctx.fill();
            for (let j = i + 1; j < len; j++) {
                const p2 = this.particles[j];
                const cdx = p.x - p2.x, cdy = p.y - p2.y, cdist = Math.hypot(cdx, cdy);
                if (cdist < 120) {
                    const la = (1 - cdist / 120) * 0.08;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(196, 164, 90, ${la})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        }
        requestAnimationFrame(() => this.animate());
    }
}

class HeroCanvas {
    constructor() {
        this.canvas = document.getElementById('heroCanvas');
        if (!this.canvas) return;
        this.ctx = this.canvas.getContext('2d');
        this.streaks = [];
        this.init();
    }
    init() {
        this.resize();
        for (let i = 0; i < 5; i++) {
            this.streaks.push({
                x: Math.random(), y: Math.random(),
                len: 0.08 + Math.random() * 0.15,
                speed: 0.00015 + Math.random() * 0.0002,
                opacity: 0.04 + Math.random() * 0.08
            });
        }
        window.addEventListener('resize', () => this.resize());
        this.animate();
    }
    resize() {
        const parent = this.canvas.parentElement;
        this.canvas.width = parent.offsetWidth;
        this.canvas.height = parent.offsetHeight;
    }
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.streaks.forEach(s => {
            s.x += s.speed;
            if (s.x > 1.2) s.x = -0.2;
            const x = s.x * this.canvas.width, y = s.y * this.canvas.height;
            const len = s.len * this.canvas.width;
            const grad = this.ctx.createLinearGradient(x, y, x + len, y);
            grad.addColorStop(0, 'transparent');
            grad.addColorStop(0.5, `rgba(212, 184, 106, ${s.opacity})`);
            grad.addColorStop(1, 'transparent');
            this.ctx.beginPath();
            this.ctx.moveTo(x, y);
            this.ctx.lineTo(x + len, y + len * 0.1);
            this.ctx.strokeStyle = grad;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
        requestAnimationFrame(() => this.animate());
    }
}

class PortfolioApp {
    constructor() {
        this.loadingScreen = document.getElementById('loadingScreen');
        this.loadingBar = document.getElementById('loadingBar');
        this.loadingPercent = document.getElementById('loadingPercent');
        this.mainContainer = document.getElementById('mainContainer');
        this.startLoading();
    }
    startLoading() {
        const duration = 4500;
        const start = performance.now();
        const tick = (now) => {
            const elapsed = now - start;
            let progress = Math.min(100, Math.round((elapsed / duration) * 100));
            if (progress >= 100) {
                progress = 100;
                this.loadingBar.style.width = progress + '%';
                this.loadingPercent.textContent = progress + '%';
                this.completeLoading();
                return;
            }
            this.loadingBar.style.width = progress + '%';
            this.loadingPercent.textContent = progress + '%';
            requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
    }
    completeLoading() {
        requestAnimationFrame(() => {
            this.loadingScreen.classList.add('hidden');
            this.mainContainer.classList.add('ready');
            document.body.classList.add('cinematic-mode');
            setTimeout(() => document.body.classList.remove('cinematic-mode'), 2000);
            if (window.initPortfolioExperience) window.initPortfolioExperience();
        });
    }
}

class GameNavigation {
    constructor() {
        this.hud = document.getElementById('gameHud');
        this.dots = document.querySelectorAll('.hud-dot');
        this.chapterDisplay = document.getElementById('hudChapter');
        this.sections = document.querySelectorAll('.game-section, .hero-section');
        this.sectionMap = {
            hero: 'HERO', engineer: 'THE ENGINEER', arsenal: 'THE ARSENAL',
            work: 'THE WORK', lab: 'ENGINEERING LAB', journey: 'THE JOURNEY',
            beyond: 'BEYOND ENGINEERING', education: 'EDUCATION',
            learning: 'CONTINUOUS LEARNING', epilogue: 'EPILOGUE'
        };
        window.addEventListener('scroll', () => this.updateHUD());
        this.dots.forEach(d => d.addEventListener('click', () => {
            document.getElementById(d.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
        }));
        document.querySelectorAll('.hero-cta').forEach(btn => {
            btn.addEventListener('click', () => {
                document.getElementById(btn.dataset.target)?.scrollIntoView({ behavior: 'smooth' });
            });
        });
        window.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); this.navigateNext(); }
            else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); this.navigatePrev(); }
        });
    }
    updateHUD() {
        const sp = window.scrollY + window.innerHeight / 3;
        this.hud.classList.toggle('visible', window.scrollY > 300);
        let ci = 'hero';
        this.sections.forEach(s => {
            if (sp >= s.offsetTop && sp < s.offsetTop + s.offsetHeight) ci = s.id;
        });
        this.dots.forEach(d => d.classList.toggle('active', d.dataset.target === ci));
        if (this.chapterDisplay) this.chapterDisplay.textContent = this.sectionMap[ci] || ci.toUpperCase();
    }
    navigateNext() {
        const ad = document.querySelector('.hud-dot.active');
        ad?.nextElementSibling?.click();
    }
    navigatePrev() {
        const ad = document.querySelector('.hud-dot.active');
        ad?.previousElementSibling?.click();
    }
}

class ScrollAnimator {
    constructor() {
        this.sections = document.querySelectorAll('.game-section');
        this.parallaxFrame = null;
        this.lastMouseEvent = null;
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
        this.sections.forEach(s => this.observer.observe(s));
        document.addEventListener('mousemove', (e) => {
            this.lastMouseEvent = e;
            if (this.parallaxFrame) return;
            this.parallaxFrame = requestAnimationFrame(() => {
                this.parallaxFrame = null;
                if (this.lastMouseEvent) this.handleHeroParallax(this.lastMouseEvent);
            });
        }, { passive: true });
        window.addEventListener('scroll', () => this.handleScroll());
    }
    handleScroll() {
        const scrolled = window.pageYOffset;
        const heroImage = document.querySelector('.hero-image-container');
        if (heroImage) heroImage.style.transform = `translateY(${scrolled * 0.015}px)`;
    }
    handleHeroParallax(e) {
        const hs = document.querySelector('.hero-section');
        if (!hs) return;
        const rect = hs.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) return;
        const x = (e.clientX - window.innerWidth / 2) / window.innerWidth;
        const y = (e.clientY - window.innerHeight / 2) / window.innerHeight;
        const iw = document.querySelector('.hero-image-wrapper');
        const tb = document.querySelector('.hero-text-block');
        if (iw) iw.style.transform = `translate(${x * 6}px, ${y * 6}px)`;
        if (tb) tb.style.transform = `translate(${-x * 4}px, ${-y * 4}px)`;
    }
}

class IdentityAnimator {
    constructor() {
        this.stats = document.querySelectorAll('.stat[data-count]');
        this.section = document.getElementById('engineer');
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    this.section?.classList.add('engineer-active');
                    this.animateStats();
                }
            });
        }, { threshold: 0.25 });
        if (this.section) this.observer.observe(this.section);
    }
    animateStats() {
        this.stats.forEach(stat => {
            const target = parseFloat(stat.dataset.count);
            const el = stat.querySelector('.stat-number');
            const isDecimal = target % 1 !== 0;
            let current = 0;
            const step = target / 40;
            const interval = setInterval(() => {
                current += step;
                if (current >= target) {
                    current = target;
                    clearInterval(interval);
                }
                el.textContent = isDecimal ? current.toFixed(2) : Math.floor(current) + (target > 9 ? '+' : '');
            }, 30);
        });
        this.observer.disconnect();
    }
}

// ARSENAL — Auto-deploy on scroll (no click required)
class ArsenalCinematic {
    constructor() {
        this.chests = document.querySelectorAll('.arsenal-chest');
        this.countEl = document.getElementById('arsenalCount');
        this.allUnlockedEl = document.getElementById('arsenalAllUnlocked');
        this.unlockedCount = 0;
        this.deployed = new Set();
        this.section = document.getElementById('arsenal');
        this.init();
    }
    init() {
        const scrollCheck = () => this.updateScrollReveal();
        window.addEventListener('scroll', scrollCheck, { passive: true });
        window.addEventListener('resize', scrollCheck, { passive: true });
        requestAnimationFrame(scrollCheck);
        // Still allow click for re-flip interaction
        this.chests.forEach(chest => {
            chest.addEventListener('click', () => {
                if (!chest.classList.contains('opened')) this.openChest(chest);
                else chest.classList.remove('opened');
            });
        });
    }
    clamp(value, min = 0, max = 1) {
        return Math.min(max, Math.max(min, value));
    }
    updateScrollReveal() {
        if (!this.section || !this.chests.length) return;
        this.chests.forEach((chest, i) => {
            if (this.deployed.has(i)) return;
            const rect = chest.getBoundingClientRect();
            const triggerLine = window.innerHeight * (window.innerWidth <= 640 ? 0.78 : 0.72);
            const chestProgress = this.clamp((triggerLine - rect.top) / Math.max(1, rect.height * 0.7));
            if (chestProgress < 0.28) return;
            chest.classList.add('deploying');
            this.deployed.add(i);
            setTimeout(() => this.openChest(chest), 220);
        });
    }
    openChest(chest) {
        if (chest.classList.contains('opened')) return;
        chest.classList.add('opened');
        this.unlockedCount++;
        if (this.countEl) this.countEl.textContent = this.unlockedCount;
        if (this.unlockedCount >= this.chests.length && this.allUnlockedEl) {
            setTimeout(() => this.allUnlockedEl.classList.add('show'), 400);
        }
        this.createBurst(chest);
    }
    createBurst(chest) {
        const rect = chest.getBoundingClientRect();
        const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
        for (let i = 0; i < 15; i++) {
            const p = document.createElement('div');
            const angle = (Math.PI * 2 * i) / 15, dist = 40 + Math.random() * 50;
            p.style.cssText = `position:fixed;left:${cx}px;top:${cy}px;width:4px;height:4px;background:#d4b86a;border-radius:50%;pointer-events:none;z-index:9999;`;
            document.body.appendChild(p);
            const anim = p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(angle) * dist}px,${Math.sin(angle) * dist}px) scale(0)`, opacity: 0 }
            ], { duration: 700, easing: 'ease-out' });
            anim.onfinish = () => p.remove();
        }
    }
}

// WORK — Cinematic scroll-driven cards
class WorkCinema {
    constructor() {
        this.cards = document.querySelectorAll('.work-cinema-card');
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) {
                    e.target.classList.add('revealed');
                    this.cards.forEach(c => c.classList.remove('active'));
                    e.target.classList.add('active');
                    document.body.classList.add('cinematic-mode');
                    setTimeout(() => document.body.classList.remove('cinematic-mode'), 1200);
                }
            });
        }, { threshold: 0.45 });
        this.cards.forEach(c => this.observer.observe(c));
    }
}

// LAB — Auto mission briefing showcase
class LabShowcase {
    constructor() {
        this.section = document.getElementById('lab');
        this.display = document.getElementById('labDisplay');
        this.rail = document.getElementById('labRail');
        this.progressFill = document.getElementById('labProgressFill');
        this.countEl = document.getElementById('labCount');
        this.currentNumEl = document.getElementById('labCurrentNum');
        this.allUnlockedEl = document.getElementById('labAllUnlocked');
        this.projects = [
            { number: '05', title: 'LoRa Disaster Network', desc: 'Long-range communication using LoRa, GPS & sensors for disaster coordination.', tags: ['LoRa', 'GPS', 'Arduino'] },
            { number: '06', title: 'Magnetic Leakage Detector', desc: 'Detects stray magnetic fields using Hall-effect sensors with energy harvesting.', tags: ['Hall-Effect', 'Analog', 'Energy Harvest'] },
            { number: '07', title: 'Through-Wall Detection', desc: 'Human presence detection behind walls via EM signal analysis for search & rescue.', tags: ['EM Analysis', 'Sensing'] },
            { number: '08', title: 'Smart Shoes', desc: 'Obstacle-detecting footwear with haptic feedback for visually impaired navigation.', tags: ['Embedded', 'Assistive Tech'] },
            { number: '09', title: 'Vanish Watcher', desc: 'Analog monitoring circuit that triggers alerts when objects are removed from location.', tags: ['Analog', 'Presence Detection'] },
            { number: '10', title: 'Overload Protection', desc: 'Circuit protecting devices from excessive current with automatic threshold triggering.', tags: ['Power Electronics', 'Current Monitor'] },
            { number: '11', title: 'Analog TX & RX', desc: 'Functional transmit-receive pair demonstrating modulation and signal propagation.', tags: ['Analog', 'Modulation', 'RF'] },
            { number: '12', title: 'Battery Indicator', desc: 'Voltage monitoring circuit with graduated visual indicators for charge level.', tags: ['Voltage Sensing', 'Analog Design'] }
        ];
        this.currentIndex = 0;
        this.cycleTimer = null;
        this.progressTimer = null;
        this.cycleDuration = 4500;
        this.seen = new Set();
        this.started = false;
        this.init();
    }
    init() {
        this.renderRail();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) this.startShowcase();
                else this.stopShowcase();
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -35% 0px' });
        if (this.section) observer.observe(this.section);
    }
    renderRail() {
        this.rail.innerHTML = this.projects.map((p, i) =>
            `<button type="button" class="lab-rail-item" data-index="${i}" aria-label="Prototype ${p.number}"><span class="rail-num">${p.number}</span></button>`
        ).join('');
        this.railItems = this.rail.querySelectorAll('.lab-rail-item');
        this.railItems.forEach((item, i) => {
            item.addEventListener('click', () => this.selectProject(i));
        });
    }
    selectProject(index) {
        clearInterval(this.cycleTimer);
        clearInterval(this.progressTimer);
        this.started = true;
        const instant = !this.display?.classList.contains('active');
        this.showProject(index, instant);
        this.cycleTimer = setInterval(() => {
            this.showProject((this.currentIndex + 1) % this.projects.length);
        }, this.cycleDuration);
    }
    startShowcase() {
        if (this.cycleTimer) return;
        if (!this.started) {
            this.started = true;
            this.showProject(0, true);
        } else {
            this.animateProgress();
        }
        this.cycleTimer = setInterval(() => {
            this.showProject((this.currentIndex + 1) % this.projects.length);
        }, this.cycleDuration);
    }
    stopShowcase() {
        clearInterval(this.cycleTimer);
        clearInterval(this.progressTimer);
        this.cycleTimer = null;
        this.progressTimer = null;
    }
    showProject(index, instant = false) {
        this.currentIndex = index;
        const proj = this.projects[index];
        this.seen.add(index);
        if (this.countEl) this.countEl.textContent = this.seen.size;
        if (this.currentNumEl) this.currentNumEl.textContent = proj.number;
        this.railItems.forEach((item, i) => item.classList.toggle('active', i === index));
        if (this.seen.size >= this.projects.length && this.allUnlockedEl) {
            this.allUnlockedEl.classList.add('show');
        }
        const updateContent = () => {
            document.getElementById('labDisplayNumber').textContent = proj.number;
            document.getElementById('labDisplayTitle').textContent = proj.title;
            document.getElementById('labDisplayDesc').textContent = proj.desc;
            document.getElementById('labDisplayTags').innerHTML = proj.tags.map(t => `<span>${t}</span>`).join('');
        };
        if (instant) {
            updateContent();
            this.display?.classList.add('active');
        } else {
            this.display?.classList.remove('active');
            setTimeout(() => {
                updateContent();
                this.display?.classList.add('active');
            }, 350);
        }
        this.animateProgress();
    }
    animateProgress() {
        if (!this.progressFill) return;
        clearInterval(this.progressTimer);
        this.progressTimer = null;
        this.progressFill.style.transition = 'none';
        this.progressFill.style.width = '0%';
        requestAnimationFrame(() => {
            if (!this.progressFill) return;
            this.progressFill.style.transition = `width ${this.cycleDuration}ms linear`;
            this.progressFill.style.width = '100%';
        });
    }
}

// ═══════════════════════════════════════════════
// JOURNEY — Achievement houses, road, car, trophy finale
// ═══════════════════════════════════════════════
class JourneyCinema {
    constructor() {
        this.container = document.getElementById('journeyFuture');
        this.timeline = document.getElementById('journeyTimeline');
        this.finale = document.getElementById('journeyFinale');
        this.odysseyTitle = document.getElementById('odysseyContinues');
        this.svg = document.getElementById('journeyRoadSvg');
        this.pathBed = document.getElementById('journeyRoadBed');
        this.pathDash = document.getElementById('journeyRoadDash');
        this.pathGlow = document.getElementById('journeyRoadGlowLine');
        this.pathDraw = document.getElementById('journeyRoadDraw');
        this.car = document.getElementById('journeyCar');
        this.hero = document.getElementById('journeyHero');
        this.trophy = document.getElementById('finaleTrophy');
        this.confettiEl = document.getElementById('finaleConfetti');
        this.fireworksEl = document.getElementById('finaleFireworks');
        this.section = document.getElementById('journey');
        this.milestones = [
            { event: 'Smart India Hackathon', year: '2025', result: 'Round 2 Qualifier', context: "My FIRST hackathon — India's largest student innovation competition", icon: '🏛' },
            { event: 'Mumbai Hackathon', year: '2025', result: 'Finalist', context: 'Competed among top national teams in Mumbai', icon: '🌆' },
            { event: 'Pragyan Hackathon', year: '2026', result: 'Participant', context: "NIT Trichy's premier hackathon experience", icon: '⚡' },
            { event: 'RIFT Hackathon', year: '2026', result: 'Participant', context: 'Pushed boundaries in rapid innovation', icon: '🔬' },
            { event: 'NSS Best Volunteer Award', year: '2026', result: 'Recognition', context: 'Honored for outstanding community service contributions', icon: '🌱' },
            { event: 'Schneider Electric Challenge', year: '2026', result: 'Participant', context: 'Industry-level engineering problem solving', icon: '⚙' },
            { event: 'Mechovate', year: '2026', result: 'Participant', context: 'Mechanical & electronics innovation showcase', icon: '🔧' },
            { event: 'KI Hacks', year: '2026', result: 'Participant', context: 'Creative problem-solving marathon', icon: '💡' },
            { event: 'SDG Hackathon', year: '2026', result: 'Finalist', context: 'Sustainable Development Goals focused innovation', icon: '🌍' },
            { event: 'Tenkasi Hackathon', year: '2026', result: 'Runner Up', context: 'Secured podium finish among fierce competition', icon: '🏅' },
            { event: 'CreateX Hackathon', year: '2026', result: 'Special Mention', context: 'Recognized among national-level teams for innovation', icon: '✨' },
            { event: 'StartupTN Hackathons', year: '2025-2026', result: 'Multiple Editions', context: 'Consistent participation across StartupTN initiatives', icon: '🚀' }
        ];
        this.pathLength = 0;
        this.nodeLengths = [];
        this.nodePoints = [];
        this.drawnLength = 0;
        this.targetLength = 0;
        this.carLength = 0;
        this.carAngle = 0;
        this.roadRaf = null;
        this.scrollRaf = null;
        this.animationStarted = false;
        this.celebratedStops = new Set();
        this.confettiStarted = false;
        this.finaleStarted = false;
        this.finaleComplete = false;
        this.finaleTimer = null;
        this.finaleRunId = 0;
        this.stops = [];
        this.stopVisibility = [];
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        this.init();
    }

    init() {
        if (!this.timeline) return;
        this.renderTimeline();
        const scrollCheck = () => this.requestScrollUpdate();
        requestAnimationFrame(() => requestAnimationFrame(() => {
            this.buildRoad();
            this.updateScrollJourney();
        }));
        window.addEventListener('resize', () => {
            requestAnimationFrame(() => {
                this.buildRoad();
                this.updateScrollJourney();
            });
        }, { passive: true });
        window.addEventListener('scroll', scrollCheck, { passive: true });
        requestAnimationFrame(scrollCheck);
    }

    requestScrollUpdate() {
        if (this.scrollRaf) return;
        this.scrollRaf = requestAnimationFrame(() => {
            this.scrollRaf = null;
            this.updateScrollJourney();
        });
    }

    clamp(value, min = 0, max = 1) {
        return Math.min(max, Math.max(min, value));
    }

    updateScrollJourney() {
        if (!this.section || !this.container || !this.timeline) return;
        if (this.reducedMotion) {
            this.showAll();
            return;
        }
        if (!this.pathDraw || !this.pathLength) {
            this.buildRoad();
            if (!this.pathLength) return;
        }

        const rect = this.container.getBoundingClientRect();
        const playhead = window.innerHeight * (window.innerWidth <= 640 ? 0.58 : 0.56);
        const firstPoint = this.nodePoints[0] || { y: 0 };
        const lastPoint = this.nodePoints[this.nodePoints.length - 1] || { y: rect.height };
        const preRoll = Math.min(180, window.innerHeight * 0.22);
        const finaleScroll = Math.min(260, Math.max(120, window.innerHeight * 0.2));
        const localPlayhead = playhead - rect.top;
        const roadStartY = firstPoint.y - preRoll;
        const roadEndY = lastPoint.y;
        const roadSpan = Math.max(1, roadEndY - roadStartY);
        const progress = this.clamp((localPlayhead - roadStartY) / (roadSpan + finaleScroll));
        this.section.classList.toggle('visible', progress > 0.01);
        this.section.classList.toggle('journey-road-ready', progress > 0.015);
        if (progress > 0.01 && progress < 1) window.activeLabShowcase?.stopShowcase?.();

        const roadProgress = this.clamp((localPlayhead - roadStartY) / roadSpan);
        const currentLen = this.pathLength * roadProgress;
        this.targetLength = currentLen;
        this.drawnLength = currentLen;
        this.pathDraw.style.strokeDashoffset = this.pathLength - currentLen;
        if (this.pathGlow) this.pathGlow.style.strokeDashoffset = this.pathLength - currentLen;
        this.startRoadRenderLoop();

        if (progress > 0.015) {
            const atFinale = roadProgress >= 0.995;
            this.car?.setAttribute('opacity', this.finaleComplete ? '0.72' : '1');
            this.car?.classList.toggle('parked', atFinale || this.finaleStarted);
        } else {
            this.car?.setAttribute('opacity', '0');
            this.car?.classList.remove('parked', 'door-open');
        }

        const stops = this.stops.length ? this.stops : [...this.timeline.querySelectorAll('.journey-stop')];
        const revealLead = this.pathLength * 0.035;
        stops.forEach((stop, i) => {
            const visible = currentLen + revealLead >= (this.nodeLengths[i] || 0);
            if (this.stopVisibility[i] !== visible) {
                this.stopVisibility[i] = visible;
                stop.classList.toggle('visible', visible);
            }
            if (visible && !this.celebratedStops.has(i)) {
                this.celebratedStops.add(i);
                this.celebrateHouse(stop);
            }
        });

        const finaleProgress = this.clamp((localPlayhead - roadEndY) / finaleScroll);
        const allStopsVisible = stops.length > 0 && this.celebratedStops.size >= stops.length && roadProgress >= 0.985;
        if (roadProgress < 0.94 && (this.finaleStarted || this.finaleComplete || this.finaleTimer)) {
            this.resetFinale();
        }
        this.finale?.classList.toggle('visible', finaleProgress > 0.05 || allStopsVisible || this.finaleStarted);
        if (allStopsVisible) this.queueTimedFinale();
        this.section.classList.toggle('journey-complete', this.finaleComplete);

        const beyond = document.getElementById('beyond');
        if (beyond) beyond.classList.toggle('journey-reveal-next', this.finaleComplete);
    }

    updateScrollFinale(progress) {
        const showFinale = progress > 0.08;
        this.finale?.classList.toggle('visible', showFinale);
        this.trophy?.classList.toggle('lifted', progress > 0.42);
        this.odysseyTitle?.classList.toggle('visible', progress > 0.62);

        if (progress > 0.5 && !this.confettiStarted) {
            this.confettiStarted = true;
            this.spawnConfetti();
        } else if (progress <= 0.1) {
            this.confettiStarted = false;
        }

        if (!this.hero || !this.pathDraw || !this.pathLength) return;
        if (progress <= 0.02) {
            this.hero.setAttribute('opacity', '0');
            this.hero.classList.remove('exiting', 'arrived');
            return;
        }

        const lastLen = this.nodeLengths[this.nodeLengths.length - 1] || this.pathLength;
        const carPt = this.pathDraw.getPointAtLength(lastLen);
        const trophyRect = this.trophy?.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        const tx = trophyRect ? trophyRect.left - containerRect.left + trophyRect.width / 2 : carPt.x;
        const ty = trophyRect ? trophyRect.top - containerRect.top + trophyRect.height / 2 - 20 : carPt.y;
        const walk = this.clamp(progress / 0.72);
        const eased = walk < 0.5 ? 4 * walk * walk * walk : 1 - Math.pow(-2 * walk + 2, 3) / 2;
        const x = (carPt.x - 5) + (tx - (carPt.x - 5)) * eased;
        const y = (carPt.y + 2) + (ty - (carPt.y + 2)) * eased + Math.sin(walk * Math.PI * 8) * 2;
        const scale = 0.72 + Math.min(walk * 1.4, 1) * 0.28;
        this.hero.setAttribute('opacity', '1');
        this.hero.classList.toggle('exiting', walk < 0.98);
        this.hero.classList.toggle('arrived', walk >= 0.98);
        this.hero.setAttribute('transform', `translate(${x},${y}) scale(${scale})`);
    }

    queueTimedFinale() {
        if (this.finaleStarted || this.finaleTimer) return;
        this.finaleTimer = setTimeout(() => {
            this.finaleTimer = null;
            this.playTimedFinale();
        }, 520);
    }

    resetFinale() {
        this.finaleRunId++;
        if (this.finaleTimer) {
            clearTimeout(this.finaleTimer);
            this.finaleTimer = null;
        }
        this.finaleStarted = false;
        this.finaleComplete = false;
        this.confettiStarted = false;
        this.section?.classList.remove('journey-celebrating', 'journey-complete');
        this.car?.classList.remove('door-open');
        this.trophy?.classList.remove('lifted');
        this.odysseyTitle?.classList.remove('visible');
        this.hero?.setAttribute('opacity', '0');
        this.hero?.classList.remove('exiting', 'arrived');
        if (this.confettiEl) this.confettiEl.innerHTML = '';
        if (this.fireworksEl) this.fireworksEl.innerHTML = '';
        document.getElementById('beyond')?.classList.remove('journey-reveal-next');
    }

    startRoadRenderLoop() {
        if (this.roadRaf || !this.pathDraw || !this.pathLength || this.reducedMotion) return;
        const tick = () => {
            const delta = this.targetLength - this.carLength;
            const nearTarget = Math.abs(delta) < 0.35;
            this.carLength = nearTarget ? this.targetLength : this.carLength + delta * 0.22;
            if (this.car && this.car.getAttribute('opacity') !== '0') {
                this.setCarAtLength(this.carLength);
            }
            if (!nearTarget) {
                this.roadRaf = requestAnimationFrame(tick);
            } else {
                this.roadRaf = null;
            }
        };
        this.roadRaf = requestAnimationFrame(tick);
    }

    async playTimedFinale() {
        if (this.finaleStarted || this.reducedMotion) return;
        const runId = ++this.finaleRunId;
        this.finaleStarted = true;
        const lastLen = this.nodeLengths[this.nodeLengths.length - 1] || this.pathLength;
        this.targetLength = lastLen;
        this.carLength = lastLen;
        this.setCarAtLength(lastLen);
        this.finale?.classList.add('visible');
        this.hero?.setAttribute('opacity', '0');
        this.hero?.classList.remove('exiting', 'arrived');

        await this.delay(120);
        if (runId !== this.finaleRunId) return;
        this.car?.classList.add('parked');
        this.car?.classList.add('door-open');

        await this.delay(260);
        if (runId !== this.finaleRunId) return;

        this.section?.classList.add('journey-celebrating');
        this.trophy?.classList.add('lifted');
        this.spawnConfetti(window.innerWidth <= 640 ? 36 : 56);
        this.spawnFireworks();
        await this.delay(300);
        if (runId !== this.finaleRunId) return;
        this.odysseyTitle?.classList.add('visible');
        this.section?.classList.add('journey-complete');
        this.finaleComplete = true;
        document.getElementById('beyond')?.classList.add('journey-reveal-next');
    }

    renderTimeline() {
        this.timeline.innerHTML = '';
        this.milestones.forEach((m, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const stop = document.createElement('div');
            stop.className = `journey-stop journey-stop-${side}`;
            stop.dataset.index = i;
            stop.innerHTML = `
                <div class="achievement-house" aria-label="${m.event}">
                    <div class="house-structure">
                        <div class="house-roof"></div>
                        <div class="house-body">
                            <span class="house-icon">${m.icon}</span>
                            <span class="house-num">${String(i + 1).padStart(2, '0')}</span>
                        </div>
                        <div class="house-door"></div>
                    </div>
                    <div class="house-plaque">
                        <div class="plaque-header">
                            <span class="plaque-mile">M${String(i + 1).padStart(2, '0')}</span>
                            <span class="plaque-year">${m.year}</span>
                        </div>
                        <h4 class="plaque-title">${m.event}</h4>
                        <span class="plaque-badge">${m.result}</span>
                        <p class="plaque-context">${m.context}</p>
                    </div>
                    <div class="house-celebrate" aria-hidden="true"></div>
                </div>
                <div class="journey-node" aria-hidden="true"><span class="node-pulse"></span></div>`;
            this.timeline.appendChild(stop);
        });
        this.stops = [...this.timeline.querySelectorAll('.journey-stop')];
    }

    getLayoutPoint(el, x = 0, y = 0) {
        let px = x;
        let py = y;
        let node = el;
        while (node && node !== this.container) {
            px += node.offsetLeft || 0;
            py += node.offsetTop || 0;
            node = node.parentElement;
        }
        return { x: px, y: py };
    }

    getElementCenter(el) {
        return this.getLayoutPoint(el, el.offsetWidth / 2, el.offsetHeight / 2);
    }

    getDoorPoint(stop) {
        const door = stop.querySelector('.house-door');
        if (!door) return this.getElementCenter(stop);
        return this.getLayoutPoint(door, door.offsetWidth / 2, door.offsetHeight - 1);
    }

    syncNodeToDoor(stop, point) {
        const node = stop.querySelector('.journey-node');
        if (!node) return;
        const stopOrigin = this.getLayoutPoint(stop);
        node.style.left = `${point.x - stopOrigin.x}px`;
        node.style.top = `${point.y - stopOrigin.y}px`;
    }

    cubicPoint(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        const a = mt * mt * mt;
        const b = 3 * mt * mt * t;
        const c = 3 * mt * t * t;
        const d = t * t * t;
        return {
            x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
            y: a * p0.y + b * p1.y + c * p2.y + d * p3.y
        };
    }

    cubicLength(p0, p1, p2, p3, steps = 20) {
        let length = 0;
        let prev = p0;
        for (let i = 1; i <= steps; i++) {
            const curr = this.cubicPoint(p0, p1, p2, p3, i / steps);
            length += Math.hypot(curr.x - prev.x, curr.y - prev.y);
            prev = curr;
        }
        return length;
    }

    buildRoadPath(points) {
        if (points.length < 2) return { d: '', nodeLengths: [] };
        let d = `M ${points[0].x} ${points[0].y}`;
        const nodeLengths = [0];
        let cumulative = 0;
        const isWide = this.container.offsetWidth > 760;
        const maxHandle = isWide ? 300 : 145;
        const minHandle = isWide ? 90 : 48;
        for (let i = 1; i < points.length; i++) {
            const p0 = points[Math.max(0, i - 2)];
            const prev = points[i - 1];
            const curr = points[i];
            const p3 = points[Math.min(points.length - 1, i + 1)];
            const segment = Math.hypot(curr.x - prev.x, curr.y - prev.y);
            const handle = this.clamp(segment * 0.34, minHandle, maxHandle);
            const t1 = this.normalizedTangent(p0, curr, isWide ? 0.58 : 0.42);
            const t2 = this.normalizedTangent(prev, p3, isWide ? 0.58 : 0.42);
            const cp1 = { x: prev.x + t1.x * handle, y: prev.y + t1.y * handle };
            const cp2 = { x: curr.x - t2.x * handle, y: curr.y - t2.y * handle };
            d += ` C ${cp1.x} ${cp1.y}, ${cp2.x} ${cp2.y}, ${curr.x} ${curr.y}`;
            cumulative += this.cubicLength(prev, cp1, cp2, curr, 34);
            nodeLengths.push(cumulative);
        }
        return { d, nodeLengths };
    }

    normalizedTangent(from, to, xWeight = 0.5) {
        const dx = (to.x - from.x) * xWeight;
        const dy = to.y - from.y;
        const len = Math.hypot(dx, dy) || 1;
        return { x: dx / len, y: dy / len };
    }

    buildRoad() {
        const stops = this.timeline?.querySelectorAll('.journey-stop');
        if (!stops?.length || !this.svg || !this.pathDraw) return;

        const h = this.timeline.offsetHeight + 180;
        const w = this.container.offsetWidth || 800;
        this.container.style.minHeight = h + 'px';
        this.svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
        this.svg.setAttribute('width', w);
        this.svg.setAttribute('height', h);

        const points = [...stops].map(s => {
            const p = this.getDoorPoint(s);
            this.syncNodeToDoor(s, p);
            return p;
        });
        this.nodePoints = points;
        const { d, nodeLengths } = this.buildRoadPath(points);
        if (!d) return;

        this.pathBed?.setAttribute('d', d);
        this.pathDash?.setAttribute('d', d);
        this.pathGlow?.setAttribute('d', d);
        this.pathDraw.setAttribute('d', d);
        this.pathLength = this.pathDraw.getTotalLength();
        this.pathDraw.style.strokeDasharray = `${this.pathLength} ${this.pathLength}`;
        this.pathDraw.style.strokeDashoffset = this.pathLength;
        if (this.pathGlow) {
            this.pathGlow.style.strokeDasharray = `${this.pathLength} ${this.pathLength}`;
            this.pathGlow.style.strokeDashoffset = this.pathLength;
        }
        const scale = nodeLengths.length ? this.pathLength / nodeLengths[nodeLengths.length - 1] : 1;
        this.nodeLengths = nodeLengths.map(l => l * scale);

        if (this.drawnLength > 0) {
            this.pathDraw.style.strokeDashoffset = this.pathLength - this.drawnLength;
            if (this.pathGlow) this.pathGlow.style.strokeDashoffset = this.pathLength - this.drawnLength;
            this.setCarAtLength(this.drawnLength);
            this.targetLength = this.drawnLength;
            this.carLength = this.drawnLength;
        }
    }

    getAngleAtLength(length) {
        const sample = window.innerWidth <= 640 ? 8 : 12;
        const p1 = this.pathDraw.getPointAtLength(Math.max(0, length - sample));
        const p2 = this.pathDraw.getPointAtLength(Math.min(this.pathLength, length + sample));
        return Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;
    }

    setCarAtLength(length) {
        if (!this.car || !this.pathDraw) return;
        const p = this.pathDraw.getPointAtLength(length);
        const rawAngle = this.getAngleAtLength(length);
        if (length < 1 && this.carLength < 1) this.carAngle = rawAngle;
        let angleDelta = rawAngle - this.carAngle;
        while (angleDelta > 180) angleDelta -= 360;
        while (angleDelta < -180) angleDelta += 360;
        this.carAngle += angleDelta * 0.2;
        const speed = Math.min(1, Math.abs(this.targetLength - this.carLength) / 34);
        const lean = this.clamp(angleDelta / 38, -2.5, 2.5) * speed;
        this.car.setAttribute('transform', `translate(${p.x},${p.y}) rotate(${this.carAngle + lean})`);
    }

    delay(ms) { return new Promise(r => setTimeout(r, ms)); }

    celebrateHouse(stop) {
        const house = stop.querySelector('.achievement-house');
        const burst = stop.querySelector('.house-celebrate');
        house?.classList.add('revealed');
        if (burst) {
            burst.classList.add('active');
            setTimeout(() => burst.classList.remove('active'), 900);
        }
    }

    showAll() {
        this.section?.classList.add('visible', 'journey-road-ready');
        this.timeline?.querySelectorAll('.journey-stop').forEach(s => {
            s.classList.add('visible');
            this.celebrateHouse(s);
        });
        if (this.pathDraw && this.pathLength) {
            this.pathDraw.style.strokeDashoffset = '0';
            if (this.pathGlow) this.pathGlow.style.strokeDashoffset = '0';
            this.drawnLength = this.pathLength;
            this.targetLength = this.pathLength;
            this.carLength = this.pathLength;
        }
        this.car?.setAttribute('opacity', '0');
        this.finale?.classList.add('visible');
        this.trophy?.classList.add('lifted');
        this.odysseyTitle?.classList.add('visible');
        this.section?.classList.add('journey-complete');
        this.finaleComplete = true;
    }

    async playJourney() {
        if (this.animationStarted) return;
        this.animationStarted = true;
        window.activeLabShowcase?.stopShowcase?.();
        this.section?.classList.add('visible');

        if (this.reducedMotion) {
            this.showAll();
            return;
        }

        try {
            this.buildRoad();
            const stops = [...this.timeline.querySelectorAll('.journey-stop')];
            if (!stops.length) return;

            await this.delay(280);
            stops[0].classList.add('visible');
            this.celebrateHouse(stops[0]);
            await this.delay(280);
            this.section?.classList.add('journey-road-ready');
            await this.delay(180);
            this.car?.setAttribute('opacity', '1');
            this.setCarAtLength(0);
            await this.delay(320);

            for (let i = 0; i < stops.length - 1; i++) {
                const fromLen = this.drawnLength;
                const toLen = this.nodeLengths[i + 1] || 0;
                await this.animateRoadAndCar(fromLen, toLen, 1200);
                stops[i + 1].classList.add('visible');
                this.celebrateHouse(stops[i + 1]);
                await this.delay(350);
            }

            await this.playFinale();
        } catch (e) {
            console.warn('Journey cinema fallback:', e);
            this.showAll();
        }
    }

    animateRoadAndCar(fromLen, toLen, duration) {
        const startDraw = this.drawnLength;
        return new Promise(resolve => {
            const start = performance.now();
            const tick = now => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 3);
                const currentLen = fromLen + (toLen - fromLen) * eased;
                this.drawnLength = currentLen;
                this.pathDraw.style.strokeDashoffset = this.pathLength - currentLen;
                this.setCarAtLength(currentLen);
                if (t < 1) requestAnimationFrame(tick);
                else resolve();
            };
            requestAnimationFrame(tick);
        });
    }

    async playFinale() {
        const lastLen = this.nodeLengths[this.nodeLengths.length - 1] || this.pathLength;
        this.setCarAtLength(lastLen);
        await this.delay(180);

        this.car?.classList.add('parked');
        this.car?.classList.add('door-open');
        await this.delay(250);

        const carPt = this.pathDraw.getPointAtLength(lastLen);
        this.hero?.setAttribute('opacity', '1');
        this.hero?.classList.add('exiting');
        this.hero?.setAttribute('transform', `translate(${carPt.x - 5},${carPt.y + 2}) scale(0.72)`);
        await this.delay(160);

        const trophyRect = this.trophy?.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();
        if (trophyRect && this.hero) {
            const tx = trophyRect.left - containerRect.left + trophyRect.width / 2;
            const ty = trophyRect.top - containerRect.top + trophyRect.height / 2 - 20;
            await this.animateHeroWalk(carPt.x - 5, carPt.y + 2, tx, ty, 650);
        }

        this.finale?.classList.add('visible');
        this.trophy?.classList.add('lifted');
        this.spawnConfetti();
        await this.delay(400);

        this.odysseyTitle?.classList.add('visible');
        this.section?.classList.add('journey-complete');
        await this.delay(600);

        const beyond = document.getElementById('beyond');
        if (beyond) beyond.classList.add('journey-reveal-next');
    }

    animateHeroWalk(fromX, fromY, toX, toY, duration) {
        return new Promise(resolve => {
            const start = performance.now();
            const tick = now => {
                const t = Math.min((now - start) / duration, 1);
                const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const x = fromX + (toX - fromX) * eased;
                const bob = Math.sin(t * Math.PI * 8) * 3 * (1 - t * 0.25);
                const y = fromY + (toY - fromY) * eased + bob;
                const scale = 0.72 + Math.min(t * 1.4, 1) * 0.28;
                this.hero?.setAttribute('transform', `translate(${x},${y}) scale(${scale})`);
                if (t < 1) requestAnimationFrame(tick);
                else {
                    this.hero?.classList.remove('exiting');
                    this.hero?.classList.add('arrived');
                    resolve();
                }
            };
            requestAnimationFrame(tick);
        });
    }

    spawnConfetti(count = 48) {
        if (!this.confettiEl) return;
        const colors = ['#c4a45a', '#d4b86a', '#4de8ff', '#e8d5a3', '#ffffff', '#ffdd77'];
        for (let i = 0; i < count; i++) {
            const piece = document.createElement('span');
            piece.className = 'confetti-piece';
            piece.style.cssText = `
                left:${Math.random() * 100}%;
                --drift:${(Math.random() * 220 - 110).toFixed(1)}px;
                --spin:${Math.random() > 0.5 ? 1 : -1};
                background:${colors[i % colors.length]};
                animation-delay:${Math.random() * 0.45}s;
                animation-duration:${1.05 + Math.random() * 0.95}s;
            `;
            this.confettiEl.appendChild(piece);
            setTimeout(() => piece.remove(), 2600);
        }
    }

    spawnFireworks() {
        if (!this.fireworksEl) return;
        this.fireworksEl.innerHTML = '';
        const bursts = window.innerWidth <= 640 ? 3 : 5;
        for (let i = 0; i < bursts; i++) {
            const burst = document.createElement('span');
            burst.className = 'firework-burst';
            burst.style.cssText = `
                left:${12 + Math.random() * 76}%;
                top:${8 + Math.random() * 48}%;
                animation-delay:${(i * 0.14 + Math.random() * 0.12).toFixed(2)}s;
            `;
            this.fireworksEl.appendChild(burst);
            for (let j = 0; j < 10; j++) {
                const spark = document.createElement('i');
                spark.style.setProperty('--angle', `${j * 36}deg`);
                spark.style.setProperty('--distance', `${34 + Math.random() * 34}px`);
                burst.appendChild(spark);
            }
        }
        setTimeout(() => { if (this.fireworksEl) this.fireworksEl.innerHTML = ''; }, 2600);
    }
}

class BeyondAnimator {
    constructor() {
        this.cards = document.querySelectorAll('#beyondGrid .beyond-card');
        this.section = document.getElementById('beyond');
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) this.revealCards();
            });
        }, { threshold: 0.2 });
        if (this.section) this.observer.observe(this.section);
    }
    revealCards() {
        this.cards.forEach((card, i) => {
            setTimeout(() => card.classList.add('revealed'), i * 180);
        });
        this.observer.disconnect();
    }
}

class EducationAnimator {
    constructor() {
        this.entries = document.querySelectorAll('#educationDisplay .edu-entry');
        this.section = document.getElementById('education');
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) this.revealEntries();
            });
        }, { threshold: 0.25 });
        if (this.section) this.observer.observe(this.section);
    }
    revealEntries() {
        this.entries.forEach((entry, i) => {
            setTimeout(() => entry.classList.add('revealed'), i * 400);
        });
        this.observer.disconnect();
    }
}

// LEARNING — Orbital auto-cycle
class LearningOrbit {
    constructor() {
        this.container = document.getElementById('learningSatellites');
        this.detail = document.getElementById('learningDetail');
        this.titleEl = document.getElementById('learningTitle');
        this.descEl = document.getElementById('learningDesc');
        this.section = document.getElementById('learning');
        this.books = [
            { icon: '🌐', title: 'JavaScript', shortTitle: 'JavaScript', desc: 'Variables, functions, DOM manipulation & event-driven programming.' },
            { icon: '🐍', title: 'Python for Data Science', shortTitle: 'Python DS', desc: 'NumPy, Pandas & Matplotlib for data analysis and visualization.' },
            { icon: '📡', title: 'IoT & Embedded Systems', shortTitle: 'IoT', desc: 'Sensor fundamentals, microcontroller basics & hardware interfacing.' },
            { icon: '🤖', title: 'AI & ML Fundamentals', shortTitle: 'AI & ML', desc: 'Supervised & unsupervised learning core concepts explored.' },
            { icon: '🎨', title: 'UI/UX Fundamentals', shortTitle: 'UI/UX', desc: 'Design principles, user research, wireframing & prototyping.' }
        ];
        this.activeIndex = 0;
        this.cycleInterval = null;
        this.init();
    }
    init() {
        this.renderSatellites();
        this.renderIndicator();
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) this.startCycle();
                else this.stopCycle();
            });
        }, { threshold: 0.3 });
        if (this.section) observer.observe(this.section);
    }
    renderIndicator() {
        const el = document.getElementById('learningIndicator');
        if (!el) return;
        el.innerHTML = this.books.map((_, i) => `<span class="learn-dot" data-i="${i}"></span>`).join('');
        this.dots = el.querySelectorAll('.learn-dot');
    }
    renderSatellites() {
        const radius = window.innerWidth <= 640
            ? Math.min(window.innerWidth * 0.24, 94)
            : Math.min(window.innerWidth * 0.28, 180);
        this.books.forEach((book, i) => {
            const angle = (360 / this.books.length) * i;
            const sat = document.createElement('div');
            sat.className = 'learning-satellite';
            sat.style.setProperty('--angle', angle + 'deg');
            sat.style.setProperty('--radius', radius + 'px');
            sat.style.transitionDelay = (i * 0.15) + 's';
            sat.innerHTML = `<div class="learning-satellite-inner"><span class="sat-icon">${book.icon}</span><span class="sat-title">${book.shortTitle || book.title}</span></div>`;
            sat.addEventListener('mouseenter', () => this.setActive(i));
            sat.addEventListener('click', () => this.setActive(i));
            this.container.appendChild(sat);
        });
        this.satellites = this.container.querySelectorAll('.learning-satellite');
        this.setActive(0);
    }
    setActive(index) {
        this.activeIndex = index;
        this.satellites.forEach((s, i) => s.classList.toggle('active', i === index));
        this.dots?.forEach((d, i) => d.classList.toggle('active', i === index));
        const book = this.books[index];
        this.titleEl.style.opacity = 0;
        this.descEl.style.opacity = 0;
        setTimeout(() => {
            this.titleEl.textContent = book.title;
            this.descEl.textContent = book.desc;
            this.titleEl.style.opacity = 1;
            this.descEl.style.opacity = 1;
        }, 200);
        this.detail?.classList.add('highlight');
    }
    startCycle() {
        if (this.cycleInterval) return;
        this.cycleInterval = setInterval(() => {
            this.setActive((this.activeIndex + 1) % this.books.length);
        }, 2500);
    }
    stopCycle() {
        clearInterval(this.cycleInterval);
        this.cycleInterval = null;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.activeCursor = new DivineCursor();
    new PortfolioApp();
    new GameNavigation();
});

window.initPortfolioExperience = function () {
    const runIdle = (fn, timeout = 1200) => {
        if ('requestIdleCallback' in window) window.requestIdleCallback(fn, { timeout });
        else setTimeout(fn, 16);
    };

    new HeroCanvas();
    new ScrollAnimator();

    const tasks = [
        () => new JourneyCinema(),
        () => { window.activeLabShowcase = new LabShowcase(); },
        () => new IdentityAnimator(),
        () => new ArsenalCinematic(),
        () => new WorkCinema(),
        () => new BeyondAnimator(),
        () => new EducationAnimator(),
        () => new LearningOrbit(),
        () => new ParticleSystem()
    ];

    const runNext = () => {
        const task = tasks.shift();
        if (!task) return;
        task();
        runIdle(runNext);
    };
    runIdle(runNext, 300);
};
