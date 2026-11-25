import { Injectable } from '@angular/core';

export interface Project {
  title: string;
  description: string[];
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

  coreCompetencies: string[] = [
    'PHP Application Development',
    'REST API Design and Integration',
    'MySQL Database Design and Optimization',
    'Linux and AWS EC2 Deployment',
    'Apache Configuration',
    'Production Support and Troubleshooting',
    'Third-Party API Integration',
    'Application Security (JWT, RBAC)',
    'Enterprise CRM Development',
    'Team Mentoring and Client Communication'
  ];

  skills: SkillGroup[] = [
    {
      category: 'Backend',
      icon: 'database',
      skills: ['PHP (7.4 / 8.0)', 'CodeIgniter 4', 'REST APIs', 'JSON', 'cURL', 'Java', 'Spring Boot', 'Node.js']
    },
    {
      category: 'Databases',
      icon: 'hdd',
      skills: ['MySQL', 'MariaDB', 'MongoDB', 'Database Design', 'Complex SQL (joins, subqueries, transactions)', 'Query Optimization', 'Migrations', 'Backup and Restore']
    },
    {
      category: 'Web Server & Hosting',
      icon: 'server',
      skills: ['Apache (mod_rewrite, .htaccess)', 'Linux', 'AWS EC2', 'AWS S3', 'Cron Jobs', 'SSH (PuTTY)', 'FileZilla']
    },
    {
      category: 'Frontend',
      icon: 'layout',
      skills: ['Angular 15', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Tailwind CSS', 'NgRx']
    },
    {
      category: 'Integrations',
      icon: 'plug',
      skills: ['WhatsApp Cloud API and Webhooks', 'Firebase Cloud Messaging', 'OpenAI API', 'Yeastar PBX', 'Socket.IO', 'WebSockets']
    },
    {
      category: 'Security',
      icon: 'shield',
      skills: ['JWT', 'OAuth', 'Role-Based Access Control', 'CORS', 'IP Allow-Listing', 'Secure File Upload Validation']
    },
    {
      category: 'Tools',
      icon: 'screwdriver-wrench',
      skills: ['Git', 'GitHub', 'Postman', 'PHPUnit', 'PHPStan', 'MySQL Workbench', 'XAMPP', 'VS Code', 'mPDF']
    },
    {
      category: 'Practices',
      icon: 'list-check',
      skills: ['Enterprise CRM Development', 'System Architecture', 'API Integration', 'Production Support', 'Requirement Analysis', 'Code Review', 'Agile', 'Mentoring']
    }
  ];

  achievements: Achievement[] = [
    {
      title: 'SQL Query Optimization',
      description: 'Reduced a core CRM search query from over 60 seconds to under 2 seconds (over 95% faster) through SQL query optimization.',
      icon: 'fas fa-bolt'
    },
    {
      title: 'Production CRM Ownership',
      description: 'Owned and supported a production CRM used daily by automobile service centers in Abu Dhabi and Dubai since 2023.',
      icon: 'fas fa-car'
    },
    {
      title: 'Third-Party Integrations',
      description: 'Integrated 5 external platforms into one CRM: WhatsApp Cloud API, Firebase Cloud Messaging, AWS S3, OpenAI and Yeastar PBX.',
      icon: 'fas fa-plug'
    },
    {
      title: 'WhatsApp Bulk Messaging Engine',
      description: 'Built an automated WhatsApp bulk messaging engine that runs every minute through Linux cron, with throttling and error handling.',
      icon: 'fab fa-whatsapp'
    },
    {
      title: 'Codebase Consolidation Plan',
      description: 'Planned the consolidation of two production codebases into a shared core with environment-specific modules.',
      icon: 'fas fa-code-branch'
    },
    {
      title: 'Mentoring',
      description: 'Mentored 2–4 developers through code reviews and technical guidance.',
      icon: 'fas fa-users'
    }
  ];

  projects: Project[] = [
    {
      title: 'Enterprise CRM for Automobile Service Centers (UAE)',
      description: [
        'Production CRM owned since joining LogicInfeel, used daily by service centers in Abu Dhabi and Dubai. It supports the full customer cycle: customer management, lead intake, appointments, workshop operations and job cards, quotations, follow-up and customer retention.',
        'Customer retention features: service reminders, customer recall, lost customer tracking, WhatsApp campaigns and bulk messaging.',
        'Real-time WhatsApp chat with Socket.IO, push notifications with Firebase, call-center integration with Yeastar PBX, AI-powered chat summaries and lead scoring with OpenAI, plus dashboards and PDF reporting across modules.',
        'Runs as two separate production environments with a shared core and region-specific modules, each with its own live and test setup.'
      ],
      technologies: ['PHP', 'CodeIgniter 4', 'MySQL', 'Angular 15', 'TypeScript', 'REST APIs', 'AWS EC2', 'AWS S3', 'Apache', 'Linux', 'Socket.IO'],
      icon: 'user-switch',
      github: 'https://github.com/nirmaltrdev'
    },
    {
      title: 'Vehicle Inspection and Job Card Management System',
      description: [
        'Developed a Java Spring Boot companion module to the CRM that lets inspectors create inspection reports linked to job cards, generate PDF reports and share them externally.',
        'Designed time-bound token validation so shared report links expire without exposing the rest of the CRM.',
        'Integrated S3 file storage and job card data with the CRM backend through secure REST APIs.'
      ],
      technologies: ['Java', 'Spring Boot', 'REST APIs', 'AWS S3', 'Token-Based Authentication'],
      icon: 'car',
      github: 'https://github.com/nirmaltrdev'
    }
  ];

  experiences: Experience[] = [
    {
      role: 'Software Engineer',
      company: 'LogicInfeel, Trivandrum, Kerala, India',
      duration: 'Feb 2023 – Present',
      description: [
        "Develop, deploy and support the company's main production CRM for a UAE automobile dealer group (see Key Projects).",
        'Built and maintain the CodeIgniter 4 REST API backend, returning JSON to an Angular 15 frontend, and tested and documented the APIs with Postman.',
        'Integrated third-party APIs over PHP cURL: WhatsApp Cloud API (messaging, templates, webhooks), Firebase Cloud Messaging with Google OAuth2, AWS S3 media storage, OpenAI and Yeastar PBX.',
        'Deploy and support backend releases on Linux-based AWS EC2 servers using SSH (PuTTY) and FileZilla. Manage separate live and test environments and environment-specific configuration, and preserve production-specific changes during releases.',
        'Configured Apache mod_rewrite rules for front-controller routing, canonical redirects and JWT Authorization header handling, and hardened upload directories against script execution.',
        'Built scheduled background jobs with CodeIgniter Spark commands run by Linux cron. These include a per-minute WhatsApp bulk sender with throttling and error handling, automated appointment status updates, and background media uploads to AWS S3.',
        'Built PDF report generation with mPDF for job cards, quotations and inspection reports, with files stored in AWS S3.',
        'Design and maintain MySQL databases across two production environments and their test setups, including a shared common database, schema design and database migrations.',
        'Reduced a core CRM search query from over 60 seconds to under 2 seconds through SQL query optimization: removing unnecessary LEFT JOINs, splitting complex OR conditions and removing unindexed function calls on filtered columns.',
        'Wrote complex multi-table SQL with joins, subqueries and transactions, including transactional Excel bulk imports that roll back on failure.',
        'Restore MySQL backups using MySQL Workbench and the MySQL command line, and troubleshoot data and configuration differences between production, test and local environments.',
        'Implemented JWT authentication, role-based access control (RBAC), IP allow-listing, CORS, file upload validation and a user activity audit log.',
        'Audited two production backend codebases and planned a shared core with environment-specific modules.',
        'Mentored 2–4 developers through code reviews. Worked directly with client stakeholders on requirements, testing and production issues.'
      ]
    },
    {
      role: 'Software Engineer',
      company: 'Bitbridge Technologies, Trivandrum, Kerala, India',
      duration: 'Jul 2022 – Feb 2023',
      description: [
        'Developed authentication systems and reusable frontend modules for web applications.',
        'Built responsive user interfaces and integrated REST APIs between frontend and backend services.',
        'Delivered features on schedule with backend teams in an Agile workflow.'
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
    { name: 'AWS Development Tools and Services', issuer: 'AWS' },
    { name: 'Java Programming Masterclass', issuer: 'Udemy' },
    { name: 'Certified Secure Computer User', issuer: 'EC-Council' },
    { name: 'Cybersecurity and IoT', issuer: 'Coursera' },
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
