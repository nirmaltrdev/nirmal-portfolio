import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';

interface Project {
  title: string;
  description: string;
  technologies: string[];
  icon: string;
  github?: string;
  demo?: string;
}

interface SkillGroup {
  category: string;
  icon: string;
  skills: string[];
}

interface Experience {
  role: string;
  company: string;
  duration: string;
  description: string[];
}

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
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'portfolio-web';
  drawerVisible = false;
  activeSection = 'hero';
  scrolled = false;

  contactForm!: FormGroup;
  isSubmitting = false;

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
      authors: 'Adithya Jayaprakash Pillai, Nirmal TR, Asif Ali, Asni KK',
      date: 'July 2021',
      doi: '10.17577/IJERTCONV9IS13031',
      url: 'https://www.ijert.org/healthcare-data-fusion'
    }
  ];

  // Theme State
  isLightTheme = false;

  // Chatbot State
  chatOpen = false;
  isTyping = false;
  chatInputText = '';
  chatMessages: Array<{ sender: 'user' | 'bot'; text: string; time: string; link?: string; linkText?: string }> = [];
  chatPresets = [
    { label: '💼 Are you available for hire?', key: 'avail' },
    { label: '🛠️ What is your tech stack?', key: 'stack' },
    { label: '🚀 Tell me about your CRM project', key: 'crm' },
    { label: '🌍 Are you open to remote work?', key: 'remote' },
    { label: '⏳ What is your notice period?', key: 'notice' },
    { label: '💰 What are your rates / salary?', key: 'rate' }
  ];

  // Paste your Google Gemini API Key here (Free from https://aistudio.google.com/)
  // OR set it in src/assets/config.json as { "geminiApiKey": "your-key" }
  private geminiApiKey = 'YOUR_GEMINI_API_KEY';

  private getSystemPrompt(): string {
    return `You are the professional AI Assistant for Nirmal TR, a Full Stack Developer.
Your goal is to answer questions from potential employers, recruiters, and freelance clients.
Keep your answers highly professional, confident, and polite. Make sure to represent Nirmal accurately.

Here are Nirmal TR's professional details:
- Name: Nirmal TR
- Title: Full Stack Developer / Software Engineer
- Location: Trivandrum, Kerala, India (GMT+5:30)
- Contact Email: nirmaltrejilal@gmail.com
- Phone / WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)
- LinkedIn: https://www.linkedin.com/in/nirmaltr
- GitHub: https://github.com/nirmaltrdev

Experience:
1. Software Engineer at LOGICINFEEL, Trivandrum (Feb 2023 - Present)
   - Built scalable CRM applications using a dual-backend microservices setup (PHP/CodeIgniter 4 & Java/Spring Boot).
   - Integrated extensive 3rd party communication pipelines, including WhatsApp automation campaigns and VoIP call/telephony systems.
   - Designed real-time systems using Socket.IO and Firebase Cloud Messaging (FCM).
   - Designed AWS S3-based file storage and PDF report generation.
   - Led and mentored a team of 2-4 developers.
2. Software Engineer at Bitbridge Technologies, Trivandrum (Jul 2022 - Feb 2023)
   - Developed authentication systems, frontend modules, and integrated REST APIs.

Key Skills:
- Backend: PHP (CodeIgniter 4), Java (Spring Boot), Node.js, REST APIs.
- Frontend: Angular, TypeScript, HTML5, CSS3, Tailwind, JavaScript.
- Databases: MySQL, MongoDB, Database/Schema Design, Query Optimization.
- Integrations: WhatsApp API, VoIP Telephony, AWS, S3, Firebase, Socket.IO, FCM, Git, GitHub.

Featured Projects:
1. Enterprise CRM & Automation Hub: Dual-backend (PHP & Java) CRM featuring real-time Socket.IO chat, direct WhatsApp campaign automation, and VoIP call system integration.
2. Vehicle Inspection & Job Card System: Built with Spring Boot, Angular, Java, MySQL. Feature secure shareable links.
3. WhatsApp Automation Platform: Angular, Node.js. Bulk campaign triggers and live messaging analytics.

Guidelines:
1. Always respond in first-person (e.g., "I built", "My experience") as if representing Nirmal, or refer to yourself as Nirmal's Assistant.
2. Keep replies concise and easy to read. Use bullet points if listing items.
3. If asked about salary or custom contract pricing, invite them to send an email to nirmaltrejilal@gmail.com or fill out the contact form.
4. Do not make up information that is not in the details above. If you don't know the answer, politely ask them to use the contact form to message Nirmal directly.`;
  }

  constructor(
    private fb: FormBuilder,
    private message: NzMessageService,
    private http: HttpClient
  ) { }

  ngOnInit(): void {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required]],
      message: ['', [Validators.required]]
    });

    this.chatMessages = [
      {
        sender: 'bot',
        text: "Hi there! 👋 I am Nirmal's virtual assistant. How can I assist you today? Ask me anything or select a quick option below!",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];

    // Default to dark-theme on body
    if (typeof document !== 'undefined') {
      document.body.classList.add('dark-theme');
    }

    // Load Gemini API Key dynamically from local config.json (Git ignored)
    this.http.get<{ geminiApiKey: string }>('assets/config.json').subscribe({
      next: (config) => {
        if (config && config.geminiApiKey) {
          this.geminiApiKey = config.geminiApiKey;
        }
      },
      error: (err) => {
        console.warn('Could not load assets/config.json, using default fallback responses.', err);
      }
    });

    // Initialize viewport scroll reveal animations
    setTimeout(() => {
      this.initScrollAnimations();
    }, 200);

    // Apply security protections
    this.setupSecurity();
  }

  // ─── Security ─────────────────────────────────────────────────────────────
  private _securityContextMenu = (e: Event) => e.preventDefault();
  private _securityKeydown = (e: KeyboardEvent) => {
    // Block F12
    if (e.key === 'F12') { e.preventDefault(); return; }
    // Block Ctrl+U (View Source)
    if (e.ctrlKey && e.key.toLowerCase() === 'u') { e.preventDefault(); return; }
    // Block Ctrl+S (Save Page)
    if (e.ctrlKey && e.key.toLowerCase() === 's') { e.preventDefault(); return; }
    // Block Ctrl+Shift+I / Ctrl+Shift+J / Ctrl+Shift+C (DevTools)
    if (e.ctrlKey && e.shiftKey && ['i', 'j', 'c'].includes(e.key.toLowerCase())) {
      e.preventDefault(); return;
    }
    // Block Ctrl+P (Print — reveals source structure)
    if (e.ctrlKey && e.key.toLowerCase() === 'p') { e.preventDefault(); return; }
  };
  private _securityDragstart = (e: Event) => e.preventDefault();

  private setupSecurity(): void {
    if (typeof document === 'undefined') return;
    document.addEventListener('contextmenu', this._securityContextMenu, { passive: false });
    document.addEventListener('keydown', this._securityKeydown, { passive: false });
    document.addEventListener('dragstart', this._securityDragstart, { passive: false });
  }

  ngOnDestroy(): void {
    if (typeof document === 'undefined') return;
    document.removeEventListener('contextmenu', this._securityContextMenu);
    document.removeEventListener('keydown', this._securityKeydown);
    document.removeEventListener('dragstart', this._securityDragstart);
  }
  // ──────────────────────────────────────────────────────────────────────────


  toggleTheme(): void {
    this.isLightTheme = !this.isLightTheme;
    if (typeof document !== 'undefined') {
      if (this.isLightTheme) {
        document.body.classList.remove('dark-theme');
        document.body.classList.add('light-theme');
        this.message.info('Switched to Light Mode');
      } else {
        document.body.classList.remove('light-theme');
        document.body.classList.add('dark-theme');
        this.message.info('Switched to Dark Mode');
      }
    }
  }

  toggleChat(): void {
    this.chatOpen = !this.chatOpen;
    if (this.chatOpen) {
      setTimeout(() => this.scrollToChatBottom(), 100);
    }
  }

  openCrispChat(): void {
    this.chatOpen = true;
    setTimeout(() => this.scrollToChatBottom(), 100);
  }

  scrollToChatBottom(): void {
    if (typeof document !== 'undefined') {
      const chatBody = document.getElementById('custom-chat-body');
      if (chatBody) {
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  }

  handlePresetClick(key: string): void {
    if (this.isTyping) return;

    const presetMap: Record<string, string> = {
      avail: 'Are you available for hire?',
      stack: 'What is your tech stack?',
      crm: 'Tell me about your CRM project',
      remote: 'Are you open to remote work?',
      notice: 'What is your notice period?',
      rate: 'What are your rates or expected salary?'
    };

    const question = presetMap[key];
    if (!question) return;

    this.addUserMessage(question);
    this.getBotReply(question);
  }

  addUserMessage(text: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatMessages.push({ sender: 'user', text, time });

    // Memory guard: cap chat history at 50 messages
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50);
    }

    setTimeout(() => this.scrollToChatBottom(), 50);
  }

  sendChatMessage(): void {
    const text = this.chatInputText.trim();
    if (!text || this.isTyping) return;

    // Security: limit message length to prevent Gemini API abuse
    if (text.length > 500) {
      this.message.warning('Message too long. Please keep it under 500 characters.');
      return;
    }

    this.addUserMessage(text);
    this.chatInputText = '';

    this.getBotReply(text);
  }

  getBotReply(userQuestion: string): void {
    this.isTyping = true;
    setTimeout(() => this.scrollToChatBottom(), 50);

    if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
      // Fallback keyword-based response when no valid API key is configured
      setTimeout(() => {
        this.isTyping = false;
        const t = userQuestion.toLowerCase();
        // Helper: word-boundary safe match
        const has = (...words: string[]) => words.some(w => new RegExp(`\\b${w}\\b`).test(t));
        let reply = '';

        // --- Preset: Are you available for hire?
        if (has('available', 'hire', 'hiring', 'open') || t.includes('for hire')) {
          reply = "Yes! I am actively open to full-time roles and freelance/contract projects. 🙌\n\nBest ways to reach me:\n• 📧 Email: nirmaltrejilal@gmail.com\n• 💬 WhatsApp: +91 8138055705\n• 🔗 LinkedIn: linkedin.com/in/nirmaltr\n• 📝 Contact Form on this page";

          // --- Preset: What is your tech stack?
        } else if (has('tech', 'stack', 'skill', 'language', 'framework', 'tools') || t.includes('tech stack')) {
          reply = "Here is my full tech stack:\n\n🔹 Backend: Java (Spring Boot), PHP (CodeIgniter 4), Node.js, REST APIs\n🔹 Frontend: Angular, TypeScript, HTML5, CSS3\n🔹 Databases: MySQL, MongoDB\n🔹 Cloud & Integrations: AWS S3, Firebase, FCM, Socket.IO, WhatsApp API, VoIP\n🔹 Tools: Git, GitHub, Postman, MPDF\n\nCheck out the Skills section for the complete breakdown!";

          // --- Preset: CRM project
        } else if (has('crm') || t.includes('crm work') || t.includes('crm project')) {
          reply = "My flagship project is an Enterprise CRM & Automation Hub: 🏢\n\n• Dual-backend microservices: PHP (CodeIgniter 4) + Java (Spring Boot)\n• Angular frontend with real-time Socket.IO chat\n• WhatsApp API campaign automation & bulk messaging\n• VoIP call/telephony system integration\n• AWS S3 file storage & PDF report generation\n• Led a team of 2–4 developers\n\nIt is a large-scale internal SaaS platform — source is confidential, but happy to discuss architecture!";

          // --- Preset: Remote work
        } else if (has('remote', 'work from home', 'wfh', 'location', 'onsite', 'hybrid') || t.includes('remote work')) {
          reply = "Yes, I am fully open to remote work! 🌍\n\nI am based in Trivandrum, Kerala, India (GMT+5:30) and comfortable working with teams across time zones. I am also open to hybrid or onsite roles in Trivandrum.";

          // --- Preset: Notice period
        } else if (has('notice') || t.includes('notice period') || t.includes('join') || t.includes('start')) {
          reply = "My notice period is typically 30 days. For urgent freelance projects, I can start within a few days depending on scope. 📅\n\nFeel free to reach me at nirmaltrejilal@gmail.com to discuss timelines!";

          // --- Preset: Salary / rate
        } else if (has('salary', 'rate', 'cost', 'price', 'charge', 'budget', 'pay', 'ctc', 'compensation')) {
          reply = "For salary and rate discussions, I prefer a direct conversation to understand the role and scope first. 💬\n\nPlease reach out via:\n• 📧 nirmaltrejilal@gmail.com\n• 📝 Contact Form on this page\n\nI will respond within 24 hours!";

          // --- Experience
        } else if (has('experience', 'years', 'background', 'career') || t.includes('how long')) {
          reply = "I have 4 years of professional experience as a Software Engineer: 🗂️\n\n• LOGICINFEEL, Trivandrum (Feb 2023 – Present): Enterprise CRM, WhatsApp automation, VoIP, real-time systems\n• Bitbridge Technologies, Trivandrum (Jul 2022 – Feb 2023): Auth systems, REST APIs, responsive UI\n\nSee the Experience section for the full timeline!";

          // --- Projects
        } else if (has('project', 'portfolio', 'built', 'developed', 'vehicle', 'inspection', 'whatsapp', 'automation')) {
          reply = "Here are my 3 key projects: 🚀\n\n1️⃣ Enterprise CRM & Automation Hub — Angular, Spring Boot, WhatsApp API, VoIP, Socket.IO\n2️⃣ Vehicle Inspection & Job Card System — Spring Boot, Angular, MySQL, REST APIs\n3️⃣ WhatsApp Automation Platform — Angular, Node.js, Webhooks, bulk campaigns\n\nAll are enterprise-grade internal systems. See the Projects section for details!";

          // --- Angular / Frontend
        } else if (has('angular', 'frontend', 'ui', 'react', 'vue', 'css', 'html', 'typescript') || t.includes('front end') || t.includes('front-end')) {
          reply = "Yes, Angular is one of my primary skills! 🅰️\n\nI have 4 years of Angular experience building large enterprise UIs with TypeScript, reactive forms, routing, state management, and REST API integration. I also work with HTML5, CSS3, and responsive design.";

          // --- Java / Backend
        } else if (has('java', 'spring', 'springboot', 'backend', 'api', 'php', 'node') || t.includes('spring boot') || t.includes('back end') || t.includes('back-end')) {
          reply = "On the backend I work primarily with: ⚙️\n\n• Java + Spring Boot for enterprise microservices\n• PHP + CodeIgniter 4 for CRM backend systems\n• Node.js for automation and webhook workflows\n• REST API design, JWT auth, database integration";

          // --- Education / certifications
        } else if (has('education', 'degree', 'college', 'university', 'certification', 'certified', 'study')) {
          reply = "🎓 B.Tech in Computer Science Engineering — APJ Abdul Kalam Technological University (2021)\n\n📜 Certifications:\n• Java Programming Masterclass (Udemy)\n• AWS Development Tools & Services (AWS)\n• Cybersecurity & IoT (Coursera)\n• Certified Secure Computer User (EC-Council)\n• Google Analytics for Beginners (Google)";

          // --- Contact / connect
        } else if (has('contact', 'email', 'phone', 'reach', 'connect', 'message', 'linkedin')) {
          reply = "Here is how to reach me: 📬\n\n• 📧 Email: nirmaltrejilal@gmail.com\n• 💬 WhatsApp: +91 8138055705\n• 🔗 LinkedIn: linkedin.com/in/nirmaltr\n• 🐙 GitHub: github.com/nirmaltrdev\n• 📝 Contact Form on this page\n\nI typically respond within 24 hours!";

          // --- Resume / CV
        } else if (has('resume', 'cv', 'biodata', 'download')) {
          reply = "You can download my CV/Resume using the \"Download CV\" button in the hero section at the top of this page! 📄";

          // --- Greeting
        } else if (has('hello', 'hey', 'greetings', 'howdy') || t === 'hi' || t.startsWith('hi ') || t.endsWith(' hi')) {
          reply = "Hello there! 👋 I'm Nirmal's virtual assistant.\n\nYou can ask me about his:\n• Skills & tech stack\n• Experience & projects\n• Availability & rates\n• How to get in touch\n\nOr click a quick option below!";

          // --- Default
        } else {
          reply = "Thanks for your message! 🙏 For the best answer, please use the Contact Form or email nirmaltrejilal@gmail.com directly — Nirmal will respond within 24 hours!";
        }

        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.chatMessages.push({ sender: 'bot', text: reply, time });
        setTimeout(() => this.scrollToChatBottom(), 50);
      }, 900);
      return;
    }

    // Call real Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`;

    // Build conversation history for the prompt context
    let historyContext = '';
    const recentMessages = this.chatMessages.slice(-6); // Include last 6 messages for context
    recentMessages.forEach(m => {
      historyContext += `${m.sender === 'user' ? 'User' : 'Assistant'}: ${m.text}\n`;
    });

    const prompt = `${this.getSystemPrompt()}\n\nRecent Conversation History:\n${historyContext}\nAssistant:`;

    const payload = {
      contents: [
        {
          parts: [
            { text: prompt }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.7,
        thinkingConfig: {
          thinkingBudget: 0
        }
      }
    };

    this.http.post(url, payload).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        let botText = '';
        try {
          botText = res.candidates[0].content.parts[0].text.trim();
        } catch (e) {
          botText = "I'm sorry, I encountered an issue processing that. Please try again or message me directly via the contact form!";
        }
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.chatMessages.push({ sender: 'bot', text: botText, time });
        setTimeout(() => this.scrollToChatBottom(), 50);
      },
      error: (err) => {
        this.isTyping = false;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.chatMessages.push({
          sender: 'bot',
          text: "Sorry, I couldn't process that right now. Please reach me directly at nirmaltrejilal@gmail.com or use the Contact Form — I'll respond within 24 hours!",
          time
        });
        setTimeout(() => this.scrollToChatBottom(), 50);
      }
    });
  }

  initScrollAnimations(): void {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target); // Stop observing once animated
          }
        });
      },
      {
        threshold: 0.05,        // Trigger earlier — when only 5% is visible
        rootMargin: '0px 0px 0px 0px'  // No delay — reveal as soon as in viewport
      }
    );

    const animatedElements = document.querySelectorAll('.reveal');
    animatedElements.forEach((el) => observer.observe(el));
  }

  // Scrollspy & Header stickiness
  @HostListener('window:scroll', [])
  onWindowScroll() {
    const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Header effect
    this.scrolled = scrollPosition > 50;

    // Scrollspy logic — includes ALL sections including services & education
    const sections = ['hero', 'about', 'services', 'skills', 'projects', 'experience', 'education', 'github', 'contact'];
    for (const section of sections) {
      const el = document.getElementById(section);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120 && rect.bottom >= 120) {
          this.activeSection = section;
          break;
        }
      }
    }
  }

  toggleDrawer(): void {
    this.drawerVisible = !this.drawerVisible;
  }

  closeDrawer(): void {
    this.drawerVisible = false;
  }

  scrollTo(sectionId: string): void {
    this.activeSection = sectionId;

    // If drawer is open (mobile), close it first and wait for
    // the drawer close animation to finish before scrolling.
    // This prevents the layout shift from cancelling the scroll.
    if (this.drawerVisible) {
      this.drawerVisible = false;
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 320); // matches Ant Design drawer close animation duration
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }


  submitForm(): void {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      const formData = this.contactForm.value;

      // Submit form dynamically using FormSubmit AJAX endpoint
      this.http.post('https://formsubmit.co/ajax/nirmaltrejilal@gmail.com', formData)
        .subscribe({
          next: () => {
            this.message.success('Thank you! Your message has been sent. Nirmal will get in touch with you shortly.', {
              nzDuration: 5000
            });

            // Sync user data to Crisp session
            if (typeof window !== 'undefined' && (window as any).$crisp) {
              try {
                (window as any).$crisp.push(["set", "user:email", [formData.email]]);
                (window as any).$crisp.push(["set", "user:nickname", [formData.name]]);
              } catch (e) {
                console.error('Crisp session profiling error:', e);
              }
            }

            this.contactForm.reset();
            this.isSubmitting = false;
          },
          error: () => {
            this.message.error('Oops! There was a sending issue. Please contact me directly via email or WhatsApp.');
            this.isSubmitting = false;
          }
        });
    } else {
      Object.values(this.contactForm.controls).forEach(control => {
        if (control.invalid) {
          control.markAsDirty();
          control.updateValueAndValidity({ onlySelf: true });
        }
      });
      this.message.error('Please fill in all details correctly so I can reach back.');
    }
  }
}

