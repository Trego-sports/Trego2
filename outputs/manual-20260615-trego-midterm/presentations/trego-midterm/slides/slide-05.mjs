import { ASSETS, C, bg, bullet, footer, headerLogo, pill, shape, text, title } from "./_helpers.mjs";

export async function slide05(presentation) {
  const slide = presentation.slides.add();
  bg(slide);
  headerLogo(slide);
  title(slide, "Stakeholder Engagement", "Feedback narrowed the rollout toward users with the clearest pain.", "We met with Bryan Emonts from UW Athletics and Recreation and reached out to Professor Jack Davis for feedback and mentorship.");

  slide.images.add({
    path: ASSETS.community,
    alt: "University recreation sports community",
    position: { left: 76, top: 268, width: 458, height: 258 },
    fit: "cover",
  });
  shape(slide, { left: 76, top: 268, width: 458, height: 258 }, {
    geometry: "rect",
    fill: { type: "none" },
    line: { style: "solid", fill: C.ink, width: 2 },
  });
  pill(slide, "Bryan Emonts: UW Recreation", { left: 96, top: 288, width: 220, height: 32 }, C.white, C.ink);
  text(slide, "What changed", { left: 610, top: 262, width: 270, height: 34 }, { size: 24, bold: true, color: C.ink, fill: C.paper });
  bullet(slide, "Focus on daytime users, especially 9 AM-5 PM.", 614, 318, C.orange, 520);
  bullet(slide, "Prioritize first- and second-year students.", 614, 370, C.green, 520);
  bullet(slide, "Do not rely only on established clubs.", 614, 422, C.blue, 520);
  bullet(slide, "Use boots-on-the-ground marketing and social proof.", 614, 474, C.orange, 520);
  text(slide, "Rollout implication: find the users who do not already have a stable sports network.", { left: 174, top: 574, width: 932, height: 44 }, {
    size: 20,
    bold: true,
    color: C.white,
    fill: C.ink,
    align: "center",
    valign: "middle",
    geometry: "roundRect",
  });
  footer(slide, 5, "Sources: ppt-prompt.txt, stakeholder notes");
  slide.speakerNotes.text = "Mention Bryan Emonts and Professor Jack Davis outreach. The key point is that stakeholder feedback narrowed the target users and marketing strategy.";
  return slide;
}
