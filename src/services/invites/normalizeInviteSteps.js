const parseDateValue = (value) => {
  if (!value) return null;
  if (value instanceof Date && !isNaN(value.getTime())) return value;
  if (typeof value !== "string") return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (trimmed.includes("/")) {
    const [d, m, y] = trimmed.split("/");
    if (!d || !m || !y) return null;
    const year = y.length === 2 ? `20${y}` : y;
    const iso = `${year}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`;
    const parsed = new Date(iso);
    return isNaN(parsed.getTime()) ? null : parsed;
  }

  const parsed = new Date(trimmed);
  return isNaN(parsed.getTime()) ? null : parsed;
};

const normalizeInviteSteps = (rawSteps) => {
  let steps = rawSteps;
  if (typeof steps === "string") {
    try {
      steps = JSON.parse(steps);
    } catch (error) {
      return { error: "Formato inválido das etapas." };
    }
  }

  if (!Array.isArray(steps) || steps.length === 0) {
    return { error: "Envie pelo menos uma etapa." };
  }

  const normalized = [];

  for (const [index, step] of steps.entries()) {
    const title = String(step?.title || "").trim();
    const price = Number(step?.price);
    if (!title || title.length < 3) {
      return { error: `Título inválido na etapa ${index + 1}.` };
    }
    if (!Number.isFinite(price) || price < 0) {
      return { error: `Valor inválido na etapa ${index + 1}.` };
    }

    const startCandidate = step?.start_date ?? step?.startDate;
    const endCandidate = step?.end_date ?? step?.endDate;
    const startDate = parseDateValue(startCandidate);
    const endDate = parseDateValue(endCandidate);

    if (startCandidate && !startDate) {
      return { error: `Data inicial inválida na etapa ${index + 1}.` };
    }
    if (endCandidate && !endDate) {
      return { error: `Data final inválida na etapa ${index + 1}.` };
    }
    if (startDate && endDate && endDate < startDate) {
      return { error: `A data final deve ser maior que a inicial na etapa ${index + 1}.` };
    }

    normalized.push({
      title,
      price,
      start_date: startDate,
      end_date: endDate,
      group_id: step.group_id || step.payment_group_id || null,
      payment_group_id: step.payment_group_id || step.group_id || null, 
    });
  }

  return { steps: normalized };
};

module.exports = normalizeInviteSteps;
