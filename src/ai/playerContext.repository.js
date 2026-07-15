"use strict";

/**
 * playerContext.repository.js
 * ----------------------------------------------------------------------------
 * TEMPORARY DATA SOURCE for the AI Coach's player context.
 *
 * There are no live DB tables for player stats/fitness/nutrition/medical
 * data yet — the profile page currently renders hardcoded demo data too.
 * Per product decision, this repository returns MANUALLY-MAINTAINED context
 * data for now rather than querying MySQL.
 *
 * IMPORTANT: This is the ONLY file that should change when real tables
 * (Player, PlayerBattingStats, PlayerFitness, etc.) are introduced later.
 * ai.service.js, promptBuilder.js, and everything downstream only ever see
 * the PlayerContext shape documented in promptBuilder.js — swap the body of
 * getPlayerContext() to real Sequelize queries and nothing else needs to change.
 *
 * The data below mirrors the demo data already shown on the player's
 * Profile page (Niteesha Kunchala) so the AI Coach's answers stay consistent
 * with what the player sees elsewhere in the app.
 */

/**
 * Manually maintained context, keyed by userId. Extend this map (or replace
 * it with a single default if you only have one active player for now) as
 * more players onboard.
 */
const MANUAL_PLAYER_CONTEXT = {
  // Replace `1` with the real numeric userId of the account you're testing
  // with — check the `users` table / JWT payload if unsure.
  1: {
    profile: {
      name: "Niteesha Kunchala",
      role: "All-Rounder",
      battingStyle: "Right-hand bat",
      bowlingStyle: "Right-arm leg-spin",
      team: "Royal Challengers Bangalore",
      jerseyNumber: 17,
    },

    battingStats: {
      matches: 47,
      runs: 1284,
      average: 34.6,
      strikeRate: 132,
      centuries: 2,
      highScore: 118,
    },

    bowlingStats: {
      matches: 47,
      wickets: 38,
      economy: 6.8,
      average: 24.1,
      bestFigures: "4/22",
    },

    fieldingStats: {
      catches: 21,
      runOuts: 4,
      stumpings: 0,
    },

    strengths: [
      "Strong against spin bowling",
      "Excellent cover drives",
      "Calm finisher in death overs",
      "Sharp fielder at cover point",
    ],

    weaknesses: [
      "Weak against short-pitched deliveries",
      "Struggles under pressure chasing 150+",
      "Slow starter against left-arm pace",
    ],

    trainingFocus: [
      { skill: "Pull shot against short ball", progress: 62 },
      { skill: "Death-over bowling variations", progress: 45 },
      { skill: "Strike rotation in powerplay", progress: 78 },
    ],

    coachObservations: [
      {
        coach: "R. Dravid",
        note: "Excellent temperament in the chase. Keep backing your defense early.",
        date: "7 Jul 2026",
      },
      {
        coach: "R. Dravid",
        note: "Stayed composed after being dropped on 12 vs Sano Titans.",
        date: "6 Jul 2026",
      },
    ],

    sleep: {
      lastNightHours: 7.5,
      avgHours: 7.4,
      quality: 81,
    },

    recovery: {
      soreness: "Low",
      readinessScore: 87,
    },

    nutrition: {
      waterIntakeLitres: 2.6,
      waterTargetLitres: 3.5,
      macros: {
        protein: { value: 168, target: 180, unit: "g" },
        carbs: { value: 240, target: 280, unit: "g" },
        fats: { value: 62, target: 70, unit: "g" },
        calories: { value: 2380, target: 2600, unit: "kcal" },
      },
      dailyDiet: [
        { meal: "Breakfast", items: "Oats, egg whites, banana, almonds" },
        { meal: "Lunch", items: "Grilled chicken, brown rice, sautéed greens" },
        { meal: "Pre-training", items: "Peanut butter toast, black coffee" },
        { meal: "Dinner", items: "Salmon, quinoa, roasted vegetables" },
      ],
    },

    injuryStatus: {
      current: null, // "None reported"
      history: [
        {
          injury: "Left hamstring strain",
          date: "Mar 2024",
          status: "Fully recovered",
        },
        {
          injury: "Right shoulder impingement",
          date: "Nov 2023",
          status: "Fully recovered",
        },
      ],
    },

    medicalHistory: {
      notes: ["Last medical checkup: 1 Jul 2026, no concerns flagged."],
    },

    // Omitted entirely unless applicable/opted-in — left commented as a
    // reference for the shape when real data/consent flow exists.
    // cycleTracking: { phase: 'Follicular', notes: 'Energy levels typically higher in this phase.' },

    upcomingMatch: {
      opponent: "Sano Titans",
      date: "18 Jul 2026",
      venue: "M. Chinnaswamy Stadium, Bengaluru",
      format: "T20",
    },

    opponentScoutingReports: [
      {
        opponent: "Sano Titans",
        note: "Their left-arm pacer bowls a lot of yorkers at the death — practise low full-toss retrieval.",
        date: "6 Jul 2026",
      },
      {
        opponent: "Deccan Chargers",
        note: "Weak against off-spin into the rough during 2nd innings.",
        date: "29 Jun 2026",
      },
    ],

    goals:
      "Break into the national T20I squad within 12 months; improve strike rate against pace to 145+.",
  },
};

/**
 * Fetch manually-maintained player context for a given userId.
 *
 * Returns an empty object (not null) if no manual entry exists for this
 * user — promptBuilder's section formatters all handle missing fields
 * gracefully and will simply omit every section, degrading to general
 * coaching advice rather than throwing.
 *
 * @param {number} userId
 * @returns {Promise<import('./promptBuilder').PlayerContext>}
 */
async function getPlayerContext(userId) {
  return MANUAL_PLAYER_CONTEXT[userId] || {};
}

module.exports = {
  getPlayerContext,
};
