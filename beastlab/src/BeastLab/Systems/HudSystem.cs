using System;
using System.Collections.Generic;
using System.Linq;
using BeastLab.Game;
using BeastLab.Generated;
using V3 = System.Numerics.Vector3;

namespace BeastLab.Systems
{
    /// <summary>A floating text in the world (loot caches, workbench, weapon and infected names).</summary>
    public sealed class Label
    {
        internal object? Go, Tm;
        public V3 Pos;
        public object? Follow;      // a Transform to float above
        public float FollowHeight = 0.6f;
        public bool Gone => !Bridge.Alive(Go);
    }

    /// <summary>Text in front of the player's eyes (sheet hud.json) plus world labels. Built from Unity's TextMesh.</summary>
    public sealed class HudSystem : BeastSystem
    {
        readonly PlayerSystem _player;
        object? _font;
        Label? _hud;
        readonly List<(HudRow row, string text, float until)> _toasts = new();
        readonly Dictionary<string, (HudRow row, string text)> _lines = new();
        readonly List<Label> _labels = new();
        float _time;

        public HudSystem(PlayerSystem player) : base(SystemIds.hud) { _player = player; }

        public static string Fill(HudRow row, params (string key, object value)[] values)
        {
            var s = row.Text;
            foreach (var (k, v) in values) s = s.Replace("{" + k + "}", Convert.ToString(v, System.Globalization.CultureInfo.InvariantCulture));
            return s;
        }

        static HudRow RowOf(string id) => Sheets.Hud.First(h => h.Id == id);

        public void Toast(string id, params (string key, object value)[] values)
        {
            var row = RowOf(id);
            _toasts.Add((row, Fill(row, values), _time + row.Seconds));
            Mod.Log.Msg("[hud] " + Fill(row, values));
            if (_toasts.Count > 4) _toasts.RemoveAt(0);
        }

        public void Line(string id, params (string key, object value)[] values) { var row = RowOf(id); _lines[id] = (row, Fill(row, values)); }
        public void ClearLine(string id) => _lines.Remove(id);

        object? Font()
        {
            if (_font != null || !Bridge.Has(HookIds.resources_builtin) || !Bridge.Has(HookIds.font)) return _font;
            foreach (var name in new[] { "Arial.ttf", "LegacyRuntime.ttf" })
            {
                try { _font = Bridge.CallGeneric(null, HookIds.resources_builtin, Bridge.T(HookIds.font), name); } catch { }
                if (Bridge.Alive(_font)) break;
            }
            return _font;
        }

        Label Make(string text, string color, float size)
        {
            var l = new Label();
            l.Go = Bridge.NewGameObject("BeastLab_Text");
            l.Tm = Bridge.CallGeneric(l.Go, HookIds.go_add_component, Bridge.T(HookIds.text_mesh));
            Bridge.Set(l.Tm, HookIds.textmesh_font_size, 64);
            Bridge.Set(l.Tm, HookIds.textmesh_char_size, size);
            Bridge.Set(l.Tm, HookIds.textmesh_anchor, Enum.ToObject(Bridge.T(HookIds.text_anchor), 4)); // MiddleCenter
            var font = Font();
            if (font != null && Bridge.Has(HookIds.textmesh_font))
            {
                Bridge.Set(l.Tm, HookIds.textmesh_font, font);
                if (Bridge.Has(HookIds.mesh_renderer) && Bridge.Has(HookIds.renderer_material) && Bridge.Has(HookIds.font_material))
                {
                    var mr = Bridge.ComponentInChildren(l.Go, HookIds.mesh_renderer);
                    if (mr != null) Bridge.Set(mr, HookIds.renderer_material, Bridge.Get(font, HookIds.font_material));
                }
            }
            SetText(l, text, color);
            return l;
        }

        public void SetText(Label l, string text, string color)
        {
            if (l.Gone) return;
            Bridge.Set(l.Tm, HookIds.textmesh_text, text);
            Bridge.Set(l.Tm, HookIds.textmesh_color, Bridge.Color(color));
        }

        public Label AddLabel(string text, string color, V3 pos, object? follow = null)
        {
            var l = Make(text, color, 0.012f);
            l.Pos = pos; l.Follow = follow;
            _labels.Add(l);
            return l;
        }

        public void Remove(Label? l)
        {
            if (l == null) return;
            _labels.Remove(l);
            Bridge.Destroy(l.Go);
        }

        protected override void OnLevel()
        {
            foreach (var l in _labels) Bridge.Destroy(l.Go);
            _labels.Clear();
            if (_hud != null) Bridge.Destroy(_hud.Go);
            _hud = null;
        }

        protected override void Tick(float dt)
        {
            _time += dt;
            if (!_player.InLevel) return;
            if (_hud == null || _hud.Gone) _hud = Make("", "#ffffff", 0.0035f);

            var head = _player.Head;
            var fwd = _player.Forward;
            _toasts.RemoveAll(t => t.row.Seconds > 0 && t.until < _time);
            var lines = _toasts.Select(t => (t.row.Color, t.text)).Concat(_lines.Values.Select(l => (l.row.Color, l.text)));
            // TextMesh supports <color> rich text, so every line keeps its sheet colour.
            var text = string.Join("\n", lines.Select(l => $"<color={l.Color}>{l.text}</color>"));
            Bridge.Set(_hud.Tm, HookIds.textmesh_text, text);
            var pos = head + fwd * 1.1f + new V3(0, -0.28f, 0);
            Bridge.SetPose(Bridge.Transform(_hud.Go!)!, pos, Bridge.Look(fwd));

            _labels.RemoveAll(l => l.Gone);
            foreach (var l in _labels)
            {
                var p = l.Pos;
                if (l.Follow != null)
                {
                    if (!Bridge.Alive(l.Follow)) continue;
                    p = Bridge.Position(l.Follow) + new V3(0, l.FollowHeight, 0);
                    l.Pos = p;
                }
                var dir = p - head; dir.Y = 0;
                Bridge.SetPose(Bridge.Transform(l.Go!)!, p, Bridge.Look(dir));
            }
        }
    }
}
