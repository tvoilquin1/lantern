// Placeholder for patient stage assessment questions.
// Name retained from build plan doc; this is NOT the Geriatric Depression Scale.
// Content defined in Phase 1 per Lantern-original staging model (see AGENTS.md and
// lantern_research/stages/).
export type StageQuestion = {
  id: string;
  text: string;
  stage: "early" | "middle" | "late";
};

export const gdsQuestions: StageQuestion[] = [];
