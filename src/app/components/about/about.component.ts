import { Component, ElementRef, viewChild, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CountUpDirective } from 'ngx-countup';
import { AnimationService } from '../../services/animation.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule, CountUpDirective],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  private animSvc = inject(AnimationService);
  private destroyRef = inject(DestroyRef);

  containerRef = viewChild<ElementRef<HTMLElement>>('aboutContainer');
  narrativeRef = viewChild<ElementRef<HTMLElement>>('narrativeText');

  architectureNodes = signal([
    { name: 'Angular & TypeScript', icon: 'fab fa-angular', desc: 'Reactive Enterprise SPA & Modular UI' },
    { name: 'PHP (CI4) + Java (Spring Boot)', icon: 'fas fa-layer-group', desc: 'Dual-Backend Core CRM & Inspection Engine' },
    { name: 'Node.js & REST APIs', icon: 'fab fa-node-js', desc: 'Real-Time Services & Communication Pipelines' },
    { name: 'MySQL • MariaDB • MongoDB • Oracle', icon: 'fas fa-database', desc: 'Relational & NoSQL Optimized Data Stores' },
    { name: 'AWS S3 & Firebase FCM', icon: 'fab fa-aws', desc: 'Cloud Storage & Push Messaging Pipelines' }
  ]);

  constructor() {
    afterNextRender(() => {
      // 1. 3D Perspective Flip Entrance
      if (this.containerRef()) {
        this.animSvc.initScrollTrigger(this.containerRef()!.nativeElement, {
          rotateY: 90,
          transformPerspective: 1000,
          opacity: 0,
          duration: 1.2,
          ease: "expo.out"
        });
      }

      // 2. Word-by-Word Text Reveal
      if (this.narrativeRef()) {
        const words = this.animSvc.splitTextToWords(this.narrativeRef()!.nativeElement);
        gsap.from(words, {
          y: 30,
          opacity: 0,
          stagger: 0.04,
          scrollTrigger: {
            trigger: this.narrativeRef()!.nativeElement,
            start: "top 85%",
            once: true
          }
        });
      }

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach(t => {
          if (t.trigger === this.narrativeRef()?.nativeElement) t.kill();
        });
      });
    });
  }
}
