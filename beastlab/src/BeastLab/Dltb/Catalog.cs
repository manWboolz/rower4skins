using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using BeastLab.Generated;

namespace BeastLab.Dltb
{
    /// <summary>One thing read from The Beast: a weapon, consumable, ammo, craft part or infected type.</summary>
    public sealed class BeastThing
    {
        public string Id = "";
        public string Category = "";
        public string Source = "";          // dltb_sources id
        public string File = "";
        public Dictionary<string, string> Params = new(StringComparer.OrdinalIgnoreCase);
        public Dictionary<string, float> Values = new();   // columns_dltb property -> value actually read
        public HashSet<string> Defaulted = new();            // properties that took the sheet fallback
        public string Rarity = RarityIds.common;
        public string Display => Pretty(Id);

        public float Get(string property, float otherwise = -1) => Values.TryGetValue(property, out var v) ? v : otherwise;

        public static string Pretty(string id)
        {
            var s = Regex.Replace(id, @"^(wpn|item|inv|craftpart|craft|ammo|med|npc|ai)_", "", RegexOptions.IgnoreCase);
            s = Regex.Replace(s, @"_(bp|lvl\d+|v\d+|[a-z]?\d+)$", "", RegexOptions.IgnoreCase);
            s = s.Replace('_', ' ').Trim();
            s = Regex.Replace(s, "([a-z])([A-Z])", "$1 $2");
            return CultureInfo.InvariantCulture.TextInfo.ToTitleCase(s.ToLowerInvariant());
        }
    }

    public sealed class BeastRecipe
    {
        public string Id = "";
        public string Result = "";
        public int ResultCount = 1;
        public List<(string item, int count)> Ingredients = new();
        public string File = "";
        public string Display => BeastThing.Pretty(Result);
    }

    /// <summary>Everything the mashup reads from the player's copy of Dying Light: The Beast.</summary>
    public sealed class Catalog
    {
        public readonly Dictionary<string, List<BeastThing>> Things = new();
        public readonly List<BeastRecipe> Recipes = new();
        public readonly Dictionary<string, BeastThing> InfectedByRow = new(); // infected sheet id -> merged Beast stats
        public float DaySeconds, NightSeconds;
        public bool DayFromGame, NightFromGame;
        public readonly List<string> Notes = new();
        public int ScriptsRead;

        public List<BeastThing> Of(string source) => Things.TryGetValue(source, out var l) ? l : new List<BeastThing>();
        public BeastThing? Find(string id) => Things.Values.SelectMany(x => x).FirstOrDefault(t => t.Id.Equals(id, StringComparison.OrdinalIgnoreCase));

        static Regex Rx(string p) => new(p, RegexOptions.IgnoreCase | RegexOptions.CultureInvariant);

        public static Catalog Build(PakSource pak) => Build(pak.Read(Rx(@"\.scr$")).ToList());

        /// <summary>Build from (path, script text) pairs; used for the real pak and for tests.</summary>
        public static Catalog Build(List<(string path, string text)> scripts)
        {
            var cat = new Catalog { ScriptsRead = scripts.Count };
            var parsed = new Dictionary<string, List<ScrCall>>();
            List<ScrCall> Tree(string path, string text)
            {
                if (!parsed.TryGetValue(path, out var t)) parsed[path] = t = ScrParser.Parse(text, path);
                return t;
            }

            var itemSources = new[] { DltbSourceIds.weapons, DltbSourceIds.consumables, DltbSourceIds.ammo, DltbSourceIds.craftparts };
            var claimed = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            foreach (var srcId in itemSources)
            {
                var src = Sheets.DltbSources.First(s => s.Id == srcId);
                var path = Rx(src.PathRegex); var block = Rx(src.BlockRegex); var inc = Rx(src.IncludeRegex); var exc = Rx(src.ExcludeRegex);
                var list = new List<BeastThing>();
                foreach (var (p, text) in scripts.Where(s => path.IsMatch(s.path)))
                    foreach (var call in ScrParser.Walk(Tree(p, text)))
                    {
                        if (!call.HasBody || !block.IsMatch(call.Name)) continue;
                        var id = call.Arg(0);
                        var key = id + " " + call.Arg(1);
                        if (id == "" || !inc.IsMatch(key) || exc.IsMatch(key) || claimed.Contains(id)) continue;
                        claimed.Add(id);
                        var thing = new BeastThing { Id = id, Category = call.Arg(1), Source = srcId, File = p };
                        ReadParams(call, thing.Params);
                        list.Add(thing);
                    }
                foreach (var t in list) ApplyColumns(t);
                cat.Things[srcId] = list;
            }

            ReadRecipes(cat, scripts, Tree);
            ReadInfected(cat, scripts, Tree);
            ReadDayNight(cat, scripts);
            return cat;
        }

