using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Reflection;
using System.Text;
using BeastLab.Generated;
using V3 = System.Numerics.Vector3;

namespace BeastLab.Game
{
    /// <summary>One resolved row of sheets/hooks.json.</summary>
    public sealed class Hook
    {
        public HookRow Row = null!;
        public Type? Type;
        public PropertyInfo? Property;
        public FieldInfo? Field;
        public MethodInfo[] Methods = Array.Empty<MethodInfo>();
        public ConstructorInfo[] Ctors = Array.Empty<ConstructorInfo>();
        public bool Ok;
        public string Detail = "";
    }

    /// <summary>
    /// Reaches BONELAB and Unity through reflection over MelonLoader's Il2Cpp proxy assemblies, using the
    /// names in sheets/hooks.json. A missing name switches off only the system that needs it, and the
    /// hook report says exactly which one.
    /// </summary>
    public static class Bridge
    {
        const BindingFlags All = BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.Static;
        static readonly Dictionary<string, Hook> Hooks = new();

        public static string ResolveAll()
        {
            var sb = new StringBuilder();
            foreach (var row in Sheets.Hooks)
            {
                var h = Resolve(row);
                Hooks[row.Id] = h;
                sb.AppendLine($"{(h.Ok ? "OK  " : row.Required ? "MISS" : "miss")} {row.Id,-22} {row.Type}.{row.Member}  {h.Detail}");
            }
            return sb.ToString();
        }

        static Type? FindType(string assembly, string fullName)
        {
            foreach (var a in AppDomain.CurrentDomain.GetAssemblies())
                if (a.GetName().Name == assembly) { var t = a.GetType(fullName); if (t != null) return t; }
            try
            {
                var t = Assembly.Load(new AssemblyName(assembly)).GetType(fullName);
                if (t != null) return t;
            }
            catch { }
            foreach (var a in AppDomain.CurrentDomain.GetAssemblies())
            {
                Type? t = null;
                try { t = a.GetType(fullName); } catch { }
                if (t != null) return t;
            }
            return null;
        }

        static Hook Resolve(HookRow row)
        {
            var h = new Hook { Row = row };
            try
            {
                h.Type = FindType(row.Assembly, row.Type);
                if (h.Type == null) { h.Detail = "type not found"; return h; }
                h.Detail = "in " + h.Type.Assembly.GetName().Name;
                switch (row.Kind)
                {
                    case "type":
                        h.Ok = true; break;
                    case "ctor":
                        h.Ctors = h.Type.GetConstructors();
                        h.Ok = h.Ctors.Length > 0; break;
                    case "property":
                    case "static_property":
                        h.Property = h.Type.GetProperty(row.Member, All);
                        if (h.Property == null) h.Field = h.Type.GetField(row.Member, All);
                        h.Ok = h.Property != null || h.Field != null;
                        if (!h.Ok) h.Detail = "member not found on " + h.Type.FullName;
                        break;
                    case "method":
                    case "static_method":
                        h.Methods = h.Type.GetMethods(All).Where(m => m.Name == row.Member).ToArray();
                        h.Ok = h.Methods.Length > 0;
                        if (!h.Ok) h.Detail = "method not found on " + h.Type.FullName;
                        else h.Detail += $" ({h.Methods.Length} overloads)";
                        break;
                }
            }
            catch (Exception e) { h.Detail = e.GetType().Name + ": " + e.Message; }
            return h;
        }

        public static bool Has(string id) => Hooks.TryGetValue(id, out var h) && h.Ok;
        public static Hook H(string id) => Hooks.TryGetValue(id, out var h) && h.Ok ? h : throw new MissingMemberException("BeastLab hook " + id);
        public static Type T(string id) => H(id).Type!;

        /// <summary>Required hooks a system lacks.</summary>
        public static List<string> MissingFor(string systemId) =>
            Sheets.Hooks.Where(r => r.UsedBy == systemId && r.Required && !Has(r.Id)).Select(r => r.Id).ToList();

        // ---------- members ----------
        public static object? Get(object? target, string id)
        {
            var h = H(id);
            if (h.Property != null) return h.Property.GetValue(h.Property.GetMethod!.IsStatic ? null : target);
            return h.Field!.GetValue(h.Field.IsStatic ? null : target);
        }

        public static void Set(object? target, string id, object? value)
        {
            var h = H(id);
            if (h.Property != null) h.Property.SetValue(h.Property.SetMethod!.IsStatic ? null : target, value);
            else h.Field!.SetValue(h.Field.IsStatic ? null : target, value);
        }

        public static object? Call(object? target, string id, params object?[] args)
        {
            var h = H(id);
            var m = h.Methods.FirstOrDefault(x => !x.IsGenericMethodDefinition && Fits(x.GetParameters(), args))
                    ?? throw new MissingMethodException($"{h.Row.Type}.{h.Row.Member} with {args.Length} args");
            return m.Invoke(m.IsStatic ? null : target, args);
        }

