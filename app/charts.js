// charts.js — small SVG charts drawn by hand, no library: a donut for
// spending by category and bars for the six-month trend.

export function donutChart(slices, size = 220, centerLabel = '') {
  // slices: [{ label, value, color }] — returns an SVG string.
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r * 0.62;
  if (total <= 0) {
    return `<svg viewBox="0 0 ${size} ${size}" class="chart-svg" role="img" aria-label="No spending yet">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#e3ddd2" stroke-width="26"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" class="chart-empty">No data</text>
    </svg>`;
  }
  let angle = -Math.PI / 2;
  const parts = [];
  for (const s of slices) {
    const frac = s.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1);
    const yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0);
    const yi0 = cy + inner * Math.sin(a0);
    parts.push(`<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${s.color}"><title>${s.label}: ${s.pct}</title></path>`);
    angle = a1;
  }
  const center = `<text x="${cx}" y="${cy - 4}" text-anchor="middle" class="chart-center-big">${centerLabel}</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" class="chart-center-small">spent in November</text>`;
  return `<svg viewBox="0 0 ${size} ${size}" class="chart-svg" role="img" aria-label="Spending by category donut chart">${parts.join('')}${center}</svg>`;
}

export function barChart(bars, height = 180) {
  // bars: [{ label, income, spending }] — grouped bars, income vs spending.
  const max = Math.max(1, ...bars.flatMap((b) => [b.income, b.spending]));
  const w = 560;
  const h = height;
  const padL = 8;
  const padB = 26;
  const padT = 8;
  const groupW = (w - padL * 2) / bars.length;
  const barW = Math.min(22, (groupW - 14) / 2);
  const scale = (v) => ((h - padB - padT) * v) / max;
  const parts = [];
  bars.forEach((b, i) => {
    const gx = padL + i * groupW + groupW / 2;
    const ih = scale(b.income);
    const sh = scale(b.spending);
    parts.push(`<rect x="${(gx - barW - 2).toFixed(1)}" y="${(h - padB - ih).toFixed(1)}" width="${barW}" height="${ih.toFixed(1)}" rx="3" fill="#2e7d4f"><title>${b.label} income</title></rect>`);
    parts.push(`<rect x="${(gx + 2).toFixed(1)}" y="${(h - padB - sh).toFixed(1)}" width="${barW}" height="${sh.toFixed(1)}" rx="3" fill="#c25e3a"><title>${b.label} spending</title></rect>`);
    parts.push(`<text x="${gx.toFixed(1)}" y="${h - 8}" text-anchor="middle" class="chart-axis">${b.label}</text>`);
  });
  parts.push(`<line x1="${padL}" y1="${h - padB}" x2="${w - padL}" y2="${h - padB}" stroke="#d8d0c0" stroke-width="1"/>`);
  return `<svg viewBox="0 0 ${w} ${h}" class="chart-svg chart-bars" role="img" aria-label="Monthly income and spending bar chart">${parts.join('')}</svg>`;
}

export function progressBar(pct, tone) {
  const clamped = Math.max(0, Math.min(100, pct));
  return `<div class="bar" role="progressbar" aria-valuenow="${Math.round(clamped)}" aria-valuemin="0" aria-valuemax="100" aria-label="${Math.round(clamped)} percent of budget used">
    <div class="bar-fill bar-${tone}" style="width:${clamped.toFixed(1)}%"></div>
  </div>`;
}
