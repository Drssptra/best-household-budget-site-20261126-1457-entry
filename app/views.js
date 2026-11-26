// views.js — one render function per page. Each returns HTML for #view
// and a bind() that wires up the controls on that page.

import { CATEGORIES, categoryOf, daysLeftInMonth, formatDate, formatMoney, monthLabel, monthNameShort, monthOf, monthTotals } from './data.js';
import { barChart, donutChart, progressBar } from './charts.js';

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function budgetTone(pct) {
  if (pct > 100) return 'over';
  if (pct >= 80) return 'warn';
  return 'ok';
}

function budgetNote(pct) {
  if (pct > 100) return 'Over budget';
  if (pct >= 100) return 'At the limit';
  if (pct >= 80) return 'Nearly there';
  return 'On track';
}

function txRow(t) {
  const cat = t.kind === 'income' ? { label: t.category === 'salary' ? 'Salary' : t.category === 'freelance' ? 'Freelance & Side Work' : t.category === 'refund' ? 'Refunds & Rebates' : 'Other Income', color: '#2e7d4f', icon: '＋' } : categoryOf(t.category);
  const sign = t.kind === 'income' ? '+' : '−';
  return `<tr>
    <td>${formatDate(t.date)}</td>
    <td><span class="cat-chip"><span class="cat-dot" style="background:${cat.color}"></span>${esc(t.note)}</span>
      <span class="tx-sub">${esc(cat.label)} · ${esc(t.account)} · ${esc(t.member)}</span></td>
    <td class="num ${t.kind}">${sign}${formatMoney(t.amount)}</td>
    <td class="row-actions">
      <button type="button" class="btn btn-small" data-edit-tx="${t.id}">Edit</button>
      <button type="button" class="btn btn-small btn-danger" data-delete-tx="${t.id}">Delete</button>
    </td>
  </tr>`;
}

// --- Dashboard -----------------------------------------------------------

