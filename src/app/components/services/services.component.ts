import { Component, ElementRef, viewChild, viewChildren, afterNextRender, inject, DestroyRef, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent {
  private destroyRef = inject(DestroyRef);

  containerRef = viewChild<ElementRef<HTMLElement>>('servicesContainer');
  serviceCards = viewChildren<ElementRef<HTMLElement>>('serviceCard');

  services = signal([
    {
      title: 'Enterprise CRM Development',
      icon: 'fas fa-chart-line',
      description: 'Production CRM platforms covering the customer lifecycle, lead management, appointment scheduling, workshop/job card workflows, quotations, service reminders, and customer recall management.'
    },
    {
      title: 'Full Stack Architecture & API Engineering',
      icon: 'fas fa-layer-group',
      description: 'End-to-end systems engineered with Angular, Java Spring Boot, PHP (CodeIgniter), and Node.js, featuring secure REST APIs, database design, SQL query optimization, authentication, and AWS S3 pipelines.'
    },
    {
      title: 'AI, KPI & Business Automation',
      icon: 'fas fa-brain',
      description: 'Enterprise Performance Center & KPI architecture with hierarchical goal cascading, AI Copilot CRM integration for customer profile insights, and automated real-time workflows.'
    }
  ]);

  constructor() {
    afterNextRender(() => {
      if (this.containerRef() && this.serviceCards().length > 0) {
        const cards = this.serviceCards().map(el => el.nativeElement);
        
        gsap.from(cards, {
          y: 80,
          opacity: 0,
          scale: 0.9,
          stagger: 0.15,
          duration: 1,
          ease: 'power4.out',
          scrollTrigger: {
            trigger: this.containerRef()!.nativeElement,
            start: 'top 75%'
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
