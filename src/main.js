// =====================
// VERCEL SPEED INSIGHTS
// =====================
import { injectSpeedInsights } from '@vercel/speed-insights';
injectSpeedInsights();

// =====================
// CONFIGURACIÓN — CAMBIA ESTO
// =====================
const N8N_WEBHOOK = 'https://noncompressible-bea-immensely.ngrok-free.dev/webhook/orquiteck'; // ← tu URL de webhook

// =====================
// UTILS
// =====================
function getTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ID único de sesión por visita (para memoria de conversación en n8n)
const sessionId = crypto.randomUUID();

// Set initial message timestamp
const initialTime = document.getElementById('initial-time');
if (initialTime) initialTime.textContent = getTime();

// =====================
// CHAT LOGIC
// =====================
const chatBody  = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const sendBtn   = document.getElementById('send-btn');

// Llama al webhook de n8n y devuelve la respuesta del bot
async function getBotResponse(userMessage) {
  const res = await fetch(N8N_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: userMessage,
      sessionId: sessionId
    })
  });

  if (!res.ok) throw new Error(`Webhook error: ${res.status}`);

  const data = await res.json();

  // n8n devuelve { "reply": "..." } — ajusta la clave si usas otra
  return data.reply || data.output || data.text || 'Desculpe, não entendi. Pode repetir?';
}

// Add user message
function addUserMessage(text) {
  const time = getTime();
  const wrap = document.createElement('div');
  wrap.className = 'wa-bubble wa-bubble-user';
  wrap.innerHTML = `
    <span>${escapeHtml(text)}</span>
    <span class="wa-time">
      ${time}
      <span class="wa-tick">
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor">
          <path d="M11.071.653a.75.75 0 0 1 .025 1.06L5.304 7.84a.75.75 0 0 1-1.074.012L1.23 4.818a.75.75 0 0 1 1.042-1.08l2.463 2.38 5.276-5.44a.75.75 0 0 1 1.06-.025zM14.571.653a.75.75 0 0 1 .025 1.06L8.804 7.84a.75.75 0 0 1-1.043.014.75.75 0 0 1 .013-1.074l5.736-5.902a.75.75 0 0 1 1.061-.225z"/>
        </svg>
      </span>
    </span>
  `;
  chatBody.appendChild(wrap);
  scrollBottom();
}

// Show typing indicator
function showTyping() {
  const el = document.createElement('div');
  el.className = 'wa-typing wa-bubble';
  el.id = 'typing-indicator';
  el.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatBody.appendChild(el);
  scrollBottom();
}

// Add bot message
function addBotMessage(text) {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();

  const time = getTime();
  const wrap = document.createElement('div');
  wrap.className = 'wa-bubble wa-bubble-bot';
  wrap.innerHTML = `<span>${escapeHtml(text)}</span><span class="wa-time">${time}</span>`;
  chatBody.appendChild(wrap);
  scrollBottom();
}

function scrollBottom() {
  chatBody.scrollTop = chatBody.scrollHeight;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

let botBusy = false;

async function sendMessage() {
  const text = chatInput.value.trim();
  if (!text || botBusy) return;

  botBusy = true;
  addUserMessage(text);
  chatInput.value = '';
  showTyping();

  try {
    const reply = await getBotResponse(text);
    addBotMessage(reply);
  } catch (err) {
    addBotMessage('Desculpe, tive um problema técnico. Tente novamente em instantes. 🙏');
    console.error('[OrquiBot]', err);
  } finally {
    botBusy = false;
  }
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
});

// Suggestion chips
window.insertSuggestion = function(text) {
  chatInput.value = text;
  chatInput.focus();
  sendMessage();
};

// =====================
// SCROLL REVEAL
// =====================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('active');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('[data-reveal]').forEach(el => revealObserver.observe(el));

// =====================
// NAVBAR SCROLL EFFECT
// =====================
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.classList.add('bg-dark-bg/80', 'backdrop-blur-md', 'py-4', 'border-b', 'border-white/5');
    navbar.classList.remove('py-6');
  } else {
    navbar.classList.remove('bg-dark-bg/80', 'backdrop-blur-md', 'py-4', 'border-b', 'border-white/5');
    navbar.classList.add('py-6');
  }
}, { passive: true });

// =====================
// MOBILE MENU
// =====================
const menuBtn    = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

menuBtn.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  menuBtn.classList.toggle('open', isOpen);
  menuBtn.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
});

window.closeMobileMenu = function() {
  mobileMenu.classList.remove('open');
  menuBtn.classList.remove('open');
};

document.addEventListener('click', (e) => {
  if (!navbar.contains(e.target)) closeMobileMenu();
});