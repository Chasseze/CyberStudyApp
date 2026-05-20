const LIMITS = {
  week: 80,
  topic: 200,
  goal: 500,
  notes: 2000,
};

export function trimField(value) {
  return typeof value === 'string' ? value.trim() : '';
}

export function validateEntryForm({ week, topic, goal, notes }) {
  const w = trimField(week);
  const t = trimField(topic);
  const g = trimField(goal);
  const n = trimField(notes);

  if (!w) return { valid: false, error: 'Week is required' };
  if (!t) return { valid: false, error: 'Topic is required' };
  if (!g) return { valid: false, error: 'Study goal is required' };
  if (w.length > LIMITS.week) return { valid: false, error: `Week must be under ${LIMITS.week} characters` };
  if (t.length > LIMITS.topic) return { valid: false, error: `Topic must be under ${LIMITS.topic} characters` };
  if (g.length > LIMITS.goal) return { valid: false, error: `Goal must be under ${LIMITS.goal} characters` };
  if (n.length > LIMITS.notes) return { valid: false, error: `Notes must be under ${LIMITS.notes} characters` };

  return {
    valid: true,
    data: { week: w, topic: t, goal: g, notes: n },
  };
}

export function sanitizeEntryPayload(formData) {
  const result = validateEntryForm(formData);
  if (!result.valid) return result;
  return {
    valid: true,
    data: {
      ...result.data,
      status: formData.status,
    },
  };
}
