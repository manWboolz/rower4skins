using System;
using System.Collections.Generic;
using System.Text;

namespace BeastLab.Dltb
{
    /// <summary>One call in a Chrome Engine .scr script: Name(arg, arg) { children } or Name(arg);</summary>
    public sealed class ScrCall
    {
        public string Name = "";
        public List<string> Args = new();
        public List<ScrCall> Children = new();
        public bool HasBody;
        public string File = "";

        public string Arg(int i) => i < Args.Count ? Args[i] : "";
        public override string ToString() => $"{Name}({string.Join(", ", Args)}){(HasBody ? " {" + Children.Count + "}" : "")}";
    }

    /// <summary>
    /// Tolerant parser for Techland .scr files (C-like: imports, sub main() { Item("x", Cat) { Param("k", "v"); } }).
    /// Unknown syntax is skipped rather than failing, so one odd file never stops the catalog.
    /// </summary>
    public static class ScrParser
    {
        enum T { Ident, Str, Num, Sym, End }

        readonly struct Tok
        {
            public readonly T Kind; public readonly string Text;
            public Tok(T k, string s) { Kind = k; Text = s; }
        }

        static List<Tok> Lex(string src)
        {
            var toks = new List<Tok>();
            int i = 0, n = src.Length;
            while (i < n)
            {
                char c = src[i];
                if (char.IsWhiteSpace(c)) { i++; continue; }
                if (c == '/' && i + 1 < n && src[i + 1] == '/') { while (i < n && src[i] != '\n') i++; continue; }
                if (c == '/' && i + 1 < n && src[i + 1] == '*')
                {
                    int e = src.IndexOf("*/", i + 2, StringComparison.Ordinal);
                    i = e < 0 ? n : e + 2; continue;
                }
                if (c == '"')
                {
                    var sb = new StringBuilder(); i++;
                    while (i < n && src[i] != '"')
                    {
                        if (src[i] == '\\' && i + 1 < n) { sb.Append(src[i + 1]); i += 2; continue; }
                        sb.Append(src[i++]);
                    }
                    i++; toks.Add(new Tok(T.Str, sb.ToString())); continue;
                }
                if (char.IsDigit(c) || ((c == '-' || c == '.') && i + 1 < n && (char.IsDigit(src[i + 1]) || src[i + 1] == '.')))
                {
                    int s = i++;
                    while (i < n && (char.IsLetterOrDigit(src[i]) || src[i] == '.' || src[i] == '_')) i++;
                    toks.Add(new Tok(T.Num, src.Substring(s, i - s).TrimEnd('f', 'F'))); continue;
                }
                if (char.IsLetter(c) || c == '_')
                {
                    int s = i++;
                    while (i < n && (char.IsLetterOrDigit(src[i]) || src[i] == '_' || src[i] == '.' || src[i] == ':')) i++;
                    toks.Add(new Tok(T.Ident, src.Substring(s, i - s))); continue;
                }
                toks.Add(new Tok(T.Sym, c.ToString())); i++;
            }
            toks.Add(new Tok(T.End, ""));
            return toks;
        }

        public static List<ScrCall> Parse(string src, string file = "")
        {
            var toks = Lex(src);
            int p = 0;
            var root = ParseBody(toks, ref p, file, topLevel: true);
            return root;
        }

        static List<ScrCall> ParseBody(List<Tok> toks, ref int p, string file, bool topLevel)
        {
            var list = new List<ScrCall>();
            while (toks[p].Kind != T.End)
            {
                var t = toks[p];
                if (t.Kind == T.Sym && t.Text == "}") { if (!topLevel) { p++; return list; } p++; continue; }
                if (t.Kind == T.Sym && t.Text == "{")
                {
                    // Anonymous block: keep its children in this scope.
                    p++; list.AddRange(ParseBody(toks, ref p, file, false)); continue;
                }
                if (t.Kind != T.Ident) { p++; continue; }

                // Name is the last identifier of a run (handles "sub main", "export Item", "use X").
                string name = t.Text; p++;
                while (toks[p].Kind == T.Ident) { name = toks[p].Text; p++; }
                var call = new ScrCall { Name = name, File = file };
                if (toks[p].Kind == T.Sym && toks[p].Text == "(")
                {
                    p++;
                    call.Args = ParseArgs(toks, ref p);
                }
                else if (toks[p].Kind == T.Sym && toks[p].Text == "=")
                {
                    // key = value;  becomes key(value)
                    p++;
                    var sb = new StringBuilder();
                    while (toks[p].Kind != T.End && !(toks[p].Kind == T.Sym && (toks[p].Text == ";" || toks[p].Text == "}")))
                        sb.Append(toks[p++].Text);
                    call.Args.Add(sb.ToString());
                }
                if (toks[p].Kind == T.Sym && toks[p].Text == "{")
                {
                    p++;
                    call.HasBody = true;
                    call.Children = ParseBody(toks, ref p, file, false);
                }
                if (toks[p].Kind == T.Sym && toks[p].Text == ";") p++;
                list.Add(call);
            }
            return list;
        }

        static List<string> ParseArgs(List<Tok> toks, ref int p)
        {
            var args = new List<string>();
            var cur = new StringBuilder();
            int depth = 0;
            bool any = false;
            while (toks[p].Kind != T.End)
            {
                var t = toks[p++];
                if (t.Kind == T.Sym && t.Text == "(") { depth++; cur.Append('('); continue; }
                if (t.Kind == T.Sym && t.Text == ")")
                {
                    if (depth == 0) break;
                    depth--; cur.Append(')'); continue;
                }
                if (t.Kind == T.Sym && t.Text == "," && depth == 0) { args.Add(cur.ToString().Trim()); cur.Clear(); any = true; continue; }
                if (t.Kind == T.Sym && (t.Text == "{" || t.Text == ";")) { p--; break; } // unbalanced: stop safely
                if (cur.Length > 0 && t.Kind != T.Sym && !char.IsPunctuation(cur[cur.Length - 1])) cur.Append(' ');
                cur.Append(t.Text);
                any = true;
            }
            if (any || cur.Length > 0) args.Add(cur.ToString().Trim());
            return args;
        }

        /// <summary>Every call in the tree, depth first.</summary>
        public static IEnumerable<ScrCall> Walk(IEnumerable<ScrCall> calls)
        {
            foreach (var c in calls)
            {
                yield return c;
                foreach (var d in Walk(c.Children)) yield return d;
            }
        }
    }
}
