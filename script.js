// ===== CONFIGURAÇÃO DO WHATSAPP =====
// Substitua o número abaixo pelo seu número de WhatsApp de atendimento.
// O número deve conter: Código do País (55) + DDD + Número.
// IMPORTANTE: NÃO COLOQUE espaços, traços ou parênteses.
const WHATSAPP_NUMBER = '5531993773678'; 

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

      // Verifica Textareas/Inputs de texto
      const textFields = group.querySelectorAll('textarea, input[type="text"]');
      if (textFields.length > 0) {
        textFields.forEach((field) => {
          if (field.value.trim() !== '') {
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
      negocio: formData.get('negocio'),
      faturamento: formData.get('faturamento'),
      trava: formData.get('trava')
    };

    // Geração da mensagem formatada para o WhatsApp
    const message = [
      '*NOVA APLICAÇÃO*',
      '',
      `*Já tem um negócio? Sobre ele:*`,
      data.negocio,
      '',
      `*Faturamento mensal:* ${data.faturamento}`,
      `*O que mais trava a escala:* ${data.trava}`
    ].join('\n');

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
