(() => {
  const params = new URLSearchParams(window.location.search);
  if (params.get('admin') !== '1') return;

  const init = () => {
    const cfg = window.NEVERLAND_BUGS_CONFIG;
    if (!window.supabase || !cfg?.supabaseUrl || !cfg?.supabaseAnonKey) return;

    const client = window.supabase.createClient(cfg.supabaseUrl, cfg.supabaseAnonKey);
    const grid = document.getElementById('grid');
    if (!grid) return;

    let authorized = false;

    const notify = (message, isError = false) => {
      if (typeof window.toast === 'function') {
        window.toast(message);
        return;
      }
      if (isError) window.alert(message);
      else console.info(message);
    };

    const removeDeleteButtons = () => {
      document.querySelectorAll('.bug-delete-btn').forEach((button) => button.remove());
    };

    const deleteBug = async (card, button) => {
      if (!authorized) {
        notify('Нужны права администратора', true);
        return;
      }

      const id = card.dataset.id;
      if (!id) return;

      const ticket = card.querySelector('.ticket')?.textContent?.trim() || 'этот баг';
      const title = card.querySelector('h3')?.textContent?.trim() || '';
      const confirmed = window.confirm(
        `Удалить ${ticket}${title ? ` — ${title}` : ''}?\n\nБаг будет полностью удалён из базы. Отменить это действие нельзя.`
      );
      if (!confirmed) return;

      button.disabled = true;
      button.textContent = 'Удаление…';

      const { error } = await client.from('bugs').delete().eq('id', id);
      if (error) {
        button.disabled = false;
        button.textContent = 'Удалить';
        notify(`Ошибка удаления: ${error.message}`, true);
        return;
      }

      card.remove();
      notify(`${ticket} удалён`);
    };

    const addDeleteButtons = () => {
      if (!authorized) return;

      document.querySelectorAll('.card .adminbar.show').forEach((bar) => {
        if (bar.querySelector('.bug-delete-btn')) return;
        const card = bar.closest('.card');
        if (!card) return;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'btn danger bug-delete-btn';
        button.textContent = 'Удалить';
        button.title = 'Полностью удалить баг из базы';
        button.addEventListener('click', (event) => {
          event.preventDefault();
          event.stopPropagation();
          deleteBug(card, button);
        });
        bar.appendChild(button);
      });
    };

    const refreshAdminAccess = async () => {
      const { data: sessionData } = await client.auth.getSession();
      const userId = sessionData?.session?.user?.id;

      if (!userId) {
        authorized = false;
        removeDeleteButtons();
        return;
      }

      const { data, error } = await client
        .from('admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      authorized = !error && !!data;
      if (authorized) addDeleteButtons();
      else removeDeleteButtons();
    };

    const observer = new MutationObserver(() => addDeleteButtons());
    observer.observe(grid, { childList: true, subtree: true });

    client.auth.onAuthStateChange(() => {
      window.setTimeout(refreshAdminAccess, 0);
    });

    refreshAdminAccess();
  };

  if (document.readyState === 'loading') {
    window.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
