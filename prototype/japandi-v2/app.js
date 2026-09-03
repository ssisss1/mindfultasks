/* MindfulTasks — Japandi v2 prototype
   Auth + task storage via Supabase. The breathing pause stays in-memory. */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/* ---- Supabase --------------------------------------------------------
   The URL and publishable key are meant to live in the browser and are
   safe to commit. Data is protected by Row-Level Security (each row is
   tied to a user), not by keeping these secret. */
const SUPABASE_URL = 'https://imhndydivpbqvxrhupox.supabase.co';
const SUPABASE_KEY = 'sb_publishable__FUXSNk2MOdMnoyEUI8ooA_sC38GbvT';
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

var $ = function (sel, root) { return (root || document).querySelector(sel); };
var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

var authView = $('#authView');
var appView = $('#appView');

/* ==================================================================
   AUTH
   ================================================================== */
var authMode = 'signin';

function setAuthMode(mode) {
  authMode = mode;
  var signup = mode === 'signup';
  $('#authTitle').textContent = signup ? 'Create your account' : 'Welcome back';
  $('#authSub').textContent = signup ? 'A quiet place for today’s tasks.' : 'Sign in to pick up today.';
  $('#authSubmit').textContent = signup ? 'Create account' : 'Sign in';
  $('#authSubmit').disabled = false;
  $('#authToggleText').textContent = signup ? 'Already have an account?' : 'New here?';
  $('#authToggle').textContent = signup ? 'Sign in' : 'Create an account';
  $('#password').autocomplete = signup ? 'new-password' : 'current-password';
  $('#authError').hidden = true;
}

function authError(msg) {
  var el = $('#authError');
  el.textContent = msg;
  el.hidden = false;
}

$('#authToggle').addEventListener('click', function () {
  setAuthMode(authMode === 'signin' ? 'signup' : 'signin');
});

$('#authForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  $('#authError').hidden = true;
  var email = $('#email').value.trim();
  var password = $('#password').value;
  var btn = $('#authSubmit');
  var label = btn.textContent;
  btn.disabled = true;
  btn.textContent = 'One moment…';

  try {
    if (authMode === 'signup') {
      var res = await supabase.auth.signUp({ email: email, password: password });
      if (res.error) throw res.error;
      if (!res.data.session) {
        authError('Account created — now confirm your email and sign in. (Or switch off "Confirm email" in the Supabase Auth settings for instant sign-in.)');
      }
      /* if a session came back, onAuthStateChange shows the app */
    } else {
      var out = await supabase.auth.signInWithPassword({ email: email, password: password });
      if (out.error) throw out.error;
    }
  } catch (err) {
    authError(err && err.message ? err.message : 'Something went wrong.');
  } finally {
    btn.disabled = false;
    btn.textContent = label;
  }
});

$('#signOut').addEventListener('click', async function () {
  await supabase.auth.signOut();
});

function route(session) {
  if (session) {
    authView.hidden = true;
    appView.hidden = false;
    $('#accountEmail').textContent = session.user.email || '';
    loadTasks();
  } else {
    appView.hidden = true;
    authView.hidden = false;
    tasks = [];
    $('#authForm').reset();
    setAuthMode('signin');
  }
}

supabase.auth.onAuthStateChange(function (event, session) {
  if (event === 'SIGNED_IN') route(session);
  else if (event === 'SIGNED_OUT') route(null);
});

/* ==================================================================
   TASKS — one row per task in the `tasks` table, owned by the user
   ================================================================== */
var tasks = [];

function fromRow(r) {
  return { id: r.id, title: r.title, priority: r.priority, due: r.due_date, done: r.done, created_at: r.created_at };
}

async function loadTasks() {
  var res = await supabase.from('tasks').select('*').order('created_at', { ascending: true });
  if (res.error) {
    var note = $('#listNote');
    note.textContent = 'Could not load your tasks.';
    note.hidden = false;
    return;
  }
  $('#listNote').hidden = true;
  tasks = (res.data || []).map(fromRow);
  render();
}

async function addTask(title, priority, due) {
  var res = await supabase.from('tasks').insert({ title: title, priority: priority, due_date: due });
  if (res.error) { flash('Could not add that task.'); return; }
  await loadTasks();
}

async function updateTask(id, patch) {
  var res = await supabase.from('tasks').update(patch).eq('id', id);
  if (res.error) flash('Could not save that change.');
  await loadTasks();
}

function flash(msg) {
  var note = $('#listNote');
  note.textContent = msg;
  note.hidden = false;
  window.setTimeout(function () { note.hidden = true; }, 2500);
}

