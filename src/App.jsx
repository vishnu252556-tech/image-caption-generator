import { useState, useRef, useCallback } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&family=Space+Mono:wght@400;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #12121a;
    --surface2: #1c1c28;
    --border: #2a2a3d;
    --accent: #00e5c3;
    --accent2: #ff4d6d;
    --accent3: #c77dff;
    --text: #e8e8f0;
    --muted: #6b6b8a;
    --card-glow: 0 0 40px rgba(0,229,195,0.08);
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .grain {
    position: fixed; inset: 0; pointer-events: none; z-index: 999; opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  /* ---- HEADER ---- */
  .header {
    text-align: center;
    padding: 64px 24px 40px;
    position: relative;
  }
  .header::before {
    content: '';
    position: absolute;
    top: 0; left: 50%; transform: translateX(-50%);
    width: 600px; height: 300px;
    background: radial-gradient(ellipse at 50% 0%, rgba(0,229,195,0.12) 0%, transparent 70%);
    pointer-events: none;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    font-family: 'Space Mono', monospace; font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
    color: var(--accent); border: 1px solid rgba(0,229,195,0.3); border-radius: 100px;
    padding: 5px 14px; margin-bottom: 20px;
    animation: fadeSlideDown 0.6s ease both;
  }
  .badge-dot { width: 6px; height: 6px; background: var(--accent); border-radius: 50%; animation: pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.8)} }

  h1 {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(48px, 10vw, 96px);
    letter-spacing: 3px;
    line-height: 0.9;
    background: linear-gradient(135deg, #fff 30%, var(--accent) 70%, var(--accent3) 100%);
    -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
    animation: fadeSlideDown 0.7s 0.1s ease both;
  }
  .subtitle {
    margin-top: 16px; color: var(--muted); font-size: 15px; font-weight: 300; letter-spacing: 0.5px;
    animation: fadeSlideDown 0.7s 0.2s ease both;
  }

  @keyframes fadeSlideDown { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeSlideUp   { from{opacity:0;transform:translateY(16px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn        { from{opacity:0} to{opacity:1} }

  /* ---- MAIN LAYOUT ---- */
  .app { max-width: 960px; margin: 0 auto; padding: 0 24px 80px; }

  /* ---- UPLOAD ZONE ---- */
  .upload-zone {
    position: relative; border: 1.5px dashed var(--border); border-radius: 20px;
    background: var(--surface); padding: 52px 24px;
    display: flex; flex-direction: column; align-items: center; gap: 16px;
    cursor: pointer; transition: all 0.3s;
    animation: fadeSlideUp 0.7s 0.3s ease both;
  }
  .upload-zone:hover, .upload-zone.drag-over {
    border-color: var(--accent); background: rgba(0,229,195,0.04);
    box-shadow: var(--card-glow);
  }
  .upload-zone.has-image { padding: 0; overflow: hidden; border-style: solid; }

  .upload-icon {
    width: 64px; height: 64px; border-radius: 16px;
    background: linear-gradient(135deg, rgba(0,229,195,0.15), rgba(199,125,255,0.15));
    display: flex; align-items: center; justify-content: center; font-size: 28px;
  }
  .upload-label { font-size: 17px; font-weight: 500; }
  .upload-hint { font-size: 13px; color: var(--muted); font-family: 'Space Mono', monospace; }
  .upload-input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

  .preview-img {
    width: 100%; max-height: 420px; object-fit: contain;
    display: block; background: #000;
  }
  .preview-overlay {
    position: absolute; inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%);
    display: flex; align-items: flex-end; justify-content: space-between;
    padding: 20px 24px; opacity: 0; transition: opacity 0.3s;
  }
  .upload-zone:hover .preview-overlay { opacity: 1; }
  .change-btn {
    font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 1px;
    color: var(--text); background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
    padding: 8px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s; text-transform: uppercase;
  }
  .change-btn:hover { background: rgba(255,255,255,0.2); }

  /* ---- CONTROLS ---- */
  .controls {
    display: grid; grid-template-columns: 1fr auto; gap: 12px; margin-top: 16px;
    animation: fadeSlideUp 0.7s 0.4s ease both;
  }
  .tone-select {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px;
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 14px;
    padding: 0 16px; appearance: none; cursor: pointer; transition: border-color 0.2s;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%236b6b8a' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat; background-position: right 14px center;
    padding-right: 36px;
  }
  .tone-select:focus { outline: none; border-color: var(--accent); }

  .generate-btn {
    display: flex; align-items: center; gap: 10px;
    background: linear-gradient(135deg, var(--accent), #00b89a);
    color: #0a0a0f; font-family: 'DM Sans', sans-serif; font-weight: 700; font-size: 15px;
    border: none; border-radius: 12px; padding: 14px 28px; cursor: pointer;
    transition: all 0.2s; white-space: nowrap; letter-spacing: 0.3px;
    box-shadow: 0 4px 24px rgba(0,229,195,0.3);
  }
  .generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,229,195,0.4); }
  .generate-btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

  /* ---- LOADING ---- */
  .loading-card {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 20px;
    padding: 48px; text-align: center; margin-top: 24px;
    animation: fadeIn 0.4s ease;
  }
  .scanning-bar {
    width: 200px; height: 3px; background: var(--border); border-radius: 2px;
    margin: 20px auto 0; overflow: hidden;
  }
  .scanning-fill {
    height: 100%; width: 40%; background: linear-gradient(90deg, var(--accent), var(--accent3));
    border-radius: 2px; animation: scan 1.4s ease-in-out infinite;
  }
  @keyframes scan { 0%{transform:translateX(-100%) scaleX(1)} 50%{transform:translateX(200%) scaleX(1.5)} 100%{transform:translateX(400%) scaleX(1)} }
  .loading-steps { display: flex; flex-direction: column; gap: 8px; margin-top: 24px; align-items: center; }
  .loading-step { font-size: 12px; font-family: 'Space Mono', monospace; color: var(--muted); display: flex; align-items: center; gap: 8px; }
  .step-active { color: var(--accent); }
  .step-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }

  /* ---- RESULTS ---- */
  .results { margin-top: 24px; animation: fadeSlideUp 0.5s ease; }
  .results-header {
    display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
  }
  .results-title {
    font-family: 'Space Mono', monospace; font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--muted);
  }
  .count-badge {
    background: rgba(0,229,195,0.1); border: 1px solid rgba(0,229,195,0.2);
    color: var(--accent); font-size: 11px; font-family: 'Space Mono', monospace;
    padding: 3px 10px; border-radius: 100px;
  }

  .captions-grid { display: flex; flex-direction: column; gap: 12px; }

  .caption-card {
    background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px;
    padding: 20px 20px 20px 24px;
    display: grid; grid-template-columns: auto 1fr auto; gap: 16px; align-items: start;
    transition: all 0.25s; cursor: default;
    animation: fadeSlideUp 0.4s ease both;
  }
  .caption-card:hover { border-color: rgba(0,229,195,0.3); background: var(--surface2); box-shadow: var(--card-glow); }

  .caption-num {
    font-family: 'Bebas Neue', sans-serif; font-size: 28px; line-height: 1;
    color: var(--border); user-select: none; padding-top: 2px;
  }
  .caption-card:hover .caption-num { color: var(--accent); }

  .caption-text { font-size: 15px; line-height: 1.65; color: var(--text); padding-top: 4px; }

  .caption-actions { display: flex; gap: 6px; padding-top: 4px; }
  .action-btn {
    width: 34px; height: 34px; border-radius: 8px; border: 1px solid var(--border);
    background: transparent; color: var(--muted); cursor: pointer; transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; font-size: 14px;
  }
  .action-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(0,229,195,0.08); }
  .action-btn.copied { border-color: var(--accent); color: var(--accent); background: rgba(0,229,195,0.12); }

  /* ---- TAGS / METADATA ---- */
  .meta-row { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 20px; }
  .meta-tag {
    font-size: 11px; font-family: 'Space Mono', monospace; letter-spacing: 0.5px;
    padding: 4px 12px; border-radius: 100px; border: 1px solid;
  }
  .tag-scene  { color: #c77dff; border-color: rgba(199,125,255,0.3); background: rgba(199,125,255,0.08); }
  .tag-mood   { color: #ff4d6d;  border-color: rgba(255,77,109,0.3);  background: rgba(255,77,109,0.08); }
  .tag-object { color: #00e5c3;  border-color: rgba(0,229,195,0.3);   background: rgba(0,229,195,0.08); }

  /* ---- DOWNLOAD ALL ---- */
  .download-row { display: flex; gap: 10px; margin-top: 20px; }
  .dl-btn {
    display: flex; align-items: center; gap: 8px;
    background: var(--surface2); border: 1.5px solid var(--border);
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500;
    padding: 10px 18px; border-radius: 10px; cursor: pointer; transition: all 0.2s;
  }
  .dl-btn:hover { border-color: var(--accent); color: var(--accent); }

  /* ---- ERROR ---- */
  .error-card {
    background: rgba(255,77,109,0.06); border: 1.5px solid rgba(255,77,109,0.25);
    border-radius: 16px; padding: 20px 24px; margin-top: 20px;
    display: flex; gap: 12px; align-items: flex-start;
    animation: fadeIn 0.4s ease;
  }
  .error-icon { font-size: 20px; flex-shrink: 0; margin-top: 1px; }
  .error-text { font-size: 14px; line-height: 1.6; color: #ff8fa3; }

  /* ---- FOOTER ---- */
  .footer { text-align: center; padding: 32px 24px; font-size: 12px; color: var(--muted); font-family: 'Space Mono', monospace; }
  .footer span { color: var(--accent); }

  @media (max-width: 600px) {
    .controls { grid-template-columns: 1fr; }
    .caption-card { grid-template-columns: auto 1fr; }
    .caption-actions { grid-column: 1 / -1; justify-content: flex-end; }
  }
`;

const TONE_OPTIONS = [
  { value: "descriptive", label: "📝 Descriptive – Factual & Clear" },
  { value: "poetic",      label: "🌿 Poetic – Lyrical & Evocative" },
  { value: "social",      label: "📱 Social Media – Catchy & Fun" },
  { value: "professional",label: "💼 Professional – Formal & Precise" },
  { value: "storytelling",label: "📖 Storytelling – Narrative Style" },
  { value: "minimal",     label: "✦ Minimal – Short & Sharp" },
];

const LOADING_STEPS = [
  "Decoding image pixels…",
  "Running visual analysis…",
  "Identifying objects & scenes…",
  "Extracting mood & context…",
  "Generating captions with AI…",
];

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result.split(",")[1]);
    r.onerror = () => reject(new Error("Failed to read file"));
    r.readAsDataURL(file);
  });
}

function buildPrompt(tone) {
  const toneGuide = {
    descriptive:    "factual, clear, and precise — describe what is literally visible",
    poetic:         "lyrical, evocative, and metaphorical — paint with words",
    social:         "catchy, fun, emoji-friendly, and great for Instagram or Twitter",
    professional:   "formal, polished, and suitable for business or editorial use",
    storytelling:   "narrative style — as if opening a short story or scene",
    minimal:        "ultra-concise, 5–10 words max per caption, sharp and impactful",
  };

  return `You are an expert AI image caption generator. Analyze the image carefully and generate exactly 5 diverse, high-quality captions.

Tone style: ${toneGuide[tone] || toneGuide.descriptive}

Also extract:
- Scene type (e.g., urban, nature, portrait, interior, abstract)
- Mood/emotion (e.g., serene, energetic, nostalgic, mysterious)
- 3–5 key objects/subjects visible

Respond ONLY in this exact JSON (no markdown, no backticks, no extra text):
{
  "captions": [
    "Caption one here",
    "Caption two here",
    "Caption three here",
    "Caption four here",
    "Caption five here"
  ],
  "scene": "scene description",
  "mood": "mood/emotion",
  "objects": ["object1", "object2", "object3"]
}`;
}

export default function App() {
  const [image, setImage]         = useState(null); // { file, url, base64, type }
  const [tone, setTone]           = useState("descriptive");
  const [loading, setLoading]     = useState(false);
  const [loadStep, setLoadStep]   = useState(0);
  const [result, setResult]       = useState(null);
  const [error, setError]         = useState(null);
  const [copied, setCopied]       = useState(null);
  const [drag, setDrag]           = useState(false);
  const inputRef = useRef();

  const handleFile = useCallback((file) => {
    if (!file) return;
    const allowed = ["image/jpeg","image/png","image/webp","image/gif","image/bmp"];
    if (!allowed.includes(file.type)) {
      setError("Unsupported file type. Please upload a JPG, PNG, WEBP, or GIF image.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Image is too large. Please upload an image under 10 MB.");
      return;
    }
    setError(null); setResult(null);
    const url = URL.createObjectURL(file);
    fileToBase64(file).then(base64 => {
      setImage({ file, url, base64, type: file.type });
    });
  }, []);

  const onInputChange = (e) => handleFile(e.target.files[0]);
  const onDrop = (e) => { e.preventDefault(); setDrag(false); handleFile(e.dataTransfer.files[0]); };
  const onDragOver = (e) => { e.preventDefault(); setDrag(true); };
  const onDragLeave = () => setDrag(false);

  const generate = async () => {
    if (!image) return;
    setLoading(true); setError(null); setResult(null); setLoadStep(0);

    // animate loading steps
    const interval = setInterval(() => setLoadStep(s => Math.min(s + 1, LOADING_STEPS.length - 1)), 700);

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: image.type, data: image.base64 } },
              { type: "text", text: buildPrompt(tone) }
            ]
          }]
        })
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.error?.message || `API error ${response.status}`);
      }

      const data = await response.json();
      const raw = data.content.map(b => b.text || "").join("\n").trim();
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      if (!parsed.captions?.length) throw new Error("No captions returned. Please try again.");
      setResult(parsed);
    } catch (e) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      clearInterval(interval);
      setLoading(false); setLoadStep(0);
    }
  };

  const copyCaption = async (text, idx) => {
    await navigator.clipboard.writeText(text).catch(() => {});
    setCopied(idx);
    setTimeout(() => setCopied(null), 1800);
  };

  const downloadAll = () => {
    if (!result) return;
    const content = result.captions.map((c,i) => `Caption ${i+1}:\n${c}`).join("\n\n");
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "captions.txt"; a.click();
  };

  const downloadJson = () => {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "captions.json"; a.click();
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="grain" />

      <header className="header">
        <div className="badge"><span className="badge-dot" />Powered by Claude Vision AI</div>
        <h1>AI CAPTION<br/>GENERATOR</h1>
        <p className="subtitle">Upload any image — get 5 smart, human-like captions instantly</p>
      </header>

      <main className="app">
        {/* Upload Zone */}
        <div
          className={`upload-zone${image ? " has-image" : ""}${drag ? " drag-over" : ""}`}
          onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}
          onClick={() => !image && inputRef.current?.click()}
        >
          {!image ? (
            <>
              <div className="upload-icon">🖼️</div>
              <div className="upload-label">Drop your image here or click to browse</div>
              <div className="upload-hint">JPG · PNG · WEBP · GIF · Max 10MB</div>
            </>
          ) : (
            <>
              <img src={image.url} alt="Preview" className="preview-img" />
              <div className="preview-overlay">
                <span style={{fontSize:12,color:'#fff',opacity:.7,fontFamily:'Space Mono,monospace'}}>
                  {image.file.name}
                </span>
                <button className="change-btn" onClick={e => { e.stopPropagation(); setImage(null); setResult(null); setError(null); }}>
                  ✕ Remove
                </button>
              </div>
            </>
          )}
          <input
            ref={inputRef} type="file" accept="image/*" className="upload-input"
            onChange={onInputChange}
            onClick={e => e.stopPropagation()}
          />
        </div>

        {/* Controls */}
        <div className="controls">
          <select className="tone-select" value={tone} onChange={e => setTone(e.target.value)}>
            {TONE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <button className="generate-btn" onClick={generate} disabled={!image || loading}>
            {loading ? (
              <><span style={{fontSize:18,animation:'spin 1s linear infinite',display:'inline-block'}}>⟳</span> Analyzing…</>
            ) : (
              <><span style={{fontSize:18}}>✦</span> Generate Captions</>
            )}
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-card">
            <div style={{fontSize:40}}>🔍</div>
            <div style={{marginTop:12,fontSize:15,color:'var(--muted)'}}>AI is analyzing your image</div>
            <div className="scanning-bar"><div className="scanning-fill"/></div>
            <div className="loading-steps">
              {LOADING_STEPS.map((s,i) => (
                <div key={s} className={`loading-step${i <= loadStep ? " step-active" : ""}`}>
                  <span className="step-dot"/>
                  {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="error-card">
            <span className="error-icon">⚠️</span>
            <div className="error-text">{error}</div>
          </div>
        )}

        {/* Results */}
        {result && !loading && (
          <div className="results">
            <div className="results-header">
              <span className="results-title">Generated Captions</span>
              <span className="count-badge">{result.captions.length} captions</span>
            </div>

            <div className="captions-grid">
              {result.captions.map((cap, i) => (
                <div key={i} className="caption-card" style={{animationDelay:`${i*80}ms`}}>
                  <div className="caption-num">0{i+1}</div>
                  <div className="caption-text">{cap}</div>
                  <div className="caption-actions">
                    <button
                      className={`action-btn${copied === i ? " copied" : ""}`}
                      title="Copy caption"
                      onClick={() => copyCaption(cap, i)}
                    >
                      {copied === i ? "✓" : "⧉"}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Metadata tags */}
            {(result.scene || result.mood || result.objects?.length) && (
              <div className="meta-row">
                {result.scene  && <span className="meta-tag tag-scene">📍 {result.scene}</span>}
                {result.mood   && <span className="meta-tag tag-mood">💫 {result.mood}</span>}
                {result.objects?.map(o => <span key={o} className="meta-tag tag-object">◈ {o}</span>)}
              </div>
            )}

            {/* Download */}
            <div className="download-row">
              <button className="dl-btn" onClick={downloadAll}>⬇ Download .txt</button>
              <button className="dl-btn" onClick={downloadJson}>⬇ Download .json</button>
            </div>
          </div>
        )}
      </main>

      <footer className="footer">
        Built with <span>Claude Vision AI</span> · Generative AI Image Caption Generator
      </footer>
    </>
  );
}
