"use strict";

/**
 * promptBuilder.js
 * ----------------------------------------------------------------------------
 * Converts raw player context + a user's question into a single, structured
 * prompt string for Gemini. This is the heart of what makes the AI Coach
 * "context-aware" rather than a generic chatbot — no user message is ever
 * sent to Gemini without first being wrapped by buildChatPrompt().
 *
 * Hard rule: if a piece of context is unavailable, OMIT that section
 * entirely. Never fabricate placeholder values (no "N/A", no invented stats).
 *
 * @typedef {Object} PlayerContext
 * @property {Object} profile - { name, role, battingStyle, bowlingStyle, team, jerseyNumber }
 * @property {Object} [battingStats] - { matches, runs, average, strikeRate, centuries, highScore }
 * @property {Object} [bowlingStats] - { matches, wickets, economy, average, bestFigures }
 * @property {Object} [fieldingStats] - { catches, runOuts, stumpings }
 * @property {string[]} [strengths]
 * @property {string[]} [weaknesses]
 * @property {Array<{note: string, coach?: string, date?: string}>} [coachObservations]
 * @property {Array<{skill: string, progress: number}>} [trainingFocus]
 * @property {Object} [nutrition] - { dailyDiet, macros, waterIntakeLitres, waterTargetLitres, supplements }
 * @property {Object} [sleep] - { avgHours, quality, lastNightHours }
 * @property {Object} [recovery] - { soreness, readinessScore }
 * @property {Object} [injuryStatus] - { current: string|null, history: Array<{injury, date, status}> }
 * @property {Object} [medicalHistory] - { notes: string[] }
 * @property {Object} [cycleTracking] - { phase, notes } // only present if applicable & opted in
 * @property {Object} [upcomingMatch] - { opponent, date, venue, format }
 * @property {Array<{opponent, note, date}>} [opponentScoutingReports]
 * @property {string} [goals]
 */

const SECTION_ORDER = [
  "profile",
  "battingStats",
  "bowlingStats",
  "fieldingStats",
  "strengths",
  "weaknesses",
  "trainingFocus",
  "coachObservations",
  "sleep",
  "recovery",
  "nutrition",
  "injuryStatus",
  "medicalHistory",
  "cycleTracking",
  "upcomingMatch",
  "opponentScoutingReports",
  "goals",
];

const SYSTEM_PREAMBLE = `You are the AI Coach inside CricVision, an elite cricket performance intelligence platform. You are speaking directly to a professional cricket player as their personal performance coach.

Rules:
- Sound like a world-class elite cricket coach: precise, direct, encouraging but never generic or motivational-poster vague.
- Ground every piece of advice in the player context provided below. Reference specific numbers, tendencies, or notes where relevant.
- Where relevant to the question, address: technique, mental preparation, recovery, nutrition/hydration, and match preparation — but only the aspects that are actually relevant, don't force all five into every answer.
- If player context for something the player asks about is missing, say so plainly and give the best general elite-level guidance instead of guessing at their specifics.
- Never invent statistics, medical details, or scouting information not present in the context below.
- Keep responses focused and actionable — specific drills, specific numbers, specific next steps, not vague encouragement.
- Use markdown formatting (headers, bold, bullet lists) where it improves readability, especially for multi-step plans.`;

/**
 * Format a section header consistently across the prompt.
 */
function heading(label) {
  return `### ${label}`;
}

/**
 * Individual section formatters. Each returns `null` if the relevant data
 * is absent, so buildPlayerContextBlock can filter them out cleanly.
 */
