using System;
using System.Collections.Generic;
using System.Linq;
using BeastLab.Dltb;
using BeastLab.Game;
using BeastLab.Generated;
using V3 = System.Numerics.Vector3;

namespace BeastLab.Systems
{
    /// <summary>
    /// The Beast's infected types played by BONELAB's own NPCs (sheet infected.json). Their health, speed and
    /// damage are written from The Beast's data through stat_probes.json; a stat not read from the
    /// player's copy is left at BONELAB's value. Night spawns faster and lets Volatiles out.
    /// </summary>
    public sealed class InfectedSystem : BeastSystem
    {
        sealed class Tracked { public InfectedRow Row = null!; public object Go = null!; public object? Brain; public Label? Label; public bool Dead; }

        readonly PlayerSystem _player;
        readonly HudSystem _hud;
        readonly DltbReaderSystem _dltb;
        readonly StashSystem _stash;
        readonly DayNightSystem _dayNight;
        ScavengeSystem? _scavenge;
        readonly Random _rng = new();
        readonly List<Tracked> _alive = new();
        float _untilSpawn = 8f;
        int _pending;
        readonly HashSet<string> _probeLogged = new();

        public InfectedSystem(PlayerSystem player, HudSystem hud, DltbReaderSystem dltb, StashSystem stash, DayNightSystem dayNight)
            : base(SystemIds.infected)
        { _player = player; _hud = hud; _dltb = dltb; _stash = stash; _dayNight = dayNight; }

        public void Attach(ScavengeSystem scavenge) => _scavenge = scavenge;

        protected override void OnLevel() { _alive.Clear(); _pending = 0; _untilSpawn = 8f; }

        protected override void Tick(float dt)
        {
            if (!_player.InLevel || !_dltb.Ready) return;
            Reap();
            var phase = _dayNight.Phase;
            _untilSpawn -= dt;
            if (_untilSpawn > 0 || _alive.Count + _pending >= phase.MaxAlive) return;
            _untilSpawn = phase.SpawnInterval;
            var choices = Sheets.Infected.Where(r => r.Phase == "both" || r.Phase == phase.InfectedPhase).ToList();
            float total = choices.Sum(c => c.Weight), roll = (float)_rng.NextDouble() * total;
            var row = choices.First(c => (roll -= c.Weight) <= 0 || c == choices[^1]);
            SpawnOne(row);
        }

        void SpawnOne(InfectedRow row)
        {
            var crate = Sheets.BonelabCrates.First(c => c.Id == row.BonelabNpc);
            var pos = _player.RingPoint(_rng, 12f, 22f);
            _pending++;
            Bridge.Spawn(crate.Barcode, pos, _player.Head - pos, go =>
            {
                _pending = Math.Max(0, _pending - 1);
                if (go == null) return;
                var t = new Tracked { Row = row, Go = go, Brain = Bridge.ComponentInChildren(go, HookIds.ai_brain) };
                if (_dltb.Catalog!.InfectedByRow.TryGetValue(row.Id, out var beast)) ApplyStats(go, beast);
                t.Label = _hud.AddLabel(row.Display, row.Phase == "night" ? "#ff4040" : "#ff9a9a", pos, Bridge.Transform(go));
                t.Label.FollowHeight = 2.1f;
                _alive.Add(t);
            });
        }

        static readonly string[] StatColumns = { DltbColumnIds.infected_health, DltbColumnIds.infected_speed, DltbColumnIds.infected_damage };

        void ApplyStats(object go, BeastThing beast)
        {
            foreach (var probe in Sheets.StatProbes.Where(p => StatColumns.Contains(p.Stat)))
            {
                var property = Sheets.ColumnsDltb.First(c => c.Id == probe.Stat).Property;
                float v = beast.Get(property);
                if (v < 0 || !Bridge.Has(probe.Component)) continue;     // not read from The Beast: keep BONELAB's value
                var comp = Bridge.ComponentInChildren(go, probe.Component);
                if (comp == null) continue;
                float value = Math.Clamp(v * probe.Scale, probe.Min, probe.Max);
                string? used = null;
                foreach (var path in probe.Paths)
                {
                    var parts = path.Split('.');
                    object? target = comp;
                    for (int i = 0; i < parts.Length - 1 && target != null; i++) target = Bridge.Member(target, parts[i]);
                    try { if (Bridge.SetMember(target, parts[^1], value)) { used = path; break; } } catch { }
                }
                if (_probeLogged.Add(probe.Id))
                    Mod.Log.Msg(used != null
                        ? $"stat {probe.Id}: {beast.Id} {property}={v} -> {probe.Component}.{used}={value}"
                        : $"stat {probe.Id}: no member matched ({string.Join(", ", probe.Paths)}); BONELAB value kept");
            }
        }

        bool IsDead(Tracked t)
        {
            if (!Bridge.Alive(t.Go)) return true;
            if (!(bool)Bridge.Get(t.Go, HookIds.go_active)!) return true;            // despawned by BONELAB's pool
            if (t.Brain != null && Bridge.Has(HookIds.ai_brain_isdead))
                try { return (bool)Bridge.Get(t.Brain, HookIds.ai_brain_isdead)!; } catch { }
            return false;
        }

        void Reap()
        {
            for (int i = _alive.Count - 1; i >= 0; i--)
            {
                var t = _alive[i];
                if (!IsDead(t)) continue;
                _alive.RemoveAt(i);
                _hud.Remove(t.Label);
                _stash.Kills++;
                if (_scavenge != null)
                {
                    var drop = Sheets.Loot.First(l => l.Id == LootIds.supply_bag);
                    var got = _scavenge.GiveRolls(drop, t.Row.LootRolls);
                    _hud.Toast(HudIds.infected_killed, ("type", t.Row.Display));
                    if (got.Count > 0) _hud.Toast(HudIds.loot_found, ("cache", t.Row.Display), ("items", string.Join(", ", got)));
                }
            }
        }
    }
}
