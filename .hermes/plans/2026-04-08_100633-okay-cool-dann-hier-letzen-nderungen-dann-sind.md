# Plan: Heumaden Lenzzauber — Informationsarchitektur Refactor

## Ziel
Komplette Neustrukturierung der Seite nach Informationsarchitektur.
Weniger vertikale Aufblähung, höhere Informationsdichte, Verwandtes bündeln,
Interaktive Module statt gestapelter Full-Sections.

---

## Neue Struktur (1 → 8)

| # | Section | Typ | Wichtigkeit |
|---|---------|-----|-------------|
| 1 | Hero | Static | ★★★★★ |
| 2 | Was ist das? / kurze Lore | Info | ★★★★ |
| 3 | Support den Zauber | Static CTA | ★★★★★ |
| 4 | **Programm** | **Zentrales interaktives Modul** | ★★★★★ |
| 5 | Was du wissen musst | Info | ★★★★ |
| 6 | Orte / Maps | Karten | ★★★ |
| 7 | FAQ | Text | ★★ |
| 8 | Einkauf & Notfallversorgung | Karten | ★ |

**Entfernt:** Wetter-Section (API-Daten zu weit in der Zukunft → ausblenden)

---

## Neue Seitenstruktur im Detail

### Sektion 1: Hero
Unverändert. Hero mit CTA-Buttons → auf `#programm` zeigen statt auf `#lineup`.

### Sektion 2: Was ist das? (kompakt)
4 Cards in 2×2 Grid (wie bisher) — aber kompakter. Darunter kurze Lore-Zeile.
Keine eigene Lore-Section mehr — Lore in diese Section integrieren.

### Sektion 3: Support den Zauber (nach "Was ist das?")
Prominenter Acid-Border, kompakter Text + PayPal-CTA.
Kein langer Text — nur ein klarer Satz + Button.

```html
<section class="support" id="support">
  <div class="support-inner">
    <div class="support-copy">
      <h2>Support den Zauber</h2>
      <p>Das größte Projekt braucht tragende Hände. Wer mag, kann zur Partykasse beitragen.</p>
    </div>
    <a href="#" class="btn btn-amber paypal-placeholder">
      <svg><!-- PayPal icon --></svg>
      PayPal — coming soon
    </a>
  </div>
</section>
```

### Sektion 4: Programm (zentrales Modul)
Tab-Leiste + 4 Views. Default: "Ablauf".

```html
<section class="programm" id="programm">
  <h2>Programm</h2>

  <!-- Tab-Leiste -->
  <div class="programm-tabs">
    <button class="programm-tab active" data-view="ablauf">Ablauf</button>
    <button class="programm-tab" data-view="lineup">Line-up</button>
    <button class="programm-tab" data-view="workshops">Workshops</button>
    <button class="programm-tab" data-view="helfen">Helfen</button>
  </div>

  <!-- View: Ablauf (default) -->
  <div id="prog-ablauf">
    <!-- Die 2 Tages-Timeline-Cards (Pfad-Inhalt) -->
    <div class="day-card">Freitag...</div>
    <div class="day-card">Samstag...</div>
  </div>

  <!-- View: Line-up -->
  <div id="prog-lineup" class="hidden">
    <div class="lineup-day" id="friday">...Freitags Line-up...</div>
    <div class="lineup-day hidden" id="saturday">...Samstags Line-up...</div>
    <!-- Artist-Cards mit Soundcloud-Avatar-Platz -->
  </div>

  <!-- View: Workshops -->
  <div id="prog-workshops" class="hidden">
    <!-- 4 Workshop-Cards -->
    <!-- Material-Placeholder pro Workshop -->
  </div>

  <!-- View: Helfen -->
  <div id="prog-helfen" class="hidden">
    <!-- Schichtplan + WhatsApp-Platzhalter -->
  </div>
</section>
```

