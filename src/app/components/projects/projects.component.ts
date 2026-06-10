import { Component, Input } from '@angular/core';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  icon: string;
  github?: string;
  demo?: string;
}

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent {
  @Input() projects: Project[] = [];
}
