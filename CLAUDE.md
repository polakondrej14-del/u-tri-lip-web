# Penzion U Tří lip – web

Ukázkový web (portfolio) rodinného penzionu U Tří lip u Telče. **Fiktivní podnik**: adresa, telefon, e-mail, recenze i hodnocení jsou smyšlené a web to v patičce i u formuláře uvádí.

- Živý web: https://u-tri-lip-web.polakondrej14.workers.dev
- GitHub: https://github.com/polakondrej14-del/u-tri-lip-web
- Hosting: Cloudflare Workers se statickými assety (`wrangler.jsonc`, `assets.directory: ./public`)

## Struktura

Čisté HTML, CSS a JavaScript, žádný build krok ani knihovny.

```
public/
  index.html      všechny sekce webu, SVG sada ikon, schema.org LodgingBusiness
  css/style.css   styly (barvy a fonty v :root proměnných)
  js/main.js      hlavička, mobilní menu, fade-in, akordeon, lightbox, formulář
  images/         fotky z Unsplash ve WebP (max. 1600 px), og-image.jpg
  favicon.svg     lipový list
  _headers        cache hlavičky pro Cloudflare
wrangler.jsonc    konfigurace nasazení
```

## Design

- Barvy: krémová `#FAF7F0`, lipově zelená `#4A6346`, medová `#D4A24C` (jen dekorace, ne text – nízký kontrast), text `#2B2B26`. Zlatý text používá tmavší `--honey-dark`.
- Fonty: Cormorant Garamond 600 (nadpisy), Source Sans 3 (text), z Google Fonts.
- Animace jen přes třídu `.reveal` a vždy za `prefers-reduced-motion: no-preference`.

## Důležité detaily

- Ceny pokojů jsou na dvou místech: v kartách a tabulce v `index.html` a v objektu `ROOMS` v `js/main.js` (výpočet orientační ceny). Při změně upravit obojí, plus `priceRange` ve schema.org.
- Hlavní sezóna: červen–září a 20. 12. – 2. 1. (funkce `isHighSeason`), v ní minimální pobyt 2 noci.
- Formulář nic neodesílá, jen validuje a ukáže potvrzení se shrnutím.
- Nové fotky: zmenšit na max. 1600 px, uložit jako WebP do `public/images/`, vždy vyplnit `width`, `height`, `alt` a `loading="lazy"` (kromě hero).

## Lokální spuštění

```bash
python -m http.server 8080 --directory public
```

Pak otevřít http://localhost:8080.

## Pracovní postup

Po **každé** změně:

1. Ověřit lokálně (desktop i šířka 375 px, konzole bez chyb).
2. `git add -A` a `git commit -m "Popis změny"`
3. `git push`
4. `npx wrangler deploy`
5. Zkontrolovat živý web.
