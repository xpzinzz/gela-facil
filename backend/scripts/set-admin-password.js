const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = String(process.env.SUPABASE_URL || '').trim();
const serviceRoleKey = String(process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const username = String(process.env.ADMIN_USER || '').trim();
const password = String(process.env.ADMIN_PASSWORD || '');

function validateConfiguration() {
  const missing = [];
  if (!supabaseUrl) missing.push('SUPABASE_URL');
  if (!serviceRoleKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
  if (!username) missing.push('ADMIN_USER');
  if (!password) missing.push('ADMIN_PASSWORD');

  if (missing.length) {
    throw new Error(`Configure no backend/.env: ${missing.join(', ')}`);
  }
  if (!/^[a-zA-Z0-9._-]{3,64}$/.test(username)) {
    throw new Error('ADMIN_USER deve ter de 3 a 64 caracteres e usar apenas letras, numeros, ponto, hifen ou sublinhado.');
  }
  if (password.length < 12 || password.length > 128) {
    throw new Error('ADMIN_PASSWORD deve ter entre 12 e 128 caracteres.');
  }
  if (password.startsWith('$2')) {
    throw new Error('ADMIN_PASSWORD deve conter a senha original, nao um hash bcrypt.');
  }
}

async function setAdminPassword() {
  validateConfiguration();

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const passwordHash = await bcrypt.hash(password, 12);
  const { data: existing, error: findError } = await supabase
    .from('admin_users')
    .select('id')
    .eq('username', username)
    .maybeSingle();

  if (findError) throw findError;

  const query = existing
    ? supabase
      .from('admin_users')
      .update({ password_hash: passwordHash, active: true })
      .eq('id', existing.id)
    : supabase
      .from('admin_users')
      .insert({ username, password_hash: passwordHash, active: true });
  const { error: saveError } = await query;

  if (saveError) throw saveError;
  console.log(existing ? `Senha do administrador "${username}" atualizada.` : `Administrador "${username}" criado.`);
  console.log('Remova ADMIN_PASSWORD do backend/.env e reinicie o servidor apos confirmar o login.');
}

setAdminPassword().catch((error) => {
  console.error(`Nao foi possivel configurar o administrador: ${error.message}`);
  process.exitCode = 1;
});