        static void ReadParams(ScrCall call, Dictionary<string, string> into)
        {
            foreach (var c in call.Children)
            {
                if (c.Name.Equals("Param", StringComparison.OrdinalIgnoreCase) && c.Args.Count >= 2)
                    into[c.Arg(0)] = c.Arg(1);
                else if (c.Args.Count == 1 && !c.HasBody && !into.ContainsKey(c.Name))
                    into[c.Name] = c.Arg(0);
            }
        }

        static bool TryNum(string s, out float v)
        {
            var m = Regex.Match(s ?? "", @"-?\d+(\.\d+)?");
            v = m.Success ? float.Parse(m.Value, CultureInfo.InvariantCulture) : 0;
            return m.Success;
        }

        static readonly string[] RarityColumns =
        {
            DltbColumnIds.weapons_rarity, DltbColumnIds.consumables_rarity, DltbColumnIds.ammo_rarity, DltbColumnIds.craftparts_rarity,
        };

        /// <summary>Fill Values from Params using columns_dltb (first matching key wins).</summary>
        static void ApplyColumns(BeastThing t)
        {
            foreach (var col in Sheets.ColumnsDltb.Where(c => c.Source == t.Source))
            {
                string? raw = null;
                foreach (var k in col.Keys)
                    if (t.Params.TryGetValue(k, out var r)) { raw = r; break; }
                if (RarityColumns.Contains(col.Id))
                {
                    t.Rarity = RarityOf(raw ?? t.Id);
                    continue;
                }
                if (raw != null && TryNum(raw, out var v)) t.Values[col.Property] = v;
                else if (col.Fallback >= 0) { t.Values[col.Property] = col.Fallback; t.Defaulted.Add(col.Property); }
            }
        }

        public static string RarityOf(string text)
        {
            for (int i = Sheets.Rarity.Length - 1; i >= 0; i--)
                if (Rx(Sheets.Rarity[i].Match).IsMatch(text ?? "")) return Sheets.Rarity[i].Id;
            return RarityIds.common;
        }

        static readonly Regex IngredientCall = Rx("ingredient|component|cost|require|part|resource|material|input");
        static readonly Regex ResultCall = Rx("^(result|output|product|reward|item|craftitem|resultitem)$");

        static void ReadRecipes(Catalog cat, List<(string path, string text)> scripts, Func<string, string, List<ScrCall>> tree)
        {
            var src = Sheets.DltbSources.First(s => s.Id == DltbSourceIds.recipes);
            var path = Rx(src.PathRegex); var block = Rx(src.BlockRegex); var exc = Rx(src.ExcludeRegex);
            var known = new HashSet<string>(cat.Things.Values.SelectMany(x => x).Select(x => x.Id), StringComparer.OrdinalIgnoreCase);
            foreach (var (p, text) in scripts.Where(s => path.IsMatch(s.path)))
                foreach (var call in ScrParser.Walk(tree(p, text)))
                {
                    if (!call.HasBody || !block.IsMatch(call.Name) || exc.IsMatch(call.Arg(0))) continue;
                    var r = new BeastRecipe { Id = call.Arg(0), File = p };
                    foreach (var c in call.Children)
                    {
                        string item = c.Arg(0), countText = c.Arg(1);
                        if (c.Name.Equals("Param", StringComparison.OrdinalIgnoreCase) && c.Args.Count >= 2)
                        {
                            // Param("Result", "Medkit") / Param("Ingredient", "Rags") styles
                            if (ResultCall.IsMatch(c.Arg(0))) { r.Result = c.Arg(1); TryCount(c.Arg(2), ref r.ResultCount); }
                            else if (IngredientCall.IsMatch(c.Arg(0))) { int n = 1; TryCount(c.Arg(2), ref n); r.Ingredients.Add((c.Arg(1), n)); }
                            continue;
                        }
                        if (item == "") continue;
                        if (ResultCall.IsMatch(c.Name)) { r.Result = item; TryCount(countText, ref r.ResultCount); }
                        else if (IngredientCall.IsMatch(c.Name)) { int n = 1; TryCount(countText, ref n); r.Ingredients.Add((item, n)); }
                    }
                    if (r.Result == "" && known.Contains(Regex.Replace(r.Id, "(_bp|_blueprint|_recipe)$", "", RegexOptions.IgnoreCase)))
                        r.Result = Regex.Replace(r.Id, "(_bp|_blueprint|_recipe)$", "", RegexOptions.IgnoreCase);
                    // Only keep recipes the mashup can actually make: known result, known ingredients.
                    if (r.Result == "" || r.Ingredients.Count == 0 || !known.Contains(r.Result) || r.Ingredients.Any(i => !known.Contains(i.item)))
                        continue;
                    if (cat.Recipes.Any(x => x.Result.Equals(r.Result, StringComparison.OrdinalIgnoreCase) && x.Ingredients.Count == r.Ingredients.Count)) continue;
                    cat.Recipes.Add(r);
                }
        }

        static void TryCount(string s, ref int n)
        {
            if (TryNum(s, out var v) && v >= 1 && v < 1000) n = (int)v;
        }

