# NeverLand Bug Board

Публичная доска багов проекта NeverLand.

## Возможности
- просмотр багов по общей ссылке;
- отправка новых багов пользователями;
- статусы: Новый, Подтверждён, В работе, Исправлен, Отклонён;
- приоритеты и фильтрация;
- отдельный вход администратора для изменения статусов;
- общая база через Supabase;
- публикация через GitHub Pages.

## Настройка базы
1. Создайте проект Supabase.
2. Выполните `supabase-schema.sql` в SQL Editor.
3. Создайте администратора в Supabase Authentication.
4. Добавьте его в `public.admins` командой из конца SQL-файла.
5. Заполните `config.js` значениями Project URL и anon/public key.

> `anon`/public key допустимо хранить во frontend. Не размещайте `service_role` key в репозитории.

## GitHub Pages
Репозиторий содержит workflow `.github/workflows/pages.yml`, который публикует сайт из ветки `main`.
