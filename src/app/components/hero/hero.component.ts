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

  typedRole = signal('');
  glitchText = signal('Nirmal TR');
  enableGlitch = false; // Set to true to enable the glitch shaking animation
  enableColorShift = false; // Set to true to enable the background hue shifting animation

  private renderer3d?: THREE.WebGLRenderer;
  private scene3d?: THREE.Scene;
  private camera3d?: THREE.PerspectiveCamera;
  private animationId?: number;

  constructor() {
    afterNextRender(() => {
      // 1. Antigravity Particles
      if (this.canvasRef()) {
        this.particleSvc.initAntigravity(this.canvasRef()!.nativeElement);
      }

      // 2. Three.js background
      this.initThreeJs();



      // 3. Typewriter effect
      this.typeSvc.type(
        ["Full Stack Developer", "Angular Expert", "UI/UX Enthusiast", "Problem Solver"],
        80, 40, this.typedRole
      );

      // 4. Glitch text effect
      this.typeSvc.glitch(this.glitchText, 'Nirmal TR');
      let cleanupMagnetic: () => void;
      if (this.ctaBtn()) {
        cleanupMagnetic = this.animSvc.magneticEffect(this.ctaBtn()!.nativeElement);
      }

      // 6. GSAP Entrance Timeline
      const tl = gsap.timeline();
      tl.from('.hero-name', { y: 60, opacity: 0, ease: "power4.out", duration: 0.8 })
        .from('.hero-role', { opacity: 0, duration: 0.4 }, "-=0.3")
        .from('.hero-desc', { y: 20, opacity: 0 }, "-=0.2")
        .from('.cta-btn', { scale: 0.8, opacity: 0, ease: "back.out(2)" }, "-=0.1");

      // Cleanup
      this.destroyRef.onDestroy(() => {
        this.particleSvc.destroy();
        if (cleanupMagnetic) cleanupMagnetic();
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.renderer3d) {
          this.renderer3d.dispose();
          this.renderer3d.forceContextLoss();
        }
      });
    });
  }

  private initThreeJs() {
    if (!this.threeRef()) return;
    const container = this.threeRef()!.nativeElement;

    this.scene3d = new THREE.Scene();
    this.camera3d = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera3d.position.z = 400;

    this.renderer3d = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer3d.setSize(window.innerWidth, window.innerHeight);
    this.renderer3d.setPixelRatio(window.devicePixelRatio);
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

    const material = new THREE.PointsMaterial({ color: 0x8b5cf6, size: 2 });
    const points = new THREE.Points(geometry, material);
    this.scene3d.add(points);

    // Add lines for constellation
    const lineMat = new THREE.LineBasicMaterial({ color: 0x00ffff, transparent: true, opacity: 0.15 });
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
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    this.scene3d.add(lines);

    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (event: MouseEvent) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.05;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.05;
    };
    document.addEventListener('mousemove', onMouseMove);
    
    this.destroyRef.onDestroy(() => {
      document.removeEventListener('mousemove', onMouseMove);
    });

    const animate = () => {
      this.animationId = requestAnimationFrame(animate);
      
      points.rotation.y += 0.0003;
      lines.rotation.y += 0.0003;
      
      this.camera3d!.position.x += (mouseX - this.camera3d!.position.x) * 0.05;
      this.camera3d!.position.y += (-mouseY - this.camera3d!.position.y) * 0.05;
      this.camera3d!.lookAt(this.scene3d!.position);
      
      this.renderer3d!.render(this.scene3d!, this.camera3d!);
    };
    animate();

    const onWindowResize = () => {
      this.camera3d!.aspect = window.innerWidth / window.innerHeight;
      this.camera3d!.updateProjectionMatrix();
      this.renderer3d!.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onWindowResize);
    this.destroyRef.onDestroy(() => {
      window.removeEventListener('resize', onWindowResize);
    });
  }

  scrollTo(sectionId: string): void {
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}
