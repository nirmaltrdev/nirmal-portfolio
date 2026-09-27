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

export interface Membership {
  name: string;
  role: string;
}

export interface Achievement {
  title: string;
  description: string;
  icon: string;
}

@Injectable({
  providedIn: 'root'
})
export class PortfolioDataService {

  skills: SkillGroup[] = [
    {
      category: 'Backend Architecture',
      icon: 'database',
      skills: ['Java', 'Spring Boot', 'Node.js', 'PHP', 'CodeIgniter 4', 'REST APIs', 'MPDF']
    },
    {
      category: 'Frontend Engineering',
      icon: 'layout',
      skills: ['Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS']
    },
    {
      category: 'Databases & Query Optimization',
      icon: 'hdd',
      skills: ['MySQL', 'MariaDB', 'MongoDB', 'Oracle', 'SQL', 'Database Design', 'Query Optimization']
    },
    {
      category: 'Cloud, Real-Time & Security',
      icon: 'cloud-server',
      skills: ['AWS', 'Amazon S3', 'Firebase', 'Firebase Cloud Messaging (FCM)', 'Socket.IO', 'WebSockets', 'JWT', 'OAuth', 'RBAC']
    },
    {
      category: 'Architecture, Business & Tools',
      icon: 'shield',
      skills: ['Enterprise CRM', 'System Architecture', 'API Integration', 'Performance Optimization', 'KPI / Performance Management', 'AI Copilot Design', 'Git', 'GitHub', 'Postman', 'Swagger', 'VS Code', 'Linux', 'PuTTY']
    }
  ];

  achievements: Achievement[] = [
    {
      title: 'SQL Query Optimization',
      description: 'Reduced a core CRM search from over 60 seconds to under 2 seconds through SQL/query optimization.',
      icon: 'fas fa-bolt'
    },
    {
      title: 'Performance Center & KPI Architecture',
      description: 'Designed and built an enterprise Performance Center / KPI capability within the CRM, featuring a configurable N-level organizational hierarchy (Group of Companies → Company → Department/KRA), KPI assignment, goal cascading, employee performance tracking, and hierarchical drill-down of performance scores.',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'AI Copilot CRM Integration',
      description: 'Architected an AI Copilot layer on top of the CRM with AI service & gateway concepts, prompt management, provider routing, and customer-facing AI Copilot integration for AI-assisted business and customer profile insights.',
      icon: 'fas fa-brain'
    },
    {
      title: 'Engineering Leadership & Delivery',
      description: 'Led and mentored a team of 2–4 developers, taking end-to-end feature ownership from requirement analysis and architecture through development, database design, API integration, code reviews, deployment, and production support.',
      icon: 'fas fa-users'
    }
  ];

  projects: Project[] = [
    {
      title: 'Enterprise CRM Platform — Automobile Service Industry',
      description: 'Primary production multi-module CRM for automobile service centers running the full customer lifecycle: lead intake, appointment scheduling, workshop/service operations, job cards, quotations, service reminders, customer recall, and lost customer tracking. Extended with an N-level KPI Performance Center, AI Copilot layer, real-time updates, and role-based access control.',
      technologies: ['Angular', 'TypeScript', 'PHP (CodeIgniter 4)', 'Node.js', 'Java', 'MySQL', 'MongoDB', 'Socket.IO', 'Firebase', 'AWS S3', 'JWT/RBAC'],
      icon: 'user-switch',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'Vehicle Inspection & Job Card Management System',
      description: 'Companion module built with Java Spring Boot enabling inspectors to generate vehicle inspection reports linked to job cards and share them externally via time-bound expiring token links without exposing internal CRM systems. Integrated file storage and job card data processing via secure REST APIs.',
      technologies: ['Java', 'Spring Boot', 'REST APIs', 'Token-Based Authentication', 'AWS S3', 'MySQL', 'MPDF'],
      icon: 'car',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'CRM AI & Performance Platform',
      description: 'Integrated intelligence platform built directly on the CRM data model, combining an N-level configurable Performance Center / KPI module (Group → Company → Department/KRA, goal cascading, employee performance tracking) with an AI Copilot layer (AI gateway, prompt routing, customer profile integration for AI-assisted business insights).',
      technologies: ['Angular', 'TypeScript', 'Node.js', 'AI Gateway', 'Prompt Management', 'REST APIs', 'MySQL', 'MongoDB'],
      icon: 'brain',
      github: 'https://github.com/nirmaltrdev'
    }
  ];

  experiences: Experience[] = [
    {
      role: 'Software Engineer',
      company: 'LogicInfeel, Trivandrum, Kerala',
      duration: 'Feb 2023 – Present',
      description: [
        'Architected and developed a production enterprise CRM platform for the automobile service industry, spanning customer management, lead management, potential lead management, appointment scheduling, workshop/service operations, job card management, quotation management, service reminders, customer recall management, and lost customer tracking.',
        'Engineered core CRM modules end-to-end using Angular, PHP (CodeIgniter 4), Node.js, MySQL, and MongoDB, and extended select backend modules and integrations using Java, broadening the platform beyond its core PHP stack.',
        'Designed and built a Performance Center / KPI capability within the CRM, covering a configurable N-level organizational hierarchy (Group of Companies → Company → Department/KRA), KPI assignment, goal cascading, employee performance tracking, and hierarchical drill-down of performance scores.',
        'Designed an AI Copilot layer on top of the existing CRM, including AI service and gateway concepts, prompt management, provider routing, and a customer-facing AI Copilot integrated with the CRM customer profile to support AI-assisted business insights.',
        'Developed a Java Spring Boot Vehicle Inspection System integrated with the CRM, including inspection workflows, job card integration, report generation, and secure externally-shareable inspection links protected by time-bound token validation.',
        'Integrated third-party services including WhatsApp for customer communication and Firebase Cloud Messaging (FCM) for real-time push notifications, and implemented real-time CRM updates using Socket.IO.',
        'Designed an AWS S3-based file storage architecture and built PDF generation/reporting pipelines using MPDF for job cards, quotations, and inspection reports.',
        'Designed and documented REST APIs using Postman and Swagger, and implemented JWT-based authentication with role-based access control (RBAC) across CRM modules.',
        'Reduced a core CRM search from over 60 seconds to under 2 seconds through SQL/query optimization.',
        'Took end-to-end ownership of major CRM feature areas, from requirement analysis and architecture through development, database design, API integration, testing, deployment, and production support.',
        'Led and mentored a team of 2–4 developers, driving code quality and on-time delivery through structured code reviews and technical guidance.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Bitbridge Technologies, Trivandrum, Kerala',
      duration: 'Jul 2022 – Feb 2023',
      description: [
        'Developed authentication systems and reusable frontend modules for web applications.',
        'Built responsive user interfaces and integrated REST APIs to connect frontend and backend services.',
        'Collaborated closely with backend engineering teams to deliver features on schedule within an Agile workflow.'
      ]
    }
  ];

  education: Education[] = [
    {
      degree: 'B.Tech in Computer Science and Engineering',
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

  memberships: Membership[] = [
    { name: 'IEEE', role: 'Associate Member' },
    { name: 'CSI', role: 'Associate Member' }
  ];

  constructor() { }
}
