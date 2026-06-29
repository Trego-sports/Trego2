import { C, bg, bullet, footer, headerLogo, shape, text, title } from "./_helpers.mjs";

export async function slide07(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  headerLogo(slide);
  title(slide, "Challenges + Next Steps", "Trego is moving from a working MVP toward an evidence-driven coordination platform.", "The biggest remaining risks are about adoption, data density, and fairness.");

  shape(slide, { left: 80, top: 252, width: 510, height: 286 }, {
    geometry: "roundRect",
    fill: { type: "solid", color: C.ink },
    line: { style: "solid", fill: C.ink, width: 0 },
  });
  text(slide, "Current challenges", { left: 118, top: 286, width: 320, height: 34 }, { size: 24, bold: true, color: C.white, fill: C.ink });
  bullet(slide, "User acquisition is still the biggest risk.", 120, 350, C.orange, 390, C.ink, C.white);
  bullet(slide, "Matchmaking needs enough users and game data.", 120, 402, C.green, 390, C.ink, C.white);
  bullet(slide, "Reputation must be fair and tested carefully.", 120, 454, C.blue, 390, C.ink, C.white);

  shape(slide, { left: 690, top: 252, width: 510, height: 286 }, {
    geometry: "roundRect",
    fill: { type: "solid", color: C.white },
    line: { style: "solid", fill: "#00000012", width: 1 },
  });
  text(slide, "Next steps", { left: 728, top: 286, width: 320, height: 34 }, { size: 24, bold: true, color: C.ink, fill: C.white });
  bullet(slide, "Release the new coordination features to users.", 730, 350, C.orange, 390, C.white);
  bullet(slide, "Gather feedback on attendance, calendar, and announcements.", 730, 402, C.green, 390, C.white);
  bullet(slide, "Focus rollout on early-year and daytime recreation users.", 730, 454, C.blue, 390, C.white);
  bullet(slide, "Start with simple filters before advanced recommendations.", 730, 506, C.orange, 390, C.white);

  text(slide, "Conclusion: keep the MVP useful, then let real usage shape the next layer.", { left: 174, top: 590, width: 932, height: 44 }, {
    size: 21,
    bold: true,
    color: C.white,
    fill: C.orange,
    align: "center",
    valign: "middle",
    geometry: "roundRect",
  });
  footer(slide, 7, "Sources: ppt-prompt.txt, midterm script, get-recommended-games.ts");
  slide.speakerNotes.text = "Close with challenges and next steps. The conclusion is that Trego is moving from a working MVP toward a more reliable, evidence-driven platform.";
  return slide;
}
