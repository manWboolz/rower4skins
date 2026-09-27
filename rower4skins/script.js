// Rower4Skins — symulator otwierania skrzynek. Tylko wirtualne monety, bez prawdziwych pieniędzy.
'use strict';

// ============================================================
// Pomocnicze
// ============================================================

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const pick = a => a[Math.floor(Math.random() * a.length)];
const round2 = n => Math.round(n * 100) / 100;
const money = n => '$' + n.toFixed(2);
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
    edit: '<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
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

const WTYPE = {
    'Glock-18': 'pistol', 'USP-S': 'pistol', 'P250': 'pistol', 'CZ75': 'pistol', 'Desert Eagle': 'pistol', 'Five-SeveN': 'pistol',
    'MP9': 'smg', 'MAC-10': 'smg', 'MP7': 'smg', 'P90': 'smg', 'UMP-45': 'smg',
    'Galil AR': 'rifle', 'FAMAS': 'rifle', 'M4A4': 'rifle', 'M4A1-S': 'rifle', 'AK-47': 'rifle', 'AUG': 'rifle', 'SG 553': 'rifle',
    'SSG 08': 'sniper', 'AWP': 'sniper',
};

// [id, broń, nazwa, rzadkość, cena, kolor1, kolor2, wzór: g=gradient s=paski c=kamuflaż f=fade]
const SKINS = [
    ['glk1', 'Glock-18', 'Dętka', 'consumer', 0.06, '#5b6474', '#9aa3b2', 'g'],
    ['p250', 'P250', 'Asfalt', 'consumer', 0.05, '#3f4654', '#6b7280', 'c'],
    ['mp9a', 'MP9', 'Błotnik', 'consumer', 0.08, '#6b5b3e', '#a18a5f', 'c'],
    ['gal1', 'Galil AR', 'Rdza', 'consumer', 0.10, '#7c3f1d', '#b7793f', 'c'],
    ['usp1', 'USP-S', 'Szprycha', 'industrial', 0.30, '#475569', '#94a3b8', 's'],
    ['ump1', 'UMP-45', 'Rdzawy Łańcuch', 'industrial', 0.25, '#78350f', '#d97706', 's'],
    ['fam1', 'FAMAS', 'Kask', 'industrial', 0.35, '#1e3a8a', '#93c5fd', 'g'],
    ['sg1', 'SG 553', 'Trasa', 'industrial', 0.28, '#365314', '#a3a3a3', 'c'],
    ['ssg1', 'SSG 08', 'Pedał', 'industrial', 0.30, '#334155', '#e2e8f0', 's'],
    ['glk2', 'Glock-18', 'Neonowa Lampka', 'milspec', 0.85, '#22d3ee', '#6366f1', 's'],
    ['fs1', 'Five-SeveN', 'Odblask', 'milspec', 0.70, '#facc15', '#f97316', 's'],
    ['mac1', 'MAC-10', 'Dzwonek', 'milspec', 0.90, '#0ea5e9', '#f0abfc', 'g'],
    ['m4a4a', 'M4A4', 'Asfalt Nocą', 'milspec', 1.20, '#1e293b', '#3b82f6', 'c'],
    ['aug1', 'AUG', 'Kolarski Błękit', 'milspec', 0.95, '#0284c7', '#bae6fd', 'f'],
    ['usp2', 'USP-S', 'Dżungla', 'restricted', 3.10, '#15803d', '#a3e635', 'c'],
    ['de1', 'Desert Eagle', 'Kaseta', 'restricted', 4.20, '#6d28d9', '#c4b5fd', 's'],
    ['mp7a', 'MP7', 'Graffiti BMX', 'restricted', 2.60, '#06b6d4', '#facc15', 'c'],
    ['fam2', 'FAMAS', 'Czerwona Lampka', 'restricted', 3.80, '#991b1b', '#f87171', 'f'],
    ['ak1', 'AK-47', 'Łańcuch', 'restricted', 6.50, '#374151', '#a78bfa', 's'],
    ['awp1', 'AWP', 'Szosa', 'restricted', 7.80, '#1f2937', '#60a5fa', 'g'],
    ['cz1', 'CZ75', 'Zielony Wentyl', 'classified', 7.90, '#16a34a', '#bbf7d0', 'f'],
    ['gal2', 'Galil AR', 'Krokodyl', 'classified', 6.80, '#65a30d', '#facc15', 'c'],
    ['p90a', 'P90', 'Tour de Pologne', 'classified', 9.50, '#be123c', '#111827', 's'],
    ['ak2', 'AK-47', 'Pustynny Rajd', 'classified', 14.00, '#a16207', '#fde68a', 'c'],
    ['m41a', 'M4A1-S', 'Peleton', 'classified', 18.00, '#7e22ce', '#f472b6', 'f'],
    ['awp2', 'AWP', 'Różowa Szprycha', 'classified', 21.00, '#db2777', '#f9a8d4', 's'],
    ['glk3', 'Glock-18', 'Rowerowy Smok', 'covert', 24.00, '#ef4444', '#f59e0b', 'f'],
    ['usp3', 'USP-S', 'Meta Etapu', 'covert', 32.00, '#0f172a', '#f43f5e', 's'],
    ['de2', 'Desert Eagle', 'Złota Przerzutka', 'covert', 38.00, '#b45309', '#fde047', 'f'],
    ['m4a4b', 'M4A4', 'Kosmiczny Peleton', 'covert', 45.00, '#4c1d95', '#60a5fa', 'f'],
    ['m41b', 'M4A1-S', 'Wąż Górski', 'covert', 52.00, '#c2410c', '#fbbf24', 'c'],
    ['ak3', 'AK-47', 'Ognista Opona', 'covert', 65.00, '#dc2626', '#fb923c', 'f'],
    ['awp3', 'AWP', 'Smok z Karbonu', 'covert', 140.00, '#166534', '#fbbf24', 'c'],
    ['kn1', '★ Bagnet', 'Stal Rowerowa', 'gold', 180.00, '#9ca3af', '#f3f4f6', 'f'],
    ['gl2', '★ Rękawice Kierowcy', 'Kamuflaż MTB', 'gold', 190.00, '#3f6212', '#d9f99d', 'c'],
    ['gl1', '★ Rękawice Sportowe', 'Żółta Koszulka', 'gold', 260.00, '#ca8a04', '#fef08a', 's'],
    ['kn2', '★ Nóż Motylkowy', 'Fade', 'gold', 320.00, '#f472b6', '#fde047', 'f'],
    ['kn4', '★ Bagnet M9', 'Nocna Jazda', 'gold', 410.00, '#1e1b4b', '#818cf8', 'f'],
    ['kn3', '★ Karambit', 'Tęcza Szprych', 'gold', 540.00, '#22d3ee', '#e879f9', 'f'],
    ['kn5', '★ Talon', 'Złota Szprycha', 'gold', 760.00, '#a16207', '#fde047', 's'],
].map(([id, weapon, name, rarity, price, c1, c2, pat]) => ({
    id, weapon, name, rarity, price, c1, c2, pat,
    type: weapon.includes('Rękawice') ? 'gloves' : weapon.startsWith('★') ? 'knife' : WTYPE[weapon],
}));

const SKIN = Object.fromEntries(SKINS.map(s => [s.id, s]));

// Buduje pulę [id, waga] z listy [filtr, waga|funkcja] — wagi tego samego skina się sumują.
function pool(spec) {
    const m = new Map();
    for (const [f, w] of spec) {
        for (const s of SKINS) {
            if (!f(s)) continue;
            const ww = typeof w === 'function' ? w(s) : w;
            if (ww > 0) m.set(s.id, (m.get(s.id) || 0) + ww);
        }
    }
    return [...m];
}
const R = (...r) => s => r.includes(s.rarity);
const RW = (mult = 1) => s => RAR[s.rarity].w * mult;

