import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ShieldCheck, Copy, RefreshCw, Check, LockKeyhole, Sparkles,
  Eye, EyeOff, Zap, ArrowUpRight
} from "lucide-react";
import "./index.css";

const initialOptions = { uppercase: true, lowercase: true, numbers: true, symbols: true };

function generateLocally(length, options) {
  const characterSets = [
    options.uppercase && "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    options.lowercase && "abcdefghijklmnopqrstuvwxyz",
    options.numbers && "0123456789",
    options.symbols && "!@#$%^&*()-_=+[]{};:,.?",
  ].filter(Boolean);
  const allCharacters = characterSets.join("");

  function randomIndex(max) {
    const limit = Math.floor(0x100000000 / max) * max;
    const value = new Uint32Array(1);
    do {
      crypto.getRandomValues(value);
    } while (value[0] >= limit);
    return value[0] % max;
  }

  const characters = characterSets.map((set) => set[randomIndex(set.length)]);
  while (characters.length < length) {
    characters.push(allCharacters[randomIndex(allCharacters.length)]);
  }

  for (let i = characters.length - 1; i > 0; i--) {
    const j = randomIndex(i + 1);
    [characters[i], characters[j]] = [characters[j], characters[i]];
  }

  return characters.join("");
}

function App() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState(initialOptions);
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(true);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const activeCount = Object.values(options).filter(Boolean).length;
  const strength = useMemo(() => {
    if (!password) return { label: "Not generated yet", score: 0 };
    let score = 0;
    if (length >= 8) score++;
    if (length >= 12) score++;
    if (length >= 16) score++;
    if (activeCount >= 3) score++;
    return { label: ["Weak", "Fair", "Good", "Strong", "Excellent"][score], score };
  }, [password, length, activeCount]);

  const toggle = (key) => setOptions((old) => ({ ...old, [key]: !old[key] }));

  async function generate() {
    setLoading(true);
    setError("");
    setCopied(false);
    try {
      if (import.meta.env.DEV) {
        setPassword(generateLocally(length, options));
        return;
      }

      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          length,
          ...options,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate password.");
      }

      setPassword(data.password);
    } catch (e) {
      setError(e.message || "Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function copyPassword() {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Clipboard access failed. Select and copy the password manually.");
    }
  }

  const choices = [
    { key: "uppercase", title: "Uppercase letters", detail: "A – Z", sample: "Aa" },
    { key: "lowercase", title: "Lowercase letters", detail: "a – z", sample: "ab" },
    { key: "numbers", title: "Numbers", detail: "0 – 9", sample: "09" },
    { key: "symbols", title: "Symbols", detail: "! @ # $ %", sample: "#@" },
  ];

  return (
    <main className="min-h-[100dvh] bg-[radial-gradient(ellipse_at_50%_12%,rgba(88,75,190,0.16),transparent_40%),#10131d] px-3 py-4 text-slate-100 sm:px-5 sm:py-7">
      <div className="mx-auto w-full max-w-[540px]">
        <nav className="flex items-center justify-between border-b border-[#252938] px-1 pb-5 sm:pb-7">
          <a className="flex items-center gap-2.5 font-display text-xl font-bold tracking-tight text-white no-underline" href="#">
            <span className="grid h-[34px] w-[34px] place-items-center rounded-xl bg-gradient-to-br from-violet-400 to-indigo-600 shadow-lg shadow-indigo-500/20">
              <LockKeyhole size={19} />
            </span>
            <span>Password Generator </span>
          </a>
        </nav>


        <section className="rounded-2xl border border-[#2b3042] bg-[#191d2a] p-4 shadow-glow sm:rounded-[20px] sm:p-[26px]">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight sm:text-[22px]">Create your password</h2>
            </div>
          </div>

          <div className="flex min-h-[67px] items-center gap-2 rounded-xl border border-[#393d51] bg-[#11141f] p-3 sm:gap-3 sm:pl-[18px]">
            <div aria-live="polite" className="min-w-0 flex-1 break-all font-mono text-sm font-semibold tracking-wide text-violet-50 sm:text-[19px]">
              {password ? (visible ? password : "•".repeat(password.length)) : <span className="font-sans text-xs font-normal tracking-normal text-slate-500">Click generate to begin</span>}
            </div>
            <div className="flex shrink-0 gap-2">
              <button className="grid h-9 w-9 place-items-center rounded-lg border border-[#373c50] bg-[#202434] text-slate-300 transition hover:border-violet-400 hover:text-white disabled:cursor-not-allowed" onClick={() => setVisible(!visible)} disabled={!password} aria-label={visible ? "Hide password" : "Show password"} title={visible ? "Hide password" : "Show password"}>
                {visible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
              <button className={`grid h-9 w-9 place-items-center rounded-lg border bg-[#202434] transition disabled:cursor-not-allowed ${copied ? "border-emerald-700 text-emerald-300" : "border-[#373c50] text-slate-300 hover:border-violet-400 hover:text-white"}`} onClick={copyPassword} disabled={!password} aria-label="Copy password" title="Copy password">
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
            </div>
          </div>

          <div className="mb-5 mt-4 flex items-center gap-2.5">
            <div className="flex gap-1" aria-label={`Password strength: ${strength.label}`}>
              {[0, 1, 2, 3].map((i) => <span key={i} className={`h-1 w-[18px] rounded-full sm:w-6 ${i < strength.score ? (strength.score === 4 ? "bg-emerald-400" : strength.score === 3 ? "bg-lime-400" : "bg-amber-400") : "bg-[#34394a]"}`} />)}
            </div>
            <span className="text-[11px] text-slate-300">{strength.label}</span>
            <span className="ml-auto text-[11px] text-slate-400">{length} characters</span>
          </div>

          <div className="mb-6 h-px bg-[#2c3040]" />
          <div className="mb-6 flex items-start justify-between gap-3">
            <div>
              <h3 className="mb-1 text-sm font-semibold">Customize your password</h3>
              <p className="text-xs leading-5 text-slate-400">Choose your length and character types.</p>
            </div>
            <span className="whitespace-nowrap rounded-lg bg-[#282440] px-2.5 py-2 text-[9px] text-violet-200 sm:text-[10px]">{activeCount} of 4 enabled</span>
          </div>

          <div className="mb-3 flex items-center justify-between text-xs text-slate-300">
            <label htmlFor="length-slider">Password length</label>
            <output htmlFor="length-slider" className="font-display text-base font-bold text-violet-300">{length}</output>
          </div>
          <input id="length-slider" className="range-input block w-full" type="range" min="4" max="64" value={length} onChange={(e) => setLength(Number(e.target.value))} style={{ background: `linear-gradient(to right,#9685ff 0%,#9685ff ${((length - 4) / 60) * 100}%,#393d50 ${((length - 4) / 60) * 100}%,#393d50 100%)` }} />
          <div className="mb-5 mt-2.5 flex justify-between text-[10px] text-slate-500"><span>4 characters</span><span>64 characters</span></div>

          <div className="grid grid-cols-1 gap-2.5 min-[420px]:grid-cols-2">
            {choices.map(({ key, title, detail, sample }) => (
              <button key={key} className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2.5 text-left transition sm:gap-3 sm:p-3 ${options[key] ? "border-violet-500/80 bg-[#24223a]" : "border-[#33384c] bg-[#1d2231] hover:border-violet-500/60"}`} onClick={() => toggle(key)} aria-pressed={options[key]}>
                <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg font-display text-xs font-bold sm:h-9 sm:w-9 ${options[key] ? "bg-[#39315e] text-violet-200" : "bg-[#2b3042] text-slate-300"}`}>{sample}</span>
                <span className="flex min-w-0 flex-1 flex-col gap-1">
                  <strong className="truncate text-[10px] font-semibold sm:text-[11px]">{title}</strong>
                  <small className="text-[10px] text-slate-400">{detail}</small>
                </span>
                <span className={`grid h-[17px] w-[17px] shrink-0 place-items-center rounded-full border ${options[key] ? "border-violet-300 bg-violet-300 text-[#171525]" : "border-slate-600 text-transparent"}`}>{options[key] && <Check size={12} />}</span>
              </button>
            ))}
          </div>

          {error && <div role="alert" className="mt-4 rounded-lg border border-rose-900 bg-rose-950/60 px-3 py-2.5 text-xs text-rose-200">{error}</div>}
          <button
            className="relative mt-6 flex h-[51px] w-full items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-violet-400 to-indigo-500 text-[13px] font-bold text-white shadow-lg shadow-indigo-500/20 transition hover:brightness-110 disabled:cursor-not-allowed"
            onClick={generate}
            disabled={loading || activeCount === 0 || length < activeCount}>
            {loading ? (
              <RefreshCw className="animate-spin-slow" size={18} />
            ) : (
              <Zap size={16} />
            )}
            {loading ? "Generating..." : "Generate password"}
            {!loading && (
              <ArrowUpRight className="absolute right-3" size={19} />
            )}
          </button>
        </section>
      </div>
    </main>
  );
}



createRoot(document.getElementById("root")).render(<App />);
