import { useState, useEffect, useCallback } from "react";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS — Midnight Pro
// ─────────────────────────────────────────────────────────────────────────────
const T = {
  bg0: "#050810", bg1: "#080C18", bg2: "#0B1020", bg3: "#0E1528", bgHov: "#111A30",
  brd0: "#141E35", brd1: "#1C2A45", brd2: "#253555",
  gold: "#D4A843", goldL: "#E8C06A", goldD: "#A07E2C", goldDim: "#3D2E10",
  txt: "#D6DDED", txtSub: "#6A7E9E", txtDim: "#3A4E6A",
  bull: "#3DD68C", bear: "#F04E5E", blue: "#4D8EF0", teal: "#2FC6C6",
};

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────
const PAIRS = [
  { sym: "BTCUSDT",  label: "BTC/USDT",  base: "BTC",  col: "#F7931A", dec: 2 },
  { sym: "ETHUSDT",  label: "ETH/USDT",  base: "ETH",  col: "#627EEA", dec: 2 },
  { sym: "SOLUSDT",  label: "SOL/USDT",  base: "SOL",  col: "#9945FF", dec: 3 },
  { sym: "BNBUSDT",  label: "BNB/USDT",  base: "BNB",  col: "#F0B90B", dec: 3 },
  { sym: "XRPUSDT",  label: "XRP/USDT",  base: "XRP",  col: "#00AAE4", dec: 4 },
  { sym: "DOGEUSDT", label: "DOGE/USDT", base: "DOGE", col: "#BA9F33", dec: 5 },
  { sym: "ADAUSDT",  label: "ADA/USDT",  base: "ADA",  col: "#2EC4F0", dec: 4 },
  { sym: "AVAXUSDT", label: "AVAX/USDT", base: "AVAX", col: "#E84142", dec: 3 },
  { sym: "LINKUSDT", label: "LINK/USDT", base: "LINK", col: "#2A5ADA", dec: 3 },
  { sym: "DOTUSDT",  label: "DOT/USDT",  base: "DOT",  col: "#E6007A", dec: 3 },
];

const SEED = {
  BTCUSDT: 68200, ETHUSDT: 3450, SOLUSDT: 183, BNBUSDT: 588,
  XRPUSDT: 0.622, DOGEUSDT: 0.164, ADAUSDT: 0.479,
  AVAXUSDT: 37.8, LINKUSDT: 14.4, DOTUSDT: 8.15,
};

const SESSIONS = [
  { name: "Asia",     open: 0,  close: 9,  col: "#D4A843" },
  { name: "London",   open: 7,  close: 16, col: "#4D8EF0" },
  { name: "New York", open: 13, close: 22, col: "#3DD68C" },
];

const KILLZONES = [
  { name: "Asia KZ",   s: 0,  e: 4,  col: "#D4A843" },
  { name: "London KZ", s: 7,  e: 10, col: "#4D8EF0" },
  { name: "NY AM KZ",  s: 13, e: 16, col: "#3DD68C" },
  { name: "NY PM KZ",  s: 19, e: 21, col: "#E84142" },
];

const BIASES    = ["LONG", "SHORT", "NEUTRAL", "WAIT"];
const BIAS_COL  = { LONG: T.bull, SHORT: T.bear, NEUTRAL: T.gold, WAIT: T.txtDim };
const TIMEFRAMES = ["1m", "5m", "15m", "1H", "4H", "1D"];

const SETUPS = [
  "BOS + OB Mitigation", "CHoCH + FVG Fill", "Liquidity Sweep + Reversal",
  "OTE Fib (0.618–0.786)", "NWOG / NDOG Raid", "Premium/Discount OB",
  "SIBI / BISI Fill", "MSS + Displacement", "Equal Hi/Lo Sweep", "HTF OB Return",
];

const ICT_CARDS = [
  { icon: "◈", title: "Market Structure",      col: "#4D8EF0",
    body: "HH+HL = bullish structure. LH+LL = bearish. BOS (Break of Structure) confirms trend continuation. CHoCH (Change of Character) signals institutional reversal. Always identify the last BOS before entry. MSS on LTF confirms HTF bias execution." },
  { icon: "▣", title: "Order Blocks (OB)",      col: "#9945FF",
    body: "Last opposing candle before a significant BOS. Bullish OB: last bearish candle before bullish BOS. Bearish OB: last bullish candle before bearish BOS. Price returns to mitigate. Best confluence: OB inside discount/premium + FVG embedded in OB body." },
  { icon: "⟷", title: "Fair Value Gaps (FVG)",  col: T.bull,
    body: "3-candle imbalance: high of C1 < low of C3 (bullish) or low of C1 > high of C3 (bearish). Price seeks to fill inefficiencies. IFVG = filled FVG that inverts to S/R. Strong FVGs form during displacement candles after liquidity raids." },
  { icon: "◎", title: "Liquidity & Stop Hunts", col: T.gold,
    body: "BSL sits above swing highs. SSL sits below swing lows. Equal Highs/Lows are precision hunt targets. Smart money sweeps retail stops then reverses hard. Entry signal: candle that sweeps AND closes back inside prior range. Always ask — who got liquidated here?" },
  { icon: "φ", title: "OTE Fibonacci",           col: "#E8C06A",
    body: "Optimal Trade Entry = 0.618–0.786 retracement zone. Draw swing low→high (bull) or high→low (bear). Enter on LTF displacement candle inside OTE zone after confirmed BOS. 0.705 is the deepest OTE level. SL below swing point." },
  { icon: "⊡", title: "Premium vs Discount",     col: T.bear,
    body: "50% equilibrium divides every range. Premium (above 50%): sell territory in bearish bias. Discount (below 50%): buy territory in bullish bias. Never buy premium when bullish. Use Fib 0.5 to mark EQ. This single filter eliminates most low-quality entries." },
  { icon: "⌚", title: "Killzones & Sessions",    col: "#E84142",
    body: "Asia KZ 00:00–04:00 UTC: range formation, liquidity hunt. London KZ 07:00–10:00: largest displacements. NY AM KZ 13:00–16:00: continuation or reversal. NY PM KZ 19:00–21:00: secondary reversal window. London+NY overlap is the most powerful trading window." },
  { icon: "⬡", title: "Risk Management",          col: T.teal,
    body: "Max 1% risk per trade. Minimum 2:1 R:R (target 3:1+). Never move SL to BE before price confirms. Daily stop: −3% → step away. Weekly stop: −5% → full review. 3 A+ setups per week beats 20 C-grade setups. Journal every trade without exception." },
];

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const utcH   = d => d.getUTCHours() + d.getUTCMinutes() / 60 + d.getUTCSeconds() / 3600;
const p2     = n => String(n).padStart(2, "0");
const fUTC   = d => `${p2(d.getUTCHours())}:${p2(d.getUTCMinutes())}:${p2(d.getUTCSeconds())}`;
const fDate  = d => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
const fNum   = (n, d) => Number(n).toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });
const fK     = n => n >= 1e9 ? (n / 1e9).toFixed(2) + "B" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(0) + "K" : n.toFixed(0);
const getSess = h => SESSIONS.find(s => s.open <= s.close ? h >= s.open && h < s.close : h >= s.open || h < s.close);
const getKZ   = h => KILLZONES.find(k => h >= k.s && h < k.e);

