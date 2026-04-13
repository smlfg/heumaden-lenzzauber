const festival = {
  meta: {
    title: "Heumaden Lenzzauber",
    subtitle: "24.–26. April · Abschieds-Lore von Mitja",
    date: "24.–26. April 2026",
    motto: "Pardyhard"
  },

  hero: {
    headline: "Heumaden Lenzzauber",
    subline: "24.–26. April · Abschieds-Lore von Mitja",
    moodText: "Ein letztes Mal wird es krachen in Heumaden. Zwei Tage zwischen Haus, Wald, Bunker, Slushys, Schlafplätzen, dunkel-psychedelischen Nächten und bouncig-fetzigen Rückkehrbewegungen.",
    ctas: [
      { label: "Pfad ins Wochenende", href: "#pfad" },
      { label: "Gästeinfos", href: "#infos" },
      { label: "Support den Zauber", href: "#support" }
    ]
  },

  lore: {
    title: "Die Lore",
    text: `Ende April zieht Mitja aus.
Darum wird Heumaden noch ein letztes Mal geöffnet.

Was folgt, ist kein gewöhnliches Wochenende, sondern ein kleines Festival zwischen Abschied, Ausnahmezustand und Freundschaft:
mit Grillen, Workshops, Spielen, Waldfloor, Erholungspausen, Karaoke, Bierpong, Bunker und allem, was sonst noch entsteht, wenn genug gute Leute an einem Ort zusammenkommen.`
  },

  timeline: {
    title: "Der Pfad",
    friday: {
      day: "Freitag",
      subtitle: "Waldpfad",
      slots: [
        { time: "Mittags", event: "Ankunft", detail: "" },
        { time: "Nachmittags", event: "Grillen · Workshops · Spiele", detail: "" },
        { time: "Gegen Abend", event: "Floor öffnet", detail: "" },
        { time: "Nacht", event: "Der Wald ruft", detail: "15 min Fußweg vom Haus" },
        { time: "Bis Sonnenaufgang", event: "Dunkel-psychedelische Klänge", detail: "" }
      ]
    },
    saturday: {
      day: "Samstag",
      subtitle: "Haus & Bunker",
      slots: [
        { time: "Morgen", event: "Erholungspause", detail: "Slushys, Essen, Abchillen" },
        { time: "Tagsüber", event: "Slafen im Haus", detail: "" },
        { time: "Abends", event: "Weiter im bekannten Terrain", detail: "Nellingerstraße 3, 70619" },
        { time: "Nacht", event: "Karaoke · Bierpong · Bunker", detail: "Bouncig-fetzige Klänge" }
      ]
    }
  },

  infos: {
    title: "Was du wissen musst",
    cards: [
      {
        icon: "🛏️",
        title: "Schlafen",
        content: "Schlafplätze vorhanden. Isomatte + Schlafsack mitbringen. Bitte vorher ankündigen."
      },
      {
        icon: "🎒",
        title: "Mitbringen",
        bullets: [
          "Isomatte & Schlafsack",
          "Getränke",
          "Grillgut",
          "gute Laune",
          "Hilfsbereitschaft",
          "Tanzbereitschaft"
        ]
      },
      {
        icon: "🍽️",
        title: "Versorgung",
        content: "Grundversorgung an Mahlzeiten vorhanden. Getränke und Grillgut bitte selbst mitbringen."
      },
      {
        icon: "🤝",
        title: "Was dieses Wochenende leichter macht",
        bullets: [
          "Freude mitbringen",
          "Helfen bei Aufbau, Abbau, Aufräumen",
          "Schlafplätze vorher ankündigen",
          "Zusätzliche Freunde vorher ankündigen",
          "Respektvoll mit Haus, Gelände und Menschen"
        ]
      },
      {
        icon: "🚫",
        title: "Was weniger gut passt",
        bullets: [
          "Drinnen rauchen",
          "Dinge verschütten und nicht wegmachen",
          "Chaos hinterlassen"
        ]
      }
    ]
  },

  locations: {
    title: "Orte",
    places: [
      {
        name: "Startpunkt Freitag",
        address: "Heumaden",
        detail: "Wald / Start am Haus",
        mapsLink: "https://maps.google.com/?q=Heumaden+Stuttgart"
      },
      {
        name: "Samstagabend",
        address: "Nellingerstraße 3, 70619 Stuttgart",
        detail: "Indoor · Bunker · Tanzfläche",
        mapsLink: "https://maps.google.com/?q=Nellingerstraße+3+70619+Stuttgart"
      }
    ]
  },

  support: {
    title: "Support den Zauber",
    text: "Es gibt keinen Eintritt. Wenn du das Wochenende mittragen möchtest, freuen wir uns über einen freiwilligen Beitrag zur Partykasse — für Aufbau, Material, Grundversorgung und alles, was diesen kleinen Ausnahmezustand möglich macht.",
    paypalLink: "https://www.paypal.com/pools/c/9oic8tzSrB",
    ctaLabel: "Zur Partykasse",
    directPayPalEmail: "mitja.987654321@gmail.com",
    directCtaLabel: "Mitja direkt: PayPal-Adresse kopieren"
  },

  footer: {
    whatsapp: "WhatsApp-Gruppe",
    closing: "Kommet zu Hauf und bringt Freude mit.",
    credit: "Made with love by friends"
  }
};