        public static object? CallGeneric(object? target, string id, Type typeArg, params object?[] args)
        {
            var h = H(id);
            var m = h.Methods.FirstOrDefault(x => x.IsGenericMethodDefinition && x.GetGenericArguments().Length == 1 && x.GetParameters().Length == args.Length)
                    ?? throw new MissingMethodException($"{h.Row.Type}.{h.Row.Member}<T> with {args.Length} args");
            var g = m.MakeGenericMethod(typeArg);
            return g.Invoke(g.IsStatic ? null : target, args);
        }

        static bool Fits(ParameterInfo[] ps, object?[] args)
        {
            if (ps.Length != args.Length) return false;
            for (int i = 0; i < ps.Length; i++)
            {
                var pt = ps[i].ParameterType.IsByRef ? ps[i].ParameterType.GetElementType()! : ps[i].ParameterType;
                if (args[i] == null) { if (pt.IsValueType) return false; continue; }
                if (!pt.IsInstanceOfType(args[i])) return false;
            }
            return true;
        }

        public static object? Member(object? target, string name)
        {
            if (target == null) return null;
            var t = target.GetType();
            var p = t.GetProperty(name, All);
            if (p != null) return p.GetValue(target);
            return t.GetField(name, All)?.GetValue(target);
        }

        /// <summary>Set a member by name, converting numbers to its type. Returns false if there is no such member.</summary>
        public static bool SetMember(object? target, string name, float value)
        {
            if (target == null) return false;
            var t = target.GetType();
            var p = t.GetProperty(name, All);
            var type = p?.PropertyType ?? t.GetField(name, All)?.FieldType;
            if (type == null || !(type == typeof(float) || type == typeof(int) || type == typeof(double))) return false;
            object v = Convert.ChangeType(type == typeof(int) ? Math.Round(value) : value, type, CultureInfo.InvariantCulture);
            if (p != null) p.SetValue(target, v); else t.GetField(name, All)!.SetValue(target, v);
            return true;
        }

        // ---------- Unity values ----------
        public static object Vec(V3 v) => Activator.CreateInstance(T(HookIds.vector3), v.X, v.Y, v.Z)!;

        public static V3 ToV3(object? unityVec)
        {
            if (unityVec == null) return V3.Zero;
            float F(string n) => Convert.ToSingle(Member(unityVec, n), CultureInfo.InvariantCulture);
            return new V3(F("x"), F("y"), F("z"));
        }

        public static object Color(string hex, float alpha = 1f)
        {
            int rgb = int.Parse(hex.TrimStart('#'), NumberStyles.HexNumber);
            return Activator.CreateInstance(T(HookIds.color), ((rgb >> 16) & 255) / 255f, ((rgb >> 8) & 255) / 255f, (rgb & 255) / 255f, alpha)!;
        }

        public static object Color(float r, float g, float b) => Activator.CreateInstance(T(HookIds.color), r, g, b, 1f)!;

        public static object Look(V3 dir) => Call(null, HookIds.quat_look, Vec(dir == V3.Zero ? V3.UnitZ : dir))!;

        /// <summary>True when a Unity object reference is set and not destroyed.</summary>
        public static bool Alive(object? obj)
        {
            if (obj == null) return false;
            try { return (bool)Call(null, HookIds.object_alive, obj)!; }
            catch { return false; }
        }

        public static object? FindObjectOfType(string typeHook)
        {
            var h = H(HookIds.find_of_type);
            var m = h.Methods.FirstOrDefault(x => x.IsGenericMethodDefinition && x.GetParameters().Length == 0);
            if (m == null) throw new MissingMethodException("Object.FindObjectOfType<T>()");
            return m.MakeGenericMethod(T(typeHook)).Invoke(null, null);
        }

        // ---------- objects ----------
        public static object NewGameObject(string name) => Activator.CreateInstance(T(HookIds.go_ctor), name)!;
        public static object? Transform(object go) => Get(go, HookIds.go_transform);
        public static object? GameObjectOf(object component) => Get(component, HookIds.component_go);
        public static V3 Position(object? transform) => transform == null ? V3.Zero : ToV3(Get(transform, HookIds.transform_position));
        public static void SetPose(object transform, V3 pos, object rotation)
        {
            Set(transform, HookIds.transform_position, Vec(pos));
            Set(transform, HookIds.transform_rotation, rotation);
        }

        public static void Destroy(object? obj)
        {
            if (!Alive(obj)) return;
            try { Call(null, HookIds.object_destroy, obj); } catch { }
        }

