# QR Kod Ekleme — Tasarım

## Amaç

`kartvizit-react.html`'e, kartın canlı deploy edilmiş URL'ine işaret eden bir QR kod eklemek. QR kod, `qrcode.react` kütüphanesi kullanılarak üretilecek ve kartın içinde, iletişim listesinin altında gösterilecek.

## Kapsam

- Sadece `kartvizit-react.html` değişir. `kartvizit.html` (vanilla sürüm) bu işin kapsamı dışında.
- Proje genelindeki "build adımı yok, tek dosya, fonksiyon bileşeni" konvansiyonu korunur (bkz. `.claude/skills/bizcard-conventions/SKILL.md`).
- GitHub Pages, `MetinAzeri/bizcard-miuul` reposu için etkinleştirilir (kaynak: `main` dalı, kök dizin `/`).

## Mimari

Mevcut `kartvizit-react.html`, React 18 + Babel Standalone'u CDN üzerinden UMD script'leri olarak yükler ve JSX'i `<script type="text/babel">` içinde tarayıcıda transpile eder. `qrcode.react` ise npm/ESM odaklı bir kütüphane; bu ikisini aynı React ağacında (aynı React "instance"ında) birleştirmek, iki farklı React kopyası arasında hook çakışmasına (`Invalid hook call`) yol açabilir çünkü `QRCodeSVG` içeride `useMemo` kullanıyor.

Bu riski tamamen ortadan kaldırmak için **QR kod kendi bağımsız React root'unda render edilir**:

1. Mevcut Babel/JSX bloğu (mevcut kod stiliyle) `ProfileCard` içine boş bir `<div id="qr-code" className="qr-code"></div>` render eder. Bu div, ana React ağacının bir parçasıdır ama içeriği boştur.
2. Ayrı, ikinci bir `<script type="module">` bloğu (dosyanın sonuna, mevcut Babel script'inden sonra eklenir) şunları yapar:
   - `react`, `react-dom/client` ve `qrcode.react`'i `esm.sh` üzerinden native ES module olarak import eder (aynı CDN'den, aynı sürüm çözümlemesiyle — esm.sh bu importları otomatik dedupe eder, ayrıca bu kod kendi bağımsız root'unu kullandığı için ana uygulamanın React kopyasıyla hiç etkileşmez). Sürüm: implementasyon sırasında `qrcode.react`'in o anki en güncel kararlı major sürümü (örn. `esm.sh/qrcode.react@3`) kullanılır; kesin patch sürümü implementasyon planında sabitlenir.
   - `document.getElementById('qr-code')` üzerinde `createRoot(...).render(createElement(QRCodeSVG, { value: CARD_URL, size: 140 }))` çağırır.
   - `CARD_URL` dosyanın başında sabit olarak tanımlanır: `https://metinazeri.github.io/bizcard-miuul/kartvizit-react.html`.

Bu yaklaşım mevcut dosyaya, mevcut bileşenlere veya build sürecine dokunmaz; sadece bir boş `div` ve bağımsız bir `<script type="module">` bloğu ekler.

## Bileşenler

- **`ProfileCard`** (mevcut, `kartvizit-react.html`): `<ContactList>`'ten sonra, kartın kapanış `</div>`'inden önce `<div id="qr-code" className="qr-code" />` eklenir.
- **QR render script'i** (yeni, aynı dosyada `<script type="module">`): Bileşen değil, doğrudan `createRoot`/`createElement` çağrısı yapan küçük bir betik. Mevcut "fonksiyon bileşeni" kuralı JSX bileşenleri için geçerli; bu script bir bileşen değil, bağımsız bir render girişi olduğu için kural dışıdır (skill'de bu ayrım netleştirilecek).

## Veri Akışı

```
CARD_URL (sabit, script içinde)
   → QRCodeSVG value prop
   → SVG olarak #qr-code div'ine render edilir
```

GitHub Pages etkinleştirildikten sonra `CARD_URL`'in gerçekten canlı olduğu doğrulanır; QR kodun kendisi Pages build tamamlanmadan önce de doğru URL'i encode eder (QR üretimi Pages'in canlı olmasına bağımlı değildir).

## Stil

`.qr-code` sınıfı mevcut `<style>` bloğuna eklenir: üstte boşluk (`margin-top`), yatayda ortalanmış, sabit genişlik (140px). Renk: varsayılan siyah/beyaz — `--accent` mavisine boyanmaz, çünkü küçük boyutta renkli QR kodların taranabilirliği düşebilir.

## Hata Yönetimi

esm.sh'e erişilemezse (örn. offline kullanım) `#qr-code` div'i boş kalır; kart'ın geri kalanı normal çalışmaya devam eder. Kişisel bir kartvizit için retry/fallback mekanizması eklenmez (YAGNI) — bu bilinçli bir sadeleştirmedir.

## Test

Bu özellik saf mantık içermediği (CDN'den yüklenen bir bileşenin görsel render'ı) için otomatik test yazılmaz — mevcut `vcard.js`/`vcard.test.js` deseninden farklı olarak burada test edilecek bir fonksiyon yok. Doğrulama manuel yapılır:

1. GitHub Pages etkinleştirilip ilk build tamamlandıktan sonra `https://metinazeri.github.io/bizcard-miuul/kartvizit-react.html` adresini tarayıcıda aç.
2. QR kodun kartın altında göründüğünü doğrula.
3. Telefonun kamera uygulamasıyla QR kodu tara, doğru URL'e yönlendirdiğini doğrula.
4. Yerel olarak `open kartvizit-react.html` ile de test et (QR yine aynı canlı URL'i encode eder, offline'da da SVG render edilir çünkü encoding istemci tarafında yapılır — sadece esm.sh script'lerinin ilk yüklenmesi internet gerektirir).
