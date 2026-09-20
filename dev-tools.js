/* ============================================================================
   NEXUS CLASH — DEVELOPER TOOLS  (dev branch only)
   ----------------------------------------------------------------------------
   Gold, unlocking cards, forcing locations and other testing shortcuts.

   TO TURN ON  — add this one line to index.html, just before </body>:
       <script src="dev-tools.js"></script>

   TO TURN OFF — delete that line (or just don't copy this file into main).
   index.html itself never needs to change, so main and dev stay identical
   apart from that single line.

   Everything here only touches your own saved progress in this browser.
   ========================================================================== */
(function () {
  'use strict';

  if (typeof SAVE === 'undefined' || typeof openModal !== 'function') {
    console.error('[dev-tools] Load this AFTER the game: put the <script src="dev-tools.js"></script> line just before </body>.');
    return;
  }

  /* ---------- its own saved settings (never touches the game's save) ---------- */
  var KEY = 'nexus_clash_devtools';
  var CFG = { locs: ['', '', ''], aiDeck: '', energy: 0, seeAI: false };
  try { Object.assign(CFG, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) {}
  function saveCfg() { try { localStorage.setItem(KEY, JSON.stringify(CFG)); } catch (e) {} }
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]; }); };
  var owned = function () { return Object.keys(SAVE.owned).filter(function (k) { return SAVE.owned[k] > 0 && DEF[k]; }).length; };

  /* ---------- styles + the floating button ---------- */
  var css = document.createElement('style');
  css.textContent = [
    '#devbtn{position:fixed;z-index:940;right:0;top:38%;width:38px;height:44px;display:grid;place-items:center;font-size:18px;',
    ' border:2.5px solid var(--outline);border-right:0;border-radius:12px 0 0 12px;background:var(--yellow);color:#14142b;box-shadow:-3px 3px 0 rgba(0,0,0,.35);cursor:pointer}',
    '#devbtn:active{transform:translateX(3px)}',
    '#devbtn.inmatch{background:var(--good);color:#fff}',
    '.dev-note{font-size:12.5px;color:var(--muted);margin:4px 0 0;line-height:1.45}',
    '.dev-row{display:flex;align-items:center;gap:8px;padding:5px 0;border-bottom:1px dashed var(--line);flex-wrap:wrap}',
    '.dev-row>span{font-size:13px;font-weight:700;min-width:70px}',
    '.dev-btns{display:flex;flex:1;flex-wrap:wrap;gap:6px;justify-content:flex-end}',
    '.dev-sel{border:2px solid var(--outline);border-radius:9px;background:var(--panel-2);color:var(--ink);font:600 13px var(--ui);padding:4px 6px;max-width:118px}',
    '.dev-peek{display:block;font-size:10px;font-weight:700;color:var(--yellow);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.dev-pick .cc{cursor:pointer}'
  ].join('');
  document.head.appendChild(css);

  var btn = document.createElement('button');
  btn.id = 'devbtn'; btn.textContent = '🛠'; btn.title = 'Developer tools'; btn.setAttribute('aria-label', 'Developer tools');
  btn.addEventListener('click', function () { panel(); });
  document.body.appendChild(btn);
  setInterval(function () { btn.classList.toggle('inmatch', !!(typeof M !== 'undefined' && M && !M.s.over)); }, 600);

  function row(label, html) { return '<div class="dev-row"><span>' + label + '</span><div class="dev-btns">' + html + '</div></div>'; }
  function b(attr, label) { return '<button class="btn xs" ' + attr + '>' + label + '</button>'; }

  /* ---------- main panel ---------- */
  function panel() {
    var inMatch = typeof M !== 'undefined' && M && !M.s.over;
    var locOpts = function (i) {
      return '<select class="dev-sel" data-loc="' + i + '">' + [''].concat(LOCATION_DEFS.map(function (l) { return l.id; })).map(function (id) {
        return '<option value="' + id + '"' + (CFG.locs[i] === id ? ' selected' : '') + '>' + (id ? esc(LDEF[id].name) : 'Random') + '</option>';
      }).join('') + '</select>';
    };
    var bundles = (typeof VALID_BUNDLES !== 'undefined' ? VALID_BUNDLES : []);
    openModal(
      '<h2>🛠 Developer tools</h2>' +
      '<p class="dev-note">Testing shortcuts. They only change your own save in this browser.</p>' +
      (inMatch ? '<button class="btn block" id="dv-match" style="margin-top:10px;background:var(--good);color:#fff">⚔️ Match tools (you\u2019re in a match)</button>' : '') +
      '<div class="sheet-label">Gold — you have <span data-bind="gold">0</span></div>' +
      row('Add', b('data-gold="500"', '+500') + b('data-gold="1000"', '+1,000') + b('data-gold="10000"', '+10,000') + b('data-gold="999999"', 'Max') + b('data-gold="0"', 'Set to 0')) +
      '<div class="sheet-label">Collection — ' + owned() + ' of ' + COLLECTIBLE.length + '</div>' +
      row('Cards', b('id="dv-unlock"', 'Unlock every card') + b('id="dv-give"', 'Give one card…') + b('id="dv-relock"', 'Back to starter set')) +
      '<div class="sheet-label">Rank — ' + (Math.floor(SAVE.rank / 10) + 1) + ' (' + SAVE.rank + ' cubes)</div>' +
      row('Cubes', b('data-rank="-10"', '−10') + b('data-rank="10"', '+10') + b('data-rank="100"', '+100') + b('data-rank="reset"', 'Reset')) +
      '<div class="sheet-label">Shortcuts</div>' +
      row('Daily', b('id="dv-gift"', 'Make the gift claimable again')) +
      row('Shop', b('id="dv-shop"', 'New daily cards, free')) +
      '<div class="sheet-label">Next match</div>' +
      '<div class="dev-row"><span>Locations</span><div class="dev-btns">' + locOpts(0) + locOpts(1) + locOpts(2) + '</div></div>' +
      '<div class="dev-row"><span>Opponent</span><div class="dev-btns"><select class="dev-sel" id="dv-ai"><option value="">Random</option>' +
        '<option value="starter"' + (CFG.aiDeck === 'starter' ? ' selected' : '') + '>Starter Squad</option>' +
        bundles.map(function (x) { return '<option value="' + x.id + '"' + (CFG.aiDeck === x.id ? ' selected' : '') + '>' + esc(x.name) + '</option>'; }).join('') +
      '</select></div></div>' +
      '<div class="dev-row"><span>Bonus Energy for you, every turn</span><div class="dev-btns"><select class="dev-sel" id="dv-en">' +
        [0, 1, 3, 6].map(function (n) { return '<option value="' + n + '"' + (+CFG.energy === n ? ' selected' : '') + '>' + (n ? '+' + n : 'None') + '</option>'; }).join('') +
      '</select></div></div>' +
      '<label class="toggle"><input type="checkbox" id="dv-seeai" ' + (CFG.seeAI ? 'checked' : '') + '> Show the opponent\u2019s hand during matches</label>' +
      '<button class="btn block" data-close style="margin-top:12px">Done</button>',
      function (box) {
        var reopen = function () { closeModal(); setTimeout(panel, 60); };
        if (inMatch) box.querySelector('#dv-match').onclick = function () { closeModal(); setTimeout(matchPanel, 60); };
        box.addEventListener('click', function (e) {
          var g = e.target.closest('[data-gold]'), r = e.target.closest('[data-rank]');
          if (g) {
            var v = +g.dataset.gold;
            SAVE.gold = v === 0 ? 0 : SAVE.gold + v;
            persist(); refreshBinds(); renderShop();
            toast(v === 0 ? 'Gold set to 0' : '+' + v.toLocaleString() + ' gold');
          } else if (r) {
            SAVE.rank = r.dataset.rank === 'reset' ? 0 : Math.max(0, SAVE.rank + +r.dataset.rank);
            persist(); renderHome(); reopen();
          }
        });
        box.querySelector('#dv-unlock').onclick = function () {
          COLLECTIBLE.forEach(function (d) { SAVE.owned[d.id] = Math.max(1, SAVE.owned[d.id] || 0); });
          persist(); renderDecks(); renderShop(); reopen(); toast('Every card unlocked');
        };
        box.querySelector('#dv-relock').onclick = function () {
          SAVE.owned = {};
          STARTER_OWNED.concat(STARTER_LIST).forEach(function (id) { SAVE.owned[id] = 1; });
          SAVE.decks.forEach(function (d) { d.cards = d.cards.filter(function (id) { return SAVE.owned[id]; }); });
          persist(); renderDecks(); renderHome(); reopen(); toast('Back to the starter collection');
        };
        box.querySelector('#dv-give').onclick = function () {
          closeModal();
          setTimeout(function () {
            pickCard('Give yourself a card', function (id) {
              SAVE.owned[id] = (SAVE.owned[id] || 0) + 1;
              persist(); renderDecks(); toast(DEF[id].name + ' added');
              setTimeout(panel, 60);
            });
          }, 60);
        };
        box.querySelector('#dv-gift').onclick = function () { SAVE.lastGift = ''; persist(); renderHome(); toast('Daily gift is waiting again'); };
        box.querySelector('#dv-shop').onclick = function () { SAVE.featured = { day: '', ids: [] }; ensureFeatured(); persist(); renderShop(); toast('Shop picks refreshed'); };
        box.addEventListener('change', function (e) {
          var t = e.target;
          if (t.dataset.loc != null) CFG.locs[+t.dataset.loc] = t.value;
          else if (t.id === 'dv-ai') CFG.aiDeck = t.value;
          else if (t.id === 'dv-en') CFG.energy = +t.value;
          else if (t.id === 'dv-seeai') { CFG.seeAI = t.checked; if (typeof M !== 'undefined' && M) updateHud(); }
          saveCfg();
        });
      }
    );
  }

  /* ---------- card picker ---------- */
  function pickCard(title, cb) {
    openModal('<h2>' + esc(title) + '</h2><div class="coll-grid dev-pick" id="dv-pick" style="max-height:52dvh;overflow-y:auto"></div><button class="btn block" data-close style="margin-top:10px">Cancel</button>',
      function (box) {
        var g = box.querySelector('#dv-pick');
        CARD_DEFS.map(function (d) { return d.id; })
          .sort(function (a, c) { return DEF[a].cost - DEF[c].cost || DEF[a].name.localeCompare(DEF[c].name); })
          .forEach(function (id) {
            var w = el('div', 'cc');
            w.appendChild(buildCardEl(id));
            w.onclick = function () { closeModal(); cb(id); };
            g.appendChild(w);
          });
      });
  }

  /* ---------- in-match tools ---------- */
  function matchPanel() {
    if (typeof M === 'undefined' || !M) return;
    var s = M.s, ai = s.players[1];
    var hidden = ai.staged.filter(function (st) { return !st.inserted; })
      .map(function (st) { return DEF[st.card.id].name + ' → ' + LDEF[s.locs[st.li].id].name; });
    openModal(
      '<h2>⚔️ Match tools</h2>' +
      '<div class="sheet-label">Opponent</div>' +
      '<p class="dev-note">Hand: ' + (ai.hand.length ? ai.hand.map(function (c) { return esc(DEF[c.id].name) + ' (' + DEF[c.id].cost + ')'; }).join(', ') : 'empty') + '<br>' +
      'Energy: ' + ai.energy + (ai.energyNextFrom && ai.energyNextFrom.length ? ' · next turn +' + ai.energyNextFrom.reduce(function (a, x) { return a + x.n; }, 0) : '') + '<br>' +
      'Playing this turn: ' + (hidden.length ? hidden.join(', ') : 'nothing yet') + '</p>' +
      '<div class="sheet-label">You</div>' +
      row('Energy', b('data-den="3"', '+3') + b('data-den="10"', '+10')) +
      row('Hand', b('id="dv-add"', 'Add any card…') + b('id="dv-draw"', 'Draw')) +
      row('Board', b('id="dv-locs"', 'Reveal all locations')) +
      '<button class="btn block" data-close style="margin-top:12px">Close</button>',
      function (box) {
        box.addEventListener('click', function (e) {
          var en = e.target.closest('[data-den]');
          if (!en) return;
          var p = s.players[0];
          p.energy += +en.dataset.den;
          if (p.energyFrom) p.energyFrom.push({ label: 'Dev tools', n: +en.dataset.den });
          updateHud(); toast('+' + en.dataset.den + ' Energy');
        });
        box.querySelector('#dv-add').onclick = function () {
          closeModal();
          setTimeout(function () {
            pickCard('Add a card to your hand', function (id) {
              if (s.players[0].hand.length >= HAND_MAX) return toast('Your hand is full');
              s.players[0].hand.push(newCard(id, 0));
              mRender(); updateHud();
            });
          }, 60);
        };
        box.querySelector('#dv-draw').onclick = function () { draw(s, 0, 1, []); mRender(); updateHud(); closeModal(); };
        box.querySelector('#dv-locs').onclick = function () { s.locs.forEach(function (L) { L.revealed = true; }); mRender(); closeModal(); toast('All locations revealed'); };
      }
    );
  }

  /* ---------- hooks into the game (no edits to index.html needed) ---------- */
  var _newMatch = newMatch;
  newMatch = function (pDeck, aDeck) {
    var s = _newMatch(pDeck, aDeck);
    CFG.locs.forEach(function (id, i) { if (id && LDEF[id]) s.locs[i].id = id; });
    return s;
  };

  var _pickAiDeck = pickAiDeck;
  pickAiDeck = function () {
    if (CFG.aiDeck === 'starter') return { name: 'Starter Squad', cards: STARTER_LIST };
    if (CFG.aiDeck) {
      var bd = (typeof VALID_BUNDLES !== 'undefined' ? VALID_BUNDLES : []).find(function (x) { return x.id === CFG.aiDeck; });
      if (bd) return { name: bd.name, cards: bd.cards };
    }
    return _pickAiDeck();
  };

  var _startTurn = startTurn;   // only the real turn start; the AI's planning copies don't go through here
  startTurn = function (s, ev) {
    _startTurn(s, ev);
    if (CFG.energy) {
      var p = s.players[0];
      p.energy += CFG.energy;
      if (p.energyFrom) p.energyFrom.push({ label: 'Dev tools', n: CFG.energy });
    }
  };

  var _updateHud = updateHud;
  updateHud = function () {
    _updateHud();
    try {
      var host = document.querySelector('#opp-name');
      if (!host) return;
      var peek = document.querySelector('#dev-peek');
      if (!peek) {
        peek = document.createElement('small');
        peek.id = 'dev-peek'; peek.className = 'dev-peek';
        host.parentNode.appendChild(peek);
      }
      var show = CFG.seeAI && typeof M !== 'undefined' && M;
      peek.hidden = !show;
      if (show) {
        peek.textContent = '🛠 ' + (M.s.players[1].hand.map(function (c) { return DEF[c.id].name + ' ' + DEF[c.id].cost + '⚡'; }).join(' · ') || 'hand empty');
      }
    } catch (e) {}
  };

  console.log('[dev-tools] loaded. Tap the 🛠 button on the right edge.');
})();
