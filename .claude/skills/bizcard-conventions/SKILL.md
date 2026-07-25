---
name: bizcard-conventions
description: Use when creating, modifying, or reviewing BizCard components, the demo card data, or the "Kartı Kaydet"/"Toplantı Talep Et" webhook integrations — defines component structure rules, demo data location, and webhook JSON payload contracts for this project.
---

# BizCard Konvansiyonları

## Overview

BizCard, tek dosyalık, build adımı olmayan bir dijital kartvizit projesi (`kartvizit.html`, `kartvizit-react.html`) — React/Babel CDN üzerinden yüklenir, npm install veya bundler yok (bkz. `docs/superpowers/plans/2026-07-23-vcard-download.md`). Bu skill üç konvansiyonu sabitler: bileşen kuralları, demo veri konumu, webhook veri sözleşmesi.

## Bileşen Kuralları

- **Fonksiyon bileşeni**: Her bileşen bir fonksiyon olarak tanımlanır, class component kullanılmaz.
- **Tek dosya**: Tüm bileşenler aynı `<script type="text/babel">` bloğunda / aynı dosyada kalır — proje ayrı bileşen dosyalarına veya modül sistemine bölünmez.

Mevcut desen (`kartvizit-react.html`):

```jsx
function Avatar({ initials }) {
  return <div className="avatar">{initials}</div>;
}

function ContactList({ items }) {
  return (
    <div className="contact-list">
      {items.map((item) => (
        <a key={item.href} className="contact-item" href={item.href}>
          {item.icon}
          <span className="contact-text">{item.label}</span>
        </a>
      ))}
    </div>
  );
}
```

Yeni bir bileşen eklerken bu iki kurala uy: fonksiyon olarak tanımla, aynı dosyaya ekle.

## Demo Veri Konumu

Demo/örnek kart verisi `src/data/card.js` dosyasında tutulur (henüz oluşturulmadı — `src/` yapısına geçildiğinde `kartvizit-react.html` içindeki inline `const profile = {...}` objesi buraya taşınır).

Şema, mevcut `profile` objesiyle birebir aynıdır:

```js
// src/data/card.js
module.exports = {
  name: "Metin Azeri",
  title: "Satış ve İş Geliştirme Direktörü",
  initials: "MA",
  contacts: [
    { href: "tel:+905353601808", label: "0535 360 1808" },
    { href: "mailto:azerimetin@gmail.com", label: "azerimetin@gmail.com" },
    { href: "https://www.linkedin.com/in/metinazeri/", label: "linkedin.com/in/metinazeri", external: true },
  ],
};
```

`vcard.js`'deki gibi hem Node (`require`) hem tarayıcıda kullanılabilir olmalı.

## Webhook Veri Sözleşmesi

İki action tipi: `save_card` ve `meeting_request`. Her ikisinde de ortak alanlar: `action` (string) ve `timestamp` (ISO 8601). Tüm alan adları **camelCase**.

### Kartı Kaydet → `save_card`

Ziyaretçiden form istenmez; sadece hangi kartın kaydedildiği gönderilir.

```json
{
  "action": "save_card",
  "card": {
    "name": "Metin Azeri",
    "title": "Satış ve İş Geliştirme Direktörü",
    "phone": "+905353601808",
    "email": "azerimetin@gmail.com",
    "linkedin": "https://www.linkedin.com/in/metinazeri/"
  },
  "timestamp": "2026-07-25T12:00:00Z"
}
```

### Toplantı Talep Et → `meeting_request`

Ziyaretçiden ad ve e-posta **zorunlu**; telefon, tercih edilen tarih ve mesaj **opsiyonel**.

```json
{
  "action": "meeting_request",
  "visitor": {
    "name": "Ayşe Yılmaz",
    "email": "ayse@example.com",
    "phone": "+905XXXXXXXXX"
  },
  "preferredDate": "2026-08-01T14:00:00Z",
  "message": "Ürün demosu için görüşmek istiyorum.",
  "timestamp": "2026-07-25T12:00:00Z"
}
```

`visitor.phone`, `preferredDate` ve `message` alanları yoksa payload'dan tamamen çıkarılır (boş string gönderilmez).

## Quick Reference

| Konu | Kural |
|---|---|
| Bileşen | Fonksiyon bileşeni, tek dosya (aynı `<script>` bloğu) |
| Demo veri | `src/data/card.js`, `module.exports` ile |
| Webhook — Kartı Kaydet | `action: "save_card"` + `card` + `timestamp` |
| Webhook — Toplantı Talep Et | `action: "meeting_request"` + `visitor.{name,email}` (zorunlu) + `visitor.phone`/`preferredDate`/`message` (opsiyonel) + `timestamp` |
| İsimlendirme | camelCase |
