"use strict";

/**
 * Every valid key inside Player.extendedProfile. The service and validator
 * both check incoming section names against this list, so a typo'd or
 * unexpected section name is rejected with a 400 instead of silently
 * writing junk into the JSON blob.
 *
 * "list" sections store an array of row objects; "record" sections store
 * a single flat object. This is metadata for the frontend's field config
 * (profile-sections.config.ts) — the backend itself stores either shape
 * as opaque JSON and doesn't need to know which is which.
 */
const EDITABLE_SECTIONS = [
  // Cricket tab
  "cricketBasicInfo",
  "cricketPlayingInfo",
  "cricketJourney",

  // Performance tab (Strengths/Weaknesses are handled separately via
  // the existing PlayerTag system — not part of extendedProfile)
  "performanceAreasWorkingOn",
  "performanceOpponentNotes",
  "performancePersonalNotes",

  // Fitness tab
  "fitnessMeasurements",
  "fitnessWorkoutPlan",
  "fitnessGymProgress",
  "fitnessCardio",
  "fitnessMobility",
  "fitnessRecovery",
  "fitnessSleep",

  // Nutrition tab
  "nutritionDailyDiet",
  "nutritionMacros",
  "nutritionWater",
  "nutritionReminderTimes",
  "nutritionSupplements",
  "nutritionGroceryList",

  // Mindset tab
  "mindsetPersonality",
  "mindsetMatchBehaviour",
  "mindsetCoachFeedback",
  "mindsetDailyReflection",
  "mindsetMeditation",

  // Medical tab
  "medicalInjuryHistory",
  "medicalCurrentInjury",
  "medicalPhysiotherapy",
  "medicalRecoveryRecommendations",
];

module.exports = { EDITABLE_SECTIONS };
