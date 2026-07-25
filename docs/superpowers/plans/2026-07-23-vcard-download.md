# vCard İndirme Butonu Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `kartvizit.html` dijital kartvizitine, tıklandığında Metin Azeri'nin iletişim bilgilerini standart bir `.vcf` (vCard 3.0) dosyası olarak indiren bir "vCard'ı indir" butonu eklemek.

**Architecture:** Saf, test edilebilir bir `buildVCard(profile)` fonksiyonu `vcard.js` dosyasında tanımlanır ve vCard 3.0 metnini üretir. Aynı dosyadaki `downloadVCard(profile)` fonksiyonu bu metni bir `Blob` olarak paketleyip tarayıcıda indirmeyi tetikler. `kartvizit.html` bu script'i `<script src="vcard.js">` ile yükler ve bir butonun `onclick`'inden çağırır.

**Tech Stack:** Vanilla JavaScript (ES5 fonksiyon tanımları, modül sistemi yok), Node.js yerleşik test çalıştırıcısı (`node --test`, `node:assert/strict`) — npm kurulumu gerekmez.

## Global Constraints

- Proje genelinde npm install / build adımı yok — sadece Node.js'in yerleşik test çalıştırıcısı kullanılır (`node --test`).
- `vcard.js` hem Node'da (`require`) hem tarayıcıda (`<script src>`, modül sistemi olmadan) çalışabilmeli.
- Mevcut `kartvizit.html` yapısı (tek dosya, inline `<style>`, harici bağımlılık yok) korunur — sadece bir `<script src="vcard.js">` eklenir.
- vCard alanları: Ad Soyad "Metin Azeri", Ünvan "Satış ve İş Geliştirme Direktörü", Telefon "+905353601808", E-posta "azerimetin@gmail.com", LinkedIn "https://www.linkedin.com/in/metinazeri/".

---

### Task 1: `buildVCard` fonksiyonu ve testi

**Files:**
- Create: `vcard.js`
- Test: `vcard.test.js`

**Interfaces:**
- Produces: `buildVCard(profile)` — `profile: { name: string, title: string, phone: string, email: string, linkedin: string }` → `string` (CRLF ile ayrılmış vCard 3.0 metni, `BEGIN:VCARD` ile başlar, `END:VCARD` ile biter).
- Produces: `downloadVCard(profile)` — aynı `profile` şeklini alır, `void` döner, tarayıcıda `buildVCard`'ı kullanıp `.vcf` indirmesini tetikler (Task 2'de kullanılacak).

- [ ] **Step 1: Başarısız olacak testi yaz**

`vcard.test.js` dosyasını oluştur:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildVCard } = require('./vcard.js');

test('buildVCard tüm alanları doğru vCard 3.0 formatında üretir', () => {
  const vcard = buildVCard({
    name: 'Metin Azeri',
    title: 'Satış ve İş Geliştirme Direktörü',
    phone: '+905353601808',
    email: 'azerimetin@gmail.com',
    linkedin: 'https://www.linkedin.com/in/metinazeri/',
  });

  const lines = vcard.split('\r\n');

  assert.equal(lines[0], 'BEGIN:VCARD');
  assert.equal(lines[1], 'VERSION:3.0');
  assert.equal(lines[2], 'FN:Metin Azeri');
  assert.equal(lines[3], 'TITLE:Satış ve İş Geliştirme Direktörü');
  assert.equal(lines[4], 'TEL;TYPE=CELL:+905353601808');
  assert.equal(lines[5], 'EMAIL:azerimetin@gmail.com');
  assert.equal(lines[6], 'URL:https://www.linkedin.com/in/metinazeri/');
  assert.equal(lines[7], 'END:VCARD');
});
```

- [ ] **Step 2: Testi çalıştır ve başarısız olduğunu doğrula**

Run: `node --test vcard.test.js`
Expected: FAIL — `Error: Cannot find module './vcard.js'`

- [ ] **Step 3: Minimal implementasyonu yaz**

`vcard.js` dosyasını oluştur:

```js
function buildVCard(profile) {
  const { name, title, phone, email, linkedin } = profile;
  return [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${name}`,
    `TITLE:${title}`,
    `TEL;TYPE=CELL:${phone}`,
    `EMAIL:${email}`,
    `URL:${linkedin}`,
    'END:VCARD',
  ].join('\r\n');
}

function downloadVCard(profile) {
  const vcard = buildVCard(profile);
  const blob = new Blob([vcard], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${profile.name.replace(/\s+/g, '_')}.vcf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { buildVCard, downloadVCard };
}
```

- [ ] **Step 4: Testi çalıştır ve geçtiğini doğrula**

Run: `node --test vcard.test.js`
Expected: PASS — `# pass 1`, `# fail 0`

- [ ] **Step 5: Commit**

```bash
git add vcard.js vcard.test.js
git commit -m "feat: add buildVCard/downloadVCard helper with test"
```

---

### Task 2: Butonu `kartvizit.html`'e bağla

**Files:**
- Modify: `kartvizit.html`

**Interfaces:**
- Consumes: `downloadVCard(profile)` (Task 1'de tanımlandı) — global `window.downloadVCard` olarak `<script src="vcard.js">` yüklendikten sonra erişilebilir.

- [ ] **Step 1: `.vcard-btn` stilini `<style>` bloğuna ekle**

`kartvizit.html` içindeki `</style>` etiketinden hemen önce ekle:

```css
  .vcard-btn {
    margin-top: 20px;
    width: 100%;
    padding: 12px 16px;
    border: none;
    border-radius: 10px;
    background: var(--accent);
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    font-family: inherit;
  }

  .vcard-btn:hover {
    opacity: 0.9;
  }
```

- [ ] **Step 2: Butonu ve script etiketini ekle**

`kartvizit.html` içinde `.contact-list` div'ini kapatan `</div>` etiketinden hemen sonra (kartın `</div>` etiketinden önce) ekle:

```html
    <button
      class="vcard-btn"
      onclick="downloadVCard({
        name: 'Metin Azeri',
        title: 'Satış ve İş Geliştirme Direktörü',
        phone: '+905353601808',
        email: 'azerimetin@gmail.com',
        linkedin: 'https://www.linkedin.com/in/metinazeri/'
      })"
    >
      vCard'ı indir
    </button>
```

`</body>` etiketinden hemen önce ekle:

```html
  <script src="vcard.js"></script>
```

- [ ] **Step 3: Tarayıcıda manuel doğrulama**

Run: `open kartvizit.html`
Expected: Kartın altında "vCard'ı indir" butonu görünür. Butona tıklandığında `Metin_Azeri.vcf` dosyası indirilir. Dosya içeriği açıldığında `BEGIN:VCARD` ile başlayan, doğru ad/ünvan/telefon/e-posta/LinkedIn alanlarını içeren, `END:VCARD` ile biten bir metin görülür.

- [ ] **Step 4: Commit**

```bash
git add kartvizit.html
git commit -m "feat: add vCard download button to kartvizit.html"
```
