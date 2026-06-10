import { Component, Input, HostListener, OnInit, ElementRef } from '@angular/core';

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string[];
}

@Component({
  selector: 'app-experience',
  templateUrl: './experience.component.html',
  styleUrls: ['./experience.component.css']
})
export class ExperienceComponent implements OnInit {
  @Input() experiences: Experience[] = [];
  
  activeIndex = 0;

  constructor(private el: ElementRef) {}

  ngOnInit() {
    if (this.experiences && this.experiences.length > 0) {
      this.activeIndex = 0;
    }
  }

  // Simple scroll spy for the sticky index
  @HostListener('window:scroll', ['$event'])
  onScroll() {
    const sections = this.el.nativeElement.querySelectorAll('.exp-detail-block');
    let current = 0;

    sections.forEach((section: any, index: number) => {
      const rect = section.getBoundingClientRect();
      // If the top of the section is near the middle of the viewport
      if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
        current = index;
      }
    });

    this.activeIndex = current;
  }
}
