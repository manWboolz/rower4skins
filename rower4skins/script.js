// Rower4Skins — symulator otwierania skrzynek (tylko wirtualne monety).

// ---------- Dane ----------

const RARITY = {
    consumer: '#b0c3d9',
    industrial: '#5e98d9',
    milspec: '#4b69ff',
    restricted: '#8847ff',
    classified: '#d32ce6',
    covert: '#eb4b4b',
    gold: '#e4ae39',
};

// [id, broń, nazwa, typ, rzadkość, cena]
const SKINS = [
    ['p1', 'Glock-18', 'Dętka', 'pistol', 'consumer', 0.08],
    ['s1', 'MP9', 'Błotnik', 'smg', 'consumer', 0.10],
    ['r1', 'Galil AR', 'Rdza', 'rifle', 'consumer', 0.12],
    ['a1', 'SSG 08', 'Pedał', 'sniper', 'industrial', 0.30],
    ['p2', 'USP-S', 'Szprycha', 'pistol', 'industrial', 0.35],
    ['r2', 'FAMAS', 'Kask', 'rifle', 'industrial', 0.40],
    ['s2', 'MAC-10', 'Neonowy Dzwonek', 'smg', 'milspec', 0.90],
    ['r3', 'M4A4', 'Asfalt', 'rifle', 'milspec', 1.20],
    ['p3', 'Desert Eagle', 'Kaseta', 'pistol', 'restricted', 4.20],
    ['r4', 'AK-47', 'Łańcuch', 'rifle', 'restricted', 6.50],
    ['a2', 'AWP', 'Szosa', 'sniper', 'restricted', 7.80],
    ['s3', 'P90', 'Tour de Pologne', 'smg', 'classified', 9.50],
    ['r5', 'M4A1-S', 'Peleton', 'rifle', 'classified', 18.00],
    ['p4', 'Desert Eagle', 'Złota Przerzutka', 'pistol', 'covert', 38.00],
    ['r6', 'AK-47', 'Ognista Opona', 'rifle', 'covert', 65.00],
    ['a3', 'AWP', 'Smok z Karbonu', 'sniper', 'covert', 140.00],
    ['k3', '★ Bagnet', 'Stal Rowerowa', 'knife', 'gold', 180.00],
    ['g1', '★ Rękawice', 'Żółta Koszulka', 'gloves', 'gold', 260.00],
    ['k1', '★ Nóż Motylkowy', 'Fade', 'knife', 'gold', 320.00],
    ['k2', '★ Karambit', 'Tęcza Szprych', 'knife', 'gold', 540.00],
].map(([id, weapon, name, type, rarity, price]) => ({ id, weapon, name, type, rarity, price }));

const SKIN = Object.fromEntries(SKINS.map(s => [s.id, s]));

// Wagi dobrane tak, żeby średni drop był wart ok. 90% ceny skrzynki.
const CASES = [
    { id: 'starter', name: 'Rower Startowy', price: 0.22, color: '#5e98d9',
        items: [['p1', 30], ['s1', 26], ['r1', 22], ['a1', 8], ['p2', 6], ['r2', 4], ['s2', 2.2], ['r3', 1.2], ['p3', 0.5], ['r4', 0.1]] },
    { id: 'szosa', name: 'Szosówka', price: 2.49, color: '#4b69ff', badge: 'new',
        items: [['r2', 30], ['s2', 25], ['r3', 20], ['p3', 12], ['r4', 6], ['a2', 4], ['s3', 2], ['r5', 0.8], ['p4', 0.2]] },
    { id: 'mtb', name: 'Góral MTB', price: 6.29, color: '#8847ff',
        items: [['r3', 30], ['p3', 26], ['r4', 20], ['a2', 12], ['s3', 7], ['r5', 3.5], ['p4', 1], ['r6', 0.4]] },
    { id: 'tandem', name: 'Tandem 50/50', price: 8.99, color: '#2ecc71', badge: 'hot',
        items: [['s1', 50], ['p1', 38], ['r5', 5], ['r6', 4], ['a3', 2], ['k3', 1]] },
    { id: 'bmx', name: 'BMX Street', price: 12.49, color: '#d32ce6',
        items: [['p3', 26], ['r4', 24], ['a2', 20], ['s3', 14], ['r5', 9], ['p4', 4], ['r6', 2], ['k3', 0.6]] },
    { id: 'pro', name: 'Kolarzówka Pro', price: 46.99, color: '#eb4b4b',
        items: [['s3', 28], ['r5', 26], ['p4', 20], ['r6', 14], ['a3', 6], ['k3', 3], ['g1', 1.4]] },
    { id: 'gold', name: 'Złoty Rower', price: 94.99, color: '#e4ae39', badge: 'hot',
        items: [['r5', 30], ['p4', 22], ['r6', 18], ['a3', 13], ['k3', 8], ['g1', 5], ['k1', 3], ['k2', 1]] },
];