const CASES = [
    // Rowerowe Urodziny (event)
    { id: 'tort', name: 'Tort Urodzinowy', color: '#ec4899', sec: 'bday', badge: 'NEW', deco: 'cake',
        items: pool([[s => s.rarity !== 'gold', RW()], [R('gold'), 0.5]]) },
    { id: 'balon', name: 'Balonik', color: '#3b82f6', sec: 'bday', badge: 'NEW', feature: 'kn1',
        items: pool([[R('consumer', 'industrial'), RW()], [R('milspec'), RW(0.6)], [R('restricted'), RW(0.3)], [s => s.id === 'kn1', 0.25]]) },
    { id: 'swieczka', name: 'Świeczka', color: '#f59e0b', sec: 'bday', badge: 'NEW', feature: 'kn2',
        items: pool([[R('industrial'), 80], [R('classified'), 10], [R('covert'), 3], [s => s.id === 'kn2', 0.4]]) },
    { id: 'konfetti', name: 'Konfetti', color: '#8b5cf6', sec: 'bday', badge: 'NEW', feature: 'm41a',
        items: pool([[R('milspec', 'restricted', 'classified', 'covert'), RW()], [R('gold'), 0.5]]) },
    { id: 'prezent', name: 'Wielki Prezent', color: '#ef4444', sec: 'bday', badge: 'NEW', feature: 'kn3',
        items: pool([[R('classified'), 60], [R('covert'), 20], [R('gold'), 3]]) },

    // Rzadkości
    { id: 'r-mil', name: 'Mil-Spec', color: '#4b69ff', sec: 'rar', tag: 'Mil-Spec', feature: 'm4a4a',
        items: pool([[R('consumer', 'industrial'), 40], [R('milspec'), 60], [R('restricted'), 6], [R('classified'), 1]]) },
    { id: 'r-res', name: 'Restricted', color: '#8847ff', sec: 'rar', tag: 'Restricted', feature: 'ak1',
        items: pool([[R('industrial'), 30], [R('milspec'), 40], [R('restricted'), 60], [R('classified'), 5], [R('covert'), 1]]) },
    { id: 'r-cla', name: 'Classified', color: '#d32ce6', sec: 'rar', tag: 'Classified', feature: 'awp2',
        items: pool([[R('milspec'), 30], [R('restricted'), 50], [R('classified'), 60], [R('covert'), 5], [R('gold'), 0.4]]) },
    { id: 'r-cov', name: 'Covert', color: '#eb4b4b', sec: 'rar', tag: 'Covert', feature: 'ak3',
        items: pool([[R('restricted'), 40], [R('classified'), 60], [R('covert'), 50], [R('gold'), 2]]) },
    { id: 'r-kni', name: 'Noże', color: '#e4ae39', sec: 'rar', tag: 'Noże', feature: 'kn2',
        items: pool([[R('covert'), 60], [s => s.type === 'knife', 12]]) },
    { id: 'r-glk', name: 'GLOCK-18', color: '#f59e0b', sec: 'rar', tag: 'Glock-18',
        items: pool([[s => s.weapon === 'Glock-18', RW(2)], [R('consumer', 'industrial'), RW(0.5)]]) },

    // Bronie
    ...[['M4A4', '#6366f1'], ['USP-S', '#65a30d'], ['M4A1-S', '#ea580c'], ['AK-47', '#a16207'], ['AWP', '#db2777'],
        ['FAMAS', '#dc2626'], ['MP7', '#06b6d4'], ['P90', '#9f1239'], ['Galil AR', '#84cc16'], ['CZ75', '#22c55e']]
        .map(([w, color]) => ({
            id: 'w-' + w.toLowerCase().replace(/[^a-z0-9]/g, ''), name: w, color, sec: 'wpn', tag: w,
            feature: SKINS.filter(s => s.weapon === w).sort((a, b) => b.price - a.price)[0].id,
            items: pool([[s => s.weapon === w, RW(3)], [R('consumer', 'industrial'), RW(0.4)], [R('covert'), 1], [R('gold'), 0.15]]),
        })),
    { id: 'w-glv', name: 'Rękawice', color: '#d97706', sec: 'wpn', tag: 'Rękawice', feature: 'gl1',
        items: pool([[s => s.type === 'gloves', 10], [R('covert'), 20], [R('classified'), 60], [R('restricted'), 100]]) },
    { id: 'w-lux', name: 'Luksusowy Nóż', color: '#eab308', sec: 'wpn', tag: 'Luksus', feature: 'kn5',
        items: pool([[s => s.type === 'knife', 10], [R('covert'), 30], [R('classified'), 60]]) },

    // Specjalne
    { id: 'gems', name: 'Skrzynka Gemów', color: '#a855f7', currency: 'gems', gems: 250, deco: 'gems',
        items: pool([[R('consumer', 'industrial', 'milspec', 'restricted', 'classified'), RW()], [R('covert'), RW(0.5)]]) },
    { id: 'daily', name: 'Codzienna Skrzynka', color: '#22c55e', currency: 'free', kind: 'daily', deco: 'gift',
        items: pool([[R('consumer', 'industrial'), RW()], [R('milspec'), RW(0.5)], [R('restricted'), RW(0.2)], [R('covert'), 0.3]]) },
    ...[5, 10, 20, 30, 50].map((lvl, i) => ({
        id: 'exp' + lvl, name: 'Poziom ' + lvl, color: ['#38bdf8', '#34d399', '#a78bfa', '#f472b6', '#fbbf24'][i],
        currency: 'free', kind: 'exp', lvl, deco: 'lvl',
        items: pool([
            [[R('consumer', 'industrial'), R('industrial', 'milspec'), R('milspec', 'restricted'), R('restricted', 'classified'), R('classified', 'covert')][i], RW()],
            [[R('milspec'), R('restricted'), R('classified'), R('covert'), R('gold')][i], RW(0.5)],
        ]),
    })),
    { id: 'hidden', name: 'Ukryta Skrzynka', color: '#fb923c', currency: 'free', kind: 'hidden', deco: 'hidden',
        items: pool([[R('restricted'), 50], [R('classified'), 30], [R('covert'), 10], [R('gold'), 1]]) },
];

for (const c of CASES) {
    c.currency = c.currency || 'usd';
    c.total = c.items.reduce((s, [, w]) => s + w, 0);
    c.ev = c.items.reduce((s, [id, w]) => s + SKIN[id].price * w / c.total, 0);
    // Cena = średni drop / 0.9, czyli skrzynka oddaje średnio ok. 90% ceny.
    if (c.currency === 'usd') c.price = Math.max(0.05, round2(c.ev / 0.9));
    if (!c.feature && !c.deco) c.feature = [...c.items].sort((a, b) => SKIN[b[0]].price - SKIN[a[0]].price)[0][0];
}

const CASE = Object.fromEntries(CASES.map(c => [c.id, c]));
const USD_CASES = CASES.filter(c => c.currency === 'usd');

const SECTIONS = [
    { id: 'bday', title: 'Rowerowe Urodziny', icon: 'cake' },
    { id: 'rar', title: 'Rzadkości', icon: 'star' },
    { id: 'wpn', title: 'Bronie', icon: 'target' },
];

const BIKES = [
    ['Składak Wigry 3', 5, '#94a3b8'], ['Ukraina z piwnicy', 8, '#a16207'], ['Romet Jubilat', 12, '#ef4444'],
    ['Góral z marketu', 15, '#22c55e'], ['BMX sąsiada', 20, '#f59e0b'], ['Szosówka Kross', 35, '#3b82f6'],
    ['Elektryk miejski', 60, '#14b8a6'], ['Karbonowa kolarzówka', 120, '#a855f7'],
];

