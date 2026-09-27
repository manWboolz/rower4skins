import json, re, math, random, unicodedata, collections, sys
S = sys.argv[1]  # folder z pobranym skins.json (https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins.json)
R = '/home/user/rower4skins/rower4skins/'
data = json.load(open(S + '/skins.json'))

RMAP = {'Consumer Grade': 'consumer', 'Industrial Grade': 'industrial', 'Mil-Spec Grade': 'milspec', 'Restricted': 'restricted',
        'Classified': 'classified', 'Covert': 'covert', 'Extraordinary': 'gold', 'Contraband': 'covert'}

MODELS = {
    'AK-47': ['img/w-ak47.png', 'img/sk/ak_fire_serpent.webp', 'img/sk/ak_vulcan.webp', 'img/sk/ak_neon_revolution.webp', 'img/sk/ak_bloodsport.webp', 'img/sk/ak_the_empress.webp', 'img/sk/ak_aquamarine_revenge.webp'],
    'AWP': ['img/w-awp.png', 'img/sk/awp_dragon_lore.webp', 'img/sk/awp_man_o_war.webp', 'img/sk/awp_asiimov.webp', 'img/sk/awp_hyper_beast.webp'],
    'M4A1-S': ['img/w-m4a1s.png', 'img/sk/m4a1s_hyper_beast.webp', 'img/sk/m4a1s_chanticos_fire.webp', 'img/sk/m4a1s_mecha_industries.webp', 'img/sk/m4a1s_golden_coil.webp'],
    'M4A4': ['img/w-m4a4.png', 'img/sk/m4a4_buzz_kill.webp', 'img/sk/m4a4_desert_strike.webp'],
    'Galil AR': ['img/w-galil.png'], 'USP-S': ['img/w-usps.png', 'img/sk/usps_kill_confirmed.webp'],
    'SSG 08': ['img/w-ssg08.png', 'img/sk/ssg_dragonfire.webp'], 'Glock-18': ['img/w-glock.png'],
    'P90': ['img/sk/p90_asiimov.webp'], 'MAC-10': ['img/sk/base_mac10.webp', 'img/sk/mac10_neon_rider.webp'],
    'R8 Revolver': ['img/sk/r8_fade.webp'], 'P2000': ['img/sk/p2000_fire_elemental.webp'],
    'MP5-SD': ['img/sk/base_mp5sd.webp'], 'Nova': ['img/sk/base_nova.webp'], 'SG 553': ['img/sk/base_sg553.webp'], 'XM1014': ['img/sk/base_xm1014.webp'],
}
BASE = {'MAC-10': 'img/sk/base_mac10.webp', 'MP5-SD': 'img/sk/base_mp5sd.webp', 'Nova': 'img/sk/base_nova.webp', 'SG 553': 'img/sk/base_sg553.webp', 'XM1014': 'img/sk/base_xm1014.webp'}
GLOVES = ['img/sk/base_gloves_ct.webp', 'img/sk/base_gloves_t.webp']

# Skiny z prawdziwym obrazkiem (wycięte ze screena) i ich ceny
REAL = {
    'AWP | Dragon Lore': ('img/sk/awp_dragon_lore.webp', 2400), 'AK-47 | Fire Serpent': ('img/sk/ak_fire_serpent.webp', 950),
    'M4A4 | Buzz Kill': ('img/sk/m4a4_buzz_kill.webp', 55), 'SSG 08 | Dragonfire': ('img/sk/ssg_dragonfire.webp', 45),
    'P90 | Asiimov': ('img/sk/p90_asiimov.webp', 22), 'AK-47 | Vulcan': ('img/sk/ak_vulcan.webp', 180),
    'USP-S | Kill Confirmed': ('img/sk/usps_kill_confirmed.webp', 60), 'MAC-10 | Neon Rider': ('img/sk/mac10_neon_rider.webp', 9),
    'M4A1-S | Hyper Beast': ('img/sk/m4a1s_hyper_beast.webp', 24), "M4A1-S | Chantico's Fire": ('img/sk/m4a1s_chanticos_fire.webp', 38),
    "AWP | Man-o'-war": ('img/sk/awp_man_o_war.webp', 18), 'AK-47 | Neon Revolution': ('img/sk/ak_neon_revolution.webp', 42),
    'Galil AR | Chatterbox': ('img/sk/galil_chatterbox.webp', 7), 'M4A1-S | Mecha Industries': ('img/sk/m4a1s_mecha_industries.webp', 14),
    'AK-47 | Bloodsport': ('img/sk/ak_bloodsport.webp', 58), 'R8 Revolver | Fade': ('img/sk/r8_fade.webp', 22),
    'P2000 | Fire Elemental': ('img/sk/p2000_fire_elemental.webp', 12), 'M4A1-S | Golden Coil': ('img/sk/m4a1s_golden_coil.webp', 32),
    'AK-47 | The Empress': ('img/sk/ak_the_empress.webp', 48), 'AWP | Asiimov': ('img/sk/awp_asiimov.webp', 115),
    'AK-47 | Aquamarine Revenge': ('img/sk/ak_aquamarine_revenge.webp', 36), 'AWP | Hyper Beast': ('img/sk/awp_hyper_beast.webp', 38),
    'M4A4 | Desert-Strike': ('img/sk/m4a4_desert_strike.webp', 9),
}
FIXED = {'M4A1-S | Cyrex': ('img/w-m4a1s.png', 'red'), 'M4A4 | Howl': ('img/w-m4a4.png', 'red'), 'AWP | Medusa': ('img/sk/awp_man_o_war.webp', 'teal'),
         'AK-47 | Redline': ('img/w-ak47.png', 'red'), 'AWP | Gungnir': ('img/sk/awp_asiimov.webp', 'blue')}
