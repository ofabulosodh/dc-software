const auraService = require("../services/aura.service");

const WHATSAPP_LINK = "https://wa.me/5532991563769";

exports.handleMessage = async (req, res) => {
  console.log("REQ BODY:", req.body);
  console.log("REQ BODY messages length:", Array.isArray(req.body.messages) ? req.body.messages.length : "N/A");
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        reply: `Dados inválidos. Se preferir, fale no WhatsApp: ${WHATSAPP_LINK}`
      });
    }

    const reply = await auraService.processMessages(messages);
    return res.json({ reply });

  } catch (err) {
    const status = err?.status || err?.response?.status;

    if (status === 429) {
      return res.status(429).json({
        reply: `No momento minha IA está indisponível por limite de uso. Fale comigo no WhatsApp: ${WHATSAPP_LINK}`
      });
    }

    console.error("Erro Aura:", err);
    return res.status(500).json({
      reply: `Tive um problema técnico agora. Pode falar comigo no WhatsApp: ${WHATSAPP_LINK}`
    });
  }
};