export function renderDashboard(state) {
  const month = state.household.month;
  const { income, spending, byCategory } = monthTotals(state, month);
  const left = income - spending;
  const saveRate = income > 0 ? Math.max(0, (left / income) * 100) : 0;
  const budgetTotal = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  const budgetSpent = [...byCategory.values()].reduce((a, b) => a + b, 0);
  const budgetPct = budgetTotal > 0 ? (budgetSpent / budgetTotal) * 100 : 0;

  const slices = CATEGORIES.map((c) => {
    const v = byCategory.get(c.id) || 0;
    return { label: c.label, value: v, color: c.color, pct: spending > 0 ? `${Math.round((v / spending) * 100)}%` : '0%' };
  }).filter((s) => s.value > 0).sort((a, b) => b.value - a.value);
  const top = slices.slice(0, 5);
  const legend = top.map((s) => `<li><span class="cat-dot" style="background:${s.color}"></span>${esc(s.label)}<strong>${formatMoney(s.value)}</strong><span class="muted">${s.pct}</span></li>`).join('');

  const recent = [...state.transactions]
    .filter((t) => monthOf(t.date) === month)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 6);

  const over = CATEGORIES.filter((c) => {
    const spent = byCategory.get(c.id) || 0;
    return state.budgets[c.id] && spent > state.budgets[c.id];
  });
  const daysLeft = daysLeftInMonth(month);

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">${esc(state.household.name)} · ${monthLabel(month)}</p>
      <h1>November at a glance</h1>
      <p class="lede">Money in, money out, and what is left for the rest of the month — for a family of four, all in one place.</p>
    </div>
    <div class="head-side">
      <p class="head-side-label">Days left in ${monthNameShort(month)}</p>
      <p class="head-side-big">${daysLeft === null ? '—' : daysLeft}</p>
      <p class="muted">${daysLeft === null ? 'Month closed' : 'Budget check on the 30th'}</p>
    </div>
  </section>

  ${over.length ? `<p class="alert" role="alert">⚠ ${over.map((c) => esc(c.label)).join(', ')} ${over.length > 1 ? 'are' : 'is'} over budget this month. <a href="#/budgets">Review budgets →</a></p>` : ''}

  <section class="stat-grid" aria-label="Month totals">
    <article class="stat-card"><p class="stat-label">Income</p><p class="stat-value income">${formatMoney(income)}</p><p class="muted">Salaries, freelance &amp; refunds</p></article>
    <article class="stat-card"><p class="stat-label">Spending</p><p class="stat-value expense">${formatMoney(spending)}</p><p class="muted">${formatMoney(budgetSpent)} of ${formatMoney(budgetTotal)} budgeted</p></article>
    <article class="stat-card"><p class="stat-label">Left to spend</p><p class="stat-value">${formatMoney(left)}</p><p class="muted">${saveRate.toFixed(0)}% of income kept this month</p></article>
    <article class="stat-card"><p class="stat-label">Savings goal</p><p class="stat-value">${formatMoney(state.savingsTarget)}</p><p class="muted">Set aside each month · <a href="#/goals">see goals →</a></p></article>
  </section>

  <section class="two-col">
    <article class="card">
      <div class="card-head"><h2>Where the money went</h2><a href="#/insights">Insights →</a></div>
      <div class="donut-wrap">
        ${donutChart(slices, 220, formatMoney(spending))}
        <ul class="legend">${legend}</ul>
      </div>
      <p class="muted small">Housing is the biggest slice at ${formatMoney(byCategory.get('housing') || 0)} — rent is fixed, so the money you can move sits in groceries, dining and entertainment.</p>
    </article>
    <article class="card">
      <div class="card-head"><h2>Budgets this month</h2><a href="#/budgets">All budgets →</a></div>
      ${CATEGORIES.slice(0, 5).map((c) => {
        const spent = byCategory.get(c.id) || 0;
        const limit = state.budgets[c.id] || 0;
        const pct = limit > 0 ? (spent / limit) * 100 : 0;
        return `<div class="budget-line">
          <div class="budget-line-head"><span>${c.icon} ${esc(c.label)}</span><span><strong>${formatMoney(spent)}</strong> <span class="muted">of ${formatMoney(limit)}</span></span></div>
          ${progressBar(pct, budgetTone(pct))}
          <p class="budget-line-note ${budgetTone(pct)}">${budgetNote(pct)} · ${Math.round(pct)}%</p>
        </div>`;
      }).join('')}
      <p class="muted small">Overall ${Math.round(budgetPct)}% of the month's budgets used${daysLeft === null ? ', and the month is closed.' : `, with ${daysLeft} day${daysLeft === 1 ? '' : 's'} to go.`}</p>
    </article>
  </section>

  <section class="card">
    <div class="card-head"><h2>Recent transactions</h2><a href="#/transactions">All transactions →</a></div>
    <div class="table-wrap"><table class="tx-table">
      <thead><tr><th>Date</th><th>What</th><th class="num">Amount</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
      <tbody>${recent.map(txRow).join('')}</tbody>
    </table></div>
  </section>`;
}

// --- Transactions --------------------------------------------------------

export function renderTransactions(state, filter) {
  const month = state.household.month;
  const months = [...new Set(state.transactions.map((t) => monthOf(t.date)))].sort().reverse();
  const f = filter || { month, q: '', cat: 'all', kind: 'all' };
  let rows = state.transactions.filter((t) => monthOf(t.date) === f.month);
  if (f.kind !== 'all') rows = rows.filter((t) => t.kind === f.kind);
  if (f.cat !== 'all') rows = rows.filter((t) => t.category === f.cat);
  if (f.q) {
    const q = f.q.toLowerCase();
    rows = rows.filter((t) => t.note.toLowerCase().includes(q) || t.account.toLowerCase().includes(q) || t.member.toLowerCase().includes(q));
  }
  rows.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
  const { income, spending } = monthTotals(state, f.month);

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">Every dollar in and out</p>
      <h1>Transactions</h1>
      <p class="lede">Search, filter and fix the record. Add a transaction and the dashboard, budgets and charts update at once.</p>
    </div>
    <div class="head-side"><button class="btn btn-primary btn-large" id="addTxPage" type="button">+ Add transaction</button></div>
  </section>

  <section class="stat-grid stat-grid-3">
    <article class="stat-card"><p class="stat-label">Income · ${monthLabel(f.month)}</p><p class="stat-value income">${formatMoney(income)}</p></article>
    <article class="stat-card"><p class="stat-label">Spending · ${monthLabel(f.month)}</p><p class="stat-value expense">${formatMoney(spending)}</p></article>
    <article class="stat-card"><p class="stat-label">Net · ${monthLabel(f.month)}</p><p class="stat-value">${formatMoney(income - spending)}</p></article>
  </section>

  <section class="card filters" aria-label="Filter transactions">
    <label>Month
      <select id="fMonth">${months.map((m) => `<option value="${m}" ${m === f.month ? 'selected' : ''}>${monthLabel(m)}</option>`).join('')}</select>
    </label>
    <label>Search
      <input type="search" id="fQuery" value="${esc(f.q)}" placeholder="e.g. Green Mart">
    </label>
    <label>Category
      <select id="fCategory">
        <option value="all">All categories</option>
        ${CATEGORIES.map((c) => `<option value="${c.id}" ${f.cat === c.id ? 'selected' : ''}>${esc(c.label)}</option>`).join('')}
        <option value="salary" ${f.cat === 'salary' ? 'selected' : ''}>Salary</option>
        <option value="freelance" ${f.cat === 'freelance' ? 'selected' : ''}>Freelance &amp; Side Work</option>
        <option value="refund" ${f.cat === 'refund' ? 'selected' : ''}>Refunds &amp; Rebates</option>
      </select>
    </label>
    <label>Type
      <select id="fKind">
        <option value="all" ${f.kind === 'all' ? 'selected' : ''}>Income &amp; expenses</option>
        <option value="income" ${f.kind === 'income' ? 'selected' : ''}>Income only</option>
        <option value="expense" ${f.kind === 'expense' ? 'selected' : ''}>Expenses only</option>
      </select>
    </label>
  </section>

  <section class="card">
    <div class="card-head"><h2>${rows.length} transaction${rows.length === 1 ? '' : 's'}</h2><span class="muted">${monthLabel(f.month)}</span></div>
    ${rows.length ? `<div class="table-wrap"><table class="tx-table">
      <thead><tr><th>Date</th><th>What</th><th class="num">Amount</th><th><span class="visually-hidden">Actions</span></th></tr></thead>
      <tbody>${rows.map(txRow).join('')}</tbody>
    </table></div>` : `<p class="empty">No transactions match these filters. Try clearing the search or picking another month.</p>`}
  </section>`;
}

