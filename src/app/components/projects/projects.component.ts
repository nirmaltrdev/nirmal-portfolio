import { Component, ElementRef, viewChild, viewChildren, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  private animSvc = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private portfolioData = inject(PortfolioDataService);

  containerRef = viewChild<ElementRef<HTMLElement>>('projectsContainer');
  projectCards = viewChildren<ElementRef<HTMLElement>>('projectCard');

  projects = signal(this.portfolioData.projects);

  constructor() {
    afterNextRender(() => {
      if (this.containerRef() && this.projectCards().length > 0) {
        const cards = this.projectCards().map(el => el.nativeElement);
        
        cards.forEach((card, i) => {
          gsap.from(card, {
            y: 100,
            opacity: 0,
            rotationY: i % 2 === 0 ? 15 : -15,
            duration: 1.2,
            ease: 'expo.out',
            scrollTrigger: {
              trigger: card,
              start: 'top 85%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      }

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach(t => {
          if (t.vars.trigger && this.projectCards().map(el => el.nativeElement).includes(t.vars.trigger as HTMLElement)) {
            t.kill();
          }
        });
      });
    });
  }
}
