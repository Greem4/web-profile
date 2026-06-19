"""
Подготавливает чистые ассеты логотипа из исходного assets/logo.png.

Что делает:
1. logo-mask.png      — чистая RGBA-маска (белое лого, остальное прозрачно).
                        Используется и как CSS-маска, и как «исходник» для иконок.
2. favicon.svg        — векторная фавиконка с автоинверсией под светлую тему:
                        тёмная тема → белое лого, светлая → чёрное лого.
                        Лого занимает почти всё пространство (без подложки).
3. favicon-16/32/192/512.png — белое лого на прозрачном фоне, максимально крупно.
4. apple-touch-icon-180.png  — БЕЛОЕ лого на ЧЁРНОМ круге (Apple игнорирует
                        прозрачность и сама добавляет фон, лучше отдать готовый).
5. favicon.ico        — мульти-размерная иконка (16/32/48) на основе SVG-логики.

Источник: assets/logo.png (белое лого на чёрном «звёздном» фоне).
"""

import base64
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parent
SRC = ROOT / "logo.png"


def build_clean_mask() -> Image.Image:
    """Чистая чёрно-белая маска: только сам логотип, всё остальное — чёрное."""
    src = Image.open(SRC).convert("L")  # grayscale
    w, h = src.size

    # 1) Threshold: всё, что заметно темнее белого, делаем чёрным.
    #    Так уходят звёзды, шум и встроенное в PNG гало.
    THRESH = 180
    binar = src.point(lambda v: 255 if v >= THRESH else 0, mode="L")

    # 2) Лёгкое размытие + повторный threshold = гладкие края без «лесенки».
    binar = binar.filter(ImageFilter.GaussianBlur(radius=0.6))
    binar = binar.point(lambda v: 255 if v >= 128 else 0, mode="L")

    # 3) Делаем квадрат (вписываем по большей стороне) — удобнее для маски.
    side = max(w, h)
    canvas = Image.new("L", (side, side), 0)
    canvas.paste(binar, ((side - w) // 2, (side - h) // 2))

    # 4) Обрезаем по кругу — никакие случайные точки за пределами круга
    #    не попадут в маску, drop-shadow в CSS будет идеально круглым.
    circle = Image.new("L", (side, side), 0)
    ImageDraw.Draw(circle).ellipse((0, 0, side - 1, side - 1), fill=255)
    out = Image.new("L", (side, side), 0)
    out.paste(canvas, (0, 0), mask=circle)

    return out


def _crop_to_content(mask: Image.Image) -> Image.Image:
    """Обрезаем прозрачные поля вокруг лого — чтобы оно занимало всю иконку."""
    bbox = mask.getbbox()
    if bbox is None:
        return mask
    cropped = mask.crop(bbox)
    side = max(cropped.size)
    square = Image.new("L", (side, side), 0)
    square.paste(cropped, ((side - cropped.size[0]) // 2,
                           (side - cropped.size[1]) // 2))
    return square


def build_favicon_transparent(mask: Image.Image, size: int,
                              fill=(255, 255, 255, 255),
                              pad_ratio: float = 0.04) -> Image.Image:
    """
    Favicon: лого нужного цвета на ПРОЗРАЧНОМ фоне, максимально крупно.
    pad_ratio — небольшой отступ, чтобы лого не упиралось в края (anti-alias).
    """
    tight = _crop_to_content(mask)
    pad = max(1, int(size * pad_ratio))
    inner = size - pad * 2
    logo = tight.resize((inner, inner), Image.LANCZOS)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    fill_layer = Image.new("RGBA", (inner, inner), fill)
    img.paste(fill_layer, (pad, pad), mask=logo)
    return img


def build_apple_touch(mask: Image.Image, size: int = 180) -> Image.Image:
    """
    Apple touch icon: iOS не уважает прозрачность и добавит свой фон,
    поэтому отдаём готовый — белое лого на чёрном круге со скруглением.
    """
    tight = _crop_to_content(mask)
    pad = int(size * 0.12)
    inner = size - pad * 2
    logo = tight.resize((inner, inner), Image.LANCZOS)

    img = Image.new("RGBA", (size, size), (0, 0, 0, 255))
    white = Image.new("RGBA", (inner, inner), (255, 255, 255, 255))
    img.paste(white, (pad, pad), mask=logo)
    return img


def build_svg_favicon(mask: Image.Image) -> str:
    """
    SVG-фавиконка: встроенный PNG + автоинверсия по prefers-color-scheme.
    Tёмная тема → белое лого, светлая тема → чёрное.
    """
    tight = _crop_to_content(mask)
    # Делаем разумного размера PNG для встраивания (256 — баланс качества и веса).
    side = 256
    resized = tight.resize((side, side), Image.LANCZOS)
    white = Image.new("RGBA", (side, side), (255, 255, 255, 0))
    white.paste(Image.new("RGBA", (side, side), (255, 255, 255, 255)),
                (0, 0), mask=resized)

    buf = ROOT / ".__tmp_fav.png"
    white.save(buf, optimize=True)
    b64 = base64.b64encode(buf.read_bytes()).decode()
    buf.unlink()

    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side} {side}">
  <style>
    @media (prefers-color-scheme: light) {{
      image {{ filter: invert(1); }}
    }}
  </style>
  <image href="data:image/png;base64,{b64}" width="{side}" height="{side}"/>
</svg>
'''


def main() -> None:
    mask = build_clean_mask()

    # Сохраняем маску как RGBA: белые пиксели лого → alpha=255 (видимо),
    # чёрные → alpha=0 (прозрачно). Тогда CSS-маска работает по alpha
    # без всяких mask-mode: luminance и одинаково во всех браузерах.
    rgba = Image.new("RGBA", mask.size, (255, 255, 255, 0))
    rgba.putalpha(mask)
    rgba.save(ROOT / "logo-mask.png", optimize=True)

    # PNG-фавиконки: белое лого на прозрачном фоне, по краю.
    for px in (16, 32, 192, 512):
        ico = build_favicon_transparent(mask, px)
        ico.save(ROOT / f"favicon-{px}.png", optimize=True)

    # Apple touch icon — с подложкой (iOS не любит прозрачность).
    build_apple_touch(mask, 180).save(
        ROOT / "apple-touch-icon.png", optimize=True
    )

    # SVG-фавиконка с автоинверсией под светлую тему.
    (ROOT / "favicon.svg").write_text(build_svg_favicon(mask), encoding="utf-8")

    # ICO для совместимости со старыми браузерами / системами:
    # белое лого на ЧЁРНОМ круге (большинство мест, где .ico показывается,
    # имеют светлый фон — без подложки лого пропадёт).
    src = build_favicon_transparent(mask, 64).convert("RGBA")
    bg = Image.new("RGBA", src.size, (0, 0, 0, 255))
    circle = Image.new("L", src.size, 0)
    ImageDraw.Draw(circle).ellipse((0, 0, src.size[0] - 1, src.size[1] - 1),
                                   fill=255)
    bg.putalpha(circle)
    composed = Image.alpha_composite(bg, src)
    composed.save(ROOT / "favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

    print("OK:", sorted(p.name for p in ROOT.iterdir() if p.is_file()))


if __name__ == "__main__":
    main()
