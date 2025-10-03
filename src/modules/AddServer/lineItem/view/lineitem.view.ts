import {
	AD_TYPES,
	CREATIVE_ACCEPT,
	FREQ_INTERVALS,
	GEO_OPTIONS,
	SIZE_OPTIONS,
} from "../constants/lineItem.constants";

const escapeHtml = (s: string) =>
	s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");

export function buildFormHtml(): string {
	const sizeOptions = SIZE_OPTIONS.map(
		(o) => `<option value="${o.id}">${escapeHtml(o.label)}</option>`,
	).join("");

	const geoOptions = GEO_OPTIONS.map(
		(o) => `<option value="${o.code}">${escapeHtml(o.label)}</option>`,
	).join("");

	const adTypeOptions = AD_TYPES.map(
		(o) => `<option value="${o.id}">${escapeHtml(o.label)}</option>`,
	).join("");

	const intervalOptions = FREQ_INTERVALS.map(
		(o) => `<option value="${o.id}">${escapeHtml(o.label)}</option>`,
	).join("");

	const acceptAttr = CREATIVE_ACCEPT.join(",");

	return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Create Line Item</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body{font-family:system-ui,-apple-system,Segoe UI,Roboto,Ubuntu,Cantarell,Helvetica,Arial,sans-serif;max-width:760px;margin:24px auto;padding:0 16px}
    fieldset{border:1px solid #ddd;border-radius:8px;padding:16px;margin-bottom:16px}
    label{display:block;margin:.5rem 0 .25rem}
    input,select{width:100%;padding:.5rem;border:1px solid #ccc;border-radius:6px}
    .row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
    .hint{color:#666;font-size:.9rem}
    .actions{margin-top:16px;display:flex;gap:12px}
    button{padding:.6rem 1rem;border-radius:8px;border:0;background:#111;color:#fff;cursor:pointer}
    .secondary{background:#eee;color:#111}
  </style>
</head>
<body>
  <h1>Create Line Item</h1>

  <form action="/api/adserver/lineitem/save" method="POST" enctype="multipart/form-data" novalidate>
    <fieldset>
      <legend>Basic</legend>

      <label for="size">Size</label>
      <select id="size" name="size" required>
        ${sizeOptions}
      </select>

      <div class="row">
        <div>
          <label for="cpmMin">Minimum CPM</label>
          <input id="cpmMin" name="cpmMin" type="number" step="0.01" min="0" required />
          <div class="hint">USD per 1000 impressions</div>
        </div>
        <div>
          <label for="cpmMax">Maximum CPM</label>
          <input id="cpmMax" name="cpmMax" type="number" step="0.01" min="0" required />
        </div>
      </div>

      <label for="geo">Geo</label>
<select id="geo" name="geo" required>
  ${geoOptions}
</select>

      <label for="adType">Ad Type</label>
      <select id="adType" name="adType" required>
        ${adTypeOptions}
      </select>
    </fieldset>

    <fieldset>
      <legend>Frequency capping</legend>
      <label>
        <input type="checkbox" name="frequencyCap.enabled" value="true">
        Enable frequency cap
      </label>

      <div class="row">
        <div>
          <label for="fcImpr">Impressions</label>
          <input id="fcImpr" name="frequencyCap.impressions" type="number" min="1" value="3">
        </div>
        <div>
          <label for="fcInt">Interval</label>
          <select id="fcInt" name="frequencyCap.interval">
            ${intervalOptions}
          </select>
        </div>
      </div>
      <div class="hint">If disabled, impressions/interval are ignored.</div>
    </fieldset>

    <fieldset>
      <legend>Creative</legend>
      <label for="creative">Upload creative</label>
      <input id="creative" name="creative" type="file" accept="${acceptAttr}" required />
      <div class="hint">Allowed: ${CREATIVE_ACCEPT.join(", ")}</div>
    </fieldset>

    <div class="actions">
      <button type="submit">Create line item</button>
      <button type="reset" class="secondary">Reset</button>
    </div>
  </form>
</body>
</html>`;
}