**CSS für Tab-Views:**
```css
.programm-tab.active {
  background: var(--acid);
  color: var(--bg-void);
}
#prog-ablauf, #prog-lineup, #prog-workshops, #prog-helfen {
  display: none;
}
#prog-ablauf.active-view,
#prog-lineup.active-view,
#prog-workshops.active-view,
#prog-helfen.active-view {
  display: block;
}
```

### Sektion 5: Was du wissen musst
Kompakte Info-Cards. Neue Card "Selbstversorgung" hinzufügen.

Cards:
- 🛏️ Schlafen
- 🎒 Mitbringen
- 🍽️ **Versorgung & Sozialverhalten** (zusammengelegt)
- 🚫 Was weniger passt / Regeln
- 🌲 Helfende Hände (verkürzt — Link auf `#prog-helfen`)

### Sektion 6: Orte / Maps
Passwortgeschützt wie bisher. Kompakter.

### Sektion 7: FAQ
Neu. Kurze Antworten auf häufige Fragen — selbstversorgen,
Anreise, Schlafen, etc. Placeholder-Fragen:

- "Kann ich einfach kommen?" → Ankommen, aber bitte Bescheid sagen.
- "Was muss ich mitbringen?" → Isomatte, Schlafsack, gute Laune.
- "Gibt es Essen?" → Grundversorgung, aber bitte selbst mitbringen.
- "Wo ist das eigentlich?" → Adresse nach Login.
- "Wie lautet das Passwort?" → Bekannt durch Mitja.
- "Was ist der Waldfloor?" → Freitagnacht, 15min Fußweg.
- "Kann ich helfen?" → Ja! Siehe Helfende Hände oder WhatsApp-Gruppe.

### Sektion 8: Einkauf & Notfallversorgung
Wie bisher — 4 Cards für PENNY, REWE, Bäckerei, Apotheke. Ganz unten.

---

## Neue Komponenten-Architektur

### Tab-System (.programm)
- Horizontale Tab-Leiste über dem Content
- 4 Tabs: Ablauf | Line-up | Workshops | Helfen
- Aktiver Tab: Acid-Background, dunkler Text
- Inaktive Tabs: Transparent, Border
- Content-Bereich darunter, kein vertikaler Spacer zwischen Tab und Content

### Artist-Cards im Line-up
Vorbereitet für Bild, aber robust initial:

```html
<div class="act-card">
  <div class="act-avatar-placeholder">🎵</div>
  <div class="act-info">
    <span class="act-name">Niklas</span>
    <span class="act-note">BauZZner <a href="...">soundcloud</a></span>
  </div>
  <span class="act-time">20:00–21:30</span>
</div>
```

```css
.act-card {
  display: grid;
  grid-template-columns: 48px 1fr auto;
  align-items: center;
  gap: 0.75rem;
  padding: var(--space-sm);
  background: var(--bg-card);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: var(--radius-sm);
}
.act-avatar-placeholder {
  width: 48px; height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.06);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.4rem;
}
.act-avatar-placeholder img {
  width: 100%; height: 100%; object-fit: cover; border-radius: 50%;
}
```

Soundcloud-Avatare werden per JS asynchron geladen (CORS-dependent).
Falls CORS blocked → Placeholder-Emoji bleibt.

### Workshop-Material-Cards
```html
<div class="workshop-material-card">
  <span class="wm-icon">🫧</span>
  <div class="wm-info">
    <span class="wm-name">Seifenblasen</span>
    <span class="wm-time">16:00</span>
    <span class="wm-material">💡 Was mitbringen: Eigene Seifenblasen-Flüssigkeit (wer hat)</span>
  </div>
</div>
```

### WhatsApp-Platzhalter in "Helfen"
```html
<div class="whatsapp-card">
  <span class="whatsapp-icon">💬</span>
  <div class="whatsapp-info">
    <span class="whatsapp-label">WhatsApp-Gruppe</span>
    <span class="whatsapp-desc">Organisiert euch hier untereinander.</span>
    <a href="#" class="btn btn-sm btn-violet whatsapp-link">[Link coming soon]</a>
  </div>
</div>
```

### FAQ-Section
Einfaches 2-Spalten-Grid mit Frage/Antwort-Paaren.

