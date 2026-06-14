import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  mass: number;
  symbol: string;
  color: string;
  size: number;
  opacity: number;
  seed: number;
  life: number;
}

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
  private gravityTimeout?: any;

  initAntigravity(canvas: HTMLCanvasElement) {
    if (!isPlatformBrowser(this.platformId)) return;
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;

    this.resize();
    window.addEventListener('resize', this.resize.bind(this));
    
    this.canvas.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.canvas.addEventListener('click', this.onClick.bind(this));
    this.canvas.addEventListener('mouseleave', this.onMouseLeave.bind(this));

    this.initParticles();
    this.animate();
  }

  private resize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  private onMouseMove(e: MouseEvent) {
    if (this.canvas) {
      const rect = this.canvas.getBoundingClientRect();
      this.mx = e.clientX - rect.left;
      this.my = e.clientY - rect.top;
    }
  }

  private onMouseLeave() {
    this.mx = -1000;
    this.my = -1000;
  }

  private onClick() {
    this.triggerBurst(this.mx, this.my);
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

  private initParticles() {
    this.particles = [];
    const symbols = ['{', '}', '<', '>', '/', ';', '=', '[', ']', '0', '1', '#', '@', '!', '?'];
    const colors = ['#00FFFF', '#8B5CF6', '#a78bfa', 'rgba(255,255,255,0.8)'];
    
    for (let i = 0; i < 150; i++) {
      this.particles.push({
        x: Math.random() * (this.canvas?.width || 1000),
        y: Math.random() * (this.canvas?.height || 1000) + (this.canvas?.height || 1000),
        vx: 0,
        vy: 0,
        mass: 0.5 + Math.random() * 1.5,
        symbol: symbols[Math.floor(Math.random() * symbols.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 10 + Math.random() * 8,
        opacity: 0.4 + Math.random() * 0.5,
        seed: Math.random() * 1000,
        life: Math.random()
      });
    }
  }

  private animate = () => {
    if (!this.ctx || !this.canvas) return;
    
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalCompositeOperation = 'screen';
    
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
      
      this.ctx.font = `${p.size}px "Courier New"`;
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.opacity;
      this.ctx.fillText(p.symbol, p.x, p.y);
    }
    
    this.ctx.globalAlpha = 1;
    this.animationFrameId = requestAnimationFrame(this.animate);
  }

  destroy() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    if (this.gravityTimeout) {
      clearTimeout(this.gravityTimeout);
    }
    window.removeEventListener('resize', this.resize.bind(this));
    if (this.canvas) {
      this.canvas.removeEventListener('mousemove', this.onMouseMove.bind(this));
      this.canvas.removeEventListener('click', this.onClick.bind(this));
      this.canvas.removeEventListener('mouseleave', this.onMouseLeave.bind(this));
    }
  }
}
