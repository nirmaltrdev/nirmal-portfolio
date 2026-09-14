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
      skills: ['PHP (CodeIgniter 4)', 'Node.js', 'Java', 'Spring Boot', 'REST APIs', 'MPDF']
    },
    {
      category: 'Frontend Engineering',
      icon: 'layout',
      skills: ['Angular', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS']
    },
    {
      category: 'Databases & Storage',
      icon: 'hdd',
      skills: ['MySQL', 'Oracle', 'MariaDB', 'MongoDB', 'Schema Design', 'Query Optimization']
    },
    {
      category: 'Cloud, Security & Tools',
      icon: 'cloud-server',
      skills: ['AWS (S3)', 'Firebase (FCM)', 'Socket.IO', 'WebSockets', 'JWT', 'OAuth', 'RBAC', 'Git', 'GitHub', 'Postman', 'Swagger', 'Linux', 'PuTTY']
    }
  ];

  achievements: Achievement[] = [
    {
      title: 'Database & API Performance',
      description: 'Optimized slow-running SQL queries and database schemas across MySQL and MariaDB, noticeably boosting response times and API performance for core CRM modules.',
      icon: 'fas fa-bolt'
    },
    {
      title: 'End-to-End Ownership',
      description: 'Took full lifecycle ownership of major CRM features — from requirement analysis and architectural design through cloud deployment and production support.',
      icon: 'fas fa-shield-alt'
    },
    {
      title: 'Customer Retention Impact',
      description: 'Delivered high-value platform enhancements including recall management, lost customer tracking, and automated service reminders to retain repeat customers.',
      icon: 'fas fa-chart-line'
    },
    {
      title: 'Team Mentorship & Delivery',
      description: 'Led and mentored a team of 2–4 developers, maintaining code quality and ensuring consistent on-time sprint deliveries through structured code reviews.',
      icon: 'fas fa-users'
    }
  ];

  projects: Project[] = [
    {
      title: 'Enterprise CRM Platform — Automobile Service Industry',
      description: 'Full-scale enterprise CRM platform running day-to-day operations for automobile service centers. Handles end-to-end workflows from lead intake through appointment scheduling, workshop operations, job card management, quotations, and customer follow-ups (recall management, lost customer tracking, service reminders) to maximize customer retention.',
      technologies: ['Angular', 'PHP (CodeIgniter 4)', 'Node.js', 'MySQL', 'MongoDB', 'Socket.IO', 'Firebase', 'AWS S3', 'MPDF'],
      icon: 'user-switch',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'Vehicle Inspection & Job Card System (Java Spring Boot)',
      description: 'Secure companion module built with Java Spring Boot allowing workshop inspectors to conduct vehicle inspections, generate reports, and share them externally with vehicle owners via time-bound expiring token links without exposing internal CRM systems.',
      technologies: ['Java', 'Spring Boot', 'REST APIs', 'Token Validation', 'MySQL', 'MPDF'],
      icon: 'car',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'WhatsApp Automation & Messaging Engine',
      description: 'Automated customer engagement and communication pipeline integrated into the enterprise CRM ecosystem. Features bulk campaign triggers, scheduled notifications, follow-up workflows, and real-time updates via webhooks.',
      technologies: ['Angular', 'Node.js', 'REST APIs', 'Webhooks', 'Socket.IO'],
      icon: 'message',
      github: 'https://github.com/nirmaltrdev'
    }
  ];

  experiences: Experience[] = [
    {
      role: 'Software Engineer',
      company: 'LogicInfeel, Trivandrum, Kerala',
      duration: 'Feb 2023 – Present',
      description: [
        'Architected and developed a full-scale Enterprise CRM platform for the automobile service industry, spanning customer management, lead management, appointment scheduling, workshop operations, job card management, vehicle inspection, service reminders, and quotation management modules.',
        'Designed and implemented a Vehicle Inspection System using Java Spring Boot, including inspection workflows, secure shareable inspection links with time-bound token validation, and backend APIs for report generation.',
        'Engineered core CRM modules end-to-end using Angular, PHP (CodeIgniter 4), Node.js, MySQL, and MongoDB, delivering customer recall management, lost customer tracking, dashboards, and analytics.',
        'Integrated third-party services including WhatsApp for customer communication and Firebase Cloud Messaging (FCM) for real-time push notifications, and developed real-time CRM updates using Socket.IO.',
        'Designed AWS S3-based file storage architecture and built PDF generation/reporting pipelines using MPDF for job cards, quotations, and inspection reports.',
        'Designed and documented REST APIs using Postman and Swagger, and implemented JWT-based authentication with role-based access control (RBAC) across CRM modules.',
        'Developed Java-based backend modules and cross-service integrations, extending the platform beyond its core PHP stack.',
        'Collaborated directly with clients and stakeholders to analyze requirements, resolve production issues, and translate business needs into scalable technical solutions.',
        'Led and mentored a team of 2–4 developers, driving code quality and on-time delivery through structured code reviews.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Bitbridge Technologies, Trivandrum, Kerala',
      duration: 'Jul 2022 – Feb 2023',
      description: [
        'Developed authentication systems and reusable frontend modules for web applications using Angular and TypeScript.',
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
    { name: 'CSI (Computer Society of India)', role: 'Associate Member' }
  ];

  constructor() { }
}
