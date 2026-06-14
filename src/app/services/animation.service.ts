import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { gsap } from 'gsap';

@Injectable({ providedIn: 'root' })
export class AnimationService {
  private ctx = gsap.context(() => {});
  private platformId = inject(PLATFORM_ID);

  initScrollTrigger(el: Element, vars: gsap.TweenVars) {
    if (!isPlatformBrowser(this.platformId)) return;
    return this.ctx.add(() =>
      gsap.from(el, {
        ...vars,
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true
        }
      })
    );
  }

  splitTextToWords(el: HTMLElement): HTMLElement[] {
    if (!isPlatformBrowser(this.platformId)) return [];
    const text = el.textContent || '';
    const words = text.split(' ').filter(w => w.trim() !== '');
    el.innerHTML = words
      .map(w => `<span class="word" style="display:inline-block">${w}</span>`)
      .join(' ');
    return Array.from(el.querySelectorAll('.word'));
  }

  magneticEffect(btn: HTMLElement, radius = 80, strength = 0.35) {
    if (!isPlatformBrowser(this.platformId)) return () => {};
    const onMove = (e: MouseEvent) => {
      const r = btn.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      
      if (dist < radius) {
        gsap.to(btn, {
          x: (e.clientX - cx) * strength,
          y: (e.clientY - cy) * strength,
          duration: 0.3
        });
      } else {
        gsap.to(btn, { 
          x: 0, y: 0, duration: 0.5,
          ease: 'elastic.out(1,0.5)' 
        });
      }
    };
    
    document.addEventListener('mousemove', onMove);
    return () => document.removeEventListener('mousemove', onMove);
  }

  destroyAll() {
    this.ctx.revert();
  }
}
