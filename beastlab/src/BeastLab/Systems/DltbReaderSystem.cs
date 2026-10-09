using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using BeastLab.Dltb;
using BeastLab.Generated;

namespace BeastLab.Systems
{
    /// <summary>
    /// Finds Dying Light: The Beast on this PC and reads its data on a background thread, from the
    /// player's own data*.pak. Writes beast_catalog.txt next to the config so what was read can be checked.
    /// </summary>
    public sealed class DltbReaderSystem : BeastSystem
    {
        public enum State { Loading, Ready, NotFound, Failed }
        public State Status { get; private set; } = State.Loading;
        public Catalog? Catalog { get; private set; }
        public string? SourceDir { get; private set; }
        Task? _task;
        bool _announced;
        readonly HudSystem _hud;
        readonly PlayerSystem _player;

        public DltbReaderSystem(HudSystem hud, PlayerSystem player) : base(SystemIds.dltb_reader) { _hud = hud; _player = player; }

        public bool Ready => Status == State.Ready && Catalog != null;

        public void Start(string? configuredPath, string reportDir)
        {
            _task = Task.Run(() =>
            {
                try
                {
                    var tried = new List<string>();
                    SourceDir = GameLocator.FindSourceDir(configuredPath, tried, SteamPathFromRegistry);
                    if (SourceDir == null)
                    {
                        File.WriteAllText(Path.Combine(reportDir, "beast_catalog.txt"),
                            "Dying Light: The Beast was not found. Looked in:\n" + string.Join("\n", tried));
                        Status = State.NotFound;
                        return;
                    }
                    var pak = new PakSource(SourceDir);
                    var cat = Catalog.Build(pak);
                    File.WriteAllText(Path.Combine(reportDir, "beast_catalog.txt"),
                        $"Read from {SourceDir} ({string.Join(", ", pak.Paks.Select(Path.GetFileName))}, {pak.ScriptCount} scripts)\n" + cat.Report());
                    Catalog = cat;
                    Status = State.Ready;
                }
                catch (Exception e)
                {
                    Mod.Log.Error("Reading The Beast failed: " + e);
                    Status = State.Failed;
                }
            });
        }

        static string? SteamPathFromRegistry()
        {
            if (!OperatingSystem.IsWindows()) return null;
            return Microsoft.Win32.Registry.GetValue(@"HKEY_CURRENT_USER\Software\Valve\Steam", "SteamPath", null) as string
                ?? Microsoft.Win32.Registry.GetValue(@"HKEY_LOCAL_MACHINE\SOFTWARE\WOW6432Node\Valve\Steam", "InstallPath", null) as string;
        }

        protected override void OnLevel() => _announced = false;

        protected override void Tick(float dt)
        {
            if (!_player.InLevel) return;
            switch (Status)
            {
                case State.Loading:
                    _hud.Line(HudIds.dltb_loading);
                    break;
                case State.Ready:
                    _hud.ClearLine(HudIds.dltb_loading);
                    if (!_announced)
                    {
                        _announced = true;
                        _hud.Toast(HudIds.dltb_loaded,
                            ("weapons", Catalog!.Of(DltbSourceIds.weapons).Count),
                            ("infected", Catalog.InfectedByRow.Count),
                            ("recipes", Catalog.Recipes.Count));
                    }
                    break;
                default:
                    _hud.ClearLine(HudIds.dltb_loading);
                    _hud.Line(HudIds.no_dltb);
                    break;
            }
        }
    }
}
