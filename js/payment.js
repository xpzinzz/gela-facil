// ── STANDALONE PAYMENT PAGE CONTROLLER ──

// Helper to adjust relative image paths on subpages
function adjustImagePath(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('/') || path.startsWith('..')) {
    return path;
  }
  return '../' + path;
}

document.addEventListener('DOMContentLoaded', () => {
  // If cart is empty, alert and redirect to catalog
  if (!cart || cart.length === 0) {
    showToast('Seu carrinho está vazio! Redirecionando para a loja...');
    setTimeout(() => {
      window.location.href = '../index.html#produtos';
    }, 2000);
    return;
  }
  
  // Render checkout list
  renderCheckoutSummary();
  
  // Setup Payment Tabs
  setupPaymentTabs();
  
  // Setup 3D Card Interactive Preview
  setupCardPreview();
  
  // Pre-fill fields if we have stored values
  const storedName = localStorage.getItem('gela_client_name');
  const storedPhone = localStorage.getItem('gela_client_phone');
  const storedEmail = localStorage.getItem('gela_client_email');
  
  if (storedName) document.getElementById('chk-name').value = storedName;
  if (storedPhone) document.getElementById('chk-phone').value = storedPhone;
  if (storedEmail) document.getElementById('chk-email').value = storedEmail;
});

// Render the items and totals on the checkout page
function renderCheckoutSummary() {
  const listContainer = document.getElementById('checkout-items-list');
  if (!listContainer) return;
  
  let listHtml = '';
  cart.forEach(item => {
    const adjustedImg = adjustImagePath(item.image);
    listHtml += `
      <div class="checkout-item-summary">
        <div class="chk-item-img">
          <img src="${adjustedImg}" alt="${item.name}">
        </div>
        <div class="chk-item-info">
          <div class="chk-item-name">${item.quantity}x ${item.name}</div>
          <div class="chk-item-opt">+ ${item.optionName}</div>
        </div>
        <div class="chk-item-price">${formatPrice((item.price + item.optionPrice) * item.quantity)}</div>
      </div>
    `;
  });
  listContainer.innerHTML = listHtml;
  
  updateCheckoutTotals();
}

// Recalculate and update financial totals on checkout
function updateCheckoutTotals() {
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const servicesTotal = cart.reduce((acc, item) => acc + (item.optionPrice * item.quantity), 0);
  
  const activeTab = document.querySelector('.payment-tab.active');
  const method = activeTab ? activeTab.getAttribute('data-method') : 'pix';
  
  let discount = 0;
  const discountRow = document.getElementById('chk-discount-row');
  
  if (method === 'pix') {
    discount = subtotal * 0.05; // 5% discount on products subtotal
    if (discountRow) {
      discountRow.style.display = 'flex';
      document.getElementById('chk-discount-val').textContent = `- ${formatPrice(discount)}`;
    }
  } else {
    if (discountRow) discountRow.style.display = 'none';
  }
  
  const total = subtotal - discount + servicesTotal;
  
  document.getElementById('chk-subtotal-val').textContent = formatPrice(subtotal);
  document.getElementById('chk-services-val').textContent = servicesTotal === 0 ? 'Grátis' : formatPrice(servicesTotal);
  document.getElementById('chk-total-val').textContent = formatPrice(total);
  
  // Populate Card Installments
  const installmentsSelect = document.getElementById('card-installments');
  if (installmentsSelect) {
    let optionsHtml = '';
    for (let i = 1; i <= 10; i++) {
      const value = total / i;
      optionsHtml += `<option value="${i}">${i}x de ${formatPrice(value)} sem juros</option>`;
    }
    installmentsSelect.innerHTML = optionsHtml;
  }
}

// Bind clicks on payment tab elements
function setupPaymentTabs() {
  const tabs = document.querySelectorAll('.payment-tab');
  tabs.forEach(tab => {
    tab.onclick = () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      const method = tab.getAttribute('data-method');
      const panels = document.querySelectorAll('.payment-method-panel');
      panels.forEach(p => p.classList.remove('active'));
      
      const targetPanel = document.getElementById(`panel-${method}`);
      if (targetPanel) targetPanel.classList.add('active');
      
      updateCheckoutTotals();
    };
  });
}

