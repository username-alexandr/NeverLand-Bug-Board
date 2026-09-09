window.NEVERLAND_BUGS_CONFIG = {
  supabaseUrl: "https://tlrncydsgydyjarikbal.supabase.co",
  supabaseAnonKey: "sb_publishable_BPjn9FNwA3zZDEYkUhLt2w_ML9Dq7rH"
};

(() => {
  const params = new URLSearchParams(window.location.search);
  const adminRoute = params.get('admin') === '1';
  const logoPayloadUrl = new URL('neverland-logo-header-crisp.b64.txt?v=17', document.baseURI).href;
  const faviconUrl = new URL('favicon.svg?v=16', document.baseURI).href;
  let logoDataUrl = null;

  async function loadLogoDataUrl() {
    if (logoDataUrl) return logoDataUrl;
    const response = await fetch(logoPayloadUrl, { cache: 'no-store' });
    if (!response.ok) throw new Error('Не удалось загрузить HQ-логотип');
    const base64 = (await response.text()).trim();
    logoDataUrl = `data:image/png;base64,${base64}`;
    return logoDataUrl;
  }

  // HQ-логотип 384×384: отображаем без CSS-растяжения, чтобы сохранить резкость.
  const brandStyle = document.createElement('style');
  brandStyle.textContent = `
    .brand{gap:28px!important;align-items:center!important;}
    .logo{
      width:116px!important;
      height:116px!important;
      padding:0!important;
      border-radius:0!important;
      background:none!important;
      box-shadow:none!important;
      overflow:visible!important;
      display:grid!important;
      place-items:center!important;
      flex:0 0 116px;
    }
    .logo img{
      width:116px;
      height:116px;
      display:block;
      object-fit:contain;
      border-radius:0;
      transform:none!important;
      image-rendering:auto;
      filter:drop-shadow(0 0 8px rgba(157,92,255,.16)) drop-shadow(0 0 5px rgba(87,230,219,.08));
    }
    @media(max-width:620px){
      .brand{gap:20px!important;}
      .logo{
        width:88px!important;
        height:88px!important;
        flex-basis:88px;
      }
      .logo img{
        width:88px;
        height:88px;
        transform:none!important;
      }
    }
  `;
  document.head.appendChild(brandStyle);

  // Favicon оставляем отдельным — он уже корректно отображается во вкладке.
  let favicon = document.querySelector('link[rel="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.appendChild(favicon);
  }
  favicon.type = 'image/svg+xml';
  favicon.href = faviconUrl;

  let shortcut = document.querySelector('link[rel="shortcut icon"]');
  if (!shortcut) {
    shortcut = document.createElement('link');
    shortcut.rel = 'shortcut icon';
    document.head.appendChild(shortcut);
  }
  shortcut.type = 'image/svg+xml';
  shortcut.href = faviconUrl;

  // На обычной публичной странице кнопка администратора не показывается.
  if (!adminRoute) {
    const style = document.createElement('style');
    style.textContent = '#adminBtn{display:none!important}';
    document.head.appendChild(style);
  }

  window.addEventListener('DOMContentLoaded', async () => {
    try {
      const loadedLogo = await loadLogoDataUrl();
      const logo = document.querySelector('.logo');
      if (logo) {
        logo.textContent = '';
        const image = document.createElement('img');
        image.src = loadedLogo;
        image.alt = 'NeverLand';
        image.width = 116;
        image.height = 116;
        logo.appendChild(image);
      }
    } catch (error) {
      console.error(error);
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