---

## JavaScript-Logik

### Tab-Umschaltung (js/lineup.js)
```js
// Erwin: Alle .programm-tab Buttons
document.querySelectorAll('.programm-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    // Alle Tabs + Views reset
    document.querySelectorAll('.programm-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.prog-view').forEach(v => v.classList.remove('active-view'));
    // Aktiv setzen
    tab.classList.add('active');
    const view = tab.dataset.view;
    document.getElementById(`prog-${view}`).classList.add('active-view');
  });
});
```

### Wetter-Section komplett entfernen
- HTML: `<section class="weather-section">` entfernen
- JS: weather.js Entfernung → `index.html` kein `<script src="js/weather.js">` mehr
- CSS: Alle `.weather-*` Regeln löschen

### Soundcloud-Avatare (js/lineup.js)
```js
async function loadSCAvatars() {
  const acts = document.querySelectorAll('.act-card[data-sc-url]');
  for (const act of acts) {
    const url = act.dataset.scUrl;
    try {
      const res = await fetch(`https://soundcloud.com/oembed?url=${url}&format=json`);
      const data = await res.json();
      const tmp = document.createElement('div');
      tmp.innerHTML = data.html;
      const img = tmp.querySelector('img');
      if (img) {
        const placeholder = act.querySelector('.act-avatar-placeholder');
        placeholder.innerHTML = '';
        const avatar = img.cloneNode();
        avatar.className = 'act-avatar';
        avatar.loading = 'lazy';
        placeholder.appendChild(avatar);
      }
    } catch (e) {
      // Placeholder bleibt
    }
  }
}
loadSCAvatars();
```

### CSS-Bereinigung
Alle nicht mehr benötigten Regeln entfernen:
- `.weather-*` (alle)
- `.lineup-tabs`, `.lineup-day`, `.lineup-slot` → **behalten** für Line-up View
- `.lore`, `.lore-text` → entfernen (Lore integriert)
- `.whatis-grid` → behalten
- Alte Sections: `.weather-section` → löschen

---

## Dateiänderungen

### index.html — Komplett neu
Neue Sektions-Reihenfolge + neues Programm-Modul + FAQ + bereinigt.
Zeilen 649-650 (Doppel-End-Tag) entfernen.

### css/style.css — Umfangreich
- Neues: `.programm-tabs`, `.programm-tab`, `.prog-view`, `.act-card`, `.act-avatar-placeholder`, `.act-avatar`, `.wm-card`, `.whatsapp-card`, `.faq-grid`, `.faq-item`
- Entfernt: `.weather-section` + alle `.weather-*`
- Kompaktisiert: Section-Padding reduziert, Grid-Gaps enger
- `.hidden` bleibt für Tab-Views

### js/lineup.js — Erweitert
- Tab-Umschaltlogik
- Soundcloud-Avatar-Fetch
- weather.js → **nicht mehr referenziert** → löschen oder aus `index.html` entfernen

### js/weather.js — Aus index.html entfernen
Nicht mehr benötigt. Kann im Repo bleiben (evtl. später wieder aktiv).

---

## Prüf-Liste vor Abschluss

- [ ] Hero-CTA zeigt auf `#programm` statt `#lineup`
- [ ] Wetter-Section + Script komplett entfernt
- [ ] Alle 8 Sections in richtiger Reihenfolge
- [ ] Tab-System: 4 Tabs,Default "Ablauf",alle Views funktionieren
- [ ] WhatsApp-Platzhalter in "Helfen"
- [ ] Workshop-Material-Cards in Workshops-View
- [ ] Artist-Cards vorbereitet (Avatar mit Placeholder-Emoji)
- [ ] FAQ-Section mit 7 Fragen
- [ ] Self-Sufficiency-Hinweis in "Was du wissen musst"
- [ ] CSS: `{` = `}` (Python-Balance-Check)
- [ ] Git commit + Push + GitHub Pages live
- [ ] Manuelle QA: alle Tabs klicken, Passwort-Gate, Responsive
