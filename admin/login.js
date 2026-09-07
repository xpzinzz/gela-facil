document.getElementById('login-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const errorEl = document.getElementById('login-error');
  const payload = {
    user: document.getElementById('admin-user').value.trim(),
    password: document.getElementById('admin-pass').value,
  };

  errorEl.classList.remove('visible');

  try {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      errorEl.classList.add('visible');
      return;
    }

    window.location.href = '/admin/';
  } catch {
    errorEl.textContent = 'Nao foi possivel conectar ao servidor.';
    errorEl.classList.add('visible');
  }
});

