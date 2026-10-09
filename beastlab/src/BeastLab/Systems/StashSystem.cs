using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.RegularExpressions;
using BeastLab.Dltb;
using BeastLab.Game;
using BeastLab.Generated;
using V3 = System.Numerics.Vector3;

namespace BeastLab.Systems
{
    /// <summary>
    /// What the player carries from The Beast: craft parts and consumables (counted), ammo (into BONELAB's
    /// ammo pouch) and weapons (spawned as BONELAB physics weapons wearing The Beast's name and stats).
    /// Uses a medkit by itself when health drops below 40%.
    /// </summary>
    public sealed class StashSystem : BeastSystem
    {
        readonly PlayerSystem _player;
        readonly HudSystem _hud;
        public readonly Dictionary<string, int> Items = new(StringComparer.OrdinalIgnoreCase);
        readonly Dictionary<string, BeastThing> _things = new(StringComparer.OrdinalIgnoreCase);
        public int Kills;
        float _healCooldown;
        const float HealBelow = 0.4f;

        public StashSystem(PlayerSystem player, HudSystem hud) : base(SystemIds.stash) { _player = player; _hud = hud; }

        public int Count(string id) => Items.TryGetValue(id, out var n) ? n : 0;

        public bool Take(string id, int n)
        {
            if (Count(id) < n) return false;
            Items[id] -= n;
            if (Items[id] <= 0) Items.Remove(id);
            return true;
        }

        public static RarityRow RarityRow(string id) => Sheets.Rarity.First(r => r.Id == id);

        /// <summary>Give the player one Beast thing. Returns the short text for the HUD.</summary>
        public string Give(BeastThing t, int count = 1)
        {
            _things[t.Id] = t;
            switch (t.Source)
            {
                case DltbSourceIds.weapons:
                    for (int i = 0; i < count; i++) SpawnWeapon(t);
                    return t.Display;
                case DltbSourceIds.ammo:
                    return AddAmmo(t, count) ? $"{t.Display} ammo" : t.Display;
                default: // consumables, craftparts
                    Items[t.Id] = Count(t.Id) + count;
                    return count > 1 ? $"{t.Display} x{count}" : t.Display;
            }
        }

        static WeaponClassRow ClassOf(BeastThing weapon)
        {
            var key = weapon.Id + " " + weapon.Category;
            return Sheets.WeaponClasses.First(w => Regex.IsMatch(key, w.Match, RegexOptions.IgnoreCase));
        }

        void SpawnWeapon(BeastThing w)
        {
            var cls = ClassOf(w);
            var crate = Sheets.BonelabCrates.First(c => c.Id == cls.Bonelab);
            var rar = RarityRow(w.Rarity);
            float dmg = w.Get("damage");
            var pos = _player.Head + _player.Forward * 0.7f + new V3(0, -0.35f, 0);
            Bridge.Spawn(crate.Barcode, pos, -_player.Forward, go =>
            {
                if (go == null) return;
                var label = _hud.AddLabel($"{w.Display}\n{rar.Id}{(dmg >= 0 ? $"  dmg {dmg:0}" : "")}", rar.Color, pos, Bridge.Transform(go));
                label.FollowHeight = 0.35f;
            });
            _hud.Toast(HudIds.weapon_spawned, ("weapon", w.Display), ("rarity", rar.Id), ("damage", dmg >= 0 ? dmg.ToString("0") : "?"));
            if (cls.AmmoClass != AmmoClassesIds.none)
            {
                // A gun comes with a little of its ammo, like a Beast weapon drop.
                AddAmmoToGroup(Sheets.AmmoClasses.First(a => a.Id == cls.AmmoClass), 12, w.Display);
            }
        }

        bool AddAmmo(BeastThing ammo, int stacks)
        {
            var cls = Sheets.AmmoClasses.Where(a => a.Id != AmmoClassesIds.none)
                .First(a => Regex.IsMatch(ammo.Id, a.Match, RegexOptions.IgnoreCase));
            int count = (int)Math.Clamp(ammo.Get("count", 12), 1, 60) * stacks;
            return AddAmmoToGroup(cls, count, ammo.Display);
        }

        bool AddAmmoToGroup(AmmoClassRow cls, int count, string itemName)
        {
            if (!Bridge.Has(HookIds.ammo_inventory) || !Bridge.Has(HookIds.ammo_add) || !Bridge.Has(cls.Hook)) return false;
            var inv = Bridge.Get(null, HookIds.ammo_inventory);
            if (!Bridge.Alive(inv)) return false;
            var group = Bridge.Get(inv, cls.Hook);
            Bridge.Call(inv, HookIds.ammo_add, group, count);
            _hud.Toast(HudIds.ammo_added, ("count", count), ("group", cls.Id), ("item", itemName));
            return true;
        }

        protected override void OnLevel() { /* the stash travels with the player between levels */ }

        protected override void Tick(float dt)
        {
            if (!_player.InLevel) return;
            int parts = Items.Where(kv => _things.TryGetValue(kv.Key, out var t) && t.Source == DltbSourceIds.craftparts).Sum(kv => kv.Value);
            var meds = Items.Where(kv => _things.TryGetValue(kv.Key, out var t) && t.Source == DltbSourceIds.consumables).ToList();
            _hud.Line(HudIds.stash_line, ("parts", parts), ("meds", meds.Sum(m => m.Value)), ("kills", Kills));

            _healCooldown -= dt;
            if (_healCooldown > 0 || meds.Count == 0) return;
            var hp = _player.Health();
            if (hp == null || hp.Value.max <= 0 || hp.Value.cur / hp.Value.max >= HealBelow) return;
            // Use the strongest medkit The Beast gave us.
            var best = meds.Select(m => _things[m.Key]).OrderByDescending(t => t.Get("heal", 0)).First();
            float frac = Math.Clamp(best.Get("heal", 40) / 100f, 0.05f, 1f);
            float heal = hp.Value.max * frac;
            _player.SetHealth(Math.Min(hp.Value.max, hp.Value.cur + heal));
            Take(best.Id, 1);
            _healCooldown = 3f;
            _hud.Toast(HudIds.med_used, ("item", best.Display), ("heal", heal.ToString("0")));
        }
    }
}
