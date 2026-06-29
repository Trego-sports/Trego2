export const C = {
  paper: "#ECE5DA",
  paper2: "#FFF8EC",
  ink: "#17243B",
  dark: "#101B2E",
  orange: "#E8791F",
  orange2: "#FFF1E3",
  green: "#0B8F68",
  blue: "#2D6CDF",
  muted: "#596373",
  border: "#D8CDBD",
  white: "#FFFFFF",
  cream: "#F8F2E9",
  red: "#A8432D",
};

export const ASSETS = {
  logo: "/Users/raghavbhasin/Trego2/outputs/manual-20260615-trego-midterm/presentations/trego-midterm/assets/trego-asset-1.png",
  community: "/Users/raghavbhasin/Trego2/outputs/manual-20260615-trego-midterm/presentations/trego-midterm/assets/trego-community-image.png",
};

export const FONT = {
  display: "Avenir Next",
  body: "Avenir Next",
  fallback: "Arial",
};

export function bg(slide, dark = false) {
  slide.background.fill = { type: "solid", color: dark ? C.dark : C.paper };
}

export function shape(slide, frame, opts = {}) {
  return slide.shapes.add({
    geometry: opts.geometry || "rect",
    position: frame,
    fill: opts.fill || { type: "none" },
    line: opts.line || { style: "solid", fill: opts.lineColor || C.border, width: opts.lineWidth ?? 0 },
  });
}

export function text(slide, value, frame, style = {}) {
  const fill = style.fill ? { type: "solid", color: style.fill } : { type: "none" };
  const s = shape(slide, frame, {
    geometry: style.geometry || "rect",
    fill,
    line: { style: "solid", fill: style.lineColor || style.fill || C.paper, width: style.lineWidth ?? 0 },
  });
  s.text.style = {
    fontSize: style.size || 22,
    color: style.color || C.ink,
    typeface: style.typeface || FONT.body,
    bold: style.bold ?? false,
    alignment: style.align || "left",
    verticalAlignment: style.valign || "top",
    insets: style.insets || { top: 8, right: 8, bottom: 8, left: 8 },
  };
  s.text = value;
  return s;
}

