import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Lenis from 'lenis';
import { gsap } from 'gsap';

@Injectable({ providedIn: 'root' })
export class SmoothScrollService {
  private lenis?: Lenis;
  private platformId = inject(PLATFORM_ID);

  init() {
    if (!isPlatformBrowser(this.platformId)) return;
    
    this.lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true
    });

    gsap.ticker.add((time) => {
      this.lenis?.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);
  }

  scrollTo(target: HTMLElement | string) {
    this.lenis?.scrollTo(target);
  }

  destroy() {
    if (this.lenis) {
      this.lenis.destroy();
      this.lenis = undefined;
    }
  }
}