// CEP lookup ViaCEP API
window.lookupCep = function() {
  const cepInput = document.getElementById('chk-cep');
  if (!cepInput) return;
  const cep = cepInput.value.replace(/\D/g, '');
  if (cep.length !== 8) return;
  
  cepInput.style.borderColor = 'var(--blue)';
  
  fetch(`https://viacep.com.br/ws/${cep}/json/`)
    .then(res => res.json())
    .then(data => {
      if (data.erro) {
        showToast('CEP não encontrado. Digite os dados manualmente.');
        return;
      }
      document.getElementById('chk-street').value = data.logradouro || '';
      document.getElementById('chk-neighborhood').value = data.bairro || '';
      document.getElementById('chk-city').value = data.localidade || '';
      document.getElementById('chk-state').value = data.uf || '';
      
      const numInput = document.getElementById('chk-number');
      if (numInput) numInput.focus();
    })
    .catch(() => {
      showToast('Erro ao buscar o CEP. Digite manualmente.');
    });
};

// Copy PIX Code key
window.copyPixKey = function() {
  const pixInput = document.getElementById('pix-key-val');
  if (pixInput) {
    pixInput.select();
    pixInput.setSelectionRange(0, 99999);
    navigator.clipboard.writeText(pixInput.value)
      .then(() => {
        showToast('Chave PIX copiada para a área de transferência!');
      })
      .catch(() => {
        showToast('Chave PIX copiada!');
      });
  }
};

// Handle final Form Submit
window.handleFormSubmit = function(e) {
  e.preventDefault();
  
  const form = document.getElementById('checkout-form');
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  
  const name = document.getElementById('chk-name').value;
  const phone = document.getElementById('chk-phone').value;
  const email = document.getElementById('chk-email').value;
  const street = document.getElementById('chk-street').value;
  const number = document.getElementById('chk-number').value;
  const comp = document.getElementById('chk-complement').value;
  const neighbor = document.getElementById('chk-neighborhood').value;
  const city = document.getElementById('chk-city').value;
  const state = document.getElementById('chk-state').value;
  const cep = document.getElementById('chk-cep').value;
  
  // Save details in local storage for convenience
  localStorage.setItem('gela_client_name', name);
  localStorage.setItem('gela_client_phone', phone);
  localStorage.setItem('gela_client_email', email);
  
  // Payment Method Details formatting
  const activeTab = document.querySelector('.payment-tab.active');
  const method = activeTab ? activeTab.getAttribute('data-method') : 'pix';
  let paymentMethodFormatted = '';
  
  if (method === 'pix') {
    paymentMethodFormatted = 'PIX (-5% Desconto)';
  } else if (method === 'card') {
    const installmentsSelect = document.getElementById('card-installments');
    const installmentsText = installmentsSelect ? installmentsSelect.options[installmentsSelect.selectedIndex].text : '';
    paymentMethodFormatted = `Cartão de Crédito (${installmentsText})`;
  } else {
    const deliveryChoice = document.querySelector('input[name="del-pay-choice"]:checked')?.value;
    if (deliveryChoice === 'dinheiro') {
      paymentMethodFormatted = 'Dinheiro na entrega';
    } else if (deliveryChoice === 'cartao_entrega') {
      paymentMethodFormatted = 'Cartão (Máquina sem fio) na entrega';
    } else {
      paymentMethodFormatted = 'PIX na entrega';
    }
  }
  
  // Show Simulation Processing Overlay
  const processingOverlay = document.getElementById('checkout-processing');
  if (processingOverlay) processingOverlay.classList.add('active');
  
  const progressBar = document.getElementById('processing-bar');
  const stepTitle = document.getElementById('processing-step-title');
  const stepDesc = document.getElementById('processing-step-desc');
  
  const steps = [
    { pct: 25, title: 'Validando dados de entrega...', desc: 'Verificando a cobertura de CEP e rotas de entrega.' },
    { pct: 55, title: 'Reserva e preparação de estoque...', desc: 'Garantindo a reserva dos aparelhos e das peças.' },
    { pct: 85, title: 'Processando transação com banco...', desc: 'Simulando a aprovação segura da operadora de pagamento.' },
    { pct: 100, title: 'Confirmado com sucesso!', desc: 'Gerando número do pedido e reservando rota logística.' }
  ];
  
  let currentStepIdx = 0;
  function nextSimulationStep() {
    if (currentStepIdx >= steps.length) {
      if (processingOverlay) processingOverlay.classList.remove('active');
      showSuccessScreen(name, phone, email, street, number, comp, neighbor, city, state, cep, paymentMethodFormatted);
      return;
    }
    const step = steps[currentStepIdx++];
    if (progressBar) progressBar.style.width = step.pct + '%';
    if (stepTitle) stepTitle.textContent = step.title;
    if (stepDesc) stepDesc.textContent = step.desc;
    
    setTimeout(nextSimulationStep, 800);
  }
  
  setTimeout(nextSimulationStep, 200);
};

