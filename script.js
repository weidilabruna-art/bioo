// ===== CONFIGURAÇÃO DO WHATSAPP =====
// Substitua o número abaixo pelo seu número de WhatsApp de atendimento.
const WHATSAPP_NUMBER = '5531993773678'; 

// ===== CONFIGURAÇÃO DO WEBHOOK (MAKE / GOOGLE SHEETS / E-MAIL) =====
// Se você criar um cenário no Make.com para salvar as aplicações em uma planilha 
// ou enviar alertas por e-mail, cole a URL do seu Webhook entre as aspas abaixo:
const MAKE_WEBHOOK_URL = ''; 

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('app-form');
  const formContent = document.getElementById('form-content');
  const successContent = document.getElementById('success-content');
  const formNotice = document.getElementById('form-notice');
  const waActionBtn = document.getElementById('wa-action-btn');

  // Limpa o estado de erro quando o usuário interage
  form.addEventListener('input', (e) => {
    const group = e.target.closest('.q-group');
    if (group) group.classList.remove('invalid');
    formNotice.classList.remove('show');
  });

  form.addEventListener('change', (e) => {
    const group = e.target.closest('.q-group');
    if (group) group.classList.remove('invalid');
    formNotice.classList.remove('show');
  });

  // Evento de Envio
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    let firstInvalidGroup = null;

    // Seleciona todos os grupos obrigatórios
    const requiredGroups = form.querySelectorAll('[data-required]');

    requiredGroups.forEach((group) => {
      let isGroupFilled = false;

      // Verifica Textareas/Inputs de texto, telefone e select
      const fields = group.querySelectorAll('textarea, input[type="text"], input[type="tel"], select');
      if (fields.length > 0) {
        fields.forEach((field) => {
          if (field.value && field.value.trim() !== '') {
            isGroupFilled = true;
          }
        });
      }

      // Verifica Radios
      const radioGroupAttr = group.querySelector('[data-radio-group]');
      if (radioGroupAttr) {
        const radioName = radioGroupAttr.getAttribute('data-radio-group');
        const checkedRadio = group.querySelector(`input[name="${radioName}"]:checked`);
        if (checkedRadio) {
          isGroupFilled = true;
        }
      }

      // Aplica classes de erro se inválido
      if (!isGroupFilled) {
        group.classList.add('invalid');
        isValid = false;
        if (!firstInvalidGroup) {
          firstInvalidGroup = group;
        }
      } else {
        group.classList.remove('invalid');
      }
    });

    if (!isValid) {
      formNotice.classList.add('show');
      if (firstInvalidGroup) {
        firstInvalidGroup.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    // Coleta dos dados do formulário
    const formData = new FormData(form);
    const data = {
      nome: formData.get('nome'),
      whatsapp: formData.get('whatsapp'),
      negocio: formData.get('negocio'),
      produto_digital: formData.get('produto_digital'),
      faturamento: formData.get('faturamento'),
      dificuldade: formData.get('dificuldade')
    };

    // Geração da mensagem formatada para o WhatsApp
    const message = [
      '*NOVA APLICAÇÃO - SESSÃO ESTRATÉGICA*',
      '',
      `*Nome:* ${data.nome}`,
      `*WhatsApp:* ${data.whatsapp}`,
      '',
      `*1. Já tem um negócio? Sobre ele:*`,
      data.negocio,
      '',
      `*2. Já tem um produto digital?* ${data.produto_digital}`,
      `*3. Faturamento mensal hoje:* ${data.faturamento}`,
      '',
      `*4. Maior dificuldade hoje:*`,
      data.dificuldade
    ].join('\n');

    // Envia os dados para o Webhook do Make (caso configurado)
    if (MAKE_WEBHOOK_URL) {
      fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      }).catch(err => console.warn('Erro ao enviar dados para o Webhook:', err));
    }

    const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

    // Dispara Evento de Lead no Meta Pixel (se existir na página)
    try {
      if (typeof fbq === 'function') {
        fbq('track', 'Lead');
      }
    } catch (err) {
      console.warn('Meta Pixel não inicializado ou bloqueado:', err);
    }

    // Configura o link do botão de ação da tela de sucesso
    waActionBtn.href = whatsappUrl;

    // Transição de tela (Oculta formulário, exibe sucesso)
    formContent.style.display = 'none';
    successContent.style.display = 'block';

    // Rola de volta para o topo da coluna do formulário
    const formContainer = document.getElementById('form-container');
    if (formContainer) {
      formContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Tenta abrir em nova aba automaticamente
    window.open(whatsappUrl, '_blank');
  });
});
