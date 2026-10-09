using System;
using System.Collections.Generic;
using System.Linq;
using BeastLab.Dltb;
using BeastLab.Game;
using BeastLab.Generated;
using V3 = System.Numerics.Vector3;

namespace BeastLab.Systems
{
    /// <summary>At dawn, loot caches (sheet loot.json) appear around the player. Walking up to one searches it
    /// and rolls The Beast's real items.</summary>
    public sealed class ScavengeSystem : BeastSystem
    {
        readonly PlayerSystem _player;
        readonly HudSystem _hud;
        readonly DltbReaderSystem _dltb;
        readonly StashSystem _stash;
        readonly Random _rng = new();
        readonly List<(LootRow row, Label label)> _caches = new();
        bool _pendingDrop;

        public ScavengeSystem(PlayerSystem player, HudSystem hud, DltbReaderSystem dltb, StashSystem stash, DayNightSystem dayNight)
            : base(SystemIds.scavenge)
        {
            _player = player; _hud = hud; _dltb = dltb; _stash = stash;
            dayNight.PhaseStarted += p => { if (p.LootDrop) _pendingDrop = true; };
        }

        protected override void OnLevel() => _caches.Clear(); // labels are cleared by the HUD

        void Drop()
        {
            foreach (var c in _caches) _hud.Remove(c.label);
            _caches.Clear();
            foreach (var row in Sheets.Loot)
                for (int i = 0; i < row.PerDawn; i++)
                {
                    var pos = _player.RingPoint(_rng, row.MinDist, row.MaxDist) + new V3(0, 0.6f, 0);
                    _caches.Add((row, _hud.AddLabel($"[ {row.Label} ]", "#ffd29a", pos)));
                }
        }

        /// <summary>Pick one Beast thing: source by the cache's weights, then by rarity weight.</summary>
        public BeastThing? Roll(LootRow row)
        {
            var cat = _dltb.Catalog!;
            var sources = new List<(string id, float w)>
            {
                (DltbSourceIds.weapons, row.WWeapons), (DltbSourceIds.consumables, row.WConsumables),
                (DltbSourceIds.ammo, row.WAmmo), (DltbSourceIds.craftparts, row.WCraftparts),
            }.Where(s => s.w > 0 && cat.Of(s.id).Count > 0).ToList();
            if (sources.Count == 0) return null;
            var src = Pick(sources, s => s.w).id;
            return Pick(cat.Of(src), t => StashSystem.RarityRow(t.Rarity).Weight);
        }

        T Pick<T>(IList<T> items, Func<T, float> weight)
        {
            float total = items.Sum(weight), r = (float)_rng.NextDouble() * total;
            foreach (var i in items) { r -= weight(i); if (r <= 0) return i; }
            return items[items.Count - 1];
        }

        /// <summary>Rolls loot straight into the stash (used by infected drops too).</summary>
        public List<string> GiveRolls(LootRow row, int rolls)
        {
            var got = new List<string>();
            for (int i = 0; i < rolls; i++)
            {
                var t = Roll(row);
                if (t != null) got.Add(_stash.Give(t));
            }
            return got;
        }

        protected override void Tick(float dt)
        {
            if (!_player.InLevel || !_dltb.Ready) return;
            if (_pendingDrop) { _pendingDrop = false; Drop(); }
            var head = _player.Head;
            for (int i = _caches.Count - 1; i >= 0; i--)
            {
                var (row, label) = _caches[i];
                var d = label.Pos - head;
                if (Math.Abs(d.Y) > 2.5f || new V3(d.X, 0, d.Z).Length() > row.SearchRadius) continue;
                var got = GiveRolls(row, row.Rolls);
                if (got.Count == 0) _hud.Toast(HudIds.loot_empty, ("cache", row.Label));
                else _hud.Toast(HudIds.loot_found, ("cache", row.Label), ("items", string.Join(", ", got)));
                _hud.Remove(label);
                _caches.RemoveAt(i);
            }
        }
    }
}