// Show final success confirmation screen
function showSuccessScreen(clientName, phone, email, street, number, comp, neighbor, city, state, cep, paymentMethod) {
  const orderNum = 'GF-' + Math.floor(10000 + Math.random() * 90000);
  
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const servicesTotal = cart.reduce((acc, item) => acc + (item.optionPrice * item.quantity), 0);
  const discount = paymentMethod.includes('PIX') && !paymentMethod.includes('entrega') ? subtotal * 0.05 : 0;
  const total = subtotal - discount + servicesTotal;
  
  // Update Success UI Elements
  document.getElementById('order-number-val').textContent = orderNum;
  document.getElementById('success-client-name').textContent = clientName;
  document.getElementById('success-client-total').textContent = formatPrice(total);
  document.getElementById('success-client-payment').textContent = paymentMethod;
  
  const successOverlay = document.getElementById('checkout-success');
  if (successOverlay) successOverlay.classList.add('active');
  
  // Set WhatsApp button message
  const waBtn = document.getElementById('success-whatsapp-btn');
  if (waBtn) {
    waBtn.onclick = () => {
      let itemsListText = '';
      cart.forEach(item => {
        itemsListText += `• *${item.quantity}x ${item.name}* (${item.brand})
  └ _Serviço: ${item.optionName}_ - ${formatPrice((item.price + item.optionPrice) * item.quantity)}\n`;
      });
      
      const compText = comp ? ` (Complemento: ${comp})` : '';
      const addressText = `${street}, Nº ${number}${compText}, Bairro ${neighbor}, ${city} - ${state} (CEP: ${cep})`;
      
      const message = `Olá Gela Fácil! Confirmando meu pedido finalizado no site:
  
*Pedido:* #${orderNum}
*Cliente:* ${clientName}
*WhatsApp:* ${phone}
*E-mail:* ${email}

*Endereço de Entrega:*
${addressText}

*Itens do Pedido:*
${itemsListText}
*Subtotal:* ${formatPrice(subtotal)}
*Serviços:* ${servicesTotal > 0 ? formatPrice(servicesTotal) : 'Grátis'}
${discount > 0 ? `*Desconto PIX (5%):* - ${formatPrice(discount)}\n` : ''}*Valor Total Geral:* ${formatPrice(total)}

*Forma de Pagamento:* ${paymentMethod}

Por favor, me confirme o agendamento da entrega/instalação. Obrigado!`;

      const encodedMsg = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/5527999999999?text=${encodedMsg}`;
      window.open(whatsappUrl, '_blank');
      
      // Clear cart after checkout submission is finished
      cart = [];
      saveCart();
      
      // Redirect to home page
      setTimeout(() => {
        window.location.href = '../index.html';
      }, 500);
    };
  }
}

// ── WIZARD STEP NAVIGATION AND VALIDATION ──
window.goToStep = function(stepNum) {
  // 1. Validate fields of current step if going forward
  if (stepNum === 2) {
    const name = document.getElementById('chk-name');
    const phone = document.getElementById('chk-phone');
    const email = document.getElementById('chk-email');
    
    if (name && !name.checkValidity()) { name.reportValidity(); return; }
    if (phone && !phone.checkValidity()) { phone.reportValidity(); return; }
    if (email && !email.checkValidity()) { email.reportValidity(); return; }
  }
  
  if (stepNum === 3) {
    const cep = document.getElementById('chk-cep');
    const street = document.getElementById('chk-street');
    const number = document.getElementById('chk-number');
    const neighborhood = document.getElementById('chk-neighborhood');
    const city = document.getElementById('chk-city');
    const state = document.getElementById('chk-state');
    
    if (cep && !cep.checkValidity()) { cep.reportValidity(); return; }
    if (street && !street.checkValidity()) { street.reportValidity(); return; }
    if (number && !number.checkValidity()) { number.reportValidity(); return; }
    if (neighborhood && !neighborhood.checkValidity()) { neighborhood.reportValidity(); return; }
    if (city && !city.checkValidity()) { city.reportValidity(); return; }
    if (state && !state.checkValidity()) { state.reportValidity(); return; }
  }
  
  // 2. Control Layout grid columns and column visibility based on step
  const summaryCol = document.getElementById('checkout-summary-col');
  const grid = document.getElementById('checkout-grid');
  const mainBack = document.getElementById('main-back-link');
  const wizardBack = document.getElementById('wizard-back-link');
  
  if (stepNum === 1) {
    if (summaryCol) summaryCol.style.display = 'block';
    if (grid) {
      grid.style.display = 'grid';
      grid.style.maxWidth = '1200px';
      grid.style.marginTop = '0';
    }
    if (mainBack) mainBack.style.display = 'inline-flex';
    if (wizardBack) wizardBack.style.display = 'none';
  } else {
    if (summaryCol) summaryCol.style.display = 'none';
    if (grid) {
      grid.style.display = 'block';
      grid.style.maxWidth = '680px';
      grid.style.marginTop = '48px';
    }
    if (mainBack) mainBack.style.display = 'none';
    if (wizardBack) wizardBack.style.display = 'inline-flex';
  }

  // 3. Switch visible wizard panels
  document.querySelectorAll('.wizard-panel').forEach(panel => {
    panel.classList.remove('active');
  });
  const targetPanel = document.getElementById(`wizard-panel-${stepNum}`);
  if (targetPanel) {
    targetPanel.classList.add('active');
  }
  
  // 4. Update step progress header states
  document.querySelectorAll('.wizard-step').forEach(stepIndicator => {
    const indStep = parseInt(stepIndicator.getAttribute('data-step'));
    if (indStep === stepNum) {
      stepIndicator.classList.add('active');
      stepIndicator.classList.remove('completed');
    } else if (indStep < stepNum) {
      stepIndicator.classList.remove('active');
      stepIndicator.classList.add('completed');
    } else {
      stepIndicator.classList.remove('active');
      stepIndicator.classList.remove('completed');
    }
  });
  
  // 5. Smooth scroll to top of window to avoid navigation bar covering content
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

// ── 3D CREDIT CARD PREVIEW INITIALIZATION ──
function setupCardPreview() {
  const cardNumInput = document.getElementById('card-number');
  const cardExpiryInput = document.getElementById('card-expiry');
  const cardCVVInput = document.getElementById('card-cvv');
  const cardHolderInput = document.getElementById('card-holder');
  const card3D = document.getElementById('card-3d-element');
  
  const cardNumDisplay = document.getElementById('card-num-display');
  const cardHolderDisplay = document.getElementById('card-holder-display-val');
  const cardExpiryDisplay = document.getElementById('card-expiry-display-val');
  const cardCVVDisplay = document.getElementById('card-cvv-display-val');
  
  if (!cardNumInput) return;
  
  // Format card number: Add spaces every 4 digits
  cardNumInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    e.target.value = formatted.substring(0, 19);
    cardNumDisplay.textContent = e.target.value || '•••• •••• •••• ••••';
  });
  
  // Format expiry: Add slash MM/AA
  cardExpiryInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2) {
      e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
    } else {
      e.target.value = value;
    }
    cardExpiryDisplay.textContent = e.target.value || 'MM/AA';
  });
  
  // CVV Input: Filter numbers, flip card on focus
  cardCVVInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 4);
    cardCVVDisplay.textContent = e.target.value || '•••';
  });
  
  cardCVVInput.addEventListener('focus', () => {
    if (card3D) card3D.classList.add('flipped');
  });
  
  cardCVVInput.addEventListener('blur', () => {
    if (card3D) card3D.classList.remove('flipped');
  });
  
  // Holder name input: Uppercase on the display
  cardHolderInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
    cardHolderDisplay.textContent = e.target.value.toUpperCase() || 'NOME DO TITULAR';
  });
}