const sectionFormatters = {
  profile(ctx) {
    const p = ctx.profile;
    if (!p) return null;
    const lines = [heading("Player Profile")];
    if (p.name) lines.push(`Name: ${p.name}`);
    if (p.role) lines.push(`Role: ${p.role}`);
    if (p.battingStyle) lines.push(`Batting Style: ${p.battingStyle}`);
    if (p.bowlingStyle) lines.push(`Bowling Style: ${p.bowlingStyle}`);
    if (p.team)
      lines.push(
        `Team: ${p.team}${p.jerseyNumber ? ` (#${p.jerseyNumber})` : ""}`,
      );
    return lines.length > 1 ? lines.join("\n") : null;
  },

  battingStats(ctx) {
    const s = ctx.battingStats;
    if (!s) return null;
    const lines = [heading("Batting Statistics")];
    if (s.matches != null) lines.push(`Matches: ${s.matches}`);
    if (s.runs != null) lines.push(`Runs: ${s.runs}`);
    if (s.average != null) lines.push(`Average: ${s.average}`);
    if (s.strikeRate != null) lines.push(`Strike Rate: ${s.strikeRate}`);
    if (s.centuries != null) lines.push(`Centuries: ${s.centuries}`);
    if (s.highScore != null) lines.push(`Highest Score: ${s.highScore}`);
    return lines.length > 1 ? lines.join("\n") : null;
  },

  bowlingStats(ctx) {
    const s = ctx.bowlingStats;
    if (!s) return null;
    const lines = [heading("Bowling Statistics")];
    if (s.matches != null) lines.push(`Matches: ${s.matches}`);
    if (s.wickets != null) lines.push(`Wickets: ${s.wickets}`);
    if (s.economy != null) lines.push(`Economy: ${s.economy}`);
    if (s.average != null) lines.push(`Average: ${s.average}`);
    if (s.bestFigures) lines.push(`Best Figures: ${s.bestFigures}`);
    return lines.length > 1 ? lines.join("\n") : null;
  },

  fieldingStats(ctx) {
    const s = ctx.fieldingStats;
    if (!s) return null;
    const lines = [heading("Fielding Statistics")];
    if (s.catches != null) lines.push(`Catches: ${s.catches}`);
    if (s.runOuts != null) lines.push(`Run Outs: ${s.runOuts}`);
    if (s.stumpings != null) lines.push(`Stumpings: ${s.stumpings}`);
    return lines.length > 1 ? lines.join("\n") : null;
  },

  strengths(ctx) {
    if (!ctx.strengths?.length) return null;
    return [heading("Strengths"), ...ctx.strengths.map((s) => `- ${s}`)].join(
      "\n",
    );
  },

  weaknesses(ctx) {
    if (!ctx.weaknesses?.length) return null;
    return [heading("Weaknesses"), ...ctx.weaknesses.map((w) => `- ${w}`)].join(
      "\n",
    );
  },

  trainingFocus(ctx) {
    if (!ctx.trainingFocus?.length) return null;
    const lines = ctx.trainingFocus.map(
      (t) =>
        `- ${t.skill}${t.progress != null ? ` (${t.progress}% progress)` : ""}`,
    );
    return [heading("Current Training Focus"), ...lines].join("\n");
  },

  coachObservations(ctx) {
    if (!ctx.coachObservations?.length) return null;
    const lines = ctx.coachObservations.map((o) => {
      const meta = [o.coach, o.date].filter(Boolean).join(", ");
      return `- ${o.note}${meta ? ` (${meta})` : ""}`;
    });
    return [heading("Coach Observations"), ...lines].join("\n");
  },

  sleep(ctx) {
    const s = ctx.sleep;
    if (!s) return null;
    const lines = [heading("Sleep")];
    if (s.lastNightHours != null)
      lines.push(`Last Night: ${s.lastNightHours} hours`);
    if (s.avgHours != null) lines.push(`7-Day Average: ${s.avgHours} hours`);
    if (s.quality != null) lines.push(`Sleep Quality Score: ${s.quality}%`);
    return lines.length > 1 ? lines.join("\n") : null;
  },

  recovery(ctx) {
    const r = ctx.recovery;
    if (!r) return null;
    const lines = [heading("Recovery")];
    if (r.soreness) lines.push(`Soreness: ${r.soreness}`);
    if (r.readinessScore != null)
      lines.push(`Readiness Score: ${r.readinessScore}%`);
    return lines.length > 1 ? lines.join("\n") : null;
  },

  nutrition(ctx) {
    const n = ctx.nutrition;
    if (!n) return null;
    const lines = [heading("Nutrition & Hydration")];
    if (n.waterIntakeLitres != null) {
      lines.push(
        `Hydration: ${n.waterIntakeLitres}L${n.waterTargetLitres ? ` of ${n.waterTargetLitres}L target` : ""} today`,
      );
    }
    if (n.macros) {
      const m = n.macros;
      const macroBits = ["protein", "carbs", "fats", "calories"]
        .filter((k) => m[k] != null)
        .map(
          (k) =>
            `${k}: ${m[k].value}${m[k].target ? `/${m[k].target}` : ""}${m[k].unit || ""}`,
        );
      if (macroBits.length) lines.push(`Macros — ${macroBits.join(", ")}`);
    }
    if (n.dailyDiet?.length) {
      lines.push("Diet Plan:");
      n.dailyDiet.forEach((d) => lines.push(`  - ${d.meal}: ${d.items}`));
    }
    return lines.length > 1 ? lines.join("\n") : null;
  },

  injuryStatus(ctx) {
    const inj = ctx.injuryStatus;
    if (!inj) return null;
    const lines = [heading("Injury Status")];
    lines.push(`Current: ${inj.current || "None reported"}`);
    if (inj.history?.length) {
      lines.push("Recent History:");
      inj.history.forEach((h) =>
        lines.push(`  - ${h.injury} (${h.date}) — ${h.status}`),
      );
    }
    return lines.length > 1 ? lines.join("\n") : null;
  },

  medicalHistory(ctx) {
    if (!ctx.medicalHistory?.notes?.length) return null;
    return [
      heading("Medical History"),
      ...ctx.medicalHistory.notes.map((n) => `- ${n}`),
    ].join("\n");
  },

  cycleTracking(ctx) {
    // Only included at all if the repository explicitly returns it — i.e.
    // the player has opted in AND has data for the current cycle. Treated
    // as sensitive: kept factual and clinical, no elaboration.
    const c = ctx.cycleTracking;
    if (!c || !c.phase) return null;
    const lines = [heading("Cycle Phase (private)")];
    lines.push(`Current Phase: ${c.phase}`);
    if (c.notes) lines.push(`Notes: ${c.notes}`);
    return lines.join("\n");
  },

  upcomingMatch(ctx) {
    const m = ctx.upcomingMatch;
    if (!m) return null;
    const lines = [heading("Upcoming Match")];
    if (m.opponent) lines.push(`Opponent: ${m.opponent}`);
    if (m.date) lines.push(`Date: ${m.date}`);
    if (m.venue) lines.push(`Venue: ${m.venue}`);
    if (m.format) lines.push(`Format: ${m.format}`);
    return lines.length > 1 ? lines.join("\n") : null;
  },

  opponentScoutingReports(ctx) {
    if (!ctx.opponentScoutingReports?.length) return null;
    const lines = ctx.opponentScoutingReports.map(
      (r) => `- ${r.opponent}: ${r.note}${r.date ? ` (${r.date})` : ""}`,
    );
    return [heading("Opponent Scouting Reports"), ...lines].join("\n");
  },

  goals(ctx) {
    if (!ctx.goals) return null;
    return [heading("Player Goals"), ctx.goals].join("\n");
  },
};

/**
 * Build the full "player context" block by running every section formatter
 * and joining only the ones that returned data.
 */
function buildPlayerContextBlock(playerContext = {}) {
  const sections = SECTION_ORDER.map((key) =>
    sectionFormatters[key](playerContext),
  ).filter(Boolean);

  if (!sections.length) {
    return "No player context is currently available for this player.";
  }

  return sections.join("\n\n");
}

/**
 * Format prior conversation turns as a compact transcript so Gemini has
 * continuity within the thread. Expects AIMessage-shaped rows
 * ({ role, content }), oldest first.
 */
function buildHistoryBlock(conversationHistory = []) {
  if (!conversationHistory.length) return null;

  const lines = conversationHistory.map((m) => {
    const speaker = m.role === "user" ? "Player" : "Coach";
    return `${speaker}: ${m.content}`;
  });

  return [heading("Recent Conversation"), ...lines].join("\n");
}

/**
 * Main entry point: assemble the full structured prompt sent to Gemini for
 * a single chat turn.
 */
function buildChatPrompt({
  playerContext,
  conversationHistory = [],
  question,
}) {
  if (!question || !question.trim()) {
    throw new Error("buildChatPrompt requires a non-empty question.");
  }

  const blocks = [
    SYSTEM_PREAMBLE,
    buildPlayerContextBlock(playerContext),
    buildHistoryBlock(conversationHistory),
    [heading("Player Question"), question.trim()].join("\n"),
  ].filter(Boolean);

  return blocks.join("\n\n---\n\n");
}

/**
 * Generate a short, personalized list of suggested questions. Falls back to
 * strong generic prompts for any slot where context is missing, so the UI
 * always has a full set to show — but personalizes as much as it can.
 */
function buildSuggestedPrompts(playerContext = {}) {
  const suggestions = [];

  if (playerContext.upcomingMatch?.opponent) {
    suggestions.push(
      `How should I prepare for ${playerContext.upcomingMatch.opponent}?`,
    );
  } else {
    suggestions.push("Generate today's workout");
  }

  if (playerContext.weaknesses?.length) {
    suggestions.push(
      `Help me improve against ${playerContext.weaknesses[0].toLowerCase()}`,
    );
  } else {
    suggestions.push("Analyse my last innings");
  }

  if (playerContext.opponentScoutingReports?.length) {
    suggestions.push(
      `What should I know about ${playerContext.opponentScoutingReports[0].opponent}?`,
    );
  } else {
    suggestions.push("Opponent analysis");
  }

  suggestions.push(
    "Recovery advice",
    "Generate today's diet",
    "Mental preparation",
  );

  // De-duplicate and cap at 6 for a clean UI grid.
  return Array.from(new Set(suggestions)).slice(0, 6);
}

module.exports = {
  buildChatPrompt,
  buildSuggestedPrompts,
  buildPlayerContextBlock, // exported for unit testing in isolation
};