FAMOUS = {'M4A4 | Howl': 1300, 'AWP | Medusa': 900, 'AWP | Gungnir': 1100, 'AWP | The Prince': 700, 'AK-47 | Wild Lotus': 1400,
          'AK-47 | Gold Arabesque': 900, 'M4A1-S | Welcome to the Jungle': 450, 'M4A1-S | Knight': 600, 'M4A1-S | Hot Rod': 300,
          'Glock-18 | Fade': 700, 'USP-S | Kill Confirmed': 60, 'AK-47 | Case Hardened': 140, 'AWP | Lightning Strike': 250,
          'M4A1-S | Printstream': 90, 'AK-47 | Redline': 25, 'AWP | Fade': 900, 'AK-47 | X-Ray': 300, 'Desert Eagle | Blaze': 400}

COLORS = [  # (tint, [słowa])
    ('red', ['red', 'blood', 'crimson', 'scarlet', 'fire', 'flame', 'inferno', 'lava', 'ruby', 'cardinal', 'hot rod', 'heat', 'magma', 'ember', 'dragon', 'demon', 'hellfire', 'redline', 'vermillion', 'blaze', 'bloodsport', 'slaughter']),
    ('pink', ['pink', 'rose', 'magenta', 'bubblegum', 'candy', 'flamingo', 'sakura', 'cherry', 'fever', 'lotus', 'princess', 'heart']),
    ('purple', ['purple', 'violet', 'ultraviolet', 'amethyst', 'lavender', 'plum', 'grape', 'orchid', 'mystic', 'phantom', 'dark matter', 'nebula', 'gamma']),
    ('blue', ['blue', 'cobalt', 'sapphire', 'ice', 'frost', 'sky', 'azure', 'storm', 'arctic', 'blueprint', 'navy', 'marine', 'lightning', 'bright water', 'royal']),
    ('teal', ['teal', 'aqua', 'turquoise', 'cyan', 'ocean', 'sea', 'tidal', 'water', 'lagoon', 'jade', 'marina']),
    ('green', ['green', 'jungle', 'emerald', 'toxic', 'acid', 'forest', 'leaf', 'moss', 'venom', 'serpent', 'poison', 'army', 'olive', 'nuclear', 'hydra', 'boreal', 'jungle']),
    ('yellow', ['yellow', 'lemon', 'banana', 'electric', 'bumblebee', 'hive', 'buzz', 'sunflower', 'daybreak']),
    ('gold', ['gold', 'golden', 'sun', 'brass', 'bronze', 'chantico', 'arabesque', 'emperor', 'empress', 'king', 'midas', 'lore']),
    ('orange', ['orange', 'copper', 'amber', 'rust', 'sunset', 'tiger', 'autumn', 'pumpkin', 'asiimov', 'heat', 'tangerine', 'fuel']),
    ('white', ['white', 'snow', 'bone', 'pearl', 'ghost', 'winter', 'ivory', 'marble', 'printstream', 'mecha', 'polar']),
    ('black', ['black', 'shadow', 'dark', 'night', 'midnight', 'carbon', 'obsidian', 'onyx', 'graphite', 'noir', 'stealth', 'slate', 'void', 'widow']),
    ('silver', ['silver', 'chrome', 'steel', 'metal', 'urban', 'nickel', 'damascus', 'tungsten', 'gunsmoke', 'metallic', 'grey', 'gray', 'scorched', 'fade']),
    ('camo', ['camo', 'ddpat', 'safari', 'sand', 'desert', 'dune', 'contractor', 'wood', 'walnut', 'tan', 'predator', 'mudder', 'sage', 'hunter']),
]
HEX = {'red': ('#991b1b', '#f87171'), 'pink': ('#9d174d', '#f9a8d4'), 'purple': ('#4c1d95', '#c4b5fd'), 'blue': ('#1e3a8a', '#93c5fd'),
       'teal': ('#115e59', '#5eead4'), 'green': ('#14532d', '#86efac'), 'yellow': ('#a16207', '#fde047'), 'gold': ('#92400e', '#fcd34d'),
       'orange': ('#9a3412', '#fdba74'), 'white': ('#9ca3af', '#f9fafb'), 'black': ('#0b0f19', '#6b7280'), 'silver': ('#4b5563', '#e5e7eb'),
       'camo': ('#3f3f2a', '#a8a37a')}
