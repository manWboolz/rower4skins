using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using BeastLab.Dltb;
using BeastLab.Generated;
using Xunit;

// These scripts are SYNTHETIC samples written in Techland's .scr style for testing the parser.
// They are not The Beast's files; the real check is beast_catalog.txt written in game.
public class CatalogTests
{
    const string Inventory = @"
import ""inventory_base.scr""
// weapons
sub main()
{
    Item(""Wpn_Machete_Rusty"", CategoryType_Melee)
    {
        Param(""Damage"", ""48.5"");
        Param(""Rarity"", ""Rare"");
        Param(""Durability"", 120);
    }
    Item(""Wpn_Pistol_9mm"", CategoryType_Firearm) { Param(""Damage"", ""30""); Param(""Rarity"", ""Uncommon""); }
    Item(""Medkit"", CategoryType_Consumable) { Param(""HealAmount"", ""50""); }
    Item(""Ammo_Pistol"", CategoryType_Ammo) { Param(""StackSize"", 24); }
    Item(""Ammo_Shotgun"", CategoryType_Ammo) { }
    Item(""Craftpart_Rags"", CategoryType_CraftPart) { Param(""Rarity"", ""Common""); }
    Item(""Craftpart_Alcohol"", CategoryType_CraftPart) { }
    Item(""Wpn_Machete_Rusty_Skin"", CategoryType_Melee) { }
    /* Item(""Commented_Out"", CategoryType_Melee) { } */
}";

    const string Crafting = @"
sub main()
{
    Blueprint(""Medkit_bp"")
    {
        Result(""Medkit"", 1);
        Ingredient(""Craftpart_Rags"", 2);
        Ingredient(""Craftpart_Alcohol"", 1);
    }
    Blueprint(""Unknown_bp"") { Result(""NotAnItem"", 1); Ingredient(""Craftpart_Rags"", 1); }
}";

    const string Ai = @"
Preset(""Biter_Default"") { Param(""Health"", ""200""); Param(""RunSpeed"", ""3.5""); Param(""AttackDamage"", ""12""); }
Preset(""Volatile_Night"") { Param(""MaxHealth"", ""900""); Param(""Speed"", ""8""); }
Preset(""Volatile_Anim_Set"") { }
";

    const string Time = @"Param(""DayDuration"", ""32""); Param(""NightDuration"", ""420"");";

    static List<(string, string)> Scripts() => new()
    {
        ("data/scripts/inventory/inventory_weapons.scr", Inventory),
        ("data/scripts/crafting/crafting_blueprints.scr", Crafting),
        ("data/ai/presets/zombie_presets.scr", Ai),
        ("data/scripts/game/time_of_day.scr", Time),
    };

    [Fact]
    public void Parser_reads_nested_items_and_skips_comments()
    {
        var calls = ScrParser.Walk(ScrParser.Parse(Inventory)).Where(c => c.Name == "Item").ToList();
        Assert.Equal(8, calls.Count);
        var machete = calls[0];
        Assert.Equal("Wpn_Machete_Rusty", machete.Arg(0));
        Assert.Equal("CategoryType_Melee", machete.Arg(1));
        Assert.Contains(machete.Children, c => c.Name == "Param" && c.Arg(0) == "Damage" && c.Arg(1) == "48.5");
    }

    [Fact]
    public void Catalog_sorts_items_into_sources_with_values()
    {
        var cat = Catalog.Build(Scripts());
        var weapons = cat.Of(DltbSourceIds.weapons);
        Assert.Equal(new[] { "Wpn_Machete_Rusty", "Wpn_Pistol_9mm" }, weapons.Select(w => w.Id).ToArray()); // skin excluded
        Assert.Equal(48.5f, weapons[0].Get("damage"));
        Assert.Equal(RarityIds.rare, weapons[0].Rarity);
        Assert.Equal(RarityIds.uncommon, weapons[1].Rarity);   // not taken for "common"

        var med = cat.Of(DltbSourceIds.consumables).Single();
        Assert.Equal(50f, med.Get("heal"));
        Assert.Empty(med.Defaulted);

        var ammo = cat.Of(DltbSourceIds.ammo);
        Assert.Equal(24f, ammo.Single(a => a.Id == "Ammo_Pistol").Get("count"));
        Assert.Contains("count", ammo.Single(a => a.Id == "Ammo_Shotgun").Defaulted);

        Assert.Equal(2, cat.Of(DltbSourceIds.craftparts).Count);
    }

