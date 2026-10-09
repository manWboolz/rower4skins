using System;
using System.Linq;
using BeastLab.Game;
using BeastLab.Generated;

namespace BeastLab.Systems
{
    /// <summary>Dawn -> day -> dusk -> night on The Beast's day/night lengths. Night thickens the fog and darkens ambient light.</summary>
    public sealed class DayNightSystem : BeastSystem
    {
        readonly PlayerSystem _player;
        readonly HudSystem _hud;
        readonly DltbReaderSystem _dltb;
        int _phase = -1;
        float _left;
        public int Day { get; private set; }
        public PhaseRow Phase => Sheets.Daynight[Math.Max(_phase, 0)];
        public event Action<PhaseRow>? PhaseStarted;

        object? _origFog, _origFogColor, _origDensity, _origAmbient;
        bool _saved;

        public DayNightSystem(PlayerSystem player, HudSystem hud, DltbReaderSystem dltb) : base(SystemIds.daynight)
        { _player = player; _hud = hud; _dltb = dltb; }

        float Length(PhaseRow p)
        {
            var col = Sheets.ColumnsDltb.First(c => c.Id == (p.LengthOf == "day" ? DltbColumnIds.daynight_day_seconds : DltbColumnIds.daynight_night_seconds));
            float total = col.Fallback;
            if (_dltb.Ready) total = p.LengthOf == "day" ? _dltb.Catalog!.DaySeconds : _dltb.Catalog!.NightSeconds;
            return Math.Max(10f, total * p.Share);
        }

        protected override void OnLevel()
        {
            _saved = false;
            Day = 0;
            _phase = -1;
            _left = 0;
        }

        void SaveLighting()
        {
            if (_saved) return;
            _origFog = Bridge.Get(null, HookIds.render_fog);
            _origFogColor = Bridge.Get(null, HookIds.render_fog_color);
            _origDensity = Bridge.Get(null, HookIds.render_fog_density);
            if (Bridge.Has(HookIds.render_ambient)) _origAmbient = Bridge.Get(null, HookIds.render_ambient);
            _saved = true;
        }

        public void RestoreLighting()
        {
            if (!_saved) return;
            try
            {
                Bridge.Set(null, HookIds.render_fog, _origFog);
                Bridge.Set(null, HookIds.render_fog_color, _origFogColor);
                Bridge.Set(null, HookIds.render_fog_density, _origDensity);
                if (_origAmbient != null) Bridge.Set(null, HookIds.render_ambient, _origAmbient);
            }
            catch { }
        }

        void Apply(PhaseRow p)
        {
            SaveLighting();
            Bridge.Set(null, HookIds.render_fog, true);
            if (Bridge.Has(HookIds.render_fog_mode))
                Bridge.Set(null, HookIds.render_fog_mode, Enum.ToObject(Bridge.H(HookIds.render_fog_mode).Property!.PropertyType, 2)); // Exponential
            Bridge.Set(null, HookIds.render_fog_color, Bridge.Color(p.FogColor));
            Bridge.Set(null, HookIds.render_fog_density, p.FogDensity);
            if (_origAmbient != null)
            {
                float F(string n) => Convert.ToSingle(Bridge.Member(_origAmbient, n));
                Bridge.Set(null, HookIds.render_ambient, Bridge.Color(F("r") * p.AmbientScale, F("g") * p.AmbientScale, F("b") * p.AmbientScale));
            }
        }

        protected override void Tick(float dt)
        {
            if (!_player.InLevel) return;
            _left -= dt;
            if (_phase < 0 || _left <= 0)
            {
                _phase = (_phase + 1) % Sheets.Daynight.Length;
                var p = Sheets.Daynight[_phase];
                if (p.Id == DaynightIds.dawn) Day++;
                _left = Length(p);
                Apply(p);
                _hud.Toast(p.Banner, ("day", Day));
                PhaseStarted?.Invoke(p);
            }
            var left = TimeSpan.FromSeconds(Math.Max(0, _left));
            _hud.Line(HudIds.clock, ("day", Day), ("phase", Phase.Display), ("left", $"{(int)left.TotalMinutes}:{left.Seconds:00}"));
        }
    }
}
