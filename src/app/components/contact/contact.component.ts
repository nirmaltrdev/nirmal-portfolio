import { Component, ElementRef, viewChild, afterNextRender, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimationService } from '../../services/animation.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent {
  private destroyRef = inject(DestroyRef);
  private animSvc = inject(AnimationService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private cdr = inject(ChangeDetectorRef);

  containerRef = viewChild<ElementRef<HTMLElement>>('contactContainer');
  submitBtn = viewChild<ElementRef<HTMLElement>>('submitBtn');

  isSubmitting = false;

  contactForm = this.fb.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required]]
  });

  constructor() {
    afterNextRender(() => {
      if (this.containerRef()) {
        gsap.from(this.containerRef()!.nativeElement, {
          y: 50,
          opacity: 0,
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: this.containerRef()!.nativeElement,
            start: 'top 80%'
          }
        });
      }

      let cleanupMagnetic: () => void;
      if (this.submitBtn()) {
        cleanupMagnetic = this.animSvc.magneticEffect(this.submitBtn()!.nativeElement);
      }

      this.destroyRef.onDestroy(() => {
        if (cleanupMagnetic) cleanupMagnetic();
        ScrollTrigger.getAll().forEach(t => {
          if (t.vars.trigger === this.containerRef()?.nativeElement) t.kill();
        });
      });
    });
  }

  submitForm(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const formData = {
        ...this.contactForm.value,
        subject: `New Portfolio Message from ${this.contactForm.value.name}`
      };

      if (this.submitBtn()) {
        gsap.to(this.submitBtn()!.nativeElement, {
          scale: 0.95,
          duration: 0.1,
          yoyo: true,
          repeat: 1
        });
      }

      this.http.post('https://formsubmit.co/ajax/nirmaltrejilal@gmail.com', formData)
        .subscribe({
          next: () => {
            this.message.success('Thank you! Your message has been sent. Nirmal will get in touch with you shortly.', {
              nzDuration: 5000
            });

            // Sync user data to Crisp session
            if (typeof window !== 'undefined' && (window as any).$crisp) {
              try {
                (window as any).$crisp.push(["set", "user:email", [formData.email]]);
                (window as any).$crisp.push(["set", "user:nickname", [formData.name]]);
              } catch (e) {
                console.error('Crisp session profiling error:', e);
              }
            }

            this.contactForm.reset();
            this.isSubmitting = false;
            this.cdr.markForCheck();
          },
          error: () => {
            this.message.error('Oops! There was a sending issue. Please contact me directly via email or WhatsApp.');
            this.isSubmitting = false;
            this.cdr.markForCheck();
          }
        });
    } else {
      Object.values(this.contactForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Please fill in all details correctly so I can reach back.');
    }
  }
}