export function title(slide, kicker, claim, support, dark = false) {
  const ink = dark ? C.white : C.ink;
  shape(slide, { left: 62, top: 48, width: 52, height: 4 }, { fill: { type: "solid", color: C.orange } });
  text(slide, kicker.toUpperCase(), { left: 122, top: 35, width: 340, height: 32 }, {
    size: 13,
    bold: true,
    color: dark ? "#FFB16C" : C.orange,
    fill: dark ? C.dark : C.paper,
    valign: "middle",
    insets: { top: 4, right: 0, bottom: 4, left: 0 },
  });
  text(slide, claim, { left: 56, top: 76, width: 900, height: 110 }, {
    size: 38,
    bold: true,
    color: ink,
    fill: dark ? C.dark : C.paper,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  if (support) {
    text(slide, support, { left: 58, top: 194, width: 760, height: 34 }, {
      size: 16,
      color: dark ? "#C9D3DB" : C.muted,
      fill: dark ? C.dark : C.paper,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  }
}

export function footer(slide, n, source = "Trego repo + midterm script") {
  shape(slide, { left: 56, top: 672, width: 1168, height: 1 }, { fill: { type: "solid", color: "#CDBFAA" } });
  text(slide, source, { left: 56, top: 682, width: 800, height: 24 }, {
    size: 10,
    color: C.muted,
    fill: C.paper,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  text(slide, String(n).padStart(2, "0"), { left: 1180, top: 680, width: 44, height: 24 }, {
    size: 11,
    bold: true,
    color: C.orange,
    align: "right",
    fill: C.paper,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

export function logo(slide, x = 1094, y = 32, size = 74) {
  return slide.images.add({
    path: ASSETS.logo,
    alt: "Trego logo",
    position: { left: x, top: y, width: size, height: size },
    fit: "contain",
  });
}

export function headerLogo(slide) {
  logo(slide, 1116, 34, 58);
  text(slide, "Trego", { left: 1170, top: 48, width: 64, height: 24 }, {
    size: 13,
    bold: true,
    color: C.ink,
    fill: C.paper,
    align: "right",
    valign: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

export function pill(slide, label, frame, color = C.orange, bgColor = C.orange2) {
  return text(slide, label, frame, {
    geometry: "roundRect",
    size: 13,
    bold: true,
    color,
    fill: bgColor,
    align: "center",
    valign: "middle",
    insets: { top: 4, right: 12, bottom: 4, left: 12 },
  });
}

export function metric(slide, value, label, note, x, y, w, fill = C.white) {
  shape(slide, { left: x, top: y, width: w, height: 112 }, {
    geometry: "roundRect",
    fill: { type: "solid", color: fill },
    line: { style: "solid", fill: "#000000", width: 0 },
  });
  text(slide, value, { left: x + 20, top: y + 14, width: w - 40, height: 40 }, {
    size: 32,
    bold: true,
    color: C.ink,
    fill,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  text(slide, label, { left: x + 20, top: y + 54, width: w - 40, height: 24 }, {
    size: 14,
    bold: true,
    color: C.orange,
    fill,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  text(slide, note, { left: x + 20, top: y + 80, width: w - 40, height: 20 }, {
    size: 11,
    color: C.muted,
    fill,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

export function courtLines(slide, x, y, w, h) {
  shape(slide, { left: x, top: y, width: w, height: h }, {
    geometry: "roundRect",
    fill: { type: "solid", color: C.ink },
    line: { style: "solid", fill: C.ink, width: 0 },
  });
  shape(slide, { left: x + w * 0.43, top: y, width: 2, height: h }, { fill: { type: "solid", color: "#FFFFFF22" } });
  shape(slide, { left: x + w * 0.43 - 96, top: y + h / 2 - 96, width: 192, height: 192 }, {
    geometry: "ellipse",
    fill: { type: "none" },
    line: { style: "solid", fill: "#FFFFFF2A", width: 2 },
  });
  for (let i = 0; i < 6; i += 1) {
    shape(slide, { left: x + 42 + i * 90, top: y + 34, width: 1, height: h - 68 }, { fill: { type: "solid", color: "#FFFFFF12" } });
    shape(slide, { left: x + 32, top: y + 38 + i * 72, width: w - 64, height: 1 }, { fill: { type: "solid", color: "#FFFFFF12" } });
  }
}

export function ticket(slide, frame, color = C.white) {
  return shape(slide, frame, {
    geometry: "roundRect",
    fill: { type: "solid", color },
    line: { style: "solid", fill: "#00000010", width: 1 },
  });
}

export function bar(slide, x, y, w, label, color, pct) {
  text(slide, label, { left: x, top: y - 2, width: 240, height: 24 }, {
    size: 13,
    bold: true,
    color: C.ink,
    fill: C.paper,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  shape(slide, { left: x + 250, top: y, width: w, height: 12 }, { fill: { type: "solid", color: "#D6CAB8" } });
  shape(slide, { left: x + 250, top: y, width: w * pct, height: 12 }, { fill: { type: "solid", color } });
}

export function iconBubble(slide, label, x, y, color = C.orange) {
  shape(slide, { left: x, top: y, width: 46, height: 46 }, {
    geometry: "ellipse",
    fill: { type: "solid", color },
    line: { style: "solid", fill: color, width: 0 },
  });
  text(slide, label, { left: x, top: y + 9, width: 46, height: 24 }, {
    size: 15,
    bold: true,
    color: C.white,
    fill: color,
    align: "center",
    valign: "middle",
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

export function bullet(slide, textValue, x, y, color = C.orange, w = 430, fill = C.paper, textColor = C.ink) {
  shape(slide, { left: x, top: y + 8, width: 9, height: 9 }, {
    geometry: "ellipse",
    fill: { type: "solid", color },
    line: { style: "solid", fill: color, width: 0 },
  });
  text(slide, textValue, { left: x + 24, top: y, width: w, height: 34 }, {
    size: 18,
    color: textColor,
    fill,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}

export function miniTicket(slide, titleValue, meta, x, y, color = C.orange) {
  ticket(slide, { left: x, top: y, width: 300, height: 112 }, C.white);
  shape(slide, { left: x, top: y, width: 8, height: 112 }, { fill: { type: "solid", color } });
  text(slide, titleValue, { left: x + 26, top: y + 18, width: 230, height: 28 }, {
    size: 18,
    bold: true,
    color: C.ink,
    fill: C.white,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  text(slide, meta, { left: x + 26, top: y + 56, width: 232, height: 36 }, {
    size: 13,
    color: C.muted,
    fill: C.white,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
}
