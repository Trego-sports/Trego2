import { C, bg, footer, headerLogo, iconBubble, shape, text, title } from "./_helpers.mjs";

export async function slide03(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  headerLogo(slide);
  title(slide, "Progress Since Pitch", "We shipped concrete features that make games easier to coordinate.", "These are development milestones, not just design ideas.");

  const features = [
    ["Calendar", "Google Calendar integration for game reminders.", "CA", C.orange],
    ["Attendance", "Game owner submits attendance after the game.", "AT", C.green],
    ["Announcements", "Hosts update attending players from the game page.", "AN", C.blue],
    ["Transfer", "Host can transfer ownership when needed.", "TR", C.ink],
  ];
  features.forEach(([head, body, icon, color], i) => {
    const x = 82 + i * 288;
    shape(slide, { left: x, top: 262, width: 236, height: 250 }, {
      geometry: "roundRect",
      fill: { type: "solid", color: i === 3 ? C.ink : C.white },
      line: { style: "solid", fill: "#00000012", width: 1 },
    });
    iconBubble(slide, icon, x + 26, 296, color);
    text(slide, head, { left: x + 26, top: 360, width: 180, height: 30 }, {
      size: 22,
      bold: true,
      color: i === 3 ? C.white : C.ink,
      fill: i === 3 ? C.ink : C.white,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
    text(slide, body, { left: x + 26, top: 410, width: 178, height: 64 }, {
      size: 15,
      color: i === 3 ? "#DDE5EA" : C.muted,
      fill: i === 3 ? C.ink : C.white,
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
    });
  });
  text(slide, "Together, these move Trego from “find and join” toward “help the game actually happen.”", { left: 150, top: 568, width: 980, height: 52 }, {
    size: 21,
    bold: true,
    color: C.white,
    fill: C.ink,
    align: "center",
    valign: "middle",
    geometry: "roundRect",
  });
  footer(slide, 3, "Sources: calendar/sync.ts, mark-attendance.ts, send-game-announcement.ts, transfer-game-host.ts");
  slide.speakerNotes.text = "Walk through the four completed features as concrete progress since the pitch.";
  return slide;
}