FALLBACK = ['red', 'blue', 'green', 'purple', 'pink', 'gold', 'teal', 'orange', 'silver']

def color_of(name):
    n = name.lower().split('|')[-1]
    for c, words in COLORS:
        if any(w in n for w in words): return c
    return FALLBACK[int(hashlib_md5(name), 16) % len(FALLBACK)]

import hashlib
def hashlib_md5(s): return hashlib.md5(s.encode()).hexdigest()[:8]

def slug(s):
    s = unicodedata.normalize('NFKD', s).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

RMED = {'consumer': 0.06, 'industrial': 0.2, 'milspec': 0.7, 'restricted': 3.6, 'classified': 14, 'covert': 55}
WMUL = {'AK-47': 1.7, 'AWP': 1.9, 'M4A1-S': 1.5, 'M4A4': 1.4, 'USP-S': 1.1, 'Glock-18': 1.0, 'Desert Eagle': 1.2}
KNIFE_SHAPE = {'Karambit': 'karambit', 'Butterfly Knife': 'butterfly', 'M9 Bayonet': 'm9', 'Bayonet': 'bayonet', 'Talon Knife': 'talon',
               'Flip Knife': 'bayonet', 'Huntsman Knife': 'talon', 'Falchion Knife': 'talon', 'Bowie Knife': 'bayonet', 'Stiletto Knife': 'bayonet'}
KMUL = {'Karambit': 2.3, 'Butterfly Knife': 2.5, 'M9 Bayonet': 1.9, 'Bayonet': 1.3, 'Talon Knife': 1.7, 'Flip Knife': 1.0,
        'Huntsman Knife': 0.8, 'Falchion Knife': 0.7, 'Bowie Knife': 0.8, 'Stiletto Knife': 1.3}
HOT = ['fade', 'doppler', 'crimson web', 'case hardened', 'lore', 'gamma', 'marble', 'tiger tooth', 'slaughter', 'emerald', 'sapphire', 'ruby']

def price_for(name, weapon, rarity, kmul=1.0):
    rnd = random.Random(name)
    if name in REAL: return REAL[name][1]
    if name in FAMOUS: return FAMOUS[name]
    spread = math.exp(rnd.gauss(0, 0.5))
    if rarity == 'gold':
        base = 190 * kmul
        if any(h in name.lower() for h in HOT): base *= 2.2
        return round(base * spread, 2)
    p = RMED[rarity] * WMUL.get(weapon, 0.85) * spread
    return max(0.03, round(p, 2))

seen = set()
guns, knives = [], []
by_w = collections.defaultdict(list)
for s in data:
    name = s['name']
    if name in seen or not s.get('weapon') or not s.get('rarity'): continue
    seen.add(name)
    w = s['weapon']['name']; r = RMAP.get(s['rarity']['name'])
    if not r: continue
    cat = (s.get('category') or {}).get('name')
    if cat == 'Gloves': by_w['__gloves'].append((name, w, 'gold'))
    elif cat == 'Knives':
        if w in KNIFE_SHAPE: by_w['__k_' + w].append((name, w, 'gold'))
    elif w in MODELS: by_w[w].append((name, w, r))

ORDER = ['consumer', 'industrial', 'milspec', 'restricted', 'classified', 'covert']
def take(lst, cap, must=()):
    lst = sorted(lst, key=lambda t: (t[0] not in must, hashlib_md5(t[0])))
    chosen = [t for t in lst if t[0] in must]
    rest = [t for t in lst if t[0] not in must]
    # równomiernie po rzadkościach
    buckets = collections.defaultdict(list)
    for t in rest: buckets[t[2]].append(t)
    while len(chosen) < cap and any(buckets.values()):
        for r in ORDER + ['gold']:
            if buckets[r] and len(chosen) < cap: chosen.append(buckets[r].pop())
    return chosen

