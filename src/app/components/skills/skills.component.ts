import { Component, Input, OnInit, OnDestroy } from '@angular/core';

interface SkillGroup {
  category: string;
  icon: string;
  skills: string[];
}

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.css']
})
export class SkillsComponent implements OnInit, OnDestroy {
  @Input() skills: SkillGroup[] = [];
  
  activeTab = 0;
  private autoChangeInterval: any;

  ngOnInit() {
    // Select first tab by default
    if (this.skills && this.skills.length > 0) {
      this.activeTab = 0;
      this.startAutoChange();
    }
  }

  ngOnDestroy() {
    this.stopAutoChange();
  }

  startAutoChange(): void {
    this.autoChangeInterval = setInterval(() => {
      if (this.skills && this.skills.length > 0) {
        this.activeTab = (this.activeTab + 1) % this.skills.length;
      }
    }, 3000); // 3 seconds per tab
  }

  stopAutoChange(): void {
    if (this.autoChangeInterval) {
      clearInterval(this.autoChangeInterval);
    }
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
    // Reset the timer when user manually clicks a tab
    this.stopAutoChange();
    this.startAutoChange();
  }
}
