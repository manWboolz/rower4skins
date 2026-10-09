using System;
using System.Collections.Generic;
using System.IO;
using System.IO.Compression;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace BeastLab.Dltb
{
    /// <summary>
    /// Reads .scr scripts out of Dying Light: The Beast's ph_ft/source/data*.pak (zip archives),
    /// straight from the player's install. Higher-numbered paks override lower ones, as in the game.
    /// Nothing is extracted to disk.
    /// </summary>
    public sealed class PakSource
    {
        public readonly string SourceDir;
        public readonly List<string> Paks = new();
        readonly Dictionary<string, (string pak, string entry)> _scripts = new(StringComparer.OrdinalIgnoreCase);

        public PakSource(string sourceDir)
        {
            SourceDir = sourceDir;
            foreach (var pak in Directory.GetFiles(sourceDir, "data*.pak").OrderBy(PakNumber))
            {
                try
                {
                    using var zip = ZipFile.OpenRead(pak);
                    foreach (var e in zip.Entries)
                        if (e.FullName.EndsWith(".scr", StringComparison.OrdinalIgnoreCase))
                            _scripts[e.FullName.Replace('\\', '/')] = (pak, e.FullName);
                    Paks.Add(pak);
                }
                catch (Exception ex) when (ex is InvalidDataException || ex is IOException)
                {
                    // Not a zip (or locked): skip it, the report lists what was read.
                }
            }
        }

        static int PakNumber(string path)
        {
            var m = Regex.Match(Path.GetFileNameWithoutExtension(path), @"\d+");
            return m.Success ? int.Parse(m.Value) : 0;
        }

        public int ScriptCount => _scripts.Count;
        public IEnumerable<string> ScriptPaths => _scripts.Keys;

        /// <summary>Script text for every .scr path matching the regex.</summary>
        public IEnumerable<(string path, string text)> Read(Regex pathFilter)
        {
            foreach (var group in _scripts.Where(kv => pathFilter.IsMatch(kv.Key)).GroupBy(kv => kv.Value.pak))
            {
                using var zip = ZipFile.OpenRead(group.Key);
                foreach (var kv in group)
                {
                    var entry = zip.GetEntry(kv.Value.entry);
                    if (entry == null) continue;
                    using var s = entry.Open();
                    using var r = new StreamReader(s, Encoding.UTF8, true);
                    yield return (kv.Key, r.ReadToEnd());
                }
            }
        }
    }
}
