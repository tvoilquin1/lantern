// LCWS baseline items — authored text verbatim from
// lantern_research/wellbeing scale/caregiver_wellbeing_scale.md ("Baseline Items" section).
export type WellbeingDomain =
  | 'relationship_strain'
  | 'emotional_wellbeing'
  | 'social_family'
  | 'finances'
  | 'sense_of_control'
  | 'global';

export type WellbeingItem = {
  id: string;
  question: string;
  domain: WellbeingDomain;
  isGlobalItem: boolean;
};

export const wellbeingItems: WellbeingItem[] = [
  {
    id: 'personal_time',
    question: 'Do you find it hard to carve out time for the things you want or need to do for yourself?',
    domain: 'social_family',
    isGlobalItem: false,
  },
  {
    id: 'competing_demands',
    question: 'Does juggling caregiving alongside your other obligations leave you feeling stretched thin?',
    domain: 'sense_of_control',
    isGlobalItem: false,
  },
  {
    id: 'relationships_with_others',
    question: 'Has caregiving created tension or distance between you and other people in your life?',
    domain: 'social_family',
    isGlobalItem: false,
  },
  {
    id: 'tension_during_caregiving',
    question: "Do you feel on edge or tense when you're with the person you're caring for?",
    domain: 'relationship_strain',
    isGlobalItem: false,
  },
  {
    id: 'own_health',
    question: 'Has your physical or emotional health taken a hit because of your caregiving role?',
    domain: 'emotional_wellbeing',
    isGlobalItem: false,
  },
  {
    id: 'sense_of_control',
    question:
      "Since your relative's health changed, do you feel like you've lost a sense of control over your own life?",
    domain: 'sense_of_control',
    isGlobalItem: false,
  },
  {
    id: 'finances',
    question: 'Do you feel the cost of caregiving is putting a strain on your finances?',
    domain: 'finances',
    isGlobalItem: false,
  },
  {
    id: 'overall_burden',
    question: 'Taking everything into account, how heavy does the weight of caregiving feel to you right now?',
    domain: 'global',
    isGlobalItem: true,
  },
];