    [Fact]
    public void Recipes_keep_only_makeable_ones()
    {
        var cat = Catalog.Build(Scripts());
        var r = Assert.Single(cat.Recipes);
        Assert.Equal("Medkit", r.Result);
        Assert.Equal(new[] { ("Craftpart_Rags", 2), ("Craftpart_Alcohol", 1) }, r.Ingredients.ToArray());
    }

    [Fact]
    public void Infected_types_map_to_sheet_rows_with_read_stats_only()
    {
        var cat = Catalog.Build(Scripts());
        var biter = cat.InfectedByRow[InfectedIds.biter];
        Assert.Equal(200f, biter.Get("health"));
        Assert.Equal(3.5f, biter.Get("speed"));
        Assert.Equal(12f, biter.Get("damage"));
        var vol = cat.InfectedByRow[InfectedIds.@volatile];
        Assert.Equal("Volatile_Night", vol.Id);     // the anim set has no stats
        Assert.Equal(-1f, vol.Get("damage"));       // not read -> not applied
        Assert.False(cat.InfectedByRow.ContainsKey(InfectedIds.goon));
    }

    [Fact]
    public void Day_night_lengths_read_and_normalised()
    {
        var cat = Catalog.Build(Scripts());
        Assert.True(cat.DayFromGame);
        Assert.Equal(32 * 60, cat.DaySeconds);   // minutes -> seconds
        Assert.Equal(420, cat.NightSeconds);
    }

    [Fact]
    public void Pak_source_reads_zip_and_later_paks_override()
    {
        var dir = Directory.CreateTempSubdirectory("beastlab").FullName;
        void Pak(string name, params (string path, string text)[] files)
        {
            using var z = ZipFile.Open(Path.Combine(dir, name), ZipArchiveMode.Create);
            foreach (var (p, t) in files)
            {
                using var w = new StreamWriter(z.CreateEntry(p).Open());
                w.Write(t);
            }
        }
        Pak("data0.pak", Scripts().Select(s => (s.Item1, s.Item2)).ToArray());
        Pak("data2.pak", ("data/scripts/inventory/inventory_weapons.scr", "Item(\"Wpn_Axe_Modded\", CategoryType_Melee) { Param(\"Damage\", \"99\"); }"));
        File.WriteAllText(Path.Combine(dir, "data1.pak"), "not a zip");

        var pak = new PakSource(dir);
        Assert.Equal(2, pak.Paks.Count);
        var cat = Catalog.Build(pak);
        Assert.Equal("Wpn_Axe_Modded", cat.Of(DltbSourceIds.weapons).Single().Id);
        // data2 replaced the whole inventory file, so its medkit and parts are gone and no recipe is makeable.
        Assert.Empty(cat.Of(DltbSourceIds.consumables));
        Assert.Empty(cat.Recipes);
        Assert.True(cat.InfectedByRow.ContainsKey(InfectedIds.biter)); // other files from data0 still read
    }

    [Fact]
    public void Locator_finds_install_through_steam_library_list()
    {
        var steam = Directory.CreateTempSubdirectory("steam").FullName;
        var lib = Directory.CreateTempSubdirectory("lib").FullName;
        Directory.CreateDirectory(Path.Combine(steam, "steamapps"));
        File.WriteAllText(Path.Combine(steam, "steamapps", "libraryfolders.vdf"),
            "\"libraryfolders\"\n{\n \"0\" { \"path\" \"" + steam.Replace("\\", "\\\\") + "\" }\n \"1\" { \"path\" \"" + lib.Replace("\\", "\\\\") + "\" }\n}");
        var src = Path.Combine(lib, "steamapps", "common", GameLocator.SteamFolderName, "ph_ft", "source");
        Directory.CreateDirectory(src);
        File.WriteAllText(Path.Combine(src, "data0.pak"), "");

        var tried = new List<string>();
        Assert.Equal(src, GameLocator.FindSourceDir(null, tried, () => steam));
        Assert.Contains(tried, t => t.StartsWith(steam));
    }

    [Fact]
    public void Pretty_names()
    {
        Assert.Equal("Machete Rusty", BeastThing.Pretty("Wpn_Machete_Rusty"));
        Assert.Equal("Rags", BeastThing.Pretty("Craftpart_Rags"));
    }
}
