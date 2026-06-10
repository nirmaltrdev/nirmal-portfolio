const fs = require('fs');

const myStyles = `/* Add this to existing or replace for global variables */
:root {
  /* Premium Dark Theme Variables */
  --bg-primary: #0a0a0f;
  --bg-secondary: #13131a;
  --accent-primary: #6366f1; /* Vibrant Indigo */
  --accent-secondary: #8b5cf6; /* Vibrant Purple */
  --accent-glow: rgba(99, 102, 241, 0.5);
  
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.05);
  --glass-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  
  --transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

body.light-theme {
  --bg-primary: #ffffff;
  --bg-secondary: #f1f5f9;
  --accent-primary: #4f46e5;
  --accent-secondary: #7c3aed;
  --accent-glow: rgba(79, 70, 229, 0.3);
  
  --text-primary: #0f172a;
  --text-secondary: #334155;
  --text-muted: #64748b;
  
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(0, 0, 0, 0.05);
  --glass-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', 'Outfit', sans-serif;
  transition: var(--transition-smooth);
  margin: 0;
  overflow-x: hidden;
}

/* Glassmorphism Panel Class */
.glass-panel {
  background: var(--glass-bg);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid var(--glass-border);
  border-radius: 16px;
  box-shadow: var(--glass-shadow);
  transition: var(--transition-smooth);
}

.glass-panel:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 255, 255, 0.1);
  box-shadow: 0 15px 40px -5px rgba(0,0,0,0.4), 0 0 20px var(--accent-glow);
}

/* Premium Typography */
h1, h2, h3, h4, h5, h6 {
  color: var(--text-primary);
  letter-spacing: -0.02em;
}

.section-title {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 0.5rem;
}

/* Glow Buttons */
.btn-primary-glow {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary)) !important;
  border: none !important;
  color: white !important;
  border-radius: 8px !important;
  padding: 0 30px !important;
  box-shadow: 0 4px 15px var(--accent-glow) !important;
  transition: var(--transition-smooth) !important;
}

.btn-primary-glow:hover {
  transform: scale(1.05) !important;
  box-shadow: 0 8px 25px var(--accent-glow) !important;
}

/* Animations */
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: var(--transition-smooth);
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}
`;

const appCss = fs.readFileSync('src/app/app.component.css', 'utf8');
fs.writeFileSync('src/styles.css', myStyles + '\n' + appCss, 'utf8');
console.log('Fixed styles.css encoding!');
