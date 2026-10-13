#!/usr/bin/env python3
"""Generiert docs/design/tokens.css aus docs/design/tokens.json (kanonische Quelle).

Aufrufe:
  python3 tools/build-tokens.py            # tokens.css schreiben
  python3 tools/build-tokens.py --check    # nur pruefen, nichts schreiben
  python3 tools/build-tokens.py --audit    # Kontrastwerte neu berechnen und mit tokens.json vergleichen

Designentscheidung: tokens.json ist die einzige Wahrheit. tokens.css traegt den Kopf
"GENERATED — nicht editieren". Damit kann die CSS-Schicht nicht von der JSON-Schicht
abweichen, und die im Audit genannten Kontrastwerte sind nachrechenbar statt behauptet.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "docs" / "design" / "tokens.json"
OUT = ROOT / "docs" / "design" / "tokens.css"

IGNORED_KEYS = {"_comment", "_note", "_comment_"}


# ---------------------------------------------------------------- Helfer
def _lin(c: float) -> float:
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def _luminance(hexs: str) -> float:
    h = hexs.lstrip("#")
    r, g, b = (int(h[i : i + 2], 16) for i in (0, 2, 4))
    return 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b)


def contrast(a: str, b: str) -> float:
    la, lb = _luminance(a), _luminance(b)
    hi, lo = max(la, lb), min(la, lb)
    return (hi + 0.05) / (lo + 0.05)


def flatten(node: dict, prefix: str = "") -> dict:
    """Flacht verschachtelte Dicts; ueberspringt Metaschluessel, laesst Skalare stehen."""
    flat = {}
    for k, v in node.items():
        if k in IGNORED_KEYS or k.startswith("_"):
            continue
        key = f"{prefix}{k}"
        if isinstance(v, dict):
            if "hex" in v and "name" in v:
                flat[key] = v
            else:
                flat.update(flatten(v, key + "."))
    return flat


def resolve(alias_name: str, data: dict) -> str:
    """'neutral-900' -> '#241F19'. Alles, was keine reine Stufenreferenz ist
    (color-mix(), transparent, var(), direktes px), geht unveraendert durch —
    ausser funktionalen Werten: darin werden Primitive-Namen zu var() expandiert,
    weil ein nacktes 'accent-700' in color-mix() kein gueltiger CSS-Farbwert ist."""
    if "(" in alias_name:
        return expand_primitives(alias_name, data)
    if alias_name.startswith("var("):
        return alias_name
    group, _, step = alias_name.rpartition("-")
    scale = data["primitives"]["color"].get(group)
    if scale is None:
        return alias_name
    entry = scale.get(step)
    if entry is None or "hex" not in entry:
        return alias_name
    return entry["hex"]


def expand_primitives(s: str, data: dict) -> str:
    """Ersetzt Vorkommen von '<gruppe>-<stufe>' (z. B. accent-700) durch
    var(--pf-color-<gruppe>-<stufe>) — nur fuer Gruppen, die es wirklich gibt."""
    import re

    groups = [g for g in data["primitives"]["color"] if not g.startswith("_")]
    pattern = r"(?<![\w-])(" + "|".join(re.escape(g) for g in groups) + r")-(\d+)(?![\w-])"

    def repl(m: "re.Match[str]") -> str:
        g, step = m.group(1), m.group(2)
        scale = data["primitives"]["color"].get(g, {})
        if step in scale and "hex" in scale[step]:
            return f"var(--pf-color-{g}-{step})"
        return m.group(0)

    return re.sub(pattern, repl, s)


def fluid_step(entry: dict, root_px: int = 16, vmin: int = 360, vmax: int = 1440) -> str:
    """min..max px -> clamp() mit rem/minmax-Einheiten."""
    lo, hi = entry["min"], entry["max"]
    if lo == hi:
        return f"{lo / root_px:.5f}rem"
    span = vmax - vmin
    slope = (hi - lo) / span
    intercept = lo - slope * vmin
    lo_rem = lo / root_px
    hi_rem = hi / root_px
    return (
        f"clamp({lo_rem:.5f}rem, {intercept:.5f}px + {slope * 100:.5f}vw, {hi_rem:.5f}rem)"
    )


def var(css: str) -> str:
    return css if css.startswith("--pf-") else f"--pf-{css}"


def iter_steps(scale: dict):
    """Farbstufen ohne Metaschluessel (_note/_comment)."""
    return ((k, v) for k, v in scale.items() if not k.startswith("_"))


def iter_entries(group: dict):
    """Verschachtelte Gruppen ohne Metaschluessel."""
    return ((k, v) for k, v in group.items() if not k.startswith("_"))


# ---------------------------------------------------------------- CSS bauen
def build_css(data: dict) -> str:
    L: list[str] = []
    A = L.append
    A("/* ============================================================================")
    A("   PixelForge Studio — Design-Tokens  |  ivo-mertsch")
    A(f"   {data['meta']['direction']}")
    A("   GENERATED from tokens.json by tools/build-tokens.py — NICHT EDITIEREN.")
    A("   Aenderungen nur in docs/design/tokens.json.")
    A("   " + "=" * 74)
    A("")
    A("/* ---------- 1. Primitive Tokens (nie direkt in Komponenten benutzen) ------- */")
    A(":root {")

    A("  /* Farbe — Neutral 'Kalkstein' (warm) */")
    for name, step in iter_steps(data["primitives"]["color"]["neutral"]):
        A(f"  --pf-color-neutral-{name}: {step['hex']};")
    A("")
    A("  /* Farbe — Akzent 'Tiefpetrol' (die EINE Akzentfarbe) */")
    for name, step in iter_steps(data["primitives"]["color"]["accent"]):
        A(f"  --pf-color-accent-{name}: {step['hex']};")
    A("")
    A("  /* Farbe — Semantik (nie als Markenakzent einsetzen) */")
    for group in ("success", "error", "warning"):
        for name, step in iter_steps(data["primitives"]["color"][group]):
            A(f"  --pf-color-{group}-{name}: {step['hex']};")
    A("")
    A("  /* Schrift — genau zwei Familien, self-hosted, OFL */")
    for key, fam in iter_steps(data["primitives"]["font"]["family"]):
        A(f"  --pf-font-{key}: {fam['stack']};")
    A("")
    A("  /* Schrift — Gewichte */")
    for name, w in iter_steps(data["primitives"]["font"]["weight"]):
        A(f"  --pf-font-weight-{name}: {w};")
    A("")
    A("  /* Schrift — Zeilenhoehen */")
    for name, lh in iter_steps(data["primitives"]["font"]["leading"]):
        A(f"  --pf-leading-{name}: {lh};")
    A("")
    A("  /* Schrift — Laufweite */")
    for name, tr in iter_steps(data["primitives"]["font"]["tracking"]):
        A(f"  --pf-tracking-{name}: {tr};")
    A("")
    A("  /* Schrift — fluid Groessenskala (clamp, 360px..1440px) */")
    for name, entry in iter_steps(data["typography"]["scale"]):
        A(f"  --pf-text-{name}: {fluid_step(entry)};")
    A("")
    A("  /* Schrift — Zeilenmass in ch (begrenzt die Zeilenlaenge) */")
    for name, m in iter_steps(data["primitives"]["font"]["measure"]):
        A(f"  --pf-measure-{name}: {m['ch']}ch;")
    A("")
    A("  /* Schrift — Ziffern in Spalten und Reihen */")
    A("  --pf-numeric-tabular: tabular-nums;")
    A("")
    A("  /* Abstand — Skala 4..160, Rhythmus NUR aus dieser Skala */")
    for name, s in iter_steps(data["primitives"]["space"]):
        A(f"  --pf-space-{name}: {s['px'] / 16:.4f}rem;")
    A("")
    A("  /* Radien */")
    for name, r in iter_steps(data["primitives"]["radius"]):
        A(f"  --pf-radius-{name}: {r['px']}px;")
    A("")
    A("  /* Linienbreiten */")
    A(f"  --pf-border-width-hairline: {data['primitives']['borderWidth']['hairline']['px']}px;")
    A(f"  --pf-border-width-input: {data['primitives']['borderWidth']['input']['px']}px;")
    A("")
    A("  /* Fokusring */")
    A(f"  --pf-focus-ring-width: {data['primitives']['borderWidth']['focus']['px']}px;")
    A("  --pf-focus-ring-offset: 2px;")
    A("")
    A("  /* Breakpoints (mobile-first, min-width) */")
    for name, bp in iter_steps(data["primitives"]["breakpoint"]):
        A(f"  --pf-bp-{name}: {bp['rem']}rem;")
    A("")
    A("  /* Z-Index-Leiter */")
    for name, z in iter_steps(data["primitives"]["z"]):
        A(f"  --pf-z-{name}: {z['value']};")
    A("")
    A("  /* Motion */")
    for name, d in iter_steps(data["primitives"]["motion"]["duration"]):
        A(f"  --pf-duration-{name}: {d}ms;")
    for name, e in iter_steps(data["primitives"]["motion"]["easing"]):
        A(f"  --pf-ease-{name}: {e};")
    A("")
    A("  /* Layout */")
    lay = data["primitives"]["layout"]
    A(f"  --pf-container-max: {lay['container']['max']['px'] / 16:.4f}rem;")
    A(f"  --pf-container-prose: {lay['container']['prose']['px'] / 16:.4f}rem;")
    A(f"  --pf-container-bleed: {lay['container']['bleed']['px'] / 16:.4f}rem;")
    for name, g in lay["gutter"].items():
        A(f"  --pf-gutter-{name}: {g['px'] / 16:.4f}rem;")
    A(f"  --pf-touch-target: {lay['touchTarget']['px'] / 16:.4f}rem;")
    A(f"  --pf-header-height: {lay['headerHeight']['px'] / 16:.4f}rem;")
    A(f"  --pf-header-height-md: {lay['header-height-md']['px'] / 16:.4f}rem;")
    A(f"  --pf-action-bar-height: {lay['actionBarHeight']['px'] / 16:.4f}rem;")
    A(f"  --pf-section-y: {lay['sectionY']['px'] / 16:.4f}rem;")
    A(f"  --pf-section-y-md: {lay['sectionYMd']['px'] / 16:.4f}rem;")
    A(f"  --pf-breathe-y: {lay['breatheY']['px'] / 16:.4f}rem;")
    A(f"  --pf-grid-columns-sm: {lay['gridColumns']['sm']};")
    A(f"  --pf-grid-columns-md: {lay['gridColumns']['md']};")
    A(f"  --pf-grid-gap: {lay['gridGap']['sm']['px'] / 16:.4f}rem;")
    A(f"  --pf-grid-gap-md: {lay['gridGap']['md']['px'] / 16:.4f}rem;")
    A("")
    A("  /* Schatten — NUR fuer Overlays (Header beim Scrollen, Drawer, Modal, Banner).")
    A("     Karten und Sektionen trennen sich ueber Ton und Korn, nie ueber Schatten —")
    A("     das ist die Fugenlos-Regel. Schattenfarbe ist warmes Neutral, nie Schwarz. */")
    for name, sh in iter_steps(data["primitives"]["shadow"]):
        A(f"  --pf-shadow-{name}: {sh['value']};")
    A("")
    A("  /* Globale Rollen (themenunabhaengig). */")
    for name, target in iter_entries(data["semanticGlobal"]):
        A(f"  --pf-{name}: {resolve(target, data)};")
    A("")
    A("  /* Struktur — die eine Fuge und das Korn. Kein Skalenwert, sondern die")
    A("     Richtung selbst: Sektionen wechseln den Ton und das Korn, nicht die Kante. */")
    st = data["structural"]
    A(f"  --pf-grain: {st['grain']['uri']};")
    A(f"  --pf-grain-opacity: {st['grain']['opacity']};")
    A(f"  --pf-grain-size: {st['grain']['size']};")
    A(f"  --pf-seam-color: {resolve(st['seam']['color'], data)};")
    A(f"  --pf-seam-width: {st['seam']['width']};")
    A("}")
    A("")

    # ---------------- semantische Schicht, Light
    A("/* ---------- 2. Semantische Schicht (nur diese Tokens in Komponenten) ------ */")
    A("/* Light ist der Default; Dark ist ein vollstaendiges Remap derselben Rollen. */")
    for theme in ("light", "dark"):
        if theme == "light":
            A(":root,")
            A('[data-theme="light"] {')
        else:
            A('[data-theme="dark"] {')
        sel = theme
        for group, entries in iter_entries(data["alias"][sel]):
            if group.startswith("_"):
                continue
            A(f"  /* {group} */")
            if isinstance(entries, str):
                # Rollenlose Gruppe (z. B. scrim) — Token direkt benennen.
                A(f"  --pf-{group}: {resolve(entries, data)};")
                A("")
                continue
            for role, target in iter_entries(entries):
                if role.startswith("_"):
                    continue
                if isinstance(target, dict):
                    for sub, subval in iter_entries(target):
                        A(f"  --pf-{group}-{role}-{sub}: {subval};")
                else:
                    A(f"  --pf-{group}-{role}: {resolve(target, data)};")
            A("")
        A("}")
        A("")

    # ---------------- invertierte Rolle
    A("/* ---------- 3. Invertiert (Footer, invertierte Sektionen) ------------------ */")
    inv = data["alias"]["inverted"]
    A(".pf-invert {")
    for role, target in inv.items():
        if role.startswith("_"):
            continue
        A(f"  --pf-{role}: {resolve(target, data)};")
    A("}")
    A("")

    # ---------------- Farbrollen fuer Type
    A("/* ---------- 4. Typografierollen ------------------------------------------- */")
    A(":root {")
    for role, spec in iter_steps(data["typography"]["roles"]):
        fam = data["primitives"]["font"]["family"][spec["family"]]["stack"]
        size = f"var(--pf-text-{spec['size']})"
        weight = f"var(--pf-font-weight-{spec['weight']})"
        lead = f"var(--pf-leading-{spec['leading']})"
        track = f"var(--pf-tracking-{spec['tracking']})"
        meas = f"var(--pf-measure-{spec['measure']})"
        A(f"  --pf-type-{role}: {fam};")
        A(f"  --pf-type-{role}-size: {size};")
        A(f"  --pf-type-{role}-weight: {weight};")
        A(f"  --pf-type-{role}-leading: {lead};")
        A(f"  --pf-type-{role}-tracking: {track};")
        A(f"  --pf-type-{role}-measure: {meas};")
        if "transform" in spec:
            A(f"  --pf-type-{role}-transform: {spec['transform']};")
    A("}")
    A("")

    # ---------------- Reduced Motion
    A("/* ---------- 5. Motion — Bewegung muss etwas erklaeren --------------------- */")
    A("/* Default: Respekt vor prefers-reduced-motion. Bewegung erklaert hier genau")
    A("   zwei Dinge: (a) die Naht zieht sich, weil 'fugenlos' das Versprechen ist,")
    A("   (b) Oberflaechen heben/senken sich, weil sie bedienbar sind. Sonst nichts. */")
    A("@media (prefers-reduced-motion: reduce) {")
    A("  :root {")
    for name in iter_steps(data["primitives"]["motion"]["duration"]):
        A(f"    --pf-duration-{name[0]}: 1ms;")
    A("    --pf-ease-standard: linear;")
    A("    --pf-ease-out: linear;")
    A("    --pf-ease-inout: linear;")
    A("    --pf-ease-overshoot: linear;")
    A("    --pf-grain-opacity: .05;")
    A("  }")
    A("  *,")
    A("  *::before,")
    A("  *::after {")
    A("    animation-duration: 1ms !important;")
    A("    animation-iteration-count: 1 !important;")
    A("    transition-duration: 1ms !important;")
    A("    scroll-behavior: auto !important;")
    A("  }")
    A("}")
    A("")
    A("/* Explizit erlaubte Ausnahme: die Naht-Zeichnung wird Zustand, nicht Animation. */")
    A("@media (prefers-reduced-motion: no-preference) {")
    A("  .pf-seam__line {")
    A("    transform-origin: left center;")
    A("    transform: scaleX(0);")
    A("    transition: transform var(--pf-duration-slower) var(--pf-ease-out);")
    A("  }")
    A("  .pf-seam[data-drawn=\"true\"] .pf-seam__line { transform: scaleX(1); }")
    A("}")
    A("")
    A("/* ---------- 6. Dunkelmodus per Systempraeferenz --------------------------- */")
    A("/* Default bleibt Light (Produktentscheidung des Designers: der Auftritt ist")
    A("   auf helle Werkstoffbilder gebaut — ein Dunkelmodus wuerde die Bildsprache")
    A("   brechen, nicht verbessern). Dark bleibt vollstaendig spezifiziert, damit jede")
    A("   Komponente ohne Zusatzarbeit umschaltbar ist. Aktivierung per data-theme. */")
    A("@media (prefers-color-scheme: dark) {")
    A("  :root:not([data-theme=\"light\"]) {")
    for group, entries in iter_entries(data["alias"]["dark"]):
        if isinstance(entries, str):
            A(f"    --pf-{group}: {resolve(entries, data)};")
            continue
        for role, target in iter_entries(entries):
            if isinstance(target, dict):
                continue
            A(f"    --pf-{group}-{role}: {resolve(target, data)};")
    A("    color-scheme: dark;")
    A("  }")
    A("}")
    A(":root { color-scheme: light; }")
    A("")

    # ---------------- Fokus
    A("/* ---------- 7. Fokus — ueberall sichtbar, WCAG 2.4.7 / 2.4.11 ------------- */")
    A("/* Ring liegt AUSSEN (outline + offset), nie als Ersatz fuer die Border.")
    A("   Auf Akzentflaechen wechselt die Ringfarbe, damit 3:1 gegen den echten")
    A("   Hintergrund halten — nicht gegen eine theoretische Flaeche. */")
    A(":focus-visible {")
    A("  outline: var(--pf-focus-ring-width) solid var(--pf-focus-ring);")
    A("  outline-offset: var(--pf-focus-ring-offset);")
    A("  border-radius: inherit;")
    A("}")
    A("")
    A(".pf-invert :focus-visible,")
    A("[data-theme=\"dark\"] :focus-visible {")
    A("  outline-color: var(--pf-focus-ring-on-inverted);")
    A("}")
    A("")
    A("/* Sekundaere Fokusflaeche: Elemente auf Akzentfuellung */")
    A(".pf-on-accent :focus-visible,")
    A(".pf-button--primary:focus-visible {")
    A("  outline-color: var(--pf-focus-ring-on-accent);")
    A("  outline-offset: 2px;")
    A("}")
    A("")
    A("/* Mausklick darf keinen Ring zeigen — Tastatur schon. */")
    A(":focus:not(:focus-visible) { outline: none; }")
    A("")
    A("/* ---------- 8. Basis ----------------------------------------------------- */")
    A("*, *::before, *::after { box-sizing: border-box; }")
    A("html { -webkit-text-size-adjust: 100%; }")
    A("body {")
    A("  margin: 0;")
    A("  font-family: var(--pf-font-text);")
    A("  font-size: var(--pf-text-base);")
    A("  line-height: var(--pf-leading-normal);")
    A("  color: var(--pf-text-primary);")
    A("  background-color: var(--pf-surface-page);")
    A("  /* Korn als Hintergrund der GANZEN Seite: das Material ist durchgehend. */")
    A("  background-image: var(--pf-grain);")
    A("  background-repeat: repeat;")
    A("  background-size: var(--pf-grain-size);")
    A("}")
    A("")
    A("/* Bilder nie skalierend verschieben, nie Layoutshift. */")
    A("img, svg, picture { display: block; max-width: 100%; height: auto; }")
    A("")
    A("/* Ueberschriften: Hierarchie ueber mehr als Groesse — Familie + Gewicht +")
    A("   Laufweite + Farbe wechseln mit, nicht nur die px. */")
    A("h1, h2, h3, h4 {")
    A("  font-family: var(--pf-font-display);")
    A("  color: var(--pf-text-primary);")
    A("  text-wrap: balance;")
    A("}")
    A("")
    A("p { max-width: var(--pf-measure-text); }")
    A("")
    A("/* Zahlen in Reihen: tabular-nums. */")
    A(".pf-numeric { font-variant-numeric: var(--pf-numeric-tabular); }")
    return "\n".join(L) + "\n"


# ---------------------------------------------------------------- Audit
def run_audit(data: dict) -> int:
    """Berechnet jeden im Audit genannten Kontrastwert neu und vergleicht."""
    problems = 0
    print("Audit — Kontrastwerte werden neu berechnet (WCAG 2.1, rel. Luminanz)\n")
    for section in ("text", "nonText", "darkMode"):
        rows = data["audit"].get(section, [])
        print(f"[{section}]")
        for row in rows:
            fg = resolve(row["fg"], data)
            bg = resolve(row["bg"], data)
            actual = round(contrast(fg, bg), 2)
            claimed = row["ratio"]
            ok = abs(actual - claimed) <= 0.02
            flag = "ok " if ok else "FEHLER"
            if not ok:
                problems += 1
            note = f"  {row.get('use', row.get('level', ''))}"
            print(f"  {flag} {row['fg']:>13} on {row['bg']:<13} behauptet {claimed:>6}  real {actual:>6}{note}")
        print()

    # Mindestwerte
    print("[Mindestwerte]")
    for row in data["audit"]["text"]:
        if row["ratio"] < 4.5:
            print(f"  FEHLER {row['fg']} on {row['bg']} = {row['ratio']} < 4.5")
            problems += 1
    for row in data["audit"]["nonText"]:
        if row["ratio"] < 3.0:
            print(f"  FEHLER {row['fg']} on {row['bg']} = {row['ratio']} < 3.0")
            problems += 1
    print("  Text >= 4.5:1 und Non-Text >= 3.0:1 — alle Paare geprueft." if problems == 0 else "")

    # Hue-Spreizung
    print("\n[Hue-Spreizung]")
    import colorsys

    def hue(hexs):
        h = hexs.lstrip("#")
        r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
        return colorsys.rgb_to_hsv(r, g, b)[0] * 360

    for k, v in data["audit"]["hueSpread"].items():
        if not k.startswith("_") and not k.startswith("$"):
            actual = round(hue(resolve(k, data)), 1)
            ok = abs(actual - v) <= 0.6
            if not ok:
                problems += 1
            print(f"  {'ok ' if ok else 'FEHLER'} {k:<13} hue behauptet {v:>6}  real {actual:>6}")

    print(f"\n{'AUDIT BESTANDEN' if problems == 0 else f'AUDIT FEHLGESCHLAGEN — {problems} Abweichung(en)'}")
    return 1 if problems else 0


def main() -> int:
    data = json.loads(TOKENS.read_text(encoding="utf-8"))
    if "--audit" in sys.argv:
        return run_audit(data)

    css = build_css(data)
    if "--check" in sys.argv:
        print(f"[check] tokens.css ist {'aktuell' if OUT.exists() and OUT.read_text(encoding='utf-8') == css else 'VERALTET'}")
        return 0 if (OUT.exists() and OUT.read_text(encoding="utf-8") == css) else 1

    OUT.write_text(css, encoding="utf-8")
    print(f"[ok] {OUT.relative_to(ROOT)} geschrieben ({len(css)} Bytes, {css.count(chr(10))} Zeilen)")
    print("[ok] Audit:")
    return run_audit(data)


if __name__ == "__main__":
    raise SystemExit(main())
