import { useEffect, useState } from "react";
import { encodeToMorse, decodeFromMorse } from "./lib/morse/morse";
import { MORSE_CFG as cfg } from "./lib/morse/morse.config";
import "./App.css";

type Mode = "encode" | "decode";

export default function App() {
  const [mode, setMode] = useState<Mode>("decode");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  // settings (user can tweak)
  const [letterSep, setLetterSep] = useState<string>(cfg.meta.letter_sep_default);
  const [wordSep, setWordSep] = useState<string>(cfg.meta.word_sep_default);

  useEffect(() => {
    if (mode === "encode") {
      setOutput(encodeToMorse(input, { letterSep, wordSep }));
    } else {
      setOutput(decodeFromMorse(input, { letterSep, wordSep }));
    }
  }, [input, mode, letterSep, wordSep]);

  const swap = () => {
    setMode(m => (m === "encode" ? "decode" : "encode"));
    setInput(output);
    // output will recompute on next effect
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(output);
    } catch {}
  };

  return (
    <div dir="rtl" className="container">
      <header>
        <h1>مورس العربي</h1>
        <p className="muted">ترميز/فك ترميز (حروف عربية، أرقام، ترقيم)</p>
      </header>

      <section className="controls">
        <label>
          الوضع:
          <select value={mode} onChange={e => setMode(e.target.value as Mode)}>
            <option value="encode">ترميز ← مورس</option>
            <option value="decode">فك مورس ← نص</option>
          </select>
        </label>

        <label>
          فاصل الحروف:
          <input value={letterSep} onChange={e => setLetterSep(e.target.value)} />
        </label>

        <label>
          فاصل الكلمات:
          <input value={wordSep} onChange={e => setWordSep(e.target.value)} />
        </label>

        <button onClick={swap}>تبديل ↔</button>
      </section>

      <main className="grid">
        <div>
          <label>النص/المورس (إدخال)</label>
          <textarea
            placeholder={mode === "encode" ? "اكتب نصاً عربياً..." : "ألصق مورس باستخدام / و //"}
            value={input}
            onChange={e => setInput(e.target.value)}
            rows={8}
          />
        </div>

        <div>
          <label>النتيجة (خروج)</label>
          <textarea value={output} readOnly rows={8} />
          <div className="row">
            <button onClick={() => setInput("")}>مسح</button>
            <button onClick={copy}>نسخ</button>
          </div>
        </div>
      </main>

      <footer>
        <small>الفواصل الافتراضية: حرف = {cfg.meta.letter_sep_default} ، كلمة = {cfg.meta.word_sep_default}</small>
      </footer>
    </div>
  );
}
