/**
 * A tiny, pure config-driven form engine.
 *
 * A form is described entirely by data (a `FormConfig`). This module turns that
 * data into everything a UI needs — which fields are visible, what options a
 * dependent dropdown has, which values are invalid, and the final collected
 * result — without importing React or touching the DOM. The renderer lives in
 * components/demos/config-form-demo.tsx; keeping the logic here makes it easy to
 * test and to read.
 *
 * This is the technique used on Qbench (a portal whose columns, fields and form
 * order come from backend configuration) and CCM (forms with fields that depend
 * on other fields), rebuilt with synthetic data and my own design.
 */

export const FIELD_TYPES = ["text", "number", "email", "select", "checkbox", "date", "textarea"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export type Option = { value: string; label: string };

/** Show a field only when another field's value matches. */
export type Condition =
  | { field: string; equals: string | number | boolean }
  | { field: string; in: Array<string | number> }
  | { field: string; notEmpty: true };

export type Field = {
  /** Key used in the collected values. */
  name: string;
  label: string;
  type: FieldType;
  required?: boolean;
  help?: string;
  placeholder?: string;
  /** number fields: inclusive value bounds. */
  min?: number;
  max?: number;
  /** text / email / textarea: length bounds. */
  minLength?: number;
  maxLength?: number;
  /** select: fixed options. */
  options?: Option[];
  /** select: options that depend on another field's value (e.g. country → state). */
  optionsWhen?: { field: string; map: Record<string, Option[]> };
  /** Conditional visibility based on another field. */
  visibleWhen?: Condition;
};

export type FormConfig = {
  title?: string;
  submitLabel?: string;
  fields: Field[];
};

export type FieldValue = string | number | boolean;
export type FormValues = Record<string, FieldValue>;

export type ParseResult =
  | { ok: true; config: FormConfig }
  | { ok: false; error: string };

// --- Parsing & validation of the config itself -----------------------------

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** Parse and validate a JSON config string, returning clear errors (never throws). */
export function parseConfig(json: string): ParseResult {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, error: `Invalid JSON: ${message}` };
  }

  if (!isPlainObject(data)) return { ok: false, error: "Config must be an object." };
  if (!Array.isArray(data.fields)) return { ok: false, error: `Config needs a "fields" array.` };
  if (data.fields.length === 0) return { ok: false, error: "Add at least one field." };

  const names = new Set<string>();
  for (let i = 0; i < data.fields.length; i++) {
    const raw = data.fields[i];
    const where = `Field ${i + 1}`;
    if (!isPlainObject(raw)) return { ok: false, error: `${where}: must be an object.` };
    if (typeof raw.name !== "string" || raw.name.trim() === "")
      return { ok: false, error: `${where}: needs a non-empty "name".` };
    const at = `Field "${raw.name}"`;
    if (names.has(raw.name)) return { ok: false, error: `${at}: duplicate name.` };
    names.add(raw.name);
    if (typeof raw.label !== "string" || raw.label.trim() === "")
      return { ok: false, error: `${at}: needs a "label".` };
    if (typeof raw.type !== "string" || !FIELD_TYPES.includes(raw.type as FieldType))
      return { ok: false, error: `${at}: "type" must be one of ${FIELD_TYPES.join(", ")}.` };
    if (raw.type === "select" && !Array.isArray(raw.options) && !isPlainObject(raw.optionsWhen))
      return { ok: false, error: `${at}: a select needs "options" or "optionsWhen".` };
  }

  return { ok: true, config: data as unknown as FormConfig };
}

// --- Runtime helpers used by the renderer ----------------------------------

export function fieldByName(config: FormConfig, name: string): Field | undefined {
  return config.fields.find((f) => f.name === name);
}

/** Fresh empty values for a config (checkboxes false, everything else ""). */
export function defaultValues(config: FormConfig): FormValues {
  const values: FormValues = {};
  for (const field of config.fields) values[field.name] = field.type === "checkbox" ? false : "";
  return values;
}

/** Keep values whose fields still exist when the config is edited. */
export function reconcileValues(config: FormConfig, previous: FormValues): FormValues {
  const values = defaultValues(config);
  for (const field of config.fields) {
    if (field.name in previous) values[field.name] = previous[field.name];
  }
  return values;
}