// --- Budgets -------------------------------------------------------------

export function renderBudgets(state) {
  const month = state.household.month;
  const { spending, byCategory } = monthTotals(state, month);
  const budgetTotal = Object.values(state.budgets).reduce((a, b) => a + b, 0);
  const budgetPct = budgetTotal > 0 ? (spending / budgetTotal) * 100 : 0;
  const overCount = CATEGORIES.filter((c) => (byCategory.get(c.id) || 0) > (state.budgets[c.id] || 0)).length;

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">Plan first, spend second</p>
      <h1>Monthly budgets</h1>
      <p class="lede">One limit per category for ${monthLabel(month)}. Tap any budget to change it — the bars and the dashboard follow immediately.</p>
    </div>
    <div class="head-side">
      <p class="head-side-label">Total budgeted</p>
      <p class="head-side-big">${formatMoney(budgetTotal)}</p>
      <p class="muted">${Math.round(budgetPct)}% used · ${overCount} over budget</p>
    </div>
  </section>

  <section class="budget-grid">
    ${CATEGORIES.map((c) => {
      const spent = byCategory.get(c.id) || 0;
      const limit = state.budgets[c.id] || 0;
      const pct = limit > 0 ? (spent / limit) * 100 : 0;
      const remaining = limit - spent;
      return `<article class="card budget-card">
        <div class="card-head"><h2>${c.icon} ${esc(c.label)}</h2><span class="pill pill-${budgetTone(pct)}">${budgetNote(pct)}</span></div>
        <p class="budget-amounts"><strong>${formatMoney(spent)}</strong> <span class="muted">spent of ${formatMoney(limit)}</span></p>
        ${progressBar(pct, budgetTone(pct))}
        <p class="budget-remaining ${remaining < 0 ? 'over' : ''}">${remaining < 0 ? `${formatMoney(-remaining)} over` : `${formatMoney(remaining)} left`} · ${Math.round(pct)}% used</p>
        <button type="button" class="btn btn-small" data-edit-budget="${c.id}">Change budget</button>
      </article>`;
    }).join('')}
  </section>

  <section class="card">
    <h2>How to set a budget that sticks</h2>
    <ol class="tips">
      <li><strong>Start with last month.</strong> October's spending was ${formatMoney(3355.03)} — copy a category's real number, then trim one at a time.</li>
      <li><strong>Keep rent and bills fixed.</strong> Housing, utilities and subscriptions barely move; the wins are in groceries, dining and entertainment.</li>
      <li><strong>Leave slack.</strong> A budget with no breathing room gets ignored by week three. Aim for 5–10% under what you actually spend.</li>
      <li><strong>Check in weekly.</strong> Five minutes on Sunday beats an hour of regret on the 30th — the bars above turn amber at 80%.</li>
    </ol>
  </section>`;
}

// --- Insights ------------------------------------------------------------

export function renderInsights(state) {
  const month = state.household.month;
  const { income, spending, byCategory } = monthTotals(state, month);
  const bars = [...state.history, { month, income, spending }].map((h) => ({
    label: monthNameShort(h.month), income: Math.round(h.income), spending: Math.round(h.spending),
  }));
  const avgSpending = Math.round(bars.reduce((a, b) => a + b.spending, 0) / bars.length);
  const bestMonth = bars.reduce((a, b) => (b.spending < a.spending ? b : a));
  const topCats = CATEGORIES.map((c) => ({ ...c, spent: byCategory.get(c.id) || 0 }))
    .sort((a, b) => b.spent - a.spent).slice(0, 3);
  const savings = income - spending;
  const prev = state.history[state.history.length - 1];
  const delta = prev ? spending - prev.spending : 0;

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">Six months of the household's money</p>
      <h1>Insights</h1>
      <p class="lede">Where November stands against the last five months, and what is actually driving the spending.</p>
    </div>
  </section>

  <section class="stat-grid stat-grid-3">
    <article class="stat-card"><p class="stat-label">Average monthly spending</p><p class="stat-value">${formatMoney(avgSpending)}</p><p class="muted">Across the last 6 months</p></article>
    <article class="stat-card"><p class="stat-label">Cheapest month</p><p class="stat-value">${bestMonth.label} · ${formatMoney(bestMonth.spending)}</p><p class="muted">Lowest spending of the six</p></article>
    <article class="stat-card"><p class="stat-label">vs October</p><p class="stat-value ${delta <= 0 ? 'income' : 'expense'}">${delta <= 0 ? '▼' : '▲'} ${formatMoney(Math.abs(delta))}</p><p class="muted">${delta <= 0 ? 'Less spent than last month' : 'More spent than last month'}</p></article>
  </section>

  <section class="two-col">
    <article class="card">
      <div class="card-head"><h2>Income vs spending</h2><span class="muted">Jun – Nov 2026</span></div>
      ${barChart(bars)}
      <p class="legend-inline"><span class="swatch" style="background:#2e7d4f"></span> Income <span class="swatch" style="background:#c25e3a"></span> Spending</p>
      <p class="muted small">November kept ${formatMoney(savings)} of its income — the best savings month of the six, thanks to the energy rebate and a quieter week of dining out.</p>
    </article>
    <article class="card">
      <div class="card-head"><h2>Biggest costs in November</h2><a href="#/budgets">Budgets →</a></div>
      <ol class="rank-list">
        ${topCats.map((c, i) => `<li>
          <span class="rank-num">${i + 1}</span>
          <span class="rank-body"><strong>${c.icon} ${esc(c.label)}</strong><span class="muted">${formatMoney(c.spent)} · ${spending > 0 ? Math.round((c.spent / spending) * 100) : 0}% of spending</span></span>
          <strong>${formatMoney(c.spent)}</strong>
        </li>`).join('')}
      </ol>
      <h3 class="subhead">What this means</h3>
      <ul class="tips">
        <li><strong>Housing is fixed</strong> at ${formatMoney(byCategory.get('housing') || 0)} — nearly half the month's spending, and not where savings come from.</li>
        <li><strong>Groceries are the lever:</strong> ${formatMoney(byCategory.get('groceries') || 0)} across five shops. One planned shop a week instead of top-ups would cut it by roughly $60.</li>
        <li><strong>Dining out is small but visible:</strong> three meals out cost ${formatMoney(byCategory.get('dining') || 0)}. Cooking the Friday pizza at home saves about $25 a week.</li>
      </ul>
    </article>
  </section>`;
}

