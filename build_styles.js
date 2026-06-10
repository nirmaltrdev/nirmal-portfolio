const fs = require('fs');

// Read the restored original global styles
const globalStyles = fs.readFileSync('src/styles.css', 'utf8');

// Read the component-level CSS (all layout rules)
const componentCss = fs.readFileSync('src/app/app.component.css', 'utf8');

// Premium enhancement CSS to append at the end
const premiumEnhancements = `

/* ═══════════════════════════════════════════════════════════
   PREMIUM ANIMATIONS & MICRO-INTERACTIONS ENHANCEMENT
   ═══════════════════════════════════════════════════════════ */

/* ─── Staggered Scroll Reveal for Grid Children ─── */
.reveal.revealed .skill-category-card,
.reveal.revealed .service-card,
.reveal.revealed .project-card,
.reveal.revealed .cert-item,
.reveal.revealed .contact-method-card {
  opacity: 0;
  animation: staggerFadeUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.reveal.revealed .skill-category-card:nth-child(1),
.reveal.revealed .service-card:nth-child(1),
.reveal.revealed .project-card:nth-child(1) { animation-delay: 0.05s; }

.reveal.revealed .skill-category-card:nth-child(2),
.reveal.revealed .service-card:nth-child(2),
.reveal.revealed .project-card:nth-child(2) { animation-delay: 0.15s; }

.reveal.revealed .skill-category-card:nth-child(3),
.reveal.revealed .service-card:nth-child(3),
.reveal.revealed .project-card:nth-child(3) { animation-delay: 0.25s; }

.reveal.revealed .skill-category-card:nth-child(4) { animation-delay: 0.35s; }

.reveal.revealed .cert-item:nth-child(1) { animation-delay: 0.05s; }
.reveal.revealed .cert-item:nth-child(2) { animation-delay: 0.12s; }
.reveal.revealed .cert-item:nth-child(3) { animation-delay: 0.19s; }
.reveal.revealed .cert-item:nth-child(4) { animation-delay: 0.26s; }
.reveal.revealed .cert-item:nth-child(5) { animation-delay: 0.33s; }

.reveal.revealed .contact-method-card:nth-child(1) { animation-delay: 0.05s; }
.reveal.revealed .contact-method-card:nth-child(2) { animation-delay: 0.12s; }
.reveal.revealed .contact-method-card:nth-child(3) { animation-delay: 0.19s; }
.reveal.revealed .contact-method-card:nth-child(4) { animation-delay: 0.26s; }
.reveal.revealed .contact-method-card:nth-child(5) { animation-delay: 0.33s; }

@keyframes staggerFadeUp {
  from {
    opacity: 0;
    transform: translateY(25px) scale(0.97);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ─── Hero Section: Typing Cursor Blink ─── */
.hero-title::after {
  content: '|';
  color: var(--primary);
  animation: cursorBlink 1s step-end infinite;
  margin-left: 2px;
  font-weight: 300;
}

@keyframes cursorBlink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* ─── Hero Name: Gradient Shimmer Animation ─── */
.hero-name {
  background-size: 200% 100%;
  animation: shimmer 4s ease-in-out infinite;
}

@keyframes shimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ─── Hero Tech Pills: Staggered Entrance ─── */
.animate-fade-in .tech-pill {
  opacity: 0;
  animation: pillSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in .tech-pill:nth-child(1) { animation-delay: 0.4s; }
.animate-fade-in .tech-pill:nth-child(2) { animation-delay: 0.5s; }
.animate-fade-in .tech-pill:nth-child(3) { animation-delay: 0.6s; }
.animate-fade-in .tech-pill:nth-child(4) { animation-delay: 0.7s; }
.animate-fade-in .tech-pill:nth-child(5) { animation-delay: 0.8s; }
.animate-fade-in .tech-pill:nth-child(6) { animation-delay: 0.9s; }

@keyframes pillSlideIn {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

/* ─── Tech Pill Hover: Glow Border Effect ─── */
.tech-pill {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tech-pill:hover {
  border-color: var(--primary);
  color: var(--text-primary);
  background: var(--primary-glow);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

/* ─── Skill Tags: Interactive Glow on Hover ─── */
.skill-tag {
  position: relative;
  overflow: hidden;
}

.skill-tag::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.5s ease;
}

.skill-tag:hover::before {
  left: 100%;
}

/* ─── Service Cards: Gradient Border on Hover ─── */
.service-card {
  position: relative;
  overflow: hidden;
}

.service-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary), var(--secondary), var(--accent));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
}

.service-card:hover::before {
  transform: scaleX(1);
}

/* ─── Service Icon Box: Animated Rotation on Hover ─── */
.service-icon-box {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.service-card:hover .service-icon-box {
  transform: rotateY(180deg) scale(1.1);
}

/* ─── Project Cards: Animated Gradient Border ─── */
.project-card {
  position: relative;
  overflow: hidden;
}

.project-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, var(--primary), var(--accent), transparent);
  opacity: 0;
  transition: opacity 0.4s ease;
}

.project-card:hover::after {
  opacity: 1;
}

/* ─── Project Icon: Pulse on Hover ─── */
.project-card:hover .project-icon-box {
  animation: iconPulse 0.6s ease;
  box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.15); }
}

/* ─── Section Subtitle: Slide-in Animation ─── */
.reveal.revealed .section-subtitle {
  animation: subtitleSlide 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes subtitleSlide {
  from {
    opacity: 0;
    transform: translateY(-10px);
    letter-spacing: 0.5em;
  }
  to {
    opacity: 1;
    transform: translateY(0);
    letter-spacing: 0.2em;
  }
}

/* ─── Title Underline: Animated Width Expansion ─── */
.reveal.revealed .title-underline {
  animation: underlineExpand 0.8s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  width: 0;
}

@keyframes underlineExpand {
  to {
    width: 50px;
  }
}

/* ─── Stat Cards: Count Up Feel (scale bounce) ─── */
.reveal.revealed .stat-card {
  animation: statPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  opacity: 0;
}

.reveal.revealed .stat-card:nth-child(1) { animation-delay: 0.1s; }
.reveal.revealed .stat-card:nth-child(2) { animation-delay: 0.2s; }
.reveal.revealed .stat-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes statPop {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* ─── Terminal Mockup: Subtle Float Animation ─── */
.terminal-mockup {
  animation: float 6s ease-in-out infinite;
}

/* ─── Glow Orbs: Enhanced Movement ─── */
.glow-orb.orb-1 {
  animation: orbFloat1 8s ease-in-out infinite alternate;
}

.glow-orb.orb-2 {
  animation: orbFloat2 10s ease-in-out infinite alternate;
}

@keyframes orbFloat1 {
  0% { transform: translate(0, 0) scale(1); opacity: 0.15; }
  50% { transform: translate(30px, -20px) scale(1.1); opacity: 0.25; }
  100% { transform: translate(-20px, 10px) scale(0.95); opacity: 0.15; }
}

@keyframes orbFloat2 {
  0% { transform: translate(0, 0) scale(1); opacity: 0.12; }
  50% { transform: translate(-25px, 15px) scale(1.15); opacity: 0.22; }
  100% { transform: translate(15px, -25px) scale(0.9); opacity: 0.12; }
}

/* ─── CTA Buttons: Ripple Effect ─── */
.btn-primary-glow {
  position: relative;
  overflow: hidden;
}

.btn-primary-glow::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  transform: translate(-50%, -50%);
  transition: width 0.5s ease, height 0.5s ease;
}

.btn-primary-glow:hover::after {
  width: 300px;
  height: 300px;
}

/* ─── Navbar Links: Underline Grow Animation ─── */
.nav-link::after {
  transition: width 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* ─── Footer Social Icons: Bounce on Hover ─── */
.footer-socials a {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.footer-socials a:hover {
  transform: translateY(-4px) scale(1.15);
  color: var(--primary);
}

/* ─── Contact Method Cards: Slide-in Left Border ─── */
.contact-method-card {
  position: relative;
  overflow: hidden;
}

.contact-method-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 0;
  background: linear-gradient(180deg, var(--primary), var(--accent));
  transition: height 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.contact-method-card:hover::before {
  height: 100%;
}

/* ─── Contact Form Submit Button: Glow Pulse ─── */
.btn-submit {
  position: relative;
  overflow: hidden;
}

.btn-submit::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  background: linear-gradient(45deg, var(--primary), var(--secondary), var(--accent), var(--primary));
  background-size: 400% 400%;
  z-index: -1;
  border-radius: inherit;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: gradientShift 3s ease infinite;
}

.btn-submit:hover::before {
  opacity: 1;
}

@keyframes gradientShift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

/* ─── Education Card: Subtle Slide-In ─── */
.reveal.revealed .edu-card {
  animation: slideInLeft 0.6s 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ─── Publication Card: Subtle Slide-In ─── */
.reveal.revealed .pub-card {
  animation: slideInLeft 0.6s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  opacity: 0;
}

/* ─── GitHub Card: Hover Glow Enhancement ─── */
.github-card:hover {
  box-shadow: 0 0 40px rgba(59, 130, 246, 0.15), var(--shadow-glow);
}

.github-stat-item {
  transition: all 0.3s ease;
}

.github-stat-item:hover {
  transform: scale(1.05);
}

/* ─── Chatbot Toggle: Enhanced Pulse Ring ─── */
.custom-chat-toggle {
  position: relative;
}

.toggle-pulse {
  position: absolute;
  top: -4px;
  right: -4px;
  width: 14px;
  height: 14px;
  background: #10b981;
  border-radius: 50%;
  border: 2px solid var(--bg-primary);
}

.toggle-pulse::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #10b981;
  animation: chatPulseRing 2s infinite;
}

@keyframes chatPulseRing {
  0% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
  100% { transform: translate(-50%, -50%) scale(2.5); opacity: 0; }
}

/* ─── Hero CTA Buttons: Staggered Entrance ─── */
.animate-fade-in .hero-ctas > * {
  opacity: 0;
  animation: ctaFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in .hero-ctas > *:nth-child(1) { animation-delay: 0.8s; }
.animate-fade-in .hero-ctas > *:nth-child(2) { animation-delay: 0.9s; }
.animate-fade-in .hero-ctas > *:nth-child(3) { animation-delay: 1.0s; }
.animate-fade-in .hero-ctas > *:nth-child(4) { animation-delay: 1.05s; }
.animate-fade-in .hero-ctas > *:nth-child(5) { animation-delay: 1.1s; }

@keyframes ctaFadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ─── Hero Name & Title: Staggered Entrance ─── */
.animate-fade-in .hero-name {
  opacity: 0;
  animation: heroTextIn 0.7s 0.1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in .hero-title {
  opacity: 0;
  animation: heroTextIn 0.7s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in .hero-tagline {
  opacity: 0;
  animation: heroTextIn 0.7s 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.animate-fade-in .hero-desc {
  opacity: 0;
  animation: heroTextIn 0.7s 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes heroTextIn {
  from {
    opacity: 0;
    transform: translateY(20px);
    filter: blur(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
    filter: blur(0);
  }
}

/* ─── Scroll Down Arrow: Enhanced Bob Animation ─── */
.scroll-down {
  animation: scrollFadeIn 1s 1.5s ease forwards;
  opacity: 0;
}

@keyframes scrollFadeIn {
  to { opacity: 1; }
}

/* ─── Timeline: Animated Line Progression ─── */
.experience-timeline-container .ant-timeline-item {
  opacity: 0;
  animation: timelineReveal 0.6s ease forwards;
}

.experience-timeline-container .ant-timeline-item:nth-child(1) { animation-delay: 0.2s; }
.experience-timeline-container .ant-timeline-item:nth-child(2) { animation-delay: 0.5s; }

@keyframes timelineReveal {
  from {
    opacity: 0;
    transform: translateX(-15px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* ─── CV Download Button: Animated Gradient Border ─── */
.btn-cv-download {
  position: relative;
  z-index: 1;
}

.btn-cv-download::before {
  content: '';
  position: absolute;
  top: -1px;
  left: -1px;
  right: -1px;
  bottom: -1px;
  background: linear-gradient(90deg, var(--primary), var(--secondary), var(--primary));
  background-size: 200% 100%;
  border-radius: inherit;
  z-index: -1;
  opacity: 0;
  transition: opacity 0.3s ease;
  animation: gradientSlide 2s linear infinite;
}

.btn-cv-download:hover::before {
  opacity: 1;
}

@keyframes gradientSlide {
  0% { background-position: 0% 50%; }
  100% { background-position: 200% 50%; }
}

/* ═══ Disable Premium Animations on Mobile for Performance ═══ */
@media (max-width: 768px) {
  .hero-name { animation: none !important; opacity: 1 !important; }
  .hero-title::after { display: none; }
  .animate-fade-in .tech-pill,
  .animate-fade-in .hero-ctas > *,
  .animate-fade-in .hero-name,
  .animate-fade-in .hero-title,
  .animate-fade-in .hero-tagline,
  .animate-fade-in .hero-desc {
    animation: none !important;
    opacity: 1 !important;
    transform: none !important;
    filter: none !important;
  }
  .terminal-mockup { animation: none !important; }
  .service-card::before,
  .project-card::after,
  .contact-method-card::before,
  .btn-primary-glow::after,
  .btn-submit::before,
  .btn-cv-download::before { display: none !important; }
  .service-card:hover .service-icon-box { transform: none !important; }
  .scroll-down { opacity: 1 !important; animation: none !important; }
}
`;

// Combine: original global styles + component CSS + premium enhancements
const combined = globalStyles + '\\n/* ═══ Component Layout CSS (moved to global for child component access) ═══ */\\n' + componentCss + premiumEnhancements;
fs.writeFileSync('src/styles.css', combined, 'utf8');

console.log('Successfully built premium styles.css!');
console.log('Lines:', combined.split('\\n').length);
