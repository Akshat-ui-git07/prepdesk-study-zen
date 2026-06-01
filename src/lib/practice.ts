// Shared helpers for the student practice flow.

export type RawQuestion = {
  q?: string;
  question?: string;
  type?: "mcq" | "text" | "open";
  options?: string[];
  choices?: string[];
  answer?: string | number;
  correct?: string | number;
  correctIndex?: number;
  explanation?: string;
  marks?: number;
};

export type NormalizedQuestion = {
  id: number;
  prompt: string;
  type: "mcq" | "text";
  options: string[];
  correctIndex: number | null; // mcq
  correctText: string | null; // text
  explanation: string | null;
  marks: number;
};

export function normalizeQuestions(raw: unknown): NormalizedQuestion[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((r: RawQuestion, i: number): NormalizedQuestion => {
    const prompt = r.q ?? r.question ?? "";
    const options = (r.options ?? r.choices ?? []) as string[];
    const isMcq = options.length > 0 && (r.type ?? "mcq") !== "text" && (r.type ?? "mcq") !== "open";
    let correctIndex: number | null = null;
    let correctText: string | null = null;
    const ans = r.answer ?? r.correct;
    if (isMcq) {
      if (typeof r.correctIndex === "number") correctIndex = r.correctIndex;
      else if (typeof ans === "number") correctIndex = ans;
      else if (typeof ans === "string") {
        const idx = options.findIndex((o) => o.trim().toLowerCase() === ans.trim().toLowerCase());
        correctIndex = idx >= 0 ? idx : null;
      }
    } else if (typeof ans === "string") {
      correctText = ans;
    }
    return {
      id: i,
      prompt,
      type: isMcq ? "mcq" : "text",
      options,
      correctIndex,
      correctText,
      explanation: r.explanation ?? null,
      marks: typeof r.marks === "number" ? r.marks : 1,
    };
  });
}

export function suggestedSeconds(qCount: number): number {
  // 90 seconds per question, min 5 min, max 90 min
  return Math.min(90 * 60, Math.max(5 * 60, qCount * 90));
}

export function formatTime(secs: number): string {
  const s = Math.max(0, Math.floor(secs));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export type AnswerMap = Record<number, { value: string | number | null; marked: boolean }>;

export function scoreAttempt(
  questions: NormalizedQuestion[],
  answers: AnswerMap,
): {
  score: number;
  total: number;
  percentage: number;
  breakdown: Array<{
    id: number;
    correct: boolean;
    user: string | number | null;
    expected: string | number | null;
    explanation: string | null;
  }>;
} {
  let score = 0;
  let total = 0;
  const breakdown = questions.map((q) => {
    total += q.marks;
    const a = answers[q.id];
    let correct = false;
    let expected: string | number | null = null;
    if (q.type === "mcq" && q.correctIndex !== null) {
      expected = q.correctIndex;
      correct = a?.value === q.correctIndex;
    } else if (q.type === "text" && q.correctText !== null) {
      expected = q.correctText;
      correct =
        typeof a?.value === "string" &&
        a.value.trim().toLowerCase() === q.correctText.trim().toLowerCase();
    }
    if (correct) score += q.marks;
    return {
      id: q.id,
      correct,
      user: a?.value ?? null,
      expected,
      explanation: q.explanation,
    };
  });
  const percentage = total > 0 ? Math.round((score / total) * 1000) / 10 : 0;
  return { score, total, percentage, breakdown };
}
