import type { FormConfig } from "./form-engine";

/**
 * Three synthetic form configs for the demo. They are plain data — the same
 * shape a backend would send in the real Qbench/CCM products — and cover every
 * supported field type plus both conditional patterns:
 *   - `visibleWhen`: show a field based on another field's value.
 *   - `optionsWhen`: a dropdown whose options depend on another dropdown,
 *     which chains (country → state → city).
 */

const labSampleIntake: FormConfig = {
  title: "Lab sample intake",
  submitLabel: "Log sample",
  fields: [
    { name: "sampleId", label: "Sample ID", type: "text", required: true, minLength: 4, placeholder: "e.g. SMP-2043" },
    {
      name: "sampleType",
      label: "Sample type",
      type: "select",
      required: true,
      options: [
        { value: "blood", label: "Blood" },
        { value: "water", label: "Water" },
        { value: "soil", label: "Soil" },
        { value: "food", label: "Food" },
      ],
    },
    { name: "collectedOn", label: "Collected on", type: "date", required: true },
    { name: "temperatureC", label: "Storage temperature (°C)", type: "number", min: -80, max: 40 },
    { name: "containers", label: "Number of containers", type: "number", required: true, min: 1, max: 50 },
    {
      name: "priority",
      label: "Priority",
      type: "select",
      required: true,
      options: [
        { value: "standard", label: "Standard" },
        { value: "rush", label: "Rush" },
      ],
    },
    {
      name: "rushReason",
      label: "Reason for rush",
      type: "textarea",
      required: true,
      maxLength: 200,
      help: "Shown only when priority is Rush.",
      visibleWhen: { field: "priority", equals: "rush" },
    },
    { name: "hazardous", label: "Hazardous material", type: "checkbox" },
    {
      name: "hazardClass",
      label: "Hazard class",
      type: "select",
      required: true,
      help: "Shown only when the sample is hazardous.",
      visibleWhen: { field: "hazardous", equals: true },
      options: [
        { value: "flammable", label: "Flammable" },
        { value: "corrosive", label: "Corrosive" },
        { value: "toxic", label: "Toxic" },
      ],
    },
  ],
};

const vendorContract: FormConfig = {
  title: "Vendor contract",
  submitLabel: "Save contract",
  fields: [
    { name: "vendorName", label: "Vendor name", type: "text", required: true, minLength: 2 },
    { name: "contactEmail", label: "Contact email", type: "email", required: true },
    {
      name: "contractType",
      label: "Contract type",
      type: "select",
      required: true,
      options: [
        { value: "service", label: "Service" },
        { value: "supply", label: "Supply" },
        { value: "nda", label: "NDA" },
      ],
    },
    { name: "startDate", label: "Start date", type: "date", required: true },
    { name: "annualValue", label: "Annual value (USD)", type: "number", required: true, min: 0 },
    { name: "autoRenew", label: "Auto-renews", type: "checkbox" },
    {
      name: "noticeDays",
      label: "Notice period (days)",
      type: "number",
      required: true,
      min: 1,
      max: 365,
      help: "Shown only when the contract auto-renews.",
      visibleWhen: { field: "autoRenew", equals: true },
    },
    { name: "hasPurchaseOrder", label: "Has a purchase order", type: "checkbox" },
    {
      name: "poNumber",
      label: "PO number",
      type: "text",
      required: true,
      visibleWhen: { field: "hasPurchaseOrder", equals: true },
    },
    { name: "notes", label: "Notes", type: "textarea", maxLength: 500, placeholder: "Optional" },
  ],
};

const simpleContact: FormConfig = {
  title: "Simple contact",
  submitLabel: "Send",
  fields: [
    { name: "name", label: "Your name", type: "text", required: true, minLength: 2 },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "topic",
      label: "Topic",
      type: "select",
      required: true,
      options: [
        { value: "general", label: "General" },
        { value: "sales", label: "Sales" },
        { value: "support", label: "Support" },
      ],
    },
    {
      name: "country",
      label: "Country",
      type: "select",
      options: [
        { value: "in", label: "India" },
        { value: "us", label: "United States" },
      ],
    },
    {
      name: "state",
      label: "State",
      type: "select",
      help: "Options depend on the country.",
      optionsWhen: {
        field: "country",
        map: {
          in: [
            { value: "mh", label: "Maharashtra" },
            { value: "ka", label: "Karnataka" },
          ],
          us: [
            { value: "ca", label: "California" },
            { value: "ny", label: "New York" },
          ],
        },
      },
    },
    {
      name: "city",
      label: "City",
      type: "select",
      help: "Options depend on the state.",
      optionsWhen: {
        field: "state",
        map: {
          mh: [
            { value: "mumbai", label: "Mumbai" },
            { value: "pune", label: "Pune" },
          ],
          ka: [
            { value: "bengaluru", label: "Bengaluru" },
            { value: "mysuru", label: "Mysuru" },
          ],
          ca: [
            { value: "sf", label: "San Francisco" },
            { value: "la", label: "Los Angeles" },
          ],
          ny: [
            { value: "nyc", label: "New York City" },
            { value: "buffalo", label: "Buffalo" },
          ],
        },
      },
    },
    { name: "message", label: "Message", type: "textarea", required: true, maxLength: 500 },
    { name: "subscribe", label: "Subscribe to updates", type: "checkbox" },
  ],
};

export type Preset = { key: string; name: string; config: FormConfig; json: string };

function preset(key: string, name: string, config: FormConfig): Preset {
  return { key, name, config, json: JSON.stringify(config, null, 2) };
}

export const PRESETS: Preset[] = [
  preset("lab", "Lab sample intake", labSampleIntake),
  preset("vendor", "Vendor contract", vendorContract),
  preset("contact", "Simple contact", simpleContact),
];