const CASE = Object.fromEntries(CASES.map(c => [c.id, c]));

const BIKES = [
    ['Składak Wigry', 5], ['Ukraina z piwnicy', 8], ['Romet Jubilat', 12],
    ['Góral z Biedronki', 15], ['BMX sąsiada', 20], ['Szosówka Kross', 35], ['Carbonowa kolarzówka', 60],
];

const BOT_NAMES = ['kolarz_91', 'szprycha', 'MTB_Kuba', 'pedalarz', 'dętka_pl', 'Wigry3', 'turbo_romet', 'łańcuch', 'bmx_ola', 'peleton'];

// ---------- Stan ----------

const STORE_KEY = 'r4s_v2';
const defaultState = () => ({ balance: 25, inv: [], stats: { opened: 0, battles: 0, best: 0 } });

let state = load();

function load() {
    try {
        const raw = localStorage.getItem(STORE_KEY);
        if (raw) return { ...defaultState(), ...JSON.parse(raw) };
    } catch (e) { /* brak dostępu do localStorage */ }
    return defaultState();
}

function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* ignoruj */ }
}

let uidSeq = Date.now();
const newUid = () => (uidSeq++).toString(36);

const round2 = n => Math.round(n * 100) / 100;
const fmt = n => n.toFixed(2);

function addBalance(delta) {
    state.balance = round2(state.balance + delta);
    save();
    renderBalance();
}

function addItems(ids) {
    for (const id of ids) {
        state.inv.unshift({ uid: newUid(), id });
        state.stats.best = Math.max(state.stats.best, SKIN[id].price);
    }
    save();
}

function removeItems(uids) {
    const set = new Set(uids);
    state.inv = state.inv.filter(i => !set.has(i.uid));
    save();
}

// ---------- Losowanie ----------

function roll(c) {
    const total = c.items.reduce((s, [, w]) => s + w, 0);
    let r = Math.random() * total;
    for (const [id, w] of c.items) {
        r -= w;
        if (r < 0) return id;
    }
    return c.items[c.items.length - 1][0];
}

function chance(c, id) {
    const total = c.items.reduce((s, [, w]) => s + w, 0);
    return c.items.find(([i]) => i === id)[1] / total * 100;
}

// ---------- Grafika ----------

const ICONS = {
    rifle: '<path d="M4 22h54l5-4h13v5h20v5H74l-4 3H52l-5 11h-9l3-11H24l-6 8H8l4-9H4z"/>',
    sniper: '<path d="M2 23h58l4-4h10v4h24v4H72l-6 3H50l-5 11h-8l3-11H22l-6 8H6l4-8H2z"/><path d="M36 14h24v6H36z"/>',
    pistol: '<path d="M22 14h56v9H58l-4 4h-6l-3 15H32l4-18H22z"/>',
    smg: '<path d="M10 18h62v7H60v6h-6l-3 11h-8l3-11H32l-4 6h-8l4-8H10z"/>',
    knife: '<path d="M42 22 94 10q-6 16-34 20H42z"/><path d="M42 20h-6L8 32l4 8 28-9h2z"/>',
    gloves: '<path d="M22 12h8v14l2-16h8l-1 16 3-14h7l-3 16 5-9 6 3-9 18H24z"/><path d="M58 20h8v12l2-14h8l-1 14 3-12h7l-3 14 4-6 6 3-8 16H60z" opacity=".75"/>',
};

