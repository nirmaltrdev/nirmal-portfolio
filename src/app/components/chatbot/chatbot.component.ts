import { Component, signal, inject, DestroyRef, afterNextRender, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd/message';
import { timeout, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

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
    { label: '💼 Are you available for hire?', key: 'avail' },
    { label: '🛠️ What is your tech stack?', key: 'stack' },
    { label: '🚀 Tell me about your CRM project', key: 'crm' },
    { label: '📊 Performance Center & KPI', key: 'kpi' },
    { label: '🤖 AI Copilot layer', key: 'ai' },
    { label: '⚡ SQL Optimization (60s → <2s)', key: 'sql' },
    { label: '🚗 Vehicle Inspection System', key: 'vehicle' },
    { label: '📄 Where to download resume?', key: 'resume' },
    { label: '⏳ What is your notice period?', key: 'notice' }
  ];

  private geminiApiKey = 'YOUR_GEMINI_API_KEY';

  constructor() {
    this.chatMessages = [
      {
        sender: 'bot',
        text: "Hi there! 👋 I am Nirmal's AI Assistant. How can I assist you today? Ask me anything about Nirmal's enterprise CRM experience, Spring Boot, AI Copilot, or select a quick option below!",
        time: this.getCurrentTime()
      }
    ];

    // Load Gemini API Key dynamically from local config.json (Git ignored)
    this.http.get<{ geminiApiKey: string }>('assets/config.json').subscribe({
      next: (config) => {
        if (config && config.geminiApiKey) {
          this.geminiApiKey = config.geminiApiKey;
          this.cdr.markForCheck();
        }
      },
      error: (err) => {
        console.warn('Could not load assets/config.json, using default fallback responses.', err);
      }
    });
  }

  toggleChat() {
    this.isOpen.update(v => !v);
    if (this.isOpen()) {
      setTimeout(() => {
        this.scrollToChatBottom();
        this.cdr.markForCheck();
      }, 100);
    }
  }

  getCurrentTime(): string {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
      kpi: 'Tell me about the Performance Center and KPI architecture',
      ai: 'How does the AI Copilot layer work in the CRM?',
      sql: 'Tell me about your SQL optimization achievement',
      vehicle: 'Tell me about the Vehicle Inspection System',
      resume: 'Where can I download your resume?',
      notice: 'What is your notice period?'
    };

    const question = presetMap[key];
    if (!question) return;

    this.addUserMessage(question);
    this.getBotReply(question);
  }

  addUserMessage(text: string): void {
    this.chatMessages.push({ sender: 'user', text, time: this.getCurrentTime() });

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

    if (!this.geminiApiKey || this.geminiApiKey === 'YOUR_GEMINI_API_KEY') {
      // Fallback keyword-based response when no valid API key is configured
      this.getBotReplyFallback(userQuestion);
      return;
    }

    // Call real Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.geminiApiKey}`;

    let historyContext = '';
    const recentMessages = this.chatMessages.slice(-6);
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
        temperature: 0.7
      }
    };

    this.http.post(url, payload).pipe(
      timeout(5000), // Force a timeout after 5 seconds
      catchError(err => {
        return throwError(() => err);
      })
    ).subscribe({
      next: (res: any) => {
        this.isTyping = false;
        let botText = '';
        try {
          botText = res.candidates[0].content.parts[0].text.trim();
        } catch (e) {
          botText = "I'm sorry, I encountered an issue processing that. Please try again or message me directly via the contact form!";
        }
        this.chatMessages.push({ sender: 'bot', text: botText, time: this.getCurrentTime() });
        this.cdr.markForCheck();
        setTimeout(() => {
          this.scrollToChatBottom();
          this.cdr.markForCheck();
        }, 50);
      },
      error: (err) => {
        // If the API call fails or times out, seamlessly fallback to the keyword-based offline responses
        console.warn("Gemini API call failed or timed out, using offline fallback logic...", err);

        let errorMessage = "API Error: " + (err.message || err.statusText || "Unknown Error");
        if (err.error && err.error.error && err.error.error.message) {
          errorMessage = "Google API Error: " + err.error.error.message;
        }

        // Show the actual error so the user knows WHY the real chat isn't working
        this.isTyping = false;
        this.chatMessages.push({ sender: 'bot', text: `⚠️ **Real Chat Disabled**\n\n${errorMessage}\n\nFalling back to offline mode...`, time: this.getCurrentTime() });
        this.cdr.markForCheck();
        setTimeout(() => {
          this.scrollToChatBottom();
          this.getBotReplyFallback(userQuestion);
          this.cdr.markForCheck();
        }, 100);
      }
    });
  }

  private getBotReplyFallback(userQuestion: string): void {
    setTimeout(() => {
      this.isTyping = false;
      const t = userQuestion.toLowerCase();
      const has = (...words: string[]) => words.some(w => new RegExp(`\\b${w}\\b`).test(t));
      let reply = '';

      if (has('available', 'hire', 'hiring', 'open') || t.includes('for hire')) {
        reply = "Yes! I am actively open to full-time roles and high-impact engineering opportunities. 👋\n\nBest ways to reach me:\n• ✉️ Email: nirmaltrejilal@gmail.com\n• 💬 WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)\n• 🔗 LinkedIn: linkedin.com/in/nirmaltr\n• 📝 Contact Form on this page";
      } else if (has('kpi', 'kra') || t.includes('performance center') || t.includes('performance management') || t.includes('goal')) {
        reply = "The Performance Center is an enterprise KPI capability I designed and built within the CRM: 📊\n\n• Configurable N-level organizational hierarchy (Group of Companies → Company → Department/KRA)\n• KPI assignment and goal cascading across organizational units\n• Employee performance tracking and automated score calculation\n• Hierarchical drill-down of performance metrics from executive to individual levels\n\nIt gives leadership transparent, data-driven operational oversight!";
      } else if (has('ai', 'copilot') || t.includes('ai copilot') || t.includes('prompt') || t.includes('gateway') || t.includes('llm')) {
        reply = "I designed and integrated an AI Copilot layer directly on top of the CRM: 🤖\n\n• Modular AI service and gateway architecture\n• Centralized prompt management and dynamic provider routing\n• Customer-facing AI Copilot integrated with CRM customer profiles\n• Generates AI-assisted business insights, customer interaction history, and decision support\n• Seamlessly extends the existing CRM data model!";
      } else if (has('sql', 'query', 'slow', 'latency') || t.includes('optimization') || t.includes('60s') || t.includes('2s') || t.includes('database performance')) {
        reply = "A major database optimization achievement of mine was optimizing slow-running SQL queries across MySQL and MariaDB: ⚡\n\n• Reduced a core CRM search query latency from over 60 seconds to under 2 seconds\n• Removed unnecessary LEFT JOIN operations\n• Restructured complex queries with correlated subqueries\n• Split multi-branch OR conditions into optimized indexable queries\n• Eliminated unindexed function calls on filtered search columns!";
      } else if (has('vehicle', 'inspection') || t.includes('job card') || t.includes('inspection system')) {
        reply = "The Vehicle Inspection System is a companion module I developed using Java Spring Boot: 🚗\n\n• Enables workshop inspectors to conduct digital vehicle inspections and generate job cards\n• Automated PDF report generation with attachment storage\n• Secure externally shareable inspection links protected by time-bound token validation\n• Vehicle owners can review reports securely without exposing internal CRM systems!";
      } else if (has('crm') || t.includes('crm work') || t.includes('crm project') || t.includes('automobile')) {
        reply = "My primary production project is the Enterprise CRM Platform for the Automobile Service Industry: 🏢\n\n• Dual-backend architecture: PHP (CodeIgniter 4) + Java (Spring Boot) + Node.js + Angular\n• Workflows: Lead & potential lead management, appointment scheduling, workshop operations, job cards, quotations, service reminders, customer recall, and lost customer tracking\n• KPI Performance Center & AI Copilot layer\n• AWS S3 cloud storage & MPDF automated reporting pipelines\n• Real-time updates via Socket.IO and push notifications via Firebase FCM\n• Led and mentored a team of 2–4 developers!";
      } else if (has('tech', 'stack', 'skill', 'language', 'framework', 'tools') || t.includes('tech stack')) {
        reply = "Here is my full technical arsenal: 🛠️\n\n• 💻 Frontend: Angular, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS\n• ⚙️ Backend: Java, Spring Boot, Node.js, PHP, CodeIgniter 4, REST APIs, MPDF\n• 💾 Databases: MySQL, MariaDB, MongoDB, Oracle, SQL, Database Design, Query Optimization\n• ☁️ Cloud & Real-Time: AWS, Amazon S3, Firebase, Firebase Cloud Messaging (FCM), Socket.IO, WebSockets\n• 🔒 Security: JWT, OAuth, Role-Based Access Control (RBAC)\n• 📐 Architecture & Tools: Enterprise CRM, System Architecture, Performance Center / KPI, AI Copilot Design, Git, GitHub, Postman, Swagger, Linux, PuTTY\n\nSee the Skills section for the full breakdown!";
      } else if (has('remote', 'work from home', 'wfh', 'location', 'onsite', 'hybrid') || t.includes('remote work')) {
        reply = "Yes, I am fully open to remote work! 🌍\n\nI am based in Thiruvananthapuram, Kerala, India (GMT+5:30) and experienced working with distributed teams across time zones. Also open to hybrid or onsite roles.";
      } else if (has('notice') || t.includes('notice period') || t.includes('join') || t.includes('start')) {
        reply = "My notice period is standard 30 days. For urgent contractual or consulting roles, I can start promptly depending on scope. 📅\n\nFeel free to email me at nirmaltrejilal@gmail.com to discuss timelines!";
      } else if (has('salary', 'rate', 'cost', 'price', 'charge', 'budget', 'pay', 'ctc', 'compensation')) {
        reply = "For salary and compensation discussions, I prefer an initial conversation to understand the scope and role requirements. 💬\n\nPlease reach out via:\n• ✉️ nirmaltrejilal@gmail.com\n• 📝 Contact Form on this page\n\nI will respond within 24 hours!";
      } else if (has('experience', 'years', 'background', 'career') || t.includes('how long')) {
        reply = "I have 4+ years of professional experience as a Software Engineer: 💼\n\n• LogicInfeel, Trivandrum (Feb 2023 – Present): Production Enterprise CRM for automobile service industry, Java Spring Boot vehicle inspection, KPI Performance Center, AI Copilot layer, AWS S3 pipelines, 60s → <2s SQL optimization, mentoring 2–4 devs\n• Bitbridge Technologies, Trivandrum (Jul 2022 – Feb 2023): Authentication systems, reusable Angular components, responsive UI, REST API integration in Agile sprints\n\nSee the Experience section for the complete timeline!";
      } else if (has('project', 'portfolio', 'built', 'developed')) {
        reply = "Here are my key featured projects: 🚀\n\n1. Enterprise CRM System (Automobile Service Industry) — Full lifecycle CRM with lead management, job cards, service reminders, recall tracking, KPI Center & AI Copilot\n2. Vehicle Inspection & Job Card Management System — Java Spring Boot companion system with time-bound expiring token links for secure external report access\n3. CRM AI & Performance Platform — Configurable N-level KPI goal cascading + AI Copilot prompt management & customer profile insights\n\nCheck the Work section for details!";
      } else if (has('angular', 'frontend', 'ui', 'typescript') || t.includes('front end') || t.includes('front-end')) {
        reply = "Yes, Angular is one of my core strengths! 🅰️\n\nI have 4+ years of experience architecting Angular applications with TypeScript, reactive forms, modern routing, state management, modular components, and seamless REST API integration.";
      } else if (has('java', 'spring', 'springboot', 'backend', 'php', 'codeigniter') || t.includes('spring boot') || t.includes('back end') || t.includes('back-end')) {
        reply = "On the backend I specialize in:\n\n• Java & Spring Boot for enterprise microservices, token validation, and inspection systems\n• PHP & CodeIgniter 4 for core enterprise CRM workflows and modules\n• Node.js for real-time webhooks, Socket.IO, and automation services\n• REST API design, JWT/RBAC security, and SQL query optimization";
      } else if (has('education', 'degree', 'college', 'university', 'certification', 'certified', 'study')) {
        reply = "🎓 B.Tech in Computer Science and Engineering — APJ Abdul Kalam Technological University (2021)\n\n📜 Professional Certifications:\n• Java Programming Masterclass — Udemy\n• AWS Development Tools and Services — AWS\n• Cybersecurity and IoT — Coursera\n• Certified Secure Computer User — EC-Council\n• Google Analytics for Beginners — Google\n\n📚 Publication: Healthcare Data Fusion (IJERT, 2021)";
      } else if (has('contact', 'email', 'phone', 'reach', 'connect', 'message', 'linkedin')) {
        reply = "Here is how to contact me: ✉️\n\n• Email: nirmaltrejilal@gmail.com\n• WhatsApp / Phone: +91 8138055705 (Link: https://wa.me/918138055705)\n• LinkedIn: linkedin.com/in/nirmaltr\n• GitHub: github.com/nirmaltrdev\n• Contact Form on this page\n\nI typically respond within 24 hours!";
      } else if (has('resume', 'cv', 'biodata', 'download')) {
        reply = "You can download my resume using the \"Download Resume\" button in the hero section at the top of this page! 📄";
      } else if (has('hello', 'hey', 'greetings', 'howdy') || t === 'hi' || t.startsWith('hi ') || t.endsWith(' hi')) {
        reply = "Hello there! 👋 I'm Nirmal's AI Assistant.\n\nYou can ask me about his:\n• Enterprise CRM architecture\n• Java & Spring Boot vehicle inspection system\n• Performance Center & KPI management\n• AI Copilot layer\n• 60s → <2s SQL optimization achievement\n• Tech stack, experience & availability\n\nOr click a quick option below!";
      } else if (t.includes('who is') || t.includes('who are') || t.includes('about nirmal') || t.includes('summary') || t.includes('overview') || has('everything', 'details', 'about', 'tell', 'who', 'nirmal')) {
        reply = "Here is a quick overview of Nirmal T R: 👨‍💻\n\n• Role: Full Stack Software Engineer with 4+ years experience\n• Core Stack: Angular • Java • Spring Boot • Node.js • PHP/CodeIgniter\n• Current: LogicInfeel, Trivandrum (Feb 2023 – Present)\n• Key Achievements: 60s → <2s SQL search query optimization, Performance Center / KPI architecture, AI Copilot layer, Java Spring Boot Vehicle Inspection System\n• Databases: MySQL, MariaDB, MongoDB, Oracle\n• Cloud & Security: AWS S3, Firebase FCM, Socket.IO, JWT, OAuth, RBAC\n• Education: B.Tech in CSE (2021) | IEEE & CSI Member\n\nFeel free to click any suggested question below or ask anything specific!";
      } else {
        reply = "Thanks for your message! 🙏 For the best answer, please use the Contact Form or email nirmaltrejilal@gmail.com directly — Nirmal will respond within 24 hours!";
      }

      this.chatMessages.push({ sender: 'bot', text: reply, time: this.getCurrentTime() });
      this.cdr.markForCheck();
      setTimeout(() => {
        this.scrollToChatBottom();
        this.cdr.markForCheck();
      }, 50);
    }, 900);
  }

  private getSystemPrompt(): string {
    return `You are the professional AI Assistant for Nirmal T R, a Full Stack Software Engineer.
Your goal is to answer questions from prospective employers, hiring managers, and clients accurately and politely based strictly on Nirmal's resume.
Keep your answers highly professional, confident, and polite. Make sure to represent Nirmal accurately.

Here are Nirmal T R's verified professional details:
- Name: Nirmal T R
- Title: Full Stack Software Engineer
- Positioning: Angular • Java • Spring Boot • Node.js • PHP/CodeIgniter
- Experience: 4+ years of professional experience
- Location: Thiruvananthapuram, Kerala, India (GMT+5:30)
- Contact Email: nirmaltrejilal@gmail.com
- Phone / WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)
- LinkedIn: https://www.linkedin.com/in/nirmaltr
- GitHub: https://github.com/nirmaltrdev
- Portfolio: https://nirmaltr.vercel.app

Professional Experience:
1. Software Engineer — LogicInfeel, Trivandrum, Kerala (Feb 2023 – Present)
   - Architected and developed a production enterprise CRM platform for the automobile service industry, spanning customer management, lead management, potential lead management, appointment scheduling, workshop/service operations, job card management, quotation management, service reminders, customer recall management, and lost customer tracking.
   - Engineered core CRM modules end-to-end using Angular, PHP (CodeIgniter 4), Node.js, MySQL, and MongoDB, and extended select backend modules and integrations using Java, broadening the platform beyond its core PHP stack.
   - Designed and built a Performance Center / KPI capability within the CRM, covering a configurable N-level organizational hierarchy (Group of Companies → Company → Department/KRA), KPI assignment, goal cascading, employee performance tracking, and hierarchical drill-down of performance scores.
   - Designed an AI Copilot layer on top of the existing CRM, including AI service and gateway concepts, prompt management, provider routing, and a customer-facing AI Copilot integrated with the CRM customer profile to support AI-assisted business insights.
   - Developed a Java Spring Boot Vehicle Inspection System integrated with the CRM, including inspection workflows, job card integration, report generation, and secure externally-shareable inspection links protected by time-bound token validation.
   - Integrated third-party services including WhatsApp for customer communication and Firebase Cloud Messaging (FCM) for real-time push notifications, and implemented real-time CRM updates using Socket.IO.
   - Designed an AWS S3-based file storage architecture and built PDF generation/reporting pipelines using MPDF for job cards, quotations, and inspection reports.
   - Designed and documented REST APIs using Postman and Swagger, and implemented JWT-based authentication with role-based access control (RBAC) across CRM modules.
   - Optimized slow-running SQL queries across MySQL and MariaDB — including a core CRM search reduced from over 60 seconds to under 2 seconds — by removing unnecessary LEFT JOIN operations, restructuring queries with correlated subqueries, splitting complex OR conditions, and eliminating unindexed function calls on filtered columns.
   - Took end-to-end ownership of major CRM feature areas from requirement analysis and architecture through development, database design, API integration, testing, deployment, and production support.
   - Led and mentored a team of 2–4 developers, driving code quality and on-time delivery through structured code reviews and technical guidance.
2. Software Engineer — Bitbridge Technologies, Trivandrum, Kerala (Jul 2022 – Feb 2023)
   - Developed authentication systems and reusable frontend modules for web applications.
   - Built responsive user interfaces and integrated REST APIs to connect frontend and backend services.
   - Collaborated closely with backend engineering teams to deliver features on schedule within an Agile workflow.

Technical Skills:
- Frontend: Angular, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
- Backend: Java, Spring Boot, Node.js, PHP, CodeIgniter 4, REST APIs
- Databases: MySQL, MariaDB, MongoDB, Oracle, SQL, Database Design, Query Optimization
- Cloud & Services: AWS, Amazon S3, Firebase, Firebase Cloud Messaging (FCM)
- Real-Time Systems: Socket.IO, WebSockets
- Security: JWT, OAuth, Role-Based Access Control (RBAC)
- Tools & Platforms: Git, GitHub, Postman, Swagger, VS Code, Linux, PuTTY, MPDF
- Architecture & Business: Enterprise CRM, System Architecture, API Integration, Performance Optimization, KPI/Performance Management, AI Copilot Design

Featured Projects:
1. Enterprise CRM System — Automobile Service Industry: Production platform managing the complete customer lifecycle, workshop operations, quotations, customer recall, KPI Performance Center, and AI Copilot.
2. Vehicle Inspection & Job Card Management System: Java Spring Boot companion module with time-bound token validation for secure externally-shareable inspection reports.
3. CRM AI & Performance Platform: Enterprise intelligence platform combining configurable N-level KPI goal cascading and an AI Copilot layer for customer profile insights.

Education & Credentials:
- B.Tech in Computer Science and Engineering — APJ Abdul Kalam Technological University (2021)
- Certifications: Java Programming Masterclass (Udemy), AWS Development Tools and Services (AWS), Cybersecurity and IoT (Coursera), Certified Secure Computer User (EC-Council), Google Analytics for Beginners (Google)
- Publication: Healthcare Data Fusion — Adithya Jayaprakash Pillai, Nirmal T R, Asif Ali, Asni KK (July 2021)
- Memberships: IEEE (Associate Member), CSI (Associate Member)

Guidelines:
1. Always respond in first-person (e.g., "I built", "My experience") as if representing Nirmal, or refer to yourself as Nirmal's Assistant.
2. Keep replies concise and easy to read. Use bullet points if listing items.
3. When asked where to get or download the resume, refer to the "Download Resume" button in the hero section at the top of the page.
4. If asked about salary or custom contract pricing, invite them to send an email to nirmaltrejilal@gmail.com or fill out the contact form.
5. Do not make up information that is not in the details above. If you don't know the answer, politely ask them to use the contact form to message Nirmal directly.`;
  }
}