/* ---- derived helpers ---------------------------------------------- */
var PRIO_CYCLE = ['none', 'low', 'medium', 'high'];
var PRIO_RANK = { high: 0, medium: 1, low: 2, none: 3 };

function todayISO() {
  var d = new Date(); d.setHours(0, 0, 0, 0);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function dueInfo(iso) {
  if (!iso) return null;
  var d = new Date(iso + 'T00:00:00');
  var base = new Date(); base.setHours(0, 0, 0, 0);
  var days = Math.round((d - base) / 86400000);
  var text;
  if (days === 0) text = 'Today';
  else if (days === 1) text = 'Tomorrow';
  else if (days === -1) text = 'Yesterday';
  else if (days > 1 && days < 7) text = d.toLocaleDateString(undefined, { weekday: 'short' });
  else text = d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  var tone = days < 0 ? 'over' : (days <= 1 ? 'soon' : '');
  return { text: text, tone: tone };
}

function sortTodo(a, b) {
  var t = todayISO();
  var ao = a.due && a.due < t, bo = b.due && b.due < t;
  if (ao !== bo) return ao ? -1 : 1;
  var ad = a.due || '9999-12-31', bd = b.due || '9999-12-31';
  if (ad !== bd) return ad < bd ? -1 : 1;
  if (PRIO_RANK[a.priority] !== PRIO_RANK[b.priority]) return PRIO_RANK[a.priority] - PRIO_RANK[b.priority];
  return a.created_at < b.created_at ? -1 : 1;
}

/* ---- rendering --------------------------------------------------- */
var CHECK_SVG = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true">' +
  '<path d="M2.7 6.3 4.9 8.6 9.4 3.4" stroke="#F4F1E7" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function makeRow(t) {
  var li = document.createElement('li');
  li.className = 'row' + (t.done ? ' done' : '');
  li.setAttribute('data-id', String(t.id));

  var check = document.createElement('button');
  check.type = 'button';
  check.className = 'check';
  check.setAttribute('aria-pressed', String(t.done));
  check.setAttribute('aria-label', (t.done ? 'Mark not done: ' : 'Complete: ') + t.title);
  check.innerHTML = CHECK_SVG;
  check.addEventListener('click', function () { toggleTask(t.id); });
  li.appendChild(check);

  var body = document.createElement('div');
  body.className = 'body';
  var title = document.createElement('span');
  title.className = 'title';
  title.textContent = t.title;
  body.appendChild(title);

  if (!t.done) {
    var meta = document.createElement('div');
    meta.className = 'meta';
    var prio = document.createElement('button');
    prio.type = 'button';
    prio.className = 'prio';
    prio.setAttribute('data-p', t.priority);
    prio.setAttribute('aria-label', 'Priority: ' + t.priority + '. Tap to change.');
    prio.innerHTML = '<span class="prio-dot"></span><span class="prio-label">' +
      (t.priority === 'none' ? 'Priority' : cap(t.priority)) + '</span>';
    prio.addEventListener('click', function () { cyclePriority(t.id); });
    meta.appendChild(prio);
    body.appendChild(meta);
  }
  li.appendChild(body);

  if (!t.done) {
    var info = dueInfo(t.due);
    var wrap = document.createElement('span');
    wrap.className = 'due-wrap';
    var due = document.createElement('span');
    due.className = 'due ' + (info ? info.tone : 'empty');
    due.textContent = info ? info.text : 'Add date';
    var input = document.createElement('input');
    input.type = 'date';
    input.className = 'due-input';
    input.value = t.due || '';
    input.setAttribute('aria-label', 'Due date for ' + t.title);
    input.addEventListener('change', function () { updateTask(t.id, { due_date: input.value || null }); });
    wrap.addEventListener('click', function () {
      try { input.showPicker(); } catch (e) { input.focus(); }
    });
    wrap.appendChild(due);
    wrap.appendChild(input);
    li.appendChild(wrap);
  }
  return li;
}

var addingDraft = null;