// --- Goals ---------------------------------------------------------------

export function renderGoals(state) {
  const month = state.household.month;
  const { income, spending } = monthTotals(state, month);
  const monthlySave = Math.max(0, income - spending);
  const totalSaved = state.goals.reduce((a, g) => a + g.saved, 0);
  const totalTarget = state.goals.reduce((a, g) => a + g.target, 0);

  return `
  <section class="page-head">
    <div>
      <p class="eyebrow">What the leftover is for</p>
      <h1>Savings goals</h1>
      <p class="lede">Every dollar the month leaves behind gets a job. November can put ${formatMoney(monthlySave)} toward these goals.</p>
    </div>
    <div class="head-side"><button class="btn btn-primary btn-large" id="addGoal" type="button">+ New goal</button></div>
  </section>

  <section class="stat-grid stat-grid-3">
    <article class="stat-card"><p class="stat-label">Saved across all goals</p><p class="stat-value">${formatMoney(totalSaved)}</p><p class="muted">of ${formatMoney(totalTarget)} in targets</p></article>
    <article class="stat-card"><p class="stat-label">This month's surplus</p><p class="stat-value income">${formatMoney(monthlySave)}</p><p class="muted">Income minus spending</p></article>
    <article class="stat-card"><p class="stat-label">Monthly savings target</p><p class="stat-value">${formatMoney(state.savingsTarget)}</p><p class="muted">Set aside before spending</p></article>
  </section>

  <section class="goal-grid">
    ${state.goals.map((g) => {
      const pct = g.target > 0 ? (g.saved / g.target) * 100 : 0;
      const left = g.target - g.saved;
      const monthsLeft = monthlySave > 0 ? Math.ceil(left / monthlySave) : null;
      return `<article class="card goal-card">
        <div class="card-head"><h2>${esc(g.name)}</h2><span class="pill pill-ok">${Math.round(pct)}%</span></div>
        <p class="budget-amounts"><strong>${formatMoney(g.saved)}</strong> <span class="muted">saved of ${formatMoney(g.target)}</span></p>
        ${progressBar(pct, 'ok')}
        <p class="muted">${formatMoney(left)} to go${g.date ? ` · target ${formatDate(g.date)}` : ''}${monthsLeft ? ` · about ${monthsLeft} month${monthsLeft === 1 ? '' : 's'} at November's pace` : ''}</p>
        <div class="row-actions">
          <button type="button" class="btn btn-small" data-edit-goal="${g.id}">Edit</button>
          <button type="button" class="btn btn-small btn-danger" data-delete-goal="${g.id}">Delete</button>
        </div>
      </article>`;
    }).join('')}
  </section>

  <section class="card">
    <h2>How the household saves</h2>
    <p>The Hartleys move ${formatMoney(state.savingsTarget)} to savings on the 1st of the month, before any spending happens — pay yourself first, then live on what is left. The emergency fund comes first: three months of rent (${formatMoney(4350)}) before the holiday fund gets a top-up. A goal is "done" when its bar hits 100% and the money moves to the account the goal names.</p>
  </section>`;
}
