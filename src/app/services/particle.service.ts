import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  symbol: string;
  colorIndex: number;
  size: number;
  opacity: number;
  seed: number;
  life: number;
}

/** CSS custom properties (styles.css) that hold the theme-aware particle palette. */
const PALETTE_VARS = ['--particle-1', '--particle-2', '--particle-3', '--particle-4'];

@Injectable({ providedIn: 'root' })
export class ParticleService {
  private platformId = inject(PLATFORM_ID);
  private canvas?: HTMLCanvasElement;
  private ctx?: CanvasRenderingContext2D | null;
  private particles: Particle[] = [];
  private animationFrameId?: number;
  private mx = -1000;
  private my = -1000;
  private gravityReversed = false;
  private gravityTimeout?: ReturnType<typeof setTimeout>;
  private palette: string[] = ['#00ffff', '#8b5cf6', '#a78bfa', 'rgba(255,255,255,0.8)'];
  private blend: GlobalCompositeOperation = 'screen';
  private staticMode = false;
  private running = false;

  // Bound once so removeEventListener actually removes them
  private readonly onResize = () => {
    this.resize();
    if (this.staticMode) this.drawStaticFrame();
  };
  private readonly onMouseMove = (e: MouseEvent) => {
    if (!this.canvas) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mx = e.clientX - rect.left;
    this.my = e.clientY - rect.top;
  };
  private readonly onMouseLeave = () => {
    this.mx = -1000;
    this.my = -1000;
  };
  private readonly onClick = () => this.triggerBurst(this.mx, this.my);

  /**
   * @param staticFrame draw one still frame and never animate (prefers-reduced-motion)
   */
  initAntigravity(canvas: HTMLCanvasElement, staticFrame = false) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.staticMode = staticFrame;

    this.readTheme();
    this.resize();
    window.addEventListener('resize', this.onResize);

    if (staticFrame) {
      this.initParticles(true);
      this.drawStaticFrame();
      return;
    }

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);

    this.initParticles(false);
    this.start();
  }

  /** Re-read the palette after a theme switch (redraws immediately when static). */
  refreshTheme() {
    this.readTheme();
    if (this.staticMode) this.drawStaticFrame();
  }

  /** Pause/resume the loop, e.g. while the hero is scrolled out of view. */
  setActive(active: boolean) {
    if (this.staticMode) return;
    if (active) this.start();
    else this.stop();
  }

  triggerBurst(x: number, y: number) {
    this.gravityReversed = true;
    if (this.gravityTimeout) clearTimeout(this.gravityTimeout);
    this.gravityTimeout = setTimeout(() => {
      this.gravityReversed = false;
    }, 700);

    for (const p of this.particles) {
      const dist = Math.hypot(p.x - x, p.y - y);
      if (dist < 220) {
        p.vy -= ((220 - dist) / 220) * 10;
        p.vx += (Math.random() - 0.5) * 10;
      }
    }
  }

  destroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    this.stop();
    if (this.gravityTimeout) clearTimeout(this.gravityTimeout);
    window.removeEventListener('resize', this.onResize);
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.onMouseMove);
      this.canvas.removeEventListener('click', this.onClick);
      this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
    }
  }

  private start() {
    if (this.running) return;
    this.running = true;
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  private stop() {
    this.running = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.animationFrameId = undefined;
  }

  private readTheme() {
    const cs = getComputedStyle(document.body);
    const colors = PALETTE_VARS.map(v => cs.getPropertyValue(v).trim()).filter(Boolean);
    if (colors.length === PALETTE_VARS.length) this.palette = colors;
    const blend = cs.getPropertyValue('--particle-blend').trim();
    this.blend = (blend || 'screen') as GlobalCompositeOperation;
  }

  private resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  /**
   * @param onScreen place particles inside the canvas (static frame) instead of below it,
   *                 where the animated version lets them float up into view.
   */
  private initParticles(onScreen: boolean) {
    this.particles = [];
    const symbols = ['{', '}', '<', '>', '/', ';', '=', '[', ']', '0', '1', '#', '@', '!', '?'];
    const w = this.canvas?.width || 1000;
    const h = this.canvas?.height || 1000;

    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * w,
        y: onScreen ? Math.random() * h : Math.random() * h + h,
        vx: 0,
        vy: 0,
        mass: 0.5 + Math.random() * 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        colorIndex: Math.floor(Math.random() * 4),
        size: 10 + Math.random() * 8,
        opacity: 0.4 + Math.random() * 0.5,
        seed: Math.random() * 1000,
        life: Math.random()
      });
    }
  }

  private drawParticles() {
    if (!this.ctx || !this.canvas) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = this.blend;
    for (const p of this.particles) {
      this.ctx.font = `${p.size}px "Courier New"`;
      this.ctx.fillStyle = this.palette[p.colorIndex % this.palette.length];
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillText(p.symbol, p.x, p.y);
    }
    this.ctx.globalAlpha = 1;
  }

  private drawStaticFrame() {
    if (this.canvas && this.particles.length) {
      // keep the still frame inside the (possibly resized) canvas
      for (const p of this.particles) {
        p.x = p.x % this.canvas.width;
        p.y = p.y % this.canvas.height;
      }
    }
    this.drawParticles();
  }

  private animate = () => {
    if (!this.ctx || !this.canvas || !this.running) return;

    const time = performance.now() * 0.001;

    for (const p of this.particles) {
      const lift = 0.04 / p.mass;
      const drag = 0.982;
      const wobble = Math.sin(time * 20 + p.seed) * 0.35;

      p.vx += wobble;
      p.vy += lift - (this.gravityReversed ? -0.05 : 0.012);

      // mouse repel
      if (this.mx !== -1000) {
        const dist = Math.hypot(this.mx - p.x, this.my - p.y);
        if (dist < 130) {
          const angle = Math.atan2(p.y - this.my, p.x - this.mx);
          const force = ((130 - dist) / 130) * 4.0;
          p.vx += Math.cos(angle) * force;
          p.vy += Math.sin(angle) * force;
        }
      }

      p.vx *= drag;
      p.vy *= drag;
      p.x += p.vx;
      p.y += p.vy;

      if (p.y < -30) {
        p.y = this.canvas.height + 30;
        p.x = Math.random() * this.canvas.width;
        p.vx = 0;
        p.vy = 0;
      }
    }

    this.drawParticles();
    this.animationFrameId = requestAnimationFrame(this.animate);
  };
}
