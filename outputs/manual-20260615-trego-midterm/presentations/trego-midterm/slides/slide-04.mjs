import { C, bg, bullet, footer, headerLogo, shape, text, title } from "./_helpers.mjs";

export async function slide04(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  headerLogo(slide);
  title(slide, "Design Decisions", "Recent work focuses on reliability and coordination.", "We chose simple, useful versions first so the team can learn from real behavior.");

  shape(slide, { left: 74, top: 252, width: 510, height: 280 }, {
    geometry: "roundRect",
    fill: { type: "solid", color: C.white },
    line: { style: "solid", fill: "#00000012", width: 1 },
  });
  text(slide, "Why not full reputation yet?", { left: 112, top: 286, width: 380, height: 34 }, { size: 24, bold: true, color: C.ink, fill: C.white });
  bullet(slide, "Avoid unfair scores before edge cases are understood.", 116, 350, C.orange, 380, C.white);
  bullet(slide, "Collect attendance data first.", 116, 402, C.green, 380, C.white);
  bullet(slide, "Then decide whether reputation should exist.", 116, 454, C.blue, 380, C.white);

  shape(slide, { left: 690, top: 252, width: 510, height: 280 }, {
    geometry: "roundRect",
    fill: { type: "solid", color: C.ink },
    line: { style: "solid", fill: C.ink, width: 0 },
  });
  text(slide, "Why announcements + transfer?", { left: 728, top: 286, width: 390, height: 34 }, { size: 24, bold: true, color: C.white, fill: C.ink });
  bullet(slide, "Coordination continues after a player joins.", 732, 350, C.orange, 390, C.ink, C.white);
  bullet(slide, "Hosts need a clear place for last-minute updates.", 732, 402, C.green, 390, C.ink, C.white);
  bullet(slide, "Games should not depend on one original host.", 732, 454, C.blue, 390, C.ink, C.white);
  text(slide, "Main message: build reliability into the core flow before adding heavier systems.", { left: 178, top: 576, width: 924, height: 44 }, {
    size: 21,
    bold: true,
    color: C.white,
    fill: C.orange,
    align: "center",
    valign: "middle",
    geometry: "roundRect",
  });
  footer(slide, 4, "Sources: ppt-prompt.txt, attendance and announcement modules");
  slide.speakerNotes.text = "Explain the reasoning: attendance before reputation, announcements because coordination continues after joining, and transfer for real-life host changes.";
  return slide;
}
