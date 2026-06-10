import { Component, Input, OnInit } from '@angular/core';

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
export class SkillsComponent implements OnInit {
  @Input() skills: SkillGroup[] = [];
  
  activeTab = 0;

  ngOnInit() {
    // Select first tab by default
    if (this.skills && this.skills.length > 0) {
      this.activeTab = 0;
    }
  }

  setActiveTab(index: number): void {
    this.activeTab = index;
  }
}
