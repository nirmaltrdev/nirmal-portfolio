import { Component, ElementRef, viewChild, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ParticleService } from '../../services/particle.service';
import { AnimationService } from '../../services/animation.service';
import { TypewriterService } from '../../services/typewriter.service';
import * as THREE from 'three';
import { gsap } from 'gsap';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {
  private particleSvc = inject(ParticleService);
  private animSvc = inject(AnimationService);
  private typeSvc = inject(TypewriterService);
  private destroyRef = inject(DestroyRef);

  canvasRef = viewChild<ElementRef<HTMLCanvasElement>>('particleCanvas');
  threeRef = viewChild<ElementRef<HTMLElement>>('threeContainer');
  ctaBtn = viewChild<ElementRef<HTMLElement>>('ctaBtn');
  sectionRef = viewChild<ElementRef<HTMLElement>>('heroSection');

  readonly name = 'Nirmal T R';
  typedRole = signal('');
  glitchText = signal(this.name);
  enableGlitch = false; // Set to true to enable the glitch shaking animation
  enableColorShift = false; // Set to true to enable the background hue shifting animation

  private renderer3d?: THREE.WebGLRenderer;
  private scene3d?: THREE.Scene;
  private camera3d?: THREE.PerspectiveCamera;
  private pointsMaterial?: THREE.PointsMaterial;
  private lineMaterial?: THREE.LineBasicMaterial;
  private animationId?: number;
  private threeRunning = false;
  private reduceMotion = false;

  constructor() {
    afterNextRender(() => {
      this.reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      // 1. Antigravity particles (a single still frame when reduced motion is on)
      if (this.canvasRef()) {
        this.particleSvc.initAntigravity(this.canvasRef()!.nativeElement, this.reduceMotion);
      }

      // 2. Three.js background (rendered once when reduced motion is on)
      this.initThreeJs();

      // 3. Typewriter effect (whole roles swap instead of typing when reduced motion is on)
      const stopTyping = this.typeSvc.type(
        [
          "PHP Application Developer",
          "Full Stack Software Engineer",
          "CodeIgniter 4 & REST API Developer",
          "Enterprise CRM Developer"
        ],
        80, 40, this.typedRole, this.reduceMotion
      );

      // 4. Glitch text effect (decorative flicker: off for reduced motion)
      const stopGlitch = this.reduceMotion ? () => {} : this.typeSvc.glitch(this.glitchText, this.name);

      let cleanupMagnetic: (() => void) | undefined;
      if (this.ctaBtn() && !this.reduceMotion) {
        cleanupMagnetic = this.animSvc.magneticEffect(this.ctaBtn()!.nativeElement);
      }

      // 5. Theme switches: recolour the particles and the 3D constellation instantly
      const themeObserver = new MutationObserver(() => {
        this.particleSvc.refreshTheme();
        this.applyThreeTheme();
      });
      themeObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });

      // 6. Only animate the canvases while the hero is on screen (saves CPU/GPU/battery)
      let visibilityObserver: IntersectionObserver | undefined;
      const section = this.sectionRef()?.nativeElement;
      if (section && !this.reduceMotion && 'IntersectionObserver' in window) {
        visibilityObserver = new IntersectionObserver(([entry]) => {
          this.particleSvc.setActive(entry.isIntersecting);
          if (entry.isIntersecting) this.startThree();
          else this.stopThree();
        });
        visibilityObserver.observe(section);
      }

      // 7. GSAP Entrance Timeline
      if (!this.reduceMotion) {
        const tl = gsap.timeline();
        tl.from('.hero-name', { y: 60, opacity: 0, ease: "power4.out", duration: 0.8 })
          .from('.hero-role', { opacity: 0, duration: 0.4 }, "-=0.3")
          .from('.hero-desc', { y: 20, opacity: 0 }, "-=0.2")
          .from('.cta-btn', { scale: 0.8, opacity: 0, ease: "back.out(2)" }, "-=0.1");
      }

      // Cleanup
      this.destroyRef.onDestroy(() => {
        stopTyping();
        stopGlitch();
        themeObserver.disconnect();
        visibilityObserver?.disconnect();
        this.particleSvc.destroy();
        if (cleanupMagnetic) cleanupMagnetic();
        this.stopThree();
        if (this.renderer3d) {
          this.renderer3d.dispose();
          this.renderer3d.forceContextLoss();
        }
      });
    });
  }

  /** Theme colours for the constellation, from CSS custom properties in styles.css. */
  private readThreeTheme() {
    const cs = getComputedStyle(document.body);
    const points = cs.getPropertyValue('--hero-points').trim() || '#8b5cf6';
    const lines = cs.getPropertyValue('--hero-lines').trim() || '#00ffff';
    const opacity = parseFloat(cs.getPropertyValue('--hero-line-opacity')) || 0.15;
    return { points, lines, opacity };
  }

  private applyThreeTheme() {
    if (!this.pointsMaterial || !this.lineMaterial) return;
    const theme = this.readThreeTheme();
    this.pointsMaterial.color.set(theme.points);
    this.lineMaterial.color.set(theme.lines);
    this.lineMaterial.opacity = theme.opacity;
    if (!this.threeRunning) this.renderThreeOnce();
  }

  private renderThreeOnce() {
    if (this.renderer3d && this.scene3d && this.camera3d) {
      this.renderer3d.render(this.scene3d, this.camera3d);
    }
  }

  private startThree() {
    if (this.threeRunning || this.reduceMotion || !this.renderer3d) return;
    this.threeRunning = true;
    this.animationId = requestAnimationFrame(this.animateThree);
  }

  private stopThree() {
    this.threeRunning = false;
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;
  }

  private points3d?: THREE.Points;
  private lines3d?: THREE.LineSegments;
  private mouseX = 0;
  private mouseY = 0;

  private animateThree = () => {
    if (!this.threeRunning) return;
    this.animationId = requestAnimationFrame(this.animateThree);

    this.points3d!.rotation.y += 0.0003;
    this.lines3d!.rotation.y += 0.0003;

    this.camera3d!.position.x += (this.mouseX - this.camera3d!.position.x) * 0.05;
    this.camera3d!.position.y += (-this.mouseY - this.camera3d!.position.y) * 0.05;
    this.camera3d!.lookAt(this.scene3d!.position);

    this.renderer3d!.render(this.scene3d!, this.camera3d!);
  };

  private initThreeJs() {
    if (!this.threeRef()) return;
    const container = this.threeRef()!.nativeElement;

    this.scene3d = new THREE.Scene();
    this.camera3d = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera3d.position.z = 400;

    try {
      this.renderer3d = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      // WebGL unavailable (old device / disabled): the hero still works without the 3D layer
      this.renderer3d = undefined;
      return;
    }
    this.renderer3d.setSize(window.innerWidth, window.innerHeight);
    this.renderer3d.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(this.renderer3d.domElement);

    const geometry = new THREE.BufferGeometry();
    const vertices = [];
    for (let i = 0; i < 500; i++) {
      const x = THREE.MathUtils.randFloatSpread(800);
      const y = THREE.MathUtils.randFloatSpread(800);
      const z = THREE.MathUtils.randFloatSpread(800);
      vertices.push(x, y, z);
    }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    const theme = this.readThreeTheme();
    this.pointsMaterial = new THREE.PointsMaterial({ color: theme.points, size: 2 });
    this.points3d = new THREE.Points(geometry, this.pointsMaterial);
    this.scene3d.add(this.points3d);

    // Add lines for constellation
    this.lineMaterial = new THREE.LineBasicMaterial({ color: theme.lines, transparent: true, opacity: theme.opacity });
    const lineGeo = new THREE.BufferGeometry();
    const linePos = [];
    const positions = geometry.attributes['position'].array;
    for (let i = 0; i < 500; i++) {
      for (let j = i + 1; j < 500; j++) {
        const dx = positions[i * 3] - positions[j * 3];
        const dy = positions[i * 3 + 1] - positions[j * 3 + 1];
        const dz = positions[i * 3 + 2] - positions[j * 3 + 2];
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
        if (dist < 80) {
          linePos.push(
            positions[i * 3], positions[i * 3 + 1], positions[i * 3 + 2],
            positions[j * 3], positions[j * 3 + 1], positions[j * 3 + 2]
          );
        }
      }
    }
    lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
    this.lines3d = new THREE.LineSegments(lineGeo, this.lineMaterial);
    this.scene3d.add(this.lines3d);

    const onMouseMove = (event: MouseEvent) => {
      this.mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
      this.mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
    };
    if (!this.reduceMotion) document.addEventListener('mousemove', onMouseMove);

    const onWindowResize = () => {
      this.camera3d!.aspect = window.innerWidth / window.innerHeight;
      this.camera3d!.updateProjectionMatrix();
      this.renderer3d!.setSize(window.innerWidth, window.innerHeight);
      if (!this.threeRunning) this.renderThreeOnce();
    };
    window.addEventListener('resize', onWindowResize);

    this.destroyRef.onDestroy(() => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onWindowResize);
    });

    if (this.reduceMotion) {
      this.renderThreeOnce(); // one still frame
    } else {
      this.startThree();
    }
  }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }
}
