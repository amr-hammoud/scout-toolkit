import { MORSE_CFG as cfg } from "./morse.config";

const letterSepDefault = cfg.meta.letter_sep_default; // "/"
const wordSepDefault = cfg.meta.word_sep_default;     // "//"

const normalizeInput = (s: string) => {
  // digits (Arabic → Latin)
  s = s.replace(/[٠-٩]/g, ch => (cfg.normalize.digits as any)[ch] ?? ch);

  // variants (أ/إ/آ→ا, ة→ت, ى→ا, ؤ/ئ→ء)
  s = s.replace(/./g, ch => (cfg.normalize.variants as any)[ch] ?? ch);

  // strip_chars (if any)
  if (cfg.normalize.strip_chars) {
    const rgx = new RegExp("[" + cfg.normalize.strip_chars + "]", "g");
    s = s.replace(rgx, "");
  }

  // Tatweel (just in case)
  s = s.replace(/ـ+/g, "");
  return s;
};

const MORSE_TO_AR = new Map<string, string>(Object.entries(cfg.morse2ar));

export type EncodeOpts = {
  letterSep?: string;
  wordSep?: string;
};

export function encodeToMorse(input: string, opts: EncodeOpts = {}) {
  const letterSep = opts.letterSep ?? letterSepDefault;
  const wordSep = opts.wordSep ?? wordSepDefault;
  const unknown = cfg.meta.placeholders.unknown_char;

  const text = normalizeInput(input);

  const words = text.trim().split(/\s+/);
  const encodedWords = words.map((word) => {
    return [...word].map((ch) => {
      const m = (cfg.ar2morse as any)[ch];
      if (m) return m;
      if (ch.trim() === "") return "";
      return unknown;
    }).filter(Boolean).join(letterSep);
  });

  return encodedWords.join(wordSep);
}

export type DecodeOpts = {
  letterSep?: string;
  wordSep?: string;
  dashAliases?: string[];
  dotSymbol?: string;  // default "."
  dashSymbol?: string; // default "-"
};

export function decodeFromMorse(input: string, opts: DecodeOpts = {}) {
  const letterSep = opts.letterSep ?? letterSepDefault;
  const wordSep = opts.wordSep ?? wordSepDefault;

  const aliases = opts.dashAliases ?? cfg.meta.dash_aliases;
  const dot = opts.dotSymbol ?? cfg.meta.dot_symbol;
  const dash = opts.dashSymbol ?? cfg.meta.dash_symbol;

  // normalize aliases to dash
  let morse = input.trim();
  if (aliases?.length) {
    const aliasRgx = new RegExp("[" + aliases.join("") + "]", "g");
    morse = morse.replace(aliasRgx, dash);
  }

  // split words
  const words = morse.split(wordSep).map(w => w.trim()).filter(Boolean);

  const decoded = words.map((w) => {
    const codes = w.split(letterSep).map(p => p.trim()).filter(Boolean);
    return codes.map((code) => {
      // keep only dot/dash in case user pasted junk
      const clean = code.replace(new RegExp(`[^\\${dot}\\${dash}]`, "g"), "");
      return MORSE_TO_AR.get(clean) ?? cfg.meta.placeholders.unknown_char;
    }).join("");
  }).join(" ");

  return decoded;
}
