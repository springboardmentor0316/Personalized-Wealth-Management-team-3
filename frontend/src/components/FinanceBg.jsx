import React from "react";

/**
 * FinanceBg — decorative SVG background illustration
 *
 * Usage: Place as the FIRST child inside any page wrapper div.
 * The parent must have `position: relative` and `overflow: hidden`.
 *
 * Example:
 *   <div style={{ position: "relative", minHeight: "100vh" }}>
 *     <FinanceBg />
 *     <YourPageContent />
 *   </div>
 *
 * For auth pages (Login, Register), it is already built into .auth-shell
 * via the SVG rendered inline — just import AuthFinanceBg instead.
 */

export function FinanceBg({ opacity = 1 }) {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        opacity,
      }}
      viewBox="0 0 1200 700"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <radialGradient id="fbGlow1" cx="75%" cy="20%" r="35%">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.12" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fbGlow2" cx="90%" cy="80%" r="30%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="1200" height="700" fill="url(#fbGlow1)" />
      <rect width="1200" height="700" fill="url(#fbGlow2)" />

      {/* Subtle grid */}
      <g stroke="rgba(79,70,229,0.06)" strokeWidth="0.5">
        {[100, 200, 300, 400, 500, 600].map((y) => (
          <line key={`h${y}`} x1="0" y1={y} x2="1200" y2={y} />
        ))}
        {[150, 300, 450, 600, 750, 900, 1050].map((x) => (
          <line key={`v${x}`} x1={x} y1="0" x2={x} y2="700" />
        ))}
      </g>

      {/* Rising stock chart line */}
      <polyline
        points="600,600 660,560 730,540 800,490 850,510 920,440 990,400 1060,350 1130,280 1200,230"
        fill="none"
        stroke="#818cf8"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.35"
      />
      {/* Area fill under chart */}
      <polyline
        points="600,600 660,560 730,540 800,490 850,510 920,440 990,400 1060,350 1130,280 1200,230 1200,700 600,700"
        fill="rgba(79,70,229,0.05)"
        stroke="none"
      />

      {/* Second line (cyan) */}
      <polyline
        points="700,640 790,610 880,580 960,540 1040,500 1120,450 1200,400"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.25"
      />

      {/* Candlestick bars */}
      <g opacity="0.18">
        {[
          { x: 610, y: 530, h: 40, up: true },
          { x: 635, y: 510, h: 35, up: true },
          { x: 660, y: 525, h: 30, up: false },
          { x: 685, y: 495, h: 38, up: true },
          { x: 710, y: 480, h: 32, up: true },
          { x: 735, y: 490, h: 28, up: false },
          { x: 760, y: 460, h: 36, up: true },
        ].map(({ x, y, h, up }, i) => (
          <g key={i}>
            <rect x={x} y={y} width="12" height={h} rx="1" fill={up ? "#34d399" : "#f87171"} />
            <line x1={x + 6} y1={y - 10} x2={x + 6} y2={y + h + 10} stroke={up ? "#34d399" : "#f87171"} strokeWidth="1" />
          </g>
        ))}
      </g>

      {/* Coin circles */}
      <circle cx="950" cy="120" r="50" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.2" />
      <circle cx="950" cy="120" r="38" fill="rgba(245,158,11,0.05)" stroke="#f59e0b" strokeWidth="0.5" opacity="0.25" />
      <text x="950" y="128" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="20" fontWeight="600" fill="#f59e0b" opacity="0.3">₹</text>

      <circle cx="1100" cy="580" r="36" fill="none" stroke="#818cf8" strokeWidth="1.2" opacity="0.2" />
      <circle cx="1100" cy="580" r="26" fill="rgba(129,140,248,0.05)" stroke="none" />
      <text x="1100" y="587" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="14" fontWeight="600" fill="#818cf8" opacity="0.25">₹</text>

      <circle cx="800" cy="620" r="22" fill="none" stroke="#06b6d4" strokeWidth="1" opacity="0.18" />

      {/* Donut chart */}
      <g transform="translate(1140, 100)" opacity="0.22">
        <circle cx="0" cy="0" r="42" fill="none" stroke="#1e2a4a" strokeWidth="10" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="#4f46e5" strokeWidth="10"
          strokeDasharray="78 188" strokeDashoffset="47" strokeLinecap="round" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="#06b6d4" strokeWidth="10"
          strokeDasharray="52 188" strokeDashoffset="-32" strokeLinecap="round" />
        <circle cx="0" cy="0" r="42" fill="none" stroke="#f59e0b" strokeWidth="10"
          strokeDasharray="38 188" strokeDashoffset="-84" strokeLinecap="round" />
      </g>

      {/* Mini bar chart */}
      <g opacity="0.15" transform="translate(620, 430)">
        {[45, 65, 35, 78, 55, 82, 60].map((h, i) => (
          <rect key={i} x={i * 18} y={-h} width="12" height={h} rx="2"
            fill={i % 2 === 0 ? "#818cf8" : "#06b6d4"} />
        ))}
      </g>

      {/* Growth arrow */}
      <g opacity="0.14" transform="translate(1050, 380)">
        <polygon points="0,50 20,0 40,50" fill="#34d399" />
        <rect x="8" y="50" width="24" height="36" rx="2" fill="#34d399" />
      </g>

      {/* Floating percentage badges */}
      <text x="990" y="390" fontFamily="DM Sans,sans-serif" fontSize="13" fill="#34d399" opacity="0.35" fontWeight="600">+12.4%</text>
      <text x="870" y="450" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#818cf8" opacity="0.28" fontWeight="500">+8.7%</text>
      <text x="1080" y="340" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#06b6d4" opacity="0.28" fontWeight="500">+5.2%</text>

      {/* Scattered dots */}
      {[
        [1020, 430, "#818cf8", 0.28],
        [940, 500, "#06b6d4", 0.22],
        [1110, 470, "#f59e0b", 0.18],
        [900, 580, "#818cf8", 0.18],
        [1170, 520, "#34d399", 0.2],
        [850, 160, "#818cf8", 0.15],
        [1030, 200, "#06b6d4", 0.15],
      ].map(([cx, cy, fill, opacity], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill={fill} opacity={opacity} />
      ))}
    </svg>
  );
}

