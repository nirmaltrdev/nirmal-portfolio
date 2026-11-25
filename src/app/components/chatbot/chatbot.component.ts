import { Component, signal, inject, DestroyRef, afterNextRender, ChangeDetectorRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { timeout } from 'rxjs/operators';

/** Server-side proxy to Gemini (api/chat.js). The API key never reaches the browser. */
const CHAT_API_URL = '/api/chat';
/** A little longer than the function's own 9 s upstream timeout. */
const CHAT_API_TIMEOUT_MS = 12000;

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.component.html',
  styleUrls: ['./chatbot.component.css']
})
export class ChatbotComponent {
  private http = inject(HttpClient);
  private message = inject(NzMessageService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);

  isOpen = signal(false);
  isTyping = false;
  presetsCollapsed = false;
  chatInputText = '';

  chatMessages: Array<{ sender: 'user' | 'bot'; text: string; time: string }> = [];

  chatPresets = [
    { label: 'How can I contact you?', key: 'avail', icon: 'fa-solid fa-envelope' },
    { label: 'What is your tech stack?', key: 'stack', icon: 'fa-solid fa-code' },
    { label: 'Tell me about your CRM project', key: 'crm', icon: 'fa-solid fa-briefcase' },
    { label: 'Which platforms have you integrated?', key: 'integrations', icon: 'fa-solid fa-plug' },
    { label: 'Deployment & production support', key: 'deploy', icon: 'fa-solid fa-server' },
    { label: 'SQL Optimization (60s → <2s)', key: 'sql', icon: 'fa-solid fa-bolt' },
    { label: 'Vehicle Inspection System', key: 'vehicle', icon: 'fa-solid fa-car' },
    { label: 'Where to download resume?', key: 'resume', icon: 'fa-solid fa-file-arrow-down' }
  ];

  /** Max chips shown at once; already-asked presets rotate out so new ones appear. */
  private readonly maxVisiblePresets = 4;
  private askedPresets = new Set<string>();

  get visiblePresets() {
    const unasked = this.chatPresets.filter(p => !this.askedPresets.has(p.key));
    return (unasked.length ? unasked : this.chatPresets).slice(0, this.maxVisiblePresets);
  }

  /**
   * Set when /api/chat is missing or not configured (e.g. plain `ng serve` without `vercel dev`,
   * or no GEMINI_API_KEY): the rest of the visit uses the offline replies without retrying.
   */
  private chatApiUnavailable = false;

  constructor() {
    this.chatMessages = [
      {
        sender: 'bot',
        text: "Hi there! 👋 I am Nirmal's AI Assistant. How can I assist you today? Ask me anything about Nirmal's PHP and CodeIgniter 4 CRM work, third-party integrations, deployment on AWS EC2, or select a quick option below!",
        time: this.getCurrentTime()
      }
    ];

    // Mobile keyboard handling: keep the panel (and its input) inside the visible viewport.
    afterNextRender(() => {
      const vv = window.visualViewport;
      if (!vv) return;
      const update = () => {
        const root = document.documentElement;
        const keyboardOffset = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
        root.style.setProperty('--chat-vvh', `${vv.height}px`);
        root.style.setProperty('--chat-kb', `${keyboardOffset}px`);
      };
      update();
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
      this.destroyRef.onDestroy(() => {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      });
    });
  }

