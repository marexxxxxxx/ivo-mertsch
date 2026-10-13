#!/usr/bin/env python3
"""Schreibt den audit-Block in docs/design/tokens.json NEU — aus den tatsaechlichen
Alias-Werten berechnet, nicht eingetragen.

Aufruf:  python3 tools/audit-tokens.py

Regel im Team: die hier stehenden Zahlen sind berechnet, nicht behauptet. Wer einen
Token aendert, fuehrt dieses Skript aus. tools/build-tokens.py --audit prueft danach
nur noch nach.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
TOKENS = ROOT / "docs" / "design" / "tokens.json"


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
    return round((hi + 0.05) / (lo + 0.05), 2)


def resolve(name: str, data: dict) -> str:
    g, _, s = name.rpartition("-")
    entry = data["primitives"]["color"].get(g, {}).get(s, {})
    return entry.get("hex", name)


def level(r: float) -> str:
    if r >= 7:
        return "AAA"
    if r >= 4.5:
        return "AA"
    if r >= 3:
        return "AA (Non-Text)"
    return "VERBOTEN"


ROLES_TEXT = [
    ("primary", "page", "Koerpertext, Ueberschriften"),
    ("secondary", "page", "Sekundaertext"),
    ("muted", "page", "Meta, Attribution, Bildunterschrift"),
    ("muted", "sunken", "Meta auf vertiefter Flaeche"),
    ("link", "page", "Linktext"),
    ("link-hover", "page", "Link-Hover"),
    ("on-accent", "accent", "Text auf primaerem CTA"),
    ("on-accent", "accent-hover", "Text auf CTA-Hover"),
    ("on-accent", "accent-active", "Text auf CTA-Active"),
    ("success", "page", "Erfolg-Text"),
    ("error", "page", "Fehler-Text"),
    ("warning", "page", "Warn-Text"),
    ("success", "success", "Erfolg-Text auf Fuellflaeche"),
    ("error", "error", "Fehler-Text auf Fuellflaeche"),
    ("warning", "warning", "Warn-Text auf Fuellflaeche"),
    ("on-inverted", "inverted", "Text im invertierten Footer"),
]

ROLES_NONTEXT = [
    ("ring", "page", "Fokusring auf Seitenflaeche"),
    ("ring", "sunken", "Fokusring auf vertiefter Flaeche"),
    ("ring", "raised", "Fokusring auf Karte"),
    ("ring-on-accent", "accent", "Fokusring auf CTA-Fuellung"),
    ("ring-on-inverted", "inverted", "Fokusring im invertierten Footer"),
    ("input", "page", "Input-Border"),
    ("input", "sunken", "Input-Border auf vertiefter Flaeche"),
    ("input-hover", "page", "Input-Border Hover"),
    ("default", "page", "Akzentfuellung gegen Seite (CTA sichtbar)"),
    ("text", "page", "Akzent-Text"),
    ("on-accent", "page", "Kante des dunklen CTA gegen die Seite"),
]


def build(data: dict) -> dict:
    out: dict = {"_comment": data["audit"]["_comment"], "text": [], "nonText": [], "darkMode": [], "hueSpread": {}, "forbidden": data["audit"].get("forbidden", [])}

    import colorsys

    def hue(hexs: str) -> float:
        h = hexs.lstrip("#")
        r, g, b = (int(h[i : i + 2], 16) / 255 for i in (0, 2, 4))
        return round(colorsys.rgb_to_hsv(r, g, b)[0] * 360, 1)

    for theme in ("light", "dark"):
        a = data["alias"][theme]
        S, T, B, F, A = a["surface"], a["text"], a["border"], a["focus"], a["accent"]
        for role, surf, use in ROLES_TEXT:
            fg, bg = T[role], S[surf]
            r = contrast(resolve(fg, data), resolve(bg, data))
            entry = {"fg": fg, "bg": bg, "ratio": r, "level": level(r), "theme": theme, "use": use}
            out["darkMode" if theme == "dark" else "text"].append(entry)
        for grp, role, surf, use in [
            ("focus", "ring", "page", None),
            ("focus", "ring", "sunken", None),
            ("focus", "ring", "raised", None),
            ("focus", "ring-on-accent", "accent", None),
            ("focus", "ring-on-inverted", "inverted", None),
            ("border", "input", "page", None),
            ("border", "input", "sunken", None),
            ("border", "input-hover", "page", None),
            ("accent", "default", "page", None),
            ("accent", "text", "page", None),
            ("border", "on-accent", "page", None),
        ]:
            fg, bg = a[grp][role], S[surf]
            r = contrast(resolve(fg, data), resolve(bg, data))
            out["nonText"].append({"fg": fg, "bg": bg, "ratio": r, "theme": theme,
                                   "use": use or f"{grp}.{role} gegen {surf}"})

    out["hueSpread"] = {
        "accent-700": hue(resolve("accent-700", data)),
        "warning-500": hue(resolve("warning-500", data)),
        "success-500": hue(resolve("success-500", data)),
        "error-500": hue(resolve("error-500", data)),
    }
    out["hueSpread"]["_comment"] = (
        "Farbwinkel im HSV. Bei verbreiteten Farbfehlsichtigkeiten bleibt die "
        "Reihenfolge erhalten. Akzent (174 Grad) liegt 49 Grad von Success (126 Grad) "
        "entfernt — deshalb die Regel: der Akzent darf NIE in Validierungs-Feedback "
        "auftauchen, und Semantik tragen immer Icon + Text, nie die Farbe allein."
    )
    return out


def main() -> int:
    data = json.loads(TOKENS.read_text(encoding="utf-8"))
    data["audit"] = build(data)
    TOKENS.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[ok] audit-Block in {TOKENS.name} neu berechnet: "
          f"{len(data['audit']['text'])} Textpaare, "
          f"{len(data['audit']['nonText'])} Non-Text-Paare, "
          f"{len(data['audit']['darkMode'])} Dark-Paare")

    bad = [p for p in data["audit"]["text"] + data["audit"]["darkMode"] if p["ratio"] < 4.5]
    bad += [p for p in data["audit"]["nonText"] if p["ratio"] < 3]
    if bad:
        print(f"[!] {len(bad)} Paare unter dem Minimum:")
        for p in bad:
            print(f"    {p['theme']:5s} {p['fg']} on {p['bg']} = {p['ratio']} ({p['use']})")
        return 1
    print("[ok] alle Paare erfuellen das jeweilige Minimum (Text 4.5:1, Non-Text 3.0:1).")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