function icon(skin) {
    const c = RARITY[skin.rarity];
    return `<svg viewBox="0 0 100 50"><g fill="${c}" stroke="rgba(0,0,0,.45)" stroke-width="1.2" stroke-linejoin="round">${ICONS[skin.type]}</g></svg>`;
}

function crate(color) {
    return `<svg class="crate" viewBox="0 0 130 100">
        <path d="M15 35 65 15l50 20-50 20z" fill="${color}"/>
        <path d="M15 35l50 20v40L15 80z" fill="${color}" opacity=".55"/>
        <path d="M65 55l50-20v45L65 95z" fill="${color}" opacity=".8"/>
        <path d="M15 35l50 20 50-20M65 55v40" stroke="rgba(0,0,0,.35)" stroke-width="2" fill="none"/>
        <path d="M38 45v40M92 45v40" stroke="rgba(0,0,0,.3)" stroke-width="5"/>
        <g transform="translate(73 52) scale(.5)" fill="none" stroke="rgba(0,0,0,.45)" stroke-width="5" stroke-linecap="round">
            <circle cx="16" cy="42" r="11"/><circle cx="48" cy="42" r="11"/><path d="M16 42 26 22h18l4 20M26 22l10 20h12"/>
        </g>
    </svg>`;
}

function itemHtml(skin, extra = '', attrs = '') {
    return `<div class="item" style="--rc:${RARITY[skin.rarity]}" ${attrs}>
        ${extra}${icon(skin)}
        <div class="w">${skin.weapon}</div>
        <div class="n">${skin.name}</div>
        <div class="p"><span class="coin sm"></span>${fmt(skin.price)}</div>
    </div>`;
}

const $ = sel => document.querySelector(sel);

function toast(msg, kind = '') {
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 3200);
}

// ---------- Ruletka ----------

const STRIP_LEN = 60;
const WIN_INDEX = 52;

function fillStrip(roulette, c, winnerId) {
    const ids = Array.from({ length: STRIP_LEN }, () => roll(c));
    if (winnerId) ids[WIN_INDEX] = winnerId;
    roulette.innerHTML = `<div class="marker"></div><div class="strip">${ids.map(id => itemHtml(SKIN[id])).join('')}</div>`;
    return roulette.querySelector('.strip');
}

function idleStrip(roulette, c) {
    const strip = fillStrip(roulette, c);
    const w = strip.children[0].offsetWidth + 6;
    strip.style.transform = `translateX(${-(10 * w) + roulette.clientWidth / 2 - w / 2}px)`;
}

function spin(roulette, c, winnerId, duration) {
    const strip = fillStrip(roulette, c, winnerId);
    const w = strip.children[0].offsetWidth + 6;
    const start = -(10 * w) + roulette.clientWidth / 2 - w / 2;
    strip.style.transition = 'none';
    strip.style.transform = `translateX(${start}px)`;
    strip.getBoundingClientRect(); // wymuś reflow przed animacją

    const jitter = (Math.random() - 0.5) * (w - 24);
    const target = -(WIN_INDEX * w) + roulette.clientWidth / 2 - (w - 6) / 2 + jitter;
    strip.style.transition = `transform ${duration}ms cubic-bezier(.12,.8,.2,1)`;
    strip.style.transform = `translateX(${target}px)`;

    return new Promise(resolve => setTimeout(() => {
        strip.children[WIN_INDEX].style.outline = `2px solid ${RARITY[SKIN[winnerId].rarity]}`;
        resolve();
    }, duration + 80));
}

