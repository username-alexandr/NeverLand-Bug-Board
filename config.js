window.NEVERLAND_BUGS_CONFIG = {
  supabaseUrl: "https://tlrncydsgydyjarikbal.supabase.co",
  supabaseAnonKey: "sb_publishable_BPjn9FNwA3zZDEYkUhLt2w_ML9Dq7rH"
};

(() => {
  const params = new URLSearchParams(window.location.search);
  const adminRoute = params.get('admin') === '1';
  const logoUrl = new URL('neverland-logo-header.png?v=14', document.baseURI).href;

  // Полная фирменная эмблема без обрезания и без фоновой плитки.
  const brandStyle = document.createElement('style');
  brandStyle.textContent = `
    .brand{gap:16px!important;align-items:center!important;}
    .logo{
      width:104px!important;
      height:104px!important;
      padding:0!important;
      border-radius:0!important;
      background:none!important;
      box-shadow:none!important;
      overflow:visible!important;
      display:grid!important;
      place-items:center!important;
      flex:0 0 104px;
    }
    .logo img{
      width:104px;
      height:104px;
      display:block;
      object-fit:contain;
      border-radius:0;
      filter:drop-shadow(0 0 12px rgba(157,92,255,.24)) drop-shadow(0 0 7px rgba(87,230,219,.12));
    }
    @media(max-width:620px){
      .logo{
        width:82px!important;
        height:82px!important;
        flex-basis:82px;
      }
      .logo img{
        width:82px;
        height:82px;
      }
    }
  `;
  document.head.appendChild(brandStyle);

  // Реальный PNG favicon вместо динамического data: URL.
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.type = 'image/png';
  favicon.sizes = '128x128';
  favicon.href = logoUrl;

  let shortcut = document.querySelector('link[rel="shortcut icon"]');
  if (!shortcut) {
    shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    document.head.appendChild(shortcut);
  }
  shortcut.type = 'image/png';
  shortcut.href = logoUrl;

  // На обычной публичной странице кнопка администратора не показывается.
  if (!adminRoute) {
    const style = document.createElement('style');
    style.textContent = '#adminBtn{display:none!important}';
    document.head.appendChild(style);
  }

  window.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    if (logo) {
      logo.textContent = '';
      const image = document.createElement('img');
      image.src = logoUrl;
      image.alt = 'NeverLand';
      image.width = 104;
      image.height = 104;
      logo.appendChild(image);
    }

    const adminBtn = document.getElementById('adminBtn');
    const adminModal = document.getElementById('adminModal');
    const loginForm = document.getElementById('loginForm');

    if (!adminRoute) {
      if (adminBtn) adminBtn.style.display = 'none';
      return;
    }

    if (adminBtn) {
      adminBtn.style.display = '';
      if (adminBtn.textContent.trim() === 'Админ') adminBtn.textContent = 'Вход администратора';
    }

    if (!adminModal || !loginForm || document.getElementById('adminRegisterBlock')) return;

    const block = document.createElement('div');
    block.id = 'adminRegisterBlock';
    block.style.cssText = 'margin-top:16px;padding-top:16px;border-top:1px solid #2a2940';
    block.innerHTML = `
      <div style="font-size:13px;color:#a9a5bd;margin-bottom:10px">
        Нет админ-аккаунта? Зарегистрируй его здесь. После регистрации владелец проекта должен отдельно выдать этому email права администратора.
      </div>
      <button type="button" class="btn ghost" id="showRegisterBtn" style="width:100%">Зарегистрировать админ-аккаунт</button>
      <form id="registerAdminForm" style="display:none;margin-top:12px">
        <label>Email</label>
        <input class="field" name="email" type="email" required autocomplete="email" />
        <div style="height:10px"></div>
        <label>Пароль</label>
        <input class="field" name="password" type="password" minlength="8" required autocomplete="new-password" />
        <div style="height:10px"></div>
        <label>Повторите пароль</label>
        <input class="field" name="password2" type="password" minlength="8" required autocomplete="new-password" />
        <div class="actions"><button class="btn primary" type="submit">Создать аккаунт</button></div>
        <div id="registerAdminMessage" style="display:none;margin-top:10px;font-size:13px;line-height:1.45"></div>
      </form>`;
    loginForm.insertAdjacentElement('afterend', block);

    const showBtn = document.getElementById('showRegisterBtn');
    const form = document.getElementById('registerAdminForm');
    const message = document.getElementById('registerAdminMessage');

    showBtn.addEventListener('click', () => {
      const open = form.style.display !== 'none';
      form.style.display = open ? 'none' : 'block';
      showBtn.textContent = open ? 'Зарегистрировать админ-аккаунт' : 'Скрыть регистрацию';
    });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const data = new FormData(form);
      const email = String(data.get('email') || '').trim();
      const password = String(data.get('password') || '');
      const password2 = String(data.get('password2') || '');

      message.style.display = 'block';
      message.style.color = '#ffb0b8';

      if (password !== password2) {
        message.textContent = 'Пароли не совпадают.';
        return;
      }
      if (password.length < 8) {
        message.textContent = 'Пароль должен содержать не менее 8 символов.';
        return;
      }

      const cfg = window.NEVERLAND_BUGS_CONFIG;
      const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
      const { data: signUpData, error } = await client.auth.signUp({ email, password });

      if (error) {
        message.textContent = 'Ошибка регистрации: ' + error.message;
        return;
      }

      if (signUpData?.session) await client.auth.signOut();
      form.reset();
      message.style.color = '#a8efc0';
      message.textContent = 'Аккаунт создан. Если Supabase запросит подтверждение email — подтвердите его. Затем передайте владельцу проекта только email для выдачи админ-прав.';
    });
  });
})();