/** The options a select currently offers (static, or driven by another field). */
export function optionsFor(field: Field, values: FormValues): Option[] {
  if (field.optionsWhen) {
    const key = String(values[field.optionsWhen.field] ?? "");
    return field.optionsWhen.map[key] ?? [];
  }
  return field.options ?? [];
}

function conditionMet(condition: Condition, values: FormValues): boolean {
  const value = values[condition.field];
  if ("equals" in condition) return value === condition.equals || String(value) === String(condition.equals);
  if ("in" in condition) return condition.in.some((option) => String(option) === String(value));
  return value !== "" && value !== false && value != null;
}

/**
 * Whether a field should be shown. A field is hidden if its `visibleWhen`
 * condition fails, or if a field it depends on is itself hidden — so chains
 * such as country → state → city collapse correctly. `seen` guards against a
 * malformed config that references itself in a cycle.
 */
export function isVisible(
  field: Field,
  config: FormConfig,
  values: FormValues,
  seen: ReadonlySet<string> = new Set(),
): boolean {
  if (seen.has(field.name)) return false;
  const trail = new Set(seen).add(field.name);

  if (field.visibleWhen) {
    const dep = fieldByName(config, field.visibleWhen.field);
    if (dep && !isVisible(dep, config, values, trail)) return false;
    if (!conditionMet(field.visibleWhen, values)) return false;
  }

  if (field.optionsWhen) {
    const dep = fieldByName(config, field.optionsWhen.field);
    if (dep && !isVisible(dep, config, values, trail)) return false;
    if (optionsFor(field, values).length === 0) return false;
  }

  return true;
}

/** Clear dependent-select values that are no longer valid, following the chain. */
export function syncDependentValues(config: FormConfig, values: FormValues): FormValues {
  let next = values;
  // A change can cascade (country clears state, which clears city), so repeat
  // until nothing else changes — bounded by the number of fields.
  for (let pass = 0; pass < config.fields.length; pass++) {
    let changed = false;
    for (const field of config.fields) {
      if (field.type !== "select" || !field.optionsWhen) continue;
      const current = next[field.name];
      if (current === "" || current == null) continue;
      const stillValid = optionsFor(field, next).some((o) => o.value === current);
      if (!stillValid) {
        next = { ...next, [field.name]: "" };
        changed = true;
      }
    }
    if (!changed) break;
  }
  return next;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Validate visible fields; returns a name → message map of only the invalid ones. */
export function validate(config: FormConfig, values: FormValues): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of config.fields) {
    if (!isVisible(field, config, values)) continue;
    const value = values[field.name];

    if (field.required) {
      if (field.type === "checkbox" ? value !== true : value === "" || value == null) {
        errors[field.name] = "This field is required.";
        continue;
      }
    }
    if (value === "" || value == null) continue; // optional and empty: fine

    if (field.type === "number") {
      const n = Number(value);
      if (Number.isNaN(n)) errors[field.name] = "Enter a number.";
      else if (field.min != null && n < field.min) errors[field.name] = `Must be ${field.min} or more.`;
      else if (field.max != null && n > field.max) errors[field.name] = `Must be ${field.max} or less.`;
    } else if (field.type === "email") {
      if (!EMAIL.test(String(value))) errors[field.name] = "Enter a valid email address.";
    } else if (field.type === "text" || field.type === "textarea") {
      const length = String(value).length;
      if (field.minLength != null && length < field.minLength)
        errors[field.name] = `Use at least ${field.minLength} characters.`;
      else if (field.maxLength != null && length > field.maxLength)
        errors[field.name] = `Use at most ${field.maxLength} characters.`;
    }
  }

  return errors;
}

/** The submitted result: visible fields only, numbers as numbers, checkboxes as booleans. */
export function collectValues(config: FormConfig, values: FormValues): Record<string, FieldValue | null> {
  const result: Record<string, FieldValue | null> = {};
  for (const field of config.fields) {
    if (!isVisible(field, config, values)) continue;
    const value = values[field.name];
    if (field.type === "number") result[field.name] = value === "" || value == null ? null : Number(value);
    else if (field.type === "checkbox") result[field.name] = Boolean(value);
    else result[field.name] = (value ?? "") as FieldValue;
  }
  return result;
}