function makeCandles(base, n = 90) {
  const cs = []; let p = base;
  for (let i = 0; i < n; i++) {
    const o = p, r = p * (0.003 + Math.random() * 0.014), d = Math.random() > 0.465 ? 1 : -1;
    const c = Math.max(1e-6, o + d * r * (0.3 + Math.random() * 0.7));
    cs.push({ o, h: Math.max(o, c) + Math.random() * r * 0.25, l: Math.max(1e-6, Math.min(o, c) - Math.random() * r * 0.25), c, bull: c >= o, vol: Math.floor(300 + Math.random() * 9000) });
    p = c;
  }
  return cs;
}

function makeTrades() {
  return PAIRS.flatMap((p, pi) => Array.from({ length: 2 + (pi % 3) }, (_, i) => {
    const win = Math.random() > 0.37;
    const pnl = win ? +(70 + Math.random() * 880).toFixed(2) : -(30 + Math.random() * 260).toFixed(2);
    return { id: `${pi}-${i}`, pair: p.label, setup: SETUPS[Math.floor(Math.random() * SETUPS.length)], tf: TIMEFRAMES[1 + Math.floor(Math.random() * 4)], result: win ? "WIN" : "LOSS", pnl, rr: win ? (1.5 + Math.random() * 4).toFixed(1) : "−1.0", date: new Date(Date.now() - Math.random() * 14 * 86400000).toLocaleDateString() };
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────
const INP = { background: T.bg0, color: T.txt, border: `1px solid ${T.brd1}`, borderRadius: 5, padding: "7px 10px", fontSize: 12, fontFamily: "inherit", outline: "none", width: "100%", boxSizing: "border-box" };

function Panel({ children, style = {} }) {
  return <div style={{ background: T.bg2, border: `1px solid ${T.brd0}`, borderRadius: 10, padding: 18, ...style }}>{children}</div>;
}

function GoldRule({ label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
      <div style={{ height: 1, width: 18, background: `linear-gradient(to right,${T.goldD},${T.gold})` }} />
      <span style={{ fontSize: 8, fontWeight: 700, letterSpacing: 2.5, color: T.gold, textTransform: "uppercase", whiteSpace: "nowrap" }}>{label}</span>
      <div style={{ flex: 1, height: 1, background: `linear-gradient(to right,${T.goldDim},transparent)` }} />
    </div>
  );
}

function Chip({ color = T.gold, children, pulse = false, xs = false }) {
  return (
    <span style={{ background: `${color}15`, border: `1px solid ${color}38`, color, borderRadius: 4, padding: xs ? "1px 5px" : "3px 9px", fontSize: xs ? 8 : 9, fontWeight: 700, letterSpacing: 0.5, display: "inline-flex", alignItems: "center", gap: 4, animation: pulse ? "mpulse 1.6s ease-in-out infinite" : undefined, whiteSpace: "nowrap" }}>
      {pulse && <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />}
      {children}
    </span>
  );
}

function KPI({ label, value, sub, color = T.txt }) {
  return (
    <div style={{ background: T.bg3, border: `1px solid ${T.brd0}`, borderRadius: 8, padding: "13px 15px" }}>
      <div style={{ fontSize: 8, color: T.txtDim, letterSpacing: 2, textTransform: "uppercase", marginBottom: 7 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color, fontFamily: "monospace", lineHeight: 1, letterSpacing: -0.5 }}>{value}</div>
      {sub && <div style={{ fontSize: 9, color: T.txtSub, marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// CANDLESTICK CHART
// ─────────────────────────────────────────────────────────────────────────────
function CandleChart({ candles = [], height = 210 }) {
  if (!candles.length) return <div style={{ height, background: T.bg3, borderRadius: 6 }} />;
  const W = 720, VH = 34, CH = height;
  const prices = candles.flatMap(c => [c.h, c.l]);
  const mn = Math.min(...prices), mx = Math.max(...prices), rng = mx - mn || 0.00001;
  const maxVol = Math.max(...candles.map(c => c.vol)) || 1;
  const py = v => 4 + (1 - (v - mn) / rng) * (CH - 8);
  const bw = (W - 8) / candles.length;
  const last = candles[candles.length - 1];
  const lastY = py(last.c);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${CH + VH}`} preserveAspectRatio="none" style={{ display: "block" }}>
      <defs>
        <linearGradient id="cbg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={T.bg3} /><stop offset="100%" stopColor={T.bg0} />
        </linearGradient>
      </defs>
      <rect width={W} height={CH + VH} fill="url(#cbg)" rx="4" />
      {[0.2, 0.4, 0.6, 0.8].map(r => (
        <g key={r}>
          <line x1={0} y1={r * CH} x2={W} y2={r * CH} stroke={T.brd0} strokeWidth={0.6} strokeDasharray="3 4" />
          <text x={W - 5} y={r * CH - 3} fill={T.txtDim} fontSize={7} textAnchor="end" fontFamily="monospace">
            {fNum(mn + rng * (1 - r), rng < 0.01 ? 5 : rng < 10 ? 3 : rng < 1000 ? 1 : 0)}
          </text>
        </g>
      ))}
      <line x1={0} y1={lastY} x2={W} y2={lastY} stroke={last.bull ? T.bull : T.bear} strokeWidth={0.5} strokeDasharray="4 3" opacity={0.5} />
      {candles.map((c, i) => {
        const x = 4 + i * bw + bw * 0.1, cw = bw * 0.8, col = c.bull ? T.bull : T.bear;
        const oh = py(c.o), ch2 = py(c.c), hh = py(c.h), lh = py(c.l);
        const top = Math.min(oh, ch2), bot = Math.max(oh, ch2);
        const vh = (c.vol / maxVol) * (VH - 4);
        return (
          <g key={i}>
            <line x1={x + cw / 2} y1={hh} x2={x + cw / 2} y2={lh} stroke={col} strokeWidth={0.8} opacity={0.5} />
            <rect x={x} y={top} width={cw} height={Math.max(1.5, bot - top)} fill={col} opacity={0.9} rx={0.3} />
            <rect x={x} y={CH + VH - vh} width={cw} height={vh} fill={c.bull ? `${T.bull}20` : `${T.bear}20`} rx={0.3} />
          </g>
        );
      })}
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SPARK LINE
// ─────────────────────────────────────────────────────────────────────────────
function Spark({ prices = [], color = T.bull, w = 120, h = 40 }) {
  if (prices.length < 2) return <div style={{ width: w, height: h }} />;
  const mn = Math.min(...prices), mx = Math.max(...prices), rng = mx - mn || 1;
  const step = w / (prices.length - 1);
  const pts = prices.map((p, i) => `${i * step},${h - 2 - ((p - mn) / rng) * (h - 4)}`).join(" ");
  const fill = pts + ` ${(prices.length - 1) * step},${h} 0,${h}`;
  const gid = `sg${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} style={{ display: "block", flexShrink: 0 }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fill} fill={`url(#${gid})`} />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.6} opacity={0.95} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SESSION CLOCK
// ─────────────────────────────────────────────────────────────────────────────
function SessionClock({ time }) {
  const sz = 154, cx = sz / 2, cy = sz / 2, R = 52, R2 = 65;
  const h = utcH(time);
  const ang = hr => ((hr / 24) * 360 - 90) * Math.PI / 180;
  const pt = (hr, r) => [cx + Math.cos(ang(hr)) * r, cy + Math.sin(ang(hr)) * r];
  const arcPath = (s, e, r) => {
    const [sx, sy] = pt(s, r), [ex, ey] = pt(e, r);
    const large = (e - s + 24) % 24 > 12 ? 1 : 0;
    return `M${cx},${cy} L${sx},${sy} A${r},${r} 0 ${large},1 ${ex},${ey} Z`;
  };
  const [hx, hy] = pt(h, R + 15);
  return (
    <svg width={sz} height={sz} style={{ flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={R2 + 4} fill="none" stroke={T.brd1} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={R2} fill="none" stroke={T.brd0} strokeWidth={0.5} />
      {Array.from({ length: 24 }, (_, i) => { const [x1, y1] = pt(i, R2 - 2), [x2, y2] = pt(i, R2 + 2); return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke={T.brd2} strokeWidth={0.7} />; })}
      {[0, 6, 12, 18].map(hr => { const [x, y] = pt(hr, R2 + 12); return <text key={hr} x={x} y={y} fill={T.txtDim} fontSize={7} textAnchor="middle" dominantBaseline="middle" fontFamily="monospace">{p2(hr)}</text>; })}
      {SESSIONS.map(s => <path key={s.name} d={arcPath(s.open, s.close, R2)} fill={s.col} opacity={0.14} />)}
      {KILLZONES.map(k => <path key={k.name} d={arcPath(k.s, k.e, R - 8)} fill={k.col} opacity={0.38} />)}
      <circle cx={cx} cy={cy} r={R} fill={T.bg0} stroke={T.brd1} strokeWidth={0.5} />
      <line x1={cx} y1={cy} x2={hx} y2={hy} stroke={T.gold} strokeWidth={1.8} strokeLinecap="round" />
      <circle cx={hx} cy={hy} r={3.5} fill={T.gold} />
      <circle cx={cx} cy={cy} r={3} fill={T.goldD} />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FIBONACCI TOOL
// ─────────────────────────────────────────────────────────────────────────────
function FibTool() {
  const [hi, setHi] = useState("68400");
  const [lo, setLo] = useState("58200");
  const [dir, setDir] = useState("bull");
  const H = parseFloat(hi) || 0, L = parseFloat(lo) || 0, rng = H - L;
  const levels = [
    { r: 0,     label: "0.000 — Swing Base" },
    { r: 0.236, label: "0.236" },
    { r: 0.382, label: "0.382" },
    { r: 0.5,   label: "0.500 — Equilibrium" },
    { r: 0.618, label: "0.618 ⚡ OTE Open",  ote: true },
    { r: 0.705, label: "0.705 ⚡ Deep OTE",  ote: true },
    { r: 0.786, label: "0.786 ⚡ OTE Close", ote: true },
    { r: 1,     label: "1.000 — Swing Extreme" },
    { r: 1.272, label: "1.272 — Extension" },
    { r: 1.618, label: "1.618 — Extension" },
  ].map(lv => ({ ...lv, price: dir === "bull" ? L + rng * (1 - lv.r) : H - rng * (1 - lv.r) }));

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
        {[["Swing High", hi, setHi], ["Swing Low", lo, setLo]].map(([l, v, s]) => (
          <div key={l} style={{ flex: 1, minWidth: 80 }}>
            <div style={{ fontSize: 8, color: T.txtDim, marginBottom: 4, letterSpacing: 1.5 }}>{l.toUpperCase()}</div>
            <input value={v} onChange={e => s(e.target.value)} style={INP} />
          </div>
        ))}
        <div style={{ minWidth: 90 }}>
          <div style={{ fontSize: 8, color: T.txtDim, marginBottom: 4, letterSpacing: 1.5 }}>DIRECTION</div>
          <select value={dir} onChange={e => setDir(e.target.value)} style={{ ...INP, cursor: "pointer" }}>
            <option value="bull">Bullish</option>
            <option value="bear">Bearish</option>
          </select>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {levels.map(({ r, label, price, ote }) => (
          <div key={r} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "5px 11px", borderRadius: 5, background: ote ? `${T.goldDim}80` : T.bg3, border: `1px solid ${ote ? T.goldD : T.brd0}` }}>
            <span style={{ fontSize: 10, color: ote ? T.goldL : T.txtSub, fontWeight: ote ? 700 : 400 }}>{label}</span>
            <span style={{ fontSize: 11, fontFamily: "monospace", color: ote ? T.gold : T.txt }}>${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
      <div style={{ marginTop: 10, padding: "9px 12px", background: T.goldDim, border: `1px solid ${T.goldD}50`, borderRadius: 6, fontSize: 9, color: T.txtSub, lineHeight: 1.75 }}>
        ⚡ <span style={{ color: T.gold }}>OTE Zone 0.618–0.786</span> — Enter on LTF displacement candle after confirmed BOS. Combine with OB or FVG for A+ confluence.
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// POSITION SIZER
// ─────────────────────────────────────────────────────────────────────────────
function PosSizer() {
  const [bal,  setBal]  = useState("10000");
  const [rp,   setRp]   = useState("1");
  const [entr, setEntr] = useState("68400");
  const [sl,   setSl]   = useState("67800");
  const [tp,   setTp]   = useState("70000");
  const B = parseFloat(bal) || 0, R = parseFloat(rp) || 0;
  const E = parseFloat(entr) || 0, S = parseFloat(sl) || 0, TP = parseFloat(tp) || 0;
  const riskUSD = B * (R / 100);
  const slD = Math.abs(E - S), tpD = Math.abs(TP - E);
  const size   = slD > 0 ? (riskUSD / slD).toFixed(6) : "—";
  const rr     = slD > 0 ? (tpD / slD).toFixed(2) : "—";
  const profit = slD > 0 ? (parseFloat(size) * tpD).toFixed(2) : "—";
  const rrN    = parseFloat(rr);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {[["Account ($)", bal, setBal], ["Risk %", rp, setRp], ["Entry", entr, setEntr], ["Stop Loss", sl, setSl], ["Take Profit", tp, setTp]].map(([l, v, s]) => (
          <div key={l}>
            <div style={{ fontSize: 8, color: T.txtDim, marginBottom: 4, letterSpacing: 1.5 }}>{l.toUpperCase()}</div>
            <input value={v} onChange={e => s(e.target.value)} style={INP} />
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
        {[["Risk $", `$${riskUSD.toFixed(2)}`, T.bear], ["Size", size, T.blue], ["R:R", `${rr}R`, !isNaN(rrN) && rrN >= 2 ? T.bull : T.gold], ["Profit", `$${profit}`, T.bull], ["SL Dist", `$${slD.toFixed(2)}`, T.txtSub], ["TP Dist", `$${tpD.toFixed(2)}`, T.txtSub]].map(([l, v, c]) => (
          <div key={l} style={{ background: T.bg0, border: `1px solid ${T.brd0}`, borderRadius: 6, padding: "10px 12px", textAlign: "center" }}>
            <div style={{ fontSize: 8, color: T.txtDim, letterSpacing: 1.5, marginBottom: 5 }}>{l.toUpperCase()}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: c, fontFamily: "monospace" }}>{v}</div>
          </div>
        ))}
      </div>
      {!isNaN(rrN) && rrN > 0 && rrN < 2 && (
        <div style={{ marginTop: 10, padding: "8px 12px", background: `${T.bear}10`, border: `1px solid ${T.bear}30`, borderRadius: 6, fontSize: 9, color: T.bear }}>
          ⚠ R:R below 2:1 — ICT minimum is 2R. Widen TP or tighten SL before entry.
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ROOT APP
// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [now,    setNow]    = useState(new Date());
  const [tab,    setTab]    = useState("Dashboard");
  const [ws,     setWs]     = useState("connecting");
  const [active, setActive] = useState("BTCUSDT");
  const [flash,  setFlash]  = useState("");

  const [prices,  setPrices]  = useState(() => Object.fromEntries(PAIRS.map(p => [p.sym, { price: SEED[p.sym], prev: SEED[p.sym], chg: 0, vol: 0, hi: SEED[p.sym] * 1.02, lo: SEED[p.sym] * 0.98 }])));
  const [candles, setCandles] = useState(() => Object.fromEntries(PAIRS.map(p => [p.sym, makeCandles(SEED[p.sym])])));
  const [biases,  setBiases]  = useState(() => Object.fromEntries(PAIRS.map(p => [p.sym, "NEUTRAL"])));
  const [setupM,  setSetupM]  = useState(() => Object.fromEntries(PAIRS.map(p => [p.sym, ""])));
  const [tfM,     setTfM]     = useState(() => Object.fromEntries(PAIRS.map(p => [p.sym, "4H"])));
  const [noteM,   setNoteM]   = useState(() => Object.fromEntries(PAIRS.map(p => [p.sym, ""])));
  const [journal, setJournal] = useState([]);
  const [jText,   setJText]   = useState("");
  const [jPair,   setJPair]   = useState("BTCUSDT");
  const [trades]              = useState(makeTrades);

  // Clock
  useEffect(() => { const t = setInterval(() => setNow(new Date()), 1000); return () => clearInterval(t); }, []);

  // Binance WebSocket — live prices
  useEffect(() => {
    const streams = PAIRS.map(p => `${p.sym.toLowerCase()}@ticker`).join("/");
    let sock;
    try {
      sock = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);
      sock.onopen  = () => setWs("live");
      sock.onerror = () => setWs("error");
      sock.onclose = () => setWs("disconnected");
      sock.onmessage = e => {
        try {
          const { data: d } = JSON.parse(e.data);
          const sym = d.s;
          if (!PAIRS.find(p => p.sym === sym)) return;
          const price = parseFloat(d.c);
          setPrices(prev => ({ ...prev, [sym]: { price, prev: prev[sym]?.price || price, chg: parseFloat(d.P), vol: parseFloat(d.q), hi: parseFloat(d.h), lo: parseFloat(d.l) } }));
          setCandles(prev => {
            const arr = prev[sym]; if (!arr?.length) return prev;
            const last = { ...arr[arr.length - 1] };
            last.c = price; last.h = Math.max(last.h, price); last.l = Math.min(last.l, price); last.bull = price >= last.o;
            return { ...prev, [sym]: [...arr.slice(0, -1), last] };
          });
        } catch (_) {}
      };
    } catch (_) { setWs("error"); }

    const barTimer = setInterval(() => {
      setCandles(prev => {
        const next = {};
        for (const sym of Object.keys(prev)) {
          const arr = prev[sym]; if (!arr.length) { next[sym] = arr; continue; }
          const last = arr[arr.length - 1];
          next[sym] = [...arr.slice(-99), { o: last.c, h: last.c, l: last.c, c: last.c, bull: true, vol: 0 }];
        }
        return next;
      });
    }, 60000);

    return () => { sock?.close(); clearInterval(barTimer); };
  }, []);

  const showFlash = useCallback(msg => { setFlash(msg); setTimeout(() => setFlash(""), 2500); }, []);

  const saveNote = sym => {
    if (!noteM[sym]?.trim()) return;
    setJournal(p => [{ id: Date.now(), pair: PAIRS.find(x => x.sym === sym)?.label, bias: biases[sym], setup: setupM[sym], tf: tfM[sym], text: noteM[sym], ts: new Date().toLocaleString() }, ...p]);
    setNoteM(p => ({ ...p, [sym]: "" }));
    showFlash("✦ Note saved to journal");
  };

  const saveJournal = () => {
    if (!jText.trim()) return;
    setJournal(p => [{ id: Date.now(), pair: PAIRS.find(x => x.sym === jPair)?.label, bias: biases[jPair], setup: setupM[jPair], tf: tfM[jPair], text: jText, ts: new Date().toLocaleString() }, ...p]);
    setJText(""); showFlash("✦ Journal entry saved");
  };

  const h = utcH(now), sess = getSess(h), kz = getKZ(h);
  const pair = PAIRS.find(p => p.sym === active), pd = prices[active], cs = candles[active] || [];
  const wins = trades.filter(t => t.result === "WIN"), totalPnl = trades.reduce((s, t) => s + t.pnl, 0);
  const TABS = ["Dashboard", "Market Watch", "Bias Matrix", "Tools", "Journal", "Education"];
  const wsCol = ws === "live" ? T.bull : ws === "connecting" ? T.gold : T.bear;

  return (
    <div style={{ fontFamily: "'IBM Plex Mono','Fira Code','Courier New',monospace", background: T.bg1, minHeight: "100vh", color: T.txt, display: "flex", flexDirection: "column", fontSize: 12 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;600;700&display=swap');
        @keyframes mpulse { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes mfade  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: ${T.bg0}; }
        ::-webkit-scrollbar-thumb { background: ${T.brd2}; border-radius: 2px; }
        select option { background: ${T.bg2}; }
        button { cursor: pointer; font-family: inherit; }
        input, select, textarea { font-family: inherit; }
        textarea { resize: vertical; }
        .qhov:hover { opacity: .75; transition: opacity .15s; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{ background: T.bg0, borderBottom: `1px solid ${T.brd1}`, height: 54, display: "flex", alignItems: "center", padding: "0 18px", flexShrink: 0, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 11, marginRight: 22, flexShrink: 0 }}>
          <svg width={32} height={32} viewBox="0 0 32 32">
            <rect width={32} height={32} rx={6} fill={T.bg3} />
            <polygon points="16,4 28,26 4,26" fill="none" stroke={T.gold} strokeWidth={1.6} />
            <polygon points="16,9 24,23 8,23" fill={T.gold} opacity={0.12} />
            <line x1={16} y1={4} x2={16} y2={26} stroke={T.goldD} strokeWidth={0.8} opacity={0.5} />
            <circle cx={16} cy={16} r={2.2} fill={T.gold} />
          </svg>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.gold, letterSpacing: 3, lineHeight: 1 }}>QUENTREXCLAW</div>
            <div style={{ fontSize: 7.5, color: T.txtDim, letterSpacing: 2 }}>ICT/SMC CRYPTO TERMINAL  v5.1</div>
          </div>
        </div>
        <div style={{ width: 1, height: 28, background: `linear-gradient(to bottom,transparent,${T.goldD},transparent)`, marginRight: 18 }} />
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} className="qhov" style={{ background: "none", border: "none", color: tab === t ? T.gold : T.txtDim, padding: "0 13px", height: 54, fontSize: 9, fontWeight: tab === t ? 700 : 400, letterSpacing: 1.8, textTransform: "uppercase", borderBottom: tab === t ? `2px solid ${T.gold}` : "2px solid transparent", transition: "color .15s, border-color .15s" }}>{t}</button>
        ))}
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 12 }}>
          {sess && <Chip color={sess.col}>{sess.name}</Chip>}
          {kz   && <Chip color={kz.col} pulse>{kz.name}</Chip>}
          <span style={{ fontSize: 13, fontFamily: "monospace", color: T.txtSub, letterSpacing: 1 }}>{fUTC(now)}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 8, letterSpacing: 1.5, color: wsCol }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: wsCol, display: "inline-block", animation: ws === "live" ? "mpulse 2s ease-in-out infinite" : undefined }} />
            {ws.toUpperCase()}
          </div>
        </div>
      </nav>

      {flash && <div style={{ background: T.goldDim, borderBottom: `1px solid ${T.goldD}50`, color: T.gold, textAlign: "center", padding: "6px", fontSize: 9, letterSpacing: 2, animation: "mfade .3s ease" }}>{flash}</div>}

      {/* ── CONTENT ── */}
      <main style={{ flex: 1, overflow: "auto", padding: 16 }}>

        {/* ══ DASHBOARD ══ */}
        {tab === "Dashboard" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "mfade .35s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(138px,1fr))", gap: 10 }}>
              <KPI label="Win Rate"    value={`${((wins.length / trades.length) * 100).toFixed(0)}%`}   color={T.bull}  sub={`${wins.length} / ${trades.length} trades`} />
              <KPI label="Net P&L"    value={`$${totalPnl.toFixed(0)}`}                                 color={totalPnl >= 0 ? T.bull : T.bear} sub="Demo session" />
              <KPI label="Avg R:R"    value={`${(wins.reduce((s, t) => s + parseFloat(t.rr), 0) / (wins.length || 1)).toFixed(1)}R`} color={T.gold} sub="Winners only" />
              <KPI label="Session"    value={sess?.name || "Closed"}                                    color={sess?.col || T.txtDim} sub={kz ? kz.name + " ⚡" : "No killzone"} />
              <KPI label={`${pair?.base} Live`} value={pd?.price ? `$${fNum(pd.price, pair?.dec || 2)}` : "—"} color={(pd?.chg || 0) >= 0 ? T.bull : T.bear} sub={`${(pd?.chg || 0) >= 0 ? "+" : ""}${(pd?.chg || 0).toFixed(2)}% 24h`} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 310px", gap: 14 }}>
              <Panel>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <GoldRule label="Live Chart" />
                    <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 20, fontWeight: 700, color: T.txt }}>{pair?.label}</span>
                      <span style={{ fontSize: 16, fontFamily: "monospace", color: (pd?.price || 0) >= (pd?.prev || 0) ? T.bull : T.bear }}>${fNum(pd?.price || 0, pair?.dec || 2)}</span>
                      <Chip color={(pd?.chg || 0) >= 0 ? T.bull : T.bear} xs>{(pd?.chg || 0) >= 0 ? "▲" : "▼"} {Math.abs(pd?.chg || 0).toFixed(2)}%</Chip>
                    </div>
                    <div style={{ fontSize: 9, color: T.txtDim, marginTop: 5 }}>H24: ${fNum(pd?.hi || 0, pair?.dec || 2)} · L24: ${fNum(pd?.lo || 0, pair?.dec || 2)} · Vol: ${fK(pd?.vol || 0)}</div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 4, justifyContent: "flex-end", maxWidth: 320 }}>
                    {PAIRS.map(p => (
                      <button key={p.sym} onClick={() => setActive(p.sym)} className="qhov" style={{ background: active === p.sym ? `${p.col}18` : T.bg3, color: active === p.sym ? p.col : T.txtDim, border: `1px solid ${active === p.sym ? p.col + "45" : T.brd0}`, borderRadius: 5, padding: "3px 8px", fontSize: 9 }}>{p.base}</button>
                    ))}
                  </div>
                </div>
                <CandleChart candles={cs} height={210} />
                <div style={{ display: "flex", gap: 6, marginTop: 9, flexWrap: "wrap" }}>
                  <Chip color={BIAS_COL[biases[active]]} xs>Bias: {biases[active]}</Chip>
                  {setupM[active] && <Chip color={T.blue} xs>{setupM[active]}</Chip>}
                  <Chip color={T.txtDim} xs>{tfM[active]}</Chip>
                </div>
              </Panel>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <Panel>
                  <GoldRule label="Session Clock" />
                  <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                    <SessionClock time={now} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 22, fontWeight: 700, color: T.gold, fontFamily: "monospace", letterSpacing: 1.5, lineHeight: 1 }}>{fUTC(now)}</div>
                      <div style={{ fontSize: 8, color: T.txtDim, marginBottom: 11, marginTop: 3 }}>{fDate(now)} UTC</div>
                      {SESSIONS.map(s => (<div key={s.name} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}><span style={{ fontSize: 9, color: s.col, fontWeight: 700 }}>{s.name}</span><span style={{ fontSize: 9, color: T.txtDim }}>{p2(s.open)}:00–{p2(s.close)}:00</span></div>))}
                      <div style={{ marginTop: 9 }}>{kz ? <Chip color={kz.col} pulse xs>{kz.name} ACTIVE</Chip> : <span style={{ fontSize: 8, color: T.txtDim }}>No killzone active</span>}</div>
                    </div>
                  </div>
                </Panel>

                <Panel>
                  <GoldRule label="Killzone Timers" />
                  {KILLZONES.map(kz => {
                    const a = h >= kz.s && h < kz.e, next = h < kz.s ? kz.s : kz.s + 24, diff = ((next - h) + 24) % 24;
                    const hh = Math.floor(diff), mm = Math.floor((diff % 1) * 60), ss = Math.floor(((diff % 1) * 60 % 1) * 60);
                    return (
                      <div key={kz.name} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", marginBottom: 6, borderRadius: 6, background: a ? `${kz.col}0C` : T.bg3, border: `1px solid ${a ? kz.col + "40" : T.brd0}` }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 700, color: kz.col }}>{kz.name}</div>
                          <div style={{ fontSize: 8, color: T.txtDim }}>{p2(kz.s)}:00–{p2(kz.e)}:00 UTC</div>
                        </div>
                        {a ? <Chip color={kz.col} pulse xs>LIVE</Chip> : <span style={{ fontSize: 12, fontFamily: "monospace", color: T.txtSub }}>{p2(hh)}:{p2(mm)}:{p2(ss)}</span>}
                      </div>
                    );
                  })}
                </Panel>
              </div>
            </div>

            <Panel>
              <GoldRule label="Recent Trades (Demo)" />
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead><tr style={{ borderBottom: `1px solid ${T.brd1}` }}>{["Date", "Pair", "Setup", "TF", "Result", "P&L", "R:R"].map(h => (<th key={h} style={{ textAlign: "left", padding: "5px 10px", fontSize: 8, color: T.txtDim, letterSpacing: 1.5, fontWeight: 400, textTransform: "uppercase" }}>{h}</th>))}</tr></thead>
                  <tbody>
                    {trades.slice(0, 10).map(t => (
                      <tr key={t.id} style={{ borderBottom: `1px solid ${T.bg0}` }}>
                        <td style={{ padding: "7px 10px", fontSize: 10, color: T.txtDim, whiteSpace: "nowrap" }}>{t.date}</td>
                        <td style={{ padding: "7px 10px", fontSize: 10, color: T.gold, fontWeight: 700, whiteSpace: "nowrap" }}>{t.pair}</td>
                        <td style={{ padding: "7px 10px", fontSize: 9, color: T.txtSub }}>{t.setup}</td>
                        <td style={{ padding: "7px 10px" }}><Chip xs color={T.txtDim}>{t.tf}</Chip></td>
                        <td style={{ padding: "7px 10px" }}><Chip xs color={t.result === "WIN" ? T.bull : T.bear}>{t.result}</Chip></td>
                        <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 11, fontWeight: 700, color: t.pnl > 0 ? T.bull : T.bear, whiteSpace: "nowrap" }}>{t.pnl > 0 ? "+" : ""}${t.pnl}</td>
                        <td style={{ padding: "7px 10px", fontFamily: "monospace", fontSize: 10, color: T.txt, whiteSpace: "nowrap" }}>{t.rr}R</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Panel>
          </div>
        )}

        {/* ══ MARKET WATCH ══ */}
        {tab === "Market Watch" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12, animation: "mfade .35s ease" }}>
            {PAIRS.map(p => {
              const lpd = prices[p.sym], lcs = candles[p.sym] || [], spark = lcs.slice(-30).map(c => c.c), bull = (lpd?.chg || 0) >= 0;
              return (
                <div key={p.sym} onClick={() => { setActive(p.sym); setTab("Dashboard"); }}
                  style={{ background: T.bg2, border: `1px solid ${active === p.sym ? T.gold + "50" : T.brd0}`, borderRadius: 10, padding: 16, cursor: "pointer", transition: "all .2s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = T.goldD; e.currentTarget.style.background = T.bgHov; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = active === p.sym ? T.gold + "50" : T.brd0; e.currentTarget.style.background = T.bg2; }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 9, height: 9, borderRadius: "50%", background: p.col, boxShadow: `0 0 8px ${p.col}88` }} />
                      <div><div style={{ fontWeight: 700, fontSize: 13, color: T.txt }}>{p.label}</div><div style={{ fontSize: 8, color: T.txtDim }}>Vol: ${fK(lpd?.vol || 0)}</div></div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: bull ? T.bull : T.bear }}>${fNum(lpd?.price || 0, p.dec)}</div>
                      <div style={{ fontSize: 9, color: bull ? T.bull : T.bear }}>{bull ? "▲" : "▼"} {Math.abs(lpd?.chg || 0).toFixed(2)}%</div>
                    </div>
                  </div>
                  <Spark prices={spark} color={bull ? T.bull : T.bear} w={268} h={44} />
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 9, fontSize: 8, color: T.txtDim }}>
                    <span>H ${fNum(lpd?.hi || 0, p.dec)}</span>
                    <span>L ${fNum(lpd?.lo || 0, p.dec)}</span>
                    <Chip xs color={BIAS_COL[biases[p.sym]]}>{biases[p.sym]}</Chip>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ══ BIAS MATRIX ══ */}
        {tab === "Bias Matrix" && (
          <div style={{ animation: "mfade .35s ease" }}>
            <div style={{ marginBottom: 14, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
              <span style={{ fontSize: 9, color: T.txtDim, letterSpacing: 2 }}>HTF BIAS · TIMEFRAME · SETUP · NOTES PER PAIR</span>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>{BIASES.map(b => <Chip key={b} color={BIAS_COL[b]}>{b}</Chip>)}</div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(285px,1fr))", gap: 12 }}>
              {PAIRS.map(p => {
                const lpd = prices[p.sym], bias = biases[p.sym], bc = BIAS_COL[bias];
                return (
                  <Panel key={p.sym} style={{ border: `1px solid ${bc}20` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 11 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 7 }}><div style={{ width: 7, height: 7, borderRadius: "50%", background: p.col }} /><span style={{ fontWeight: 700, fontSize: 12, color: T.txt }}>{p.label}</span></div>
                      <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, fontFamily: "monospace", color: (lpd?.chg || 0) >= 0 ? T.bull : T.bear }}>${fNum(lpd?.price || 0, p.dec)}</div><div style={{ fontSize: 8, color: T.txtDim }}>{(lpd?.chg || 0).toFixed(2)}%</div></div>
                    </div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 7 }}>
                      {BIASES.map(b => (<button key={b} onClick={() => setBiases(pv => ({ ...pv, [p.sym]: b }))} style={{ flex: 1, padding: "5px 0", fontSize: 8, fontWeight: 700, letterSpacing: 0.5, background: bias === b ? `${BIAS_COL[b]}20` : T.bg3, color: bias === b ? BIAS_COL[b] : T.txtDim, border: `1px solid ${bias === b ? BIAS_COL[b] + "55" : T.brd0}`, borderRadius: 4 }}>{b}</button>))}
                    </div>
                    <div style={{ display: "flex", gap: 3, marginBottom: 7 }}>
                      {TIMEFRAMES.map(tf => (<button key={tf} onClick={() => setTfM(pv => ({ ...pv, [p.sym]: tf }))} style={{ flex: 1, padding: "4px 0", fontSize: 8, background: tfM[p.sym] === tf ? `${T.goldDim}90` : T.bg3, color: tfM[p.sym] === tf ? T.gold : T.txtDim, border: `1px solid ${tfM[p.sym] === tf ? T.goldD : T.brd0}`, borderRadius: 4 }}>{tf}</button>))}
                    </div>
                    <select value={setupM[p.sym]} onChange={e => setSetupM(pv => ({ ...pv, [p.sym]: e.target.value }))} style={{ ...INP, fontSize: 9, marginBottom: 7 }}>
                      <option value="">— Select ICT Setup —</option>
                      {SETUPS.map(s => <option key={s}>{s}</option>)}
                    </select>
                    <div style={{ display: "flex", gap: 6 }}>
                      <input placeholder="Quick note… (Enter ↵)" value={noteM[p.sym]} onChange={e => setNoteM(pv => ({ ...pv, [p.sym]: e.target.value }))} onKeyDown={e => e.key === "Enter" && saveNote(p.sym)} style={{ ...INP, flex: 1, fontSize: 9 }} />
                      <button onClick={() => saveNote(p.sym)} style={{ background: `${T.gold}18`, color: T.gold, border: `1px solid ${T.goldD}55`, borderRadius: 5, padding: "0 11px", fontSize: 13 }}>↵</button>
                    </div>
                  </Panel>
                );
              })}
            </div>
          </div>
        )}

        {/* ══ TOOLS ══ */}
        {tab === "Tools" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14, animation: "mfade .35s ease" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Panel><GoldRule label="OTE Fibonacci Calculator" /><FibTool /></Panel>
              <Panel><GoldRule label="Position Size Calculator" /><PosSizer /></Panel>
            </div>
            <Panel>
              <GoldRule label="Killzone Dashboard (UTC)" />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))", gap: 12 }}>
                {KILLZONES.map(kz => {
                  const isA = h >= kz.s && h < kz.e, next = h < kz.s ? kz.s : kz.s + 24, diff = ((next - h) + 24) % 24;
                  const hh = Math.floor(diff), mm = Math.floor((diff % 1) * 60), ss = Math.floor(((diff % 1) * 60 % 1) * 60);
                  return (
                    <div key={kz.name} style={{ background: isA ? `${kz.col}08` : T.bg3, border: `1px solid ${isA ? kz.col + "45" : T.brd0}`, borderRadius: 8, padding: 18 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: kz.col, marginBottom: 4 }}>{kz.name}</div>
                      <div style={{ fontSize: 9, color: T.txtDim, marginBottom: 12 }}>{p2(kz.s)}:00 – {p2(kz.e)}:00 UTC</div>
                      {isA ? <Chip color={kz.col} pulse>ACTIVE NOW</Chip> : <><div style={{ fontSize: 24, fontFamily: "monospace", color: T.txt, letterSpacing: 2, lineHeight: 1 }}>{p2(hh)}:{p2(mm)}:{p2(ss)}</div><div style={{ fontSize: 8, color: T.txtDim, marginTop: 5, letterSpacing: 1 }}>UNTIL OPEN</div></>}
                    </div>
                  );
                })}
              </div>
            </Panel>
          </div>
        )}

        {/* ══ JOURNAL ══ */}
        {tab === "Journal" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 14, animation: "mfade .35s ease" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <Panel>
                <GoldRule label="New Journal Entry" />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                  <div><div style={{ fontSize: 8, color: T.txtDim, marginBottom: 4, letterSpacing: 1.5 }}>PAIR</div><select value={jPair} onChange={e => setJPair(e.target.value)} style={INP}>{PAIRS.map(p => <option key={p.sym} value={p.sym}>{p.label}</option>)}</select></div>
                  <div><div style={{ fontSize: 8, color: T.txtDim, marginBottom: 4, letterSpacing: 1.5 }}>ACTIVE BIAS</div><div style={{ padding: "7px 10px", background: T.bg0, border: `1px solid ${T.brd0}`, borderRadius: 5, display: "flex", gap: 6 }}><Chip color={BIAS_COL[biases[jPair]]} xs>{biases[jPair]}</Chip>{setupM[jPair] && <Chip color={T.txtSub} xs>{setupM[jPair].substring(0, 22)}</Chip>}</div></div>
                </div>
                <textarea value={jText} onChange={e => setJText(e.target.value)} placeholder="HTF bias, LTF entry, setup rationale, mistakes, lessons…" rows={5} style={{ ...INP, lineHeight: 1.8 }} />
                <button onClick={saveJournal} style={{ marginTop: 10, background: `${T.gold}18`, color: T.gold, border: `1px solid ${T.goldD}55`, borderRadius: 6, padding: "8px 20px", fontSize: 9, fontWeight: 700, letterSpacing: 2 }}>SAVE ENTRY ↵</button>
              </Panel>
              {journal.length === 0
                ? <Panel style={{ textAlign: "center", color: T.txtDim, fontSize: 10, padding: 44, lineHeight: 2.2 }}>No entries yet.<br />Save a note from Bias Matrix or write above.</Panel>
                : journal.map((e, i) => (
                  <Panel key={e.id} style={{ animation: `mfade ${0.1 + i * 0.03}s ease` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}><Chip color={T.gold} xs>{e.pair}</Chip><Chip color={BIAS_COL[e.bias] || T.txtDim} xs>{e.bias}</Chip>{e.setup && <Chip color={T.txtSub} xs>{e.setup.substring(0, 24)}</Chip>}{e.tf && <Chip color={T.txtDim} xs>{e.tf}</Chip>}</div>
                      <span style={{ fontSize: 8, color: T.txtDim }}>{e.ts}</span>
                    </div>
                    <p style={{ fontSize: 11, color: T.txt, lineHeight: 1.9, margin: 0 }}>{e.text}</p>
                  </Panel>
                ))
              }
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <Panel>
                <GoldRule label="Performance" />
                {[["Total Trades", trades.length], ["Wins", wins.length], ["Losses", trades.length - wins.length], ["Win Rate", `${((wins.length / trades.length) * 100).toFixed(1)}%`], ["Net P&L", `$${totalPnl.toFixed(2)}`], ["Avg Win", `$${(wins.reduce((s, t) => s + t.pnl, 0) / (wins.length || 1)).toFixed(2)}`], ["Best R:R", `${Math.max(...wins.map(t => parseFloat(t.rr) || 0)).toFixed(1)}R`]].map(([l, v]) => (
                  <div key={l} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.brd0}` }}><span style={{ fontSize: 10, color: T.txtSub }}>{l}</span><span style={{ fontSize: 10, fontWeight: 700, fontFamily: "monospace", color: T.txt }}>{v}</span></div>
                ))}
              </Panel>
              <Panel style={{ maxHeight: 440, overflowY: "auto" }}>
                <GoldRule label="All Trades" />
                {trades.map(t => (
                  <div key={t.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${T.bg0}` }}>
                    <div><div style={{ fontSize: 10, fontWeight: 700, color: T.gold }}>{t.pair}</div><div style={{ fontSize: 8, color: T.txtDim }}>{t.date} · {t.tf}</div></div>
                    <div style={{ textAlign: "right" }}><div style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: t.pnl > 0 ? T.bull : T.bear }}>{t.pnl > 0 ? "+" : ""}${t.pnl}</div><div style={{ fontSize: 8, color: T.txtDim }}>{t.rr}R</div></div>
                  </div>
                ))}
              </Panel>
            </div>
          </div>
        )}

        {/* ══ EDUCATION ══ */}
        {tab === "Education" && (
          <div style={{ animation: "mfade .35s ease" }}>
            <div style={{ marginBottom: 16, padding: "12px 18px", background: T.bg0, border: `1px solid ${T.goldD}40`, borderRadius: 8, fontSize: 10, color: T.txtSub, lineHeight: 1.9 }}>
              <span style={{ color: T.gold, fontWeight: 700 }}>ICT / Smart Money Concepts</span> — study order: <span style={{ color: T.txt }}>Structure → Liquidity → OBs → FVGs → OTE → Premium/Discount → Sessions → Risk</span>. Apply HTF for bias, LTF for entry.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(330px,1fr))", gap: 14 }}>
              {ICT_CARDS.map((c, i) => (
                <div key={c.title} style={{ background: T.bg2, border: `1px solid ${c.col}18`, borderRadius: 10, padding: 22, transition: "all .22s", animation: `mfade ${0.08 + i * 0.04}s ease` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = c.col + "45"; e.currentTarget.style.background = T.bgHov; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = c.col + "18"; e.currentTarget.style.background = T.bg2; }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 11 }}>
                    <span style={{ fontSize: 17, color: c.col, fontFamily: "monospace" }}>{c.icon}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: c.col, letterSpacing: 0.5 }}>{c.title}</span>
                    <span style={{ marginLeft: "auto", fontSize: 9, color: T.txtDim }}>0{i + 1}</span>
                  </div>
                  <div style={{ height: 1, background: `linear-gradient(to right,${c.col}30,transparent)`, marginBottom: 12 }} />
                  <p style={{ fontSize: 11, color: T.txt, lineHeight: 1.9, margin: 0, opacity: .88 }}>{c.body}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ── STATUS BAR ── */}
      <footer style={{ background: T.bg0, borderTop: `1px solid ${T.brd0}`, padding: "4px 18px", display: "flex", alignItems: "center", gap: 14, fontSize: 8, color: T.txtDim, letterSpacing: 0.8, flexShrink: 0 }}>
        <span style={{ color: wsCol }}>● {ws.toUpperCase()}</span>
        <span>Binance WebSocket</span>
        <span style={{ color: T.brd2 }}>|</span>
        <span>Session: <span style={{ color: sess?.col || T.txtDim }}>{sess?.name || "Closed"}</span></span>
        <span style={{ color: T.brd2 }}>|</span>
        <span>KZ: <span style={{ color: kz?.col || T.txtDim }}>{kz?.name || "—"}</span></span>
        <span style={{ color: T.brd2 }}>|</span>
        <span>{fUTC(now)} UTC</span>
        <span style={{ color: T.brd2 }}>|</span>
        <span>10 Pairs Active</span>
        <span style={{ marginLeft: "auto", color: T.goldD, letterSpacing: 1.5 }}>QUENTREXCLAW v5.1  —  ICT/SMC CRYPTO TERMINAL  —  MIDNIGHT PRO</span>
      </footer>
    </div>
  );
}
