import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

/*
  Yayındaki sayfalarda rapor dili kalmaz: temsilî/örnek/doğrulanıyor etiketleri,
  "bilgi gelince güncellenecek" notları ve kaynak dipnotları sitenin sesi değildir.
  Derlenmiş dist/ HTML'i taranır (script/style/template hariç; alt ve aria metni
  dahil). /showcases/ dahili tasarım vitrinidir, kapsam dışı.
*/
const DIST = 'dist';
const FORBIDDEN = [
  /temsil[iî]/i,
  /doğrulan(ıyor|dığında)/i,
  /güncellenecek/i,
  /sahibinden ilan/i,
  /yayında kalır/i,
  /representative/i,
  /sample placement/i,
  /once provided by MEY/i,
  /иллюстратив/i,
  /будут обновлены/i,
  /توضيحي/,
  /قيد التحقق/,
];

function htmlPages(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return htmlPages(full);
    return name === 'index.html' ? [full] : [];
  });
}

test('yayındaki sayfalarda yer tutucu / rapor dili yok', () => {
  test.skip(test.info().project.name !== 'desktop', 'statik dist taraması tek projede yeter');
  const hits: string[] = [];
  for (const file of htmlPages(DIST)) {
    if (file.startsWith(join(DIST, 'showcases'))) continue;
    const html = readFileSync(file, 'utf8').replace(/<(script|style|template)\b[\s\S]*?<\/\1>/gi, '');
    for (const re of FORBIDDEN) {
      const m = html.match(re);
      if (m) hits.push(`${file}: ${m[0]}`);
    }
  }
  expect(hits).toEqual([]);
});
