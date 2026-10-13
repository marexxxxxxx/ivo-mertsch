/**
 * Consent-Manager (Client). Verbindet die reine Logik aus src/lib/consent.ts mit
 * DOM und localStorage.
 *
 * Garantien (ADR §4.2/§4.5):
 *  - Vor Einwilligung wird KEIN Gate-Element erzeugt. Externe Elemente liegen in
 *    `<template data-consent-gate="...">` — Template-Inhalte sind inert und laden
 *    nichts nach. Nach Zustimmung werden sie in den Slot `[data-consent-slot]`
 *    geklont.
 *  - `applyConsent()` ist idempotent: mehrfacher Aufruf ergibt denselben DOM.
 *  - Bei Widerruf werden nachgeladene Elemente aus dem DOM ENTFERNT (nicht hidden).
 *  - Bei Aenderung wird ein Event `pf:consent-change` auf `window` ausgeloest.
 */
import {
  decide,
  isDecided,
  isGranted,
  parseConsent,
  readConsent,
  writeConsent,
  type ConsentCategories,
  type ConsentRecord,
  type GateCategory,
} from "../lib/consent";
import { CONSENT_COPY } from "../lib/copy";

interface ConsentApi {
  get(): ConsentRecord | null;
  granted(category: GateCategory): boolean;
  apply(record: ConsentRecord | null): void;
  openSettings(): void;
}

declare global {
  interface Window {
    __pfConsent?: ConsentApi;
  }
}

const GATE_CATEGORIES: readonly GateCategory[] = ["statistik", "externe_medien"];

function isGateCategory(value: string | undefined): value is GateCategory {
  return value !== undefined && (GATE_CATEGORIES as readonly string[]).includes(value);
}

