document.addEventListener("DOMContentLoaded", () => {
  const auraButtons = document.querySelectorAll(".btn-aura, .aura-widget");
  const auraChat = document.getElementById("auraChat");
  const auraMessages = document.getElementById("auraMessages");
  const closeAura = document.getElementById("closeAura");
  const auraInput = document.getElementById("auraInput");
  const sendAura = document.getElementById("sendAura");
  const auraStatus = document.getElementById("auraStatus");

  const orb = document.querySelector(".aura-orb");
  const eyes = orb ? orb.querySelectorAll(".eye") : [];

  const auraSection = document.querySelector(".aura");

  // Cards
  const solucaoCards = document.querySelectorAll(".solucao-card");
  const funcionalCards = document.querySelectorAll(".aura-funcionalidades .card");
  const pqCards = document.querySelectorAll(".pq-card");

  const AURA_API_URL = "https://dc-software-backend.onrender.com/aura";

  const WHATSAPP_LINK = "https://wa.me/5532991563769";
  const WHATSAPP_URL = "https://wa.me/5532991563769"; 

  const WHATSAPP_HTML = `<a href="${WHATSAPP_LINK}" target="_blank" rel="noopener noreferrer">WhatsApp</a>`;

  let conversation = [
  {
    role: "system",
    content:
      "Você é a Aura, atendente virtual da DC Software. Responda em português, de forma objetiva e profissional. " +
      "Quando o usuário pedir orçamento/contato, conduza para captar nome e WhatsApp. " +
      "Se o usuário responder 'sim' ou 'ok', use o contexto anterior para continuar."
  }
];

  let auraStarted = false;
  let pendingCard = null; // { type: 'solucao'|'funcional'|'pq', value: string }
  let isSending = false;



  const contactFlow = { name: "" };

  const auraState = {
    mode: "ask_name", // ask_name | free_chat | card_flow | offer_contact
    aiQuestions: 0,
  };

  const keywordsResponses = {
    ia: "🤖 Inteligência Artificial é nosso foco em soluções inteligentes. Posso te explicar aplicações e valores.",
    automacao: "⚙️ Automação ajuda a economizar tempo e reduzir custos. Quer um exemplo real?",
    sistemas: "🌐 Sites e sistemas sob medida trazem escala e profissionalismo. Me conta o que você imagina.",
    apps: "📱 Aplicativos são ótimos para engajamento e crescimento. Android, iOS ou ambos?",
    jogos: "🎮 Criamos jogos e experiências interativas para marcas. Quer algo promocional ou um jogo completo?",
  };

  function detectKeyword(text) {
    const t = text.toLowerCase();
    for (const key in keywordsResponses) {
      if (t.includes(key)) return keywordsResponses[key];
    }
    return null;
  }

  function auraReply(text) {
    if (!auraStatus || !auraMessages) return;

    auraStatus.classList.add("active");
    setTimeout(() => {
      auraStatus.classList.remove("active");

      conversation.push({ role: "assistant", content: text });

      const msg = document.createElement("div");
      msg.classList.add("aura-msg");
      msg.innerHTML = `<strong>Aura</strong><br>${linkify(text)}`;
      auraMessages.appendChild(msg);
      auraMessages.scrollTop = auraMessages.scrollHeight;
    }, 700);
  }

  function openAura() {
    if (!auraChat) return;
    auraChat.classList.add("active");

    if (!contactFlow.name) {
      auraState.mode = "ask_name";
      if (!auraStarted) {
        auraReply("Olá 👋 Eu sou a Aura, atendente virtual da DC Software. Antes de começarmos, qual é o seu nome?");
        auraStarted = true;
      } else {
        auraReply("Antes de continuarmos, qual é o seu nome? 😊");
      }
      return;
    }

    // Se já tem nome e existe card pendente, executa
    if (pendingCard) {
      runPendingCard();
    }
  }

  function closeAuraChat() {
    if (!auraChat) return;
    auraChat.classList.remove("active");
  }

  function formatName(name) {
    return name.trim().toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
  }

  function isPositiveResponse(text) {
    const positives = ["sim", "sm", "ok", "claro", "quero", "pode ser", "s", "yes"];
    return positives.includes(text.toLowerCase().trim());
  }

  function runCardFlow(tipo) {
    auraState.mode = "card_flow";
    switch (tipo) {
      case "ia":
        auraReply("🤖 Inteligência Artificial pode automatizar atendimento, reduzir custos e gerar mais vendas. Quer que eu te mostre um exemplo prático aplicado ao seu negócio?");
        break;
      case "automacao":
        auraReply("⚙️ Automação é perfeita para economizar tempo e reduzir custos. Quer um exemplo real para o seu negócio?");
        break;
      case "sistemas":
        auraReply("🌐 Sites e sistemas sob medida trazem escala e profissionalismo. Me conta o que você imagina.");
        break;
      case "apps":
        auraReply("📱 Aplicativos são ótimos para engajamento e crescimento. Android, iOS ou ambos?");
        break;
      case "jogos":
        auraReply("🎮 Jogos e experiências interativas criam conexão forte com marcas. Quer algo promocional ou um jogo completo?");
        break;
      case "custom":
        auraReply("🧠 Soluções personalizadas são nosso forte. Me descreva sua ideia que eu te ajudo a desenhar.");
        break;
      default:
        auraReply("Me conte mais sobre o que você precisa 😊");
    }
  }

  function runFuncionalFlow(tipo) {
    auraState.mode = "card_flow";
    switch (tipo) {
      case "atendimento":
        auraReply("🤖 Atendimento automático funciona 24h por dia. Quer ver um exemplo prático aplicado ao seu negócio?");
        break;
      case "agendamento":
        auraReply("📅 Agendamentos inteligentes organizam sua agenda automaticamente. Quer ver como isso funcionaria no seu negócio?");
        break;
      case "integracao":
        auraReply("💬 Integrações conectam WhatsApp, site e sistemas. Quer um exemplo real dessa integração?");
        break;
      case "relatorios":
        auraReply("📊 Relatórios inteligentes ajudam na tomada de decisão. Quer ver como funciona na prática?");
        break;
      case "personalizacao":
        auraReply("🧠 A Aura pode ser personalizada para o seu negócio. Quer ver como seria no seu caso?");
        break;
      default:
        auraReply("Me conte mais sobre sua necessidade 😊");
    }
  }

  function runPQFlow(texto) {
    auraState.mode = "card_flow";
    auraReply(
      `💡 A Aura é ideal para ${texto}, ajudando a automatizar processos e melhorar atendimento.\n\nQuer um exemplo prático aplicado ao seu negócio?`
    );
  }

  function runPendingCard() {
    if (!pendingCard) return;

    const { type, value } = pendingCard;
    pendingCard = null;

    if (type === "solucao") runCardFlow(value);
    if (type === "funcional") runFuncionalFlow(value);
    if (type === "pq") runPQFlow(value);
  }

  async function sendToAuraBackend(text) {
    if (isSending) return;
    isSending = true;

    try {
      if (auraState.aiQuestions >= 2) {
        auraState.mode = "offer_contact";
        auraReply('😊 Para continuarmos e entender melhor seu caso, posso te atender direto no WhatsApp.${WHATSAPP_URL}');
        return;
      }

      const response = await fetch(AURA_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: conversation }),
      });

      if (!response.ok) throw new Error("Backend não respondeu");

      const data = await response.json();
      auraState.aiQuestions++;
      auraReply(data.reply);
    } catch (err) {
      
auraReply(
  `⚠️ Estou com instabilidade agora. Posso te atender direto no WhatsApp 😊\n${WHATSAPP_URL}`
);

    } finally {
      isSending = false;
    }
  }

  function sendMessage() {
    if (!auraInput || !auraMessages) return;

    const text = auraInput.value.trim();
    if (!text) return;

    conversation.push({ role: "user", content: text });

    // UI: mensagem do usuário
    const userMsg = document.createElement("div");
    userMsg.classList.add("aura-msg");
    userMsg.innerHTML = `<strong>Você</strong><br>${text}`;
    auraMessages.appendChild(userMsg);

    auraInput.value = "";
    auraMessages.scrollTop = auraMessages.scrollHeight;

    // 1) capturar nome
    if (!contactFlow.name && auraState.mode === "ask_name") {
      contactFlow.name = formatName(text);
      auraState.mode = "free_chat";
      auraReply(`Prazer, ${contactFlow.name}! 😊 Em que posso te ajudar hoje?`);

      // se veio de card pendente, continua
      if (pendingCard) runPendingCard();
      return;
    }

    // 2) oferta whatsapp
    if (auraState.mode === "offer_contact") {
      auraReply(isPositiveResponse(text) ? "📲 Perfeito! WhatsApp: (32) 99156-3769" : "Sem problema 😊 Estarei por aqui.");
      return;
    }

    // 3) resposta positiva após card
    if (auraState.mode === "card_flow") {
  // qualquer resposta do usuário depois de um card vira conversa livre
  auraState.mode = "free_chat";
  sendToAuraBackend(text);
  return;
}

   

    // 5) IA real (backend)
    if (auraState.mode === "free_chat") {
      sendToAuraBackend(text);
    }
  }

  // ---------- eventos ----------
  auraButtons.forEach((btn) => btn.addEventListener("click", openAura));
  if (closeAura) closeAura.addEventListener("click", closeAuraChat);

  if (sendAura) sendAura.addEventListener("click", sendMessage);
  if (auraInput) {
    auraInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") sendMessage();
    });
  }

  // Cards Soluções
  solucaoCards.forEach((card) => {
    card.addEventListener("click", () => {
      const tipo = card.getAttribute("data-solucao") || "custom";
      openAura();

      if (!contactFlow.name) {
        pendingCard = { type: "solucao", value: tipo };
        auraState.mode = "ask_name";
        return;
      }
      runCardFlow(tipo);
    });
  });
  function linkify(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, (url) =>
    `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`
  );
}
  // Cards IA (funcionalidades)
  funcionalCards.forEach((card) => {
    card.addEventListener("click", () => {
      const tipo = card.getAttribute("data-solucao") || "personalizacao";
      openAura();

      if (!contactFlow.name) {
        pendingCard = { type: "funcional", value: tipo };
        auraState.mode = "ask_name";
        return;
      }
      runFuncionalFlow(tipo);
    });
  });

  // Cards "Para quem é"
  pqCards.forEach((card) => {
    card.addEventListener("click", () => {
      const texto = card.textContent.trim();
      openAura();

      if (!contactFlow.name) {
        pendingCard = { type: "pq", value: texto };
        auraState.mode = "ask_name";
        return;
      }
      runPQFlow(texto);
    });
  });

  // animação seção aura
  if (auraSection) {
    const auraObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) auraSection.classList.add("show");
        });
      },
      { threshold: 0.3 }
    );
    auraObserver.observe(auraSection);
  }

  // olhos da orb
  if (orb && eyes.length > 0) {
    document.addEventListener("mousemove", (e) => {
      const rect = orb.getBoundingClientRect();
      const orbX = rect.left + rect.width / 2;
      const orbY = rect.top + rect.height / 2;

      const dx = e.clientX - orbX;
      const dy = e.clientY - orbY;

      const maxMove = 10;
      const moveX = Math.max(-maxMove, Math.min(dx / 20, maxMove));
      const moveY = Math.max(-maxMove, Math.min(dy / 20, maxMove));

      eyes.forEach((eye) => {
        eye.style.transform = `translate(${moveX}px, calc(-50% + ${moveY}px))`;
      });
    });
  }
});