out_guns = []
for w, models in MODELS.items():
    for name, wn, r in take(by_w[w], 36, must=set(REAL) | set(FAMOUS) | {'M4A1-S | Cyrex'}):
        if name in REAL: img, tint = REAL[name][0], 'none'
        elif name in FIXED: img, tint = FIXED[name]
        else:
            c = color_of(name)
            img = BASE.get(w) or models[int(hashlib_md5(name), 16) % len(models)]
            tint = c
        out_guns.append([slug(name), wn, name.split(' | ', 1)[1] if ' | ' in name else name, r, price_for(name, wn, r), img, tint, 'gun'])
# M4A1-S | Cyrex: model M4A1-S na czerwono
if not any(g[1] == 'M4A1-S' and g[2] == 'Cyrex' for g in out_guns):
    out_guns.append(['m4a1-s-cyrex', 'M4A1-S', 'Cyrex', 'covert', 18, 'img/w-m4a1s.png', 'red', 'gun'])
for name, wn, r in take(by_w['__gloves'], 30):
    c = color_of(name)
    img = GLOVES[int(hashlib_md5(name), 16) % 2]
    out_guns.append([slug(name), wn if wn.startswith('★') else '★ ' + wn, name.split(' | ', 1)[1], 'gold', round(price_for(name, wn, 'gold') * 0.8, 2), img, c, 'gloves'])
out_knives = []
for kw in KNIFE_SHAPE:
    for name, wn, r in take(by_w['__k_' + kw], 12):
        c = color_of(name)
        c1, c2 = HEX[c]
        nl = name.lower()
        pat = 's' if any(k in nl for k in ['tiger', 'stripe', 'slaughter']) else 'c' if any(k in nl for k in ['ddpat', 'camo', 'forest', 'safari', 'boreal', 'urban', 'night', 'scorched', 'stained', 'bright water']) else 'f'
        pn = name.split(' | ', 1)[1] if ' | ' in name else 'Vanilla'
        out_knives.append([slug(name), '★ ' + kw, pn, price_for(name, kw, 'gold', KMUL[kw]), KNIFE_SHAPE[kw], c1, c2, pat])

# stare skiny -> cena (zwrot przy migracji)
old = {}
src = open(R + 'script.js').read()
for m in re.finditer(r"\['([a-z0-9_]+)', '[^']*', '[^']*', '[a-z]+', ([0-9.]+), '[a-z0-9]+'\]", src): old[m.group(1)] = float(m.group(2))
for m in re.finditer(r"\['(kn\d|gl\d)', '[^']*', '[^']*', ([0-9.]+),", src): old[m.group(1)] = float(m.group(2))

TINTS = {'none': '', 'red': 'sepia(1) saturate(6) hue-rotate(-40deg) brightness(.95)', 'orange': 'sepia(1) saturate(5) hue-rotate(-15deg)',
         'gold': 'sepia(1) saturate(3) hue-rotate(-5deg) brightness(1.1)', 'yellow': 'sepia(1) saturate(6) hue-rotate(15deg) brightness(1.15)',
         'green': 'sepia(1) saturate(5) hue-rotate(70deg)', 'teal': 'sepia(1) saturate(5) hue-rotate(125deg)', 'blue': 'sepia(1) saturate(5) hue-rotate(175deg)',
         'purple': 'sepia(1) saturate(5) hue-rotate(225deg)', 'pink': 'sepia(1) saturate(5) hue-rotate(280deg) brightness(1.05)',
         'white': 'grayscale(1) brightness(1.55) contrast(.85)', 'black': 'grayscale(1) contrast(1.35) brightness(.7)',
         'silver': 'grayscale(1) brightness(1.2) contrast(1.1)', 'camo': 'sepia(.9) saturate(1.3) brightness(.85)'}

js = ['// Wygenerowane przez gen_skins.py z publicznej bazy nazw skinów CS2 (ByMykel/CSGO-API).',
      '// Broń: [id, broń, nazwa, rzadkość, cena, obrazek, kolor, typ]. Noże: [id, broń, nazwa, cena, kształt, kolor1, kolor2, wzór].',
      'const TINTS = ' + json.dumps(TINTS, ensure_ascii=False) + ';',
      'const GUN_DATA = [']
js += ['    ' + json.dumps(g, ensure_ascii=False) + ',' for g in out_guns]
js += ['];', 'const KNIFE_DATA = [']
js += ['    ' + json.dumps(k, ensure_ascii=False) + ',' for k in out_knives]
js += ['];', 'const OLD_PRICES = ' + json.dumps(old) + ';', '']
open(R + 'skins.js', 'w').write('\n'.join(js))
cnt = collections.Counter(g[3] for g in out_guns)
print('guns', len(out_guns), dict(cnt), 'knives', len(out_knives), 'old', len(old))
print('weapons', collections.Counter(g[1] for g in out_guns))
