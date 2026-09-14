// Lantern-original staging questions, grounded in lantern_research/stages/01 - Early stage.md
// and 02 - Middle stage.md (see AGENTS.md — Lantern-original stage model, no external instruments).
export type StageQuestion = {
  id: string;
  text: string;
  stage: 'early' | 'middle' | 'late';
};

export const stagingQuestions: StageQuestion[] = [
  {
    id: 'finances',
    text: 'Is she still able to manage her own bills and finances, or has that become too hard for her?',
    stage: 'early',
  },
  {
    id: 'driving',
    text: 'Does he still drive? If so, have you noticed any close calls, getting lost, or new hesitation behind the wheel?',
    stage: 'early',
  },
  {
    id: 'meal_planning',
    text: 'Can she still plan and cook a full meal on her own, start to finish, or does she need help with that now?',
    stage: 'early',
  },
  {
    id: 'medications',
    text: "Is she managing her own medications correctly, or do you need to set them out, remind her, or give them to her yourself?",
    stage: 'middle',
  },
  {
    id: 'recognition',
    text: 'Does he still recognize you and other close family members most of the time?',
    stage: 'middle',
  },
  {
    id: 'wandering',
    text: 'Has she ever left the house on her own and had trouble finding her way back, or gotten lost somewhere familiar?',
    stage: 'middle',
  },
  {
    id: 'hands_on_adls',
    text: 'Does he need hands-on help with things like bathing, dressing, or using the bathroom, or can he still manage those himself?',
    stage: 'middle',
  },
];
