import { C, bg, footer, headerLogo, iconBubble, shape, text, title } from "./_helpers.mjs";

export async function slide06(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  headerLogo(slide);
  title(slide, "Team Logistics", "The team workflow is now structured around steady progress and risk tracking.", "This slide focuses on how we organize work, not individual ownership.");

  const tools = [
    ["Meetings", "Weekly in-person planning, progress updates, and blocker resolution.", "ME", C.orange],
    ["Linear", "Task management, backlog tracking, priorities, and sprint-style organization.", "LI", C.green],
    ["Discord", "Async communication, quick questions, and day-to-day coordination.", "DI", C.blue],
    ["GitHub", "Code collaboration, reviews, and feature integration.", "GH", C.ink],
  ];
  tools.forEach(([head, body, icon, color], i) => {
    const x = 82 + (i % 2) * 560;
    const y = 254 + Math.floor(i / 2) * 146;
    shape(slide, { left: x, top: y, width: 500, height: 112 }, {
      geometry: "roundRect",
      fill: { type: "solid", color: C.white },
      line: { style: "solid", fill: "#00000010", width: 1 },
    });
    iconBubble(slide, icon, x + 24, y + 32, color);
    text(slide, head, { left: x + 92, top: y + 22, width: 160, height: 28 }, {
      size: 20,
      bold: true,
      color,
      fill: C.white,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    text(slide, body, { left: x + 250, top: y + 24, width: 210, height: 58 }, {
      size: 14,
      color: C.muted,
      fill: C.white,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  text(slide, "Process loop: build small features → test internally → gather feedback → improve.", { left: 174, top: 572, width: 932, height: 48 }, {
    size: 20,
    bold: true,
    color: C.white,
    fill: C.ink,
    align: "center",
    valign: "middle",
    geometry: "roundRect",
  });
  footer(slide, 6, "Sources: ppt-prompt.txt, repo workflow context");
  slide.speakerNotes.text = "Explain the team logistics: weekly meetings, Linear, Discord, Git/GitHub, and the iterative build-test-feedback process.";
  return slide;
}
