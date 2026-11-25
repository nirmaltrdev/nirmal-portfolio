import { Injectable, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TypewriterService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Types each role, deletes it, and moves on. Returns a function that stops the loop.
   * With `reducedMotion`, whole roles are swapped every 3 s instead of typed letter by letter.
   */
  type(roles: string[], speed: number, deleteSpeed: number, outputSignal: WritableSignal<string>, reducedMotion = false): () => void {
    if (!isPlatformBrowser(this.platformId)) return () => {};

    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const stop = () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };

    if (reducedMotion) {
      let i = 0;
      outputSignal.set(roles[0]);
      const swap = () => {
        if (stopped) return;
        i = (i + 1) % roles.length;
        outputSignal.set(roles[i]);
        timer = setTimeout(swap, 3000);
      };
      timer = setTimeout(swap, 3000);
      return stop;
    }

    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    const tick = () => {
      if (stopped) return;
      const currentRole = roles[roleIndex];
      
      if (isDeleting) {
        charIndex--;
        outputSignal.set(currentRole.substring(0, charIndex));
      } else {
        charIndex++;
        outputSignal.set(currentRole.substring(0, charIndex));
      }

      let typeSpeed = isDeleting ? deleteSpeed : speed;
      
      if (!isDeleting && charIndex === currentRole.length) {
        typeSpeed = 2000;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typeSpeed = 500;
      }
      
      timer = setTimeout(tick, typeSpeed);
    };

    timer = setTimeout(tick, speed);
    return stop;
  }

  /** Briefly scrambles a few characters every 5 s. Returns a function that stops it. */
  glitch(outputSignal: WritableSignal<string>, originalText: string): () => void {
    if (!isPlatformBrowser(this.platformId)) return () => {};
    const symbols = '!<>-_\\/[]{}—=+*^?#_';

    const interval = setInterval(() => {
      let glitched = originalText.split('');
      for (let i = 0; i < 3; i++) {
        const pos = Math.floor(Math.random() * glitched.length);
        glitched[pos] = symbols[Math.floor(Math.random() * symbols.length)];
      }
      outputSignal.set(glitched.join(''));
      
      setTimeout(() => {
        outputSignal.set(originalText);
      }, 80);
      setTimeout(() => {
        let glitched2 = originalText.split('');
        for (let i = 0; i < 3; i++) {
          const pos = Math.floor(Math.random() * glitched2.length);
          glitched2[pos] = symbols[Math.floor(Math.random() * symbols.length)];
        }
        outputSignal.set(glitched2.join(''));
      }, 160);
      setTimeout(() => {
        outputSignal.set(originalText);
      }, 240);
    }, 5000);
    return () => {
      clearInterval(interval);
      outputSignal.set(originalText);
    };
  }

  scrambleReveal(finalText: string, duration: number, outputSignal: WritableSignal<string>) {
    if (!isPlatformBrowser(this.platformId)) return;
    const symbols = '!<>-_\\/[]{}—=+*^?#_';
    let iteration = 0;
    const maxIterations = duration / 30;
    
    const interval = setInterval(() => {
      outputSignal.set(finalText.split('').map((char, index) => {
        if(index < iteration) {
          return char;
        }
        return symbols[Math.floor(Math.random() * symbols.length)]
      }).join(''));
      
      if(iteration >= finalText.length){
        clearInterval(interval);
      }
      iteration += finalText.length / maxIterations;
    }, 30);
  }
}