function storage(): Storage | null {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

let current: ConsentRecord | null = null;

function getCurrent(): ConsentRecord | null {
  return current;
}

/**
 * Wendet den Consent-Datensatz auf das Markup an. Deterministisch und idempotent.
 */
function applyConsent(record: ConsentRecord | null): void {
  current = record;
  const root = document.documentElement;
  root.setAttribute("data-pf-consent", isDecided(record) ? "decided" : "unbekannt");
  root.setAttribute("data-pf-statistik", isGranted(record, "statistik") ? "on" : "off");
  root.setAttribute("data-pf-externe-medien", isGranted(record, "externe_medien") ? "on" : "off");

  for (const template of document.querySelectorAll<HTMLTemplateElement>("template[data-consent-gate]")) {
    const category = template.dataset.consentGate;
    if (!isGateCategory(category)) continue;
    const slotName = template.dataset.consentSlotTarget;
    if (!slotName) continue;
    const slot = document.querySelector<HTMLElement>(`[data-consent-slot="${slotName}"]`);
    if (!slot) continue;

    const granted = isGranted(record, category);
    const token = `${category}:${granted ? "on" : "off"}`;
    if (slot.dataset.consentToken === token) continue; // idempotent: nichts zu tun
    slot.dataset.consentToken = token;

    if (granted) {
      // Element ERZEUGEN, nicht einblenden (ADR §4.5 Regel 1).
      slot.replaceChildren(template.content.cloneNode(true));
      slot.dataset.consentActive = "true";
    } else {
      // Widerruf: aus dem DOM entfernen, nicht verstecken. Lokaler Fallback
      // (z. B. Initialen) wird wiederhergestellt, damit die Karte lesbar bleibt.
      slot.replaceChildren();
      const fallback = slot.dataset.consentFallback;
      if (fallback && fallback.length > 0) slot.appendChild(document.createTextNode(fallback));
      slot.dataset.consentActive = "false";
    }
  }

  window.dispatchEvent(
    new CustomEvent("pf:consent-change", {
      detail: {
        record,
        granted: {
          statistik: isGranted(record, "statistik"),
          externe_medien: isGranted(record, "externe_medien"),
        },
      },
    }),
  );
}

function persist(record: ConsentRecord): void {
  const store = storage();
  if (store) writeConsent(store, record);
  current = record;
}

// ------------------------------------------------------------------ Banner/Dialog

function bannerEl(): HTMLElement | null {
  return document.getElementById("pf-consent-banner");
}

function dialogEl(): HTMLElement | null {
  return document.getElementById("pf-consent-dialog");
}

let openedFromFooter = false;
let lastFocused: HTMLElement | null = null;

function readToggles(): ConsentCategories {
  const statistik = document.querySelector<HTMLInputElement>('input[data-consent-category="statistik"]');
  const externe = document.querySelector<HTMLInputElement>('input[data-consent-category="externe_medien"]');
  return {
    essenziell: true,
    statistik: statistik?.checked === true,
    externe_medien: externe?.checked === true,
  };
}

function setToggles(categories: ConsentCategories): void {
  const statistik = document.querySelector<HTMLInputElement>('input[data-consent-category="statistik"]');
  const externe = document.querySelector<HTMLInputElement>('input[data-consent-category="externe_medien"]');
  if (statistik) statistik.checked = categories.statistik;
  if (externe) externe.checked = categories.externe_medien;
}

function renderCurrent(record: ConsentRecord | null): void {
  const target = document.querySelector<HTMLElement>("[data-consent-current]");
  if (!target) return;
  if (!record || !isDecided(record)) {
    target.textContent = "";
    return;
  }
  const datum = new Date(record.zeitstempel).toLocaleString("de-DE");
  const methode = record.methode;
  target.textContent =
    `Version ${record.version} · ${record.entscheidung} · ${methode} · ${record.textfassung} · ${datum}` +
    ` · Statistik ${record.kategorien.statistik ? "an" : "aus"}` +
    ` · Externe Medien ${record.kategorien.externe_medien ? "an" : "aus"}`;
}

function focusable(root: HTMLElement): HTMLElement[] {
  return Array.from(
    root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).filter((element) => element.offsetParent !== null || element === document.activeElement);
}

function openDialog(fromFooter: boolean): void {
  const dialog = dialogEl();
  if (!dialog) return;
  openedFromFooter = fromFooter;
  lastFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  setToggles(current?.kategorien ?? { essenziell: true, statistik: false, externe_medien: false });
  renderCurrent(current);
  dialog.hidden = false;
  document.documentElement.style.overflow = "hidden";
  const first = dialog.querySelector<HTMLElement>("[data-consent-dialog-close]") ?? focusable(dialog)[0];
  first?.focus();
}

function closeDialog(): void {
  const dialog = dialogEl();
  if (!dialog) return;
  dialog.hidden = true;
  document.documentElement.style.overflow = "";
  lastFocused?.focus();
}

function commit(categories: ConsentCategories, method: ConsentRecord["methode"]): void {
  const next = decide(current, { kategorien: categories, methode: method });
  persist(next);
  applyConsent(next);
  renderCurrent(next);
  closeDialog();
  bannerEl()?.remove();
  document.documentElement.setAttribute("data-pf-consent", "decided");
}

function onDialogKeydown(event: KeyboardEvent): void {
  const dialog = dialogEl();
  if (!dialog || dialog.hidden) return;
  if (event.key === "Escape") {
    event.preventDefault();
    closeDialog();
    return;
  }
  if (event.key !== "Tab") return;
  const items = focusable(dialog);
  if (items.length === 0) return;
  const first = items[0];
  const last = items[items.length - 1];
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function onActionClick(event: Event): void {
  const target = (event.target as HTMLElement).closest<HTMLElement>("[data-consent-action]");
  if (!target) return;
  const action = target.dataset.consentAction;
  const inDialog = target.closest("#pf-consent-dialog") !== null;

  // Methode nach Herkunft: Aenderungen im ueber den Footer geoeffneten Dialog
  // werden als "footer-einstellungen" protokolliert, sonst als Banner-Entscheidung
  // (ADR §4.4 / consent.schema.json).
  const methodFor = (value: string): ConsentRecord["methode"] => {
    if (inDialog && openedFromFooter) return "footer-einstellungen";
    if (value === "accept-all") return "banner-alle";
    if (value === "reject-all") return "banner-ablehnen";
    return "banner-individuell";
  };

  if (action === "accept-all") {
    commit({ essenziell: true, statistik: true, externe_medien: true }, methodFor("accept-all"));
  } else if (action === "reject-all") {
    commit({ essenziell: true, statistik: false, externe_medien: false }, methodFor("reject-all"));
  } else if (action === "open-settings") {
    openDialog(target.dataset.consentFrom === "footer");
  } else if (action === "save-selection") {
    commit(readToggles(), methodFor("save-selection"));
  } else if (action === "close-settings") {
    closeDialog();
  }
}

function boot(): void {
  const store = storage();
  const record = store ? readConsent(store) : null;
  applyConsent(record);

  document.addEventListener("click", onActionClick);
  document.addEventListener("keydown", onDialogKeydown);

  // Verweis auf die Datenschutzerklaerung im Banner ist ein normaler Link — nichts zu tun.

  window.__pfConsent = {
    get: getCurrent,
    granted: (category: GateCategory) => isGranted(getCurrent(), category),
    apply: applyConsent,
    openSettings: () => openDialog(false),
  };

  // Floating-Widerruf verschwindet, sobald der Footer sichtbar ist (komponenten.md §10.3).
  const floating = document.querySelector<HTMLElement>("[data-consent-floating]");
  const footer = document.querySelector("footer");
  if (floating && footer && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        floating.dataset.footerVisible = entry.isIntersecting ? "true" : "false";
      }
    });
    observer.observe(footer);
  }

  // Bei Systemwechsel (Tab-Sync) den Datensatz neu einlesen.
  window.addEventListener("storage", (event) => {
    if (event.key !== "pixelforge.consent.v1") return;
    applyConsent(parseConsent(event.newValue));
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}

// Referenz, damit die Copy-Konstanten als Single-Source erkennbar bleiben.
export const CONSENT_TITLE = CONSENT_COPY.title;
