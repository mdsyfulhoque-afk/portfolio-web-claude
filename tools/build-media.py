"""Optional authoring tool — NOT a build dependency.

Turns the owner's original photographs into the committed web media in assets/media/:
  <slug>-<w>.avif / .webp   colour versions at 480/960/1600 (never wider than the source)
  <slug>-ink-<w>.webp        the "ink" twin: greyscale, ordered 8x8 Bayer dither, tinted ink-on-paper
  and appends a 24px LQIP data URI to content/media.json.

Run from the repo root:  python tools/build-media.py
Requires Python 3.10+, Pillow >= 11 (AVIF) and numpy. Originals are read from ../photos (never copied into git).
EXIF/GPS metadata is stripped because images are re-encoded from pixel data only.
"""
import base64
import io
import json
import os
import sys

import numpy as np
from PIL import Image, ImageOps

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PHOTOS = os.path.normpath(os.path.join(ROOT, '..', 'photos'))
OUT = os.path.join(ROOT, 'assets', 'media')
CATALOGUE = os.path.join(ROOT, 'content', 'photos.json')
MEDIA_JSON = os.path.join(ROOT, 'content', 'media.json')
WIDTHS = [480, 960, 1600]
INK_WIDTHS = [240, 320, 480, 640, 960]
DOTS_ACROSS = 140  # every ink twin has the same halftone screen, so downscaling between variants stays mild
PAPER = np.array([0xf4, 0xf5, 0xf1], dtype=np.float32)
INK = np.array([0x0e, 0x12, 0x10], dtype=np.float32)

BAYER8 = np.array([
    [0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26],
    [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25],
    [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]], dtype=np.float32) / 64.0


def load(src, crop):
    im = Image.open(os.path.join(PHOTOS, src))
    im = ImageOps.exif_transpose(im).convert('RGB')
    if crop:  # crop = [left, top, right, bottom] as fractions
        w, h = im.size
        l, t, r, b = crop
        im = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
    return im


def ink(im, cell=None):
    """Ordered-dither ink twin. cell = size of one dither dot in output pixels (scaled so ~DOTS_ACROSS dots span the width)."""
    cell = cell or max(2, round(im.size[0] / DOTS_ACROSS))
    g = np.asarray(ImageOps.autocontrast(im.convert('L'), cutoff=1), dtype=np.float32) / 255.0
    h, w = g.shape
    small = Image.fromarray((g * 255).astype(np.uint8)).resize((max(1, w // cell), max(1, h // cell)), Image.BILINEAR)
    s = np.asarray(small, dtype=np.float32) / 255.0
    s = np.clip((np.power(s, 0.8) - 0.5) * 1.15 + 0.5, 0, 1)  # lift mid-tones, then a little contrast
    th = np.tile(BAYER8, (s.shape[0] // 8 + 1, s.shape[1] // 8 + 1))[: s.shape[0], : s.shape[1]]
    bits = (s > th).astype(np.float32)[..., None]
    rgb = INK * (1 - bits) + PAPER * bits
    out = Image.fromarray(rgb.astype(np.uint8)).resize((w, h), Image.NEAREST)
    return out


def lqip(im):
    t = im.copy()
    t.thumbnail((24, 24))
    buf = io.BytesIO()
    t.save(buf, 'WEBP', quality=40)
    return 'data:image/webp;base64,' + base64.b64encode(buf.getvalue()).decode()


def main():
    cat = json.load(open(CATALOGUE, encoding='utf-8'))
    os.makedirs(OUT, exist_ok=True)
    media = {}
    for p in cat['photos']:
        slug, src = p['slug'], p['source']
        im = load(src, p.get('crop'))
        w0, h0 = im.size
        widths = sorted({w for w in WIDTHS if w < w0} | {min(w0, WIDTHS[-1])})
        for w in widths:
            r = im.resize((w, round(h0 * w / w0)), Image.LANCZOS) if w != w0 else im
            r.save(os.path.join(OUT, f'{slug}-{w}.avif'), 'AVIF', quality=52, speed=6)
            r.save(os.path.join(OUT, f'{slug}-{w}.webp'), 'WEBP', quality=74, method=6)
        ink_widths = [w for w in INK_WIDTHS if w <= w0] or [w0]
        for w in ink_widths:
            r = im.resize((w, round(h0 * w / w0)), Image.LANCZOS) if w != w0 else im
            ink(r).save(os.path.join(OUT, f'{slug}-ink-{w}.webp'), 'WEBP', quality=82, method=6)
        media[slug] = {'w': w0, 'h': h0, 'widths': widths, 'inkWidths': ink_widths, 'lqip': lqip(im)}
        print(f'{slug:34} {w0}x{h0}  widths={widths}')
    json.dump(media, open(MEDIA_JSON, 'w', encoding='utf-8'), indent=1)
    total = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT))
    print(f'{len(media)} photos, {len(os.listdir(OUT))} files, {total // 1024} KB')


if __name__ == '__main__':
    sys.exit(main())
