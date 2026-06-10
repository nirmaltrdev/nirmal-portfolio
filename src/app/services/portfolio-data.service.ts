import { Injectable } from '@angular/core';

export interface Project {
  title: string;
  description: string;
  technologies: string[];
  icon: string;
  github?: string;
  demo?: string;
}

export interface SkillGroup {
  category: string;
  icon: string;
  skills: string[];
}

export interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year: string;
}

export interface Certification {
  name: string;
  issuer: string;
}

export interface Publication {
  title: string;
  authors: string;
  date: string;
  doi: string;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {

  skills: SkillGroup[] = [
    {
      category: 'Backend Architecture',
      icon: 'database',
      skills: ['PHP (CodeIgniter 4)', 'Node.js', 'Java', 'REST APIs']
    },
    {
      category: 'Frontend Engineering',
      icon: 'layout',
      skills: ['Angular', 'TypeScript', 'HTML5', 'CSS3', 'Tailwind', 'JavaScript']
    },
    {
      category: 'Databases & Storage',
      icon: 'hdd',
      skills: ['MySQL', 'MongoDB', 'Database Design', 'Schema Design', 'Query Optimization']
    },
    {
      category: 'Cloud, DevOps & Integrations',
      icon: 'cloud-server',
      skills: ['AWS', 'S3 Bucket', 'Firebase', 'Socket.IO', 'FCM', 'Git', 'GitHub']
    }
  ];

  projects: Project[] = [
    {
      title: 'Enterprise CRM & Automation Hub',
      description: 'A highly sophisticated customer relationship platform built on a dual-backend microservices architecture (PHP/CodeIgniter 4 & Java/Spring Boot). Integrates multiple 3rd party APIs, real-time Socket.IO chat, direct WhatsApp automation campaigns, and an integrated VoIP call/telephony system.',
      technologies: ['Angular', 'CodeIgniter 4', 'Spring Boot (Java)', 'MySQL', 'MongoDB', 'WhatsApp API', 'VoIP Integration', 'Socket.IO'],
      icon: 'user-switch',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'Vehicle Inspection & Job Card System',
      description: 'Enterprise inspection, quotation, job card, and workshop management platform built with modern architecture. Implemented secure time-bound shareable link functionality and inspection workflow APIs.',
      technologies: ['Spring Boot', 'Angular', 'Java', 'MySQL', 'REST APIs'],
      icon: 'car',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'WhatsApp Automation Platform',
      description: 'Automated customer engagement platform featuring bulk media campaign triggers, scheduled messaging, conditional follow-up actions, and live messaging analytics workflows.',
      technologies: ['Angular', 'Node.js', 'REST APIs', 'Webhooks'],
      icon: 'message',
      github: 'https://github.com/nirmaltrdev'
    }
  ];

  experiences: Experience[] = [
    {
      role: 'Software Engineer',
      company: 'LOGICINFEEL, Trivandrum, Kerala',
      duration: 'Feb 2023 – Present',
      description: [
        'Designed and developed scalable CRM applications using a dual-backend microservices architecture with Angular, PHP (CodeIgniter 4), and Java (Spring Boot).',
        'Integrated third-party messaging and communication systems, including WhatsApp API marketing campaigns and VoIP telephony/call channels.',
        'Architected database schemas, optimized queries for performance, and integrated third-party APIs.',
        'Developed real-time communication systems using Socket.IO and Firebase Cloud Messaging (FCM) for push notifications.',
        'Designed AWS S3-based file storage solutions and built PDF generation systems using MPDF.',
        'Led and mentored a team of 2–4 developers, overseeing task allocation, code reviews, and ensuring high-quality feature delivery across projects.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Bitbridge Technologies, Trivandrum, Kerala',
      duration: 'Jul 2022 – Feb 2023',
      description: [
        'Developed secure authentication systems and frontend modules.',
        'Built responsive customer-facing user interfaces and integrated modular REST APIs.',
        'Collaborated closely with backend engineering teams to ensure seamless feature delivery.'
      ]
    }
  ];

  education: Education[] = [
    {
      degree: 'B.Tech in Computer Science Engineering',
      institution: 'APJ Abdul Kalam Technological University',
      year: '2021'
    }
  ];

  certifications: Certification[] = [
    { name: 'Java Programming Masterclass', issuer: 'Udemy' },
    { name: 'AWS Development Tools and Services', issuer: 'AWS' },
    { name: 'Cybersecurity and IoT', issuer: 'Coursera' },
    { name: 'Certified Secure Computer User', issuer: 'EC-Council' },
    { name: 'Google Analytics for Beginners', issuer: 'Google' }
  ];

  publications: Publication[] = [
    {
      title: 'Healthcare Data Fusion',
      authors: 'Adithya Jayaprakash Pillai, Nirmal T R, Asif Ali, Asni KK',
      date: 'July 2021',
      doi: '10.17577/IJERTCONV9IS13031',
      url: 'https://www.ijert.org/healthcare-data-fusion'
    }
  ];

  constructor() { }
}
