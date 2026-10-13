/**
 * Progressive Enhancement des Kontaktformulars.
 *
 * Ohne JavaScript bleibt das Formular ein normaler POST auf /api/contact.
 * Mit JavaScript wird es zu einem fetch-POST mit Inline-Fehler-, Lade-, Erfolgs-
 * und Rate-Limit-Zustaenden — und im Fall `mail_not_configured` zum mailto-Weg.
 *
 * Keine Drittanbieter-Ressource, kein Captcha, keine IP/UUID-Uebertragung
 * ausser den Formularfeldern selbst.
 */
import { buildMailto, toContactInput, validateContact, type ContactField } from "../lib/contact";
import { FORM_ERRORS, FORM_STATES } from "../lib/copy";

const FIELD_ORDER: ContactField[] = ["name", "email", "telefon", "nachricht", "einwilligung"];

interface FormElements {
  form: HTMLFormElement;
  summary: HTMLElement | null;
  submit: HTMLButtonElement | null;
  timestamp: HTMLInputElement | null;
}

function errorEl(field: ContactField): HTMLElement | null {
  return document.getElementById(`contact-${field}-error`);
}

function inputEl(field: ContactField): HTMLInputElement | null {
  return document.querySelector<HTMLInputElement>(`[name="${field}"]`);
}

function clearErrors(): void {
  for (const field of FIELD_ORDER) {
    const box = errorEl(field);
    if (box) {
      box.hidden = true;
      box.textContent = "";
    }
    const input = inputEl(field);
    if (input) input.removeAttribute("aria-invalid");
  }
  const summary = document.querySelector<HTMLElement>("[data-contact-summary]");
  if (summary) {
    summary.hidden = true;
    summary.replaceChildren();
  }
}

function showErrors(errors: Partial<Record<ContactField, string>>, fields: ContactField[]): void {
  const summary = document.querySelector<HTMLElement>("[data-contact-summary]");
  if (summary) {
    const list = document.createElement("ul");
    for (const field of fields) {
      const message = errors[field];
      if (!message) continue;
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#contact-${field}`;
      link.textContent = message;
      item.append(link);
      list.append(item);
    }
    const title = document.createElement("p");
    title.textContent = FORM_ERRORS.summaryTitle;
    summary.replaceChildren(title, list);
    summary.hidden = false;
    summary.focus();
  }

  for (const field of fields) {
    const message = errors[field];
    const box = errorEl(field);
    if (box && message) {
      box.textContent = message;
      box.hidden = false;
    }
    const input = inputEl(field);
    if (input) input.setAttribute("aria-invalid", "true");
  }
}

function setBusy(button: HTMLButtonElement | null, busy: boolean): void {
  if (!button) return;
  if (busy) {
    button.dataset.label = button.textContent ?? "";
    button.textContent = FORM_STATES.loading;
    button.disabled = true;
    button.setAttribute("aria-busy", "true");
  } else {
    if (button.dataset.label) button.textContent = button.dataset.label;
    button.disabled = false;
    button.removeAttribute("aria-busy");
  }
}

function replaceFormWithStatus(form: HTMLFormElement, text: string): void {
  const status = document.createElement("div");
  status.className = "pf-form__status";
  status.setAttribute("role", "status");
  status.tabIndex = -1;
  const check = document.createElement("p");
  check.className = "pf-form__status-icon";
  check.textContent = "✓";
  check.setAttribute("aria-hidden", "true");
  const message = document.createElement("p");
  message.textContent = text;
  status.append(check, message);
  form.replaceWith(status);
  status.focus();
}

function currentPayload(form: HTMLFormElement): Record<string, unknown> {
  const data = new FormData(form);
  const payload: Record<string, unknown> = {};
  for (const [key, value] of data.entries()) payload[key] = typeof value === "string" ? value : "";
  payload.einwilligung = data.get("einwilligung") === "on" || data.get("einwilligung") === "true";
  return payload;
}

async function handleSubmit(elements: FormElements, event: SubmitEvent): Promise<void> {
  event.preventDefault();
  clearErrors();

  const payload = currentPayload(elements.form);
  const localValidation = validateContact(payload);
  if (!localValidation.ok) {
    showErrors(localValidation.errors, localValidation.fields);
    return;
  }

  setBusy(elements.submit, true);
  try {
    const response = await fetch(elements.form.action, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      replaceFormWithStatus(elements.form, FORM_STATES.success);
      return;
    }

    const body = (await response.json().catch(() => ({}))) as {
      error?: string;
      fields?: ContactField[];
      retryAfterSeconds?: number;
    };

    if (response.status === 400 && body.error === "validation") {
      const serverValidation = validateContact(payload);
      showErrors(serverValidation.errors, body.fields ?? serverValidation.fields);
      return;
    }

    if (response.status === 429) {
      const summary = elements.summary;
      if (summary) {
        summary.textContent = FORM_ERRORS.rateLimited;
        summary.hidden = false;
        summary.focus();
      }
      return;
    }

    if (response.status === 503 && body.error === "mail_not_configured") {
      const mailto = elements.form.dataset.mailto;
      if (mailto) {
        const input = toContactInput(payload);
        window.location.href = buildMailto(mailto, input);
        replaceFormWithStatus(elements.form, FORM_STATES.successMailto);
        return;
      }
    }

    const summary = elements.summary;
    if (summary) {
      summary.textContent = FORM_ERRORS.server;
      summary.hidden = false;
      summary.focus();
    }
  } catch {
    const summary = elements.summary;
    if (summary) {
      summary.textContent = FORM_ERRORS.server;
      summary.hidden = false;
      summary.focus();
    }
  } finally {
    setBusy(elements.submit, false);
  }
}

function boot(): void {
  const form = document.querySelector<HTMLFormElement>("[data-contact-form]");
  if (!form) return;
  const elements: FormElements = {
    form,
    summary: form.querySelector<HTMLElement>("[data-contact-summary]"),
    submit: form.querySelector<HTMLButtonElement>("[data-contact-submit]"),
    timestamp: form.querySelector<HTMLInputElement>("[data-contact-ts]"),
  };
  if (elements.timestamp) elements.timestamp.value = String(Date.now());
  form.addEventListener("submit", (event) => {
    void handleSubmit(elements, event);
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", boot, { once: true });
} else {
  boot();
}
