using System;
using System.Linq;
using BeastLab.Game;
using BeastLab.Generated;

namespace BeastLab.Systems
{
    /// <summary>Base for every row of sheets/systems.json.</summary>
    public abstract class BeastSystem
    {
        public readonly SystemRow Row;
        public bool Enabled { get; private set; } = true;
        public string? OffReason { get; private set; }
        float _accum;
        int _failures;

        protected BeastSystem(string id) { Row = Sheets.Systems.First(s => s.Id == id); }

        /// <summary>Switch off when a required hook is missing; returns the reason or null.</summary>
        public string? CheckHooks()
        {
            var missing = Bridge.MissingFor(Row.Id);
            if (missing.Count > 0) TurnOff("missing " + string.Join(", ", missing));
            return OffReason;
        }

        public void TurnOff(string why)
        {
            if (!Enabled) return;
            Enabled = false;
            OffReason = why;
            Mod.Log.Warning($"{Row.Id} off: {why}");
            Mod.Hud?.Toast(HudIds.system_off, ("system", Row.Id), ("why", why));
        }

        public void Update(float dt)
        {
            if (!Enabled) return;
            if (Row.TickHz <= 0) return;
            _accum += dt;
            float step = 1f / Row.TickHz;
            if (_accum < step) return;
            float elapsed = _accum;
            _accum = 0;
            try { Tick(elapsed); _failures = 0; }
            catch (Exception e)
            {
                Mod.Log.Error($"{Row.Id}: {e}");
                if (++_failures >= 5) TurnOff(e.GetType().Name + " (see MelonLoader log)");
            }
        }

        public void LevelStarted()
        {
            if (!Enabled) return;
            try { OnLevel(); } catch (Exception e) { Mod.Log.Error($"{Row.Id} level start: {e}"); }
        }

        protected abstract void Tick(float dt);
        protected virtual void OnLevel() { }
    }
}
