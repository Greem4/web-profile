# greemlab.ru

Личный сайт-визитка. Чистый статический сайт без сборщиков и фреймворков — `HTML + CSS + ванильный JS`.

## Содержимое

```
.
├── index.html            # разметка визитки
├── styles.css            # стили (тёмный космос, glass, glow)
├── script.js             # анимированное звёздное небо + shooting stars
├── assets/
│   └── logo.png          # логотип
├── CNAME                 # домен greemlab.ru для GitHub Pages
├── .nojekyll             # отключение Jekyll
├── robots.txt
├── sitemap.xml
└── .github/workflows/
    └── deploy.yml        # автодеплой на GitHub Pages
```

## Локальный запуск

Просто открой `index.html` в браузере. Или запусти любой локальный сервер:

```bash
python3 -m http.server 8000
# открой http://localhost:8000
```

## Деплой на GitHub Pages с доменом greemlab.ru

### 1. Залить в репозиторий

```bash
git init -b main
git add .
git commit -m "init: personal site"
git remote add origin git@github.com:greem4/<repo-name>.git
git push -u origin main
```

> Рекомендуемое имя репозитория: `greem4.github.io` (тогда сайт доступен сразу как `https://greem4.github.io`), либо любое — `personal-site`, `greemlab`, и т.п.

### 2. Включить GitHub Pages

В репозитории: **Settings → Pages**:
- **Source**: `GitHub Actions`.

После пуша в `main` workflow `Deploy to GitHub Pages` развернёт сайт.

### 3. Привязать домен greemlab.ru

Файл `CNAME` уже в репозитории, GitHub его подхватит. В DNS-провайдере для `greemlab.ru` пропиши **либо** A-записи на apex, **либо** CNAME для `www`:

**Apex (greemlab.ru) — A-записи:**

| Type | Name | Value           |
|------|------|-----------------|
| A    | @    | 185.199.108.153 |
| A    | @    | 185.199.109.153 |
| A    | @    | 185.199.110.153 |
| A    | @    | 185.199.111.153 |
| AAAA | @    | 2606:50c0:8000::153 |
| AAAA | @    | 2606:50c0:8001::153 |
| AAAA | @    | 2606:50c0:8002::153 |
| AAAA | @    | 2606:50c0:8003::153 |

**www → apex:**

| Type  | Name | Value                  |
|-------|------|------------------------|
| CNAME | www  | greem4.github.io       |

Затем в **Settings → Pages → Custom domain** → введи `greemlab.ru` → дождись зелёной галки → включи **Enforce HTTPS**.

## Кастомизация

- Логотип: замени `assets/logo.png`.
- Ссылки: правь блок `<nav class="links">` в `index.html`.
- Цвета/радиусы: переменные в `:root` в `styles.css`.
- Плотность звёзд: константа `STAR_DENSITY` в `script.js`.

## Особенности

- Адаптивная вёрстка, поддержка safe-area на iOS.
- `prefers-reduced-motion`: анимации и канвас отключаются.
- Лёгкое (ничего не грузим кроме шрифтов Google), без трекеров.
- Open Graph / Twitter Card для красивых превью в Telegram и соцсетях.
