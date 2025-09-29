import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
    SIZE_OPTIONS,
    GEO_OPTIONS,
    AD_TYPES,
    FREQ_INTERVALS,
    CREATIVE_ACCEPT,
} from "../constants/lineItem.constants";

const escapeHtml = (s: string) =>
    s.replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

function buildFormHtml(): string {
    const sizeOptions = SIZE_OPTIONS
        .map(o => `<option value="${o.id}">${escapeHtml(o.label)}</option>`)
        .join("");

    const geoOptions = GEO_OPTIONS
        .map(o => `<option value="${o.code}">${escapeHtml(o.label)}</option>`)
        .join("");

    const adTypeOptions = AD_TYPES
        .map(o => `<option value="${o.id}">${escapeHtml(o.label)}</option>`)
        .join("");

    const intervalOptions = FREQ_INTERVALS
        .map(o => `<option value="${o.id}">${escapeHtml(o.label)}</option>`)
        .join("");

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

  <form action="/adserver/lineitem" method="POST" enctype="multipart/form-data" novalidate>
    <fieldset>
      <legend>Basic</legend>

      <label for="size">Size</label>
      <select id="size" name="size" required>
        ${sizeOptions}
      </select>

      <div class="row">
        <div>
          <label for="minCpm">Minimum CPM</label>
          <input id="minCpm" name="minCpm" type="number" step="0.01" min="0" required />
          <div class="hint">USD per 1000 impressions</div>
        </div>
        <div>
          <label for="maxCpm">Maximum CPM</label>
          <input id="maxCpm" name="maxCpm" type="number" step="0.01" min="0" required />
        </div>
      </div>

      <label for="geo">Geo (hold Ctrl/Cmd to select multiple)</label>
      <select id="geo" name="geo[]" multiple size="5">
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

export function lineItemController(_fastify: FastifyInstance) {
    return {
        // GET /adserver/lineitem/form
        getForm: async (_req: FastifyRequest, reply: FastifyReply) => {
            const html = buildFormHtml();
            reply.type("text/html; charset=utf-8").send(html);
        },
    };
}
