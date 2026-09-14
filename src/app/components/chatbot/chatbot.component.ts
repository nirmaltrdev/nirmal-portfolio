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
    { label: '🌍 Are you open to remote work?', key: 'remote' },
    { label: '⏳ What is your notice period?', key: 'notice' },
    { label: '💰 What are your rates / salary?', key: 'rate' }
  ];

  private geminiApiKey = 'YOUR_GEMINI_API_KEY';

  constructor() {
    this.chatMessages = [
      {
        sender: 'bot',
        text: "Hi there! 👋 I am Nirmal's AI Assistant. How can I assist you today? Ask me anything or select a quick option below!",
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
        reply = "Yes! I am actively open to full-time roles and freelance/contract projects. 👋\n\nBest ways to reach me:\n• ✉️ Email: nirmaltrejial@gmail.com\n• 💬 WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)\n• 🔗 LinkedIn: linkedin.com/in/nirmaltr\n• 📝 Contact Form on this page";
      } else if (has('tech', 'stack', 'skill', 'language', 'framework', 'tools') || t.includes('tech stack')) {
        reply = "Here is my full tech stack:\n\n• 🛠️ Backend: Java (Spring Boot), PHP (CodeIgniter 4), Node.js, REST APIs, MPDF\n• 💻 Frontend: Angular, TypeScript, HTML5, CSS3, Tailwind CSS\n• 💾 Databases: MySQL, Oracle, MariaDB, MongoDB, Schema Design, Query Optimization\n• ☁️ Cloud, Security & Tools: AWS S3, Firebase (FCM), Socket.IO, WebSockets, JWT, OAuth, RBAC, Git, GitHub, Postman, Swagger, Linux, PuTTY\n\nCheck out the Skills section for the complete breakdown!";
      } else if (has('crm') || t.includes('crm work') || t.includes('crm project')) {
        reply = "My flagship project is the Enterprise CRM Platform for the Automobile Service Industry: 🏢\n\n• Modular architecture: PHP (CodeIgniter 4) + Java (Spring Boot)\n• Angular frontend with real-time Socket.IO updates and FCM notifications\n• Workflows: Lead intake, appointment scheduling, workshop operations, job cards, vehicle inspection, quotations\n• Retention features: Customer recall management, lost customer tracking, service reminders\n• AWS S3 file storage & MPDF automated reporting\n• Led and mentored a team of 2–4 developers\n\nHappy to discuss architecture in detail!";
      } else if (has('remote', 'work from home', 'wfh', 'location', 'onsite', 'hybrid') || t.includes('remote work')) {
        reply = "Yes, I am fully open to remote work! 🌍\n\nI am based in Thiruvananthapuram, Kerala, India (GMT+5:30) and comfortable working with teams across time zones. I am also open to hybrid or onsite roles.";
      } else if (has('notice') || t.includes('notice period') || t.includes('join') || t.includes('start')) {
        reply = "My notice period is typically 30 days. For urgent freelance projects, I can start within a few days depending on scope. 📅\n\nFeel free to reach me at nirmaltrejilal@gmail.com to discuss timelines!";
      } else if (has('salary', 'rate', 'cost', 'price', 'charge', 'budget', 'pay', 'ctc', 'compensation')) {
        reply = "For salary and rate discussions, I prefer a direct conversation to understand the role and scope first. 💬\n\nPlease reach out via:\n• ✉️ nirmaltrejilal@gmail.com\n• 📝 Contact Form on this page\n\nI will respond within 24 hours!";
      } else if (has('experience', 'years', 'background', 'career') || t.includes('how long')) {
        reply = "I have 4+ years of professional experience as a Software Engineer: 💼\n\n• LogicInfeel, Trivandrum (Feb 2023 – Present): Enterprise CRM for automobile service industry, Spring Boot vehicle inspection, AWS S3, MPDF, real-time systems, team mentoring (2–4 devs)\n• Bitbridge Technologies, Trivandrum (Jul 2022 – Feb 2023): Auth systems, REST APIs, reusable UI components, Agile sprints\n\nSee the Experience section for the full timeline!";
      } else if (has('project', 'portfolio', 'built', 'developed', 'vehicle', 'inspection', 'whatsapp', 'automation')) {
        reply = "Here are my key projects: 🚀\n\n1. Enterprise CRM Platform (Automobile Service Industry) — Angular, PHP (CI4), Spring Boot, MySQL, MongoDB, Socket.IO, S3\n2. Vehicle Inspection & Job Card System — Java Spring Boot, REST APIs, time-bound token validation for external report sharing\n3. WhatsApp Automation & Messaging Engine — Angular, Node.js, Webhooks, automated campaigns\n\nSee the Projects section for details!";
      } else if (has('angular', 'frontend', 'ui', 'react', 'vue', 'css', 'html', 'typescript') || t.includes('front end') || t.includes('front-end')) {
        reply = "Yes, Angular is one of my primary skills! 🅰️\n\nI have 4 years of Angular experience building UIs with TypeScript, reactive forms, routing, state management, and REST API integration. I also work with HTML5, CSS3, and responsive design.";
      } else if (has('java', 'spring', 'springboot', 'backend', 'api', 'php', 'node') || t.includes('spring boot') || t.includes('back end') || t.includes('back-end')) {
        reply = "On the backend I work primarily with:\n\n• Java + Spring Boot for enterprise microservices\n• PHP + CodeIgniter 4 for CRM backend systems\n• Node.js for automation and webhook workflows\n• REST API design, JWT auth, database integration";
      } else if (has('education', 'degree', 'college', 'university', 'certification', 'certified', 'study')) {
        reply = "🎓 B.Tech in Computer Science Engineering — APJ Abdul Kalam Technological University (2021)\n\n📜 Certifications:\n• Java Programming Masterclass (Udemy)\n• AWS Development Tools & Services (AWS)\n• Cybersecurity & IoT (Coursera)\n• Certified Secure Computer User (EC-Council)\n• Google Analytics for Beginners (Google)";
      } else if (has('contact', 'email', 'phone', 'reach', 'connect', 'message', 'linkedin')) {
        reply = "Here is how to reach me: ✉️\n\n• Email: nirmaltrejial@gmail.com\n• WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)\n• LinkedIn: linkedin.com/in/nirmaltr\n• GitHub: github.com/nirmaltrdev\n• Contact Form on this page\n\nI typically respond within 24 hours!";
      } else if (has('resume', 'cv', 'biodata', 'download')) {
        reply = "You can download my CV/Resume using the \"Download CV\" button in the hero section at the top of this page! 📄";
      } else if (has('hello', 'hey', 'greetings', 'howdy') || t === 'hi' || t.startsWith('hi ') || t.endsWith(' hi')) {
        reply = "Hello there! 👋 I'm Nirmal's AI Assistant.\n\nYou can ask me about his:\n• Skills & tech stack\n• Experience & projects\n• Availability & rates\n• How to get in touch\n\nOr click a quick option below!";
      } else if (t.includes('what else') || t.includes('what can') || t.includes('capabilities') || t.includes('overview') || has('everything', 'details', 'about', 'tell', 'who', 'nirmal')) {
        reply = "Here's a quick overview of Nirmal T R: 👨‍💻\n\n• Role: Full Stack Software Engineer with 4+ years experience\n• Current: LogicInfeel, Trivandrum (Feb 2023–Present)\n• Frontend: Angular, TypeScript, HTML5, CSS3, Tailwind CSS\n• Backend: Java (Spring Boot), PHP (CodeIgniter 4), Node.js, REST APIs, MPDF\n• Databases: MySQL, Oracle, MariaDB, MongoDB\n• Cloud & Security: AWS S3, Firebase (FCM), Socket.IO, WebSockets, JWT, OAuth, RBAC\n• Key Projects: Enterprise CRM (Automobile Service), Vehicle Inspection System, WhatsApp Automation Engine\n• Publication: Healthcare Data Fusion (IJERT, 2021)\n\nFeel free to click the options below or ask anything specific!";
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
    return `You are the professional AI Assistant for Nirmal T R, a Full Stack Developer.
Your goal is to answer questions from potential employers, recruiters, and freelance clients.
Keep your answers highly professional, confident, and polite. Make sure to represent Nirmal accurately.

Here are Nirmal T R's professional details:
- Name: Nirmal T R
- Title: Full Stack Software Engineer
- Location: Thiruvananthapuram, Kerala, India (GMT+5:30)
- Contact Email: nirmaltrejilal@gmail.com
- Phone / WhatsApp: +91 8138055705 (Link: https://wa.me/918138055705)
- LinkedIn: https://www.linkedin.com/in/nirmaltr
- GitHub: https://github.com/nirmaltrdev
- Portfolio: https://nirmaltr.vercel.app

Experience:
1. Software Engineer at LogicInfeel, Trivandrum (Feb 2023 – Present)
   - Architected and developed a full-scale Enterprise CRM platform for the automobile service industry (lead intake, appointment scheduling, workshop operations, job card management, vehicle inspection, service reminders, quotations).
   - Designed and implemented a Vehicle Inspection System using Java Spring Boot with time-bound token validation for secure shareable inspection reports.
   - Built customer recall management, lost customer tracking, dashboards, and analytics.
   - Integrated WhatsApp communication, Firebase Cloud Messaging (FCM) push notifications, and Socket.IO real-time updates.
   - Designed AWS S3 file storage architecture and MPDF reporting pipelines for job cards, quotations, and inspection reports.
   - Implemented JWT-based authentication with Role-Based Access Control (RBAC) and documented REST APIs with Postman and Swagger.
   - Led and mentored a team of 2–4 developers, conducting code reviews and driving on-time delivery.
2. Software Engineer at Bitbridge Technologies, Trivandrum (Jul 2022 – Feb 2023)
   - Developed authentication systems and reusable frontend modules with Angular and TypeScript.
   - Connected responsive user interfaces with backend REST APIs within an Agile workflow.

Key Skills:
- Frontend: Angular, TypeScript, JavaScript, HTML5, CSS3, Tailwind CSS
- Backend: PHP (CodeIgniter 4), Node.js, Java, Spring Boot, REST APIs, MPDF
- Databases: MySQL, Oracle, MariaDB, MongoDB, Schema Design, Query Optimization
- Cloud, Security & Tools: AWS, Amazon S3, Firebase, FCM, Socket.IO, WebSockets, JWT, OAuth, RBAC, Git, GitHub, Postman, Swagger, Linux, PuTTY

Featured Projects:
1. Enterprise CRM Platform — Automobile Service Industry: Comprehensive CRM handling full lifecycle operations and customer retention workflows.
2. Vehicle Inspection & Job Card System: Java Spring Boot system with secure expiring link access for vehicle inspection reports.
3. WhatsApp Automation & Messaging Engine: Communication engine integrated into the CRM ecosystem for notifications and automated customer workflows.

Memberships & Credentials:
- B.Tech in Computer Science and Engineering — APJ Abdul Kalam Technological University (2021)
- IEEE — Associate Member
- CSI — Associate Member
- Publication: Healthcare Data Fusion (IJERT, 2021)

Guidelines:
1. Always respond in first-person (e.g., "I built", "My experience") as if representing Nirmal, or refer to yourself as Nirmal's Assistant.
2. Keep replies concise and easy to read. Use bullet points if listing items.
3. If asked about salary or custom contract pricing, invite them to send an email to nirmaltrejial@gmail.com or fill out the contact form.
4. Do not make up information that is not in the details above. If you don't know the answer, politely ask them to use the contact form to message Nirmal directly.`;
  }
}
