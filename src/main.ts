import { bootstrapApplication } from '@angular/platform-browser';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { AppComponent } from './app/app.component';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CustomEase } from 'gsap/CustomEase';
import { TextPlugin } from 'gsap/TextPlugin';

gsap.registerPlugin(ScrollTrigger, CustomEase, TextPlugin);
CustomEase.create("cinematic", "M0,0 C0.08,0 0.18,1 1,1");
ScrollTrigger.defaults({ markers: false });

bootstrapApplication(AppComponent, {
  providers: [
    provideZonelessChangeDetection(),
    provideAnimationsAsync(),
    provideRouter([]),
    provideHttpClient(),
    importProvidersFrom(NzMessageModule)
  ]
}).catch(err => console.error(err));

