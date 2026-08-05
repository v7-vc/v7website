# Керування проєктами (адмінка) — безкоштовно, тільки для адміна

Проєкти на головній беруться зі списку у файлі **`src/data/projects.json`**.
Є два способи додати/змінити проєкт. Обидва **безкоштовні** й **тільки для адміна**
(бо писати в репозиторій можеш лише ти).

---

## Спосіб 1 (найпростіший, працює вже зараз) — редагувати JSON

Відкрий `src/data/projects.json`, додай об'єкт у масив `projects`:

```json
{
  "slug": "new-startup",
  "name": "New Startup",
  "category": "Fintech",
  "card": "/assets/images/new-startup.png",
  "url": "https://newstartup.com"
}
```

- **slug** — id для адреси `/projects/new-startup` (малими літерами, через дефіс).
- **card** — картинка-плитка. Поклади файл у `public/assets/images/` (або `public/uploads/`)
  і вкажи шлях від кореня сайту (як вище). Рекомендований розмір ~1600×900.

Збережи → commit → push. Хостинг сам пересобере сайт. Готово.

---

## Спосіб 2 (зручна форма-адмінка) — Sveltia CMS на `/admin`

Дає веб-інтерфейс: заходиш на `https://ТВІЙ-САЙТ/admin`, логінишся через **GitHub**,
заповнюєш форму (назва, категорія, картинка, лінк), тиснеш **Save** — CMS сама
робить commit у репозиторій, сайт пересобирається.

**Тільки адмін:** увійти й зберегти можуть лише GitHub-акаунти з доступом на запис
до репозиторію `v7-vc/v7website`. Стороння людина навіть залогінитись не зможе.

**Повністю безкоштовно:** немає власного сервера/бекенду/бази — усе на безкоштовних
тарифах GitHub + хостинг (Vercel / Netlify / Cloudflare Pages).

### Одноразове налаштування (після деплою)

GitHub-логін потребує крихітного безкоштовного «OAuth-проксі». Кроки:

1. **GitHub → Settings → Developer settings → OAuth Apps → New OAuth App.**
   - Homepage URL: `https://ТВІЙ-САЙТ`
   - Authorization callback URL: `https://ТВІЙ-САЙТ/callback` (тимчасово; заміниш нижче)
   - Збережи `Client ID` і згенеруй `Client Secret`.
2. **Розгорни безкоштовний проксі** `sveltia-cms-auth` на **Cloudflare Workers**
   (безкоштовний план) — інструкція: https://github.com/sveltia/sveltia-cms-auth
   Впиши туди `Client ID` та `Client Secret`. Отримаєш адресу воркера
   `https://xxxx.workers.dev`.
3. У GitHub OAuth App онови **Authorization callback URL** на
   `https://xxxx.workers.dev/callback`.
4. У `public/admin/config.yml` розкоментуй і встав:
   ```yaml
   backend:
     name: github
     repo: v7-vc/v7website
     branch: main
     base_url: https://xxxx.workers.dev
   ```
5. Задеплой. Заходь на `/admin` → «Login with GitHub» → керуй проєктами.

> Альтернатива без свого воркера: Sveltia також підтримує вхід через акаунт
> хостингу (напр. Cloudflare Pages / Netlify) — див. їхні доки, теж безкоштовно.
