using System;
using BeastLab.Game;
using BeastLab.Generated;
using V3 = System.Numerics.Vector3;

namespace BeastLab.Systems
{
    /// <summary>Finds the BONELAB player (RigManager -> physicsRig -> m_head, as BoneLib does) and its health.</summary>
    public sealed class PlayerSystem : BeastSystem
    {
        object? _rig, _head, _health;
        public bool InLevel => Bridge.Alive(_head);
        public V3 Head => Bridge.Position(_head);
        public V3 Forward
        {
            get
            {
                var f = Bridge.ToV3(Bridge.Get(_head, HookIds.transform_forward));
                f.Y = 0;
                return f.LengthSquared() < 1e-4f ? V3.UnitZ : V3.Normalize(f);
            }
        }
        /// <summary>Rough floor height under the player (the head is ~1.6 m up).</summary>
        public float FloorY => Head.Y - 1.6f;

        public event Action? NewLevel;

        public PlayerSystem() : base(SystemIds.player) { }

        protected override void Tick(float dt)
        {
            if (Bridge.Alive(_head)) return;
            _rig = Bridge.FindObjectOfType(HookIds.rig_manager);
            if (!Bridge.Alive(_rig)) { _head = null; return; }
            var physicsRig = Bridge.Get(_rig, HookIds.rig_physics_rig);
            _head = Bridge.Get(physicsRig, HookIds.physics_rig_head);
            _health = null;
            if (Bridge.Alive(_head))
            {
                Mod.Log.Msg("Player rig found; starting BeastLab in this level");
                NewLevel?.Invoke();
            }
        }

        /// <summary>(current, max) health, or null when Player_Health can't be read.</summary>
        public (float cur, float max)? Health()
        {
            if (!Bridge.Has(HookIds.player_health) || !Bridge.Has(HookIds.player_health_cur) || !Bridge.Has(HookIds.player_health_max)) return null;
            if (!Bridge.Alive(_health)) _health = Bridge.FindObjectOfType(HookIds.player_health);
            if (!Bridge.Alive(_health)) return null;
            return (Convert.ToSingle(Bridge.Get(_health, HookIds.player_health_cur)), Convert.ToSingle(Bridge.Get(_health, HookIds.player_health_max)));
        }

        public void SetHealth(float value)
        {
            if (Bridge.Alive(_health)) Bridge.Set(_health, HookIds.player_health_cur, value);
        }

        /// <summary>A random point on a ring around the player, dropped to the ground.</summary>
        public V3 RingPoint(Random rng, float min, float max)
        {
            double a = rng.NextDouble() * Math.PI * 2;
            float d = min + (float)rng.NextDouble() * (max - min);
            var spot = Head + new V3((float)Math.Cos(a) * d, 0, (float)Math.Sin(a) * d);
            spot.Y = FloorY;
            return Bridge.Ground(spot, FloorY);
        }
    }
}
