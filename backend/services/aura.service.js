const OpenAI = require("openai");

const WHATSAPP_LINK = "https://wa.me/5532991563769";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

exports.processMessages = async (messages = []) => {
  try {
    // validação mínima
    if (!Array.isArray(messages) || messages.length === 0) {
      return `Não entendi sua mensagem 🤔. Se preferir, fale comigo no WhatsApp: ${WHATSAPP_LINK}`;
    }

    // segurança: limita histórico pra não explodir tokens/custo
    const safeMessages = messages.slice(-15);

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      messages: safeMessages,
    });

    const text =
      completion.choices?.[0]?.message?.content?.trim();

    return (
      text ||
      `Não consegui responder agora. Se preferir, fale comigo no WhatsApp: ${WHATSAPP_LINK}`
    );
  } catch (err) {
    // se der qualquer erro aqui, devolve fallback pro WhatsApp
    return `Tive um problema técnico agora. Se preferir, fale comigo no WhatsApp: ${WHATSAPP_LINK}`;
  }
};