const PROMOS = { ROWER4SKINS: { bal: 1 }, URODZINY: { gems: 100 }, SZPRYCHA: { bal: 0.5 } };

const BOT_NAMES = ['kolarz_91', 'szprycha', 'MTB_Kuba', 'pedalarz', 'dętka_pl', 'Wigry3', 'turbo_romet', 'łańcuch',
    'bmx_ola', 'peleton', 'góral_pro', 'przerzutka', 'sakwa', 'dzwonek', 'bidon', 'kadencja'];

const MODES = {
    normal: { n: 'Normal', icon: 'swords', col: '#22a7f0',
        d: 'Podstawowy tryb. Wygrywa gracz z najwyższą łączną wartością dropów i zabiera wszystko. Pozostali dostają gwarantowany skin.' },
    underdog: { n: 'Underdog', icon: 'paw', col: '#ffc41f',
        d: 'Odwrócone zasady. Wygrywa gracz z najniższą łączną wartością dropów i zabiera wszystko.' },
    terminal: { n: 'Terminal', icon: 'skull', col: '#ff4d5e',
        d: 'Liczy się tylko ostatnia runda. Wygrywa ten, kto wylosuje najdroższy skin w ostatniej skrzynce.' },
};

const MISSIONS = [
    { id: 'm1', t: 'Otwórz 10 skrzynek', goal: 10, v: () => state.stats.opened, gems: 50 },
    { id: 'm2', t: 'Wygraj bitwę skrzynek', goal: 1, v: () => state.stats.battlesWon, gems: 75 },
    { id: 'm3', t: 'Podpisz kontrakt', goal: 1, v: () => state.stats.contracts, gems: 50 },
    { id: 'm4', t: 'Znajdź ukrytą skrzynkę na banerze', goal: 1, v: () => (state.hiddenFound ? 1 : 0), gems: 100 },
    { id: 'm5', t: 'Osiągnij poziom 5', goal: 5, v: () => level(), gems: 100 },
    { id: 'm6', t: 'Wydaj łącznie $50 na skrzynki i bitwy', goal: 50, v: () => state.stats.wagered, gems: 150 },
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
        stats: { opened: 0, wagered: 0, battles: 0, battlesWon: 0, contracts: 0, best: 0 },
        settings: { sound: true, fast: false },
        eventEnd: Date.now() + 45 * 864e5 + 23 * 36e5,
    };
}

