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
 * DATA CONVENTION (important, read before adding entries):
 * A field is either present with a REAL value, or it is `null` / an empty
 * array / entirely absent. NEVER use the string "N/A" (or similar
 * placeholder text) anywhere in this file.
 *   - `null`            → the section/field has not been filled in yet.
 *     promptBuilder's formatters omit it from the Gemini prompt, and the
 *     frontend renders it as a styled empty-state prompt (EmptyField /
 *     EmptySection), never literal "N/A" text.
 *   - `0` / real number  → a genuine value (e.g. a brand-new player really
 *     has 0 career matches — that's data, not an absence of data, and
 *     should render as a normal stat, not an empty state).
 *   - `[]`               → the list exists conceptually but has no entries
 *     yet (e.g. no strengths logged yet) — distinct from `null`, since the
 *     frontend can offer "+ Add a strength" rather than a generic prompt.
 */

/**
 * Returns a fresh default context for a player who has just signed up and
 * has not filled in anything beyond their account identity (name/email,
 * handled outside this module via the `users` table).
 *
 * Use this as the starting point for any new manual entry, and as the
 * fallback for userIds not yet present in MANUAL_PLAYER_CONTEXT, so new
 * players get correctly-typed emptiness (nulls/[]s) instead of a bare `{}`
 * that silently degrades every section at once.
 *
 * @param {{ name?: string }} [overrides] - identity fields already known
 *   at signup (e.g. full name from the users table) that shouldn't be null.
 */
function buildDefaultPlayerContext(overrides = {}) {
  return {
    profile: {
      name: overrides.name ?? null,
      role: null,
      battingStyle: null,
      bowlingStyle: null,
      team: null,
      jerseyNumber: null,
    },

    // Career totals are real zeros for a brand-new player, not missing
    // data — render normally (e.g. StatTile), not as an empty state.
    battingStats: {
      matches: 0,
      runs: 0,
      average: 0,
      strikeRate: 0,
      centuries: 0,
      highScore: 0,
    },

    bowlingStats: null, // omit entirely until the player logs a bowling style
    fieldingStats: null,

    strengths: [],
    weaknesses: [],
    trainingFocus: [],
    coachObservations: [],

    sleep: null,
    recovery: null,
    nutrition: null,

    injuryStatus: {
      current: null,
      history: [],
    },
    medicalHistory: null,

    // Only ever present if the player has explicitly opted in — omitted by
    // default, never a placeholder.
    cycleTracking: null,

    upcomingMatch: null,
    opponentScoutingReports: [],

    goals: null,
  };
}

/**
 * Manually maintained context, keyed by userId. Extend this map as more
 * players onboard with real data. Any userId not present here falls back
 * to `buildDefaultPlayerContext()` in getPlayerContext() below.
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
      current: null, // "None reported" — rendered by the UI, not stored as text
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

  // Example of a brand-new signup with only identity data set — everything
  // else deliberately uses buildDefaultPlayerContext() rather than being
  // hand-typed out, so it can never drift from the null/[] convention above.
  // Uncomment and set the real userId once you have a second test account:
  //
  // 2: buildDefaultPlayerContext({ name: "New Player Name" }),
};

/**
 * Fetch manually-maintained player context for a given userId.
 *
 * Falls back to buildDefaultPlayerContext() — never a bare `{}` — for any
 * userId not present in MANUAL_PLAYER_CONTEXT, so a brand-new player still
 * gets correctly-typed emptiness (real zeros for career stats, null for
 * everything else) rather than every single section vanishing at once with
 * no distinction between "zero matches played" and "no data on file".
 *
 * @param {number} userId
 * @returns {Promise<import('./promptBuilder').PlayerContext>}
 */
async function getPlayerContext(userId) {
  return MANUAL_PLAYER_CONTEXT[userId] ?? buildDefaultPlayerContext();
}

module.exports = {
  getPlayerContext,
  buildDefaultPlayerContext,
};
