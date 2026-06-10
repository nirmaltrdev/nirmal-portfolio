import { Component, Input } from '@angular/core';

interface Education {
  degree: string;
  institution: string;
  year: string;
}

interface Certification {
  name: string;
  issuer: string;
}

interface Publication {
  title: string;
  authors: string;
  date: string;
  doi: string;
  url?: string;
}

@Component({
  selector: 'app-education',
  templateUrl: './education.component.html',
  styleUrls: ['./education.component.css']
})
export class EducationComponent {
  @Input() education: Education[] = [];
  @Input() certifications: Certification[] = [];
  @Input() publications: Publication[] = [];
}
