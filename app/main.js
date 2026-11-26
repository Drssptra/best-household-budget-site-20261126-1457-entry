// main.js — router, dialogs and the wiring that makes every control work.
// One page, five hash routes; all state goes through data.js and localStorage.

import {
  CATEGORIES, INCOME_CATEGORIES, loadState, nextId, resetState, saveState,
} from './data.js';
import { renderBudgets, renderDashboard, renderGoals, renderInsights, renderTransactions } from './views.js';

let state = loadState();
let txFilter = { month: state.household.month, q: '', cat: 'all', kind: 'all' };

const view = document.getElementById('view');
const navLinks = [...document.querySelectorAll('[data-route]')];

const ROUTES = {
  dashboard: renderDashboard,
  transactions: renderTransactions,
  budgets: renderBudgets,
  insights: renderInsights,
  goals: renderGoals,
};

function currentRoute() {
  const hash = location.hash.replace(/^#\/?/, '');
  const name = hash.split('/')[0] || 'dashboard';
  return ROUTES[name] ? name : 'dashboard';
}

function render() {
  const route = currentRoute();
  view.innerHTML = route === 'transactions'
    ? renderTransactions(state, txFilter)
    : ROUTES[route](state);
  navLinks.forEach((a) => {
    const active = a.dataset.route === route;
    a.classList.toggle('active', active);
    if (active) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  bindPage(route);
  window.scrollTo(0, 0);
}

function rerender() {
  saveState(state);
  render();
}

// --- Transaction dialog ---------------------------------------------------

const txDialog = document.getElementById('txDialog');
const txForm = document.getElementById('txForm');
const txCategory = document.getElementById('txCategory');
const txError = document.getElementById('txError');

function fillCategories(kind) {
  const list = kind === 'income' ? INCOME_CATEGORIES : CATEGORIES;
  txCategory.innerHTML = list.map((c) => `<option value="${c.id}">${c.label}</option>`).join('');
}

function openTxDialog(tx) {
  document.getElementById('txDialogTitle').textContent = tx ? 'Edit transaction' : 'Add transaction';
  document.getElementById('txId').value = tx ? tx.id : '';
  document.getElementById('txNote').value = tx ? tx.note : '';
  document.getElementById('txAmount').value = tx ? tx.amount.toFixed(2) : '';
  document.getElementById('txKind').value = tx ? tx.kind : 'expense';
  fillCategories(tx ? tx.kind : 'expense');
  txCategory.value = tx ? tx.category : (tx && tx.kind === 'income' ? 'salary' : 'groceries');
  document.getElementById('txDate').value = tx ? tx.date : new Date().toISOString().slice(0, 10);
  document.getElementById('txAccount').value = tx ? tx.account : 'Joint checking';
  document.getElementById('txMember').value = tx ? tx.member : 'Shared';
  txError.hidden = true;
  txDialog.showModal();
}

document.getElementById('txKind').addEventListener('change', (e) => {
  const prev = txCategory.value;
  fillCategories(e.target.value);
  txCategory.value = e.target.value === 'income' ? 'salary' : 'groceries';
  void prev;
});

document.getElementById('txCancel').addEventListener('click', () => txDialog.close());

txForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const id = document.getElementById('txId').value;
  const amount = Number(document.getElementById('txAmount').value);
  const note = document.getElementById('txNote').value.trim();
  const date = document.getElementById('txDate').value;
  if (!note || !Number.isFinite(amount) || amount <= 0 || !date) {
    txError.textContent = 'Please fill in a note, a positive amount and a date.';
    txError.hidden = false;
    return;
  }
  const row = {
    id: id || nextId(state, 't'),
    date,
    kind: document.getElementById('txKind').value,
    category: txCategory.value,
    note,
    amount: Math.round(amount * 100) / 100,
    account: document.getElementById('txAccount').value,
    member: document.getElementById('txMember').value,
  };
  if (id) {
    const i = state.transactions.findIndex((t) => t.id === id);
    if (i >= 0) state.transactions[i] = row;
  } else {
    state.transactions.push(row);
  }
  txDialog.close();
  rerender();
});

// --- Budget dialog --------------------------------------------------------

const budgetDialog = document.getElementById('budgetDialog');
const budgetForm = document.getElementById('budgetForm');
const budgetError = document.getElementById('budgetError');

function openBudgetDialog(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId);
  if (!cat) return;
  document.getElementById('budgetDialogSub').textContent = `${cat.label} — set the most the household spends here in a month.`;
  document.getElementById('budgetCategory').value = cat.id;
  document.getElementById('budgetAmount').value = state.budgets[cat.id] ?? 0;
  budgetError.hidden = true;
  budgetDialog.showModal();
}

document.getElementById('budgetCancel').addEventListener('click', () => budgetDialog.close());

budgetForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const amount = Number(document.getElementById('budgetAmount').value);
  if (!Number.isFinite(amount) || amount < 0) {
    budgetError.textContent = 'Enter a monthly limit of $0 or more.';
    budgetError.hidden = false;
    return;
  }
  state.budgets[document.getElementById('budgetCategory').value] = Math.round(amount);
  budgetDialog.close();
  rerender();
});

// --- Goal dialog ----------------------------------------------------------

const goalDialog = document.getElementById('goalDialog');
const goalForm = document.getElementById('goalForm');
const goalError = document.getElementById('goalError');

function openGoalDialog(goal) {
  document.getElementById('goalDialogTitle').textContent = goal ? 'Edit savings goal' : 'New savings goal';
  document.getElementById('goalId').value = goal ? goal.id : '';
  document.getElementById('goalName').value = goal ? goal.name : '';
  document.getElementById('goalTarget').value = goal ? goal.target : '';
  document.getElementById('goalSaved').value = goal ? goal.saved : 0;
  document.getElementById('goalDate').value = goal ? goal.date || '' : '';
  goalError.hidden = true;
  goalDialog.showModal();
}

document.getElementById('goalCancel').addEventListener('click', () => goalDialog.close());

goalForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = document.getElementById('goalName').value.trim();
  const target = Number(document.getElementById('goalTarget').value);
  const saved = Number(document.getElementById('goalSaved').value);
  if (!name || !Number.isFinite(target) || target <= 0 || !Number.isFinite(saved) || saved < 0) {
    goalError.textContent = 'Give the goal a name, a target above $0 and saved of $0 or more.';
    goalError.hidden = false;
    return;
  }
  if (saved > target) {
    goalError.textContent = 'Saved so far cannot be more than the target — raise the target first.';
    goalError.hidden = false;
    return;
  }
  const id = document.getElementById('goalId').value;
  const row = {
    id: id || nextId(state, 'g'),
    name,
    target: Math.round(target),
    saved: Math.round(saved),
    date: document.getElementById('goalDate').value || '',
  };
  if (id) {
    const i = state.goals.findIndex((g) => g.id === id);
    if (i >= 0) state.goals[i] = row;
  } else {
    state.goals.push(row);
  }
  goalDialog.close();
  rerender();
});

// --- Per-page wiring ------------------------------------------------------

function bindPage(route) {
  // Edit / delete transaction buttons appear on Dashboard and Transactions.
  view.querySelectorAll('[data-edit-tx]').forEach((b) => b.addEventListener('click', () => {
    const tx = state.transactions.find((t) => t.id === b.dataset.editTx);
    if (tx) openTxDialog(tx);
  }));
  view.querySelectorAll('[data-delete-tx]').forEach((b) => b.addEventListener('click', () => {
    const tx = state.transactions.find((t) => t.id === b.dataset.deleteTx);
    if (tx && confirm(`Delete "${tx.note}"?`)) {
      state.transactions = state.transactions.filter((t) => t.id !== tx.id);
      rerender();
    }
  }));
  view.querySelectorAll('[data-edit-budget]').forEach((b) => b.addEventListener('click', () => openBudgetDialog(b.dataset.editBudget)));
  view.querySelectorAll('[data-edit-goal]').forEach((b) => b.addEventListener('click', () => {
    const g = state.goals.find((x) => x.id === b.dataset.editGoal);
    if (g) openGoalDialog(g);
  }));
  view.querySelectorAll('[data-delete-goal]').forEach((b) => b.addEventListener('click', () => {
    const g = state.goals.find((x) => x.id === b.dataset.deleteGoal);
    if (g && confirm(`Delete the goal "${g.name}"?`)) {
      state.goals = state.goals.filter((x) => x.id !== g.id);
      rerender();
    }
  }));

  if (route === 'transactions') {
    const addBtn = document.getElementById('addTxPage');
    if (addBtn) addBtn.addEventListener('click', () => openTxDialog(null));
    const sync = () => {
      txFilter = {
        month: document.getElementById('fMonth').value,
        q: document.getElementById('fQuery').value,
        cat: document.getElementById('fCategory').value,
        kind: document.getElementById('fKind').value,
      };
      render();
    };
    document.getElementById('fMonth').addEventListener('change', sync);
    document.getElementById('fCategory').addEventListener('change', sync);
    document.getElementById('fKind').addEventListener('change', sync);
    document.getElementById('fQuery').addEventListener('input', sync);
  }
  if (route === 'goals') {
    const addBtn = document.getElementById('addGoal');
    if (addBtn) addBtn.addEventListener('click', () => openGoalDialog(null));
  }
}

// --- Global controls ------------------------------------------------------

document.getElementById('addTxTop').addEventListener('click', () => openTxDialog(null));

document.getElementById('resetDemo').addEventListener('click', () => {
  if (confirm('Reset all data back to the sample Hartley household? Your edits will be lost.')) {
    state = resetState();
    txFilter = { month: state.household.month, q: '', cat: 'all', kind: 'all' };
    rerender();
  }
});

window.addEventListener('hashchange', render);

render();
