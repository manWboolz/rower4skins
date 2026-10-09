using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace BeastLab.Dltb
{
    /// <summary>
    /// Finds the player's own Dying Light: The Beast install. Melty doesn't know this game yet, so the
    /// mod looks itself: an explicit path from the config, Steam's library folders, Epic's manifests,
    /// then the usual install folders.
    /// </summary>
    public static class GameLocator
    {
        public const string SteamFolderName = "Dying Light The Beast";
        static readonly string[] SourceSubdirs = { "ph_ft/source", "ph/source" };

        /// <summary>Returns the folder holding data0.pak, or null. 'tried' lists every place looked at.</summary>
        public static string? FindSourceDir(string? configured, List<string> tried, Func<string?>? steamPathFromRegistry = null)
        {
            foreach (var root in Candidates(configured, steamPathFromRegistry))
            {
                tried.Add(root);
                var src = SourceDirIn(root);
                if (src != null) return src;
            }
            return null;
        }

        public static string? SourceDirIn(string root)
        {
            if (string.IsNullOrWhiteSpace(root) || !Directory.Exists(root)) return null;
            if (File.Exists(Path.Combine(root, "data0.pak"))) return root;
            foreach (var sub in SourceSubdirs)
            {
                var p = Path.Combine(root, sub);
                if (File.Exists(Path.Combine(p, "data0.pak"))) return p;
            }
            return null;
        }

        static IEnumerable<string> Candidates(string? configured, Func<string?>? steamPathFromRegistry)
        {
            if (!string.IsNullOrWhiteSpace(configured)) yield return configured!;

            var steamRoots = new List<string>();
            try { var r = steamPathFromRegistry?.Invoke(); if (!string.IsNullOrEmpty(r)) steamRoots.Add(r!); } catch { }
            string pf86 = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFilesX86);
            string pf = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            foreach (var b in new[] { pf86, pf }) if (!string.IsNullOrEmpty(b)) steamRoots.Add(Path.Combine(b, "Steam"));
            string home = Environment.GetFolderPath(Environment.SpecialFolder.UserProfile);
            if (!string.IsNullOrEmpty(home))
            {
                steamRoots.Add(Path.Combine(home, ".steam", "steam"));
                steamRoots.Add(Path.Combine(home, ".local", "share", "Steam"));
            }

            var libraries = new List<string>();
            foreach (var root in steamRoots.Distinct(StringComparer.OrdinalIgnoreCase))
            {
                libraries.Add(root);
                libraries.AddRange(SteamLibraries(Path.Combine(root, "steamapps", "libraryfolders.vdf")));
            }
            foreach (var lib in libraries.Distinct(StringComparer.OrdinalIgnoreCase))
                yield return Path.Combine(lib, "steamapps", "common", SteamFolderName);

            foreach (var loc in EpicInstalls()) yield return loc;

            foreach (var drive in SafeDrives())
                foreach (var rel in new[] { "SteamLibrary/steamapps/common/" + SteamFolderName, "Steam/steamapps/common/" + SteamFolderName,
                                            "Games/" + SteamFolderName, "Epic Games/DyingLightTheBeast", "GOG Games/" + SteamFolderName })
                    yield return Path.Combine(drive, rel);
        }

        /// <summary>Library paths from Steam's libraryfolders.vdf ("path" "D:\\SteamLibrary").</summary>
        public static IEnumerable<string> SteamLibraries(string vdf)
        {
            if (!File.Exists(vdf)) yield break;
            string text;
            try { text = File.ReadAllText(vdf); } catch { yield break; }
            foreach (Match m in Regex.Matches(text, "\"path\"\\s*\"([^\"]+)\"", RegexOptions.IgnoreCase))
                yield return m.Groups[1].Value.Replace("\\\\", "\\");
        }

        static IEnumerable<string> EpicInstalls()
        {
            var dir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData), "Epic", "EpicGamesLauncher", "Data", "Manifests");
            if (!Directory.Exists(dir)) yield break;
            string[] files;
            try { files = Directory.GetFiles(dir, "*.item"); } catch { yield break; }
            foreach (var f in files)
            {
                string text;
                try { text = File.ReadAllText(f); } catch { continue; }
                if (!Regex.IsMatch(text, "Dying\\s*Light.*Beast", RegexOptions.IgnoreCase)) continue;
                var m = Regex.Match(text, "\"InstallLocation\"\\s*:\\s*\"([^\"]+)\"");
                if (m.Success) yield return m.Groups[1].Value.Replace("\\\\", "\\");
            }
        }

        static IEnumerable<string> SafeDrives()
        {
            DriveInfo[] drives;
            try { drives = DriveInfo.GetDrives(); } catch { yield break; }
            foreach (var d in drives)
            {
                bool ok;
                try { ok = d.IsReady && d.DriveType == DriveType.Fixed; } catch { ok = false; }
                if (ok) yield return d.RootDirectory.FullName;
            }
        }
    }
}
