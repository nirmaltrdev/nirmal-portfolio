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
    { name: 'Angular 15 & TypeScript', icon: 'fab fa-angular', desc: 'CRM Frontend Consuming JSON REST APIs' },
    { name: 'CodeIgniter 4 REST API (PHP)', icon: 'fab fa-php', desc: 'JSON Backend with JWT Authentication & RBAC' },
    { name: 'MySQL', icon: 'fas fa-database', desc: 'Two Production Environments & a Shared Common Database' },
    { name: 'AWS EC2 & AWS S3', icon: 'fab fa-aws', desc: 'Linux, Apache & Cron on EC2; Media & PDF Storage on S3' },
    { name: 'External Integrations', icon: 'fas fa-plug', desc: 'WhatsApp Cloud API • Firebase • OpenAI • Yeastar PBX' }
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
