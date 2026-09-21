const passwordInput = document.getElementById('admin-pass');
const passwordToggle = document.getElementById('password-toggle');

passwordToggle.addEventListener('click', () => {
  const shouldShowPassword = passwordInput.type === 'password';

  passwordInput.type = shouldShowPassword ? 'text' : 'password';
  passwordToggle.setAttribute('aria-label', shouldShowPassword ? 'Ocultar senha' : 'Mostrar senha');
  passwordToggle.setAttribute('aria-pressed', String(shouldShowPassword));
  passwordToggle.querySelector('.password-icon-show').hidden = shouldShowPassword;
  passwordToggle.querySelector('.password-icon-hide').hidden = !shouldShowPassword;
});

document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  const button = event.target.querySelector('button[type="submit"]');
  if (button.disabled) return;
  button.disabled = true;
  button.textContent = 'Entrando…';

  const errorEl = document.getElementById('login-error');
  const payload = {
    user: document.getElementById('admin-user').value.trim(),
    password: passwordInput.value,
  };

  errorEl.classList.remove('visible');

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      errorEl.textContent = response.status === 401 ? 'Usuário ou senha inválidos.' : 'Não foi possível entrar. Tente novamente.';
      errorEl.classList.add('visible');
      return;
    }

    window.location.href = '/admin/';
  } catch {
    errorEl.textContent = 'Não foi possível conectar ao servidor.';
    errorEl.classList.add('visible');
  } finally {
    button.disabled = false;
    button.textContent = 'Entrar';
  }
});

