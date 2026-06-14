import { Component, ElementRef, viewChild, viewChildren, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import confetti from 'canvas-confetti';
import { PortfolioDataService } from '../../services/portfolio-data.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent {
  private destroyRef = inject(DestroyRef);
  private portfolioData = inject(PortfolioDataService);

  containerRef = viewChild<ElementRef<HTMLElement>>('skillsContainer');
  skillCards = viewChildren<ElementRef<HTMLElement>>('skillCard');

  skillGroups = signal(this.portfolioData.skills);

  constructor() {
    afterNextRender(() => {
      if (this.containerRef() && this.skillCards().length > 0) {
        const cards = this.skillCards().map(el => el.nativeElement);
        
        gsap.from(cards, {
          y: 60,
          opacity: 0,
          rotationX: -45,
          stagger: 0.1,
          duration: 0.8,
          ease: 'back.out(1.5)',
          scrollTrigger: {
            trigger: this.containerRef()!.nativeElement,
            start: 'top 75%'
          }
        });
      }

      this.destroyRef.onDestroy(() => {
        ScrollTrigger.getAll().forEach(t => {
          if (t.vars.trigger === this.containerRef()?.nativeElement || 
              this.skillCards().map(el => el.nativeElement).includes(t.vars.trigger as HTMLElement)) {
            t.kill();
          }
        });
      });
    });
  }

  getCategoryIcon(icon: string): string {
    const map: Record<string, string> = {
      'database': 'fas fa-database',
      'layout': 'fas fa-laptop-code',
      'hdd': 'fas fa-hdd',
      'cloud-server': 'fas fa-cloud'
    };
    return map[icon] || `fas fa-${icon}`;
  }

  triggerConfetti(event: MouseEvent) {
    const rect = (event.target as HTMLElement).closest('.skill-card')!.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;

    confetti({
      particleCount: 30,
      spread: 60,
      origin: { x, y },
      colors: ['#3b82f6', '#06b6d4', '#ffffff']
    });
  }
}

