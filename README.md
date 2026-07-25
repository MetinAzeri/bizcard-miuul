# BizCard

Metin Azeri'nin dijital kartviziti. Build adımı, npm bağımlılığı ya da sunucu gerektirmeyen, tarayıcıda doğrudan açılabilen tek dosyalık statik sayfalar.

## Dosyalar

- **`kartvizit.html`** — Vanilla HTML/CSS/JS ile hazırlanmış kartvizit.
- **`kartvizit-react.html`** — Aynı kartın React 18 + Babel Standalone (CDN üzerinden, build adımı yok) ile yazılmış fonksiyon bileşenli sürümü.
- **`docs/superpowers/plans/`** — Özellik implementasyon planları. `2026-07-23-vcard-download.md`, `kartvizit.html`'e "vCard'ı indir" butonu eklemek için henüz uygulanmamış bir plan içerir.
- **`.claude/skills/bizcard-conventions/`** — Proje konvansiyonları: bileşen kuralları (tek dosya, fonksiyon bileşeni), demo veri konumu (`src/data/card.js`) ve webhook veri sözleşmesi ("Kartı Kaydet" / "Toplantı Talep Et").

## Çalıştırma

Kurulum gerekmez, doğrudan tarayıcıda aç:

```bash
open kartvizit.html
# veya
open kartvizit-react.html
```
