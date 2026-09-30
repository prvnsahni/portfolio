"use client";

import { useMemo, useState } from "react";
import {
  collectValues,
  defaultValues,
  type Field,
  type FormConfig,
  type FormValues,
  isVisible,
  optionsFor,
  parseConfig,
  reconcileValues,
  syncDependentValues,
  validate,
} from "@/lib/form-engine";
import { PRESETS } from "@/lib/form-presets";

const inputClass =
  "w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30";

function FieldControl({
  field,
  value,
  values,
  error,
  onChange,
}: {
  field: Field;
  value: string | number | boolean;
  values: FormValues;
  error?: string;
  onChange: (next: string | boolean) => void;
}) {
  const id = `f-${field.name}`;
  const describedBy = [field.help ? `${id}-help` : null, error ? `${id}-error` : null].filter(Boolean).join(" ");
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  };

  if (field.type === "checkbox") {
    return (
      <div>
        <label htmlFor={id} className="flex items-center gap-2 text-sm text-text">
          <input
            {...common}
            type="checkbox"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
            className="h-4 w-4 accent-accent"
          />
          {field.label}
          {field.required && <span className="text-bad"> *</span>}
        </label>
        {field.help && (
          <p id={`${id}-help`} className="mt-1 text-xs text-muted">
            {field.help}
          </p>
        )}
        {error && (
          <p id={`${id}-error`} className="mt-1 text-xs text-bad">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-text">
        {field.label}
        {field.required && <span className="text-bad"> *</span>}
      </label>

      <div className="mt-1.5">
        {field.type === "select" ? (
          <select {...common} value={String(value)} onChange={(e) => onChange(e.target.value)} className={inputClass}>
            <option value="">Select…</option>
            {optionsFor(field, values).map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : field.type === "textarea" ? (
          <textarea
            {...common}
            value={String(value)}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            rows={3}
            className={inputClass}
          />
        ) : (
          <input
            {...common}
            type={field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : "text"}
            value={String(value)}
            placeholder={field.placeholder}
            min={field.type === "number" ? field.min : undefined}
            max={field.type === "number" ? field.max : undefined}
            onChange={(e) => onChange(e.target.value)}
            className={inputClass}
          />
        )}
      </div>

      {field.help && (
        <p id={`${id}-help`} className="mt-1 text-xs text-muted">
          {field.help}
        </p>
      )}
      {error && (
        <p id={`${id}-error`} className="mt-1 text-xs text-bad">
          {error}
        </p>
      )}
    </div>
  );
}

export function ConfigFormDemo() {
  const [activePreset, setActivePreset] = useState(PRESETS[0].key);
  const [text, setText] = useState(PRESETS[0].json);
  const [config, setConfig] = useState<FormConfig>(PRESETS[0].config);
  const [error, setError] = useState<string | null>(null);
  const [values, setValues] = useState<FormValues>(() => defaultValues(PRESETS[0].config));
  const [showErrors, setShowErrors] = useState(false);
  const [submitted, setSubmitted] = useState<string | null>(null);

  const errors = useMemo(() => validate(config, values), [config, values]);

  function loadPreset(key: string) {
    const preset = PRESETS.find((p) => p.key === key);
    if (!preset) return;
    setActivePreset(key);
    setText(preset.json);
    setConfig(preset.config);
    setValues(defaultValues(preset.config));
    setError(null);
    setShowErrors(false);
    setSubmitted(null);
  }

  function editConfig(next: string) {
    setText(next);
    setActivePreset("");
    setSubmitted(null);
    setShowErrors(false);
    const result = parseConfig(next);
    if (!result.ok) {
      setError(result.error);
      return; // keep the last valid config rendered
    }
    setError(null);
    setConfig(result.config);
    setValues((prev) => syncDependentValues(result.config, reconcileValues(result.config, prev)));
  }

  function setValue(field: Field, raw: string | boolean) {
    setSubmitted(null);
    setValues((prev) => syncDependentValues(config, { ...prev, [field.name]: raw }));
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (Object.keys(errors).length > 0) {
      setShowErrors(true);
      setSubmitted(null);
      return;
    }
    setShowErrors(false);
    setSubmitted(JSON.stringify(collectValues(config, values), null, 2));
  }

  const visibleFields = config.fields.filter((f) => isVisible(f, config, values));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Config editor */}
      <section className="rounded-2xl border border-line bg-surface p-5" aria-label="Form configuration">
        <div className="flex flex-wrap items-center gap-2">
          <span className="mr-1 text-xs font-medium text-muted">Preset:</span>
          {PRESETS.map((p) => (
            <button
              key={p.key}
              type="button"
              onClick={() => loadPreset(p.key)}
              aria-pressed={activePreset === p.key}
              className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${
                activePreset === p.key
                  ? "border-accent/60 bg-accent/10 text-accent"
                  : "border-line text-muted hover:border-accent/40 hover:text-text"
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <label htmlFor="config-editor" className="mt-4 block text-xs font-medium text-muted">
          Config (JSON) — edit it and the form updates live
        </label>
        <textarea
          id="config-editor"
          data-testid="config-editor"
          value={text}
          onChange={(e) => editConfig(e.target.value)}
          spellCheck={false}
          rows={18}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "config-error" : undefined}
          className="mt-1.5 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 font-mono text-xs leading-relaxed text-text outline-none focus:border-accent/70 focus:ring-2 focus:ring-accent/30"
        />

        {error ? (
          <p id="config-error" data-testid="config-error" role="alert" className="mt-2 rounded-lg border border-bad/40 bg-bad/10 px-3 py-2 text-xs text-bad">
            {error}
          </p>
        ) : (
          <p className="mt-2 text-xs text-good">Config is valid.</p>
        )}
      </section>

      {/* Rendered form */}
      <section className="rounded-2xl border border-line bg-surface p-5" aria-label="Rendered form">
        <h3 className="text-sm font-semibold text-text">{config.title ?? "Form"}</h3>
        <form onSubmit={onSubmit} data-testid="rendered-form" noValidate className="mt-4 space-y-4">
          {visibleFields.map((field) => (
            <FieldControl
              key={field.name}
              field={field}
              value={values[field.name]}
              values={values}
              error={showErrors ? errors[field.name] : undefined}
              onChange={(next) => setValue(field, next)}
            />
          ))}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-bg hover:bg-accent-strong"
            >
              {config.submitLabel ?? "Submit"}
            </button>
            {showErrors && Object.keys(errors).length > 0 && (
              <span role="status" className="text-xs text-bad">
                Fix {Object.keys(errors).length} field{Object.keys(errors).length > 1 ? "s" : ""} above.
              </span>
            )}
          </div>
        </form>

        {submitted && (
          <div className="mt-5">
            <p className="text-xs font-medium text-muted">Collected values (nothing is sent anywhere):</p>
            <pre
              data-testid="submit-result"
              className="mt-1.5 overflow-x-auto rounded-lg border border-line bg-surface-2 p-3 font-mono text-xs text-text"
            >
              {submitted}
            </pre>
          </div>
        )}
      </section>
    </div>
  );
}