/**
 * AuthFinanceBg — lighter version for auth pages (Login, Register).
 * The auth-shell already has a dark gradient from background.css;
 * this adds the SVG illustration layer on top.
 */
export function AuthFinanceBg() {
  return (
    <svg
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 1,
      }}
      viewBox="0 0 900 600"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Grid */}
      <g stroke="rgba(255,255,255,0.04)" strokeWidth="0.5">
        {[75, 150, 225, 300, 375, 450, 525].map((y) => (
          <line key={y} x1="0" y1={y} x2="900" y2={y} />
        ))}
        {[112, 225, 337, 450, 562, 675, 787].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="600" />
        ))}
      </g>

      {/* Chart line */}
      <polyline
        points="0,500 100,460 200,440 300,390 380,410 460,340 540,290 620,240 700,180 800,130 900,90"
        fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"
      />
      <polyline
        points="0,500 100,460 200,440 300,390 380,410 460,340 540,290 620,240 700,180 800,130 900,90 900,600 0,600"
        fill="rgba(79,70,229,0.07)" stroke="none"
      />

      {/* Coin */}
      <circle cx="760" cy="100" r="44" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.28" />
      <text x="760" y="108" textAnchor="middle" fontFamily="DM Sans,sans-serif" fontSize="18" fontWeight="600" fill="#f59e0b" opacity="0.35">₹</text>

      {/* Donut */}
      <g transform="translate(120, 120)" opacity="0.2">
        <circle cx="0" cy="0" r="36" fill="none" stroke="#1e2a4a" strokeWidth="8" />
        <circle cx="0" cy="0" r="36" fill="none" stroke="#4f46e5" strokeWidth="8"
          strokeDasharray="65 160" strokeDashoffset="40" strokeLinecap="round" />
        <circle cx="0" cy="0" r="36" fill="none" stroke="#06b6d4" strokeWidth="8"
          strokeDasharray="44 160" strokeDashoffset="-28" strokeLinecap="round" />
      </g>

      {/* Scattered dots */}
      {[[200, 480, "#818cf8"], [600, 520, "#06b6d4"], [820, 480, "#f59e0b"], [450, 150, "#34d399"]].map(([cx, cy, fill], i) => (
        <circle key={i} cx={cx} cy={cy} r="3" fill={fill} opacity="0.22" />
      ))}

      <text x="640" y="230" fontFamily="DM Sans,sans-serif" fontSize="11" fill="#34d399" opacity="0.4" fontWeight="600">+12.4%</text>
      <text x="730" y="175" fontFamily="DM Sans,sans-serif" fontSize="10" fill="#818cf8" opacity="0.3" fontWeight="500">+8.7%</text>
    </svg>
  );
}

export default FinanceBg;
