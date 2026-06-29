import { C, bg, footer, headerLogo, iconBubble, shape, text, title } from "./_helpers.mjs";

export async function slide02(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  headerLogo(slide);
  title(slide, "Where We Left Off", "The pitch roadmap was about moving beyond a basic MVP.", "The goal was a more reliable sports coordination platform, not just a game listing page.");

  const roadmap = [
    ["Attendance", "Track whether players actually show up.", "AT", C.orange],
    ["Reputation", "Use reliability carefully, without unfair scoring.", "RP", C.green],
    ["Matchmaking", "Recommend games by location, skill, and preferences.", "MM", C.blue],
    ["Calendar", "Reduce forgetfulness with reminders.", "CA", C.orange],
    ["Stakeholders", "Validate adoption with real recreation leaders.", "ST", C.green],
  ];
  roadmap.forEach(([head, body, icon, color], i) => {
    const x = 86 + (i % 3) * 360;
    const y = 252 + Math.floor(i / 3) * 150;
    shape(slide, { left: x, top: y, width: 310, height: 116 }, {
      geometry: "roundRect",
      fill: { type: "solid", color: C.white },
      line: { style: "solid", fill: "#00000012", width: 1 },
    });
    iconBubble(slide, icon, x + 22, y + 28, color);
    text(slide, head, { left: x + 86, top: y + 22, width: 190, height: 28 }, {
      size: 18,
      bold: true,
      color: C.ink,
      fill: C.white,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    text(slide, body, { left: x + 86, top: y + 54, width: 184, height: 38 }, {
      size: 13,
      color: C.muted,
      fill: C.white,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  text(slide, "Midterm shift: keep the roadmap, but validate the reliable coordination pieces first.", { left: 170, top: 572, width: 940, height: 46 }, {
    size: 21,
    bold: true,
    color: C.white,
    fill: C.ink,
    align: "center",
    valign: "middle",
    geometry: "roundRect",
  });
  footer(slide, 2, "Sources: ppt-prompt.txt, midterm script");
  slide.speakerNotes.text = "Summarize the original plan: attendance, reputation, matchmaking, calendar integration, and stakeholder outreach. Emphasize that the plan was to make the MVP reliable.";
  return slide;
}
