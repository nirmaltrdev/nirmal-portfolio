import { Component, inject, DestroyRef, afterNextRender, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmoothScrollService } from './services/smooth-scroll.service';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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
  private cdr = inject(ChangeDetectorRef);
  
  isLightTheme = false;
  activeSection = 'hero';
  scrolled = false;
  isMobileMenuOpen = false;

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.lockBodyScroll(this.isMobileMenuOpen);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    this.lockBodyScroll(false);
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isMobileMenuOpen) this.closeMobileMenu();
  }

  /** Stop the page behind the full-screen mobile menu from scrolling. */
  private lockBodyScroll(lock: boolean): void {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = lock ? 'hidden' : '';
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
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      if (reduceMotion) {
        // Skip smooth-scroll inertia and jump every GSAP entrance animation to its final state,
        // so content is shown immediately and nothing slides in from off-screen.
        setTimeout(() => {
          ScrollTrigger.getAll().forEach(t => {
            t.animation?.progress(1);
            t.kill(false);
          });
          gsap.globalTimeline.getChildren(true, true, false).forEach(tween => tween.progress(1));
        });
      } else {
        this.scrollSvc.init();
      }

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

  /** Theme colours used for <meta name="theme-color"> (browser UI on mobile). Match --bg-deep. */
  private static readonly THEME_COLORS = { dark: '#050816', light: '#f8fafc' };

  /**
   * The inline script in index.html already applied the right theme before Angular booted
   * (saved choice, else the OS preference). Mirror it here and keep following the OS setting
   * until the visitor makes an explicit choice.
   */
  checkSavedTheme(): void {
    if (typeof document === 'undefined') return;
    this.isLightTheme = document.documentElement.classList.contains('light-theme');
    this.applyTheme(this.isLightTheme);

    if (typeof window === 'undefined' || !window.matchMedia) return;
    const systemLight = window.matchMedia('(prefers-color-scheme: light)');
    const onSystemChange = (e: MediaQueryListEvent) => {
      if (this.getSavedTheme()) return; // an explicit choice wins over the OS setting
      this.isLightTheme = e.matches;
      this.applyTheme(this.isLightTheme);
      this.cdr.markForCheck();
    };
    systemLight.addEventListener?.('change', onSystemChange);
    this.destroyRef.onDestroy(() => systemLight.removeEventListener?.('change', onSystemChange));
  }

  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    this.applyTheme(this.isLightTheme);
    try {
      localStorage.setItem('theme', this.isLightTheme ? 'light' : 'dark');
    } catch {
      /* storage unavailable (private mode): the theme still switches for this visit */
    }
  }

  private getSavedTheme(): string | null {
    try {
      return localStorage.getItem('theme');
    } catch {
      return null;
    }
  }

  /** Apply the theme class to <html> and <body> and sync the browser UI colour. */
  private applyTheme(light: boolean): void {
    for (const el of [document.documentElement, document.body]) {
      el.classList.toggle('light-theme', light);
      el.classList.toggle('dark-theme', !light);
    }
    const meta = document.querySelector('meta[name="theme-color"]');
    meta?.setAttribute('content', light ? AppComponent.THEME_COLORS.light : AppComponent.THEME_COLORS.dark);
  }

  scrollTo(sectionId: string, event?: Event): void {
    event?.preventDefault(); // links keep a real href for keyboard / no-JS use; we scroll smoothly instead
    this.activeSection = sectionId;
    this.closeMobileMenu();
    const el = document.getElementById(sectionId);
    if (el) {
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      // Move keyboard focus to the section so the next Tab continues from there
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1');
      el.focus({ preventScroll: true });
    }
  }
}

