import { Component, ElementRef, viewChild, viewChildren, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PortfolioDataService } from '../../services/portfolio-data.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-education',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {
  private destroyRef = inject(DestroyRef);
  private portfolioData = inject(PortfolioDataService);

  containerRef = viewChild<ElementRef<HTMLElement>>('eduContainer');
  eduCards = viewChildren<ElementRef<HTMLElement>>('eduCard');

  education = signal(this.portfolioData.education);
  certifications = signal(this.portfolioData.certifications);
  publications = signal(this.portfolioData.publications);

  constructor() {
    afterNextRender(() => {
      if (this.containerRef() && this.eduCards().length > 0) {
        const cards = this.eduCards().map(el => el.nativeElement);
        
        gsap.from(cards, {
          y: 50,
          opacity: 0,
          stagger: 0.2,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: this.containerRef()!.nativeElement,
            start: 'top 80%'
          }
        });
      }

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach(t => {
          if (t.vars.trigger === this.containerRef()?.nativeElement) t.kill();
        });
      });
    });
  }
}
