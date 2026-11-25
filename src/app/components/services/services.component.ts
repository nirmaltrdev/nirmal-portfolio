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
      description: 'Production CRM supporting the full customer cycle: customer management, lead intake, appointments, workshop operations and job cards, quotations, follow-up and customer retention, with service reminders, customer recall, lost customer tracking and WhatsApp campaigns.'
    },
    {
      title: 'PHP REST APIs & Integrations',
      icon: 'fas fa-layer-group',
      description: 'CodeIgniter 4 REST API backend on MySQL, returning JSON to an Angular 15 frontend, integrated with WhatsApp Cloud API, Firebase Cloud Messaging, AWS S3, OpenAI and Yeastar PBX using PHP cURL, and secured with JWT authentication and role-based access control.'
    },
    {
      title: 'Deployment & Production Support',
      icon: 'fas fa-server',
      description: 'Deploy and support backend releases on Linux-based AWS EC2 servers, configure Apache mod_rewrite rules, run scheduled jobs with cron, and manage separate live and test environments while troubleshooting live issues.'
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
