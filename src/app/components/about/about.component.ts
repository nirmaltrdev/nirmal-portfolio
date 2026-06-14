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
    { name: 'Angular', icon: 'fab fa-angular', desc: 'Frontend Architecture' },
    { name: 'Node.js', icon: 'fab fa-node-js', desc: 'Backend Services' },
    { name: 'Database', icon: 'fas fa-database', desc: 'Data Storage' },
    { name: 'Cloud', icon: 'fab fa-aws', desc: 'Deployment' }
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
