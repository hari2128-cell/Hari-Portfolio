// ═══════════════════════════════════════════════
//   ENGINEER'S ODYSSEY — CINEMATIC ENGINE v2
// ═══════════════════════════════════════════════

class DivineCursor {
    constructor() {
        this.dot = document.getElementById('cursor-dot');
        this.ring = document.getElementById('cursor-ring');
        this.rune = document.getElementById('cursor-rune');
        this.trailCanvas = document.getElementById('cursor-trail');
        this.trailCtx = this.trailCanvas.getContext('2d');
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;
        this.ringX = this.mouseX;
        this.ringY = this.mouseY;
        this.isHovering = false;
        this.trail = [];
        this.maxTrail = 6;
        this.init();
    }
    init() {
        const els = [this.dot, this.ring, this.trailCanvas, this.rune];
        if (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0) {
            els.forEach(el => el && (el.style.display = 'none'));
            document.body.style.cursor = 'auto';
            return;
        }
        this.resizeTrail();
        document.addEventListener('mousemove', (e) => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
        });
        document.addEventListener('mousedown', () => this.dot?.classList.add('clicking'));
        document.addEventListener('mouseup', () => this.dot?.classList.remove('clicking'));
        window.addEventListener('resize', () => this.resizeTrail());
        const hoverTargets = 'a, button, .arsenal-chest, .lab-rail-item, .learning-satellite, .work-cinema-card, .beyond-card, .edu-entry, .detail-item, .epi-link, .hud-dot, .hero-cta, .road-box';
        document.addEventListener('mouseover', (e) => {
            if (e.target.closest(hoverTargets)) {
                this.isHovering = true;
                this.ring?.classList.add('hovering');
                this.rune?.classList.add('visible');
            }
        });
        document.addEventListener('mouseout', (e) => {
            if (!e.target.closest(hoverTargets)) {
                this.isHovering = false;
                this.ring?.classList.remove('hovering');
                this.rune?.classList.remove('visible');
            }
        });
        this.animate();
    }
    resizeTrail() {
        this.trailCanvas.width = window.innerWidth;
        this.trailCanvas.height = window.innerHeight;
    }
    animate() {
        this.ringX += (this.mouseX - this.ringX) * 0.08;
        this.ringY += (this.mouseY - this.ringY) * 0.08;
        const x = this.mouseX, y = this.mouseY;
        if (this.dot) this.dot.style.transform = `translate3d(${x - 3}px, ${y - 3}px, 0)`;
        if (this.ring) this.ring.style.transform = `translate3d(${this.ringX - 18}px, ${this.ringY - 18}px, 0)`;
        if (this.rune && this.isHovering) {
            this.rune.style.transform = `translate3d(${this.ringX}px, ${this.ringY - 28}px, 0) translate(-50%, -50%)`;
        }
        requestAnimationFrame(() => this.animate());
    }
}

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: -1000, y: -1000 };
        this.particleCount = 60;
        this.init();
    }
    init() {
        this.resize();
        this.createParticles();
        window.addEventListener('resize', () => this.resize());
        document.addEventListener('mousemove', (e) => { this.mouse.x = e.clientX; this.mouse.y = e.clientY; });
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
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        const time = Date.now() * 0.001;
        this.particles.forEach((p, i) => {
            const dx = p.x - this.mouse.x, dy = p.y - this.mouse.y, dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 200) {
                const force = (200 - dist) / 200;
                const angle = Math.atan2(dy, dx);
                p.vx += Math.cos(angle) * force * 0.05;
                p.vy += Math.sin(angle) * force * 0.05;
            }
            p.vx *= 0.99; p.vy *= 0.99;
            p.x += p.vx; p.y += p.vy;
            if (p.x < -50) p.x = this.canvas.width + 50;
            if (p.x > this.canvas.width + 50) p.x = -50;
            if (p.y < -50) p.y = this.canvas.height + 50;
            if (p.y > this.canvas.height + 50) p.y = -50;
            const pulse = Math.sin(time * p.pulseSpeed * 100 + p.pulseOffset) * 0.5 + 0.5;
            p.size = p.baseSize + pulse * 1.5;
            const alpha = p.opacity * (0.5 + pulse * 0.5);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color + alpha + ')';
            this.ctx.fill();
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const cdx = p.x - p2.x, cdy = p.y - p2.y, cdist = Math.sqrt(cdx * cdx + cdy * cdy);
                if (cdist < 160) {
                    const la = (1 - cdist / 160) * 0.1;
                    this.ctx.beginPath();
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.strokeStyle = `rgba(196, 164, 90, ${la})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.stroke();
                }
            }
        });
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
        let progress = 0;
        const interval = setInterval(() => {
            progress += 2;
            if (progress >= 100) {
                progress = 100;
                clearInterval(interval);
                this.completeLoading();
            }
            this.loadingBar.style.width = progress + '%';
            this.loadingPercent.textContent = Math.floor(progress) + '%';
        }, 40);
    }
    completeLoading() {
        setTimeout(() => {
            this.loadingScreen.classList.add('hidden');
            this.mainContainer.classList.add('ready');
            document.body.classList.add('cinematic-mode');
            setTimeout(() => document.body.classList.remove('cinematic-mode'), 2000);
        }, 400);
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
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
        }, { threshold: 0.08, rootMargin: '0px 0px -50px 0px' });
        this.sections.forEach(s => this.observer.observe(s));
        document.addEventListener('mousemove', (e) => this.handleHeroParallax(e));
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
                el.textContent = isDecimal ? current.toFixed(1) : Math.floor(current) + (target > 9 ? '+' : '');
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
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) this.autoDeploy();
            });
        }, { threshold: 0.2 });
        if (this.section) observer.observe(this.section);
        // Still allow click for re-flip interaction
        this.chests.forEach(chest => {
            chest.addEventListener('click', () => {
                if (!chest.classList.contains('opened')) this.openChest(chest);
                else chest.classList.remove('opened');
            });
        });
    }
    autoDeploy() {
        this.chests.forEach((chest, i) => {
            const delay = parseInt(chest.dataset.delay) || i * 150;
            setTimeout(() => {
                if (!this.deployed.has(i)) {
                    chest.classList.add('deploying');
                    setTimeout(() => this.openChest(chest), 600);
                    this.deployed.add(i);
                }
            }, delay);
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
        }, { threshold: 0.2 });
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
        let progress = 0;
        this.progressFill.style.width = '0%';
        const step = 100 / (this.cycleDuration / 50);
        this.progressTimer = setInterval(() => {
            progress += step;
            this.progressFill.style.width = Math.min(progress, 100) + '%';
            if (progress >= 100) clearInterval(this.progressTimer);
        }, 50);
    }
}

// ═══════════════════════════════════════════════
// JOURNEY — Cinematic roadmap with curvy dashed road
// ═══════════════════════════════════════════════
class JourneyRoadmap {
    constructor() {
        this.container = document.getElementById('journeyFuture');
        this.timeline = document.getElementById('journeyTimeline');
        this.finishLine = document.getElementById('journeyFinishLine');
        this.svg = document.getElementById('journeyRoadSvg');
        this.pathBg = document.getElementById('journeyRoadBg');
        this.pathDraw = document.getElementById('journeyRoadDraw');
        this.section = document.getElementById('journey');
        this.milestones = [
            { event: 'Smart India Hackathon', year: '2025', result: 'Round 2 Qualifier', context: "My FIRST hackathon — India's largest student innovation competition" },
            { event: 'Mumbai Hackathon', year: '2025', result: 'Finalist', context: 'Competed among top national teams in Mumbai' },
            { event: 'Pragyan Hackathon', year: '2026', result: 'Participant', context: "NIT Trichy's premier hackathon experience" },
            { event: 'RIFT Hackathon', year: '2026', result: 'Participant', context: 'Pushed boundaries in rapid innovation' },
            { event: 'NSS Best Volunteer Award', year: '2026', result: 'Recognition', context: 'Honored for outstanding community service contributions' },
            { event: 'Schneider Electric Challenge', year: '2026', result: 'Participant', context: 'Industry-level engineering problem solving' },
            { event: 'Mechovate', year: '2026', result: 'Participant', context: 'Mechanical & electronics innovation showcase' },
            { event: 'KI Hacks', year: '2026', result: 'Participant', context: 'Creative problem-solving marathon' },
            { event: 'SDG Hackathon', year: '2026', result: 'Finalist', context: 'Sustainable Development Goals focused innovation' },
            { event: 'Tenkasi Hackathon', year: '2026', result: 'Runner Up', context: 'Secured podium finish among fierce competition' },
            { event: 'CreateX Hackathon', year: '2026', result: 'Special Mention', context: 'Recognized among national-level teams for innovation' },
            { event: 'StartupTN Hackathons', year: '2025-2026', result: 'Multiple Editions', context: 'Consistent participation across StartupTN initiatives' }
        ];
        this.pathLength = 0;
        this.nodeLengths = [];
        this.animationStarted = false;
        this.playTriggered = false;
        this.init();
    }

    init() {
        this.renderTimeline();

        // Build road after layout (double rAF ensures the DOM is painted)
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.buildRoad();
            });
        });

        // Rebuild on resize
        window.addEventListener('resize', () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    this.buildRoad();
                });
            });
        });

        // IntersectionObserver as primary trigger
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(e => {
                if (e.isIntersecting) this.playJourney();
            });
        }, { threshold: 0.15 });
        if (this.section) observer.observe(this.section);

        // Fallback scroll listener in case the observer misses
        const scrollFallback = () => {
            if (!this.section || this.playTriggered) return;
            const rect = this.section.getBoundingClientRect();
            const windowH = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top < windowH && rect.bottom > 0) {
                this.playJourney();
            }
        };
        window.addEventListener('scroll', scrollFallback, { passive: true });
        scrollFallback(); // check immediately (e.g., if page loaded already scrolled)
    }

    renderTimeline() {
        this.timeline.innerHTML = '';
        this.milestones.forEach((m, i) => {
            const side = i % 2 === 0 ? 'left' : 'right';
            const stop = document.createElement('div');
            stop.className = `road-stop road-stop-${side}`;
            stop.dataset.index = i;
            stop.innerHTML = `
                <div class="road-box">
                    <div class="road-box-header">
                        <span class="road-mile">M${String(i + 1).padStart(2, '0')}</span>
                        <span class="ms-year">${m.year}</span>
                    </div>
                    <div class="ms-event">${m.event}</div>
                    <div class="ms-result">${m.result}</div>
                    <p class="ms-context">${m.context}</p>
                </div>
                <div class="road-node"><div class="road-node-pulse"></div></div>`;
            this.timeline.appendChild(stop);
        });
    }

    getNodeCenter(node) {
        const cr = this.container.getBoundingClientRect();
        const nr = node.getBoundingClientRect();
        return {
            x: nr.left - cr.left + nr.width / 2,
            y: nr.top - cr.top + nr.height / 2
        };
    }

    buildRoad() {
        const stops = this.timeline.querySelectorAll('.road-stop');
        if (!stops.length || !this.svg) return;

        const timelineHeight = this.timeline.offsetHeight;
        const containerWidth = this.container.offsetWidth;
        const h = timelineHeight + 80;

        this.container.style.minHeight = h + 'px';

        // 🔑 THE CRITICAL FIX: give the SVG a viewBox that matches the actual pixel size
        // Without this, the default 300x150 viewBox makes the path invisible.
        this.svg.setAttribute('viewBox', `0 0 ${containerWidth} ${h}`);
        this.svg.setAttribute('width', containerWidth);
        this.svg.setAttribute('height', h);
        this.svg.style.width = '100%';
        this.svg.style.height = h + 'px';

        const points = [...stops].map(s => this.getNodeCenter(s.querySelector('.road-node')));
        if (points.length < 2) return;

        let d = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const midY = (prev.y + curr.y) / 2;
            const bulge = (i % 2 === 0 ? -1 : 1) * 160;
            const cp1x = prev.x + bulge * 0.5;
            const cp1y = prev.y + (midY - prev.y) * 0.6;
            const cp2x = curr.x - bulge * 0.5;
            const cp2y = curr.y - (curr.y - midY) * 0.6;
            d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${curr.x} ${curr.y}`;
        }

        this.pathBg.setAttribute('d', d);
        this.pathDraw.setAttribute('d', d);

        this.pathLength = this.pathDraw.getTotalLength();
        this.pathDraw.style.strokeDasharray = `${this.pathLength} ${this.pathLength}`;
        this.pathDraw.style.strokeDashoffset = this.pathLength;

        this.nodeLengths = points.map(p => this.findLengthAtPoint(p));
    }

    findLengthAtPoint(target) {
        let best = 0;
        let bestDist = Infinity;
        for (let l = 0; l <= this.pathLength; l += 4) {
            const p = this.pathDraw.getPointAtLength(l);
            const dist = Math.hypot(p.x - target.x, p.y - target.y);
            if (dist < bestDist) {
                bestDist = dist;
                best = l;
            }
        }
        return best;
    }

    delay(ms) {
        return new Promise(r => setTimeout(r, ms));
    }

    async playJourney() {
        if (this.animationStarted) return;
        this.animationStarted = true;
        this.playTriggered = true;
        try {
            // Recalculate road in case layout shifted
            this.buildRoad();
            const stops = [...this.timeline.querySelectorAll('.road-stop')];
            if (!stops.length) return;

            await this.delay(300);
            stops[0].classList.add('visible');
            await this.delay(700);

            for (let i = 0; i < stops.length - 1; i++) {
                await this.animateRoadTo(this.nodeLengths[i + 1], 1400);
                stops[i + 1].classList.add('visible');
                await this.delay(500);
            }

            this.finishLine?.classList.add('visible');
        } catch (e) {
            console.warn('Journey animation error – revealing all milestones as fallback:', e);
            // Failsafe: show everything if the animation fails
            const stops = this.timeline.querySelectorAll('.road-stop');
            stops.forEach(s => s.classList.add('visible'));
            this.finishLine?.classList.add('visible');
        }
    }

    animateRoadTo(targetLength, duration) {
        const startLength = this.pathLength - parseFloat(this.pathDraw.style.strokeDashoffset || this.pathLength);
        return new Promise(resolve => {
            const start = performance.now();
            const tick = now => {
                const t = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - t, 4);
                const current = startLength + (targetLength - startLength) * eased;
                this.pathDraw.style.strokeDashoffset = this.pathLength - current;
                if (t < 1) {
                    requestAnimationFrame(tick);
                } else {
                    resolve();
                }
            };
            requestAnimationFrame(tick);
        });
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
        const radius = Math.min(window.innerWidth * 0.28, 180);
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
    new DivineCursor();
    new ParticleSystem();
    new HeroCanvas();
    new PortfolioApp();
    new GameNavigation();
    new ScrollAnimator();
    new IdentityAnimator();
    new ArsenalCinematic();
    new WorkCinema();
    new LabShowcase();
    new JourneyRoadmap();
    new BeyondAnimator();
    new EducationAnimator();
    new LearningOrbit();
    console.log("⚡ ENGINEER'S ODYSSEY — CINEMATIC EDITION ONLINE ⚡");
});
