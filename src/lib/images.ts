/**
 * Bild-Assets mit Alt-Texten aus content/*.md (MARAA-3). Keine Referenzbehauptung,
 * keine Projektzuordnung — die Alt-Texte beschreiben nur den sichtbaren Inhalt.
 * foto9 hat im Content-Pack keinen Alt-Text und wird deshalb als dekorativ
 * (alt="") gefuehrt, statt eine Beschreibung zu erfinden.
 */
import foto3 from "../assets/img/foto3.png";
import foto6 from "../assets/img/foto6.png";
import foto7 from "../assets/img/foto7.png";
import foto8 from "../assets/img/foto8.png";
import foto9 from "../assets/img/foto9.png";
import foto10 from "../assets/img/foto10.png";
import foto11 from "../assets/img/foto11.png";

export const IMAGES = {
  foto3: { src: foto3, alt: "Modernes Badezimmer mit weißer Wanne, Doppelwaschtisch und Glasdusche." },
  foto6: { src: foto6, alt: "Leerer Wohnraum mit Holzboden, Kamin und großen Fenstern." },
  foto7: { src: foto7, alt: "Fassade eines Altbaus mit Gerüst und Handwerkern bei der Arbeit." },
  foto8: { src: foto8, alt: "Helles Badezimmer mit beiger Wand, begehbarer Glasdusche und schwebendem Waschtisch." },
  foto9: { src: foto9, alt: "" },
  foto10: { src: foto10, alt: "Fassadenbereich mit aufgebrachtem Dämmaufbau." },
  foto11: { src: foto11, alt: "Wohnraum mit großen Fenstern und fugenlos beschichtetem, glänzendem Boden." },
} as const;

export type ImageKey = keyof typeof IMAGES;
