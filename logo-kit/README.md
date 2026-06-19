# greemlab — logo kit

Готовые «заготовки» работы с логотипом. Чистая PNG-маска (`assets/logo-mask.png`, белое лого на прозрачном фоне) превращается в красивый, перекрашиваемый и анимированный элемент **только средствами CSS**, без правки самой картинки.

> Исходник `assets/logo.png` — большая «парадная» картинка со встроенным гало и звёздами. Из неё генерируется чистая `assets/logo-mask.png` (через корневой `assets/_build_logo.py`), которая и используется как CSS-маска. Так свечение от `drop-shadow` получается ровно круглым, без квадратного силуэта.

## Что внутри

```
logo-kit/
├── index.html          # витрина: все варианты + кнопки «скопировать сниппет»
├── logo.css            # вся логика (маска, анимации, темы, размеры)
├── logo.js             # параллакс по курсору (опционально)
├── showcase.css        # стили только для витрины
├── showcase.js         # копирование сниппетов на витрине
├── assets/
│   ├── logo.png        # «парадная» версия со встроенным гало (для og:image и т.п.)
│   ├── logo-mask.png   # чистая маска (белое на прозрачном) — используется CSS
│   └── favicon.svg     # SVG-фавиконка с авто-инверсией под светлую тему
└── snippets/           # самостоятельные демки — открой любой в браузере
    ├── 01-basic.html
    ├── 02-floating.html
    ├── 03-parallax.html
    ├── 04-halo.html
    ├── 05-themes.html
    ├── 06-full-preset.html
    └── 07-inverse.html
```

## Как смотреть

Локально (любой статический сервер, потому что CSS-маска не работает по `file://` в Safari/Chrome):

```bash
cd "/Users/greem4/project/web/web profile"
python3 -m http.server 8765 --bind 127.0.0.1
# открой http://127.0.0.1:8765/logo-kit/
```

## Как трюк работает

PNG — белое лого на чёрном фоне, **без альфа-канала**. Чтобы убрать чёрный фон чисто в CSS, картинка применяется как **маска в режиме яркости**:

```css
.logo {
  background: linear-gradient(180deg, #fff, #d6deff);  /* «заливка» лого */
  -webkit-mask-image: url("assets/logo.png");
  -webkit-mask-size: contain;
  -webkit-mask-repeat: no-repeat;
  -webkit-mask-position: center;
  -webkit-mask-source-type: luminance;   /* ← важно! */
          mask-image: url("assets/logo.png");
          mask-size: contain;
          mask-repeat: no-repeat;
          mask-position: center;
          mask-mode: luminance;          /* ← важно! */
}
```

- Белые пиксели → элемент **виден**.
- Чёрные пиксели → элемент **прозрачен**.
- Заливку (`background`) можно сделать любой: цвет, градиент, картинку, конический градиент и т.д.

Благодаря этому лого «парит» прямо в фоне страницы, без квадратной коробки PNG.

## Использование в своём проекте

1. Положи свой логотип `assets/logo.png` (белое на чёрном).
2. Подключи `logo.css`.
3. Используй HTML-сниппеты ниже.

> Если у тебя другая структура — переопредели путь:
> `style="--logo-url:url('/static/img/logo.png')"`

### Базовый

```html
<div class="logo logo--glow"></div>
```

### Плавающий (float + drift + sway)

```html
<div class="logo logo--glow logo--floating"></div>
```

### Параллакс по курсору

```html
<div class="logo logo--glow logo--parallax"></div>
<script src="logo.js" defer></script>
```

### С пульсирующим ореолом

```html
<div class="logo-halo">
  <div class="logo logo--floating"></div>
</div>
```

### Цветовая тема (любой `--theme-*`)

```html
<div class="logo logo--glow logo--theme-fire"></div>
<div class="logo logo--glow logo--theme-violet"></div>
```

Или свой цвет — переменными:

```html
<div class="logo logo--glow" style="
  --logo-fill: linear-gradient(180deg, #fff, #ff5b9e);
  --logo-glow: rgba(255, 90, 160, .7);
"></div>
```

### Размеры

```html
<div class="logo logo--glow logo--xs"></div>  <!-- 48 -->
<div class="logo logo--glow logo--sm"></div>  <!-- 96 -->
<div class="logo logo--glow logo--md"></div>  <!-- 160 -->
<div class="logo logo--glow logo--lg"></div>  <!-- 240 -->
<div class="logo logo--glow logo--xl"></div>  <!-- 340 -->
<div class="logo logo--glow" style="--logo-size:180px"></div>
```

### Тёмное лого на светлом фоне

```html
<div class="logo logo--inverse"></div>
```

### Полный пресет (как на главной greemlab.ru)

```html
<div class="logo-halo">
  <div class="logo logo--glow logo--floating logo--parallax logo--lg"></div>
</div>
<script src="logo.js" defer></script>
```

## CSS-переменные

| Переменная       | Назначение                          | По умолчанию                                                   |
|------------------|-------------------------------------|----------------------------------------------------------------|
| `--logo-url`     | путь к PNG                          | `url("assets/logo.png")`                                        |
| `--logo-size`    | размер квадратного контейнера       | `clamp(160px, 28vw, 220px)`                                     |
| `--logo-fill`    | «краска» лого (color/gradient)      | белый → светло-голубой градиент                                 |
| `--logo-glow`    | основной цвет glow                  | `rgba(255, 255, 255, 0.55)`                                     |
| `--logo-glow-2`  | вторичный, более широкий glow       | `rgba(180, 200, 255, 0.25)`                                     |

## Каталог классов

| Класс                  | Что делает                                              |
|------------------------|---------------------------------------------------------|
| `.logo`                | базовая маска + заливка                                 |
| `.logo--glow`          | двойной `drop-shadow` свечения                          |
| `.logo--floating`      | float + drift (поворот) + sway (масштаб)                |
| `.logo--parallax`      | сдвиг от курсора (нужен `logo.js`)                      |
| `.logo--pulse`         | пульсирующее свечение                                   |
| `.logo--inverse`       | чёрный градиент вместо белого                           |
| `.logo--theme-*`       | `ice`/`fire`/`mint`/`violet`/`mono` пресеты             |
| `.logo--xs`…`.logo--xl`| фиксированные размеры                                   |
| `.logo-halo`           | обёртка с двумя пульсирующими радиальными ореолами     |

## Совместимость

- `mask-mode: luminance` / `-webkit-mask-source-type: luminance` — все современные браузеры (Chrome 120+, Safari 15.4+, Firefox 120+).
- Анимации `translate`/`rotate`/`scale` как отдельные свойства — все современные браузеры.
- При `prefers-reduced-motion: reduce` все анимации автоматически выключаются.
- На тач-устройствах параллакс не активируется.

## Что можно докрутить

- Векторизовать лого в SVG (см. вариант 10 на витрине — упрощённый макет) — тогда заливка станет идеально чёткой на любых dpi.
- Добавить тему `--theme-rainbow` через `conic-gradient`.
- Сделать `--logo-fill` анимированным (например, медленно вращающийся `conic-gradient`).
