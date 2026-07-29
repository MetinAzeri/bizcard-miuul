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
