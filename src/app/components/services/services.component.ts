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
      description: 'Scalable CRM solutions designed for automobile service operations, workshop management, and customer recall workflows.'
    },
    {
      title: 'Full Stack & Cloud Architecture',
      icon: 'fas fa-layer-group',
      description: 'End-to-end systems engineered with Angular, Java Spring Boot, PHP, Node.js, and AWS S3 cloud storage pipelines.'
    },
    {
      title: 'Real-Time Systems & REST APIs',
      icon: 'fas fa-network-wired',
      description: 'High-performance API design with Swagger/Postman, secure JWT/RBAC access control, and live Socket.IO & Firebase messaging.'
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
