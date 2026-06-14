import { Injectable, inject, PLATFORM_ID, signal, WritableSignal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class TypewriterService {
  private platformId = inject(PLATFORM_ID);

  type(roles: string[], speed: number, deleteSpeed: number, outputSignal: WritableSignal<string>) {
    if (!isPlatformBrowser(this.platformId)) return;
    
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    
    const tick = () => {
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
      
      setTimeout(tick, typeSpeed);
    };
    
    setTimeout(tick, speed);
  }

  glitch(outputSignal: WritableSignal<string>, originalText: string) {
    if (!isPlatformBrowser(this.platformId)) return;
    const symbols = '!<>-_\\/[]{}—=+*^?#_';
    
    setInterval(() => {
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
