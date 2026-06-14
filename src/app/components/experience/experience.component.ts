import { Component, ElementRef, viewChild, viewChildren, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnimationService } from '../../services/animation.service';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent {
  private animSvc = inject(AnimationService);
  private destroyRef = inject(DestroyRef);
  private portfolioData = inject(PortfolioDataService);

  containerRef = viewChild<ElementRef<HTMLElement>>('expContainer');
  timelineItems = viewChildren<ElementRef<HTMLElement>>('timelineItem');

  experiences = signal(this.portfolioData.experiences.map(exp => {
    let tech: string[] = [];
    if (exp.company.includes('LOGICINFEEL')) {
      tech = ['Angular', 'Spring Boot', 'CodeIgniter 4', 'MySQL', 'MongoDB', 'Socket.IO', 'Firebase', 'AWS'];
    } else if (exp.company.includes('Bitbridge')) {
      tech = ['Angular', 'TypeScript', 'REST APIs', 'Auth Systems'];
    }
    return {
      role: exp.role,
      company: exp.company,
      period: exp.duration,
      descriptionPoints: exp.description,
      tech
    };
  }));

  constructor() {
    afterNextRender(() => {
      if (this.containerRef() && this.timelineItems().length > 0) {
        const items = this.timelineItems().map(el => el.nativeElement);
        
        // Timeline line reveal
        gsap.from('.timeline-line', {
          scaleY: 0,
          transformOrigin: 'top',
          ease: 'power3.inOut',
          scrollTrigger: {
            trigger: this.containerRef()!.nativeElement,
            start: 'top center',
            end: 'bottom center',
            scrub: 1
          }
        });

        // Staggered item reveal
        items.forEach((item, i) => {
          gsap.from(item, {
            x: i % 2 === 0 ? -50 : 50,
            opacity: 0,
            duration: 1,
            ease: 'back.out(1.7)',
            scrollTrigger: {
              trigger: item,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          });
        });
      }

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach(t => {
          if (t.vars.trigger === this.containerRef()?.nativeElement || 
              this.timelineItems().map(el => el.nativeElement).includes(t.vars.trigger as HTMLElement)) {
            t.kill();
          }
        });
      });
    });
  }
}