// ---------- Live drops ----------

function pushDrop(id, user, mine = false) {
    const skin = SKIN[id];
    const el = document.createElement('div');
    el.className = `drop${mine ? ' mine' : ''}`;
    el.style.setProperty('--rc', RARITY[skin.rarity]);
    el.title = `${skin.weapon} | ${skin.name} — ${fmt(skin.price)}`;
    el.innerHTML = `${icon(skin)}<div class="drop-name">${skin.name}</div><div class="drop-user">${user}</div>`;
    const track = $('#liveTrack');
    track.prepend(el);
    while (track.children.length > 30) track.lastChild.remove();
}

function botDropLoop() {
    const c = CASES[Math.floor(Math.random() * CASES.length)];
    pushDrop(roll(c), BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
    setTimeout(botDropLoop, 1500 + Math.random() * 3500);
}

// ---------- Nagłówek i strona główna ----------

function renderBalance() {
    $('#balance').textContent = fmt(state.balance);
    $('#statOpened').textContent = state.stats.opened;
    $('#statBattles').textContent = state.stats.battles;
    $('#statBest').textContent = fmt(state.stats.best);
}

function renderHome() {
    $('#casesGrid').innerHTML = CASES.map(c => `
        <a class="case-card" href="#/case/${c.id}" style="--cc:${c.color}">
            ${c.badge ? `<span class="badge ${c.badge}">${c.badge}</span>` : ''}
            ${crate(c.color)}
            <h3>${c.name}</h3>
            <span class="price-tag"><span class="coin"></span>${fmt(c.price)}</span>
        </a>`).join('');
}

$('#depositBtn').addEventListener('click', () => {
    const [bike, value] = BIKES[Math.floor(Math.random() * BIKES.length)];
    addBalance(value);
    toast(`Wpłacono „${bike}” — +${fmt(value)} monet`, 'ok');
});

// ---------- Strona skrzynki ----------

let currentCase = null;
let qty = 1;
let fast = false;
let busy = false;

function renderCase(id) {
    currentCase = CASE[id];
    if (!currentCase) { location.hash = '#/'; return; }
    const c = currentCase;
    $('#caseHead').innerHTML = `${crate(c.color)}<h2>${c.name}</h2>`;
    if (!busy) renderRolls();
    const sorted = [...c.items].sort((a, b) => SKIN[b[0]].price - SKIN[a[0]].price);
    $('#contents').innerHTML = sorted.map(([sid]) =>
        itemHtml(SKIN[sid], `<span class="chance">${chance(c, sid).toFixed(2)}%</span>`)).join('');
    updateOpenBtn();
}

function renderRolls() {
    $('#rolls').innerHTML = Array.from({ length: qty }, () =>
        `<div class="roulette${qty > 1 ? ' small' : ''}"></div>`).join('');
    document.querySelectorAll('#rolls .roulette').forEach(r => idleStrip(r, currentCase));
}

function updateOpenBtn() {
    if (!currentCase) return;
    $('#openBtn').textContent = `Otwórz za ${fmt(currentCase.price * qty)}`;
    $('#openBtn').disabled = busy;
}

$('#qty').addEventListener('click', e => {
    const n = Number(e.target.dataset.n);
    if (!n || busy) return;
    qty = n;
    document.querySelectorAll('#qty button').forEach(b => b.classList.toggle('on', b === e.target));
    renderRolls();
    updateOpenBtn();
});

$('#fastBtn').addEventListener('click', () => {
    fast = !fast;
    $('#fastBtn').textContent = `Szybko: ${fast ? 'wł.' : 'wył.'}`;
});

$('#openBtn').addEventListener('click', async () => {
    const c = currentCase;
    const cost = round2(c.price * qty);
    if (state.balance < cost) { toast('Za mało monet — wpłać rower!', 'err'); return; }

    busy = true;
    updateOpenBtn();
    addBalance(-cost);
    const winners = Array.from({ length: qty }, () => roll(c));
    const roulettes = document.querySelectorAll('#rolls .roulette');
    await Promise.all(winners.map((id, i) => spin(roulettes[i], c, id, fast ? 1500 : 5500)));

    addItems(winners);
    state.stats.opened += qty;
    save();
    renderBalance();
    winners.forEach(id => pushDrop(id, 'Ty', true));
    const newUids = state.inv.slice(0, qty).map(i => i.uid);
    showWin('Twój drop!', winners, newUids);
    busy = false;
    updateOpenBtn();
});

// ---------- Okno wygranej ----------

let modalUids = [];

function showWin(title, ids, uids) {
    modalUids = uids;
    const total = ids.reduce((s, id) => s + SKIN[id].price, 0);
    $('#modalTitle').textContent = title;
    $('#modalItems').innerHTML = ids.map(id => itemHtml(SKIN[id])).join('');
    $('#modalSell').textContent = `Sprzedaj za ${fmt(total)}`;
    $('#modal').hidden = false;
}

$('#modalSell').addEventListener('click', () => {
    sell(modalUids);
    $('#modal').hidden = true;
});

$('#modalKeep').addEventListener('click', () => { $('#modal').hidden = true; });

function sell(uids) {
    const set = new Set(uids);
    const value = state.inv.filter(i => set.has(i.uid)).reduce((s, i) => s + SKIN[i.id].price, 0);
    removeItems(uids);
    addBalance(value);
    if (value > 0) toast(`Sprzedano za ${fmt(value)}`, 'ok');
    refreshCurrent();
}

// ---------- Bitwy ----------

let battleCase = CASES[0];
let battleRounds = 1;
let battling = false;

function renderBattles() {
    $('#battlePick').innerHTML = CASES.map(c => `
        <button class="pick${c === battleCase ? ' on' : ''}" data-id="${c.id}">
            ${crate(c.color)}${c.name}<br><span style="color:var(--accent)">${fmt(c.price)}</span>
        </button>`).join('');
    $('#battleCost').textContent = `Koszt: ${fmt(battleCase.price * battleRounds)}`;
    if (!battling) {
        $('#arena').innerHTML = [fighterHtml('you', '🚲', 'Ty'), fighterHtml('bot', '🤖', 'Bot')].join('');
        document.querySelectorAll('#arena .roulette').forEach(r => idleStrip(r, battleCase));
    }
}

function fighterHtml(key, avatar, name) {
    return `<div class="fighter" id="f-${key}">
        <div class="fighter-head">
            <span><span class="avatar">${avatar}</span>${name}</span>
            <span class="total"><span class="coin sm"></span><span class="sum">0.00</span></span>
        </div>
        <div class="roulette small"></div>
        <div class="fighter-drops"></div>
    </div>`;
}

$('#battlePick').addEventListener('click', e => {
    const b = e.target.closest('.pick');
    if (!b || battling) return;
    battleCase = CASE[b.dataset.id];
    renderBattles();
});

$('#battleRounds').addEventListener('click', e => {
    const n = Number(e.target.dataset.n);
    if (!n || battling) return;
    battleRounds = n;
    document.querySelectorAll('#battleRounds button').forEach(b => b.classList.toggle('on', b === e.target));
    renderBattles();
});

$('#battleBtn').addEventListener('click', async () => {
    const c = battleCase;
    const cost = round2(c.price * battleRounds);
    if (state.balance < cost) { toast('Za mało monet na bitwę!', 'err'); return; }

    battling = true;
    $('#battleBtn').disabled = true;
    $('#battleStatus').textContent = '';
    addBalance(-cost);
    $('#arena').innerHTML = [fighterHtml('you', '🚲', 'Ty'), fighterHtml('bot', '🤖', 'Bot')].join('');

    const sides = ['you', 'bot'].map(key => {
        const el = $(`#f-${key}`);
        return { el, roulette: el.querySelector('.roulette'), drops: el.querySelector('.fighter-drops'), sum: el.querySelector('.sum'), total: 0, ids: [] };
    });

    for (let r = 0; r < battleRounds; r++) {
        $('#battleStatus').textContent = `Runda ${r + 1} / ${battleRounds}`;
        const ids = sides.map(() => roll(c));
        await Promise.all(sides.map((s, i) => spin(s.roulette, c, ids[i], 3000)));
        sides.forEach((s, i) => {
            const skin = SKIN[ids[i]];
            s.ids.push(ids[i]);
            s.total = round2(s.total + skin.price);
            s.sum.textContent = fmt(s.total);
            s.drops.insertAdjacentHTML('beforeend', `<span class="mini" style="--rc:${RARITY[skin.rarity]}">${skin.name} · ${fmt(skin.price)}</span>`);
        });
        await new Promise(res => setTimeout(res, 500));
    }

    const [you, bot] = sides;
    const youWin = you.total >= bot.total;
    you.el.classList.add(youWin ? 'win' : 'lose');
    bot.el.classList.add(youWin ? 'lose' : 'win');
    state.stats.battles++;

    if (youWin) {
        const all = [...you.ids, ...bot.ids];
        addItems(all);
        all.forEach(id => pushDrop(id, 'Ty', true));
        $('#battleStatus').innerHTML = `<span style="color:var(--green)">Wygrałeś! Zgarniasz ${fmt(you.total + bot.total)}</span>`;
        showWin('Wygrana bitwa!', all, state.inv.slice(0, all.length).map(i => i.uid));
    } else {
        $('#battleStatus').innerHTML = `<span style="color:var(--red)">Przegrałeś — bot zabiera ${fmt(you.total + bot.total)}</span>`;
    }
    save();
    renderBalance();
    battling = false;
    $('#battleBtn').disabled = false;
});

// ---------- Upgrader ----------

let upFrom = null; // uid
let upTo = null;   // skin id
let needleAngle = 0;
let upgrading = false;

function upChance() {
    const from = state.inv.find(i => i.uid === upFrom);
    if (!from || !upTo) return 0;
    return Math.min(80, SKIN[from.id].price / SKIN[upTo].price * 95);
}

function renderUpgrader() {
    const from = state.inv.find(i => i.uid === upFrom);
    if (!from) upFrom = null;

    $('#upFrom').innerHTML = from ? itemHtml(SKIN[from.id]) : 'Wybierz skina z ekwipunku poniżej';
    $('#upTo').innerHTML = upTo ? itemHtml(SKIN[upTo]) : 'Wybierz cel poniżej';

    const pct = upChance();
    $('#wheel').style.setProperty('--pct', pct.toFixed(2));
    $('#upChance').textContent = `${pct.toFixed(2)}%`;
    $('#upBtn').disabled = upgrading || !from || !upTo;

    $('#upInv').innerHTML = state.inv.length
        ? state.inv.map(i => itemHtml(SKIN[i.id], '', `data-uid="${i.uid}"${i.uid === upFrom ? ' data-on' : ''}`)).join('')
        : '<div class="empty">Brak skinów — otwórz jakąś skrzynię.</div>';

    const minPrice = from ? SKIN[from.id].price * 1.2 : 0;
    const targets = from ? SKINS.filter(s => s.price >= minPrice) : [];
    if (upTo && !targets.some(s => s.id === upTo)) upTo = null;
    $('#upTargets').innerHTML = from
        ? (targets.length
            ? targets.map(s => itemHtml(s, '', `data-sid="${s.id}"${s.id === upTo ? ' data-on' : ''}`)).join('')
            : '<div class="empty">Ten skin jest już najlepszy — nie ma czego ulepszać.</div>')
        : '<div class="empty">Najpierw wybierz swój skin.</div>';

    document.querySelectorAll('#page-upgrader [data-on]').forEach(el => el.classList.add('on'));
}

$('#upInv').addEventListener('click', e => {
    const el = e.target.closest('[data-uid]');
    if (!el || upgrading) return;
    upFrom = el.dataset.uid;
    renderUpgrader();
});

$('#upTargets').addEventListener('click', e => {
    const el = e.target.closest('[data-sid]');
    if (!el || upgrading) return;
    upTo = el.dataset.sid;
    renderUpgrader();
});

$('#upBtn').addEventListener('click', () => {
    const from = state.inv.find(i => i.uid === upFrom);
    if (!from || !upTo) return;
    const pct = upChance();
    const r = Math.random() * 100;
    const win = r < pct;

    upgrading = true;
    $('#upBtn').disabled = true;
    const needle = $('#needle');
    needleAngle = needleAngle - (needleAngle % 360) + 360 * 5 + r * 3.6;
    needle.style.transition = 'transform 4s cubic-bezier(.12,.8,.2,1)';
    needle.style.transform = `rotate(${needleAngle}deg)`;

    setTimeout(() => {
        removeItems([from.uid]);
        if (win) {
            addItems([upTo]);
            pushDrop(upTo, 'Ty', true);
            toast(`Upgrade udany! ${SKIN[upTo].weapon} | ${SKIN[upTo].name}`, 'ok');
            upFrom = state.inv[0].uid;
        } else {
            toast('Upgrade nieudany — skin przepadł.', 'err');
            upFrom = null;
        }
        upTo = null;
        upgrading = false;
        renderBalance();
        renderUpgrader();
    }, 4100);
});

// ---------- Ekwipunek ----------

function renderInventory() {
    const value = state.inv.reduce((s, i) => s + SKIN[i.id].price, 0);
    $('#invCount').textContent = state.inv.length;
    $('#invValue').textContent = fmt(value);
    $('#invGrid').innerHTML = state.inv.length
        ? state.inv.map(i => itemHtml(SKIN[i.id], `<button class="sell" data-sell="${i.uid}">Sprzedaj</button>`)).join('')
        : '<div class="empty">Ekwipunek jest pusty. <a href="#/" style="color:var(--accent)">Otwórz skrzynię</a></div>';
}

$('#invGrid').addEventListener('click', e => {
    const uid = e.target.dataset.sell;
    if (uid) sell([uid]);
});

$('#sellAllBtn').addEventListener('click', () => {
    if (state.inv.length) sell(state.inv.map(i => i.uid));
});

$('#resetBtn').addEventListener('click', () => {
    if (!confirm('Na pewno zresetować konto? Stracisz monety i skiny.')) return;
    state = defaultState();
    save();
    renderBalance();
    refreshCurrent();
    toast('Konto zresetowane.');
});

// ---------- Router ----------

let currentPage = 'home';

function refreshCurrent() {
    if (currentPage === 'inventory') renderInventory();
    if (currentPage === 'upgrader') renderUpgrader();
}

function route() {
    const [, page = '', arg] = location.hash.split('/');
    currentPage = page === 'case' ? 'case' : (['battles', 'upgrader', 'inventory'].includes(page) ? page : 'home');

    document.querySelectorAll('.page').forEach(p => p.classList.toggle('active', p.id === `page-${currentPage}`));
    document.querySelectorAll('.nav a').forEach(a =>
        a.classList.toggle('active', a.dataset.page === currentPage || (currentPage === 'case' && a.dataset.page === 'home')));

    if (currentPage === 'case') renderCase(arg);
    if (currentPage === 'battles') renderBattles();
    if (currentPage === 'upgrader') renderUpgrader();
    if (currentPage === 'inventory') renderInventory();
    window.scrollTo(0, 0);
}

window.addEventListener('hashchange', route);

renderHome();
renderBalance();
route();
for (let i = 0; i < 14; i++) {
    const c = CASES[Math.floor(Math.random() * CASES.length)];
    pushDrop(roll(c), BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]);
}
botDropLoop();
