const express = require('express');
const nodemailer = require('nodemailer');

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

router.post('/', async (req, res) => {
  const { nome, email, whatsapp, mensagem } = req.body;

  if (!nome || !mensagem) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }

  try {
    await transporter.sendMail({
      from: `"Aura - DC Software" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO,
      subject: '📩 Novo contato pelo site DC Software',
      html: `
        <h2>Novo contato recebido</h2>
        <p><strong>Nome:</strong> ${nome}</p>
        <p><strong>Email:</strong> ${email || 'Não informado'}</p>
        <p><strong>WhatsApp:</strong> ${whatsapp || 'Não informado'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${mensagem}</p>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao enviar email' });
  }
});

module.exports = router;