  /** Escape closes the panel and returns focus to the chat button. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.isOpen()) this.toggleChat();
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    if (!this.isOpen()) {
      // Return focus to the launcher so keyboard users are not dropped at the top of the page
      setTimeout(() => document.querySelector<HTMLElement>('.chat-toggle-btn')?.focus(), 0);
    }
    if (this.isOpen()) {
      setTimeout(() => {
        // Put the cursor in the message box (desktop); on touch devices this would pop the keyboard
        if (window.matchMedia('(hover: hover)').matches) {
          document.querySelector<HTMLInputElement>('.chat-input-wrapper input')?.focus({ preventScroll: true });
        }
        // Before the first question, keep the greeting in view from its top; afterwards show the latest message.
        if (this.chatMessages.some(m => m.sender === 'user')) {
          this.scrollToChatBottom();
        } else {
          this.scrollToChatTop();
        }
        this.cdr.markForCheck();
      }, 100);
    }
  }

  togglePresets(): void {
    this.presetsCollapsed = !this.presetsCollapsed;
    this.cdr.markForCheck();
    if (!this.presetsCollapsed) {
      setTimeout(() => {
        this.scrollToChatBottom();
        this.cdr.markForCheck();
      }, 50);
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  scrollToChatTop(): void {
    if (typeof document !== 'undefined') {
      const chatBody = document.getElementById('custom-chat-body');
      if (chatBody) {
        chatBody.scrollTop = 0;
      }
    }
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
      avail: 'How can I contact you?',
      stack: 'What is your tech stack?',
      crm: 'Tell me about your CRM project',
      integrations: 'Which platforms have you integrated?',
      deploy: 'Tell me about your deployment and production support work',
      sql: 'Tell me about your SQL optimization achievement',
      vehicle: 'Tell me about the Vehicle Inspection System',
      resume: 'Where can I download your resume?'
    };

    const question = presetMap[key];
    if (!question) return;

    this.askedPresets.add(key);
    this.addUserMessage(question);
    this.getBotReply(question);
  }

  addUserMessage(text: string): void {
    this.chatMessages.push({ sender: 'user', text, time: this.getCurrentTime() });
    // Hide the suggestion chips once the visitor asks something; the toggle near the input brings them back.
    this.presetsCollapsed = true;

    // Memory guard: cap chat history at 50 messages
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50);
    }

    this.cdr.markForCheck();
    setTimeout(() => {
      this.scrollToChatBottom();
      this.cdr.markForCheck();
    }, 50);
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
    this.cdr.markForCheck();
    setTimeout(() => {
      this.scrollToChatBottom();
      this.cdr.markForCheck();
    }, 50);

    if (this.chatApiUnavailable) {
      this.getBotReplyFallback(userQuestion);
      return;
    }

    // Last 6 messages (same window as before); the server builds the Gemini prompt
    const messages = this.chatMessages.slice(-6).map(m => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      text: m.text
    }));

    this.http.post<{ reply?: string }>(CHAT_API_URL, { messages }).pipe(
      timeout(CHAT_API_TIMEOUT_MS)
    ).subscribe({
      next: (res) => {
        const botText = typeof res?.reply === 'string' ? res.reply.trim() : '';
        if (!botText) {
          this.getBotReplyFallback(userQuestion);
          return;
        }
        this.isTyping = false;
        this.chatMessages.push({ sender: 'bot', text: botText, time: this.getCurrentTime() });
        this.cdr.markForCheck();
        setTimeout(() => {
          this.scrollToChatBottom();
          this.cdr.markForCheck();
        }, 50);
      },
      error: (err: unknown) => {
        // Function missing (404/405), not configured (503) or unreachable (status 0): stop trying for this visit.
        // Rate limits (429), timeouts and upstream errors: just answer offline this time.
        const status = err instanceof HttpErrorResponse ? err.status : -1;
        if ([0, 404, 405, 503].includes(status)) this.chatApiUnavailable = true;
        this.getBotReplyFallback(userQuestion);
      }
    });
  }

  private getBotReplyFallback(userQuestion: string): void {
    setTimeout(() => {
      this.isTyping = false;
      const t = userQuestion.toLowerCase();
      const has = (...words: string[]) => words.some(w => new RegExp(`\\b${w}\\b`).test(t));
      let reply = '';

      if (has('available', 'hire', 'hiring', 'open', 'contact', 'email', 'phone', 'reach', 'connect', 'linkedin') || t.includes('for hire')) {
        reply = "Thanks for your interest! 👋 The best ways to reach me directly:\n\n• ✉️ Email: nirmaltrejilal@gmail.com\n• 📞 Phone / WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)\n• 🔗 LinkedIn: linkedin.com/in/nirmaltr\n• 💻 GitHub: github.com/nirmaltrdev\n• 📝 Contact Form on this page";
      } else if (has('sql', 'query', 'slow', 'latency') || t.includes('optimization') || t.includes('60s') || t.includes('2s') || t.includes('database performance')) {
        reply = "I reduced a core CRM search query from over 60 seconds to under 2 seconds (over 95% faster) through SQL query optimization: ⚡\n\n• Removed unnecessary LEFT JOINs\n• Split complex OR conditions\n• Removed unindexed function calls on filtered columns";
      } else if (has('whatsapp', 'integration', 'integrations', 'integrated', 'openai', 'yeastar', 'pbx', 'firebase', 'fcm', 'platforms', 'curl')) {
        reply = "I integrated 5 external platforms into one CRM over PHP cURL: 🔌\n\n• WhatsApp Cloud API (messaging, templates, webhooks)\n• Firebase Cloud Messaging with Google OAuth2\n• AWS S3 media storage\n• OpenAI (AI-powered chat summaries and lead scoring)\n• Yeastar PBX (call-center integration)\n\nI also built an automated WhatsApp bulk messaging engine that runs every minute through Linux cron, with throttling and error handling.";
      } else if (has('deploy', 'deployment', 'linux', 'ec2', 'apache', 'cron', 'server', 'servers', 'hosting', 'production') || t.includes('production support')) {
        reply = "Deployment and production support: 🐧\n\n• Deploy and support backend releases on Linux-based AWS EC2 servers using SSH (PuTTY) and FileZilla\n• Manage separate live and test environments and environment-specific configuration\n• Configured Apache mod_rewrite rules for front-controller routing, canonical redirects and JWT Authorization header handling\n• Built scheduled background jobs with CodeIgniter Spark commands run by Linux cron\n• Restore MySQL backups and troubleshoot differences between production, test and local environments";
      } else if (has('vehicle', 'inspection') || t.includes('job card') || t.includes('inspection system')) {
        reply = "The Vehicle Inspection and Job Card Management System is a Java Spring Boot companion module to the CRM: 🚗\n\n• Lets inspectors create inspection reports linked to job cards, generate PDF reports and share them externally\n• Time-bound token validation so shared report links expire without exposing the rest of the CRM\n• Integrated S3 file storage and job card data with the CRM backend through secure REST APIs";
      } else if (has('crm') || t.includes('crm work') || t.includes('crm project') || t.includes('automobile')) {
        reply = "My main project is an Enterprise CRM for Automobile Service Centers (UAE), used daily by service centers in Abu Dhabi and Dubai: 🏢\n\n• Stack: PHP, CodeIgniter 4, MySQL, Angular 15, TypeScript, REST APIs, AWS EC2, AWS S3, Apache, Linux, Socket.IO\n• Full customer cycle: customer management, lead intake, appointments, workshop operations and job cards, quotations, follow-up and customer retention\n• Retention: service reminders, customer recall, lost customer tracking, WhatsApp campaigns and bulk messaging\n• Real-time WhatsApp chat with Socket.IO, Firebase push notifications, Yeastar PBX call-center integration, OpenAI chat summaries and lead scoring, dashboards and PDF reporting\n• Runs as two production environments with a shared core and region-specific modules";
      } else if (has('tech', 'stack', 'skill', 'skills', 'language', 'framework', 'tools') || t.includes('tech stack')) {
        reply = "Here is my technical stack: 🛠️\n\n• Backend: PHP (7.4 / 8.0), CodeIgniter 4, REST APIs, JSON, cURL, Java, Spring Boot, Node.js\n• Databases: MySQL, MariaDB, MongoDB, database design, complex SQL, query optimization, migrations, backup and restore\n• Web Server & Hosting: Apache (mod_rewrite, .htaccess), Linux, AWS EC2, AWS S3, cron jobs, SSH (PuTTY), FileZilla\n• Frontend: Angular 15, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS, NgRx\n• Integrations: WhatsApp Cloud API and webhooks, Firebase Cloud Messaging, OpenAI API, Yeastar PBX, Socket.IO, WebSockets\n• Security: JWT, OAuth, role-based access control, CORS, IP allow-listing, secure file upload validation\n• Tools: Git, GitHub, Postman, PHPUnit, PHPStan, MySQL Workbench, XAMPP, VS Code, mPDF\n\nSee the Skills section for the full breakdown!";
      } else if (has('location', 'based', 'located') || t.includes('where are you')) {
        reply = "I am based in Thiruvananthapuram, Kerala, India. 📍\n\nFor anything else about a role, please reach out via the contact form or email nirmaltrejilal@gmail.com.";
      } else if (has('salary', 'rate', 'cost', 'price', 'charge', 'budget', 'pay', 'ctc', 'compensation', 'notice', 'remote', 'hybrid', 'onsite', 'relocate')) {
        reply = "That is best discussed directly. 💬\n\nPlease reach out via:\n• ✉️ nirmaltrejilal@gmail.com\n• 📝 Contact Form on this page";
      } else if (has('experience', 'years', 'background', 'career') || t.includes('how long')) {
        reply = "I have 4+ years of experience: 💼\n\n• Software Engineer, LogicInfeel, Trivandrum (Feb 2023 – Present): develop, deploy and support the company's main production CRM for a UAE automobile dealer group. CodeIgniter 4 REST API backend, MySQL, third-party integrations, AWS EC2 deployments, Apache, cron jobs, and mentoring 2–4 developers\n• Software Engineer, Bitbridge Technologies, Trivandrum (Jul 2022 – Feb 2023): authentication systems, reusable frontend modules, responsive UIs and REST API integration in an Agile workflow\n\nSee the Experience section for the complete timeline!";
      } else if (has('project', 'projects', 'portfolio', 'built', 'developed')) {
        reply = "Here are my key projects: 🚀\n\n1. Enterprise CRM for Automobile Service Centers (UAE): production CRM used daily in Abu Dhabi and Dubai, built with PHP, CodeIgniter 4, MySQL and Angular 15\n2. Vehicle Inspection and Job Card Management System: Java Spring Boot companion module with time-bound token validation for shared report links\n\nCheck the Work section for details!";
      } else if (has('angular', 'frontend', 'ui', 'typescript') || t.includes('front end') || t.includes('front-end')) {
        reply = "On the frontend I work with Angular 15, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS and NgRx. 🅰️\n\nThe CRM's CodeIgniter 4 REST API returns JSON to an Angular 15 frontend.";
      } else if (has('java', 'spring', 'springboot', 'backend', 'php', 'codeigniter') || t.includes('spring boot') || t.includes('back end') || t.includes('back-end')) {
        reply = "On the backend: ⚙️\n\n• PHP (7.4 / 8.0) and CodeIgniter 4: built and maintain the CRM's REST API backend on MySQL, returning JSON, tested and documented with Postman\n• JWT authentication, role-based access control, IP allow-listing, CORS, file upload validation and a user activity audit log\n• Java and Spring Boot: the Vehicle Inspection companion module\n• Also skilled in Node.js";
      } else if (has('education', 'degree', 'college', 'university', 'certification', 'certified', 'study')) {
        reply = "🎓 B.Tech in Computer Science and Engineering, APJ Abdul Kalam Technological University (2021)\n\n📜 Certifications:\n• AWS Development Tools and Services, AWS\n• Java Programming Masterclass, Udemy\n• Certified Secure Computer User, EC-Council\n• Cybersecurity and IoT, Coursera\n• Google Analytics for Beginners, Google\n\n📚 Publication: Healthcare Data Fusion (July 2021)\n🏛️ Memberships: IEEE and CSI (Associate Member)";
      } else if (has('resume', 'cv', 'biodata', 'download')) {
        reply = "You can download my resume using the \"Download Resume\" button in the hero section at the top of this page! 📄";
      } else if (has('hello', 'hey', 'greetings', 'howdy') || t === 'hi' || t.startsWith('hi ') || t.endsWith(' hi')) {
        reply = "Hello there! 👋 I'm Nirmal's AI Assistant.\n\nYou can ask me about his:\n• Enterprise CRM for automobile service centers\n• PHP, CodeIgniter 4 and MySQL work\n• WhatsApp, Firebase, AWS S3, OpenAI and Yeastar PBX integrations\n• Deployment on Linux-based AWS EC2 servers\n• 60s → <2s SQL optimization\n• Java Spring Boot vehicle inspection module\n\nOr click a quick option below!";
      } else if (t.includes('who is') || t.includes('who are') || t.includes('about nirmal') || t.includes('summary') || t.includes('overview') || has('everything', 'details', 'about', 'tell', 'who', 'nirmal')) {
        reply = "Here is a quick overview of Nirmal T R: 👨‍💻\n\n• Role: PHP Application Developer | Full Stack Software Engineer, 4+ years of experience\n• Current: Software Engineer, LogicInfeel, Trivandrum (Feb 2023 – Present)\n• Core stack: PHP, CodeIgniter 4, MySQL, REST APIs, Angular 15, AWS EC2, AWS S3, Apache, Linux\n• Key achievements: core CRM search from over 60s to under 2s, 5 platforms integrated into one CRM, WhatsApp bulk messaging engine on Linux cron, mentored 2–4 developers\n• Education: B.Tech in CSE (2021) | IEEE & CSI Associate Member\n\nFeel free to click any suggested question below or ask anything specific!";
      } else {
        reply = "Thanks for your message! 🙏 For the best answer, please use the Contact Form or email nirmaltrejilal@gmail.com directly.";
      }

      this.chatMessages.push({ sender: 'bot', text: reply, time: this.getCurrentTime() });
      this.cdr.markForCheck();
      setTimeout(() => {
        this.scrollToChatBottom();
        this.cdr.markForCheck();
      }, 50);
    }, 900);
  }
}
