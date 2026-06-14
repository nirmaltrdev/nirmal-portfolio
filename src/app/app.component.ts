import { Component, inject, DestroyRef, afterNextRender, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmoothScrollService } from './services/smooth-scroll.service';

import { HeroComponent } from './components/hero/hero.component';
import { AboutComponent } from './components/about/about.component';
import { ExperienceComponent } from './components/experience/experience.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { EducationComponent } from './components/education/education.component';
import { ServicesComponent } from './components/services/services.component';
import { ContactComponent } from './components/contact/contact.component';
import { FooterComponent } from './components/footer/footer.component';
import { ChatbotComponent } from './components/chatbot/chatbot.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    HeroComponent,
    AboutComponent,
    ExperienceComponent,
    SkillsComponent,
    ProjectsComponent,
    EducationComponent,
    ServicesComponent,
    ContactComponent,
    FooterComponent,
    ChatbotComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  private scrollSvc = inject(SmoothScrollService);
  private destroyRef = inject(DestroyRef);
  
  isLightTheme = false;
  activeSection = 'hero';
  scrolled = false;
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (typeof window === 'undefined') return;
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    this.scrolled = scrollPosition > 50;

    const sections = ['hero', 'about', 'services', 'skills', 'projects', 'experience', 'education', 'contact'];
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  constructor() {
    this.checkSavedTheme();
    afterNextRender(() => {
      this.scrollSvc.init();

      // Custom Cursor tracking
      const dot = document.getElementById('cursor-dot');
      const outline = document.getElementById('cursor-outline');
      if (dot && outline) {
        const onMouseMove = (e: MouseEvent) => {
          dot.style.left = e.clientX + 'px';
          dot.style.top = e.clientY + 'px';
          outline.animate({
            left: `${e.clientX}px`,
            top: `${e.clientY}px`
          }, { duration: 500, fill: 'forwards' });
        };
        document.addEventListener('mousemove', onMouseMove);
        
        this.destroyRef.onDestroy(() => {
          document.removeEventListener('mousemove', onMouseMove);
        });
      }
    });
    this.destroyRef.onDestroy(() => this.scrollSvc.destroy());
  }

  checkSavedTheme(): void {
    if (typeof localStorage !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      if (savedTheme === 'light') {
        this.isLightTheme = true;
        if (typeof document !== 'undefined') {
          document.body.classList.remove('dark-theme');
          document.body.classList.add('light-theme');
        }
      } else {
        this.isLightTheme = false;
        if (typeof document !== 'undefined') {
          document.body.classList.add('dark-theme');
        }
      }
    }
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    if (typeof document !== 'undefined') {
      if (this.isLightTheme) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        if (typeof localStorage !== 'undefined') localStorage.setItem('theme', 'light');
      } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        if (typeof localStorage !== 'undefined') localStorage.setItem('theme', 'dark');
      }
    }
  }

  scrollTo(sectionId: string): void {
    this.activeSection = sectionId;
    this.closeMobileMenu();
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