function makeAddRow() {
  var li = document.createElement('li');
  li.className = 'row add';

  if (!addingDraft) {
    var check = document.createElement('span');
    check.className = 'check';
    var hint = document.createElement('span');
    hint.className = 'add-hint';
    hint.textContent = 'Add something for today';
    li.appendChild(check);
    li.appendChild(hint);
    li.setAttribute('role', 'button');
    li.setAttribute('tabindex', '0');
    li.setAttribute('aria-label', 'Add a task');
    var open = function () { addingDraft = { priority: 'none', due: null }; render(); focusAddInput(); };
    li.addEventListener('click', open);
    li.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
    return li;
  }

  var slot = document.createElement('span');
  slot.className = 'check';
  li.appendChild(slot);

  var form = document.createElement('form');
  form.className = 'add-form';

  var input = document.createElement('input');
  input.type = 'text';
  input.className = 'add-input';
  input.placeholder = 'What needs doing?';
  input.setAttribute('maxlength', '120');
  input.setAttribute('autocomplete', 'off');
  input.setAttribute('aria-label', 'New task');
  form.appendChild(input);

  var actions = document.createElement('div');
  actions.className = 'add-actions';

  var prio = document.createElement('button');
  prio.type = 'button';
  prio.className = 'prio';
  prio.setAttribute('data-p', addingDraft.priority);
  prio.setAttribute('aria-label', 'Set priority');
  prio.innerHTML = '<span class="prio-dot"></span><span class="prio-label">' +
    (addingDraft.priority === 'none' ? 'Priority' : cap(addingDraft.priority)) + '</span>';
  prio.addEventListener('click', function () {
    var next = PRIO_CYCLE[(PRIO_CYCLE.indexOf(addingDraft.priority) + 1) % PRIO_CYCLE.length];
    addingDraft.priority = next;
    prio.setAttribute('data-p', next);
    prio.querySelector('.prio-label').textContent = next === 'none' ? 'Priority' : cap(next);
  });

  var dateWrap = document.createElement('span');
  dateWrap.className = 'due-wrap';
  var dateText = document.createElement('span');
  dateText.className = 'due ' + (addingDraft.due ? '' : 'empty');
  dateText.textContent = addingDraft.due ? dueInfo(addingDraft.due).text : 'Add date';
  var dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.className = 'due-input';
  dateInput.value = addingDraft.due || '';
  dateInput.setAttribute('aria-label', 'Due date for new task');
  dateInput.addEventListener('change', function () {
    addingDraft.due = dateInput.value || null;
    dateText.textContent = addingDraft.due ? dueInfo(addingDraft.due).text : 'Add date';
    dateText.className = 'due ' + (addingDraft.due ? '' : 'empty');
  });
  dateWrap.addEventListener('click', function () {
    try { dateInput.showPicker(); } catch (e) { dateInput.focus(); }
  });
  dateWrap.appendChild(dateText);
  dateWrap.appendChild(dateInput);

  var go = document.createElement('button');
  go.type = 'submit';
  go.className = 'add-go';
  go.textContent = 'Add';

  var cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'add-cancel';
  cancel.textContent = 'Cancel';
  cancel.addEventListener('click', function () { addingDraft = null; render(); });

  actions.appendChild(prio);
  actions.appendChild(dateWrap);
  actions.appendChild(go);
  actions.appendChild(cancel);
  form.appendChild(actions);

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    var val = input.value.trim();
    if (!val) { input.focus(); return; }
    go.disabled = true;
    var draft = addingDraft;
    addingDraft = null;
    await addTask(val, draft.priority, draft.due);
  });
  form.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { addingDraft = null; render(); }
  });

  li.appendChild(form);
  return li;
}

function focusAddInput() {
  var el = $('.add-input');
  if (el) el.focus();
}

function render() {
  var todo = tasks.filter(function (t) { return !t.done; }).slice().sort(sortTodo);
  var done = tasks.filter(function (t) { return t.done; }).slice().sort(function (a, b) {
    return a.created_at < b.created_at ? 1 : -1;
  });

  var total = tasks.length;
  var complete = done.length;

  var beads = $('#beads');
  beads.innerHTML = '';
  if (total <= 14) {
    for (var i = 0; i < total; i++) {
      var b = document.createElement('span');
      b.className = 'bead' + (i < complete ? ' on' : '');
      beads.appendChild(b);
    }
  }
  $('#count').textContent = total === 0 ? 'Nothing yet' : (complete + ' of ' + total + ' done');
  var pr = $('#progress');
  pr.setAttribute('aria-valuenow', String(complete));
  pr.setAttribute('aria-valuemax', String(total));

  var todoList = $('#todo');
  todoList.innerHTML = '';
  todo.forEach(function (t) { todoList.appendChild(makeRow(t)); });
  todoList.appendChild(makeAddRow());

  var doneSection = $('#doneSection');
  var doneList = $('#done');
  doneList.innerHTML = '';
  if (done.length) {
    doneSection.hidden = false;
    done.forEach(function (t) { doneList.appendChild(makeRow(t)); });
  } else {
    doneSection.hidden = true;
  }
}

