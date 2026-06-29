import { ASSETS, C, bg, courtLines, footer, logo, miniTicket, pill, text } from "./_helpers.mjs";

export async function slide01(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  courtLines(slide, 50, 82, 1180, 520);
  slide.images.add({
    path: ASSETS.community,
    alt: "Students coordinating sports in a gym",
    position: { left: 690, top: 110, width: 475, height: 350 },
    fit: "cover",
  });
  logo(slide, 86, 116, 118);
  pill(slide, "Team Clockwork", { left: 86, top: 254, width: 170, height: 34 }, C.white, C.orange);
  text(slide, "Trego Midterm Update", { left: 86, top: 304, width: 560, height: 96 }, {
    size: 52,
    bold: true,
    color: C.white,
    fill: C.ink,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  text(slide, "A centralized platform for sports discovery and coordination", { left: 90, top: 418, width: 560, height: 52 }, {
    size: 24,
    bold: true,
    color: "#FFE0C6",
    fill: C.ink,
    insets: { top: 0, right: 0, bottom: 0, left: 0 },
  });
  miniTicket(slide, "Find games", "Discover nearby pickup games by sport and location.", 100, 508, C.orange);
  miniTicket(slide, "Join + coordinate", "Profiles, rosters, reminders, and host updates.", 440, 508, C.green);
  miniTicket(slide, "Manage activity", "Create games and keep the game organized.", 780, 508, C.blue);
  footer(slide, 1, "Sources: ppt-prompt.txt, README.md, Trego assets");
  slide.speakerNotes.text = "Introduce Team Clockwork and remind everyone what Trego does: find games, join them, create profiles, and coordinate sports activity from one place.";
  return slide;
}