function load() {
    const base = fresh();
    try {
        const raw = localStorage.getItem(KEY);
        if (raw) {
            const s = JSON.parse(raw);
            return { ...base, ...s, stats: { ...base.stats, ...s.stats }, settings: { ...base.settings, ...s.settings } };
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
    const after = level();
    for (let L = before + 1; L <= after; L++) {
        state.gems += 10 * L;
        note(`Awans na poziom ${L}! +${10 * L} gemów`);
        toast(`Awans na poziom ${L}!`, 'ok');
    }
    save();
}

function giveItems(ids, source) {
    const uids = [];
    for (const id of ids) {
        const uid = newUid();
        uids.push(uid);
        state.inv.unshift({ uid, id, t: Date.now() });
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

function winSound(big) {
    const notes = big ? [523, 659, 784, 1047, 1319] : [523, 659, 784];
    notes.forEach((f, i) => setTimeout(() => beep(f, 0.18, 0.05, 'triangle'), i * 90));
}

// ============================================================
// Grafika SVG: bronie, skrzynie, avatary
// ============================================================

let SID = 0;

const SHAPES = {
    rifle: '<path d="M2 16 L12 14 H24 L26 12 H62 L63 10 H70 V12 H97 V15.5 H72 L70 18 H58 L55 31 H47 L50 18 H40 L36 27 H29 L31 18 H25 L12 23 H2 Z"/>',
    sniper: '<path d="M1 18 L13 16 H27 L29 14.5 H68 V16.5 H99 V18.5 H68 L64 21 H44 L40 30 H33 L35.5 21 H27 L13 25 H1 Z"/><path d="M33 8 H62 V13 H33 Z"/><path d="M40 13 H44 V14.5 H40 Z M52 13 H56 V14.5 H52 Z"/>',
    smg: '<path d="M8 13 H72 V18.5 H63 L61 21 H51 L49 33 H42 L44 21 H36 L33 29 H26 L28.5 21 H20 L14 25 H8 Z"/><path d="M72 14.5 H86 V17 H72 Z"/>',
    pistol: '<path d="M18 9 H80 V18 H57 L55 21.5 H47 L43 36 H30 L34.5 18 H18 Z"/>',
    knife: '<path d="M40 16 L88 7 Q97 6 94 12 Q82 25 48 25 H40 Z"/><path d="M38 12 H43 V29 H38 Z"/><path d="M38 17 H14 Q7 17 7 21 Q7 25 14 25 H38 Z"/>',
    gloves: '<path d="M22 37 L20 21 Q20 18 23 18 L24 9 Q25 6 27 9 L28 17 L29 6 Q30 3 32 6 L33 17 L34.5 7 Q36 4 37.5 7 L37.5 18 L40 13 Q42 11 43 14 L40 28 L38 37 Z"/><path d="M56 37 L54 21 Q54 18 57 18 L58 9 Q59 6 61 9 L62 17 L63 6 Q64 3 66 6 L67 17 L68.5 7 Q70 4 71.5 7 L71.5 18 L74 13 Q76 11 77 14 L74 28 L72 37 Z"/>',
};

function art(s, size = '') {
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
        defs += `<linearGradient id="${id}h" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".3"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".35"/></linearGradient>`;
        over = `<rect width="100" height="40" fill="url(#${id}h)"/>`;
    }
    return `<svg class="wart" viewBox="0 0 100 40" ${size}><defs>${defs}</defs><g clip-path="url(#${id}c)"><rect width="100" height="40" fill="url(#${id}g)"/>${over}<rect width="100" height="14" fill="#fff" opacity=".13"/></g><g fill="none" stroke="rgba(0,0,0,.6)" stroke-width=".7" stroke-linejoin="round">${sh}</g></svg>`;
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
        const rot = f.type === 'gloves' ? -8 : f.type === 'knife' ? -34 : -26;
        behind = `<g transform="translate(120 66) rotate(${rot}) translate(-88 -35)">${art(f, 'width="176" height="70"')}</g>`;
    }
    if (c.deco === 'gems') {
        const r = srand(hash(c.id));
        behind = `<defs><radialGradient id="${id}q" cx=".35" cy=".35" r=".7"><stop offset="0" stop-color="#f5d0fe"/><stop offset=".45" stop-color="#c026d3"/><stop offset="1" stop-color="#581c87"/></radialGradient></defs>` +
            Array.from({ length: 24 }, () => `<circle cx="${(58 + r() * 124).toFixed(1)}" cy="${(80 + r() * 22).toFixed(1)}" r="${(7 + r() * 5).toFixed(1)}" fill="url(#${id}q)" stroke="#3b0764" stroke-width=".8"/>`).join('');
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
    if (c.deco === 'lvl') {
        behind = `<path d="M120 12 L136 30 L160 34 L143 52 L147 76 L120 64 L93 76 L97 52 L80 34 L104 30 Z" fill="${col}" stroke="#0b0e16" stroke-width="2.5"/><text x="120" y="58" text-anchor="middle" font-size="24" font-weight="900" fill="#0b0e16" font-family="Saira, sans-serif">${c.lvl}</text>`;
    }
    if (c.tag) {
        const long = c.tag.length > 8;
        front = `<g transform="translate(160 42) rotate(22)"><path d="M0 0 H58 L64 9 L58 18 H0 Z" fill="#eef0f5" stroke="#0b0e16" stroke-width="1.2"/><circle cx="57" cy="9" r="2" fill="#0b0e16"/><text x="28" y="13" text-anchor="middle" font-size="10" font-weight="800" fill="#111" font-family="Saira, sans-serif" ${long ? 'textLength="50" lengthAdjust="spacingAndGlyphs"' : ''}>${esc(c.tag)}</text></g>`;
    }

    return `<svg class="kart" viewBox="0 0 240 200" aria-hidden="true"><defs>
        <radialGradient id="${id}r" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="${col}" stop-opacity=".9"/><stop offset=".6" stop-color="${col}" stop-opacity=".28"/><stop offset="1" stop-color="${col}" stop-opacity="0"/></radialGradient>
        <linearGradient id="${id}m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#454e66"/><stop offset="1" stop-color="#171c29"/></linearGradient>
        <linearGradient id="${id}l" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b3246"/><stop offset="1" stop-color="#3d4760"/></linearGradient>
    </defs>
    <circle cx="120" cy="96" r="98" fill="url(#${id}r)"/>
    ${sparkles(hash(c.id), 6, 20, 220, 8, 90)}
    <ellipse cx="120" cy="183" rx="94" ry="9" fill="#000" opacity=".5"/>
    <path d="M50 100 L60 66 H180 L190 100 Z" fill="url(#${id}l)" stroke="#0b0e16" stroke-width="2"/>
    ${behind}
    <path d="M42 100 H198 L190 180 H50 Z" fill="url(#${id}m)" stroke="#0b0e16" stroke-width="2"/>
    <rect x="38" y="95" width="164" height="11" rx="3" fill="#5a6480" stroke="#0b0e16" stroke-width="1.5"/>
    <rect x="72" y="106" width="15" height="74" fill="${col}" opacity=".9"/>
    <rect x="153" y="106" width="15" height="74" fill="${col}" opacity=".9"/>
    <rect x="108" y="112" width="24" height="26" rx="4" fill="#cfd5e3" stroke="#0b0e16" stroke-width="1.5"/>
    <circle cx="120" cy="122" r="3.5" fill="#1b2030"/><rect x="118.8" y="123" width="2.4" height="8" fill="#1b2030"/>
    <text x="120" y="164" text-anchor="middle" font-size="10" font-weight="800" letter-spacing="1.5" fill="#fff" fill-opacity=".28" font-family="Saira, sans-serif">ROWER4SKINS</text>
    ${front}
    </svg>`;
}

function bikeArt(color) {
    return `<svg viewBox="0 0 64 40" class="bart" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="13" cy="28" r="10"/><circle cx="51" cy="28" r="10"/><path d="M13 28 22 10h19l10 18M22 10l11 18h18M19 5h7M38 5h7"/></svg>`;
}

const LOGO = `<svg viewBox="0 0 64 44" class="logo-mark" aria-hidden="true"><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e9d5ff"/><stop offset="1" stop-color="#a855f7"/></linearGradient></defs><g fill="none" stroke="url(#lg)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="30" r="10"/><circle cx="51" cy="30" r="10"/><path d="M13 30 23 11h19l9 19M23 11l11 19h17M19 5h9M38 5h9"/></g></svg>`;

function avatar(p, cls = '') {
    if (!p) return `<span class="ava ava-empty ${cls}">${ic('plus')}</span>`;
    const name = p.you ? state.name : p.name;
    const color = p.you ? state.color : `hsl(${hash(p.name) % 360} 70% 55%)`;
    const letter = name.replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase() || '?';
    return `<span class="ava ${cls}" style="--a:${color}">${esc(letter)}</span>`;
}

const me = () => ({ you: true });

// ============================================================
// Karty
// ============================================================

function itemCard(s, { cls = '', attrs = '', top = '', bottom = '' } = {}) {
    return `<div class="icard ${cls}" style="--rc:${RAR[s.rarity].c}" ${attrs}>
        ${top}
        <div class="iart">${art(s)}</div>
        <div class="iw">${esc(s.weapon)}</div>
        <div class="in">${esc(s.name)}</div>
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
    $('#modalBox').className = 'modal ' + cls;
    $('#modalBox').innerHTML = `<button class="mclose" data-act="modalclose" aria-label="Zamknij">${ic('x')}</button>` + html;
    $('#modal').hidden = false;
}

function closeModal() { $('#modal').hidden = true; }

$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') closeModal(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeModal(); $('#drawer').hidden = true; } });

let winUids = [];

function showWin(ids, uids, title) {
    winUids = uids;
    const total = round2(ids.reduce((s, id) => s + SKIN[id].price, 0));
    const big = ids.some(id => ['covert', 'gold'].includes(SKIN[id].rarity));
    winSound(big);
    modal(`<h2 class="mtitle">${title}</h2>
        <div class="win-items ${ids.length > 4 ? 'many' : ''}">${ids.map(id => itemCard(SKIN[id], { cls: 'glow' })).join('')}</div>
        <div class="win-total">Łączna wartość: <b>${money(total)}</b></div>
        <div class="mrow">
            <button class="btn btn-green" data-act="winsell">${ic('wallet')}Sprzedaj za ${money(total)}</button>
            <button class="btn btn-purple" data-act="modalclose">${ic('check')}Zatrzymaj</button>
        </div>`, big ? 'big-win' : '');
}

// ============================================================
// Nagłówek, pasek dropów, podpasek
// ============================================================

const NAV = [
    ['event', '#/event', 'star', 'Event'],
    ['home', '#/', 'box', 'Skrzynki'],
    ['battles', '#/battles', 'swords', 'Bitwy'],
    ['contract', '#/contract', 'doc', 'Kontrakt'],
    ['exchanger', '#/exchanger', 'swap', 'Wymiennik'],
];

function renderShell() {
    $('#top').innerHTML = `
        <a class="logo" data-act="go" data-arg="#/" href="#/">${LOGO}<span>ROWER<b>4</b>SKINS</span></a>
        <nav class="nav" id="nav">${NAV.map(([k, h, i, t]) => `<a data-act="go" data-arg="${h}" data-nav="${k}" href="${h}">${ic(i)}${t}</a>`).join('')}</nav>
        <div class="tr">
            <div class="pill gem-pill" title="Gemy">${ic('gem')}<span id="tGems"></span></div>
            <div class="wallet-group">
                <div class="pill money-pill" title="Saldo">${ic('wallet')}<span id="tBal"></span></div>
                <button class="btn-dep" data-act="depositModal">${ic('bike')}WPŁAĆ <small>+10%</small></button>
            </div>
            <button class="sq" data-act="notes" aria-label="Powiadomienia">${ic('bell')}<i id="tUnread" class="dot" hidden></i></button>
            <button class="sq hide-sm" data-act="go" data-arg="#/profile/settings" aria-label="Ustawienia">${ic('gear')}</button>
            <button class="ava-btn" data-act="go" data-arg="#/profile" aria-label="Profil"><span id="tAva"></span><span class="lvl" id="tLvl"></span></button>
            <button class="sq burger" data-act="burger" aria-label="Menu">${ic('menu')}</button>
        </div>`;

    $('#dropsbar').innerHTML = `
        <div class="d-side">
            <div class="online" title="Symulowani gracze online">${ic('users')}<b id="online">3130</b></div>
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

function pushDrop(id, user, mine = false) {
    drops.unshift({ id, user, mine, st: Math.random() < 0.12 });
    drops.length = Math.min(drops.length, 80);
    renderDrops(true);
}

function renderDrops(animate) {
    const list = drops.filter(d => dropMode === 'all' || SKIN[d.id].price >= 10).slice(0, 30);
    $('#dTrack').innerHTML = list.map((d, i) => {
        const s = SKIN[d.id];
        return `<div class="dtile ${d.mine ? 'mine' : ''} ${animate && i === 0 ? 'new' : ''}" style="--rc:${RAR[s.rarity].c}" title="${esc(s.weapon)} | ${esc(s.name)} — ${money(s.price)} · ${esc(d.user)}">
            ${d.st ? '<span class="st">ST</span>' : ''}${art(s)}
            <span class="dname">${esc(s.name)}</span><span class="duser">${esc(d.user)}</span>
        </div>`;
    }).join('');
}

function botDropLoop() {
    const c = pick(USD_CASES);
    pushDrop(roll(c), pick(BOT_NAMES));
    setTimeout(botDropLoop, 1800 + Math.random() * 3200);
}

// ============================================================
// Ruletka (poziomo przy 1 skrzynce, pionowo przy kilku)
// ============================================================

const STRIP_LEN = 60, WIN_AT = 52, GAP = 6;

const reelHtml = (vertical, cls = '') => `<div class="reel ${vertical ? 'v' : 'h'} ${cls}"><div class="marker"></div><div class="strip"></div></div>`;

function fillReel(reel, c, winner) {
    const ids = Array.from({ length: STRIP_LEN }, () => roll(c));
    if (winner) ids[WIN_AT] = winner;
    const strip = reel.querySelector('.strip');
    strip.innerHTML = ids.map(id => itemCard(SKIN[id], { cls: 'ritem' })).join('');
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

async function spinReel(reel, c, winner, dur, ticking) {
    if (!reel || !reel.isConnected) { await sleep(dur); return; }
    const strip = fillReel(reel, c, winner);
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
    strip.children[WIN_AT]?.classList.add('hit');
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
    const bike = (x, y, s, col) => `<g transform="translate(${x} ${y}) scale(${s})" fill="none" stroke="${col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"><circle cx="13" cy="30" r="11"/><circle cx="51" cy="30" r="11"/><path d="M13 30 23 11h19l9 19M23 11l11 19h17M19 5h9M38 5h9"/></g>`;
    return `<div class="banner">
        <svg class="banner-bg" viewBox="0 0 1500 250" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1e1b4b"/><stop offset=".55" stop-color="#6d28d9"/><stop offset="1" stop-color="#f97316"/></linearGradient></defs>
            <rect width="1500" height="250" fill="url(#sky)"/>
            <circle cx="750" cy="250" r="190" fill="#fbbf24" opacity=".35"/>
            <path d="M0 210 Q200 160 400 200 T800 190 T1200 200 T1500 180 V250 H0 Z" fill="#1e1b4b" opacity=".75"/>
            <path d="M0 235 Q300 215 750 230 T1500 225 V250 H0 Z" fill="#0f0b2e"/>
            ${confetti}${balloons}
            ${bike(380, 110, 2.4, '#fde047')}${bike(960, 120, 2.2, '#67e8f9')}
        </svg>
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
        ${featTile('SKRZYNKA GEMÓW', 'go', '#/case/gems', caseArt(CASE.gems))}
        ${featTile('PRZEZNACZENIE', 'go', '#/destiny', ORBS)}
        ${featTile('RANKING', 'ranking', '', TROPHY)}
    </div>
    ${bannerHtml()}
    <div class="filters">
        <button class="fbtn ${filt.fav ? 'on' : ''}" data-act="ffav" aria-label="Tylko ulubione">${ic('heart')}</button>
        <div class="select"><select id="fSort" data-ch="fsort" aria-label="Sortowanie">
            <option value="def">Sortuj</option><option value="pa" ${filt.sort === 'pa' ? 'selected' : ''}>Cena rosnąco</option><option value="pd" ${filt.sort === 'pd' ? 'selected' : ''}>Cena malejąco</option><option value="az" ${filt.sort === 'az' ? 'selected' : ''}>Nazwa A–Z</option>
        </select>${ic('chev')}</div>
        <div class="range"><input id="fMin" data-in="fmin" inputmode="decimal" placeholder="$0.00" value="${esc(filt.min)}" aria-label="Cena od"><span>–</span><input id="fMax" data-in="fmax" inputmode="decimal" placeholder="$0.00" value="${esc(filt.max)}" aria-label="Cena do"></div>
        <label class="search">${ic('search')}<input id="fQ" data-in="fq" placeholder="Nazwa skrzynki" value="${esc(filt.q)}"></label>
        <label class="toggle"><input id="fAff" type="checkbox" data-ch="faff" ${filt.afford ? 'checked' : ''}><span></span>Wystarczające saldo</label>
    </div>
    <div id="caseSections">${sectionsHtml()}</div>`;
}

function sectionsHtml() {
    const min = parseFloat(filt.min.replace(',', '.')), max = parseFloat(filt.max.replace(',', '.'));
    const q = filt.q.trim().toLowerCase();
    const ok = c => (!filt.fav || state.favs.includes(c.id)) && (isNaN(min) || c.price >= min) && (isNaN(max) || c.price <= max)
        && (!q || c.name.toLowerCase().includes(q)) && (!filt.afford || c.price <= state.balance);
    const sorters = { pa: (a, b) => a.price - b.price, pd: (a, b) => b.price - a.price, az: (a, b) => a.name.localeCompare(b.name, 'pl') };
    const html = SECTIONS.map(sec => {
        let list = USD_CASES.filter(c => c.sec === sec.id && ok(c));
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
    const sorted = [...c.items].sort((a, b) => SKIN[b[0]].price - SKIN[a[0]].price);
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
        <div class="sec-title">${ic('box')}<span>Zawartość skrzynki</span></div>
        <div class="igrid">${sorted.map(([id]) => { const ch = chanceOf(c, id); return itemCard(SKIN[id], { top: `<span class="chance">${ch.toFixed(ch < 0.1 ? 3 : 2)}%</span>` }); }).join('')}</div>
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
    if (demo) {
        const s = SKIN[winners[0]];
        toast(`Demo: wylosowałbyś ${s.weapon} | ${s.name} (${money(s.price)})`);
    } else {
        const uids = giveItems(winners, `Skrzynka ${c.name}`);
        state.stats.opened += n;
        save();
        winners.forEach(w => pushDrop(w, state.name, true));
        showWin(winners, uids, n > 1 ? 'Twoje dropy!' : 'Twój drop!');
    }
    updateOpenBar();
    if (!demo && route.name === 'case' && c.currency === 'free') {
        if (!$('.lock-note')) $('.open-bar')?.insertAdjacentHTML('afterend', `<div class="lock-note">${ic('lock')}<span>${lockReason(c)}</span></div>`);
    }
}

// ============================================================
// Bitwy
// ============================================================

let BATTLES = [];
let bseq = 1;
const bl = { tab: 'active', sort: 'new', avail: false, mode: 'all' };

const bValue = b => round2(b.cases.reduce((s, id) => s + CASE[id].price, 0));
const botPlayer = () => ({ name: pick(BOT_NAMES), bot: true });

function newBotBattle() {
    const players = pick([2, 2, 2, 3, 3, 4]);
    const cheap = USD_CASES.filter(c => c.price < 25);
    const a = pick(cheap), b = pick(cheap);
    const rounds = pick([1, 2, 3, 4, 5, 6, 8, 10]);
    const cases = Array.from({ length: rounds }, (_, i) => (i % 3 === 2 ? b : a).id);
    const slots = Array(players).fill(null);
    const filled = 1 + Math.floor(Math.random() * (players - 1));
    for (let i = 0; i < filled; i++) slots[i] = botPlayer();
    return { id: bseq++, mode: pick(['normal', 'normal', 'underdog', 'terminal']), players, cases, slots, status: 'waiting', t: Date.now() };
}

function battleTick() {
    const idle = BATTLES.filter(b => b.status === 'waiting' && !b.running && !b.watched);
    if (idle.length < 6 || Math.random() < 0.3) BATTLES.unshift(newBotBattle());
    else {
        const b = pick(idle);
        b.slots[b.slots.indexOf(null)] = botPlayer();
        if (!b.slots.includes(null)) {
            b.status = 'running';
            setTimeout(() => { if (!b.watched) { BATTLES = BATTLES.filter(x => x !== b); refreshBattleList(); } }, 9000);
        }
    }
    // Nie usuwaj bitew, w których grasz lub które oglądasz.
    const keep = BATTLES.filter(b => b.running || b.watched || b.slots.some(s => s?.you));
    const rest = BATTLES.filter(b => !keep.includes(b)).slice(0, Math.max(0, 14 - keep.length));
    BATTLES = BATTLES.filter(b => keep.includes(b) || rest.includes(b));
    refreshBattleList();
}

function groupCases(cases) {
    const out = [];
    for (const id of cases) {
        const last = out[out.length - 1];
        if (last && last.id === id) last.n++;
        else out.push({ id, n: 1 });
    }
    return out;
}

function battleRow(b) {
    const m = MODES[b.mode];
    const groups = groupCases(b.cases);
    const cells = groups.slice(0, 8).map(g => `<div class="bcase">${g.n > 1 ? `<span class="bx">x${g.n}</span>` : ''}${caseArt(CASE[g.id])}<span>${esc(CASE[g.id].name)}</span></div>`).join('');
    const empties = Array.from({ length: Math.max(0, 8 - groups.length) }, () => '<div class="bcase ghost"></div>').join('');
    const canJoin = b.status === 'waiting' && !b.running && b.slots.includes(null);
    const label = canJoin ? 'DOŁĄCZ' : b.slots.some(s => s?.you) ? 'GRASZ' : b.status === 'done' ? 'KONIEC' : 'TRWA';
    return `<div class="brow" style="--mc:${m.col}">
        <div class="bstatus">${ic(m.icon)}<span>${b.status === 'waiting' ? 'CZEKA' : b.status === 'running' ? 'W TOKU' : 'KONIEC'}</span><small>${m.n}</small></div>
        <div class="bcases">${cells}${empties}</div>
        <div class="binfo">
            <div><small>WARTOŚĆ BITWY</small><b class="money">${ic('wallet')}${money(bValue(b))}</b></div>
            <div><small>GRACZE</small><div class="bslots">${b.slots.map(s => avatar(s, 'xs')).join('')}</div></div>
        </div>
        <div class="bact">
            <button class="btn btn-join-b" data-act="join" data-arg="${b.id}" ${canJoin ? '' : 'disabled'}>${ic(m.icon)}${label}</button>
            <button class="sq" data-act="watch" data-arg="${b.id}" aria-label="Oglądaj">${ic('eye')}</button>
        </div>
    </div>`;
}

function battleListHtml() {
    if (bl.tab === 'mine') {
        if (!state.myBattles.length) return `<div class="empty">${ic('swords')}<p>Nie masz jeszcze żadnych bitew.</p></div>`;
        return `<div class="table">${state.myBattles.map(r => `<div class="trow">
            <span class="mode-chip" style="--mc:${MODES[r.mode].col}">${ic(MODES[r.mode].icon)}${MODES[r.mode].n}</span>
            <span>${fmtTime(r.t)}</span><span>${r.players} graczy</span><span>Koszt ${money(r.value)}</span>
            <b class="${r.won ? 'pos' : 'neg'}">${r.won ? `Wygrana ${money(r.prize)}` : 'Przegrana'}</b></div>`).join('')}</div>`;
    }
    let list = BATTLES.filter(b => (bl.mode === 'all' || b.mode === bl.mode) && (!bl.avail || (b.status === 'waiting' && !b.running && b.slots.includes(null))));
    if (bl.sort === 'val') list = [...list].sort((a, b) => bValue(b) - bValue(a));
    if (bl.sort === 'cheap') list = [...list].sort((a, b) => bValue(a) - bValue(b));
    return list.length ? list.map(battleRow).join('') : `<div class="empty">${ic('swords')}<p>Brak bitew. Stwórz własną!</p></div>`;
}

function refreshBattleList() {
    const el = $('#blist');
    if (el) el.innerHTML = battleListHtml();
}

function templates() {
    const near = v => [...USD_CASES].sort((a, b) => Math.abs(a.price - v) - Math.abs(b.price - v))[0];
    return [
        { players: 4, cases: Array(5).fill(near(1).id) },
        { players: 3, cases: Array(3).fill(near(5).id) },
        { players: 2, cases: Array(2).fill(near(25).id) },
    ];
}

function renderBattles() {
    const tpl = templates();
    return `
    <div class="bhero">
        <div>
            <h1>BITWY SKRZYNEK</h1>
            <p>Otwierajcie te same skrzynki, a najlepszy drop zgarnia wszystko. Zmierz się z botami w trzech trybach.</p>
            <button class="btn btn-purple btn-xl" data-act="go" data-arg="#/create">STWÓRZ BITWĘ ${ic('back', 'flip')}</button>
        </div>
        <div class="bhero-art">${bikeArt('#67e8f9')}<span class="vs">VS</span>${bikeArt('#f472b6')}</div>
    </div>
    <div class="page-head">${ic('swords')}<div><h2>BITWY ROWER4SKINS</h2><small>WALCZ Z INNYMI GRACZAMI (BOTAMI)</small></div><span class="r18">18+</span></div>
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
        <button class="chip ${bl.mode === 'all' ? 'on' : ''}" data-act="bmode" data-arg="all">WSZYSTKIE</button>
        ${Object.entries(MODES).map(([k, m]) => `<button class="chip ${bl.mode === k ? 'on' : ''}" style="--mc:${m.col}" data-act="bmode" data-arg="${k}">${ic(m.icon)}${m.n.toUpperCase()}</button>`).join('')}
    </div>
    <div class="tpls">${tpl.map((t, i) => `<div class="tpl">
        <span class="mode-chip" style="--mc:${MODES.normal.col}">${ic('swords')}NORMAL</span>
        <div class="tpl-info"><small>${ic('users')}${t.players} graczy</small><b>${money(round2(t.cases.reduce((s, id) => s + CASE[id].price, 0)))}</b></div>
        <div class="tpl-cases">${groupCases(t.cases).map(g => `<div>${caseArt(CASE[g.id])}${g.n > 1 ? `<span class="bx">x${g.n}</span>` : ''}</div>`).join('')}</div>
        <button class="btn btn-blue" data-act="tpl" data-arg="${i}">${ic('bolt')}STWÓRZ</button>
    </div>`).join('')}</div>
    <div id="blist" class="blist">${battleListHtml()}</div>`;
}

// ----- tworzenie bitwy -----

const cr = { cases: [], players: 2, priv: false, mode: 'normal' };
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
        <div class="panel cr-card">
            <h4>${ic('lock')}Prywatność</h4><p>Otwieraj z kim chcesz!</p>
            <button class="opt ${!cr.priv ? 'on' : ''}" data-act="crPriv" data-arg="0">${ic('eye')}PUBLICZNA</button>
            <button class="opt ${cr.priv ? 'on' : ''}" data-act="crPriv" data-arg="1">${ic('eyeoff')}PRYWATNA</button>
        </div>
        <div class="panel cr-card wide">
            <h4>${ic('swords')}Tryb bitwy</h4><p>Zdecyduj, jak potoczy się bitwa!</p>
            <div class="opt-grid">${Object.entries(MODES).map(([k, mm]) => `<button class="opt ${cr.mode === k ? 'on' : ''}" data-act="crMode" data-arg="${k}">${ic(mm.icon)}${mm.n.toUpperCase()}</button>`).join('')}</div>
        </div>
        <div class="panel cr-card">
            <h4>${ic('info')}Podsumowanie</h4><p>Sprawdź szczegóły bitwy!</p>
            <div class="sum-box green">${ic('box')}<div><small>KOSZT SKRZYNEK</small><b>${money(crCost())}</b></div></div>
            <div class="sum-box purple">${ic('gift')}<div><small>${cr.mode === 'normal' ? 'GWARANTOWANY' : 'RUNDY'}</small><b>${cr.mode === 'normal' ? 'SKIN' : crRounds()}</b></div></div>
            <button class="btn btn-green btn-block" data-act="crCreate" ${cr.cases.length ? '' : 'disabled'}>STWÓRZ BITWĘ</button>
        </div>
    </div>
    <div class="panel mode-info" style="--mc:${m.col}"><span class="mode-ico">${ic(m.icon)}</span><div><h3>${m.n}</h3><p>${m.d}</p></div></div>`;
}

function startBattle(b) {
    const cost = bValue(b);
    if (state.balance < cost) { toast('Za mało środków na tę bitwę.', 'err'); return; }
    wallet(-cost, `Bitwa #${b.id}`);
    spend(cost);
    BATTLES.unshift(b);
    go('#/battle/' + b.id);
    runBattle(b);
}

// ----- widok bitwy -----

const dropChips = ids => ids.map(id => `<span class="mini" style="--rc:${RAR[SKIN[id].rarity].c}">${esc(SKIN[id].name)} · ${money(SKIN[id].price)}</span>`).join('');

function bvPlayer(b, s, i) {
    const r = b.res?.[i];
    const cls = b.status === 'done' ? (i === b.winner ? 'win' : 'lose') : '';
    const canTake = !s && b.status === 'waiting' && !b.running;
    return `<div class="bv-p ${cls}">
        <div class="bv-ph">${avatar(s, 'sm')}<span class="bv-name">${s ? esc(s.you ? state.name : s.name) : 'Wolne miejsce'}${s?.you ? ' <em>(Ty)</em>' : ''}</span><b class="bv-total money">${money(r ? r.total : 0)}</b></div>
        ${canTake ? `<div class="bv-free"><button class="btn btn-blue" data-act="join" data-arg="${b.id}">DOŁĄCZ ZA ${money(bValue(b))}</button></div>` : reelHtml(true, 'bv-reel')}
        <div class="bv-drops">${r ? dropChips(r.drops) : ''}</div>
    </div>`;
}

function bvResult(b) {
    if (b.status === 'done') {
        const w = b.slots[b.winner];
        return w.you ? `<span class="pos">Wygrałeś ${money(b.pot)}!</span>` : `<span class="neg">Wygrywa ${esc(w.name)}: ${money(b.pot)}</span>`;
    }
    if (b.running) return b.round >= 0 ? `Runda ${b.round + 1} / ${b.cases.length}` : 'Czekamy na graczy…';
    return 'Czeka na graczy';
}

function renderBattleView() {
    const b = BATTLES.find(x => String(x.id) === route.arg);
    if (!b) return `<button class="back" data-act="go" data-arg="#/battles">${ic('back')}Bitwy</button><div class="empty">${ic('swords')}<p>Ta bitwa już się zakończyła.</p></div>`;
    const m = MODES[b.mode];
    const spectator = !b.slots.some(s => s?.you) && !b.running && b.status === 'waiting';
    return `<div class="bv" id="bv-${b.id}" style="--mc:${m.col}">
        <div class="bv-head">
            <button class="back" data-act="go" data-arg="#/battles">${ic('back')}Bitwy</button>
            <span class="mode-chip">${ic(m.icon)}${m.n}</span>
            <div class="bv-val"><small>WARTOŚĆ BITWY</small><b class="money">${money(bValue(b))}</b></div>
            <div class="bv-round" id="bvRound">${bvResult(b)}</div>
            ${spectator ? `<button class="btn btn-dark" data-act="bots" data-arg="${b.id}">${ic('bolt')}Uruchom z botami</button>` : ''}
        </div>
        <div class="bv-cases">${b.cases.map((id, i) => `<div class="bv-case ${i === b.round && b.status !== 'done' ? 'cur' : ''} ${i < b.round || b.status === 'done' ? 'done' : ''}">${caseArt(CASE[id])}</div>`).join('')}</div>
        <div class="bv-players" style="--n:${b.players}">${b.slots.map((s, i) => bvPlayer(b, s, i)).join('')}</div>
    </div>`;
}

function afterBattleView() {
    const b = BATTLES.find(x => String(x.id) === route.arg);
    if (!b) return;
    const c = CASE[b.cases[Math.max(0, Math.min(b.round ?? 0, b.cases.length - 1))]];
    $$('.bv-reel').forEach(r => idleReel(r, c));
    if (b.status === 'done') {
        $$('.bv-p').forEach((el, i) => {
            const last = b.res[i].drops[b.res[i].drops.length - 1];
            const reel = $('.bv-reel', el);
            if (reel && last) reel.outerHTML = `<div class="reel-final">${itemCard(SKIN[last], { cls: 'glow' })}</div>`;
        });
    }
}

function bvPatch(b) {
    const root = $('#bv-' + b.id);
    if (!root) return;
    $('#bvRound', root).innerHTML = bvResult(b);
    $$('.bv-case', root).forEach((el, i) => {
        el.classList.toggle('cur', i === b.round && b.status !== 'done');
        el.classList.toggle('done', i < b.round || b.status === 'done');
    });
    $$('.bv-p', root).forEach((el, i) => {
        const r = b.res[i];
        $('.bv-total', el).textContent = money(r.total);
        $('.bv-drops', el).innerHTML = dropChips(r.drops);
        if (b.status === 'done') el.classList.add(i === b.winner ? 'win' : 'lose');
    });
}

const bvOpen = b => route.name === 'battle' && route.arg === String(b.id) && !!$('#bv-' + b.id);

async function runBattle(b) {
    if (b.running) return;
    b.running = true;
    b.round = -1;
    b.res = b.slots.map(() => ({ total: 0, drops: [] }));
    if (bvOpen(b)) renderPage();

    for (let i = 0; i < b.players; i++) {
        if (b.slots[i]) continue;
        await sleep(650);
        b.slots[i] = botPlayer();
        if (bvOpen(b)) renderPage();
    }
    b.status = 'running';
    refreshBattleList();
    if (bvOpen(b)) renderPage();
    await sleep(500);

    const dur = state.settings.fast ? 1400 : 3000;
    for (let r = 0; r < b.cases.length; r++) {
        b.round = r;
        const c = CASE[b.cases[r]];
        bvPatch(b);
        const wins = b.slots.map(() => roll(c));
        const reels = bvOpen(b) ? $$('#bv-' + b.id + ' .bv-reel') : [];
        await Promise.all(wins.map((w, i) => spinReel(reels[i], c, w, dur, i === 0)));
        wins.forEach((w, i) => { b.res[i].total = round2(b.res[i].total + SKIN[w].price); b.res[i].drops.push(w); });
        bvPatch(b);
        await sleep(450);
    }

    const scores = b.res.map(r => (b.mode === 'terminal' ? SKIN[r.drops[r.drops.length - 1]].price : r.total));
    const best = b.mode === 'underdog' ? Math.min(...scores) : Math.max(...scores);
    b.winner = pick(scores.map((s, i) => (s === best ? i : -1)).filter(i => i >= 0));
    b.pot = round2(b.res.reduce((s, r) => s + r.total, 0));
    b.status = 'done';
    b.running = false;

    const you = b.slots.findIndex(s => s?.you);
    if (you >= 0) {
        state.stats.battles++;
        const won = b.winner === you;
        if (won) {
            state.stats.battlesWon++;
            const all = b.res.flatMap(r => r.drops);
            const uids = giveItems(all, `Wygrana bitwa #${b.id}`);
            all.forEach(id => pushDrop(id, state.name, true));
            showWin(all, uids, 'Wygrałeś bitwę!');
        } else if (b.mode === 'normal') {
            const g = pick(SKINS.filter(s => s.rarity === 'consumer')).id;
            giveItems([g], `Gwarantowany skin, bitwa #${b.id}`);
            toast(`Przegrana. Gwarantowany skin: ${SKIN[g].weapon} | ${SKIN[g].name}`);
        } else {
            toast('Przegrałeś tę bitwę.', 'err');
        }
        state.myBattles.unshift({ t: Date.now(), mode: b.mode, players: b.players, value: bValue(b), won, prize: won ? b.pot : 0 });
        state.myBattles.length = Math.min(state.myBattles.length, 50);
        save();
    }
    bvPatch(b);
    refreshBattleList();
    setTimeout(() => { BATTLES = BATTLES.filter(x => x !== b); refreshBattleList(); }, 30000);
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
    ${state.inv.length ? `<div class="igrid">${state.inv.map(i => itemCard(SKIN[i.id], { cls: conSel.includes(i.uid) ? 'sel' : '', attrs: `data-act="csel" data-arg="${i.uid}"` })).join('')}</div>`
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
            ${state.inv.length ? `<div class="igrid sm">${state.inv.map(i => itemCard(SKIN[i.id], { cls: exSel.includes(i.uid) ? 'sel' : '', attrs: `data-act="exsel" data-arg="${i.uid}"` })).join('')}</div>` : `<div class="empty small">Brak przedmiotów.</div>`}
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
    if (!list.length) return `<div class="empty">${ic('box')}<p>${state.inv.length ? 'Nic nie pasuje do wyszukiwania.' : 'Ekwipunek jest pusty.'}</p></div>`;
    return `<div class="igrid">${list.map(i => itemCard(SKIN[i.id], { bottom: `<button class="sell-btn" data-act="sell" data-arg="${i.uid}">${ic('wallet')}Sprzedaj</button>` })).join('')}</div>`;
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
        <div class="panel info-card yellow">${ic('tag')}<div><b>Kody promocyjne</b><span>Wpisz kod, np. <code>ROWER4SKINS</code>, i zgarnij bonus.</span></div><button class="btn btn-outline" data-act="promoModal">WPISZ KOD</button></div>
    </div>
    <div class="tabs">${tabs.map(([k, i, t]) => `<button class="${tab === k ? 'on' : ''}" data-act="go" data-arg="#/profile/${k}">${ic(i)}${t}</button>`).join('')}</div>
    ${body}`;
}

// ============================================================
// Darmowe skrzynki i event
// ============================================================

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

function depositModal() {
    modal(`<h2 class="mtitle">${ic('bike')}Wpłać rower</h2>
        <p class="muted center">Zamień rower na wirtualne dolary. Teraz <b class="pos">+10% bonusu</b> do każdej wpłaty!</p>
        <div class="bikes">${BIKES.map(([n, v, c], i) => `<button class="bike" data-act="deposit" data-arg="${i}" style="--bc:${c}">
            ${bikeArt(c)}<b>${n}</b><span class="money">${money(v)}</span><small class="pos">+${money(round2(v * 0.1))} bonus</small></button>`).join('')}</div>
        <p class="muted center small">To symulator: rowery i dolary są wirtualne, nic nie jest pobierane.</p>`, 'wide');
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
            <span class="rname">${avatar(r.you ? me() : { name: r.name }, 'xs')}${esc(r.name)}</span>
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

function renderDrawer() {
    $('#drawer').innerHTML = `<div class="drawer-head"><h3>${ic('box')}Twoje przedmioty (${state.inv.length})</h3><span class="money">${money(invValue())}</span>
        <button class="btn btn-green" data-act="sellAll" ${state.inv.length ? '' : 'disabled'}>Sprzedaj wszystko</button>
        <button class="sq" data-act="drawer" aria-label="Zamknij">${ic('x')}</button></div>
        ${state.inv.length ? `<div class="igrid sm">${state.inv.slice(0, 60).map(i => itemCard(SKIN[i.id], { bottom: `<button class="sell-btn" data-act="sell" data-arg="${i.uid}">${ic('wallet')}Sprzedaj</button>` })).join('')}</div>`
            : `<div class="empty small">Ekwipunek jest pusty.</div>`}`;
}

// ============================================================
// Akcje (delegacja kliknięć)
// ============================================================

function refreshAfterInv() {
    if (!$('#drawer').hidden) renderDrawer();
    if (['profile', 'contract', 'exchanger'].includes(route.name)) renderPage();
}

// Akcje, po których okno modalne ma zostać otwarte (np. kolejne dodawanie skrzynek).
const KEEP_MODAL = ['modalclose', 'winsell', 'crAdd'];

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
    demo: () => openCase(true),
    winsell: () => { sellUids(winUids); closeModal(); refreshAfterInv(); },
    depositModal: () => depositModal(),
    deposit: i => {
        const [n, v] = BIKES[Number(i)];
        const total = round2(v * 1.1);
        wallet(total, `Wpłata: ${n}`);
        note(`Wpłacono „${n}”: +${money(total)}`);
        toast(`Wpłacono „${n}” — +${money(total)}`, 'ok');
        if (route.name === 'profile') renderPage();
        if (route.name === 'home' && filt.afford) refreshSections();
    },
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
    join: id => {
        const b = BATTLES.find(x => String(x.id) === id);
        if (!b || b.status !== 'waiting' || b.running || !b.slots.includes(null)) { toast('Ta bitwa już wystartowała.', 'err'); return; }
        const cost = bValue(b);
        if (state.balance < cost) { toast('Za mało środków na tę bitwę.', 'err'); return; }
        b.slots[b.slots.indexOf(null)] = me();
        wallet(-cost, `Bitwa #${b.id}`);
        spend(cost);
        go('#/battle/' + b.id);
        runBattle(b);
    },
    watch: id => {
        const b = BATTLES.find(x => String(x.id) === id);
        if (!b) return;
        b.watched = true;
        go('#/battle/' + id);
    },
    bots: id => {
        const b = BATTLES.find(x => String(x.id) === id);
        if (b && b.status === 'waiting' && !b.running) runBattle(b);
    },
    tpl: i => {
        const t = templates()[Number(i)];
        startBattle({ id: bseq++, mode: 'normal', players: t.players, cases: t.cases, slots: [me(), ...Array(t.players - 1).fill(null)], status: 'waiting', t: Date.now() });
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
    crPriv: v => { cr.priv = v === '1'; renderPage(); },
    crMode: m => { cr.mode = m; renderPage(); },
    crCreate: () => {
        if (!cr.cases.length) return;
        const cases = cr.cases.flatMap(x => Array(x.n).fill(x.id));
        startBattle({ id: bseq++, mode: cr.mode, players: cr.players, cases, slots: [me(), ...Array(cr.players - 1).fill(null)], status: 'waiting', t: Date.now(), priv: cr.priv });
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
        toast('Zapisano nick.', 'ok');
        renderPage();
    },
    setColor: c => { state.color = c; save(); renderTop(); renderPage(); },
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
for (let i = 0; i < 30; i++) drops.push({ id: roll(pick(USD_CASES)), user: pick(BOT_NAMES), mine: false, st: Math.random() < 0.12 });
renderDrops(false);
for (let i = 0; i < 8; i++) BATTLES.push(newBotBattle());
go('#/');
setInterval(tick, 1000);
setInterval(battleTick, 4500);
setInterval(() => { const el = $('#online'); if (el) el.textContent = 3000 + Math.floor(Math.random() * 300); }, 5000);
setTimeout(botDropLoop, 2000);