/* ---- task actions ----------------------------------------------- */
function findTask(id) {
  for (var i = 0; i < tasks.length; i++) { if (tasks[i].id === id) return tasks[i]; }
  return null;
}

function toggleTask(id) {
  var t = findTask(id);
  if (!t) return;
  var row = $('.row[data-id="' + id + '"]');
  if (row && !reduceMotion) {
    row.classList.toggle('done', !t.done);   // instant feedback; loadTasks settles it
  }
  updateTask(id, { done: !t.done });
}

function cyclePriority(id) {
  var t = findTask(id);
  if (!t) return;
  var next = PRIO_CYCLE[(PRIO_CYCLE.indexOf(t.priority) + 1) % PRIO_CYCLE.length];
  updateTask(id, { priority: next });
}

/* ==================================================================
   BREATHING SESSION  (in-memory only — not task data)
   ================================================================== */
var PATTERN = [
  { name: 'Breathe in',  scale: 1,    ms: 4000 },
  { name: 'Breathe out', scale: 0.58, ms: 6000 },
  { name: 'Rest',        scale: 0.58, ms: 2000 }
];
var selectedMinutes = 1;
var session = null;

function fmtClock(s) {
  return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
}

function startBreathing(minutes) {
  if (session) return;
  var pause = $('#pause');
  var orb = $('#orb');
  var total = minutes * 60;
  session = { left: total, phase: 0, clock: null, phaseTimer: null, lastFocus: document.activeElement };

  $('#pauseDur').textContent = minutes + (minutes === 1 ? ' minute' : ' minutes');
  $('#pausePhase').textContent = PATTERN[0].name;
  $('#pauseTime').textContent = fmtClock(total);

  orb.style.transition = 'none';
  orb.style.transform = 'scale(0.58)';
  void orb.offsetWidth;

  pause.hidden = false;
  document.body.style.overflow = 'hidden';
  window.requestAnimationFrame(function () { pause.classList.add('show'); });
  $('#pauseEnd').focus();

  stepPhase();
  session.clock = window.setInterval(function () {
    session.left -= 1;
    $('#pauseTime').textContent = fmtClock(Math.max(0, session.left));
    if (session.left <= 0) endSession(true);
  }, 1000);
}

function stepPhase() {
  if (!session) return;
  var orb = $('#orb');
  var p = PATTERN[session.phase % PATTERN.length];
  $('#pausePhase').textContent = p.name;
  orb.style.transition = 'transform ' + (reduceMotion ? 600 : p.ms) + 'ms ease-in-out';
  orb.style.transform = 'scale(' + p.scale + ')';
  session.phase += 1;
  session.phaseTimer = window.setTimeout(stepPhase, p.ms);
}

function endSession(completed) {
  if (!session) return;
  window.clearInterval(session.clock);
  window.clearTimeout(session.phaseTimer);
  var back = session.lastFocus;

  if (completed && !reduceMotion) {
    $('#pausePhase').textContent = 'Ease back in';
    $('#pauseTime').textContent = '0:00';
    var orb = $('#orb');
    orb.style.transition = 'transform 1200ms ease';
    orb.style.transform = 'scale(0.8)';
    window.setTimeout(function () { closePause(back); }, 1500);
  } else {
    closePause(back);
  }
  session = null;
}

function closePause(back) {
  var pause = $('#pause');
  pause.classList.remove('show');
  document.body.style.overflow = '';
  window.setTimeout(function () { pause.hidden = true; }, 560);
  if (back && typeof back.focus === 'function') back.focus();
}

var durs = document.querySelectorAll('.dur');
durs.forEach(function (btn) {
  btn.addEventListener('click', function () {
    selectedMinutes = Number(btn.getAttribute('data-min'));
    durs.forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
  });
});

function begin() { startBreathing(selectedMinutes); }
$('#begin').addEventListener('click', begin);
var bandRing = $('#bandRing');
bandRing.addEventListener('click', begin);
bandRing.addEventListener('keydown', function (e) {
  if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); begin(); }
});
$('#pauseEnd').addEventListener('click', function () { endSession(false); });
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && session) endSession(false);
});

/* ==================================================================
   INIT
   ================================================================== */
$('#dateLine').textContent = new Date()
  .toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })
  .replace(',', ' ·');
setAuthMode('signin');

supabase.auth.getSession().then(function (res) {
  route(res.data.session);
});
