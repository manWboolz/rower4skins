// Rower4Skins — symulator otwierania skrzynek. Tylko wirtualne monety, bez prawdziwych pieniędzy.
'use strict';

// ============================================================
// Pomocnicze
// ============================================================

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pick = a => a[Math.floor(Math.random() * a.length)];
const round2 = n => Math.round(n * 100) / 100;
// Ceny są trzymane w dolarach; wyświetlamy je w walucie wybranej w ustawieniach (kursy przybliżone).
const CUR = {
    pln: { r: 3.65, n: 'PLN', f: v => v.toFixed(2).replace('.', ',') + ' zł' },
    usd: { r: 1, n: 'USD', f: v => '$' + v.toFixed(2) },
    eur: { r: 0.86, n: 'EUR', f: v => v.toFixed(2).replace('.', ',') + ' €' },
};
const curr = () => CUR[state.settings.cur] || CUR.usd;
const money = n => (n < 0 ? '−' : '') + curr().f(Math.abs(n) * curr().r);
// Tłumaczenie tekstu rysowanego na canvasie (i18n.js działa tylko na DOM).
const tr = t => (typeof trString === 'function' ? trString(t) : t);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function hash(s) {
    let h = 2166136261;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
}

function srand(seed) {
    return () => {
        seed = (seed + 0x6D2B79F5) | 0;
        let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function fmtDur(ms) {
    const s = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function fmtTime(t) {
    const d = new Date(t);
    return d.toLocaleDateString('pl-PL', { day: '2-digit', month: '2-digit' }) + ' ' +
        d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

// ============================================================
// Ikony
// ============================================================

const ICONS = {
    star: '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z"/>',
    box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
    swords: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5M13 19l6-6M16 16l4 4M19 21l2-2M9.5 17.5 21 6V3h-3L6.5 14.5M11 19l-6-6M8 16l-4 4M5 21l-2-2"/>',
    doc: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6M8 13h8M8 17h5"/>',
    swap: '<path d="M7 4 3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10 21a2 2 0 0 0 4 0"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>',
    crown: '<path d="M2 18h20M3 7l4.5 5L12 5l4.5 7L21 7l-2 11H5z"/>',
    grid: '<rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8z"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    eyeoff: '<path d="M3 3l18 18M10.6 5.1A10 10 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 5.4-1.6"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0M17 4a4 4 0 0 1 0 8M23 21a8 8 0 0 0-5-7.4"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/>',
    bolt: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    trophy: '<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>',
    gem: '<path d="M6 3h12l4 6-10 12L2 9z"/><path d="M2 9h20M12 21 8 9l4-6 4 6z"/>',
    wallet: '<rect x="2" y="6" width="20" height="14" rx="2"/><path d="M2 10h20M16 15h2"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>',
    chev: '<path d="m6 9 6 6 6-6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l4 2"/>',
    cake: '<path d="M4 21h16v-8a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2zM4 16s2 1.5 4 0 4 1.5 4 0 4 1.5 4 0 4 0 4 0M8 11V8M12 11V8M16 11V8M8 5v.01M12 5v.01M16 5v.01"/>',
    back: '<path d="M19 12H5M12 19l-7-7 7-7"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    paw: '<circle cx="7" cy="8" r="2"/><circle cx="12" cy="5" r="2"/><circle cx="17" cy="8" r="2"/><path d="M12 11c-3 0-6 4-6 7a2 2 0 0 0 2 2c1.5 0 2.5-1 4-1s2.5 1 4 1a2 2 0 0 0 2-2c0-3-3-7-6-7z"/>',
    skull: '<path d="M12 3a8 8 0 0 0-5 14.2V20h10v-2.8A8 8 0 0 0 12 3z"/><circle cx="9" cy="11" r="1.5"/><circle cx="15" cy="11" r="1.5"/><path d="M10 20v-2M14 20v-2"/>',
    sound: '<path d="M11 5 6 9H2v6h4l5 4zM15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14"/>',
    bike: '<circle cx="5.5" cy="17" r="3.5"/><circle cx="18.5" cy="17" r="3.5"/><path d="M5.5 17 9 9h7l2.5 8M9 9l4 8h5.5M8 6h3M14 6h3"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5"/>',
    tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><circle cx="7.5" cy="7.5" r="1.5"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M12 8v4M12 16h.01"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>',
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    crazy: '<circle cx="12" cy="12" r="9"/><path d="m7.5 8.5 3 1.5-3 1.5M16.5 8.5l-3 1.5 3 1.5M7.5 15c2 2.5 7 2.5 9 0"/>',
    syringe: '<path d="m18 2 4 4M16 4l4 4M18 6 8.5 15.5M14 4l6 6-9.5 9.5-6-6zM9 9l2 2M6.5 11.5l2 2M4.5 19.5 2 22"/>',
    counter: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l-3.5 3.5M12 12l3.5 3.5"/><path d="M4 4l3 3M20 4l-3 3"/>',
    scooter: '<circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/><path d="M8 18h8M16 18 13 4h3"/>',
};

const ic = (name, cls = '') =>
    `<svg class="ic ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// ============================================================
// Dane: rzadkości, skiny, skrzynki
// ============================================================

const RAR = {
    consumer: { n: 'Consumer', c: '#b0c3d9', w: 400 },
    industrial: { n: 'Industrial', c: '#5e98d9', w: 250 },
    milspec: { n: 'Mil-Spec', c: '#4b69ff', w: 120 },
    restricted: { n: 'Restricted', c: '#8847ff', w: 40 },
    classified: { n: 'Classified', c: '#d32ce6', w: 12 },
    covert: { n: 'Covert', c: '#eb4b4b', w: 4 },
    gold: { n: '★ Rare Special', c: '#e4ae39', w: 1 },
};

// Katalog skinów pochodzi z skins.js (GUN_DATA, KNIFE_DATA, TINTS).
const SKINS = [
    ...GUN_DATA.map(([id, weapon, name, rarity, price, img, tint, type]) => ({ id, weapon, name, rarity, price, img, f: TINTS[tint] || '', type })),
    ...KNIFE_DATA.map(([id, weapon, name, price, type, c1, c2, pat]) => ({ id, weapon, name, rarity: 'gold', price, type, c1, c2, pat })),
];

const SKIN = Object.fromEntries(SKINS.map(s => [s.id, s]));

// Buduje pulę skrzynki [id, waga]. Każdy wpis [filtr, waga] dzielony jest na grupy rzadkości;
// waga to łączna szansa całej grupy (liczba albo funkcja od skina, np. RW()).
// W grupie drogie skiny są rzadsze (∝ (mediana/cena)^skew). `per` ogranicza liczbę skinów w grupie
// (wybór losowy, ale zawsze ten sam dla danej skrzynki), `mix` traktuje wpis jako jedną grupę.
function pool(spec, { per: perAll = 8, seed = '', skew = 0.7, mix = false } = {}) {
    const out = new Map();
    // Trzeci element wpisu może nadpisać limit, np. [KNIFE, 0.25, { per: 6 }].
    spec.forEach(([f, w, opt = {}], k) => {
        const per = opt.per ?? perAll;
        const groups = {};
        for (const s of SKINS) if (f(s)) (groups[mix ? 'all' : s.rarity] ||= []).push(s);
        for (const [g, list0] of Object.entries(groups)) {
            const mass = typeof w === 'function' ? w(list0[0]) : w;
            if (!(mass > 0)) continue;
            const rnd = srand(hash(seed + k + g));
            const list = per && list0.length > per ? list0.map(s => [s, rnd()]).sort((a, b) => a[1] - b[1]).slice(0, per).map(x => x[0]) : list0;
            const med = list.map(s => s.price).sort((a, b) => a - b)[Math.floor(list.length / 2)];
            const shares = list.map(s => Math.pow(med / s.price, skew));
            const sum = shares.reduce((a, b) => a + b, 0);
            list.forEach((s, i) => out.set(s.id, (out.get(s.id) || 0) + mass * shares[i] / sum));
        }
    });
    return [...out];
}
const R = (...r) => s => r.includes(s.rarity);
const KNIFE = s => s.rarity === 'gold' && s.type !== 'gloves';
const GLOVE = s => s.type === 'gloves';
const RW = (mult = 1) => s => RAR[s.rarity].w * mult;
const W = (...w) => s => w.includes(s.weapon);

// Skiny z obrazka „Smoczej Legendy” (prawdziwe modele).
const LEGEND = ['awp-dragon-lore', 'ak-47-fire-serpent', 'm4a4-buzz-kill', 'ssg-08-dragonfire', 'p90-asiimov', 'm4a1-s-cyrex', 'ak-47-vulcan',
    'usp-s-kill-confirmed', 'mac-10-neon-rider', 'm4a1-s-hyper-beast', 'm4a1-s-chantico-s-fire', 'awp-man-o-war', 'ak-47-neon-revolution',
    'galil-ar-chatterbox', 'm4a1-s-mecha-industries', 'ak-47-bloodsport', 'r8-revolver-fade', 'p2000-fire-elemental', 'm4a1-s-golden-coil',
    'ak-47-the-empress', 'awp-asiimov', 'ak-47-aquamarine-revenge', 'awp-hyper-beast', 'm4a4-desert-strike'].filter(id => SKIN[id]);

const WEAPON_CASES = [['AK-47', '#a16207'], ['AWP', '#db2777'], ['M4A1-S', '#65a30d'], ['M4A4', '#64748b'], ['Galil AR', '#eab308'],
    ['USP-S', '#2563eb'], ['SSG 08', '#ea580c'], ['Glock-18', '#8b5cf6'], ['P90', '#f97316'], ['MAC-10', '#ec4899'], ['R8 Revolver', '#b45309'],
    ['P2000', '#0ea5e9'], ['MP5-SD', '#14b8a6'], ['Nova', '#84cc16'], ['SG 553', '#6366f1'], ['XM1014', '#ef4444']];

const RARITY_CASES = [['consumer', 'Consumer', '#b0c3d9'], ['industrial', 'Industrial', '#5e98d9'], ['milspec', 'Mil-Spec', '#4b69ff'],
    ['restricted', 'Restricted', '#8847ff'], ['classified', 'Classified', '#d32ce6'], ['covert', 'Covert', '#eb4b4b']];

// Skrzynki za gemy: 12 poziomów. Średni drop ≈ 1,2 centa za gem, im droższa, tym więcej Covert i noży.
const GEM_TIERS = [
    ['starter', 'Nowicjusz', 500, '#8b5cf6', 'user'], ['explorer', 'Odkrywca', 1000, '#ea580c', 'target'],
    ['collector', 'Kolekcjoner', 1500, '#16a34a', 'doc'], ['adventurer', 'Poszukiwacz', 2000, '#a855f7', 'star'],
    ['challenger', 'Pretendent', 2500, '#d97706', 'trophy'], ['seeker', 'Tropiciel', 3000, '#2563eb', 'search'],
    ['hunter', 'Łowca', 3500, '#65a30d', 'paw'], ['master', 'Mistrz', 4000, '#7c3aed', 'crown'],
    ['elite', 'Elita', 4500, '#ca8a04', 'shield'], ['supreme', 'Supremacja', 5000, '#0d9488', 'bolt'],
    ['legendary', 'Legenda', 5500, '#dc2626', 'skull'], ['ultimate', 'Ostateczna', 6000, '#1d4ed8', 'gem'],
];
const GEM_VALUE = 0.012;

function poolEv(items) {
    const t = items.reduce((a, [, w]) => a + w, 0);
    return items.reduce((a, [id, w]) => a + SKIN[id].price * w / t, 0);
}

// Szuka x ∈ [0,1] (udział wysokich rzadkości), dla którego średni drop trafia w cel.
function tunedPool(specFn, target, opts) {
    let lo = 0, hi = 1, best = pool(specFn(1), opts);
    if (poolEv(best) < target) return best;
    for (let k = 0; k < 18; k++) {
        const mid = (lo + hi) / 2, items = pool(specFn(mid), opts);
        if (poolEv(items) > target) { hi = mid; best = items; } else lo = mid;
    }
    return best;
}

function gemTierCase([key, name, gems, color, icon], tier) {
    const hiTier = tier >= 6;
    return {
        id: 'gt-' + key, name, color, sec: 'gemtier', currency: 'gems', gems, deco: 'gemtier', icon, tier,
        items: tunedPool(x => [
            [R('milspec'), hiTier ? 0 : (1 - x) * 50],
            [R('restricted'), 30 * (1 - x * 0.6)],
            [R('classified'), 12 + 22 * x],
            [R('covert'), 2 + 26 * x],
            [KNIFE, 0.1 + 3 * x], [GLOVE, 0.05 + 1.2 * x],
        ], gems * GEM_VALUE, { seed: 'gt' + key, per: 10 }),
    };
}

const CASES = [
    // Legendy
    { id: 'smocza', name: 'Smocza Legenda', color: '#b91c1c', sec: 'legend', badge: 'HOT', feature: 'awp-dragon-lore', tag: 'Legenda',
        items: pool([[s => LEGEND.includes(s.id), 100]], { per: 0, mix: true, skew: 1.15 }) },
    { id: 'special', name: 'Rower4Skins Special', color: '#f5b400', sec: 'legend', badge: 'SPECIAL', deco: 'star', starPct: 12,
        items: pool([[R('classified'), 52], [R('covert'), 34], [KNIFE, 9, { per: 10 }], [GLOVE, 5, { per: 6 }]], { seed: 'sp' }) },
    { id: 'wyjec', name: 'Wyjec', color: '#dc2626', sec: 'legend', feature: 'm4a4-howl', tag: 'Howl',
        items: pool([[R('covert'), 20], [R('classified'), 60], [s => ['m4a4-howl', 'awp-medusa', 'awp-gungnir', 'ak-47-wild-lotus'].includes(s.id), 1.2]], { seed: 'wyjec' }) },

    // Skrzynki twórców
    { id: 'vit', name: 'Vit Case', color: '#2563eb', sec: 'creator', badge: 'CREATOR', deco: 'creator', mono: 'VIT',
        items: pool([[R('restricted'), RW()], [R('classified'), RW()], [R('covert'), RW()], [R('gold'), 0.6]], { seed: 'vit' }) },
    { id: 'km', name: 'KM Case', color: '#14b8a6', sec: 'creator', badge: 'CREATOR', deco: 'photo', img: 'img/km-case.webp',
        items: pool([[R('classified'), 40], [R('covert'), 18], [R('gold'), 2.5]], { seed: 'km' }) },

    // Skrzynki memów
    { id: 'm-zlodziej', name: 'Złodziej Rowerów', color: '#65a30d', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-zlodziej.webp',
        items: pool([[W('USP-S', 'Glock-18', 'P2000', 'R8 Revolver'), RW()], [R('covert'), 2], [KNIFE, 0.4]], { seed: 'zl' }) },
    { id: 'm-golab', name: 'Gołąb z KFC', color: '#f59e0b', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-golab.webp',
        items: pool([[R('consumer', 'industrial'), RW()], [R('milspec'), RW(0.5)], [R('restricted'), RW(0.3)], [KNIFE, 0.08]], { seed: 'go' }) },
    { id: 'm-pies', name: 'Pies Sąsiada', color: '#d4a373', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-pies.webp',
        items: pool([[R('industrial', 'milspec', 'restricted'), RW()], [R('classified'), RW()], [R('covert'), RW(0.6)]], { seed: 'pi' }) },
    { id: 'm-mis', name: 'Miś Miodek', color: '#facc15', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-mis.webp',
        items: pool([[R('milspec', 'restricted'), RW()], [s => /gold|golden|honey|sun/i.test(s.name), 30], [R('classified'), RW()]], { seed: 'mi' }) },
    { id: 'm-cyborg', name: 'Mięsny Cyborg', color: '#ef4444', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-cyborg.webp',
        items: pool([[R('restricted'), 40], [R('classified'), 40], [R('covert'), 16], [R('gold'), 2]], { seed: 'cy' }) },
    { id: 'm-szyja', name: 'Długa Szyja', color: '#f97316', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-szyja.webp',
        items: pool([[R('consumer', 'industrial', 'milspec'), RW()], [R('restricted'), RW(0.5)], [R('covert'), 0.6]], { seed: 'sz' }) },
    { id: 'm-kanada', name: 'Kanadyjski Syrop', color: '#dc2626', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-kanada.webp',
        items: pool([[R('milspec', 'restricted'), RW()], [R('classified'), RW()], [R('covert'), RW(0.7)], [R('gold'), 0.3]], { seed: 'ka' }) },
    { id: 'm-zombi', name: 'Zombi', color: '#64748b', sec: 'meme', badge: 'HOT', deco: 'photo', img: 'img/meme-zombi.webp',
        items: pool([[R('consumer'), 120], [R('covert'), 5], [R('gold'), 0.8]], { seed: 'zo' }) },
    { id: 'm-plecak', name: 'Ląduje w Plecaku', color: '#c026d3', sec: 'meme', badge: 'NEW', deco: 'photo', img: 'img/meme-plecak.webp',
        items: pool([[R('restricted'), 30], [R('classified'), 30], [R('covert'), 12], [KNIFE, 1.5], [GLOVE, 0.8]], { seed: 'pl' }) },
    { id: 'm-goryl', name: 'Armia Goryli', color: '#16a34a', sec: 'meme', badge: 'MEME', deco: 'photo', img: 'img/meme-goryl.webp',
        items: pool([[R('classified'), 40], [R('covert'), 20], [R('gold'), 3]], { seed: 'gr' }) },

    // Rowerowe Urodziny (event)
    { id: 'tort', name: 'Tort Urodzinowy', color: '#ec4899', sec: 'bday', badge: 'NEW', deco: 'cake',
        items: pool([[s => s.rarity !== 'gold', RW()], [R('gold'), 0.5]], { seed: 'to' }) },
    { id: 'balon', name: 'Balonik', color: '#3b82f6', sec: 'bday', badge: 'NEW',
        items: pool([[R('consumer', 'industrial'), RW()], [R('milspec'), RW(0.6)], [R('restricted'), RW(0.3)], [KNIFE, 0.25]], { seed: 'ba', per: 6 }) },
    { id: 'swieczka', name: 'Świeczka', color: '#f59e0b', sec: 'bday', badge: 'NEW',
        items: pool([[R('industrial'), 80], [R('classified'), 10], [R('covert'), 3], [KNIFE, 0.4]], { seed: 'sw', per: 6 }) },
    { id: 'konfetti', name: 'Konfetti', color: '#8b5cf6', sec: 'bday', badge: 'NEW',
        items: pool([[R('milspec', 'restricted', 'classified', 'covert'), RW()], [R('gold'), 0.5]], { seed: 'ko' }) },
    { id: 'prezent', name: 'Wielki Prezent', color: '#ef4444', sec: 'bday', badge: 'NEW',
        items: pool([[R('classified'), 60], [R('covert'), 20], [R('gold'), 3]], { seed: 'pr' }) },

    // Rzadkości — każda skrzynka zawiera wyłącznie skiny jednej rzadkości
    ...RARITY_CASES.map(([r, n, color]) => ({ id: 'r-' + r, name: n, color, sec: 'rar', tag: n, items: pool([[R(r), 100]], { per: 0, skew: 0.8 }) })),
    { id: 'r-kni', name: 'Noże', color: '#e4ae39', sec: 'rar', tag: 'Noże', items: pool([[KNIFE, 100]], { per: 0, skew: 0.8, mix: true }) },
    { id: 'r-glv', name: 'Rękawice', color: '#d97706', sec: 'rar', tag: 'Rękawice', items: pool([[GLOVE, 100]], { per: 0, skew: 0.8, mix: true }) },

    // Bronie — tylko skiny danej broni i mała szansa na nóż
    ...WEAPON_CASES.map(([w, color]) => ({
        id: 'w-' + w.toLowerCase().replace(/[^a-z0-9]/g, ''), name: w, color, sec: 'wpn', tag: w,
        items: pool([[W(w), RW()], [KNIFE, 0.25, { per: 6 }]], { per: 0, seed: w, skew: 0.6 }),
    })),

    // Specjalne
    ...GEM_TIERS.map(gemTierCase),
    { id: 'daily', name: 'Codzienna Skrzynka', color: '#22c55e', currency: 'free', kind: 'daily', deco: 'gift',
        items: pool([[R('consumer', 'industrial'), RW()], [R('milspec'), RW(0.5)], [R('restricted'), RW(0.2)], [R('covert'), 0.3]], { seed: 'dl' }) },
    ...[5, 10, 20, 30, 50].map((lvl, i) => ({
        id: 'exp' + lvl, name: 'Poziom ' + lvl, color: ['#38bdf8', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'][i],
        currency: 'free', kind: 'exp', lvl, deco: 'lvl',
        items: pool([
            [[R('consumer', 'industrial'), R('industrial', 'milspec'), R('milspec', 'restricted'), R('restricted', 'classified'), R('classified', 'covert')][i], RW()],
            [[R('milspec'), R('restricted'), R('classified'), R('covert'), R('gold')][i], RW(0.5)],
        ], { seed: 'exp' + lvl }),
    })),
    { id: 'hidden', name: 'Ukryta Skrzynka', color: '#fb923c', currency: 'free', kind: 'hidden', deco: 'hidden',
        items: pool([[R('restricted'), 50], [R('classified'), 30], [R('covert'), 10], [R('gold'), 1]], { seed: 'hd' }) },
];

for (const c of CASES) {
    c.currency = c.currency || 'usd';
    c.total = c.items.reduce((s, [, w]) => s + w, 0);
    c.ev = c.items.reduce((s, [id, w]) => s + SKIN[id].price * w / c.total, 0);
    // Cena = średni drop / 0.9, czyli skrzynka oddaje średnio ok. 90% ceny.
    if (c.currency === 'usd') c.price = Math.max(0.05, round2(c.ev / 0.9));
    if (!c.feature && !c.deco) c.feature = [...c.items].sort((a, b) => SKIN[b[0]].price - SKIN[a[0]].price)[0][0];
    rareOf(c);
}

// Gwiazdki: najrzadsze przedmioty skrzynki (łącznie ok. 1,5% szans, w skrzynce Special więcej).
// Na ruletce zamiast nich pojawia się złota gwiazdka „Rower4Skins Special”, a po niej druga ruletka tylko z rzadkich.
function rareOf(c) {
    const sorted = [...c.items].sort((a, b) => a[1] - b[1] || SKIN[b[0]].price - SKIN[a[0]].price);
    const lim = (c.starPct ?? 1.5) / 100 * c.total;
    const rare = [];
    let cum = 0;
    for (const [id, w] of sorted) { if (cum + w > lim) break; cum += w; rare.push([id, w]); }
    if (rare.length === c.items.length) rare.length = 0;
    c.rare = new Set(rare.map(x => x[0]));
    c.rareItems = rare;
    c.rareTotal = cum;
}

const CASE = Object.fromEntries(CASES.map(c => [c.id, c]));
const USD_CASES = CASES.filter(c => c.currency === 'usd');

const SECTIONS = [
    { id: 'legend', title: 'Legendy', icon: 'crown' },
    { id: 'creator', title: 'Skrzynki twórców', icon: 'user' },
    { id: 'meme', title: 'Skrzynki memów', icon: 'bolt' },
    { id: 'bday', title: 'Rowerowe Urodziny', icon: 'cake' },
    { id: 'rar', title: 'Rzadkości', icon: 'star' },
    { id: 'wpn', title: 'Bronie', icon: 'target' },
];

// [nazwa, wartość $, kolor, zdjęcie, minigra, trudność 1–5; 6 = HARDCORE, 7 = OMEGA]
const BIKES = [
    ['Składak Wigry 3', 5, '#94a3b8', '', 'pump', 1], ['Ukraina z piwnicy', 8, '#a16207', '', 'timing', 1],
    ['Romet Jubilat', 12, '#ef4444', '', 'memory', 2], ['Góral z marketu', 15, '#22c55e', '', 'gears', 2],
    ['BMX sąsiada', 20, '#f59e0b', '', 'ride', 3], ['Szosówka Kross', 35, '#3b82f6', '', 'pump', 3],
    ['Elektryk miejski', 60, '#14b8a6', '', 'timing', 4], ['Karbonowa kolarzówka', 120, '#a855f7', '', 'memory', 4],
    ['ENGWE EP-2.0 Boost', 299, '#3b82f6', 'img/engwe-ep2-boost.png', 'gears', 5],
    ['Ridingtimes GT73 Pro', 499, '#e5b98a', 'img/ridingtimes-gt73-pro.png', 'ride', 6],
    ['Kukirin G2', 700, '#f97316', 'img/kukirin-g2.webp', 'slalom', 6],
    ['Electrix KMA', 950, '#ef4444', 'img/electrix-kma.webp', 'climb', 6],
    ['Stark Varg', 1500, '#e2e8f0', 'img/stark-varg.png', 'wheelie', 7],
];

const IMG = {
    zlodziej: 'img/meme-zlodziej.webp',
    golab: 'img/meme-golab.webp',
    pies: 'img/meme-pies.webp',
    mis: 'img/meme-mis.webp',
    cyborg: 'img/meme-cyborg.webp',
    logo: 'img/logo.png',
    engwe: 'img/engwe-ep2-boost.png',
    gt73: 'img/ridingtimes-gt73-pro.png',
    varg: 'img/stark-varg.png',
    kma: 'img/electrix-kma.webp',
    g2: 'img/kukirin-g2.webp',
};

const PROMOS = { ROWER4SKINS: { bal: 1 }, URODZINY: { gems: 500 }, SZPRYCHA: { bal: 0.5 }, KM5: { bal: 5, gems: 500 }, VIT5: { bal: 5, gems: 500 } };

const BOT_NAMES = [
    'Szprycha_Bez_Ham', 'DętkaZBiedronki', 'KołoFortuny', 'ZjazdNaTwarz', 'BMX_Babcia', 'TurboŁańcuch', 'Wigry3_Tuning',
    'KaskDlaZasady', 'HamulecRęczny', 'PompkaPanaMietka', 'RowerowyJanusz', 'GrażynaNaGóralu', 'SebixNaSkładaku', 'KolarzZBiedry',
    'ŁydkaStalowa', 'ŁańcuchSpadł', 'DzwonekDzyńDzyń', 'BłotnikLegenda', 'OponaKapeć', 'RoweremDoLidla', 'BezTrzymanki',
    'WheelieWiesiek', 'StuntStaszek', 'ZjazdowyZbyszek', 'GołąbZKurczakiem', 'KarbonowyKazik', 'PompujMocniej', 'KółkoZapasowe',
    'TataNaHolendrze', 'EBikeEdek', 'WiatrWOczy', 'BidonZKompotem', 'KolarzówkaKrysia', 'MistrzKraksy', 'SzuterSzymon',
    'HulajnogaHalina', 'RowerNaKredyt', 'DropNaStówę', 'SkrzynkaPandory', 'AWP_za_5zł', 'CovertCzesiek', 'StatTrakStefan',
    'KnifeKrzysiek', 'GlovesGienek', 'DragonLoreZOLX', 'LuckyLeszek', 'MinusMarek', 'AllInAdam', 'DżemZPompki',
    'ProfesorSzprycha', 'KrólRondaBlokowa', 'DziadekNaWigrach', 'TeamSzprycha', 'SkinyZaSkarpety', 'PanPrzerzutka', 'NoScopeNorbert',
    'CzterechPancern', 'WujekZKatowic', 'KotNaBagażniku', 'ZłotyŁańcuch', 'NożykDoMasła', 'ZgubiłemPedał', 'DrugiSkładak',
    'GumaWDętce', 'Rower_bez_kół', 'HoldujęKnife', 'OpenujęDoRana', 'MamaMyśliŻeŚpię', 'LekcjaWFu', 'KanapkaZSerem',
    'BurakPedałuje', 'MamoToCovert', 'OjTamOjTam', 'SzybkiJakŚlimak',
];

const MODES = {
    normal: { n: 'Normal', icon: 'swords', col: '#22a7f0',
        d: 'Podstawowy tryb. Wygrywa gracz z najwyższą łączną wartością dropów i zabiera wszystko. Pozostali dostają gwarantowany skin.' },
    underdog: { n: 'Underdog', icon: 'paw', col: '#ffc41f',
        d: 'Odwrócone zasady. Wygrywa gracz z najniższą łączną wartością dropów i zabiera wszystko.' },
    pointrush: { n: 'Point Rush', icon: 'star', col: '#ff8a1f',
        d: 'Każda runda to wyścig o punkt: dostaje go gracz z najdroższym dropem w tej rundzie. Najwięcej punktów zabiera wszystko (remis rozstrzyga suma). Przegrani dostają gwarantowany skin.' },
    terminal: { n: 'Terminal', icon: 'skull', col: '#ff4d5e',
        d: 'Liczy się tylko ostatnia runda. Wygrywa ten, kto wylosuje najdroższy skin w ostatniej skrzynce.' },
    crazyrush: { n: 'Crazy Rush', icon: 'crazy', col: '#c04cf0',
        d: 'Odwrócony Point Rush: punkt za rundę dostaje gracz z NAJTAŃSZYM dropem. Najwięcej punktów wygrywa (remis: niższa suma).' },
    crazyterminal: { n: 'Crazy Terminal', icon: 'syringe', col: '#45d15b',
        d: 'Liczy się tylko ostatnia runda, ale na odwrót — wygrywa NAJTAŃSZY skin w ostatniej skrzynce.' },
    counterterminal: { n: 'Counter Terminal', icon: 'counter', col: '#ff3d8b',
        d: 'Wszystkie rundy oprócz ostatniej się dodają, a ostatnia się ODEJMUJE. Wynik = suma wcześniejszych dropów − ostatni drop. Najwyższy wynik wygrywa.' },
};

// Wynik w trybie bitwy. prices[k][i] = cena dropu gracza i w rundzie k (w centach, żeby uniknąć błędów zaokrągleń).
// Zwraca indeksy graczy, którzy prowadzą (więcej niż jeden = remis) oraz punkty (tryby Rush).
function modeLeaders(mode, prices) {
    const n = prices[0]?.length || 0;
    const tot = Array.from({ length: n }, (_, i) => prices.reduce((s, row) => s + row[i], 0));
    const last = prices[prices.length - 1] || tot.map(() => 0);
    let sc = tot, low = false, pts = null, tieLow = false;
    if (mode === 'underdog') low = true;
    else if (mode === 'terminal') sc = last;
    else if (mode === 'crazyterminal') { sc = last; low = true; }
    else if (mode === 'counterterminal') sc = tot.map((t, i) => t - 2 * last[i]);
    else if (mode === 'pointrush' || mode === 'crazyrush') {
        pts = Array(n).fill(0);
        for (const row of prices) {
            const best = mode === 'pointrush' ? Math.max(...row) : Math.min(...row);
            row.forEach((p, i) => { if (p === best) pts[i]++; });
        }
        sc = pts; tieLow = mode === 'crazyrush';
    }
    const best = low ? Math.min(...sc) : Math.max(...sc);
    let lead = sc.map((v, i) => (v === best ? i : -1)).filter(i => i >= 0);
    if (pts && lead.length > 1) {
        const t = lead.map(i => tot[i]), tb = tieLow ? Math.min(...t) : Math.max(...t);
        lead = lead.filter(i => tot[i] === tb);
    }
    return { lead, pts, sc };
}
const cents = id => Math.round(SKIN[id].price * 100);
const CONSOLATION = ['normal', 'pointrush'];

const MISSIONS = [
    { id: 'm1', t: 'Otwórz 10 skrzynek', goal: 10, v: () => state.stats.opened, gems: 400 },
    { id: 'm2', t: 'Wygraj bitwę skrzynek', goal: 1, v: () => state.stats.battlesWon, gems: 600 },
    { id: 'm3', t: 'Podpisz kontrakt', goal: 1, v: () => state.stats.contracts, gems: 400 },
    { id: 'm4', t: 'Znajdź ukrytą skrzynkę na banerze', goal: 1, v: () => (state.hiddenFound ? 1 : 0), gems: 800 },
    { id: 'm5', t: 'Osiągnij poziom 5', goal: 5, v: () => level(), gems: 800 },
    { id: 'm6', t: 'Wydaj łącznie $50 na skrzynki i bitwy', goal: 50, v: () => state.stats.wagered, gems: 1200 },
    { id: 'm7', t: 'Złap gwiazdkę Rower4Skins Special', goal: 1, v: () => state.stats.stars, gems: 1500 },
    { id: 'm8', t: 'Wygraj bitwę w trybie Crazy', goal: 1, v: () => state.stats.crazyWins, gems: 900 },
];

// ============================================================
// Stan gry
// ============================================================

const KEY = 'r4s_v3';

function fresh() {
    return {
        balance: 5, gems: 0, exp: 0, name: 'Kolarz', color: '#a855f7',
        inv: [], itemLog: [], walletLog: [], notes: [], unread: 0, favs: [],
        daily: 0, expUsed: {}, promos: [], hiddenFound: false, hiddenUsed: false, claimed: [], myBattles: [],
        stats: { opened: 0, wagered: 0, battles: 0, battlesWon: 0, contracts: 0, best: 0, stars: 0, crazyWins: 0 },
        settings: { sound: true, fast: false, cur: 'usd', lang: 'pl' },
        eventEnd: Date.now() + 45 * 864e5 + 23 * 36e5,
    };
}

function load() {
    const base = fresh();
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const s = JSON.parse(raw);
            const out = { ...base, ...s, stats: { ...base.stats, ...s.stats }, settings: { ...base.settings, ...s.settings } };
            // Katalog skinów się zmienił — stare skiny zamieniamy na $ po ostatniej cenie, żeby nic nie przepadło.
            const lost = out.inv.filter(i => !SKIN[i.id]);
            if (lost.length) {
                out.balance = round2(out.balance + lost.reduce((sum, i) => sum + (OLD_PRICES[i.id] ?? 0.5), 0));
                out.inv = out.inv.filter(i => SKIN[i.id]);
            }
            out.itemLog = out.itemLog.filter(r => SKIN[r.id]);
            return out;
        }
    } catch (e) { /* brak localStorage */ }
    return base;
}

let state = load();

function save() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignoruj */ }
}

let uidSeq = Date.now();
const newUid = () => (uidSeq++).toString(36);

// Poziom: łącznie 250 * (L-1)^2 EXP, 100 EXP za każdy wydany $1.
const level = (exp = state.exp) => Math.floor(Math.sqrt(exp / 250)) + 1;
const levelStart = L => 250 * (L - 1) * (L - 1);

function wallet(delta, reason) {
    state.balance = round2(state.balance + delta);
    state.walletLog.unshift({ t: Date.now(), d: round2(delta), r: reason });
    state.walletLog.length = Math.min(state.walletLog.length, 150);
    save();
    renderTop();
}

function addGems(n, reason) {
    state.gems += n;
    note(`${reason}: +${n} gemów`);
    save();
    renderTop();
}

function spend(dollars) {
    const before = level();
    state.stats.wagered = round2(state.stats.wagered + dollars);
    state.exp += Math.round(dollars * 100);
    // 10 gemów za każdy wydany $1
    state.gemAcc = (state.gemAcc || 0) + dollars * 10;
    const g = Math.floor(state.gemAcc);
    state.gemAcc -= g;
    state.gems += g;
    const after = level();
    for (let L = before + 1; L <= after; L++) {
        state.gems += 100 * L;
        note(`Awans na poziom ${L}! +${100 * L} gemów`);
        toast(`Awans na poziom ${L}!`, 'ok');
    }
    save();
}

// Stan zużycia — tylko wygląd, nie zmienia ceny.
const WEARS = [['FN', 12], ['MW', 25], ['FT', 38], ['WW', 13], ['BS', 12]];
const WEAR_NAME = { FN: 'Factory New', MW: 'Minimal Wear', FT: 'Field-Tested', WW: 'Well-Worn', BS: 'Battle-Scarred' };

function rollWear() {
    let r = Math.random() * 100;
    for (const [w, p] of WEARS) { r -= p; if (r < 0) return w; }
    return 'FT';
}

function giveItems(ids, source, wears = []) {
    const uids = [];
    for (const [k, id] of ids.entries()) {
        const uid = newUid();
        uids.push(uid);
        state.inv.unshift({ uid, id, t: Date.now(), w: wears[k] || rollWear() });
        state.itemLog.unshift({ t: Date.now(), id, a: source });
        state.stats.best = Math.max(state.stats.best, SKIN[id].price);
    }
    state.itemLog.length = Math.min(state.itemLog.length, 200);
    save();
    renderTop();
    return uids;
}

function takeItems(uids, action) {
    const set = new Set(uids);
    const taken = state.inv.filter(i => set.has(i.uid));
    state.inv = state.inv.filter(i => !set.has(i.uid));
    for (const i of taken) state.itemLog.unshift({ t: Date.now(), id: i.id, a: action });
    save();
    renderTop();
    return taken;
}

function sellUids(uids) {
    const taken = takeItems(uids, 'Sprzedano');
    const value = round2(taken.reduce((s, i) => s + SKIN[i.id].price, 0));
    if (value > 0) {
        wallet(value, `Sprzedaż ${taken.length} przedm.`);
        toast(`Sprzedano za ${money(value)}`, 'ok');
    }
    return value;
}

function note(text) {
    state.notes.unshift({ t: Date.now(), text });
    state.notes.length = Math.min(state.notes.length, 30);
    state.unread++;
    save();
    renderTop();
}

const invValue = () => round2(state.inv.reduce((s, i) => s + SKIN[i.id].price, 0));

// ============================================================
// Losowanie
// ============================================================

function roll(c) {
    let r = Math.random() * c.total;
    for (const [id, w] of c.items) {
        r -= w;
        if (r < 0) return id;
    }
    return c.items[c.items.length - 1][0];
}

const chanceOf = (c, id) => c.items.find(i => i[0] === id)[1] / c.total * 100;

// ============================================================
// Dźwięk
// ============================================================

let actx = null;

function beep(freq, len = 0.035, vol = 0.04, type = 'square') {
    if (!state.settings.sound) return;
    try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type;
        o.frequency.value = freq;
        g.gain.setValueAtTime(vol, actx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.0001, actx.currentTime + len);
        o.connect(g).connect(actx.destination);
        o.start();
        o.stop(actx.currentTime + len + 0.01);
    } catch (e) { /* brak audio */ }
}

// Dźwięk ze zmianą wysokości (f0 → f1).
function tone(f0, f1, len, vol = 0.04, type = 'sine', delay = 0) {
    if (!state.settings.sound) return;
    try {
        actx = actx || new (window.AudioContext || window.webkitAudioContext)();
        const t = actx.currentTime + delay;
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type;
        o.frequency.setValueAtTime(f0, t);
        o.frequency.exponentialRampToValueAtTime(f1, t + len);
        g.gain.setValueAtTime(0.0001, t);
        g.gain.exponentialRampToValueAtTime(vol, t + Math.min(0.03, len / 3));
        g.gain.exponentialRampToValueAtTime(0.0001, t + len);
        o.connect(g).connect(actx.destination);
        o.start(t);
        o.stop(t + len + 0.02);
    } catch (e) { /* brak audio */ }
}

// Lekki „dzyń” przy każdym dropie — wyżej dla lepszych rzadkości.
function dropSound(s) {
    const lvl = { consumer: 0, industrial: 0, milspec: 1, restricted: 2, classified: 3, covert: 4, gold: 5 }[s?.rarity] ?? 0;
    const f = 620 * Math.pow(1.12, lvl);
    tone(f, f, 0.16, 0.03, 'sine');
    tone(f * 1.5, f * 1.5, 0.22, 0.022, 'sine', 0.07);
}

// Gwiazdka: świst w górę, błysk i dzwoneczki.
function starSound() {
    tone(220, 1760, 0.55, 0.05, 'triangle');
    tone(110, 55, 0.6, 0.06, 'sine', 0.05);
    [1568, 2093, 2637, 3136, 2637, 3136, 4186].forEach((f, i) => tone(f, f, 0.2, 0.025, 'sine', 0.45 + i * 0.07));
}

// Rzadki przedmiot z drugiej ruletki: fanfara.
function rareSound() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, f, 0.9, 0.03, 'triangle', i * 0.06));
    [1319, 1568, 2093, 2637].forEach((f, i) => tone(f, f * 1.01, 0.3, 0.02, 'sine', 0.35 + i * 0.09));
}

function winSound(big) {
    const notes = big ? [523, 659, 784, 1047, 1319] : [523, 659, 784];
    notes.forEach((f, i) => setTimeout(() => beep(f, 0.18, 0.05, 'triangle'), i * 90));
}

// ============================================================
// Grafika SVG: bronie, skrzynie, avatary
// ============================================================

let SID = 0;

const SHAPES = {
    bayonet: '<path d="M34 16.5 L90 15 Q98 16.5 91 19.5 L62 24.5 L34 24.5 Z"/><path d="M29 11 H35 V30 H29 Z"/><path d="M29 16 H9 Q4 16 4 20.5 Q4 25 9 25 H29 Z"/>',
    m9: '<path d="M34 15 L58 15 L61 13 L64 15 L67 13 L70 15 L73 13 L76 15 L90 16 Q98 18 90 21.5 L34 25 Z"/><path d="M29 11 H35 V30 H29 Z"/><path d="M29 16 H9 Q4 16 4 20.5 Q4 25 9 25 H29 Z"/>',
    karambit: '<path d="M44 19 Q64 9 90 3 Q84 16 62 24 Q52 27 44 26 Z"/><path d="M45 17 L18 25 Q12 27 13 31 L16 33 L46 26 Z"/><path d="M13 30 a5 5 0 1 0 0.1 0 Z M13 33 a2 2 0 1 1 -0.1 0 Z" fill-rule="evenodd"/>',
    butterfly: '<path d="M44 17.5 L90 17 Q98 19.5 90 22.5 L44 22.5 Z"/><path d="M44 13 H9 Q4 13 4 16 L4 17 H44 Z"/><path d="M44 23 H9 Q4 23 4 26 L4 27 H44 Z"/>',
    talon: '<path d="M40 21 Q62 21 80 11 Q92 4 96 6 Q90 22 60 27.5 L40 27.5 Z"/><path d="M35 15 H41 V32 H35 Z"/><path d="M35 20 H12 Q6 20 6 24 Q6 28 12 28 H35 Z"/>',
    gloves: '<path d="M22 37 L20 21 Q20 18 23 18 L24 9 Q25 6 27 9 L28 17 L29 6 Q30 3 32 6 L33 17 L34.5 7 Q36 4 37.5 7 L37.5 18 L40 13 Q42 11 43 14 L40 28 L38 37 Z"/><path d="M56 37 L54 21 Q54 18 57 18 L58 9 Q59 6 61 9 L62 17 L63 6 Q64 3 66 6 L67 17 L68.5 7 Q70 4 71.5 7 L71.5 18 L74 13 Q76 11 77 14 L74 28 L72 37 Z"/>',
};

// Obrazek skina: zdjęcie broni z filtrem koloru albo rysowany nóż/rękawice.
function art(s, size = '') {
    if (s.img) return `<img class="wart wimg" src="${s.img}" alt="" draggable="false" ${s.f ? `style="filter:${s.f}"` : ''}>`;
    const id = 'w' + (++SID);
    const sh = SHAPES[s.type];
    let defs = `<linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="${s.pat === 'f' ? 0 : 1}"><stop offset="0" stop-color="${s.c1}"/><stop offset="1" stop-color="${s.c2}"/></linearGradient><clipPath id="${id}c">${sh}</clipPath>`;
    let over = '';
    if (s.pat === 's') {
        defs += `<pattern id="${id}p" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(40)"><rect width="3" height="7" fill="${s.c2}" opacity=".6"/></pattern>`;
        over = `<rect width="100" height="40" fill="url(#${id}p)"/>`;
    } else if (s.pat === 'c') {
        const r = srand(hash(s.id));
        over = Array.from({ length: 14 }, () =>
            `<ellipse cx="${(r() * 100).toFixed(1)}" cy="${(r() * 40).toFixed(1)}" rx="${(3 + r() * 7).toFixed(1)}" ry="${(2 + r() * 4).toFixed(1)}" fill="${r() < 0.5 ? s.c2 : '#111'}" opacity="${(0.35 + r() * 0.4).toFixed(2)}"/>`).join('');
    } else if (s.pat === 'f') {
        defs += `<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset=".45" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>`;
        over = `<rect width="100" height="40" fill="url(#${id}h)"/>`;
    }
    // metalowe ostrze: jasny grzbiet
    const edge = s.type === 'gloves' ? '' : `<rect width="100" height="18" fill="#fff" opacity=".16"/>`;
    return `<svg class="wart" viewBox="0 0 100 40" ${size}><defs>${defs}</defs><g clip-path="url(#${id}c)"><rect width="100" height="40" fill="url(#${id}g)"/>${over}${edge}</g><g fill="none" stroke="rgba(0,0,0,.65)" stroke-width=".7" stroke-linejoin="round">${sh}</g></svg>`;
}

// Ta sama grafika, ale jako element wewnątrz większego SVG (np. na skrzyni).
function artInSvg(s, w, h) {
    if (s.img) return `<image href="${s.img}" width="${w}" height="${h}" preserveAspectRatio="xMidYMid meet" ${s.f ? `style="filter:${s.f}"` : ''}/>`;
    return art(s, `width="${w}" height="${h}"`);
}

// Kryształy gemów: kanciaste bryły z jasną ścianką i połyskiem.
function crystals(seed, n, x0, x1, y0, y1, id, scale = 1) {
    const r = srand(seed);
    const grad = `<defs><linearGradient id="${id}c1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f5d0fe"/><stop offset=".5" stop-color="#c026d3"/><stop offset="1" stop-color="#4c1d95"/></linearGradient>
        <linearGradient id="${id}c2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e9d5ff"/><stop offset="1" stop-color="#7e22ce"/></linearGradient></defs>`;
    const list = Array.from({ length: n }, () => ({ x: x0 + r() * (x1 - x0), y: y0 + r() * (y1 - y0), s: (6 + r() * 9) * scale, a: (r() - 0.5) * 50 })).sort((a, b) => a.y - b.y);
    return grad + list.map(({ x, y, s, a }) => `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a.toFixed(0)})">
        <path d="M0 ${-s * 1.3} L${s * 0.75} ${-s * 0.3} L${s * 0.5} ${s * 0.8} L${-s * 0.5} ${s * 0.8} L${-s * 0.75} ${-s * 0.3} Z" fill="url(#${id}c1)" stroke="#2e1065" stroke-width=".8"/>
        <path d="M0 ${-s * 1.3} L${s * 0.75} ${-s * 0.3} L0 ${s * 0.1} Z" fill="url(#${id}c2)" opacity=".9"/>
        <path d="M${-s * 0.35} ${-s * 0.4} L${-s * 0.1} ${-s * 0.95}" stroke="#fff" stroke-width="${(s / 7).toFixed(1)}" stroke-linecap="round" opacity=".8"/></g>`).join('');
}

function sparkles(seed, n, x0, x1, y0, y1) {
    const r = srand(seed);
    return Array.from({ length: n }, () => {
        const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), s = 2 + r() * 4;
        return `<path d="M${x} ${y - s}L${x + s * 0.3} ${y - s * 0.3}L${x + s} ${y}L${x + s * 0.3} ${y + s * 0.3}L${x} ${y + s}L${x - s * 0.3} ${y + s * 0.3}L${x - s} ${y}L${x - s * 0.3} ${y - s * 0.3}Z" fill="#fff" opacity="${(0.4 + r() * 0.5).toFixed(2)}"/>`;
    }).join('');
}

function caseArt(c) {
    const id = 'k' + (++SID), col = c.color;
    let behind = '', front = '';

    if (c.feature) {
        const f = SKIN[c.feature];
        const rot = f.type === 'gloves' ? -8 : f.type === 'gun' ? -24 : -34;
        behind = `<g transform="translate(120 66) rotate(${rot}) translate(-92 -36)">${artInSvg(f, 184, 72)}</g>`;
    }
    if (c.deco === 'gems') behind = crystals(hash(c.id), 22, 56, 184, 74, 104, id);
    if (c.deco === 'gemtier') {
        const t = c.tier;
        // Emblemat poziomu za skrzynią, stos kryształów i tabliczka z liczbą gemów.
        behind = `<g transform="translate(120 46) scale(${3.4 + t * 0.05}) translate(-12 -12)" fill="none" stroke="${col}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" opacity=".95" filter="url(#${id}gl)">${ICONS[c.icon]}</g>`
            + `<g transform="translate(120 46) scale(${3.4 + t * 0.05}) translate(-12 -12)" fill="none" stroke="#fff" stroke-width=".7" stroke-linecap="round" stroke-linejoin="round" opacity=".85">${ICONS[c.icon]}</g>`
            + crystals(hash(c.id), 16 + t * 2, 50, 190, 70 - t, 104, id);
        front = crystals(hash(c.id) + 7, 6 + t, 20, 220, 168, 186, id + 'f', 0.8)
            + `<g transform="translate(120 162)"><rect x="-38" y="-11" width="76" height="22" rx="5" fill="#0b0e16" fill-opacity=".85" stroke="${col}" stroke-width="1.5"/><text y="5" text-anchor="middle" font-size="12" font-weight="900" fill="#f5d0fe" font-family="Saira, sans-serif" letter-spacing="1">${c.gems} GEMÓW</text></g>`;
    }
    if (c.deco === 'gift') {
        behind = `<rect x="84" y="38" width="72" height="58" rx="4" fill="#16a34a" stroke="#052e16" stroke-width="2"/><rect x="113" y="38" width="14" height="58" fill="#fde047"/><rect x="80" y="30" width="80" height="14" rx="3" fill="#22c55e" stroke="#052e16" stroke-width="2"/><rect x="113" y="30" width="14" height="14" fill="#facc15"/><path d="M120 30 C104 10 88 20 104 30 M120 30 C136 10 152 20 136 30" stroke="#facc15" stroke-width="6" fill="none"/>`;
    }
    if (c.deco === 'cake') {
        behind = `<rect x="70" y="58" width="100" height="40" rx="6" fill="#f9a8d4" stroke="#831843" stroke-width="2"/><path d="M70 66 Q80 76 90 66 Q100 76 110 66 Q120 76 130 66 Q140 76 150 66 Q160 76 170 66" stroke="#fff" stroke-width="5" fill="none"/><rect x="86" y="30" width="68" height="30" rx="5" fill="#fbcfe8" stroke="#831843" stroke-width="2"/>` +
            [98, 112, 126, 140].map((x, i) => `<rect x="${x - 3}" y="14" width="6" height="18" fill="${['#60a5fa', '#facc15', '#34d399', '#f87171'][i]}"/><path d="M${x} 4 Q${x + 5} 10 ${x} 14 Q${x - 5} 10 ${x} 4" fill="#fb923c"/>`).join('');
    }
    if (c.deco === 'hidden') {
        behind = `<text x="120" y="92" text-anchor="middle" font-size="90" font-weight="900" fill="${col}" stroke="#1c1917" stroke-width="3" font-family="Saira, sans-serif">?</text>`;
    }
    if (c.deco === 'photo') {
        behind = `<defs><clipPath id="${id}p"><rect x="74" y="0" width="92" height="105" rx="10"/></clipPath></defs>
            <g transform="rotate(-7 120 60)">
                <rect x="70" y="-4" width="100" height="113" rx="13" fill="#fff"/>
                <image href="${c.img}" x="74" y="0" width="92" height="105" preserveAspectRatio="xMidYMid slice" clip-path="url(#${id}p)"/>
                <rect x="74" y="0" width="92" height="105" rx="10" fill="none" stroke="${col}" stroke-width="3"/>
            </g>`;
    }
    if (c.deco === 'creator') {
        behind = `<defs><linearGradient id="${id}c" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset=".4" stop-color="${col}"/><stop offset="1" stop-color="#0b0e16"/></linearGradient></defs>
            <g transform="rotate(-8 120 60)"><rect x="78" y="8" width="84" height="96" rx="12" fill="url(#${id}c)" stroke="#fff" stroke-width="3"/>
            <text x="120" y="${c.mono.length > 2 ? 66 : 70}" text-anchor="middle" font-size="${c.mono.length > 2 ? 30 : 40}" font-weight="900" font-style="italic" fill="#fff" stroke="#0b0e16" stroke-width="2" paint-order="stroke" font-family="Saira, sans-serif">${esc(c.mono)}</text>
            <rect x="86" y="80" width="68" height="16" rx="4" fill="#0b0e16" opacity=".75"/><text x="120" y="92" text-anchor="middle" font-size="10" font-weight="800" letter-spacing="1.5" fill="#fde047" font-family="Saira, sans-serif">CREATOR</text>
            <circle cx="156" cy="14" r="11" fill="#1d9bf0" stroke="#fff" stroke-width="2.5"/><path d="M151 14 l3.5 3.5 l6.5 -7" stroke="#fff" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/></g>`;
    }
    if (c.deco === 'star') {
        behind = `<g transform="translate(120 54) scale(.95) translate(-50 -53)" filter="url(#${id}gl)" opacity=".8"><circle cx="50" cy="53" r="40" fill="${col}"/></g><g transform="translate(120 52) scale(.98) translate(-50 -53)">${starSvg().replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>`;
    }
    if (c.deco === 'lvl') {
        behind = `<path d="M120 12 L136 30 L160 34 L143 52 L147 76 L120 64 L93 76 L97 52 L80 34 L104 30 Z" fill="${col}" stroke="#0b0e16" stroke-width="2.5"/><text x="120" y="58" text-anchor="middle" font-size="24" font-weight="900" fill="#0b0e16" font-family="Saira, sans-serif">${c.lvl}</text>`;
    }
    if (c.tag) {
        const long = c.tag.length > 8;
        front = `<g transform="translate(160 42) rotate(22)"><path d="M0 0 H58 L64 9 L58 18 H0 Z" fill="#eef0f5" stroke="#0b0e16" stroke-width="1.2"/><circle cx="57" cy="9" r="2" fill="#0b0e16"/><text x="28" y="13" text-anchor="middle" font-size="10" font-weight="800" fill="#111" font-family="Saira, sans-serif" ${long ? 'textLength="50" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(c.tag)}</text></g>`;
    }

    const r = srand(hash(c.id) + 3);
    // Promienie światła za skrzynią.
    const rays = Array.from({ length: 9 }, (_, k) => {
        const a = (-80 + k * 20 + (r() - 0.5) * 8) * Math.PI / 180, w = 0.06 + r() * 0.05, L = 150;
        const p1 = [120 + Math.sin(a - w) * L, 96 - Math.cos(a - w) * L], p2 = [120 + Math.sin(a + w) * L, 96 - Math.cos(a + w) * L];
        return `<path d="M120 96 L${p1[0].toFixed(1)} ${p1[1].toFixed(1)} L${p2[0].toFixed(1)} ${p2[1].toFixed(1)} Z" fill="${col}" opacity="${(0.08 + r() * 0.1).toFixed(2)}"/>`;
    }).join('');
    const rivets = [[52, 110], [188, 110], [55, 170], [185, 170]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="url(#${id}t)" stroke="#0b0e16" stroke-width=".8"/>`).join('');
    return `<svg class="kart" viewBox="0 0 240 200" aria-hidden="true"><defs>
        <radialGradient id="${id}r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${col}" stop-opacity=".95"/><stop offset=".55" stop-color="${col}" stop-opacity=".3"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
        <radialGradient id="${id}f" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${col}" stop-opacity=".7"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4b5573"/><stop offset=".55" stop-color="#262d40"/><stop offset="1" stop-color="#141824"/></linearGradient>
        <linearGradient id="${id}p" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#394260"/><stop offset="1" stop-color="#1b2030"/></linearGradient>
        <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#262d40"/><stop offset="1" stop-color="#465072"/></linearGradient>
        <linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${col}"/><stop offset="1" stop-color="${col}" stop-opacity=".55"/></linearGradient>
        <linearGradient id="${id}t" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4f6fb"/><stop offset=".5" stop-color="#9aa3bb"/><stop offset="1" stop-color="#4b5573"/></linearGradient>
        <filter id="${id}gl" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    </defs>
    ${rays}
    <circle cx="120" cy="96" r="96" fill="url(#${id}r)"/>
    ${sparkles(hash(c.id), 8, 16, 224, 6, 96)}
    <ellipse cx="120" cy="184" rx="104" ry="12" fill="url(#${id}f)"/>
    <ellipse cx="120" cy="182" rx="90" ry="7" fill="#000" opacity=".55"/>
    <path d="M50 100 L60 66 H180 L190 100 Z" fill="url(#${id}l)" stroke="#0b0e16" stroke-width="2"/>
    <path d="M60 66 H180" stroke="${col}" stroke-width="2" opacity=".7"/>
    ${behind}
    <path d="M42 100 H198 L190 180 H50 Z" fill="url(#${id}m)" stroke="#0b0e16" stroke-width="2"/>
    <path d="M56 112 H96 V170 H59 Z M144 112 H184 L181 170 H144 Z" fill="url(#${id}p)" stroke="#0b0e16" stroke-opacity=".6" stroke-width="1"/>
    <path d="M44 102 H196" stroke="#fff" stroke-opacity=".25" stroke-width="1.2"/>
    <rect x="36" y="94" width="168" height="12" rx="3.5" fill="url(#${id}t)" stroke="#0b0e16" stroke-width="1.5"/>
    <rect x="36" y="94" width="168" height="4" rx="2" fill="#fff" opacity=".35"/>
    <rect x="72" y="106" width="15" height="74" fill="url(#${id}s)"/><rect x="72" y="106" width="3" height="74" fill="#fff" opacity=".25"/>
    <rect x="153" y="106" width="15" height="74" fill="url(#${id}s)"/><rect x="153" y="106" width="3" height="74" fill="#fff" opacity=".25"/>
    <path d="M42 100 L50 180 M198 100 L190 180" stroke="url(#${id}t)" stroke-width="4"/>
    ${rivets}
    <rect x="104" y="108" width="32" height="34" rx="6" fill="${col}" opacity=".55" filter="url(#${id}gl)"/>
    <rect x="107" y="111" width="26" height="28" rx="5" fill="url(#${id}t)" stroke="#0b0e16" stroke-width="1.5"/>
    <circle cx="120" cy="122" r="4" fill="#141824"/><rect x="118.6" y="123" width="2.8" height="9" rx="1" fill="#141824"/>
    <circle cx="120" cy="122" r="1.4" fill="${col}"/>
    ${c.deco === 'gemtier' ? '' : `<text x="120" y="163" text-anchor="middle" font-size="9.5" font-weight="900" letter-spacing="1.8" fill="#fff" fill-opacity=".3" font-family="Saira, sans-serif">ROWER4SKINS</text>`}
    ${front}
    </svg>`;
}

// Złota gwiazdka „Rower4Skins Special” z kołem rowerowym w środku.
function starSvg(cls = '') {
    const id = 'st' + (++SID);
    const pts = (r1, r2) => Array.from({ length: 10 }, (_, k) => {
        const a = -Math.PI / 2 + k * Math.PI / 5, r = k % 2 ? r2 : r1;
        return `${(50 + Math.cos(a) * r).toFixed(1)},${(53 + Math.sin(a) * r).toFixed(1)}`;
    }).join(' ');
    const spokes = Array.from({ length: 8 }, (_, k) => { const a = k * Math.PI / 4; return `M${(Math.cos(a) * 3).toFixed(1)} ${(Math.sin(a) * 3).toFixed(1)}L${(Math.cos(a) * 11).toFixed(1)} ${(Math.sin(a) * 11).toFixed(1)}`; }).join('');
    return `<svg class="r4star ${cls}" viewBox="0 0 100 100" aria-hidden="true"><defs>
        <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff4b8"/><stop offset=".45" stop-color="#ffc41f"/><stop offset="1" stop-color="#a86300"/></linearGradient>
        <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe066"/><stop offset=".6" stop-color="#f5a300"/><stop offset="1" stop-color="#c97800"/></linearGradient>
    </defs>
        <polygon points="${pts(48, 21)}" fill="url(#${id}a)" stroke="#6b3d00" stroke-width="2.2" stroke-linejoin="round"/>
        <polygon points="${pts(39, 17)}" fill="url(#${id}b)" stroke="#fff3c4" stroke-opacity=".75" stroke-width="1.4" stroke-linejoin="round"/>
        <g transform="translate(50 55)" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><circle r="13"/><circle r="15.5" stroke-width="1.2" stroke-opacity=".6"/><path d="${spokes}" stroke-width="1.6"/><circle r="2.8" fill="#fff"/></g>
        <path d="M30 30 L42 27 L36 36 Z" fill="#fff" opacity=".45"/>
    </svg>`;
}

const starCard = (cls = 'ritem') => `<div class="icard ${cls} star-card" style="--rc:#ffc41f"><div class="iart">${starSvg()}</div><div class="iw">Rare item</div><div class="in" translate="no">Rower4Skins Special</div><div class="ip">★★★</div></div>`;

function bikeArt(color) {
    return `<svg viewBox="0 0 64 40" class="bart" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="28" r="10"/><circle cx="51" cy="28" r="10"/><path d="M13 28 22 10h19l10 18M22 10l11 18h18M19 5h7M38 5h7"/></svg>`;
}

function avatar(p, cls = '') {
    if (!p) return `<span class="ava ava-empty ${cls}">${ic('plus')}</span>`;
    const name = (p.you ? state.name : p.name) || '?';
    const color = p.you ? state.color : p.color || `hsl(${hash(p.name || '?') % 360} 70% 55%)`;
    const letter = name.replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase() || '?';
    return `<span class="ava ${cls}" style="--a:${color}">${esc(letter)}</span>`;
}

const me = () => ({ you: true });

// ============================================================
// Karty
// ============================================================

function itemCard(s, { cls = '', attrs = '', top = '', bottom = '', wear = '' } = {}) {
    return `<div class="icard ${cls}" style="--rc:${RAR[s.rarity].c}" ${attrs}>
        ${top}${wear ? `<span class="wear" title="${WEAR_NAME[wear]}">${wear}</span>` : ''}
        <div class="iart">${art(s)}</div>
        <div class="iw" translate="no">${esc(s.weapon)}</div>
        <div class="in" translate="no">${esc(s.name)}</div>
        <div class="ip">${money(s.price)}</div>
        ${bottom}
    </div>`;
}

function priceLabel(c) {
    if (c.currency === 'gems') return `<span class="gemprice">${ic('gem')}${c.gems}</span>`;
    if (c.currency === 'free') return 'DARMOWA';
    return money(c.price);
}

function caseCard(c, extra = '') {
    const fav = state.favs.includes(c.id);
    return `<div class="ccard" data-act="go" data-arg="#/case/${c.id}" style="--cc:${c.color}">
        <button class="cfav ${fav ? 'on' : ''}" data-act="fav" data-arg="${c.id}" aria-label="Ulubione">${ic('heart')}</button>
        ${c.badge ? `<span class="cbadge">${c.badge}</span>` : ''}
        <div class="cart">${caseArt(c)}</div>
        <div class="cfoot"><span class="cname">${esc(c.name)}</span><span class="cprice">${priceLabel(c)}</span></div>
        ${extra}
    </div>`;
}

// ============================================================
// Toasty, modale
// ============================================================

function toast(msg, kind = '') {
    const el = document.createElement('div');
    el.className = `toast ${kind}`;
    el.textContent = msg;
    $('#toasts').appendChild(el);
    setTimeout(() => el.remove(), 3500);
}

function modal(html, cls = '') {
    stopGame();
    $('#modalBox').className = 'modal ' + cls;
    $('#modalBox').innerHTML = `<button class="mclose" data-act="modalclose" aria-label="Zamknij">${ic('x')}</button>` + html;
    $('#modal').hidden = false;
}

function closeModal() { stopGame(); $('#modal').hidden = true; }

$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keyup', e => { if (MG?.keyup) MG.keyup(e); });
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); $('#drawer').hidden = true; return; }
    if (MG?.key && !$('#modal').hidden) MG.key(e);
});

let winUids = [];

function confetti() {
    const box = document.createElement('div');
    box.className = 'confetti';
    const cols = ['#a54ef2', '#45d15b', '#ffc41f', '#1fa3ef', '#ff4d5e', '#fff'];
    box.innerHTML = Array.from({ length: 90 }, () => {
        const x = Math.random() * 100, d = 1.6 + Math.random() * 1.6, dl = Math.random() * 0.5, r = Math.random() * 720 - 360;
        return `<i style="left:${x}%;background:${pick(cols)};animation-duration:${d}s;animation-delay:${dl}s;--r:${r}deg;--dx:${Math.random() * 160 - 80}px"></i>`;
    }).join('');
    document.body.appendChild(box);
    setTimeout(() => box.remove(), 3800);
}

function showWin(ids, uids, title, reopen = false, star = false) {
    winUids = uids;
    const total = round2(ids.reduce((s, id) => s + SKIN[id].price, 0));
    const big = star || ids.some(id => ['covert', 'gold'].includes(SKIN[id].rarity));
    winSound(big);
    if (big) confetti();
    modal(`<h2 class="mtitle">${title}</h2>
        <div class="win-items ${ids.length > 4 ? 'many' : ''}">${ids.map(id => itemCard(SKIN[id], { cls: 'glow' })).join('')}</div>
        <div class="win-total">Łączna wartość: <b>${money(total)}</b></div>
        <div class="mrow">
            <button class="btn btn-green" data-act="winsell">${ic('wallet')}Sprzedaj za ${money(total)}</button>
            <button class="btn btn-purple" data-act="modalclose">${ic('check')}Zatrzymaj</button>
            ${reopen ? `<button class="btn btn-dark" data-act="reopen">${ic('refresh')}Otwórz ponownie</button>` : ''}
        </div>`, (big ? 'big-win' : '') + (star ? ' star-win' : ''));
}

// ============================================================
// Nagłówek, pasek dropów, podpasek
// ============================================================

const NAV = [
    ['event', '#/event', 'star', 'Event'],
    ['home', '#/', 'box', 'Skrzynki'],
    ['gems', '#/gems', 'gem', 'Gemy'],
    ['battles', '#/battles', 'swords', 'Bitwy'],
    ['contract', '#/contract', 'doc', 'Kontrakt'],
    ['exchanger', '#/exchanger', 'swap', 'Wymiennik'],
];

function renderShell() {
    $('#top').innerHTML = `
        <a class="logo" data-act="go" data-arg="#/" href="#/"><img class="logo-img" src="${IMG.logo}" alt="Rower4Skins — twoje skórki rowerowe"></a>
        <nav class="nav" id="nav">${NAV.map(([k, h, i, t]) => `<a data-act="go" data-arg="${h}" data-nav="${k}" href="${h}">${ic(i)}${t}</a>`).join('')}<a class="only-sm" data-act="notes" href="#/">${ic('bell')}Powiadomienia</a></nav>
        <div class="tr">
            <button class="pill gem-pill" title="Skrzynki za gemy" data-act="go" data-arg="#/gems">${ic('gem')}<span id="tGems"></span></button>
            <div class="wallet-group">
                <div class="pill money-pill" title="Saldo">${ic('wallet')}<span id="tBal"></span></div>
                <button class="btn-dep" data-act="depositModal">${ic('bike')}WPŁAĆ <small>+10%</small></button>
            </div>
            <button class="sq bell" data-act="notes" aria-label="Powiadomienia">${ic('bell')}<i id="tUnread" class="dot" hidden></i></button>
            <button class="sq hide-sm" data-act="go" data-arg="#/profile/settings" aria-label="Ustawienia">${ic('gear')}</button>
            <button class="ava-btn" data-act="go" data-arg="#/profile" aria-label="Profil"><span id="tAva"></span><span class="lvl" id="tLvl"></span></button>
            <button class="sq burger" data-act="burger" aria-label="Menu">${ic('menu')}</button>
        </div>`;

    $('#dropsbar').innerHTML = `
        <div class="d-side">
            <div class="online" title="Gracze z otwartą stroną">${ic('users')}<b id="online">1</b></div>
            <div class="d-modes">
                <button data-act="dmode" data-arg="all" class="on" aria-label="Wszystkie dropy">${ic('grid')}</button>
                <button data-act="dmode" data-arg="top" aria-label="Najlepsze dropy">${ic('crown')}</button>
            </div>
        </div>
        <div class="promos">
            <div class="promo-tile p1" data-act="go" data-arg="#/event"><small>Nowość!</small><b>PRZEPUSTKA URODZINOWA</b><span class="pbtn y">ZOBACZ</span></div>
            <div class="promo-tile p2" data-act="go" data-arg="#/free"><b>DARMOWE<br>PREZENTY</b><span class="pbtn w">ODBIERZ</span></div>
        </div>
        <button class="hide-tab" data-act="hideDrops">UKRYJ</button>
        <div class="d-track" id="dTrack"></div>`;

    $('#subbar').innerHTML = `<div class="wrap">
        <button class="sublink y" data-act="promoModal">${ic('gift')}KOD PROMOCYJNY</button>
        <button class="sublink" data-act="go" data-arg="#/free">${ic('star')}CODZIENNA SKRZYNKA</button>
        <button class="sublink g" data-act="go" data-arg="#/gems">${ic('gem')}SKRZYNKI ZA GEMY</button>
        <button class="sublink" data-act="go" data-arg="#/free">${ic('box')}SKRZYNKI EXP</button>
        <button class="sublink hide-sm" data-act="go" data-arg="#/destiny">${ic('target')}PRZEZNACZENIE</button>
        <span class="sub-note">${ic('shield')}Symulator · wirtualne monety</span>
    </div>`;
}

function renderTop() {
    if (!$('#tBal')) return;
    $('#tBal').textContent = money(state.balance);
    $('#tGems').textContent = state.gems;
    $('#tLvl').textContent = level();
    $('#tAva').innerHTML = avatar(me());
    $('#tUnread').hidden = !state.unread;
    $('#tUnread').textContent = state.unread > 9 ? '9+' : state.unread;
    $('#itemsTab').innerHTML = `${ic('box')}TWOJE PRZEDMIOTY <b>${state.inv.length}</b>`;
}

let drops = [];
let dropMode = 'all';

function pushDrop(id, user, mine = false, caseId = null) {
    drops.unshift({ id, user, mine, c: caseId, st: Math.random() < 0.12 });
    if (mine) {
        // Pokaż mój drop kolegom w pasku LIVE (kilka ostatnich naraz).
        const t = Date.now();
        const items = lastDrops && t - lastDrops.t < 1500 ? [[id, caseId || ''], ...lastDrops.items].slice(0, 6) : [[id, caseId || '']];
        lastDrops = { t, items };
        clearTimeout(pushDrop.tm);
        pushDrop.tm = setTimeout(publish, 400);
    }
    drops.length = Math.min(drops.length, 80);
    renderDrops(true);
}

function renderDrops(animate) {
    const list = drops.filter(d => dropMode === 'all' || SKIN[d.id].price >= 10).slice(0, 30);
    $('#dTrack').innerHTML = list.map((d, i) => {
        const s = SKIN[d.id];
        const c = d.c && CASE[d.c];
        const link = c ? `data-act="go" data-arg="#/case/${c.id}"` : '';
        const star = c && c.rare.has(d.id);
        return `<div translate="no" class="dtile ${d.mine ? 'mine' : ''} ${c ? 'has-case' : ''} ${star ? 'star' : ''} ${animate && i === 0 ? 'new' : ''}" ${link} style="--rc:${star ? '#ffc41f' : RAR[s.rarity].c}" title="${esc(s.weapon)} | ${esc(s.name)} — ${money(s.price)} · ${esc(d.user)}${c ? ` · z: ${esc(c.name)}` : ''}">
            ${star ? '<span class="dstar">★</span>' : d.st ? '<span class="st">ST</span>' : ''}${art(s)}${c ? `<span class="dcase">${caseArt(c)}</span>` : ''}
            <span class="dname" translate="no">${esc(s.name)}</span><span class="duser" translate="no">${esc(d.user)}</span>
        </div>`;
    }).join('');
}

function botDropLoop() {
    const c = pick(USD_CASES);
    pushDrop(roll(c), pick(BOT_NAMES), false, c.id);
    setTimeout(botDropLoop, 1800 + Math.random() * 3200);
}

// ============================================================
// Ruletka (poziomo przy 1 skrzynce, pionowo przy kilku)
// ============================================================

const STRIP_LEN = 60, WIN_AT = 52, GAP = 6;

const reelHtml = (vertical, cls = '') => `<div class="reel ${vertical ? 'v' : 'h'} ${cls}"><div class="marker"></div><div class="strip"></div></div>`;

// phase2 = druga ruletka po gwiazdce: tylko rzadkie przedmioty.
function fillReel(reel, c, winner, phase2 = false) {
    const pickOne = () => {
        if (!phase2) return roll(c);
        let r = Math.random() * c.rareTotal;
        for (const [id, w] of c.rareItems) { r -= w; if (r < 0) return id; }
        return c.rareItems[c.rareItems.length - 1][0];
    };
    const ids = Array.from({ length: STRIP_LEN }, pickOne);
    if (winner) ids[WIN_AT] = winner;
    const strip = reel.querySelector('.strip');
    strip.innerHTML = ids.map(id => (!phase2 && c.rare?.has(id) ? starCard() : itemCard(SKIN[id], { cls: 'ritem' + (phase2 ? ' rare' : '') }))).join('');
    return strip;
}

function reelGeom(reel, strip) {
    const v = reel.classList.contains('v');
    const first = strip.children[0];
    const size = (v ? first.offsetHeight : first.offsetWidth) + GAP;
    const view = v ? reel.clientHeight : reel.clientWidth;
    return { v, size, view, at: idx => -(idx * size) + view / 2 - (size - GAP) / 2 };
}

const setPos = (strip, v, p) => { strip.style.transform = v ? `translateY(${p}px)` : `translateX(${p}px)`; };

function idleReel(reel, c) {
    if (!reel || !reel.isConnected) return;
    const strip = fillReel(reel, c);
    const g = reelGeom(reel, strip);
    strip.style.transition = 'none';
    setPos(strip, g.v, g.at(8));
}

// Przewija pasek do pozycji WIN_AT, z tykaniem przy każdym przedmiocie.
async function runStrip(reel, strip, dur, ticking) {
    const g = reelGeom(reel, strip);
    strip.style.transition = 'none';
    setPos(strip, g.v, g.at(8));
    strip.getBoundingClientRect();
    const jitter = (Math.random() - 0.5) * (g.size - GAP - 20);
    strip.style.transition = `transform ${dur}ms cubic-bezier(.1,.75,.12,1)`;
    setPos(strip, g.v, g.at(WIN_AT) + jitter);
    if (ticking && state.settings.sound) {
        let last = -1;
        const end = performance.now() + dur;
        const loop = () => {
            const m = new DOMMatrixReadOnly(getComputedStyle(strip).transform);
            const pos = g.v ? m.m42 : m.m41;
            const idx = Math.floor((g.view / 2 - pos) / g.size);
            if (idx !== last) { if (last >= 0) beep(1700, 0.02, 0.025); last = idx; }
            if (performance.now() < end) requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }
    await sleep(dur + 60);
    return strip.children[WIN_AT];
}

const STAR_PAUSE = 1300;
const star2Dur = dur => Math.min(dur, 3400);
// Całkowity czas kręcenia (z gwiazdką dłużej) — potrzebny, gdy ruletka nie jest widoczna.
const spinTotal = (c, winner, dur) => dur + 60 + (c.rare?.has(winner) ? STAR_PAUSE + star2Dur(dur) + 60 : 0);

async function spinReel(reel, c, winner, dur, ticking) {
    const star = c.rare?.has(winner);
    if (!reel || !reel.isConnected) { await sleep(spinTotal(c, winner, dur)); return; }
    const hit = await runStrip(reel, fillReel(reel, c, winner), dur, ticking);
    hit?.classList.add('hit');
    if (!star) { if (ticking) dropSound(SKIN[winner]); return; }
    // Gwiazdka! Animacja, specjalny dźwięk, potem druga ruletka z samymi rzadkimi.
    hit?.classList.add('star-hit');
    reel.classList.add('star-mode');
    starSound();
    starBurst(reel);
    await sleep(STAR_PAUSE);
    if (!reel.isConnected) { await sleep(star2Dur(dur) + 60); return; }
    const hit2 = await runStrip(reel, fillReel(reel, c, winner, true), star2Dur(dur), true);
    hit2?.classList.add('hit', 'rare-hit');
    rareSound();
}

// Rozbłysk złotych gwiazdek nad ruletką.
function starBurst(reel) {
    const box = document.createElement('div');
    box.className = 'star-burst';
    box.innerHTML = '<div class="sb-glow"></div>' + Array.from({ length: 18 }, (_, k) => {
        const a = k / 18 * Math.PI * 2, d = 90 + Math.random() * 110;
        return `<i style="--dx:${(Math.cos(a) * d).toFixed(0)}px;--dy:${(Math.sin(a) * d * 0.6).toFixed(0)}px;animation-delay:${(Math.random() * 0.15).toFixed(2)}s">★</i>`;
    }).join('') + `<div class="sb-label"><small>RARE ITEM</small><b translate="no">ROWER4SKINS SPECIAL</b></div>`;
    reel.appendChild(box);
    setTimeout(() => box.remove(), STAR_PAUSE + 200);
}

const spinDur = () => (state.settings.fast ? 1500 : 5200);

// ============================================================
// Router
// ============================================================

let route = { name: 'home', arg: null };

function go(path) {
    const [, name = '', arg = null] = (path || '#/').split('/');
    route = { name: name || 'home', arg };
    $('#top').classList.remove('open');
    $('#drawer').hidden = true;
    renderPage();
    window.scrollTo(0, 0);
}

const PAGES = {
    home: { r: renderHome, nav: 'home' },
    case: { r: renderCase, nav: 'home', after: layoutReels },
    battles: { r: renderBattles, nav: 'battles' },
    create: { r: renderCreate, nav: 'battles' },
    battle: { r: renderBattleView, nav: 'battles', after: afterBattleView },
    contract: { r: renderContract, nav: 'contract' },
    exchanger: { r: renderExchanger, nav: 'exchanger' },
    destiny: { r: renderDestiny, nav: '' },
    profile: { r: renderProfile, nav: '' },
    free: { r: renderFree, nav: 'home' },
    gems: { r: renderGems, nav: 'gems' },
    event: { r: renderEvent, nav: 'event' },
};

function renderPage() {
    const p = PAGES[route.name] || PAGES.home;
    const html = p.r();
    if (html == null) return;
    $('#app').innerHTML = html;
    $$('.nav a').forEach(a => a.classList.toggle('active', a.dataset.nav === p.nav));
    p.after?.();
    tick();
}

// ============================================================
// Strona główna
// ============================================================

const filt = { fav: false, sort: 'def', min: '', max: '', q: '', afford: false };

function featTile(title, act, arg, artHtml) {
    return `<div class="ftile" data-act="${act}" ${arg ? `data-arg="${arg}"` : ''}><span>${title}</span><div class="fart">${artHtml}</div></div>`;
}

const TROPHY = `<svg viewBox="0 0 120 80" aria-hidden="true"><defs><linearGradient id="tg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fde68a"/><stop offset=".5" stop-color="#f59e0b"/><stop offset="1" stop-color="#92400e"/></linearGradient></defs>
    <g stroke="#451a03" stroke-width="1.5"><path d="M18 14 H50 V28 Q50 44 34 46 Q18 44 18 28 Z" fill="url(#tg)"/><path d="M18 18 H10 Q8 32 20 34 M50 18 H58 Q60 32 48 34" fill="none" stroke="#f59e0b" stroke-width="3"/><rect x="30" y="46" width="8" height="12" fill="url(#tg)"/><rect x="22" y="58" width="24" height="8" rx="2" fill="#78350f"/></g>
    <g stroke="#451a03" stroke-width="1.5" transform="translate(48 -6) scale(1.15)"><path d="M18 14 H50 V28 Q50 44 34 46 Q18 44 18 28 Z" fill="url(#tg)"/><path d="M18 18 H10 Q8 32 20 34 M50 18 H58 Q60 32 48 34" fill="none" stroke="#f59e0b" stroke-width="3"/><rect x="30" y="46" width="8" height="12" fill="url(#tg)"/><rect x="22" y="58" width="24" height="8" rx="2" fill="#78350f"/></g></svg>`;

const ORBS = `<svg viewBox="0 0 120 80" aria-hidden="true"><defs><radialGradient id="og" cx=".35" cy=".3" r=".7"><stop offset="0" stop-color="#f5d0fe"/><stop offset=".4" stop-color="#a855f7"/><stop offset="1" stop-color="#3b0764"/></radialGradient></defs>
    <path d="M30 70 L44 50 M60 70 L46 50 M70 72 L84 44 M100 72 L86 44" stroke="#b45309" stroke-width="4" stroke-linecap="round"/>
    <circle cx="45" cy="38" r="18" fill="url(#og)"/><circle cx="85" cy="30" r="24" fill="url(#og)"/><circle cx="79" cy="22" r="5" fill="#fff" opacity=".6"/><circle cx="40" cy="32" r="4" fill="#fff" opacity=".6"/></svg>`;

function bannerHtml() {
    const r = srand(7);
    const cols = ['#f472b6', '#facc15', '#60a5fa', '#34d399', '#f87171', '#c084fc'];
    const confetti = Array.from({ length: 70 }, () => {
        const x = (r() * 1500).toFixed(0), y = (r() * 250).toFixed(0);
        return `<rect x="${x}" y="${y}" width="${(4 + r() * 6).toFixed(0)}" height="${(8 + r() * 8).toFixed(0)}" fill="${cols[Math.floor(r() * cols.length)]}" transform="rotate(${(r() * 180).toFixed(0)} ${x} ${y})" opacity=".8"/>`;
    }).join('');
    const balloons = [[90, 70, '#f87171'], [190, 40, '#60a5fa'], [300, 90, '#facc15'], [1180, 50, '#34d399'], [1290, 90, '#f472b6'], [1400, 40, '#c084fc']]
        .map(([x, y, col]) => `<path d="M${x} ${y + 44} Q${x - 8} ${y + 90} ${x + 4} ${y + 140}" stroke="#fff" stroke-opacity=".5" fill="none"/><ellipse cx="${x}" cy="${y}" rx="32" ry="40" fill="${col}"/><ellipse cx="${x - 10}" cy="${y - 14}" rx="8" ry="12" fill="#fff" opacity=".35"/><path d="M${x - 5} ${y + 40} L${x + 5} ${y + 40} L${x} ${y + 47} Z" fill="${col}"/>`).join('');
    return `<div class="banner">
        <svg class="banner-bg" viewBox="0 0 1500 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".55" stop-color="#6d28d9"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
            <rect width="1500" height="250" fill="url(#sky)"/>
            <circle cx="750" cy="250" r="190" fill="#fbbf24" opacity=".35"/>
            <path d="M0 210 Q200 160 400 200 T800 190 T1200 200 T1500 180 V250 H0 Z" fill="#1e1b4b" opacity=".75"/>
            <path d="M0 235 Q300 215 750 230 T1500 225 V250 H0 Z" fill="#0f0b2e"/>
            ${confetti}${balloons}
        </svg>
        <img class="banner-bike l" src="${IMG.engwe}" alt="" aria-hidden="true">
        <img class="banner-bike r" src="${IMG.gt73}" alt="" aria-hidden="true">
        <div class="banner-content">
            <div class="banner-title"><span class="t1">ROWEROWE</span><span class="t2">URODZINY</span></div>
            <div class="cd-row">
                <div class="countdown" data-cd="event"></div>
                <button class="btn-join" data-act="go" data-arg="#/event">DOŁĄCZ ${ic('chev', 'rot')}</button>
            </div>
            <div class="banner-hint">SPRÓBUJ ZNALEŹĆ UKRYTĄ SKRZYNKĘ NA BANERZE!</div>
        </div>
        ${state.hiddenFound ? '' : `<button class="hidden-case" data-act="hidden" aria-label="Ukryta skrzynka">${caseArt(CASE.hidden)}</button>`}
    </div>`;
}

function renderHome() {
    return `
    <div class="tiles3">
        ${featTile('SKRZYNKI ZA GEMY', 'go', '#/gems', caseArt(CASE['gt-ultimate']))}
        ${featTile('PRZEZNACZENIE', 'go', '#/destiny', ORBS)}
        ${featTile('RANKING', 'ranking', '', TROPHY)}
    </div>
    ${bannerHtml()}
    <div class="filters">
        <button class="fbtn ${filt.fav ? 'on' : ''}" data-act="ffav" aria-label="Tylko ulubione">${ic('heart')}</button>
        <div class="select"><select id="fSort" data-ch="fsort" aria-label="Sortowanie">
            <option value="def">Sortuj</option><option value="pa" ${filt.sort === 'pa' ? 'selected' : ''}>Cena rosnąco</option><option value="pd" ${filt.sort === 'pd' ? 'selected' : ''}>Cena malejąco</option><option value="az" ${filt.sort === 'az' ? 'selected' : ''}>Nazwa A–Z</option>
        </select>${ic('chev')}</div>
        <div class="range"><input id="fMin" data-in="fmin" inputmode="decimal" placeholder="${money(0)}" value="${esc(filt.min)}" aria-label="Cena od"><span>–</span><input id="fMax" data-in="fmax" inputmode="decimal" placeholder="${money(0)}" value="${esc(filt.max)}" aria-label="Cena do"></div>
        <label class="search">${ic('search')}<input id="fQ" data-in="fq" placeholder="Nazwa skrzynki" value="${esc(filt.q)}"></label>
        <label class="toggle"><input id="fAff" type="checkbox" data-ch="faff" ${filt.afford ? 'checked' : ''}><span></span>Wystarczające saldo</label>
    </div>
    <div id="caseSections">${sectionsHtml()}</div>`;
}

function sectionsHtml() {
    // Filtr kwot jest w walucie wyświetlania — przelicz na dolary.
    const min = parseFloat(filt.min.replace(',', '.')) / curr().r, max = parseFloat(filt.max.replace(',', '.')) / curr().r;
    const q = filt.q.trim().toLowerCase();
    const gem = c => c.currency === 'gems';
    // Skrzynki za gemy nie mają ceny w $, więc filtry kwot ich nie dotyczą.
    const ok = c => (!filt.fav || state.favs.includes(c.id)) && (!q || c.name.toLowerCase().includes(q))
        && (gem(c) || ((isNaN(min) || c.price >= min) && (isNaN(max) || c.price <= max)))
        && (!filt.afford || (gem(c) ? c.gems <= state.gems : c.price <= state.balance));
    const cost = c => (gem(c) ? c.gems / 100 : c.price);
    const sorters = { pa: (a, b) => cost(a) - cost(b), pd: (a, b) => cost(b) - cost(a), az: (a, b) => a.name.localeCompare(b.name, 'pl') };
    const html = SECTIONS.map(sec => {
        let list = CASES.filter(c => c.sec === sec.id && ok(c));
        if (sec.id === 'gems') list.sort((a, b) => a.gems - b.gems);
        if (sorters[filt.sort]) list = [...list].sort(sorters[filt.sort]);
        if (!list.length) return '';
        return `<div class="sec-title">${ic(sec.icon)}<span>${sec.title}</span></div><div class="cgrid">${list.map(c => caseCard(c)).join('')}</div>`;
    }).join('');
    return html || `<div class="empty">${ic('search')}<p>Żadna skrzynka nie pasuje do filtrów.</p></div>`;
}

const refreshSections = () => { const el = $('#caseSections'); if (el) el.innerHTML = sectionsHtml(); };

// ============================================================
// Strona skrzynki
// ============================================================

let cur = null, qty = 1, busy = false;

function lockReason(c) {
    if (c.kind === 'daily' && Date.now() - state.daily < 864e5) return `Następna darmowa skrzynka za <b data-cool="daily">${fmtDur(864e5 - (Date.now() - state.daily))}</b>`;
    if (c.kind === 'exp') {
        if (level() < c.lvl) return `Wymagany poziom ${c.lvl} (masz ${level()})`;
        const used = state.expUsed[c.id] || 0;
        if (Date.now() - used < 864e5) return `Ponownie za ${fmtDur(864e5 - (Date.now() - used))}`;
    }
    if (c.kind === 'hidden') {
        if (!state.hiddenFound) return 'Najpierw znajdź tę skrzynkę na banerze na stronie głównej.';
        if (state.hiddenUsed) return 'Ta skrzynka została już otwarta.';
    }
    return '';
}

function openLabel(c) {
    if (c.currency === 'gems') return `OTWÓRZ ZA ${c.gems} GEMÓW`;
    if (c.currency === 'free') return 'OTWÓRZ ZA DARMO';
    return `OTWÓRZ ${qty}X — ${money(round2(c.price * qty))}`;
}

function renderCase() {
    const c = CASE[route.arg];
    if (!c) { go('#/'); return null; }
    if (cur !== c) { cur = c; if (c.currency !== 'usd') qty = 1; }
    const lock = lockReason(c);
    const sorted = [...c.items].sort((a, b) => a[1] - b[1] || SKIN[b[0]].price - SKIN[a[0]].price);
    return `<div class="case-page" style="--cc:${c.color}">
        <button class="back" data-act="go" data-arg="${c.currency === 'free' ? '#/free' : '#/'}">${ic('back')}Wróć</button>
        <div class="case-top">
            <div class="case-art-big">${caseArt(c)}</div>
            <h1>${esc(c.name)}</h1>
            <div class="case-meta">${c.items.length} przedmiotów · ${c.currency === 'usd' ? `średni drop ${money(c.ev)}` : c.currency === 'gems' ? 'płacisz gemami' : 'darmowa'}</div>
        </div>
        <div id="reels" class="reels"></div>
        <div class="open-bar">
            ${c.currency === 'usd' ? `<div class="seg">${[1, 2, 3, 4, 5].map(n => `<button class="${n === qty ? 'on' : ''}" data-act="qty" data-arg="${n}">${n}x</button>`).join('')}</div>` : ''}
            <button class="btn btn-green btn-xl" id="openBtn" data-act="open" ${lock || busy ? 'disabled' : ''}>${openLabel(c)}</button>
            <button class="btn btn-dark" id="demoBtn" data-act="demo" ${busy ? 'disabled' : ''}>${ic('eye')}Demo</button>
            <label class="toggle"><input type="checkbox" id="fastOpen" data-ch="fast" ${state.settings.fast ? 'checked' : ''}><span></span>Szybkie otwieranie</label>
        </div>
        ${lock ? `<div class="lock-note">${ic('lock')}<span>${lock}</span></div>` : ''}
        ${c.rare.size ? `<div class="star-info">${starSvg('sm')}<div><b>Rare item Special</b><span>Przedmioty z gwiazdką to rzadkie dropy (łącznie ${(c.rareTotal / c.total * 100).toFixed(2)}% szans). Na ruletce pokazują się jako złota gwiazdka — gdy się zatrzyma, kręci się druga ruletka tylko z nich.</span></div></div>` : ''}
        <div class="sec-title">${ic('box')}<span>Zawartość skrzynki</span></div>
        <div class="igrid">${sorted.map(([id]) => { const ch = chanceOf(c, id); return itemCard(SKIN[id], { cls: c.rare.has(id) ? 'is-rare' : '', top: `${c.rare.has(id) ? `<span class="rstar" title="Rare item Special">${starSvg()}</span>` : ''}<span class="chance">${ch.toFixed(ch < 0.01 ? 4 : ch < 0.1 ? 3 : 2)}%</span>` }); }).join('')}</div>
    </div>`;
}

function layoutReels() {
    const el = $('#reels');
    if (!el || busy) return;
    el.className = 'reels' + (qty > 1 ? ' multi' : '');
    el.innerHTML = Array.from({ length: qty }, () => reelHtml(qty > 1)).join('');
    $$('.reel', el).forEach(r => idleReel(r, cur));
}

function updateOpenBar() {
    const b = $('#openBtn');
    if (!b || !cur) return;
    b.textContent = openLabel(cur);
    b.disabled = busy || !!lockReason(cur);
    const d = $('#demoBtn');
    if (d) d.disabled = busy;
}

async function openCase(demo) {
    const c = cur;
    if (busy || !c) return;
    const n = c.currency === 'usd' ? qty : 1;
    if (!demo) {
        if (lockReason(c)) return;
        if (c.currency === 'usd') {
            const cost = round2(c.price * n);
            if (state.balance < cost) { toast('Za mało środków. Wpłać rower!', 'err'); return; }
            wallet(-cost, `Skrzynka ${c.name} ×${n}`);
            spend(cost);
        } else if (c.currency === 'gems') {
            if (state.gems < c.gems) { toast(`Potrzebujesz ${c.gems} gemów.`, 'err'); return; }
            state.gems -= c.gems;
        } else if (c.kind === 'daily') state.daily = Date.now();
        else if (c.kind === 'exp') state.expUsed[c.id] = Date.now();
        else if (c.kind === 'hidden') state.hiddenUsed = true;
        save();
        renderTop();
    }
    busy = true;
    updateOpenBar();
    const winners = Array.from({ length: n }, () => roll(c));
    const reels = $$('#reels .reel');
    await Promise.all(winners.map((w, i) => spinReel(reels[i], c, w, spinDur(), i === 0)));
    busy = false;
    const starN = winners.filter(w => c.rare.has(w)).length;
    if (demo) {
        const s = SKIN[winners[0]];
        toast(`Demo: wylosowałbyś ${s.weapon} | ${s.name} (${money(s.price)})`);
        if (starN) toast('★ Gwiazdka Rower4Skins Special!');
    } else {
        const uids = giveItems(winners, `Skrzynka ${c.name}`);
        state.stats.opened += n;
        state.stats.stars += starN;
        save();
        winners.forEach(w => pushDrop(w, state.name, true, c.id));
        showWin(winners, uids, starN ? '★ Rower4Skins Special!' : n > 1 ? 'Twoje dropy!' : 'Twój drop!', c.currency !== 'free', starN > 0);
    }
    updateOpenBar();
    if (!demo && route.name === 'case' && c.currency === 'free') {
        if (!$('.lock-note')) $('.open-bar')?.insertAdjacentHTML('afterend', `<div class="lock-note">${ic('lock')}<span>${lockReason(c)}</span></div>`);
    }
}

// ============================================================
// Sieć: pokój na żywo (claude.use("room")) — gracze, bitwy, dropy
// ============================================================

// Moja obecność w pokoju (presence) niesie: nick, kolor, poziom, bitwę, którą hostuję,
// miejsce, które zajmuję w cudzej bitwie, i ostatnie dropy. Host jest źródłem prawdy o swojej bitwie;
// wynik liczy każdy u siebie z tego samego ziarna (seed), więc wszyscy widzą to samo.
const NET = { room: null, me: 'me', peers: [], connected: false };
let MYB = null;          // bitwa, którą hostuję
let SEAT = null;         // { h: peer hosta, b: id bitwy, i: miejsce }
const KNOWN = new Map(); // bid -> ostatnio widziana bitwa
const RUN = new Map();   // bid -> przebieg bitwy (animacja + wynik)
const dropSeen = new Map();
let lastDrops = null;

const bid = b => b.host + '.' + b.id;
const myBattle = () => (MYB ? { ...MYB, host: NET.me, bid: NET.me + '.' + MYB.id } : null);
const bValue = b => round2(b.cases.reduce((s, id) => s + CASE[id].price, 0));
const botPlayer = () => ({ peer: '', nick: pick(BOT_NAMES), bot: true, color: '' });
const mySlot = () => ({ peer: NET.me, nick: state.name, color: state.color, bot: false });
const cleanNick = v => String(v ?? '').replace(/[\u0000-\u001f\u007f<>]/g, '').trim().slice(0, 16) || 'Gracz';
const cleanColor = v => (/^#[0-9a-f]{6}$/i.test(String(v)) ? v : '');
const isMeSlot = s => !!s && !s.bot && s.peer === NET.me;

function packBattle(b) {
    return { id: b.id, mode: b.mode, players: b.players, cases: b.cases, status: b.status, seed: b.seed || 0, t: b.t,
        slots: b.slots.map(s => (s ? { peer: s.peer, nick: s.nick, color: s.color, bot: s.bot } : null)) };
}

// Dane od innych graczy są niezaufane: sprawdzamy każde pole.
function parseBattle(raw, host) {
    if (!raw || typeof raw !== 'object') return null;
    const { id, mode, players, cases, slots, status, seed, t } = raw;
    if (typeof id !== 'string' || !/^[a-z0-9]{1,12}$/.test(id)) return null;
    if (!MODES[mode] || ![2, 3, 4].includes(players)) return null;
    if (!Array.isArray(cases) || !cases.length || cases.length > 20 || !cases.every(c => typeof c === 'string' && CASE[c]?.currency === 'usd')) return null;
    if (!Array.isArray(slots) || slots.length !== players) return null;
    if (!['waiting', 'running'].includes(status) || !Number.isSafeInteger(seed)) return null;
    const b = {
        id, mode, players, cases: [...cases], status, seed, t: Number(t) || 0, host,
        slots: slots.map(s => (s && typeof s === 'object' ? { peer: String(s.peer ?? '').slice(0, 80), nick: cleanNick(s.nick), color: cleanColor(s.color), bot: !!s.bot } : null)),
    };
    b.bid = bid(b);
    return b;
}

function myPresence() {
    return { v: 2, nick: cleanNick(state.name), color: state.color, lvl: level(),
        host: MYB ? packBattle(MYB) : null, seat: SEAT, drop: lastDrops };
}

function publish() {
    if (NET.room) NET.room.presence(myPresence()).catch(() => {});
}

// Wszystkie bitwy widoczne teraz: moja + bitwy innych graczy + te, które jeszcze się odgrywają.
function allBattles() {
    const out = new Map();
    if (MYB) { const m = myBattle(); out.set(m.bid, m); }
    for (const p of NET.peers) {
        if (p.peer === NET.me) continue;
        const b = parseBattle(p.presence?.host, p.peer);
        if (b) out.set(b.bid, b);
    }
    for (const [k, r] of RUN) if (!out.has(k) && !r.gone) out.set(k, r.b);
    return [...out.values()].sort((a, b) => b.t - a.t);
}

const findBattle = id => allBattles().find(b => b.bid === id) || KNOWN.get(id) || null;

function onRoom(change) {
    NET.peers = change.peers.filter(p => p.kind === 'viewer');
    const online = $('#online');
    if (online) online.textContent = NET.peers.length;

    // dropy innych graczy do paska LIVE
    for (const p of NET.peers) {
        if (p.isMe) continue;
        const d = p.presence?.drop;
        if (!d || typeof d !== 'object' || !Number.isFinite(d.t)) continue;
        const seen = dropSeen.get(p.peer);
        dropSeen.set(p.peer, d.t);
        if (seen === undefined || d.t <= seen || !Array.isArray(d.items)) continue;
        for (const [id, c] of d.items.slice(0, 6)) if (SKIN[id]) pushDrop(id, cleanNick(p.presence.nick), false, CASE[c] ? c : null);
    }

    // bitwy innych: zapamiętaj i uruchom te, które wystartowały
    for (const b of allBattles()) {
        KNOWN.set(b.bid, b);
        if (b.status === 'running' && !RUN.has(b.bid)) startRun(b);
    }

    hostDuties();
    seatDuties();
    refreshBattleUi();
}

// Host: przyjmuje graczy, którzy zgłosili się na wolne miejsce, i zwalnia miejsca tych, którzy wyszli.
function hostDuties() {
    if (!MYB || MYB.status !== 'waiting') return;
    let changed = false;
    const here = new Map(NET.peers.map(p => [p.peer, p]));
    MYB.slots = MYB.slots.map((s, i) => {
        if (!s || s.bot || s.peer === NET.me) return s;
        const p = here.get(s.peer);
        const seat = p?.presence?.seat;
        if (p && seat && seat.h === NET.me && seat.b === MYB.id && seat.i === i) return s;
        changed = true;
        return null;
    });
    for (const p of NET.peers) {
        if (p.peer === NET.me) continue;
        const seat = p.presence?.seat;
        if (!seat || seat.h !== NET.me || seat.b !== MYB.id || !Number.isInteger(seat.i)) continue;
        if (MYB.slots.some(s => s && s.peer === p.peer)) continue;
        if (seat.i < 0 || seat.i >= MYB.players || MYB.slots[seat.i]) continue;
        MYB.slots[seat.i] = { peer: p.peer, nick: cleanNick(p.presence.nick), color: cleanColor(p.presence.color), bot: false };
        changed = true;
        beep(700, 0.06, 0.04, 'triangle');
    }
    if (changed) { publish(); if (!MYB.slots.includes(null)) hostStart(); }
}

// Gracz: pilnuje swojego miejsca. Gdy host zniknął albo miejsce zajął ktoś inny — zwrot pieniędzy.
function seatDuties() {
    if (!SEAT) return;
    const b = allBattles().find(x => x.host === SEAT.h && x.id === SEAT.b);
    let lost = '';
    if (!b) lost = 'Bitwa zniknęła — host wyszedł.';
    else if (b.status === 'waiting' && b.slots[SEAT.i] && !isMeSlot(b.slots[SEAT.i])) lost = 'Ktoś zajął to miejsce przed Tobą.';
    else if (b.status === 'running' && !b.slots.some(isMeSlot)) lost = 'Bitwa wystartowała bez Ciebie.';
    if (lost) { releaseHold(); SEAT = null; publish(); toast(lost + ' Zwrócono opłatę.', 'err'); }
}

// Rezerwacja: opłata jest pobierana od razu i zwracana, jeśli bitwa nie wystartuje.
function holdFor(b) {
    const cost = bValue(b);
    wallet(-cost, `Bitwa (rezerwacja)`);
    state.hold = { cost, key: b.host + '.' + b.id };
    save();
}

function releaseHold() {
    if (!state.hold) return;
    wallet(state.hold.cost, 'Zwrot za bitwę');
    state.hold = null;
    save();
}

function hostStart() {
    if (!MYB || MYB.status !== 'waiting' || MYB.slots.includes(null)) return;
    MYB.status = 'running';
    MYB.seed = Math.floor(Math.random() * 2 ** 31);
    MYB.t = Date.now();
    publish();
    startRun(myBattle());
}

function rollWith(c, rnd) {
    let r = rnd() * c.total;
    for (const [id, w] of c.items) { r -= w; if (r < 0) return id; }
    return c.items[c.items.length - 1][0];
}

function wearWith(rnd) {
    let r = rnd() * 100;
    for (const [w, p] of WEARS) { r -= p; if (r < 0) return w; }
    return 'FT';
}

// Wynik jest liczony z ziarna — identycznie u każdego widza.
function startRun(b) {
    if (RUN.has(b.bid)) return;
    const rnd = srand(b.seed);
    const rolls = b.cases.map(id => b.slots.map(() => rollWith(CASE[id], rnd)));
    const wears = rolls.map(row => row.map(() => wearWith(rnd)));
    const totals = b.slots.map((s, i) => round2(rolls.reduce((sum, row) => sum + SKIN[row[i]].price, 0)));
    const tied = modeLeaders(b.mode, rolls.map(row => row.map(cents))).lead;
    const r = {
        b, rolls, wears, winner: tied[Math.floor(rnd() * tied.length)], pot: round2(totals.reduce((a, x) => a + x, 0)),
        res: b.slots.map(() => ({ total: 0, drops: [], wears: [] })), round: -1, phase: 'count', count: 3, done: false,
    };
    RUN.set(b.bid, r);
    const me = b.slots.findIndex(isMeSlot);
    if (me >= 0 && state.hold) { spend(state.hold.cost); state.hold = null; save(); }
    animateRun(b.bid);
}

const bvOpen = key => route.name === 'battle' && route.arg === key && !!$('#bv');

async function animateRun(key) {
    const r = RUN.get(key), b = r.b;
    if (bvOpen(key)) renderPage();
    for (let n = 3; n >= 1; n--) {
        r.phase = 'count'; r.count = n;
        bvPatch(key);
        if (bvOpen(key)) beep(520, 0.08, 0.04, 'triangle');
        await sleep(650);
    }
    // W bitwach szybkie otwieranie jest zablokowane — wszyscy oglądają pełną animację.
    const dur = 3000;
    for (let k = 0; k < b.cases.length; k++) {
        r.round = k; r.phase = 'spin';
        const c = CASE[b.cases[k]];
        bvPatch(key);
        const reels = bvOpen(key) ? $$('#bv .bv-reel') : [];
        await Promise.all(r.rolls[k].map((w, i) => spinReel(reels[i], c, w, dur, i === 0 && bvOpen(key))));
        r.rolls[k].forEach((w, i) => { const x = r.res[i]; x.total = round2(x.total + SKIN[w].price); x.drops.push(w); x.wears.push(r.wears[k][i]); });
        r.phase = 'show';
        bvPatch(key);
        await sleep(1300);
    }
    r.phase = 'done'; r.done = true;
    bvPatch(key);

    const me = b.slots.findIndex(isMeSlot);
    if (me >= 0) {
        state.stats.battles++;
        state.stats.stars += r.rolls.filter((row, k) => CASE[b.cases[k]].rare.has(row[me])).length;
        const won = r.winner === me;
        if (won) {
            state.stats.battlesWon++;
            if (b.mode.startsWith('crazy')) state.stats.crazyWins++;
            const all = r.res.flatMap(x => x.drops), wears = r.res.flatMap(x => x.wears);
            const uids = giveItems(all, 'Wygrana bitwa', wears);
            all.forEach(id => pushDrop(id, state.name, true, b.cases[0]));
            showWin(all, uids, 'Wygrałeś bitwę!');
        } else if (CONSOLATION.includes(b.mode)) {
            const g = pick(SKINS.filter(sk => sk.rarity === 'consumer')).id;
            giveItems([g], 'Gwarantowany skin z bitwy');
            toast(`Przegrana. Gwarantowany skin: ${SKIN[g].weapon} | ${SKIN[g].name}`);
        } else toast('Przegrałeś tę bitwę.', 'err');
        state.myBattles.unshift({ t: Date.now(), mode: b.mode, players: b.players, value: bValue(b), won, prize: won ? r.pot : 0 });
        state.myBattles.length = Math.min(state.myBattles.length, 50);
        save();
    }
    if (SEAT && SEAT.h === b.host && SEAT.b === b.id) { SEAT = null; publish(); }
    if (MYB && b.host === NET.me && MYB.id === b.id) setTimeout(() => { if (MYB?.id === b.id) { MYB = null; publish(); refreshBattleUi(); } }, 30000);
    setTimeout(() => { r.gone = true; refreshBattleUi(); }, 60000);
    refreshBattleUi();
}

function refreshBattleUi() {
    if (route.name === 'battles') { refreshBattleList(); refreshOnline(); }
    if (route.name === 'battle') {
        const r = RUN.get(route.arg);
        if (!r || r.done) renderPage();
    }
}

async function connectRoom() {
    try {
        const room = await window.claude?.use?.('room');
        if (!room) return;
        NET.room = room;
        room.onConnection(ok => { NET.connected = ok; refreshOnline(); }, () => { NET.connected = false; refreshOnline(); });
        room.onPeers(ch => {
            const mine = ch.peers.find(p => p.sameTab);
            if (mine && NET.me !== mine.peer) {
                // Po poznaniu mojego prawdziwego identyfikatora przepisz własną bitwę na niego.
                if (MYB) MYB.slots = MYB.slots.map(s => (s && !s.bot && s.peer === NET.me ? { ...s, peer: mine.peer } : s));
                NET.me = mine.peer;
            }
            onRoom(ch);
        });
        publish();
    } catch (e) { /* bez pokoju strona działa lokalnie */ }
}

// ============================================================
// Bitwy — lista i tworzenie
// ============================================================

const bl = { tab: 'active', sort: 'new', avail: false, mode: 'all' };

function groupCases(cases) {
    const out = [];
    for (const id of cases) {
        const last = out[out.length - 1];
        if (last && last.id === id) last.n++;
        else out.push({ id, n: 1 });
    }
    return out;
}

const canJoin = b => b.status === 'waiting' && b.host !== NET.me && b.slots.includes(null) && !SEAT && !MYB;

function battleRow(b) {
    const m = MODES[b.mode];
    const groups = groupCases(b.cases);
    const cells = groups.slice(0, 8).map(g => `<div class="bcase">${g.n > 1 ? `<span class="bx">x${g.n}</span>` : ''}${caseArt(CASE[g.id])}<span>${esc(CASE[g.id].name)}</span></div>`).join('');
    const empties = Array.from({ length: Math.max(0, 8 - groups.length) }, () => '<div class="bcase ghost"></div>').join('');
    const mine = b.slots.some(isMeSlot) || (SEAT && SEAT.h === b.host && SEAT.b === b.id);
    const r = RUN.get(b.bid);
    const st = r ? (r.done ? 'KONIEC' : 'W TOKU') : 'CZEKA';
    const label = canJoin(b) ? 'DOŁĄCZ' : mine ? 'GRASZ' : st === 'CZEKA' ? 'PEŁNA' : 'OGLĄDAJ';
    return `<div class="brow" style="--mc:${m.col}">
        <div class="bstatus">${ic(m.icon)}<span>${st}</span><small>${m.n}</small></div>
        <div class="bcases">${cells}${empties}</div>
        <div class="binfo">
            <div><small>WARTOŚĆ BITWY</small><b class="money">${ic('wallet')}${money(bValue(b))}</b></div>
            <div><small>GRACZE</small><div class="bslots">${b.slots.map(s => slotAvatar(s, 'xs')).join('')}</div><small class="bhost">host: <span translate="no">${esc(b.slots[0]?.nick || '—')}</span></small></div>
        </div>
        <div class="bact">
            <button class="btn btn-join-b" data-act="${canJoin(b) ? 'join' : 'watch'}" data-arg="${esc(b.bid)}">${ic(canJoin(b) ? m.icon : 'eye')}${label}</button>
            <button class="sq" data-act="watch" data-arg="${esc(b.bid)}" aria-label="Oglądaj">${ic('eye')}</button>
        </div>
    </div>`;
}

function slotAvatar(s, cls) {
    if (!s) return avatar(null, cls);
    return avatar(isMeSlot(s) ? me() : { name: s.nick, color: s.color }, cls);
}

function battleListHtml() {
    if (bl.tab === 'mine') {
        if (!state.myBattles.length) return `<div class="empty">${ic('swords')}<p>Nie masz jeszcze żadnych bitew.</p></div>`;
        return `<div class="table">${state.myBattles.map(r => `<div class="trow">
            <span class="mode-chip" style="--mc:${MODES[r.mode].col}">${ic(MODES[r.mode].icon)}${MODES[r.mode].n}</span>
            <span>${fmtTime(r.t)}</span><span>${r.players} graczy</span><span>Koszt ${money(r.value)}</span>
            <b class="${r.won ? 'pos' : 'neg'}">${r.won ? `Wygrana ${money(r.prize)}` : 'Przegrana'}</b></div>`).join('')}</div>`;
    }
    let list = allBattles().filter(b => (bl.mode === 'all' || b.mode === bl.mode) && (!bl.avail || canJoin(b)));
    if (bl.sort === 'val') list = [...list].sort((a, b) => bValue(b) - bValue(a));
    if (bl.sort === 'cheap') list = [...list].sort((a, b) => bValue(a) - bValue(b));
    if (list.length) return list.map(battleRow).join('');
    return `<div class="empty big-empty">${ic('swords')}<p><b>Nikt jeszcze nie stworzył bitwy.</b><br>${NET.room ? 'Stwórz własną — koledzy na serwerze zobaczą ją od razu i będą mogli dołączyć.' : 'Stwórz własną bitwę. Żeby grać z kolegami, otwórzcie stronę przez link claude.ai (zaproszenie mailem).'}</p>
        <button class="btn btn-purple" data-act="go" data-arg="#/create">${ic('plus')}STWÓRZ BITWĘ</button></div>`;
}

function onlineHtml() {
    if (!NET.room) return `<div class="panel online-panel off">${ic('info')}<div><b>Tryb lokalny</b><span>Bitwy z kolegami działają, gdy strona jest otwarta przez link claude.ai, a koledzy są zaproszeni mailem. Teraz możesz grać z botami.</span></div></div>`;
    const players = NET.peers;
    return `<div class="panel online-panel">
        <div class="op-head"><span class="live-dot ${NET.connected ? 'on' : ''}"></span><b>${NET.connected ? 'Serwer online' : 'Łączenie…'}</b><span>${players.length} ${players.length === 1 ? 'gracz' : 'graczy'} na stronie</span></div>
        <div class="op-list">${players.map(p => `<span class="op-chip ${p.isMe ? 'me' : ''}" translate="no">${avatar(p.isMe ? me() : { name: cleanNick(p.presence?.nick), color: cleanColor(p.presence?.color) }, 'xs')}${esc(p.isMe ? state.name : cleanNick(p.presence?.nick))}${p.isMe ? ' <em>(Ty)</em>' : ''}<small>poz. ${Number.isInteger(p.presence?.lvl) ? p.presence.lvl : '?'}</small></span>`).join('')}</div>
    </div>`;
}

function refreshBattleList() {
    const el = $('#blist');
    if (el) el.innerHTML = battleListHtml();
}

function refreshOnline() {
    const el = $('#onlineBox');
    if (el) el.innerHTML = onlineHtml();
}

function templates() {
    const near = v => [...USD_CASES].sort((a, b) => Math.abs(a.price - v) - Math.abs(b.price - v))[0];
    return [
        { players: 4, mode: 'pointrush', cases: Array(5).fill(near(1).id) },
        { players: 3, mode: 'crazyterminal', cases: Array(3).fill(near(5).id) },
        { players: 2, mode: 'normal', cases: Array(2).fill(near(25).id) },
    ];
}

function renderBattles() {
    const tpl = templates();
    return `
    <div class="bhero">
        <div>
            <h1>BITWY SKRZYNEK</h1>
            <p>Otwierajcie te same skrzynki, a najlepszy drop zgarnia wszystko. Graj z kolegami, którzy mają otwartą tę stronę — na żywo.</p>
            <button class="btn btn-purple btn-xl" data-act="go" data-arg="#/create">STWÓRZ BITWĘ ${ic('back', 'flip')}</button>
        </div>
        <div class="bhero-art"><img src="${IMG.engwe}" alt="ENGWE EP-2.0 Boost"><span class="vs">VS</span><img src="${IMG.varg}" alt="Stark Varg"></div>
    </div>
    <div id="onlineBox">${onlineHtml()}</div>
    <div class="page-head">${ic('swords')}<div><h2>BITWY ROWER4SKINS</h2><small>TYLKO PRAWDZIWI GRACZE — BOTY NIGDY NIE DOŁĄCZAJĄ SAME, PRZYWOŁUJE JE TYLKO HOST</small></div><span class="r18">18+</span></div>
    <div class="panel bbar">
        <div class="seg big">
            <button class="${bl.tab === 'active' ? 'on' : ''}" data-act="btab" data-arg="active">${ic('swords')}AKTYWNE BITWY</button>
            <button class="${bl.tab === 'mine' ? 'on' : ''}" data-act="btab" data-arg="mine">${ic('history')}MOJE BITWY</button>
        </div>
        <div class="select"><select id="bSort" data-ch="bsort" aria-label="Sortowanie">
            <option value="new" ${bl.sort === 'new' ? 'selected' : ''}>Najnowsze</option>
            <option value="val" ${bl.sort === 'val' ? 'selected' : ''}>Najdroższe</option>
            <option value="cheap" ${bl.sort === 'cheap' ? 'selected' : ''}>Najtańsze</option>
        </select>${ic('chev')}</div>
        <label class="check"><input id="bAvail" type="checkbox" data-ch="bavail" ${bl.avail ? 'checked' : ''}><span></span>Można dołączyć</label>
        <button class="btn btn-purple grow-l" data-act="go" data-arg="#/create">${ic('plus')}STWÓRZ BITWĘ</button>
    </div>
    <div class="panel chips">
        <button class="chip all ${bl.mode === 'all' ? 'on' : ''}" data-act="bmode" data-arg="all">WSZYSTKIE</button>
        ${Object.entries(MODES).map(([k, m]) => `<button class="chip ${bl.mode === k ? 'on' : ''}" style="--mc:${m.col}" data-act="bmode" data-arg="${k}">${ic(m.icon)}${m.n.toUpperCase()}</button>`).join('')}
    </div>
    <div class="tpls">${tpl.map((t, i) => `<div class="tpl">
        <span class="mode-chip" style="--mc:${MODES[t.mode].col}">${ic(MODES[t.mode].icon)}${MODES[t.mode].n.toUpperCase()}</span>
        <div class="tpl-info"><small>${ic('users')}${t.players} graczy</small><b>${money(round2(t.cases.reduce((s, id) => s + CASE[id].price, 0)))}</b></div>
        <div class="tpl-cases">${groupCases(t.cases).map(g => `<div>${caseArt(CASE[g.id])}${g.n > 1 ? `<span class="bx">x${g.n}</span>` : ''}</div>`).join('')}</div>
        <button class="btn btn-blue" data-act="tpl" data-arg="${i}">${ic('bolt')}STWÓRZ</button>
    </div>`).join('')}</div>
    <div id="blist" class="blist">${battleListHtml()}</div>`;
}

const cr = { cases: [], players: 2, mode: 'normal' };
const crCost = () => round2(cr.cases.reduce((s, x) => s + CASE[x.id].price * x.n, 0));
const crRounds = () => cr.cases.reduce((s, x) => s + x.n, 0);

function renderCreate() {
    const m = MODES[cr.mode];
    return `
    <button class="back" data-act="go" data-arg="#/battles">${ic('back')}Bitwy</button>
    <div class="page-head">${ic('plus')}<div><h2>STWÓRZ BITWĘ</h2><small>WYBIERZ SKRZYNKI I ZASADY</small></div><span class="r18">18+</span></div>
    <div class="cr-cases">
        ${cr.cases.map((x, i) => `<div class="cr-case" style="--cc:${CASE[x.id].color}">
            <button class="cr-x" data-act="crRm" data-arg="${i}" aria-label="Usuń">${ic('x')}</button>
            ${caseArt(CASE[x.id])}
            <b>${esc(CASE[x.id].name)}</b><span class="money">${money(CASE[x.id].price)}</span>
            <div class="stepper"><button data-act="crDec" data-arg="${i}" aria-label="Mniej">${ic('minus')}</button><span>${x.n}</span><button data-act="crInc" data-arg="${i}" aria-label="Więcej">${ic('plus')}</button></div>
        </div>`).join('')}
        <button class="cr-add" data-act="crAddModal"><span>${ic('plus')}</span>DODAJ<br>SKRZYNKĘ</button>
    </div>
    <h3 class="settings-h">USTAWIENIA</h3>
    <div class="cr-grid">
        <div class="panel cr-card">
            <h4>${ic('users')}Liczba graczy</h4><p>Im więcej, tym weselej!</p>
            ${[2, 3, 4].map(n => `<button class="opt ${cr.players === n ? 'on' : ''}" data-act="crPlayers" data-arg="${n}">${ic(n === 2 ? 'user' : 'users')}${n} GRACZY</button>`).join('')}
        </div>
        <div class="panel cr-card wide">
            <h4>${ic('swords')}Tryb bitwy</h4><p>Zdecyduj, jak potoczy się bitwa!</p>
            <div class="opt-grid">${Object.entries(MODES).map(([k, mm]) => `<button class="opt ${cr.mode === k ? 'on' : ''}" data-act="crMode" data-arg="${k}">${ic(mm.icon)}${mm.n.toUpperCase()}</button>`).join('')}</div>
        </div>
        <div class="panel cr-card">
            <h4>${ic('info')}Podsumowanie</h4><p>Opłata jest pobierana od razu i wraca, jeśli anulujesz bitwę przed startem.</p>
            <div class="sum-box green">${ic('box')}<div><small>KOSZT SKRZYNEK</small><b>${money(crCost())}</b></div></div>
            <div class="sum-box purple">${ic('gift')}<div><small>${CONSOLATION.includes(cr.mode) ? 'GWARANTOWANY' : 'RUNDY'}</small><b>${CONSOLATION.includes(cr.mode) ? 'SKIN' : crRounds()}</b></div></div>
            <button class="btn btn-green btn-block" data-act="crCreate" ${cr.cases.length ? '' : 'disabled'}>STWÓRZ BITWĘ</button>
        </div>
    </div>
    <div class="panel mode-info" style="--mc:${m.col}"><span class="mode-ico">${ic(m.icon)}</span><div><h3>${m.n}</h3><p>${m.d}</p></div></div>`;
}

function createBattle(mode, players, cases) {
    if (MYB) { toast('Masz już otwartą bitwę. Zakończ ją albo anuluj.', 'err'); go('#/battle/' + myBattle().bid); return; }
    if (SEAT) { toast('Siedzisz już w innej bitwie.', 'err'); return; }
    const b = { id: Math.random().toString(36).slice(2, 10), mode, players, cases, status: 'waiting', seed: 0, t: Date.now(),
        slots: [mySlot(), ...Array(players - 1).fill(null)] };
    const cost = bValue(b);
    if (state.balance < cost) { toast('Za mało środków na tę bitwę.', 'err'); return; }
    MYB = b;
    holdFor(myBattle());
    publish();
    go('#/battle/' + myBattle().bid);
}

// ============================================================
// Bitwy — widok rundy
// ============================================================

const TAUNTS = ['Haha, Ezz!', 'GG, za łatwo!', 'Kto następny?', 'Skrzynki mnie lubią!'];

function bvScore(r) {
    if (!r || !r.res.some(x => x.drops.length)) return null;
    const K = r.res[0].drops.length;
    return modeLeaders(r.b.mode, Array.from({ length: K }, (_, k) => r.res.map(x => cents(x.drops[k]))));
}

function bvLeader(r) {
    const m = bvScore(r);
    return m ? m.lead[0] : -1;
}

function bvStage(b, r, i) {
    const s = b.slots[i];
    if (!s) {
        let act = '';
        if (b.status === 'waiting') {
            if (b.host === NET.me) act = `<button class="btn btn-purple" data-act="summon" data-arg="${i}">${ic('bolt')}Przywołaj bota</button>`;
            else if (canJoin(b)) act = `<button class="btn btn-blue" data-act="join" data-arg="${esc(b.bid)}:${i}">${ic('plus')}Dołącz za ${money(bValue(b))}</button>`;
            else if (SEAT && SEAT.h === b.host && SEAT.b === b.id && SEAT.i === i) act = `<span class="muted">Czekam, aż host Cię przyjmie…</span>`;
        }
        return `<div class="st-wait"><span class="st-ring">${ic('user')}</span><b>Czekamy na gracza…</b>${act}</div>`;
    }
    if (r && r.phase === 'count') return `<div class="st-count">${r.count}</div>`;
    if (r && r.phase === 'spin') return reelHtml(true, 'bv-reel');
    if (r && r.phase === 'show' && r.res[i].drops.length) {
        const x = r.res[i], k = x.drops.length - 1, sk = SKIN[x.drops[k]];
        return `<div class="st-drop" style="--rc:${RAR[sk.rarity].c}"><div class="st-art">${art(sk)}</div><div class="st-txt"><b>${esc(sk.weapon)}</b><span>${esc(sk.name)}</span><small>${WEAR_NAME[x.wears[k]]}</small></div><em class="money">${money(sk.price)}</em></div>`;
    }
    if (r && r.phase === 'done') {
        if (i === r.winner) return `<div class="st-win">${ic('trophy', 'big')}<small>wartość skinów ${money(r.pot)}</small><b>${isMeSlot(s) ? 'Wygrałeś!' : TAUNTS[r.b.seed % TAUNTS.length]}</b></div>`;
        const x = r.res[i], k = x.drops.length - 1, sk = SKIN[x.drops[k]];
        return `<div class="st-drop lose" style="--rc:${RAR[sk.rarity].c}"><div class="st-art">${art(sk)}</div><div class="st-txt"><b>${esc(sk.weapon)}</b><span>${esc(sk.name)}</span><small>${WEAR_NAME[x.wears[k]]}</small></div><em class="neg">${money(x.total)}</em></div>`;
    }
    return `<div class="st-ready">${slotAvatar(s, 'xl')}<b translate="no">${esc(isMeSlot(s) ? state.name : s.nick)}</b><span class="pos">${ic('check')}Gotowy</span></div>`;
}

function bvGrid(b, r, i) {
    const x = r?.res[i];
    return b.cases.map((cid, k) => {
        const id = x?.drops[k];
        if (!id) return `<div class="bv-cell ghost">${ic('box')}</div>`;
        return itemCard(SKIN[id], { cls: 'bv-cell', wear: x.wears[k] });
    }).join('');
}

function bvSum(r, i) {
    const m = bvScore(r), lead = m ? m.lead[0] : -1, up = lead === i;
    const pts = m?.pts ? `<em class="pts">${m.pts[i]} pkt</em>` : '';
    return `<span class="bv-sum ${lead < 0 ? '' : up ? 'up' : 'down'}">${lead < 0 ? '' : ic('chev', up ? 'flip' : '')}${money(r ? r.res[i].total : 0)}${pts}</span>`;
}

function bvMsg(b, r) {
    if (r?.done) {
        const w = b.slots[r.winner];
        return isMeSlot(w) ? `<span class="pos">Wygrałeś ${money(r.pot)}!</span>` : `<span class="neg">Wygrywa ${esc(w.nick)} — ${money(r.pot)}</span>`;
    }
    if (r?.phase === 'count') return 'Start za chwilę…';
    if (r) return `Runda ${r.round + 1} z ${b.cases.length}`;
    const free = b.slots.filter(x => !x).length;
    if (b.host === NET.me) return `Brakuje ${free} ${free === 1 ? 'gracza' : 'graczy'}. Poczekaj na kolegów albo przywołaj boty.`;
    return 'Bitwa czeka na graczy.';
}

function renderBattleView() {
    const b = findBattle(route.arg);
    if (!b) return `<button class="back" data-act="go" data-arg="#/battles">${ic('back')}Bitwy</button><div class="empty">${ic('swords')}<p>Tej bitwy już nie ma.</p></div>`;
    const r = RUN.get(b.bid);
    const m = MODES[b.mode];
    const waiting = !r && b.status === 'waiting';
    const cells = [...b.cases.map((id, i) => `<div class="bv-case ${r && i === r.round && !r.done ? 'cur' : ''} ${r && (i < r.round || r.done) ? 'done' : ''}">${caseArt(CASE[id])}<span>${esc(CASE[id].name)}</span></div>`),
        ...Array.from({ length: Math.max(0, 8 - b.cases.length) }, () => '<div class="bv-case ghost"></div>')].join('');
    const amHost = b.host === NET.me, amSeated = SEAT && SEAT.h === b.host && SEAT.b === b.id;
    return `<div class="bv" id="bv" style="--mc:${m.col}">
        <div class="bv-top">
            <div class="bv-status"><span class="bv-sico">${ic(m.icon)}<b>${b.players}</b></span><span id="bvState">${waiting ? 'CZEKA' : r?.done ? 'KONIEC' : 'AKTYWNA'}</span></div>
            <div class="bv-stats">
                <div class="bv-st blue"><small>RUNDY</small><b>${ic('box')}<span id="bvRounds">${r ? (r.done ? b.cases.length : Math.max(0, r.round + 1)) : 0}/${b.cases.length}</span></b></div>
                <div class="bv-st green"><small>WARTOŚĆ BITWY</small><b>${ic('wallet')}${money(bValue(b))}</b></div>
            </div>
            <div class="bv-strip">${cells}</div>
        </div>
        <div class="bv-tools">
            <button class="sq" data-act="go" data-arg="#/battles" aria-label="Wróć do bitew">${ic('back')}</button>
            <span class="mode-chip">${ic(m.icon)}${m.n}</span>
            <span class="bv-msg" id="bvMsg">${bvMsg(b, r)}</span>
            <span class="bv-nofast" title="W bitwach szybkie otwieranie jest wyłączone">${ic('clock')}BEZ SZYBKIEGO OTWIERANIA</span>
            ${waiting && amHost && b.slots.includes(null) ? `<button class="btn btn-purple" data-act="bots">${ic('bolt')}Przywołaj wszystkie boty</button>` : ''}
            ${waiting && (amHost || amSeated) ? `<button class="btn btn-dark" data-act="leaveBattle">${ic('x')}${amHost ? 'Anuluj bitwę' : 'Wyjdź'}</button>` : ''}
            <button class="sq" data-act="toggleSound" aria-label="Dźwięk">${ic(state.settings.sound ? 'sound' : 'x')}</button>
        </div>
        <div class="bv-arena" style="--n:${b.players}">${b.slots.map((sl, i) => `
            <div class="bv-col ${r?.done ? (i === r.winner ? 'win' : 'lose') : ''}">
                <div class="bv-stage">${bvStage(b, r, i)}</div>
                <div class="bv-bar">${slotAvatar(sl, 'sm')}<div class="bv-who"><b translate="no">${sl?.bot ? 'BOT | ' : ''}${esc(sl ? (isMeSlot(sl) ? state.name : sl.nick) : 'Wolne miejsce')}</b><small>${!sl ? 'CZEKA NA GRACZA' : isMeSlot(sl) ? 'TY' : sl.bot ? 'BOT' : i === 0 ? 'HOST' : 'GRACZ'}</small></div><span class="bv-sumw">${bvSum(r, i)}</span></div>
                <div class="bv-grid">${bvGrid(b, r, i)}</div>
            </div>`).join('')}
        </div>
    </div>`;
}

function afterBattleView() {
    const b = findBattle(route.arg);
    if (!b) return;
    const r = RUN.get(b.bid);
    const c = CASE[b.cases[Math.max(0, Math.min(r?.round ?? 0, b.cases.length - 1))]];
    $$('.bv-reel').forEach(el => idleReel(el, c));
}

// Aktualizuje widok bitwy bez przebudowy strony (nie przerywa animacji).
function bvPatch(key) {
    if (!bvOpen(key)) return;
    const r = RUN.get(key), b = r.b, root = $('#bv');
    $('#bvMsg', root).innerHTML = bvMsg(b, r);
    $('#bvState', root).textContent = r.done ? 'KONIEC' : 'AKTYWNA';
    $('#bvRounds', root).textContent = `${r.done ? b.cases.length : Math.max(0, r.round + 1)}/${b.cases.length}`;
    $$('.bv-case', root).forEach((el, i) => {
        el.classList.toggle('cur', i === r.round && !r.done);
        el.classList.toggle('done', i < r.round || r.done);
    });
    $$('.bv-col', root).forEach((el, i) => {
        $('.bv-stage', el).innerHTML = bvStage(b, r, i);
        $('.bv-sumw', el).innerHTML = bvSum(r, i);
        $('.bv-grid', el).innerHTML = bvGrid(b, r, i);
        if (r.done) el.classList.add(i === r.winner ? 'win' : 'lose');
    });
}

// ============================================================
// Kontrakt
// ============================================================

let conSel = [];

function contractOdds(T) {
    let cand = SKINS.filter(s => s.price >= T * 0.2 && s.price <= T * 5);
    if (cand.length < 3) cand = [...SKINS].sort((a, b) => Math.abs(a.price - T) - Math.abs(b.price - T)).slice(0, 4);
    // Wagi ~ cena^-k, k dobrane tak, by średni wynik wynosił ok. 95% wkładu.
    const ev = k => { let a = 0, b = 0; for (const s of cand) { const w = Math.pow(s.price, -k); a += s.price * w; b += w; } return a / b; };
    let lo = -3, hi = 8;
    for (let i = 0; i < 40; i++) { const mid = (lo + hi) / 2; if (ev(mid) > T * 0.95) lo = mid; else hi = mid; }
    const k = (lo + hi) / 2;
    return { cand, w: cand.map(s => Math.pow(s.price, -k)) };
}

function renderContract() {
    conSel = conSel.filter(u => state.inv.some(i => i.uid === u));
    const items = conSel.map(u => state.inv.find(i => i.uid === u));
    const T = round2(items.reduce((s, i) => s + SKIN[i.id].price, 0));
    const odds = items.length >= 3 ? contractOdds(T) : null;
    const lo = odds ? Math.min(...odds.cand.map(s => s.price)) : 0, hi = odds ? Math.max(...odds.cand.map(s => s.price)) : 0;
    return `
    <div class="page-head">${ic('doc')}<div><h2>KONTRAKTY</h2><small>POŁĄCZ OD 3 DO 10 SKINÓW W JEDEN NOWY</small></div><span class="r18">18+</span></div>
    <div class="contract">
        <div class="c-slots">${Array.from({ length: 10 }, (_, i) => {
            const it = items[i];
            return it ? `<div class="c-slot full" data-act="csel" data-arg="${it.uid}" title="Usuń">${itemCard(SKIN[it.id])}</div>` : `<div class="c-slot"><span>${i + 1}</span></div>`;
        }).join('')}</div>
        <div class="panel c-panel">
            <div class="c-stat"><small>Skinów w kontrakcie</small><b>${items.length} / 10</b></div>
            <div class="c-stat"><small>Wartość wkładu</small><b class="money">${money(T)}</b></div>
            <div class="c-stat"><small>Możliwy wynik</small><b>${odds ? `${money(lo)} – ${money(hi)}` : '—'}</b></div>
            <button class="btn btn-green btn-xl btn-block" data-act="contract" ${odds ? '' : 'disabled'}>${ic('edit')}PODPISZ KONTRAKT</button>
            <p class="muted">Średnio kontrakt zwraca ok. 95% wartości wkładu. Wkład przepada.</p>
        </div>
    </div>
    <div class="sec-title">${ic('box')}<span>Twoje przedmioty</span></div>
    ${state.inv.length ? `<div class="igrid">${state.inv.map(i => itemCard(SKIN[i.id], { wear: i.w, cls: conSel.includes(i.uid) ? 'sel' : '', attrs: `data-act="csel" data-arg="${i.uid}"` })).join('')}</div>`
        : `<div class="empty">${ic('box')}<p>Nie masz skinów. Otwórz kilka skrzynek.</p><button class="btn btn-green" data-act="go" data-arg="#/">Do skrzynek</button></div>`}`;
}

// ============================================================
// Wymiennik
// ============================================================

let exSel = [], exCart = [], exQ = '';

function exTotals() {
    const give = round2(exSel.reduce((s, u) => s + SKIN[state.inv.find(i => i.uid === u).id].price, 0));
    const get = round2(exCart.reduce((s, id) => s + SKIN[id].price, 0));
    return { give, get };
}

function exMarketHtml() {
    const q = exQ.trim().toLowerCase();
    return [...SKINS].filter(s => !q || (s.weapon + ' ' + s.name).toLowerCase().includes(q)).sort((a, b) => a.price - b.price)
        .map(s => itemCard(s, { attrs: `data-act="exadd" data-arg="${s.id}"`, bottom: `<span class="add-ico">${ic('plus')}</span>` })).join('');
}

function renderExchanger() {
    exSel = exSel.filter(u => state.inv.some(i => i.uid === u));
    const { give, get } = exTotals();
    const ok = give > 0 && get > 0 && get <= give;
    return `
    <div class="page-head">${ic('swap')}<div><h2>WYMIENNIK</h2><small>ZAMIEŃ SWOJE SKINY NA INNE — RESZTA WRACA NA SALDO</small></div><span class="r18">18+</span></div>
    <div class="panel ex-bar">
        <div class="c-stat"><small>Oddajesz</small><b class="money">${money(give)}</b></div>
        <span class="ex-arrow">${ic('swap')}</span>
        <div class="c-stat"><small>Otrzymujesz</small><b class="${get > give ? 'neg' : ''}">${money(get)}</b></div>
        <div class="c-stat"><small>Reszta na saldo</small><b>${money(Math.max(0, round2(give - get)))}</b></div>
        <button class="btn btn-green btn-xl" data-act="exchange" ${ok ? '' : 'disabled'}>WYMIEŃ</button>
    </div>
    ${exCart.length ? `<div class="cart-chips">${exCart.map((id, i) => `<button class="mini" style="--rc:${RAR[SKIN[id].rarity].c}" data-act="exrm" data-arg="${i}">${esc(SKIN[id].name)} · ${money(SKIN[id].price)} ${ic('x')}</button>`).join('')}</div>` : ''}
    <div class="ex-cols">
        <div class="panel">
            <h3 class="ph">${ic('user')}Twoje przedmioty</h3>
            ${state.inv.length ? `<div class="igrid sm">${state.inv.map(i => itemCard(SKIN[i.id], { wear: i.w, cls: exSel.includes(i.uid) ? 'sel' : '', attrs: `data-act="exsel" data-arg="${i.uid}"` })).join('')}</div>` : `<div class="empty small">Brak przedmiotów.</div>`}
        </div>
        <div class="panel">
            <h3 class="ph">${ic('box')}Sklep</h3>
            <label class="search">${ic('search')}<input id="exQ" data-in="exq" placeholder="Szukaj skina" value="${esc(exQ)}"></label>
            <div class="igrid sm" id="exMarket">${exMarketHtml()}</div>
        </div>
    </div>`;
}

// ============================================================
// Przeznaczenie
// ============================================================

let destT = null, destPct = 30, destQ = '', destAngle = 0, destBusy = false;

const destCost = () => (destT ? Math.max(0.01, round2(SKIN[destT].price * destPct / 100 * 1.08)) : 0);

function destGridHtml() {
    const q = destQ.trim().toLowerCase();
    return [...SKINS].filter(s => !q || (s.weapon + ' ' + s.name).toLowerCase().includes(q)).sort((a, b) => b.price - a.price)
        .map(s => itemCard(s, { cls: s.id === destT ? 'sel' : '', attrs: `data-act="dpick" data-arg="${s.id}"` })).join('');
}

function renderDestiny() {
    return `
    <div class="page-head">${ic('target')}<div><h2>PRZEZNACZENIE</h2><small>WYBIERZ WYMARZONY SKIN I SWOJĄ SZANSĘ</small></div><span class="r18">18+</span></div>
    <div class="destiny">
        <div class="panel d-target">${destT ? itemCard(SKIN[destT], { cls: 'glow' }) : `<div class="empty small">${ic('target')}<p>Wybierz skin z listy poniżej.</p></div>`}</div>
        <div class="d-wheel">
            <div class="wheel" id="wheel" style="--pct:${destPct}"><div class="needle" id="needle" style="transform:rotate(${destAngle}deg)"></div>
                <div class="wheel-c"><b id="dPctBig">${destPct}%</b><span>szansa</span></div></div>
        </div>
        <div class="panel d-ctrl">
            <label for="dPct" class="field-l">Twoja szansa: <b id="dPctL">${destPct}%</b></label>
            <input type="range" id="dPct" min="1" max="80" value="${destPct}" data-in="dpct">
            <div class="c-stat"><small>Koszt próby</small><b class="money" id="dCost">${money(destCost())}</b></div>
            <button class="btn btn-green btn-xl btn-block" id="dBtn" data-act="dspin" ${destT && !destBusy ? '' : 'disabled'}>SPRÓBUJ</button>
        </div>
    </div>
    <div class="sec-title">${ic('star')}<span>Wybierz skin</span></div>
    <label class="search wide">${ic('search')}<input id="dQ" data-in="dq" placeholder="Szukaj skina" value="${esc(destQ)}"></label>
    <div class="igrid" id="dGrid">${destGridHtml()}</div>`;
}

function destUpdate() {
    const w = $('#wheel');
    if (!w) return;
    w.style.setProperty('--pct', destPct);
    $('#dPctBig').textContent = destPct + '%';
    $('#dPctL').textContent = destPct + '%';
    $('#dCost').textContent = money(destCost());
}

// ============================================================
// Profil
// ============================================================

let pSort = 'new', pQ = '', resetArmed = null;

function profInvHtml() {
    const q = pQ.trim().toLowerCase();
    let list = state.inv.filter(i => !q || (SKIN[i.id].weapon + ' ' + SKIN[i.id].name).toLowerCase().includes(q));
    const s = { old: (a, b) => a.t - b.t, pd: (a, b) => SKIN[b.id].price - SKIN[a.id].price, pa: (a, b) => SKIN[a.id].price - SKIN[b.id].price }[pSort];
    if (s) list = [...list].sort(s);
    if (!list.length) return state.inv.length ? `<div class="empty">${ic('search')}<p>Nic nie pasuje do wyszukiwania.</p></div>` : emptyInv();
    return `<div class="igrid">${list.map(i => itemCard(SKIN[i.id], { wear: i.w, bottom: `<button class="sell-btn" data-act="sell" data-arg="${i.uid}">${ic('wallet')}Sprzedaj</button>` })).join('')}</div>`;
}

function renderProfile() {
    const tab = route.arg || 'inv';
    const L = level(), a = levelStart(L), b = levelStart(L + 1);
    const pct = (state.exp - a) / (b - a) * 100;
    let body = '';
    if (tab === 'inv') {
        body = `<div class="page-head sm">${ic('box')}<div><h2>EKWIPUNEK (${state.inv.length})</h2><small>WARTOŚĆ: <b class="money">${money(invValue())}</b></small></div></div>
        <div class="inv-bar">
            <div class="select"><select id="pSort" data-ch="psort" aria-label="Sortowanie">
                <option value="new" ${pSort === 'new' ? 'selected' : ''}>Najnowsze</option><option value="old" ${pSort === 'old' ? 'selected' : ''}>Najstarsze</option>
                <option value="pd" ${pSort === 'pd' ? 'selected' : ''}>Najdroższe</option><option value="pa" ${pSort === 'pa' ? 'selected' : ''}>Najtańsze</option>
            </select>${ic('chev')}</div>
            <label class="search">${ic('search')}<input id="pQ" data-in="pq" placeholder="Nazwa przedmiotu" value="${esc(pQ)}"></label>
            <button class="btn btn-green grow-l" data-act="sellAll" ${state.inv.length ? '' : 'disabled'}>${ic('wallet')}SPRZEDAJ WSZYSTKO</button>
        </div>
        <div id="pGrid">${profInvHtml()}</div>`;
    } else if (tab === 'items') {
        body = state.itemLog.length ? `<div class="table">${state.itemLog.map(r => `<div class="trow"><span>${fmtTime(r.t)}</span><span class="mini" style="--rc:${RAR[SKIN[r.id].rarity].c}">${esc(SKIN[r.id].weapon)} | ${esc(SKIN[r.id].name)}</span><span>${esc(r.a)}</span><b class="money">${money(SKIN[r.id].price)}</b></div>`).join('')}</div>`
            : `<div class="empty">${ic('history')}<p>Brak historii przedmiotów.</p></div>`;
    } else if (tab === 'wallet') {
        body = state.walletLog.length ? `<div class="table">${state.walletLog.map(r => `<div class="trow"><span>${fmtTime(r.t)}</span><span>${esc(r.r)}</span><b class="${r.d >= 0 ? 'pos' : 'neg'}">${r.d >= 0 ? '+' : '−'}${money(Math.abs(r.d))}</b></div>`).join('')}</div>`
            : `<div class="empty">${ic('wallet')}<p>Brak operacji w portfelu.</p></div>`;
    } else {
        body = `<div class="set-grid">
            <div class="panel"><h4>${ic('user')}Nick</h4><div class="inline"><input id="nick" maxlength="16" value="${esc(state.name)}" aria-label="Nick"><button class="btn btn-purple" data-act="saveNick">Zapisz</button></div>
                <h4>Kolor avatara</h4><div class="swatches">${['#a855f7', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#ec4899', '#14b8a6'].map(c => `<button class="sw ${state.color === c ? 'on' : ''}" style="--a:${c}" data-act="setColor" data-arg="${c}" aria-label="Kolor ${c}"></button>`).join('')}</div></div>
            <div class="panel"><h4>${ic('globe')}Język</h4>
                <div class="choice">${Object.entries(LANGS).map(([k, l]) => `<button class="${state.settings.lang === k ? 'on' : ''}" data-act="setLang" data-arg="${k}" translate="no">${l}</button>`).join('')}</div>
                <h4>${ic('wallet')}Waluta</h4>
                <div class="choice">${Object.entries(CUR).map(([k, c]) => `<button class="${state.settings.cur === k ? 'on' : ''}" data-act="setCur" data-arg="${k}" translate="no">${c.n} · ${c.f(1).replace(/[\d,.]+/, '').trim()}</button>`).join('')}</div>
                <p class="muted small">Ceny liczone są w dolarach i przeliczane po stałym kursie.</p></div>
            <div class="panel"><h4>${ic('sound')}Dźwięk i animacje</h4>
                <label class="toggle"><input type="checkbox" id="sSound" data-ch="sound" ${state.settings.sound ? 'checked' : ''}><span></span>Dźwięki ruletki</label>
                <label class="toggle"><input type="checkbox" id="sFast" data-ch="fast" ${state.settings.fast ? 'checked' : ''}><span></span>Szybkie otwieranie</label></div>
            <div class="panel danger"><h4>${ic('refresh')}Reset konta</h4><p class="muted">Usuwa saldo, gemy, poziom i wszystkie skiny.</p><button class="btn btn-red" id="resetBtn" data-act="reset">Resetuj konto</button></div>
        </div>`;
    }
    const tabs = [['inv', 'box', 'MÓJ EKWIPUNEK'], ['items', 'history', 'HISTORIA PRZEDMIOTÓW'], ['wallet', 'wallet', 'HISTORIA PORTFELA'], ['settings', 'gear', 'USTAWIENIA']];
    return `
    <div class="page-head">${ic('user')}<div><h2>TWÓJ PROFIL</h2><small>PODSTAWOWE INFORMACJE O TWOIM KONCIE</small></div><span class="r18">18+</span></div>
    <div class="prof-top">
        <div class="panel prof-card">
            <div class="prof-ava">${avatar(me(), 'xl')}</div>
            <div class="prof-info">
                <div class="prof-name">${ic('bike')}${esc(state.name)}</div>
                <button class="link" data-act="go" data-arg="#/profile/settings">Zmień nick i kolor</button>
                <div class="prof-pills"><span class="pill money-pill">${ic('wallet')}${money(state.balance)}</span><span class="pill gem-pill">${ic('gem')}${state.gems}</span></div>
            </div>
            <div class="prof-btns">
                <button class="btn btn-green btn-xl" data-act="depositModal">${ic('bike')}DOŁADUJ KONTO (+10%)</button>
                <button class="btn btn-dark btn-xl" data-act="promoModal">${ic('gift')}KOD PROMOCYJNY</button>
            </div>
        </div>
        <div class="panel lvl-card">
            <div class="lvl-head"><h3>Twój poziom</h3><span class="link" title="Za każdy wydany $1 dostajesz 100 EXP. Awans daje gemy.">Jak działają poziomy? ${ic('info')}</span></div>
            <div class="lvl-row">
                <div class="hex">${L}</div>
                <div class="lvl-bar-wrap">
                    <div class="lvl-labels"><b>Poziom ${L}</b><b>Poziom ${L + 1}</b></div>
                    <div class="lvl-bar"><div style="width:${pct.toFixed(2)}%"></div><span>${state.exp - a}/${b - a} EXP</span><em>${pct.toFixed(2)}%</em></div>
                </div>
            </div>
        </div>
    </div>
    <div class="promo-banner">${ic('gift', 'big')}<div><b>ODBIERZ CODZIENNĄ SKRZYNKĘ</b><span>I DARMOWE SKRZYNKI ZA POZIOMY</span></div><div class="pb-art">${caseArt(CASE.daily)}</div><button class="btn btn-white" data-act="go" data-arg="#/free">${ic('gift')}ODBIERZ</button></div>
    <div class="info-row">
        <div class="panel info-card red">${ic('info')}<div><b>To jest symulator</b><span>Wszystkie monety, gemy i skiny są wirtualne. Nie da się ich kupić ani wypłacić.</span></div></div>
        <div class="panel info-card yellow">${ic('tag')}<div><b>Kody promocyjne</b><span>Wpisz kod, np. <code translate="no">ROWER4SKINS</code>, i zgarnij bonus.</span></div><button class="btn btn-outline" data-act="promoModal">WPISZ KOD</button></div>
    </div>
    <div class="tabs">${tabs.map(([k, i, t]) => `<button class="${tab === k ? 'on' : ''}" data-act="go" data-arg="#/profile/${k}">${ic(i)}${t}</button>`).join('')}</div>
    ${body}`;
}

// ============================================================
// Darmowe skrzynki i event
// ============================================================

function renderGems() {
    const tiers = CASES.filter(c => c.sec === 'gemtier');
    return `
    <div class="gems-hero">
        <div class="gh-text">
            <span class="eyebrow">${ic('gem')}SKLEP GEMÓW</span>
            <h1>SKRZYNKI ZA GEMY</h1>
            <p>Gemy zdobywasz za granie: 10 gemów za każdy wydany dolar, 100× poziom za każdy awans, gemy za wpłaty rowerów, misje i kody. Im wyższy poziom skrzynki, tym więcej Covert i noży.</p>
        </div>
        <div class="gh-bal"><small>TWOJE GEMY</small><b>${ic('gem')}${state.gems}</b><button class="btn btn-purple" data-act="go" data-arg="#/event">${ic('star')}Misje za gemy</button></div>
    </div>
    <div class="gtiers">${tiers.map(c => {
        const can = state.gems >= c.gems;
        return `<div class="gcard ${can ? 'can' : ''}" data-act="go" data-arg="#/case/${c.id}" style="--cc:${c.color}">
            <div class="gc-art">${caseArt(c)}</div>
            <div class="gc-foot"><span class="gc-name">${esc(c.name)}</span><span class="gc-price">${ic('gem')}${c.gems}</span></div>
            ${can ? '' : `<div class="gc-lock"><span>${ic('lock')}brakuje ${c.gems - state.gems}</span></div>`}
        </div>`;
    }).join('')}</div>`;
}

function renderFree() {
    const exp = CASES.filter(c => c.kind === 'exp');
    const lockedTag = c => {
        const l = lockReason(c);
        return l ? `<div class="lock-over">${ic('lock')}<span>${l}</span></div>` : '';
    };
    const dl = lockReason(CASE.daily);
    return `
    <div class="page-head">${ic('gift')}<div><h2>DARMOWE SKRZYNKI</h2><small>CODZIENNA SKRZYNKA I SKRZYNKI ZA POZIOMY</small></div></div>
    <div class="free-top">
        <div class="panel free-daily">
            <div class="fd-art">${caseArt(CASE.daily)}</div>
            <div><h3>Codzienna skrzynka</h3><p>Otwieraj ją za darmo raz na 24 godziny.</p>
            ${dl ? `<div class="lock-note">${ic('clock')}<span>${dl}</span></div>` : `<button class="btn btn-green btn-xl" data-act="go" data-arg="#/case/daily">${ic('gift')}OTWÓRZ ZA DARMO</button>`}</div>
        </div>
        <div class="panel free-lvl"><div class="hex">${level()}</div><div><h3>Twój poziom: ${level()}</h3><p>Zdobywasz 100 EXP za każdy wydany $1. Skrzynki poziomowe otwierasz raz na 24 h.</p></div></div>
    </div>
    <div class="sec-title">${ic('star')}<span>Skrzynki EXP</span></div>
    <div class="cgrid">${exp.map(c => caseCard(c, lockedTag(c))).join('')}</div>`;
}

function renderEvent() {
    return `${bannerHtml()}
    <div class="page-head">${ic('star')}<div><h2>MISJE EVENTU</h2><small>WYKONUJ ZADANIA I ZBIERAJ GEMY</small></div></div>
    <div class="missions">${MISSIONS.map(m => {
        const v = Math.min(m.goal, m.v());
        const done = v >= m.goal, claimed = state.claimed.includes(m.id);
        return `<div class="panel mission ${claimed ? 'claimed' : ''}">
            <div class="m-ico">${ic(done ? 'check' : 'star')}</div>
            <div class="m-body"><b>${m.t}</b><div class="m-bar"><div style="width:${(v / m.goal * 100).toFixed(1)}%"></div></div><small>${Number.isInteger(v) ? v : v.toFixed(2)} / ${m.goal}</small></div>
            <span class="pill gem-pill">${ic('gem')}${m.gems}</span>
            <button class="btn ${done && !claimed ? 'btn-green' : 'btn-dark'}" data-act="claim" data-arg="${m.id}" ${done && !claimed ? '' : 'disabled'}>${claimed ? 'ODEBRANO' : 'ODBIERZ'}</button>
        </div>`;
    }).join('')}</div>
    <div class="sec-title">${ic('cake')}<span>Skrzynki urodzinowe</span></div>
    <div class="cgrid">${USD_CASES.filter(c => c.sec === 'bday').map(c => caseCard(c)).join('')}</div>`;
}

// ============================================================
// Modale: wpłata, kod, ranking, powiadomienia, szuflada
// ============================================================

// ============================================================
// Wpłata roweru = minigra (im droższy rower, tym trudniej)
// ============================================================

const GAMES = {
    pump: { n: 'Napompuj oponę', icon: 'bolt', d: 'Klikaj „POMPUJ” (albo spację) tak szybko, jak umiesz, zanim skończy się czas.' },
    timing: { n: 'Trafienie w punkt', icon: 'target', d: 'Zatrzymaj wskaźnik w zielonej strefie. Każde trafienie przesuwa strefę.' },
    memory: { n: 'Szyfr kłódki', icon: 'lock', d: 'Zapamiętaj kolejność zapalających się pól i powtórz ją bez błędu.' },
    gears: { n: 'Zmiana biegów', icon: 'swap', d: 'Wciskaj strzałki w podanej kolejności. Pomyłka zabiera czas.' },
    ride: { n: 'Zjazd z góry', icon: 'bike', d: 'Omijaj kamienie i dziury, zmieniając pas strzałkami albo przyciskami.' },
    slalom: { n: 'Slalom G2', icon: 'scooter', d: 'Przejedź G2 przez bramki z pachołków. Trzymaj ◀ / ▶ (albo A / D, strzałki) — hulajnoga ma bezwładność, więc skręcaj wcześniej. Niebieskie plamy to lód: tam prawie nie da się hamować.' },
    climb: { n: 'Podjazd e-MTB', icon: 'bolt', d: 'Pedałuj na zmianę LEWA / PRAWA (← / → albo A / D) w równym rytmie — kadencja musi być w zielonej strefie. Ta sama noga dwa razy = poślizg łańcucha. TURBO (↑ / W / spacja) mocno pomaga, ale bateria szybko się kończy, a na końcu czeka ściana 36%.' },
    wheelie: { n: 'Wheelie OMEGA', icon: 'skull', d: 'Trzymaj Varga na tylnym kole: GAZ (↑ / W / spacja) podnosi przód, HAMULEC (↓ / S) go opuszcza. Nie dotknij przodem ziemi i nie przewróć się do tyłu. Wiatr i nierówności będą Ci przeszkadzać coraz mocniej.' },
};

function bikeInfo(i) {
    const b = BIKES[i];
    return { game: b[4], d: b[5] };
}

const stars = d => (d >= 7 ? `<span class="stars omega">OMEGA++++</span>` : d >= 6 ? `<span class="stars hc">★★★★★ HARDCORE</span>`
    : `<span class="stars" title="Trudność ${d}/5">${'★'.repeat(d)}<i>${'★'.repeat(5 - d)}</i></span>`);
const EXTREME = i => bikeInfo(i).d >= 6;
// Gemy za wpłatę: rosną z trudnością, a dla HARDCORE/OMEGA także z wartością roweru.
const bikeGems = i => { const { d } = bikeInfo(i), v = BIKES[i][1]; return d * 60 + (d >= 7 ? 2000 : d >= 6 ? Math.round(v * 1.2) : 0); };

function depositModal() {
    const card = (i, premium) => {
        const [n, v, c, img] = BIKES[i];
        const { game, d } = bikeInfo(i);
        return `<button class="bike ${premium ? 'premium' : ''}" data-act="mgIntro" data-arg="${i}" style="--bc:${c}">
            ${premium ? '<span class="bike-tag">PREMIUM</span>' : ''}${img ? `<img src="${img}" alt="${esc(n)}">` : bikeArt(c)}
            <b>${esc(n)}</b><span class="money">${money(v)}</span><small class="pos">+${money(round2(v * 0.1))} bonus · +${bikeGems(i)} gemów</small>
            <span class="bike-game">${ic(GAMES[game].icon)}${GAMES[game].n} ${stars(d)}</span></button>`;
    };
    const idx = BIKES.map((b, i) => i);
    modal(`<h2 class="mtitle">${ic('bike')}Wpłać rower</h2>
        <p class="muted center">Żeby wpłacić rower, musisz wygrać minigrę. Im droższy rower, tym trudniejsza gra. Nagroda: wartość roweru <b class="pos">+10%</b> i gemy.</p>
        <div class="bikes-premium">${idx.filter(i => BIKES[i][3]).reverse().map(i => card(i, true)).join('')}</div>
        <div class="bikes">${idx.filter(i => !BIKES[i][3]).map(i => card(i, false)).join('')}</div>
        <p class="muted center small">To symulator: rowery i dolary są wirtualne, nic nie jest pobierane.</p>`, 'wide');
}

let MG = null; // aktywna minigra: { stop, key }

function stopGame() {
    if (MG) { MG.stop(); MG = null; }
}

// Dopiski o zasadach dla najtrudniejszych rowerów.
const HC = {
    ride: 'HARDCORE: aż 50 sekund zjazdu, gęsta mgła, dwa pasy zawsze zablokowane, a pełne tempo (prawie 2×) przychodzi już po pół minuty.',
    slalom: 'HARDCORE: 45 sekund, bramki coraz węższe i coraz dalej od siebie, lód od 12. sekundy. Wolno ominąć tylko jedną bramkę.',
    climb: 'HARDCORE: 560 m pod górę w 57 sekund. Bez oszczędzania baterii na końcową ścianę nie ma szans.',
    wheelie: 'OMEGA++++: 35 sekund, wąska strefa 22–38°, silnik reaguje z opóźnieniem, a trzeba spędzić w strefie co najmniej 75% czasu. Powodzenia.',
};

function mgIntro(i) {
    stopGame();
    const [n, v] = BIKES[i];
    const { game, d } = bikeInfo(i);
    const g = GAMES[game];
    modal(`<div class="mg">
        <div class="mg-head">${ic(g.icon, 'big')}<div><small>WPŁATA: ${esc(n)} · ${money(round2(v * 1.1))}</small><h2>${g.n}</h2></div>${stars(d)}</div>
        <p class="mg-rules">${g.d}${d >= 6 && HC[game] ? ` <b class="neg">${HC[game]}</b>` : ''}</p>
        <div class="mg-stage" id="mgStage"><button class="btn btn-green btn-xl" data-act="mgStart" data-arg="${i}">${ic('bolt')}START</button></div>
        <div class="mrow"><button class="btn btn-dark" data-act="depositModal">${ic('back')}Inny rower</button></div>
    </div>`, 'wide game');
}

function mgEnd(i, won, msg) {
    stopGame();
    const [n, v] = BIKES[i];
    const { d } = bikeInfo(i);
    const stage = $('#mgStage');
    if (!stage) return;
    if (won) {
        const total = round2(v * 1.1), gems = bikeGems(i);
        wallet(total, `Wpłata: ${n}`);
        state.gems += gems;
        save();
        renderTop();
        note(`Wpłacono „${n}”: +${money(total)} i ${gems} gemów`);
        winSound(d >= 4);
        if (d >= 4) confetti();
        stage.innerHTML = `<div class="mg-result ok">${ic('check', 'big')}<h3>Udało się!</h3><p>${msg}</p><p>Na konto wpada <b class="pos">${money(total)}</b> i <b class="gemtxt">${gems} gemów</b>.</p>
            <div class="mrow"><button class="btn btn-green" data-act="modalclose">Super</button><button class="btn btn-dark" data-act="depositModal">Wpłać kolejny</button></div></div>`;
        if (route.name === 'profile') renderPage();
        if (route.name === 'home' && filt.afford) refreshSections();
    } else {
        beep(160, 0.35, 0.05, 'sawtooth');
        stage.innerHTML = `<div class="mg-result bad">${ic('x', 'big')}<h3>Nie tym razem</h3><p>${msg}</p>
            <div class="mrow"><button class="btn btn-green" data-act="mgStart" data-arg="${i}">${ic('refresh')}Spróbuj ponownie</button><button class="btn btn-dark" data-act="depositModal">Inny rower</button></div></div>`;
    }
}

// Pasek czasu wspólny dla gier.
function timerBar(ms, onEnd) {
    const bar = $('#mgTime');
    const t0 = performance.now();
    let raf = 0, dead = false;
    const loop = () => {
        if (dead) return;
        const left = Math.max(0, ms - (performance.now() - t0));
        if (bar) bar.style.width = (left / ms * 100) + '%';
        if (left <= 0) { dead = true; onEnd(); return; }
        raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return { stop: () => { dead = true; cancelAnimationFrame(raf); }, add: extra => { ms += extra; } };
}

const GAME_RUN = {
    pump(i, d, stage) {
        const need = 14 + d * 7, time = 6000;
        let n = 0;
        stage.innerHTML = `<div class="mg-time"><div id="mgTime"></div></div>
            <div class="pump"><svg viewBox="0 0 120 120" class="tyre" id="tyre"><circle cx="60" cy="60" r="44" fill="none" stroke="#1f2937" stroke-width="22"/><circle cx="60" cy="60" r="44" fill="none" stroke="#45d15b" stroke-width="22" stroke-dasharray="276.5" stroke-dashoffset="276.5" id="tyreFill" transform="rotate(-90 60 60)"/><circle cx="60" cy="60" r="14" fill="#374151"/><text x="60" y="66" text-anchor="middle" fill="#fff" font-size="16" font-weight="800" id="pumpN">0/${need}</text></svg>
            <button class="btn btn-green btn-xl pump-btn" data-act="mgTap">${ic('bolt')}POMPUJ!</button></div>`;
        const timer = timerBar(time, () => mgEnd(i, false, `Napompowano ${n} z ${need}. Za wolno!`));
        const tap = () => {
            n++;
            beep(300 + n * 12, 0.03, 0.03);
            $('#pumpN').textContent = `${n}/${need}`;
            $('#tyreFill').setAttribute('stroke-dashoffset', 276.5 * (1 - Math.min(1, n / need)));
            $('#tyre').style.transform = `scale(${1 + Math.min(1, n / need) * 0.12})`;
            if (n >= need) { timer.stop(); mgEnd(i, true, `Opona napompowana: ${need} kliknięć na czas.`); }
        };
        return { stop: () => timer.stop(), tap, key: e => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); tap(); } } };
    },

    timing(i, d, stage) {
        const need = 2 + Math.ceil(d / 2), width = 30 - d * 3.5, period = 1600 - d * 170;
        let lives = d <= 2 ? 3 : 2, hits = 0, zone = 0, raf = 0, dead = false, pos = 0;
        stage.innerHTML = `<div class="mg-info"><span>Trafienia: <b id="tHits">0/${need}</b></span><span>Życia: <b id="tLives">${'❤'.repeat(lives)}</b></span></div>
            <div class="tbar"><div class="tzone" id="tZone"></div><div class="tmark" id="tMark"></div></div>
            <button class="btn btn-green btn-xl" data-act="mgTap">${ic('target')}STOP!</button>`;
        const newZone = () => { zone = 5 + Math.random() * (90 - width); const z = $('#tZone'); z.style.left = zone + '%'; z.style.width = width + '%'; };
        newZone();
        const t0 = performance.now();
        const loop = () => {
            if (dead) return;
            const t = ((performance.now() - t0) % period) / period;
            pos = t < 0.5 ? t * 2 * 100 : (1 - t) * 2 * 100;
            $('#tMark').style.left = pos + '%';
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const tap = () => {
            if (pos >= zone && pos <= zone + width) {
                hits++;
                beep(900, 0.08, 0.05, 'triangle');
                $('#tHits').textContent = `${hits}/${need}`;
                if (hits >= need) { dead = true; mgEnd(i, true, `Wszystkie ${need} trafienia w punkt.`); return; }
                newZone();
            } else {
                lives--;
                beep(200, 0.15, 0.05, 'sawtooth');
                $('#tLives').textContent = '❤'.repeat(lives) || '—';
                if (lives <= 0) { dead = true; mgEnd(i, false, `Pudło! Trafiłeś ${hits} z ${need}.`); }
            }
        };
        return { stop: () => { dead = true; cancelAnimationFrame(raf); }, tap, key: e => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); tap(); } } };
    },

    memory(i, d, stage) {
        const len = [0, 4, 5, 6, 6, 7][d], flash = 720 - d * 45;
        const cols = ['#ef4444', '#22c55e', '#3b82f6', '#eab308'];
        const tones = [330, 440, 550, 660];
        const seq = Array.from({ length: len }, () => Math.floor(Math.random() * 4));
        let step = 0, input = false, dead = false;
        stage.innerHTML = `<div class="mg-info"><span id="mMsg">Patrz uważnie…</span><span>Długość szyfru: <b>${len}</b></span></div>
            <div class="pads">${cols.map((c, k) => `<button class="pad" style="--pc:${c}" data-act="mgPad" data-arg="${k}" disabled></button>`).join('')}</div>`;
        const pads = $$('.pad', stage);
        const lit = (k, ms) => { pads[k].classList.add('lit'); beep(tones[k], ms / 1000, 0.05, 'triangle'); setTimeout(() => pads[k]?.classList.remove('lit'), ms); };
        (async () => {
            await sleep(700);
            for (const k of seq) { if (dead) return; lit(k, flash); await sleep(flash + 180); }
            if (dead) return;
            input = true;
            pads.forEach(p => { p.disabled = false; });
            $('#mMsg').textContent = 'Twoja kolej! Powtórz szyfr.';
        })();
        const pad = k => {
            if (!input || dead) return;
            lit(Number(k), 200);
            if (Number(k) !== seq[step]) { dead = true; mgEnd(i, false, `Zły kolor na pozycji ${step + 1}. Kłódka zablokowana.`); return; }
            step++;
            $('#mMsg').textContent = `Dobrze! ${step}/${len}`;
            if (step >= len) { dead = true; setTimeout(() => mgEnd(i, true, `Szyfr ${len} kolorów złamany.`), 250); }
        };
        return { stop: () => { dead = true; }, pad, key: e => { const k = { 1: 0, 2: 1, 3: 2, 4: 3 }[e.key]; if (k !== undefined) pad(k); } };
    },

    gears(i, d, stage) {
        const count = 5 + d * 2, time = 9000 - d * 700;
        const A = ['←', '↑', '→', '↓'], K = { ArrowLeft: 0, ArrowUp: 1, ArrowRight: 2, ArrowDown: 3 };
        const seq = Array.from({ length: count }, () => Math.floor(Math.random() * 4));
        let at = 0, dead = false;
        stage.innerHTML = `<div class="mg-time"><div id="mgTime"></div></div>
            <div class="gseq" id="gSeq">${seq.map((k, n) => `<span class="${n === 0 ? 'cur' : ''}">${A[k]}</span>`).join('')}</div>
            <div class="garrows">${[1, 0, 3, 2].map(k => `<button class="btn btn-dark ga${k}" data-act="mgArrow" data-arg="${k}">${A[k]}</button>`).join('')}</div>`;
        const timer = timerBar(time, () => { dead = true; mgEnd(i, false, `Zdążyłeś zmienić ${at} z ${count} biegów.`); });
        const press = k => {
            if (dead) return;
            const spans = $$('#gSeq span');
            if (Number(k) === seq[at]) {
                beep(500 + at * 30, 0.05, 0.04);
                spans[at].className = 'ok';
                at++;
                if (at >= count) { dead = true; timer.stop(); mgEnd(i, true, `Wszystkie ${count} biegów zmienione na czas.`); return; }
                spans[at].className = 'cur';
            } else {
                beep(180, 0.12, 0.05, 'sawtooth');
                timer.add(-800);
                spans[at].classList.add('bad');
                setTimeout(() => spans[at]?.classList.remove('bad'), 250);
            }
        };
        return { stop: () => { dead = true; timer.stop(); }, arrow: press, key: e => { if (e.key in K) { e.preventDefault(); press(K[e.key]); } } };
    },

    wheelie(i, d, stage) {
        const survive = 35000, need = 0.75, LO = 22, HI = 38, FAIL_LO = 3, FAIL_HI = 62, LAG = 0.14;
        const img = new Image();
        img.src = IMG.varg;
        stage.innerHTML = `<div class="mg-time"><div id="mgTime" class="fill"></div></div>
            <div class="mg-info"><span>W strefie: <b id="wzPct">0%</b> (min. ${need * 100}%)</span><span>Kąt: <b id="wzAng">20°</b></span></div>
            <canvas id="wCv" width="420" height="300" class="ride wheelie"></canvas>
            <div class="garrows two"><button class="btn btn-red hold" data-hold="-1">▼ HAMULEC</button><button class="btn btn-green hold" data-hold="1">▲ GAZ</button></div>`;
        const cv = $('#wCv'), cx = cv.getContext('2d'), W = cv.width, H = cv.height;
        let a = 24, v = 0, input = 0, keys = new Set(), last = performance.now(), t0 = last, raf = 0, dead = false;
        let inZone = 0, total = 0, gust = 0, nextGust = 1800, bumpT = 0, eng = 0, mudT = -3;
        const holdBtns = $$('[data-hold]', stage);
        const setInput = () => {
            let u = 0;
            if (keys.has('up')) u += 1;
            if (keys.has('down')) u -= 1;
            input = Math.max(-1, Math.min(1, u));
        };
        holdBtns.forEach(b => {
            const k = b.dataset.hold === '1' ? 'up' : 'down';
            const on = e => { e.preventDefault(); keys.add(k); setInput(); b.classList.add('on'); };
            const off = () => { keys.delete(k); setInput(); b.classList.remove('on'); };
            b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
        });
        const draw = () => {
            cx.fillStyle = '#141a28'; cx.fillRect(0, 0, W, H);
            const gx = 90, gy = H - 50;
            // zegar kąta w prawym górnym rogu
            const kx = W - 70, ky = 100, R = 56;
            cx.lineWidth = 12;
            for (const [from, to, col] of [[0, LO, 'rgba(255,77,94,.5)'], [LO, HI, 'rgba(69,209,91,.8)'], [HI, 70, 'rgba(255,77,94,.5)']]) {
                cx.strokeStyle = col; cx.beginPath(); cx.arc(kx, ky, R, -to * Math.PI / 180, -from * Math.PI / 180); cx.stroke();
            }
            const na = -Math.max(0, Math.min(70, a)) * Math.PI / 180;
            cx.strokeStyle = '#ffc41f'; cx.lineWidth = 4; cx.lineCap = 'round';
            cx.beginPath(); cx.moveTo(kx, ky); cx.lineTo(kx + Math.cos(na) * (R + 10), ky + Math.sin(na) * (R + 10)); cx.stroke();
            cx.fillStyle = '#ffc41f'; cx.beginPath(); cx.arc(kx, ky, 5, 0, 7); cx.fill();
            // ziemia z przesuwającym się wzorem
            cx.fillStyle = '#0b0f19'; cx.fillRect(0, gy + 26, W, H);
            const off = ((performance.now() - t0) / 3) % 40;
            cx.fillStyle = '#263048'; for (let x = -off; x < W; x += 40) cx.fillRect(x, gy + 30, 20, 4);
            // motocykl obrócony wokół tylnego koła
            if (img.complete && img.naturalWidth) {
                // obrót wokół punktu styku tylnego koła z ziemią
                const bw = 250, bh = bw * img.naturalHeight / img.naturalWidth;
                cx.save(); cx.translate(gx, gy + 26); cx.rotate(-a * Math.PI / 180);
                cx.drawImage(img, -bw * 0.17, -bh * 0.985, bw, bh); cx.restore();
            }
            cx.font = '800 14px Saira, sans-serif';
            if (Math.abs(gust) > 8) { cx.fillStyle = 'rgba(147,197,253,.8)'; cx.fillText(tr(gust > 0 ? 'PODMUCH ↑' : 'PODMUCH ↓'), W - 120, 24); }
            if (mudT > 0) { cx.fillStyle = 'rgba(161,98,7,.9)'; cx.fillText(tr('BŁOTO — silnik muli!'), 12, 24); cx.fillStyle = 'rgba(120,72,20,.55)'; cx.fillRect(0, gy + 24, W, 12); }
        };
        const loop = now => {
            if (dead) return;
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;
            const t = now - t0, p = Math.min(1, t / survive);
            // Niestabilna równowaga wokół 30°: im dalej, tym mocniej ciągnie w tę stronę. Z czasem coraz silniej.
            const G = 3.0 + 3.6 * p;
            // Odcinki błota (od 12 s): silnik reaguje jeszcze wolniej.
            mudT -= dt;
            if (t > 12000 && mudT <= -2.5 && Math.random() < dt * 0.35) mudT = 2.2;
            const mud = mudT > 0;
            // Silnik reaguje z opóźnieniem — gaz i hamulec działają po chwili.
            eng += (input - eng) * Math.min(1, dt / (mud ? LAG * 2 : LAG));
            nextGust -= dt * 1000;
            if (nextGust <= 0) { gust = (Math.random() < 0.5 ? -1 : 1) * (45 + 55 * p + Math.random() * 30); nextGust = 1000 + Math.random() * (1600 - 800 * p); }
            gust *= Math.pow(0.12, dt);
            bumpT -= dt;
            let bump = 0;
            if (bumpT <= 0) { bump = (Math.random() - 0.5) * (40 + 80 * p); bumpT = 0.35 + Math.random() * 0.5; }
            const acc = G * (a - 30) + eng * (96 + 14 * p) + gust - 0.7 * v + bump + (Math.random() - 0.5) * 45;
            v += acc * dt;
            a += v * dt;
            total += dt;
            if (a >= LO && a <= HI) inZone += dt;
            draw();
            $('#wzPct').textContent = Math.round(inZone / Math.max(0.001, total) * 100) + '%';
            $('#wzAng').textContent = Math.round(a) + '°';
            const bar = $('#mgTime');
            if (bar) bar.style.width = p * 100 + '%';
            if (a <= FAIL_LO) { dead = true; mgEnd(i, false, 'Przednie koło uderzyło w ziemię. Wywrotka!'); return; }
            if (a >= FAIL_HI) { dead = true; mgEnd(i, false, 'Za mocno! Varg przewrócił się do tyłu.'); return; }
            if (t >= survive) {
                dead = true;
                const share = inZone / total;
                if (share >= need) mgEnd(i, true, `Wheelie przez 35 s, ${Math.round(share * 100)}% czasu w strefie. Legenda.`);
                else mgEnd(i, false, `Utrzymałeś się, ale tylko ${Math.round(share * 100)}% czasu w strefie (trzeba ${need * 100}%).`);
                return;
            }
            raf = requestAnimationFrame(loop);
        };
        img.onload = draw;
        raf = requestAnimationFrame(loop);
        const map = { ArrowUp: 'up', w: 'up', W: 'up', ' ': 'up', ArrowDown: 'down', s: 'down', S: 'down' };
        return {
            stop: () => { dead = true; cancelAnimationFrame(raf); },
            key: e => { const k = map[e.key]; if (k) { e.preventDefault(); keys.add(k); setInput(); } },
            keyup: e => { const k = map[e.key]; if (k) { keys.delete(k); setInput(); } },
            // do testów automatycznych
            peek: () => ({ a, v }),
            hold: u => { input = u; },
        };
    },

    ride(i, d, stage) {
        const extreme = d >= 5, hard = d >= 6;
        const survive = (hard ? 50 : extreme ? 24 : 8 + d * 2) * 1000, speed = hard ? 370 : extreme ? 330 : 220 + d * 55, spawn = extreme ? 400 : 900 - d * 110;
        // Tempo rośnie do 1,6× (5 gwiazdek) pod koniec zjazdu, a w HARDCORE do 1,9× już po 30 s — i tak zostaje do końca.
        const boost = t => (extreme ? 1 + (hard ? 0.9 : 0.6) * Math.min(1, t / (hard ? 30000 : survive)) : 1);
        stage.innerHTML = `<div class="mg-time"><div id="mgTime" class="fill"></div></div>
            <canvas id="rideCv" width="360" height="420" class="ride"></canvas>
            <div class="garrows two"><button class="btn btn-dark" data-act="mgLane" data-arg="-1">◀</button><button class="btn btn-dark" data-act="mgLane" data-arg="1">▶</button></div>`;
        const cv = $('#rideCv'), cx = cv.getContext('2d');
        const W = cv.width, H = cv.height, LW = W / 3;
        const ROW_GAP = hard ? 168 : 175;
        let lane = 1, px = LW * 1.5, obs = [], last = performance.now(), t0 = last, nextSpawn = 400, raf = 0, dead = false, lastFree = 1, lastRowY = null;
        const draw = () => {
            cx.fillStyle = '#1b2233'; cx.fillRect(0, 0, W, H);
            cx.strokeStyle = 'rgba(255,255,255,.25)'; cx.setLineDash([18, 16]); cx.lineWidth = 3;
            const off = ((performance.now() - t0) / 1000 * speed * boost(performance.now() - t0)) % 34;
            for (const x of [LW, LW * 2]) { cx.lineDashOffset = -off; cx.beginPath(); cx.moveTo(x, 0); cx.lineTo(x, H); cx.stroke(); }
            cx.setLineDash([]);
            for (const o of obs) {
                if (o.kind === 0) { cx.fillStyle = '#6b7280'; cx.beginPath(); cx.ellipse(o.x, o.y, 26, 20, 0, 0, 7); cx.fill(); cx.fillStyle = '#9ca3af'; cx.beginPath(); cx.ellipse(o.x - 6, o.y - 6, 9, 6, 0, 0, 7); cx.fill(); }
                else { cx.fillStyle = '#05070b'; cx.beginPath(); cx.ellipse(o.x, o.y, 32, 16, 0, 0, 7); cx.fill(); cx.strokeStyle = '#3f2a14'; cx.lineWidth = 4; cx.stroke(); }
            }
            // rowerzysta
            const y = H - 70;
            cx.strokeStyle = '#ffc41f'; cx.lineWidth = 5; cx.lineCap = 'round';
            cx.beginPath(); cx.arc(px, y + 34, 13, 0, 7); cx.stroke();
            cx.beginPath(); cx.arc(px, y - 10, 13, 0, 7); cx.stroke();
            cx.beginPath(); cx.moveTo(px, y - 10); cx.lineTo(px, y + 34); cx.stroke();
            cx.strokeStyle = '#a54ef2'; cx.beginPath(); cx.moveTo(px - 16, y - 18); cx.lineTo(px + 16, y - 18); cx.stroke();
            if (hard) {
                // mgła: przeszkody widać dopiero w dolnej części trasy
                const g = cx.createLinearGradient(0, 0, 0, H * 0.64);
                g.addColorStop(0, 'rgba(12,15,24,1)'); g.addColorStop(0.7, 'rgba(12,15,24,.93)'); g.addColorStop(1, 'rgba(12,15,24,0)');
                cx.fillStyle = g; cx.fillRect(0, 0, W, H * 0.64);
            }
        };
        const loop = now => {
            if (dead) return;
            const dt = Math.min(0.05, (now - last) / 1000);
            last = now;
            px += (LW * (lane + 0.5) - px) * Math.min(1, dt * 14);
            const k = boost(now - t0);
            nextSpawn -= dt * 1000 * k;
            // Tryb ekstremalny: rzędy co stałą odległość, a wolny pas przesuwa się najwyżej o jeden,
            // więc zawsze da się przejechać — trzeba tylko szybko reagować.
            const due = extreme ? (lastRowY === null || lastRowY >= -30 + ROW_GAP) : nextSpawn <= 0;
            if (due) {
                const free = extreme ? Math.max(0, Math.min(2, lastFree + Math.floor(Math.random() * 3) - 1)) : Math.floor(Math.random() * 3);
                const lanes = [0, 1, 2].filter(l => l !== free && (hard || Math.random() < (extreme ? 0.8 : 0.55)));
                (lanes.length ? lanes : [(free + 1) % 3]).forEach(l => obs.push({ x: LW * (l + 0.5), y: -30, kind: Math.random() < 0.5 ? 0 : 1 }));
                nextSpawn = spawn * (0.8 + Math.random() * 0.5);
                lastFree = free;
                lastRowY = -30;
            }
            for (const o of obs) o.y += speed * k * dt;
            if (lastRowY !== null) lastRowY += speed * k * dt;
            obs = obs.filter(o => o.y < H + 40);
            const by = H - 70;
            if (obs.some(o => Math.abs(o.x - px) < 34 && o.y > by - 36 && o.y < by + 50)) { dead = true; draw(); mgEnd(i, false, 'Wywrotka! Przeszkoda na trasie.'); return; }
            draw();
            const left = survive - (now - t0);
            const bar = $('#mgTime');
            if (bar) bar.style.width = (100 - Math.max(0, left) / survive * 100) + '%';
            if (left <= 0) { dead = true; mgEnd(i, true, `Zjazd ukończony bez wywrotki (${survive / 1000} s).`); return; }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const move = dir => { lane = Math.max(0, Math.min(2, lane + Number(dir))); };
        cv.addEventListener('pointerdown', e => { const r = cv.getBoundingClientRect(); move(e.clientX - r.left < r.width / 2 ? -1 : 1); });
        return { stop: () => { dead = true; cancelAnimationFrame(raf); }, lane: move, key: e => { if (e.key === 'ArrowLeft' || e.key === 'a') { e.preventDefault(); move(-1); } if (e.key === 'ArrowRight' || e.key === 'd') { e.preventDefault(); move(1); } } };
    },

    // Kukirin G2: slalom między pachołkami, sterowanie z bezwładnością.
    slalom(i, d, stage) {
        const survive = 45000, MISS_OK = 1, W = 360, H = 440, SY = H - 84, GATE_D = 190, ACC = 1000, FR = 4.6;
        stage.innerHTML = `<div class="mg-time"><div id="mgTime" class="fill"></div></div>
            <div class="mg-info"><span>Bramki: <b id="slOk">0</b></span><span>Pudła: <b id="slMiss">0</b> / ${MISS_OK}</span></div>
            <canvas id="slCv" width="${W}" height="${H}" class="ride"></canvas>
            <div class="garrows two"><button class="btn btn-dark hold" data-hold="-1">◀ LEWO</button><button class="btn btn-dark hold" data-hold="1">PRAWO ▶</button></div>`;
        const cv = $('#slCv'), cx = cv.getContext('2d');
        let x = W / 2, vx = 0, input = 0, keys = new Set(), last = performance.now(), t0 = last, raf = 0, dead = false;
        let gates = [], ice = [], travel = 0, nextGate = 120, prevCx = W / 2, ok = 0, miss = 0, flash = 0, flashCol = '', onIce = 0;
        const setInput = () => { input = (keys.has('r') ? 1 : 0) - (keys.has('l') ? 1 : 0); };
        $$('[data-hold]', stage).forEach(b => {
            const k = b.dataset.hold === '1' ? 'r' : 'l';
            const on = e => { e.preventDefault(); keys.add(k); setInput(); b.classList.add('on'); };
            const off = () => { keys.delete(k); setInput(); b.classList.remove('on'); };
            b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
        });
        const cone = (cxp, cy) => {
            cx.fillStyle = '#f97316'; cx.beginPath(); cx.moveTo(cxp, cy - 16); cx.lineTo(cxp + 9, cy + 8); cx.lineTo(cxp - 9, cy + 8); cx.closePath(); cx.fill();
            cx.fillStyle = '#fff'; cx.fillRect(cxp - 5.5, cy - 4, 11, 4);
            cx.fillStyle = '#7c2d12'; cx.fillRect(cxp - 12, cy + 8, 24, 4);
        };
        const draw = now => {
            cx.fillStyle = '#20242e'; cx.fillRect(0, 0, W, H);
            cx.fillStyle = '#394150'; cx.fillRect(0, 0, 10, H); cx.fillRect(W - 10, 0, 10, H);
            cx.strokeStyle = 'rgba(255,255,255,.12)'; cx.setLineDash([22, 18]); cx.lineWidth = 3; cx.lineDashOffset = -travel % 40;
            cx.beginPath(); cx.moveTo(W / 2, 0); cx.lineTo(W / 2, H); cx.stroke(); cx.setLineDash([]);
            for (const p of ice) { cx.fillStyle = 'rgba(125,211,252,.28)'; cx.beginPath(); cx.ellipse(p.x, p.y, p.r, p.r * 0.55, 0, 0, 7); cx.fill(); }
            for (const g of gates) {
                if (!g.done) { cx.strokeStyle = 'rgba(255,196,31,.35)'; cx.setLineDash([6, 6]); cx.lineWidth = 2; cx.beginPath(); cx.moveTo(g.cx - g.gap / 2, g.y); cx.lineTo(g.cx + g.gap / 2, g.y); cx.stroke(); cx.setLineDash([]); }
                cone(g.cx - g.gap / 2, g.y); cone(g.cx + g.gap / 2, g.y);
            }
            // hulajnoga z góry, przechyla się przy skręcie
            cx.save(); cx.translate(x, SY); cx.rotate(vx / 900);
            cx.fillStyle = '#111'; cx.fillRect(-5, -34, 10, 14); cx.fillRect(-5, 22, 10, 14);
            cx.fillStyle = '#6b7280'; cx.fillRect(-9, -22, 18, 46);
            cx.fillStyle = '#f97316'; cx.fillRect(-9, -2, 18, 5);
            cx.strokeStyle = '#d1d5db'; cx.lineWidth = 4; cx.lineCap = 'round'; cx.beginPath(); cx.moveTo(-18, -30); cx.lineTo(18, -30); cx.stroke();
            cx.fillStyle = '#a54ef2'; cx.beginPath(); cx.arc(0, -6, 9, 0, 7); cx.fill();
            cx.restore();
            if (onIce > 0) { cx.font = '800 14px Saira, sans-serif'; cx.fillStyle = 'rgba(125,211,252,.95)'; cx.fillText(tr('LÓD!'), 16, 26); }
            if (flash > 0) { cx.fillStyle = flashCol; cx.globalAlpha = Math.min(0.35, flash); cx.fillRect(0, 0, W, H); cx.globalAlpha = 1; }
        };
        const loop = now => {
            if (dead) return;
            const dt = Math.min(0.033, (now - last) / 1000);
            last = now;
            const t = now - t0, p = Math.min(1, t / (survive * 0.75));
            const speed = 250 * (1 + 0.8 * p);
            travel += speed * dt;
            nextGate -= speed * dt;
            if (nextGate <= 0) {
                const gap = Math.max(80, 126 - 48 * p);
                // Przesunięcie bramki nie większe, niż hulajnoga zdąży przejechać w bok (zawsze da się przejechać).
                const T = GATE_D / speed, reach = ACC / FR * (T - (1 - Math.exp(-T * FR)) / FR);
                const span = Math.min(90 + 75 * p, 0.85 * reach + gap / 2 - 14);
                const lo = 24 + gap / 2, hi = W - 24 - gap / 2;
                const c = Math.max(lo, Math.min(hi, prevCx + (Math.random() * 2 - 1) * span));
                gates.push({ y: -20, cx: c, gap, done: false });
                prevCx = c;
                nextGate = GATE_D;
                if (t > 12000 && Math.random() < 0.45) ice.push({ x: 40 + Math.random() * (W - 80), y: -60 - Math.random() * 60, r: 46 + Math.random() * 30 });
            }
            onIce = ice.some(q => Math.abs(q.x - x) < q.r && Math.abs(q.y - SY) < q.r * 0.55) ? 0.5 : Math.max(0, onIce - dt);
            const acc = onIce > 0 ? 650 : ACC, fr = onIce > 0 ? 1.6 : FR;
            vx += (input * acc - vx * fr) * dt;
            x += vx * dt;
            if (x < 22) { x = 22; vx = Math.abs(vx) * 0.3; }
            if (x > W - 22) { x = W - 22; vx = -Math.abs(vx) * 0.3; }
            for (const g of gates) {
                const py = g.y;
                g.y += speed * dt;
                for (const q of [g.cx - g.gap / 2, g.cx + g.gap / 2]) {
                    if (!g.hit && Math.abs(q - x) < 17 && Math.abs(g.y - SY) < 14) { g.hit = true; }
                }
                if (!g.done && py < SY && g.y >= SY) {
                    g.done = true;
                    const inside = Math.abs(x - g.cx) < g.gap / 2 - 12;
                    if (inside && !g.hit) { ok++; beep(880 + Math.min(ok, 30) * 12, 0.05, 0.035, 'triangle'); flash = 0.25; flashCol = '#45d15b'; }
                    else { miss++; beep(170, 0.2, 0.05, 'sawtooth'); flash = 0.5; flashCol = '#ff4d5e'; }
                }
            }
            for (const q of ice) q.y += speed * dt;
            gates = gates.filter(g => g.y < H + 30);
            ice = ice.filter(q => q.y < H + 100);
            flash = Math.max(0, flash - dt * 1.5);
            draw(now);
            $('#slOk').textContent = ok;
            $('#slMiss').textContent = miss;
            const bar = $('#mgTime');
            if (bar) bar.style.width = Math.min(100, t / survive * 100) + '%';
            if (miss > MISS_OK) { dead = true; mgEnd(i, false, `Za dużo ominiętych bramek (${miss}). Kukirin wraca do sklepu.`); return; }
            if (t >= survive) { dead = true; mgEnd(i, true, `Slalom ukończony: ${ok} bramek, ${miss} pudło.`); return; }
            raf = requestAnimationFrame(loop);
        };
        raf = requestAnimationFrame(loop);
        const map = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' };
        return {
            stop: () => { dead = true; cancelAnimationFrame(raf); },
            key: e => { const k = map[e.key]; if (k) { e.preventDefault(); keys.add(k); setInput(); } },
            keyup: e => { const k = map[e.key]; if (k) { keys.delete(k); setInput(); } },
            peek: () => ({ x, vx, gates: gates.filter(g => !g.done).map(g => ({ y: g.y, cx: g.cx, gap: g.gap })), ice: onIce > 0 }),
            hold: u => { input = u; },
        };
    },

    // Electrix KMA: podjazd na e-MTB — kadencja, bateria i ściana na końcu.
    climb(i, d, stage) {
        const LIMIT = 57000, LEN = 560, W = 420, H = 300;
        const PROF = [[0, 0.04], [80, 0.12], [170, 0.06], [230, 0.18], [330, 0.08], [390, 0.24], [490, 0.36], [560, 0.36]];
        const slope = m => {
            for (let k = 1; k < PROF.length; k++) {
                const [a, sa] = PROF[k - 1], [b, sb] = PROF[k];
                if (m <= b) return sa + (sb - sa) * (m - a) / (b - a);
            }
            return PROF[PROF.length - 1][1];
        };
        // wysokość terenu (do rysowania) — całka ze spadku
        const hAt = [];
        for (let m = 0, h = 0; m <= LEN + 200; m += 2) { hAt.push(h); h += slope(m) * 2; }
        const heightAt = m => hAt[Math.max(0, Math.min(hAt.length - 1, Math.round(m / 2)))];
        const img = new Image();
        img.src = IMG.kma;
        stage.innerHTML = `<div class="mg-time"><div id="mgTime" class="fill"></div></div>
            <div class="mg-info"><span>Dystans: <b id="clDist">0</b> / ${LEN} m</span><span>Nachylenie: <b id="clSlope">4%</b></span><span>Bateria: <b id="clBat">100%</b></span></div>
            <canvas id="clCv" width="${W}" height="${H}" class="ride wheelie"></canvas>
            <div class="garrows three"><button class="btn btn-dark" data-pedal="l">◀ LEWA</button><button class="btn btn-purple hold" data-turbo="1">⚡ TURBO</button><button class="btn btn-dark" data-pedal="r">PRAWA ▶</button></div>`;
        const cv = $('#clCv'), cx = cv.getContext('2d');
        let pos = 0, v = 0, rate = 0, lastTap = 0, lastSide = '', bat = 100, turbo = false, stall = 0, slip = 0;
        let last = performance.now(), t0 = last, raf = 0, dead = false;
        const tap = side => {
            const now = performance.now();
            if (side === lastSide) { rate *= 0.45; slip = 0.8; beep(140, 0.08, 0.04, 'sawtooth'); }
            else {
                const inst = lastTap ? 1000 / Math.max(90, now - lastTap) : 2;
                rate = rate * 0.55 + inst * 0.45;
                beep(side === 'l' ? 330 : 392, 0.03, 0.02, 'triangle');
            }
            lastSide = side; lastTap = now;
        };
        $$('[data-pedal]', stage).forEach(b => b.addEventListener('pointerdown', e => { e.preventDefault(); tap(b.dataset.pedal); b.classList.add('on'); setTimeout(() => b.classList.remove('on'), 90); }));
        const tb = $('[data-turbo]', stage);
        const tOn = e => { e.preventDefault(); turbo = true; tb.classList.add('on'); }, tOff = () => { turbo = false; tb.classList.remove('on'); };
        tb.addEventListener('pointerdown', tOn); tb.addEventListener('pointerup', tOff); tb.addEventListener('pointerleave', tOff); tb.addEventListener('pointercancel', tOff);
        const rpmNow = now => {
            const since = now - lastTap;
            // bez kolejnego naciśnięcia kadencja szybko spada
            return (since > 350 ? rate * Math.max(0, 1 - (since - 350) / 700) : rate) * 20;
        };
        const draw = (now, rpm) => {
            cx.fillStyle = '#141a28'; cx.fillRect(0, 0, W, H);
            // teren: 1 m = 3 px, rowerzysta na x=120
            const S = 3, bx = 120, base = H - 70, h0 = heightAt(pos);
            cx.beginPath(); cx.moveTo(0, H);
            for (let px = 0; px <= W; px += 4) { const m = pos + (px - bx) / S; cx.lineTo(px, base - (heightAt(Math.max(0, m)) - h0) * S); }
            cx.lineTo(W, H); cx.closePath();
            cx.fillStyle = '#2a3348'; cx.fill();
            cx.strokeStyle = '#4ade80'; cx.lineWidth = 3; cx.stroke();
            // meta
            const fx = bx + (LEN - pos) * S;
            if (fx < W + 10) { const fy = base - (heightAt(LEN) - h0) * S; cx.fillStyle = '#fff'; cx.fillRect(fx, fy - 46, 3, 46); cx.fillStyle = '#ffc41f'; cx.fillRect(fx + 3, fy - 46, 22, 14); }
            // rower
            if (img.complete && img.naturalWidth) {
                const ang = Math.atan(slope(pos)), bw = 110, bh = bw * img.naturalHeight / img.naturalWidth;
                cx.save(); cx.translate(bx, base); cx.rotate(-ang); cx.drawImage(img, -bw / 2, -bh + 4, bw, bh); cx.restore();
            }
            // kadencja
            const gx = 16, gy = 16, gw = 180, gh = 14, max = 140;
            cx.fillStyle = 'rgba(255,255,255,.08)'; cx.fillRect(gx, gy, gw, gh);
            cx.fillStyle = 'rgba(69,209,91,.45)'; cx.fillRect(gx + gw * 60 / max, gy, gw * 40 / max, gh);
            cx.fillStyle = rpm >= 60 && rpm <= 100 ? '#45d15b' : '#ff4d5e';
            cx.fillRect(gx + Math.min(gw, gw * rpm / max) - 2, gy - 3, 4, gh + 6);
            cx.font = '800 12px Saira, sans-serif'; cx.fillStyle = '#cbd5e1'; cx.fillText(`${tr('KADENCJA')} ${Math.round(rpm)} rpm`, gx, gy + gh + 14);
            // bateria
            const bxp = W - 110, byp = 14;
            cx.strokeStyle = '#cbd5e1'; cx.lineWidth = 2; cx.strokeRect(bxp, byp, 80, 20); cx.fillStyle = '#cbd5e1'; cx.fillRect(bxp + 80, byp + 6, 4, 8);
            cx.fillStyle = bat > 30 ? '#45d15b' : bat > 12 ? '#ffc41f' : '#ff4d5e'; cx.fillRect(bxp + 2, byp + 2, 76 * bat / 100, 16);
            if (turbo && bat > 0) { cx.fillStyle = '#c084fc'; cx.fillText('⚡ TURBO', bxp, byp + 36); }
            if (slip > 0) { cx.fillStyle = '#ff4d5e'; cx.fillText(tr('POŚLIZG ŁAŃCUCHA!'), gx, gy + 48); }
            if (stall > 0.2) { cx.fillStyle = '#ff4d5e'; cx.font = '900 18px Saira, sans-serif'; cx.textAlign = 'center'; cx.fillText(tr('STAJESZ!'), W / 2, H / 2 - 40); cx.textAlign = 'left'; }
        };
        const loop = now => {
            if (dead) return;
            // Limit czasu liczy się w prawdziwych sekundach, więc fizykę liczymy w małych krokach
            // (na wolnym telefonie gra nie zwalnia).
            const dtAll = Math.min(0.25, (now - last) / 1000);
            last = now;
            const t = now - t0;
            const rpm = rpmNow(now);
            const eff = rpm < 60 ? rpm / 60 * 0.75 : rpm <= 100 ? 1 : Math.max(0.25, 1 - (rpm - 100) / 50);
            for (let left = dtAll; left > 0; left -= 0.02) {
                const dt = Math.min(0.02, left);
                const boost = turbo && bat > 0;
                if (boost) bat = Math.max(0, bat - 9 * dt);
                const F = 4.6 * eff * (boost ? 1.8 : 1);
                v = Math.max(0, v + (F - (slope(pos) * 12.74 + 0.4 + 0.02 * v * v)) * dt);
                pos += v * dt;
                slip = Math.max(0, slip - dt);
                if (v < 0.4 && t > 2500) stall += dt; else stall = 0;
            }
            const sl = slope(pos);
            draw(now, rpm);
            $('#clDist').textContent = Math.min(LEN, Math.floor(pos));
            $('#clSlope').textContent = Math.round(sl * 100) + '%';
            $('#clBat').textContent = Math.ceil(bat) + '%';
            const bar = $('#mgTime');
            if (bar) bar.style.width = Math.min(100, t / LIMIT * 100) + '%';
            if (pos >= LEN) { dead = true; mgEnd(i, true, `Podjazd zdobyty w ${(t / 1000).toFixed(1)} s, zostało ${Math.ceil(bat)}% baterii.`); return; }
            if (stall > 1.2) { dead = true; mgEnd(i, false, `Stanąłeś na ${Math.round(sl * 100)}% nachylenia (${Math.floor(pos)} m). ${bat <= 0 ? 'Bateria pusta.' : 'Trzeba było użyć turbo.'}`); return; }
            if (t >= LIMIT) { dead = true; mgEnd(i, false, `Czas minął na ${Math.floor(pos)} m z ${LEN}. Szybciej i równiej!`); return; }
            raf = requestAnimationFrame(loop);
        };
        img.onload = () => draw(performance.now(), 0);
        raf = requestAnimationFrame(loop);
        const pedal = { ArrowLeft: 'l', a: 'l', A: 'l', ArrowRight: 'r', d: 'r', D: 'r' }, tk = { ArrowUp: 1, w: 1, W: 1, ' ': 1 };
        return {
            stop: () => { dead = true; cancelAnimationFrame(raf); },
            key: e => { if (pedal[e.key]) { e.preventDefault(); if (!e.repeat) tap(pedal[e.key]); } else if (tk[e.key]) { e.preventDefault(); turbo = true; } },
            keyup: e => { if (tk[e.key]) turbo = false; },
            peek: () => ({ pos, v, bat, slope: slope(pos) }),
            tap, setTurbo: on => { turbo = on; },
        };
    },
};

function mgStart(i) {
    stopGame();
    if (!$('#mgStage')) mgIntro(i);
    const { game, d } = bikeInfo(i);
    MG = GAME_RUN[game](i, d, $('#mgStage'));
}

function promoModal() {
    modal(`<h2 class="mtitle">${ic('gift')}Kod promocyjny</h2>
        <p class="muted center">Wpisz kod i odbierz bonus. Każdy kod działa raz.</p>
        <form class="inline" id="promoForm"><input id="promoIn" placeholder="np. ROWER4SKINS" autocomplete="off" aria-label="Kod promocyjny"><button class="btn btn-green">Odbierz</button></form>`);
    $('#promoIn').focus();
}

let rankBots = null;

function rankingModal() {
    rankBots = rankBots || BOT_NAMES.map(n => {
        const r = srand(hash(n));
        const rich = SKINS.filter(s => s.price > 5);
        return { name: n, wagered: round2(40 + r() * r() * 6000), best: rich[Math.floor(r() * rich.length)].id };
    });
    const myBest = state.inv.length ? [...state.inv].sort((a, b) => SKIN[b.id].price - SKIN[a.id].price)[0].id : null;
    const rows = [...rankBots, { name: state.name, you: true, wagered: state.stats.wagered, best: myBest }].sort((a, b) => b.wagered - a.wagered);
    modal(`<h2 class="mtitle">${ic('trophy')}Ranking graczy</h2>
        <div class="table rank">${rows.map((r, i) => `<div class="trow ${r.you ? 'you' : ''}">
            <span class="rk ${i < 3 ? 'top' + i : ''}">${i + 1}</span>
            <span class="rname" translate="no">${avatar(r.you ? me() : { name: r.name }, 'xs')}${esc(r.name)}</span>
            <span>Poz. ${level(Math.round(r.wagered * 100))}</span>
            <span class="muted">${r.best ? esc(SKIN[r.best].name) : '—'}</span>
            <b class="money">${money(r.wagered)}</b></div>`).join('')}</div>
        <p class="muted center small">Ranking według łącznej kwoty wydanej na skrzynki i bitwy. Pozostali gracze to boty.</p>`, 'wide');
}

function notesModal() {
    state.unread = 0;
    save();
    renderTop();
    modal(`<h2 class="mtitle">${ic('bell')}Powiadomienia</h2>
        ${state.notes.length ? `<div class="table">${state.notes.map(n => `<div class="trow"><span>${fmtTime(n.t)}</span><span>${esc(n.text)}</span></div>`).join('')}</div>` : `<div class="empty small">Brak powiadomień.</div>`}`);
}

const emptyInv = () => `<div class="empty meme-empty"><img src="${IMG.golab}" alt="Gołąb z talerzem kurczaka"><p><b>Gołąb zjadł wszystkie Twoje skiny.</b><br>Otwórz skrzynkę, żeby coś mu uciekło.</p><button class="btn btn-green" data-act="go" data-arg="#/">Do skrzynek</button></div>`;

function renderDrawer() {
    $('#drawer').innerHTML = `<div class="drawer-head"><h3>${ic('box')}Twoje przedmioty (${state.inv.length})</h3><span class="money">${money(invValue())}</span>
        <button class="btn btn-green" data-act="sellAll" ${state.inv.length ? '' : 'disabled'}>Sprzedaj wszystko</button>
        <button class="sq" data-act="drawer" aria-label="Zamknij">${ic('x')}</button></div>
        ${state.inv.length ? `<div class="igrid sm">${state.inv.slice(0, 60).map(i => itemCard(SKIN[i.id], { wear: i.w, bottom: `<button class="sell-btn" data-act="sell" data-arg="${i.uid}">${ic('wallet')}Sprzedaj</button>` })).join('')}</div>`
            : emptyInv()}`;
}

// ============================================================
// Akcje (delegacja kliknięć)
// ============================================================

function refreshAfterInv() {
    if (!$('#drawer').hidden) renderDrawer();
    if (['profile', 'contract', 'exchanger'].includes(route.name)) renderPage();
}

// Akcje, po których okno modalne ma zostać otwarte (np. kolejne dodawanie skrzynek).
const KEEP_MODAL = ['modalclose', 'winsell', 'crAdd', 'mgIntro', 'mgStart', 'mgTap', 'mgPad', 'mgArrow', 'mgLane', 'depositModal'];

const ACT = {
    go: arg => go(arg),
    burger: () => $('#top').classList.toggle('open'),
    modalclose: () => closeModal(),
    fav: id => {
        state.favs = state.favs.includes(id) ? state.favs.filter(x => x !== id) : [...state.favs, id];
        save();
        $$(`[data-act="fav"][data-arg="${id}"]`).forEach(b => b.classList.toggle('on', state.favs.includes(id)));
        if (filt.fav) refreshSections();
    },
    ffav: (_, el) => { filt.fav = !filt.fav; el.classList.toggle('on', filt.fav); refreshSections(); },
    qty: n => { if (busy) return; qty = Number(n); $$('[data-act="qty"]').forEach(b => b.classList.toggle('on', b.dataset.arg === n)); updateOpenBar(); layoutReels(); },
    open: () => openCase(false),
    reopen: () => { if (route.name === 'case') openCase(false); },
    demo: () => openCase(true),
    winsell: () => { sellUids(winUids); closeModal(); refreshAfterInv(); },
    depositModal: () => depositModal(),
    mgIntro: i => mgIntro(Number(i)),
    mgStart: i => mgStart(Number(i)),
    mgTap: () => MG?.tap?.(),
    mgPad: k => MG?.pad?.(k),
    mgArrow: k => MG?.arrow?.(k),
    mgLane: d => MG?.lane?.(d),
    promoModal: () => promoModal(),
    notes: () => notesModal(),
    ranking: () => rankingModal(),
    drawer: () => { const d = $('#drawer'); d.hidden = !d.hidden; if (!d.hidden) renderDrawer(); },
    sell: uid => { sellUids([uid]); refreshAfterInv(); },
    sellAll: () => { if (state.inv.length) sellUids(state.inv.map(i => i.uid)); refreshAfterInv(); },
    hideDrops: (_, el) => { const hidden = $('#dropsbar').classList.toggle('collapsed'); el.textContent = hidden ? 'POKAŻ' : 'UKRYJ'; },
    dmode: (m, el) => { dropMode = m; $$('[data-act="dmode"]').forEach(b => b.classList.toggle('on', b === el)); renderDrops(false); },
    hidden: () => {
        state.hiddenFound = true;
        save();
        note('Znalazłeś ukrytą skrzynkę!');
        toast('Znalazłeś ukrytą skrzynkę! Otwórz ją za darmo.', 'ok');
        go('#/case/hidden');
    },
    claim: id => {
        const m = MISSIONS.find(x => x.id === id);
        if (!m || state.claimed.includes(id) || m.v() < m.goal) return;
        state.claimed.push(id);
        addGems(m.gems, `Misja „${m.t}”`);
        toast(`Odebrano ${m.gems} gemów!`, 'ok');
        renderPage();
    },

    // bitwy
    btab: t => { bl.tab = t; renderPage(); },
    bmode: m => { bl.mode = m; renderPage(); },
    join: arg => {
        const [key, want] = String(arg).split(':');
        const b = findBattle(key);
        if (!b || !canJoin(b)) { toast('Nie możesz dołączyć do tej bitwy.', 'err'); return; }
        const i = want !== undefined && !b.slots[Number(want)] ? Number(want) : b.slots.indexOf(null);
        if (state.balance < bValue(b)) { toast('Za mało środków na tę bitwę.', 'err'); return; }
        holdFor(b);
        SEAT = { h: b.host, b: b.id, i };
        publish();
        go('#/battle/' + b.bid);
    },
    watch: key => go('#/battle/' + key),
    summon: i => {
        if (!MYB || MYB.status !== 'waiting' || MYB.slots[Number(i)]) return;
        MYB.slots[Number(i)] = botPlayer();
        beep(700, 0.06, 0.04, 'triangle');
        publish();
        if (!MYB.slots.includes(null)) hostStart(); else renderPage();
    },
    bots: () => {
        if (!MYB || MYB.status !== 'waiting') return;
        MYB.slots = MYB.slots.map(sl => sl || botPlayer());
        publish();
        hostStart();
    },
    leaveBattle: () => {
        if (MYB && MYB.status === 'waiting') { MYB = null; releaseHold(); publish(); toast('Bitwa anulowana, opłata wróciła.'); go('#/battles'); return; }
        if (SEAT) { SEAT = null; releaseHold(); publish(); toast('Wyszedłeś z bitwy, opłata wróciła.'); go('#/battles'); }
    },
    toggleSound: () => { state.settings.sound = !state.settings.sound; save(); if (route.name === 'battle' && !RUN.get(route.arg)) renderPage(); toast(state.settings.sound ? 'Dźwięk włączony' : 'Dźwięk wyłączony'); },
    tpl: i => {
        const t = templates()[Number(i)];
        createBattle(t.mode, t.players, t.cases);
    },
    crAddModal: () => {
        modal(`<h2 class="mtitle">${ic('plus')}Dodaj skrzynkę</h2>
            <p class="muted center">Kliknij skrzynkę, żeby dodać rundę. Maksymalnie 20 rund.</p>
            <div class="cgrid sm">${[...USD_CASES].sort((a, b) => a.price - b.price).map(c => `<div class="ccard" data-act="crAdd" data-arg="${c.id}" style="--cc:${c.color}">
                <div class="cart">${caseArt(c)}</div><div class="cfoot"><span class="cname">${esc(c.name)}</span><span class="cprice">${money(c.price)}</span></div></div>`).join('')}</div>
            <div class="mrow"><button class="btn btn-green" data-act="modalclose">Gotowe</button></div>`, 'wide');
    },
    crAdd: id => {
        if (crRounds() >= 20) { toast('Maksymalnie 20 rund.', 'err'); return; }
        const x = cr.cases.find(y => y.id === id);
        if (x) x.n++;
        else cr.cases.push({ id, n: 1 });
        toast(`Dodano: ${CASE[id].name} (rund: ${crRounds()})`);
        renderPage();
    },
    crRm: i => { cr.cases.splice(Number(i), 1); renderPage(); },
    crInc: i => { if (crRounds() >= 20) { toast('Maksymalnie 20 rund.', 'err'); return; } cr.cases[Number(i)].n++; renderPage(); },
    crDec: i => { const x = cr.cases[Number(i)]; x.n--; if (!x.n) cr.cases.splice(Number(i), 1); renderPage(); },
    crPlayers: n => { cr.players = Number(n); renderPage(); },
    crMode: m => { cr.mode = m; renderPage(); },
    crCreate: () => {
        if (!cr.cases.length) return;
        createBattle(cr.mode, cr.players, cr.cases.flatMap(x => Array(x.n).fill(x.id)));
    },

    // kontrakt
    csel: uid => {
        if (conSel.includes(uid)) conSel = conSel.filter(u => u !== uid);
        else if (conSel.length < 10) conSel.push(uid);
        else toast('Maksymalnie 10 skinów w kontrakcie.', 'err');
        renderPage();
    },
    contract: () => {
        const items = conSel.map(u => state.inv.find(i => i.uid === u)).filter(Boolean);
        if (items.length < 3) return;
        const T = round2(items.reduce((s, i) => s + SKIN[i.id].price, 0));
        const { cand, w } = contractOdds(T);
        let r = Math.random() * w.reduce((a, b) => a + b, 0), res = cand[cand.length - 1];
        for (let i = 0; i < cand.length; i++) { r -= w[i]; if (r < 0) { res = cand[i]; break; } }
        takeItems(conSel, 'Kontrakt (wkład)');
        conSel = [];
        const uids = giveItems([res.id], 'Kontrakt');
        state.stats.contracts++;
        save();
        pushDrop(res.id, state.name, true);
        renderPage();
        showWin([res.id], uids, res.price >= T ? 'Udany kontrakt!' : 'Wynik kontraktu');
    },

    // wymiennik
    exsel: uid => { exSel = exSel.includes(uid) ? exSel.filter(u => u !== uid) : [...exSel, uid]; renderPage(); },
    exadd: id => { exCart.push(id); renderPage(); },
    exrm: i => { exCart.splice(Number(i), 1); renderPage(); },
    exchange: () => {
        const { give, get } = exTotals();
        if (!(give > 0 && get > 0 && get <= give)) return;
        takeItems(exSel, 'Wymiennik (oddano)');
        const ids = exCart;
        const uids = giveItems(ids, 'Wymiennik');
        const rest = round2(give - get);
        if (rest > 0) wallet(rest, 'Reszta z wymiany');
        exSel = [];
        exCart = [];
        renderPage();
        showWin(ids, uids, 'Wymiana udana!');
    },

    // przeznaczenie
    dpick: id => { destT = id; renderPage(); },
    dspin: () => {
        if (!destT || destBusy) return;
        const cost = destCost();
        if (state.balance < cost) { toast('Za mało środków.', 'err'); return; }
        wallet(-cost, `Przeznaczenie: ${SKIN[destT].name}`);
        spend(cost);
        destBusy = true;
        $('#dBtn').disabled = true;
        const r = Math.random() * 100, win = r < destPct, target = destT;
        destAngle = destAngle - (destAngle % 360) + 360 * 6 + r * 3.6;
        const nd = $('#needle');
        nd.style.transition = 'transform 4.5s cubic-bezier(.1,.75,.12,1)';
        nd.style.transform = `rotate(${destAngle}deg)`;
        setTimeout(() => {
            destBusy = false;
            if (win) {
                const uids = giveItems([target], 'Przeznaczenie');
                pushDrop(target, state.name, true);
                showWin([target], uids, 'Przeznaczenie się spełniło!');
            } else {
                beep(180, 0.3, 0.05, 'sawtooth');
                toast('Tym razem się nie udało.', 'err');
            }
            const b = $('#dBtn');
            if (b) b.disabled = false;
        }, 4600);
    },

    // profil
    saveNick: () => {
        const v = $('#nick').value.trim().slice(0, 16);
        if (!v) { toast('Nick nie może być pusty.', 'err'); return; }
        state.name = v;
        save();
        renderTop();
        publish();
        toast('Zapisano nick.', 'ok');
        renderPage();
    },
    setLang: l => { if (!LANGS[l]) return; state.settings.lang = l; save(); applyLang(); },
    setCur: c => { if (!CUR[c]) return; state.settings.cur = c; save(); renderTop(); renderDrops(false); renderPage(); toast(`Waluta: ${CUR[c].n}`, 'ok'); },
    setColor: c => { state.color = c; save(); renderTop(); renderPage(); publish(); },
    reset: (_, el) => {
        if (!resetArmed) {
            el.textContent = 'Kliknij ponownie, by potwierdzić';
            resetArmed = setTimeout(() => { resetArmed = null; if (el.isConnected) el.textContent = 'Resetuj konto'; }, 3000);
            return;
        }
        clearTimeout(resetArmed);
        resetArmed = null;
        state = fresh();
        save();
        renderTop();
        toast('Konto zresetowane.', 'ok');
        go('#/');
    },
};

document.addEventListener('click', e => {
    const t = e.target.closest('[data-act]');
    if (!t || t.disabled) return;
    const fn = ACT[t.dataset.act];
    if (!fn) return;
    e.preventDefault();
    const inModal = !!t.closest('#modalBox');
    if (inModal && !KEEP_MODAL.includes(t.dataset.act)) closeModal();
    fn(t.dataset.arg, t, e);
});

const CH = {
    fsort: t => { filt.sort = t.value; refreshSections(); },
    faff: t => { filt.afford = t.checked; refreshSections(); },
    fast: t => { state.settings.fast = t.checked; save(); },
    sound: t => { state.settings.sound = t.checked; save(); },
    bsort: t => { bl.sort = t.value; refreshBattleList(); },
    bavail: t => { bl.avail = t.checked; refreshBattleList(); },
    psort: t => { pSort = t.value; $('#pGrid').innerHTML = profInvHtml(); },
};

const IN = {
    fmin: t => { filt.min = t.value; refreshSections(); },
    fmax: t => { filt.max = t.value; refreshSections(); },
    fq: t => { filt.q = t.value; refreshSections(); },
    exq: t => { exQ = t.value; $('#exMarket').innerHTML = exMarketHtml(); },
    dq: t => { destQ = t.value; $('#dGrid').innerHTML = destGridHtml(); },
    dpct: t => { destPct = Number(t.value); destUpdate(); },
    pq: t => { pQ = t.value; $('#pGrid').innerHTML = profInvHtml(); },
};

document.addEventListener('change', e => { const t = e.target.closest('[data-ch]'); if (t) CH[t.dataset.ch]?.(t, e); });
document.addEventListener('input', e => { const t = e.target.closest('[data-in]'); if (t) IN[t.dataset.in]?.(t, e); });

document.addEventListener('submit', e => {
    if (e.target.id !== 'promoForm') return;
    e.preventDefault();
    const code = $('#promoIn').value.trim().toUpperCase();
    const p = PROMOS[code];
    if (!p) { toast('Nieprawidłowy kod.', 'err'); return; }
    if (state.promos.includes(code)) { toast('Ten kod został już użyty.', 'err'); return; }
    state.promos.push(code);
    if (p.bal) { wallet(p.bal, `Kod ${code}`); note(`Kod ${code}: +${money(p.bal)}`); }
    if (p.gems) addGems(p.gems, `Kod ${code}`);
    toast(`Kod ${code} aktywowany!`, 'ok');
    closeModal();
});

// ============================================================
// Zegary
// ============================================================

function tick() {
    const s = Math.max(0, Math.floor((state.eventEnd - Date.now()) / 1000));
    const parts = [[Math.floor(s / 86400), 'dni'], [Math.floor(s / 3600) % 24, 'godz'], [Math.floor(s / 60) % 60, 'min'], [s % 60, 'sek']];
    const html = parts.map(([v, l]) => `<div class="cd"><b>${String(v).padStart(2, '0')}</b><span>${l}</span></div>`).join('<i>:</i>');
    $$('[data-cd="event"]').forEach(el => { el.innerHTML = html; });
    $$('[data-cool="daily"]').forEach(el => { el.textContent = fmtDur(864e5 - (Date.now() - state.daily)); });
}

// ============================================================
// Start
// ============================================================

renderShell();
renderTop();
for (let i = 0; i < 30; i++) { const c = pick(USD_CASES); drops.push({ id: roll(c), user: pick(BOT_NAMES), mine: false, c: c.id, st: Math.random() < 0.12 }); }
renderDrops(false);
// Rezerwacja z poprzedniej wizyty (strona zamknięta przed startem bitwy) — zwrot.
if (state.hold) { releaseHold(); note('Zwrócono opłatę za niedokończoną bitwę.'); }
go('#/');
if (state.settings.lang !== 'pl') applyLang();
setInterval(tick, 1000);
setInterval(() => { const el = $('#online'); if (el && !NET.room) el.textContent = 1; }, 5000);
connectRoom();
setTimeout(botDropLoop, 2000);