        /// <summary>Ground point under (or near) a spot: raycast down from 3 m above; falls back to the given height.</summary>
        public static V3 Ground(V3 spot, float fallbackY)
        {
            if (Has(HookIds.physics_raycast) && Has(HookIds.raycast_hit))
            {
                try
                {
                    var h = H(HookIds.physics_raycast);
                    var m = h.Methods.FirstOrDefault(x =>
                    {
                        var ps = x.GetParameters();
                        return ps.Length == 4 && ps[2].ParameterType.IsByRef && ps[3].ParameterType == typeof(float);
                    });
                    if (m != null)
                    {
                        var args = new object?[] { Vec(spot + new V3(0, 3, 0)), Vec(new V3(0, -1, 0)), null, 12f };
                        if ((bool)m.Invoke(null, args)!)
                            return ToV3(Get(args[2], HookIds.raycast_hit)) + new V3(0, 0.05f, 0);
                    }
                }
                catch { }
            }
            return new V3(spot.X, fallbackY, spot.Z);
        }

        // ---------- spawning BONELAB crates ----------
        sealed class Cb<TArg>
        {
            public Action<object?> F = _ => { };
            public void Invoke(TArg a) => F(a);
        }

        static object? Il2CppAction(Type il2cppAction, Action<object?> f)
        {
            var arg = il2cppAction.GetGenericArguments().FirstOrDefault();
            if (arg == null) return null;
            var cbType = typeof(Cb<>).MakeGenericType(arg);
            var inst = Activator.CreateInstance(cbType)!;
            cbType.GetField("F")!.SetValue(inst, f);
            var sys = Delegate.CreateDelegate(typeof(Action<>).MakeGenericType(arg), inst, cbType.GetMethod("Invoke")!);
            var implicitOp = il2cppAction.GetMethods(BindingFlags.Public | BindingFlags.Static)
                .FirstOrDefault(m => m.Name == "op_Implicit" && m.ReturnType == il2cppAction && m.GetParameters()[0].ParameterType.IsInstanceOfType(sys));
            if (implicitOp != null) return implicitOp.Invoke(null, new object[] { sys });
            if (Has(HookIds.delegate_support))
            {
                var conv = H(HookIds.delegate_support).Methods.FirstOrDefault(m => m.IsGenericMethodDefinition && m.GetParameters().Length == 1);
                if (conv != null) return conv.MakeGenericMethod(il2cppAction).Invoke(null, new object[] { sys });
            }
            return null;
        }

        /// <summary>
        /// Spawns a BONELAB crate by barcode the way BoneLib's HelperMethods.SpawnCrate does:
        /// AssetSpawner.Register(new Spawnable { crateRef }) then AssetSpawner.Spawn(...). Arguments are
        /// built from the real method's parameter list, so small signature changes between game patches still work.
        /// </summary>
        public static void Spawn(string barcode, V3 pos, V3 facing, Action<object?> onSpawned)
        {
            var crateRef = Activator.CreateInstance(T(HookIds.crate_ref), barcode)!;
            var spawnable = Activator.CreateInstance(T(HookIds.spawnable))!;
            Set(spawnable, HookIds.spawnable, crateRef);
            Call(null, HookIds.spawner_register, spawnable);

            var spawn = H(HookIds.spawner_spawn).Methods.OrderByDescending(m => m.GetParameters().Length).First();
            var ps = spawn.GetParameters();
            var args = new object?[ps.Length];
            bool firstAction = true, firstNullable = true;
            var nullableDef = T(HookIds.il2cpp_nullable);
            for (int i = 0; i < ps.Length; i++)
            {
                var pt = ps[i].ParameterType;
                if (pt.IsInstanceOfType(spawnable)) args[i] = spawnable;
                else if (pt == T(HookIds.vector3)) args[i] = Vec(pos);
                else if (pt == T(HookIds.quaternion)) args[i] = Look(facing);
                else if (pt == typeof(bool)) args[i] = true; // ignore spawn policy
                else if (pt.IsGenericType && pt.GetGenericTypeDefinition() == nullableDef)
                {
                    var inner = pt.GetGenericArguments()[0];
                    args[i] = firstNullable && inner == T(HookIds.vector3)
                        ? Activator.CreateInstance(pt, Vec(V3.One))
                        : Activator.CreateInstance(pt);
                    firstNullable = false;
                }
                else if (pt.IsGenericType && pt.Name.StartsWith("Action`", StringComparison.Ordinal))
                {
                    args[i] = firstAction ? Il2CppAction(pt, onSpawned) : null;
                    firstAction = false;
                }
                else args[i] = pt.IsValueType ? Activator.CreateInstance(pt) : null;
            }
            spawn.Invoke(null, args);
        }

        public static object? ComponentInChildren(object go, string typeHook)
        {
            try { return CallGeneric(go, HookIds.go_get_in_children, T(typeHook)); }
            catch { return null; }
        }
    }
}
