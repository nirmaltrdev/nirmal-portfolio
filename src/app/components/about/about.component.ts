import { Component } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  
  // Static data flow nodes for the SaaS UI representation
  architectureNodes = [
    { name: 'CRM Platform', icon: 'fas fa-desktop', desc: 'Frontend UI' },
    { name: 'WhatsApp Automation', icon: 'fab fa-whatsapp', desc: 'Integration' },
    { name: 'Spring Boot APIs', icon: 'fas fa-server', desc: 'Microservices' },
    { name: 'MySQL / MongoDB', icon: 'fas fa-database', desc: 'Data Layer' },
    { name: 'AWS Cloud', icon: 'fab fa-aws', desc: 'Infrastructure' }
  ];
}
