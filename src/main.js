// =====================
// Configuración de los puntos de conexión.
// =====================
const N8N_WEBHOOK = 'https://noncompressible-bea-immensely.ngrok-free.dev/webhook/orquiteck';
const N8N_PROSPECT_CRM_WEBHOOK = 'https://noncompressible-bea-immensely.ngrok-free.dev/webhook/orq-crm-prospeccion';

// =====================
// UTILS
// =====================
function getTime() {
  return new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

// ID único de sesión por visita.
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

// Llama al asistente de la demo y devuelve su respuesta.
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

  return data.reply || data.output || data.text || 'Desculpe, não entendi. Pode repetir?';
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

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
        <!-- Single grey tick initially -->
        <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" class="text-slate-500/60">
          <path d="M11.071.653a.75.75 0 0 1 .025 1.06L5.304 7.84a.75.75 0 0 1-1.074.012L1.23 4.818a.75.75 0 0 1 1.042-1.08l2.463 2.38 5.276-5.44a.75.75 0 0 1 1.06-.025z"/>
        </svg>
      </span>
    </span>
  `;
  chatBody.appendChild(wrap);
  scrollBottom();
  return wrap;
}

// Animate checkmarks for user messages
async function animateCheckmarks(wrap) {
  const tickContainer = wrap.querySelector('.wa-tick');
  if (!tickContainer) return;

  // 1. Single grey check is already there.
  
  // 2. Double grey checks after 400ms (delivered)
  await sleep(400);
  tickContainer.innerHTML = `
    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" class="text-slate-500/60">
      <path d="M11.071.653a.75.75 0 0 1 .025 1.06L5.304 7.84a.75.75 0 0 1-1.074.012L1.23 4.818a.75.75 0 0 1 1.042-1.08l2.463 2.38 5.276-5.44a.75.75 0 0 1 1.06-.025zM14.571.653a.75.75 0 0 1 .025 1.06L8.804 7.84a.75.75 0 0 1-1.043.014.75.75 0 0 1 .013-1.074l5.736-5.902a.75.75 0 0 1 1.061-.225z"/>
    </svg>
  `;

  // 3. Double blue checks after 600ms (read)
  await sleep(600);
  tickContainer.innerHTML = `
    <svg width="16" height="11" viewBox="0 0 16 11" fill="currentColor" class="text-[#53bdeb]">
      <path d="M11.071.653a.75.75 0 0 1 .025 1.06L5.304 7.84a.75.75 0 0 1-1.074.012L1.23 4.818a.75.75 0 0 1 1.042-1.08l2.463 2.38 5.276-5.44a.75.75 0 0 1 1.06-.025zM14.571.653a.75.75 0 0 1 .025 1.06L8.804 7.84a.75.75 0 0 1-1.043.014.75.75 0 0 1 .013-1.074l5.736-5.902a.75.75 0 0 1 1.061-.225z"/>
    </svg>
  `;
}

// Show typing indicator
function showTyping() {
  // Update status in header to "digitando..."
  const statusEl = document.querySelector('.wa-status');
  if (statusEl) {
    statusEl.innerHTML = `digitando...`;
    statusEl.classList.add('text-green-400', 'font-semibold');
  }

  const el = document.createElement('div');
  el.className = 'wa-typing wa-bubble';
  el.id = 'typing-indicator';
  el.innerHTML = `<div class="typing-dots"><span></span><span></span><span></span></div>`;
  chatBody.appendChild(el);
  scrollBottom();
}

// Add bot message
function addBotMessage(text, keepStatusTyping = false) {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();

  // Restore status in header to "online" if we are not keeping typing state
  if (!keepStatusTyping) {
    const statusEl = document.querySelector('.wa-status');
    if (statusEl) {
      statusEl.innerHTML = `<span class="wa-status-dot"></span>online`;
      statusEl.classList.remove('text-green-400', 'font-semibold');
    }
  }

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
  const userMsgWrap = addUserMessage(text);
  chatInput.value = '';

  // Animate the ticks visually
  await animateCheckmarks(userMsgWrap);

  // Show typing indicator when blue checks appear
  showTyping();

  try {
    const reply = await getBotResponse(text);
    
    // Split reply into natural fragments (by double newlines or line breaks)
    const fragments = reply.split(/\n+/).map(f => f.trim()).filter(f => f.length > 0);
    
    // Remove the initial generic typing indicator
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();

    for (let i = 0; i < fragments.length; i++) {
      const frag = fragments[i];
      const isLast = (i === fragments.length - 1);
      
      // Show typing status in header and show typing dots for each bubble
      showTyping();
      
      // Simulate real human writing delay per fragment
      const typingTime = Math.max(1200, Math.min(2500, frag.length * 12));
      await sleep(typingTime);
      
      // Send the fragment bubble
      addBotMessage(frag, !isLast);
    }
  } catch (err) {
    const typing = document.getElementById('typing-indicator');
    if (typing) typing.remove();

    showTyping();
    await sleep(1000);
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
// DIAGNOSTIC FORM
// =====================
const diagnosticForm = document.getElementById('diagnostic-form');
const diagnosticResult = document.getElementById('diagnostic-result');
const diagnosticSubmit = document.getElementById('diagnostic-submit');

function setDiagnosticResult(type, message) {
  if (!diagnosticResult) return;
  diagnosticResult.className = `diagnostic-result ${type}`;
  diagnosticResult.textContent = message;
}

async function submitDiagnostic(event) {
  event.preventDefault();
  if (!diagnosticForm || !diagnosticSubmit) return;

  const payload = Object.fromEntries(new FormData(diagnosticForm).entries());
  diagnosticSubmit.disabled = true;
  diagnosticSubmit.textContent = 'Enviando...';
  setDiagnosticResult('loading', 'Recebemos seus dados e estamos analisando se um agente faz sentido para sua clínica.');

  try {
    const response = await fetch(N8N_PROSPECT_CRM_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        prospecto: {
          ...payload,
          nome_clinica: payload.empresa,
          telefone_publico: payload.telefone,
          status: 'respondio',
          origem: 'site_orquiteck',
          nota: 'Contato chegou pelo formulário do site.'
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Webhook error: ${response.status}`);
    }

    await response.json();
    setDiagnosticResult('success', 'Recebido. Vou revisar sua clínica e te chamar no WhatsApp para mostrar se um agente faz sentido no seu caso.');
    diagnosticForm.reset();
  } catch (error) {
    console.error('[Orquiteck Diagnostic]', error);
    setDiagnosticResult('error', 'Ainda estamos ativando este formulário. Por enquanto, fale conosco pelo WhatsApp e analisamos sua clínica manualmente.');
  } finally {
    diagnosticSubmit.disabled = false;
    diagnosticSubmit.textContent = 'Ver Como Funcionaria na Minha Clínica';
  }
}

if (diagnosticForm) {
  diagnosticForm.addEventListener('submit', submitDiagnostic);
}

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
