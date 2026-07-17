# Satılık Daireler final fineUX denetimi

Bu kapsam yalnız yeni alıcı rotalarını denetler. Korunan `editoryal`, `mimari`, `monolit` ve `eski-karsilastirma` örneklerini değiştirmez ya da yeniden puanlamaz.

Denetim; 1440×900, 1366×768, 1024×768, 390×844 ve 360×740 görünüm sınıflarında taşma, başlık kırpılması, DM Sans kullanımı, başlık ve hero ölçeği, dokunma hedefleri, sabit katmanlar, fotoğraf yükleme, filigranlı kaynağın dışlanması ve ilk görünüm yoğunluğunu doğrular. Her maddi sayfa türü için tam sayfa ekran görüntüsü üretir.

İzole üretim çıktısıyla çalıştırma:

```bash
FINEUX_STATIC_DIR=/tmp/mey-sale-compact-final \
FINEUX_SCREENSHOT_DIR=fineUX/evidence/satilik-daireler-final \
FINEUX_PORT=4333 \
npx playwright test -c fineUX/playwright.config.ts \
  satilik-daireler-final/satilik-daireler-final.audit.ts \
  --output=/tmp/mey-sale-fineux-output
```
