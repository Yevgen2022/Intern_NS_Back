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

	return `
<div id="creative-root" class="li-form">
  <form action="/api/adserver/lineitem/save" method="POST" enctype="multipart/form-data" novalidate>
    <fieldset class="li-fieldset">
      <legend class="li-legend">Basic</legend>

      <label for="size" class="li-label">Size</label>
      <select id="size" name="size" required class="li-select">
        ${sizeOptions}
      </select>

      <div class="li-row">
        <div>
          <label for="cpmMin" class="li-label">Minimum CPM</label>
          <input id="cpmMin" name="cpmMin" type="number" step="0.01" min="0" required class="li-input" />
          <div class="li-hint">USD per 1000 impressions</div>
        </div>
        <div>
          <label for="cpmMax" class="li-label">Maximum CPM</label>
          <input id="cpmMax" name="cpmMax" type="number" step="0.01" min="0" required class="li-input" />
        </div>
      </div>

      <label for="geo" class="li-label">Geo</label>
      <select id="geo" name="geo" required class="li-select">
        ${geoOptions}
      </select>

      <label for="adType" class="li-label">Ad Type</label>
      <select id="adType" name="adType" required class="li-select">
        ${adTypeOptions}
      </select>
    </fieldset>

    <fieldset class="li-fieldset">
      <legend class="li-legend">Frequency capping</legend>
<!--      <label class="li-label li-inline">-->
<!--        <input type="checkbox" name="frequencyCap.enabled" value="true" class="li-checkbox">-->
<!--        <span>Enable frequency cap</span>-->
<!--      </label>-->

      <div class="li-row">
        <div>
          <label for="fcImpr" class="li-label">Impressions</label>
          <input id="fcImpr" name="frequencyCap.impressions" type="number" min="1" value="3" class="li-input" />
        </div>
        <div>
          <label for="fcInt" class="li-label">Interval</label>
          <select id="fcInt" name="frequencyCap.interval" class="li-select">
            ${intervalOptions}
          </select>
        </div>
      </div>
      <div class="li-hint">If disabled, impressions/interval are ignored.</div>
    </fieldset>

     <fieldset class="li-fieldset">
      <legend class="li-legend">Creative</legend>
      <label for="creative" class="li-label">Upload creative</label>
      <input id="creative" name="creative" type="file" accept="${acceptAttr}" required class="li-input" />
      <div class="li-hint">Allowed: ${CREATIVE_ACCEPT.join(", ")}</div>
    </fieldset>


    <div class="li-actions">
      <button type="submit" class="li-btn">Create line item</button>
      <button type="reset" class="li-btn li-btn--secondary">Reset</button>
    </div>
  </form>
</div>`;
}
