import { Component, OnInit, HostListener } from '@angular/core';
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
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
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
      doi: '10.17577/IJERTCONV9IS13031'
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
    { label: '🚀 Tell me about your CRM work', key: 'crm' }
  ];

  // Paste your Google Gemini API Key here (Free from https://aistudio.google.com/)
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
  }

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

    let question = '';

    if (key === 'avail') {
      question = 'Are you available for hire?';
    } else if (key === 'stack') {
      question = 'What is your tech stack?';
    } else if (key === 'crm') {
      question = 'Tell me about your CRM work';
    }

    this.addUserMessage(question);
    this.getBotReply(question);
  }

  addUserMessage(text: string): void {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.chatMessages.push({ sender: 'user', text, time });
    setTimeout(() => this.scrollToChatBottom(), 50);
  }

  sendChatMessage(): void {
    const text = this.chatInputText.trim();
    if (!text || this.isTyping) return;

    this.addUserMessage(text);
    this.chatInputText = '';

    this.getBotReply(text);
  }

  getBotReply(userQuestion: string): void {
    this.isTyping = true;
    setTimeout(() => this.scrollToChatBottom(), 50);

    if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
      // Fallback keyword-based response if API key is not configured
      setTimeout(() => {
        this.isTyping = false;
        const lowerText = userQuestion.toLowerCase();
        let reply = '';
        if (lowerText.includes('resume') || lowerText.includes('cv') || lowerText.includes('biodata')) {
          reply = "You can download my CV/Resume directly using the button in the main Hero section of this website!";
        } else if (lowerText.includes('experience') || lowerText.includes('work') || lowerText.includes('job') || lowerText.includes('company')) {
          reply = "I currently work as a Software Engineer at LOGICINFEEL, building enterprise SaaS apps. Check out my full timeline in the 'Experience' section of the site!";
        } else if (lowerText.includes('github') || lowerText.includes('projects') || lowerText.includes('portfolio') || lowerText.includes('code')) {
          reply = "I maintain active open-source projects on GitHub! You can view my featured works in the 'Projects' section, or check my profile at github.com/nirmaltrdev.";
        } else if (lowerText.includes('email') || lowerText.includes('contact') || lowerText.includes('phone') || lowerText.includes('whatsapp') || lowerText.includes('hire')) {
          reply = "You can contact me directly via email at nirmaltrejilal@gmail.com or call/message me on WhatsApp at +91 8138055705. Alternatively, just fill out the Contact Form below!";
        } else if (lowerText.includes('hello') || lowerText.includes('hi') || lowerText.includes('hey') || lowerText.includes('greetings')) {
          reply = "Hello there! 👋 Let me know if you have any questions about my full-stack capabilities, recent projects, or availability!";
        } else {
          reply = "Thanks for the message! (Note: Connect your free Gemini API key in app.component.ts to unlock full smart AI answers). For direct inquiries, feel free to fill in the Contact Form or reach me at nirmaltrejilal@gmail.com.";
        }
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.chatMessages.push({ sender: 'bot', text: reply, time });
        setTimeout(() => this.scrollToChatBottom(), 50);
      }, 1000);
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
        console.error('Gemini API Error:', err);
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        this.chatMessages.push({
          sender: 'bot',
          text: "I'm having trouble connecting to my AI brain right now. Please feel free to email me at nirmaltrejilal@gmail.com or use the contact form!",
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
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
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

    // Scrollspy logic
    const sections = ['hero', 'about', 'skills', 'projects', 'experience', 'github', 'contact'];
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