        static void ReadInfected(Catalog cat, List<(string path, string text)> scripts, Func<string, string, List<ScrCall>> tree)
        {
            var src = Sheets.DltbSources.First(s => s.Id == DltbSourceIds.infected);
            var path = Rx(src.PathRegex); var block = Rx(src.BlockRegex); var inc = Rx(src.IncludeRegex); var exc = Rx(src.ExcludeRegex);
            var found = new List<BeastThing>();
            foreach (var (p, text) in scripts.Where(s => path.IsMatch(s.path)))
                foreach (var call in ScrParser.Walk(tree(p, text)))
                {
                    if (!call.HasBody || !block.IsMatch(call.Name)) continue;
                    var id = call.Arg(0) != "" ? call.Arg(0) : call.Name;
                    if (!inc.IsMatch(id) || exc.IsMatch(id)) continue;
                    var t = new BeastThing { Id = id, Category = call.Name, Source = DltbSourceIds.infected, File = p };
                    ReadParams(call, t.Params);
                    ApplyColumns(t);
                    found.Add(t);
                }
            cat.Things[DltbSourceIds.infected] = found;
            foreach (var row in Sheets.Infected)
            {
                var m = Rx(row.DltbMatch);
                var matches = found.Where(f => m.IsMatch(f.Id)).ToList();
                if (matches.Count == 0) { cat.Notes.Add($"infected {row.Display}: no block found; BONELAB's own stats kept"); continue; }
                // Prefer the block with the most stats read (the archetype preset rather than a variant).
                var best = matches.OrderByDescending(f => f.Values.Count).ThenBy(f => f.Id.Length).First();
                cat.InfectedByRow[row.Id] = best;
            }
        }

        static void ReadDayNight(Catalog cat, List<(string path, string text)> scripts)
        {
            float? Find(string column)
            {
                var col = Sheets.ColumnsDltb.First(c => c.Id == column);
                foreach (var key in col.Keys)
                {
                    var rx = Rx($@"(?:Param\s*\(\s*""{key}""\s*,\s*""?|\b{key}\s*(?:\(\s*""?|=\s*))(-?\d+(?:\.\d+)?)");
                    foreach (var (p, text) in scripts)
                    {
                        var m = rx.Match(text);
                        if (!m.Success) continue;
                        var v = float.Parse(m.Groups[1].Value, CultureInfo.InvariantCulture);
                        if (v <= 0) continue;
                        if (v < 60) v *= 60;               // minutes
                        v = Math.Clamp(v, 120, 3600);
                        cat.Notes.Add($"{column}: {key}={m.Groups[1].Value} in {p} -> {v:0}s");
                        return v;
                    }
                }
                return null;
            }
            var day = Find(DltbColumnIds.daynight_day_seconds);
            var night = Find(DltbColumnIds.daynight_night_seconds);
            cat.DayFromGame = day.HasValue; cat.NightFromGame = night.HasValue;
            cat.DaySeconds = day ?? Sheets.ColumnsDltb.First(c => c.Id == DltbColumnIds.daynight_day_seconds).Fallback;
            cat.NightSeconds = night ?? Sheets.ColumnsDltb.First(c => c.Id == DltbColumnIds.daynight_night_seconds).Fallback;
        }

        /// <summary>Human-readable summary written to UserData/BeastLab/beast_catalog.txt.</summary>
        public string Report()
        {
            var sb = new StringBuilder();
            sb.AppendLine($"Scripts read: {ScriptsRead}");
            foreach (var kv in Things)
            {
                sb.AppendLine($"\n[{kv.Key}] {kv.Value.Count}");
                foreach (var t in kv.Value.Take(400))
                    sb.AppendLine($"  {t.Id} ({t.Category}) {t.Rarity} " +
                        string.Join(" ", t.Values.Select(v => $"{v.Key}={v.Value}{(t.Defaulted.Contains(v.Key) ? "(BeastLab default)" : "")}")) + $"  <{t.File}>");
            }
            sb.AppendLine($"\n[recipes] {Recipes.Count}");
            foreach (var r in Recipes) sb.AppendLine($"  {r.Result} x{r.ResultCount} <- {string.Join(", ", r.Ingredients.Select(i => $"{i.item} x{i.count}"))}  <{r.File}>");
            sb.AppendLine("\n[infected mapping]");
            foreach (var kv in InfectedByRow) sb.AppendLine($"  {kv.Key} <- {kv.Value.Id} " + string.Join(" ", kv.Value.Values.Select(v => $"{v.Key}={v.Value}")));
            sb.AppendLine($"\n[day/night] day {DaySeconds:0}s ({(DayFromGame ? "from The Beast" : "BeastLab default")}), night {NightSeconds:0}s ({(NightFromGame ? "from The Beast" : "BeastLab default")})");
            foreach (var n in Notes) sb.AppendLine("  " + n);
            return sb.ToString();
        }
    }
}
