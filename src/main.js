// --- CHAT LOGIC ---
const chatBody = document.getElementById('chat-body');
const chatInput = document.getElementById('chat-input');
const sendBtn = document.getElementById('send-btn');

const responses = {
    'default': 'Desculpe, ainda estou aprendendo! Mas posso te ajudar a agendar uma consulta ou tirar dúvidas sobre tratamentos. O que prefere?',
    'oi': 'Olá! Como posso ajudar você hoje? Gostaria de marcar uma avaliação ou saber nossos horários?',
    'ola': 'Olá! Como posso ajudar você hoje? Gostaria de marcar uma avaliação ou saber nossos horários?',
    'agendar': 'Com certeza! Temos horários disponíveis para amanhã às 14h ou 16h. Algum desses funciona para você?',
    'limpeza': 'A limpeza profunda é essencial! O valor inicial é de R$ 180. Quer agendar uma agora?',
    'endereco': 'Estamos localizados na Av. Paulista, 1000, Sala 502. Próximo ao metrô!',
    'preco': 'Nossos tratamentos são personalizados. Uma limpeza começa em R$ 180, e clareamento a partir de R$ 450. Vamos marcar uma avaliação gratuita?',
    'dentista': 'Temos especialistas em Estomatologia, Ortodontia e Implantes. Qual sua necessidade hoje?'
};

function addMessage(text, isBot = true) {
    const msgDiv = document.createElement('div');
    msgDiv.className = isBot 
        ? "bg-[#202c33] text-slate-100 p-3 rounded-lg rounded-tl-none max-w-[85%] text-sm self-start animate-fade-in"
        : "bg-[#005c4b] text-slate-100 p-3 rounded-lg rounded-tr-none max-w-[85%] text-sm self-end animate-fade-in";
    
    msgDiv.textContent = text;
    chatBody.appendChild(msgDiv);
    chatBody.scrollTop = chatBody.scrollHeight;
}

function handleBotResponse(userText) {
    const text = userText.toLowerCase();
    let response = responses['default'];

    if (text.includes('agendar') || text.includes('marcar')) response = responses['agendar'];
    else if (text.includes('limpeza')) response = responses['limpeza'];
    else if (text.includes('onde') || text.includes('endereço') || text.includes('local')) response = responses['endereco'];
    else if (text.includes('quanto') || text.includes('preço') || text.includes('valor')) response = responses['preco'];
    else if (text.includes('oi') || text.includes('olá')) response = responses['oi'];
    else if (text.includes('dentista') || text.includes('especialista')) response = responses['dentista'];

    // Simulate typing delay
    setTimeout(() => {
        addMessage(response, true);
    }, 1000);
}

function sendMessage() {
    const text = chatInput.value.trim();
    if (text === '') return;

    addMessage(text, false);
    chatInput.value = '';
    handleBotResponse(text);
}

sendBtn.addEventListener('click', sendMessage);
chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

// --- SCROLL REVEAL ---
const revealElements = document.querySelectorAll('[data-reveal]');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

revealElements.forEach(el => revealObserver.observe(el));

// --- NAVBAR EFFECT ---
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('bg-dark-bg/80', 'backdrop-blur-md', 'py-4', 'border-b', 'border-white/5');
        navbar.classList.remove('py-6');
    } else {
        navbar.classList.remove('bg-dark-bg/80', 'backdrop-blur-md', 'py-4', 'border-b', 'border-white/5');
        navbar.classList.add('py-6');
    }
});
