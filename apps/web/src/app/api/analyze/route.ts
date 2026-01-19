export const runtime = "nodejs";

type MeterDetail = {
  word: string;
  syllable_breakdown: string;
  scansion: string;
  syllable_count: number;
};

type MeterLineDetails = {
  details: MeterDetail[];
  total_syllables: number;
};

const ACCENT_CHARS = new Set(
  Array.from("áàâãéêíóôõúÁÀÂÃÉÊÍÓÔÕÚ")
);

function isVowel(ch: string) {
  return /[aeiouáàâãéêíóôõúü]/i.test(ch);
}

function cleanWord(word: string) {
  return word
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, "")
    .toLowerCase();
}

function splitSyllablesPt(word: string): string[] {
  const w = cleanWord(word);
  if (!w) return [];

  const syllables: string[] = [];
  let cur = "";
  let seenVowel = false;

  for (let i = 0; i < w.length; i++) {
    const ch = w[i];
    const next = i + 1 < w.length ? w[i + 1] : "";

    cur += ch;
    if (isVowel(ch)) seenVowel = true;

    // Heurística: fecha a sílaba logo após um grupo vocálico,
    // deixando consoantes entre vogais para a próxima sílaba (ex: ca-sa).
    if (seenVowel && next && !isVowel(next)) {
      syllables.push(cur);
      cur = "";
      seenVowel = false;
    }
  }

  if (cur) syllables.push(cur);
  return syllables.filter(Boolean);
}

function findStressedSyllableIndex(syllables: string[], originalWord: string): number {
  // Regra 1: se houver acento gráfico, assume a sílaba acentuada como tônica.
  const w = cleanWord(originalWord);
  for (let i = 0; i < syllables.length; i++) {
    for (const ch of syllables[i]) {
      if (ACCENT_CHARS.has(ch)) return i;
    }
  }

  // Regra 2 (fallback): se termina em vogal, 'n' ou 's' => penúltima; senão última.
  const last = w[w.length - 1] || "";
  if (syllables.length <= 1) return 0;
  if (/[aeiouáàâãéêíóôõú]/i.test(last) || last === "n" || last === "s") {
    return Math.max(0, syllables.length - 2);
  }
  return syllables.length - 1;
}

function getWordScansion(word: string): { scansion: string; syllables: string[] } {
  const syllables = splitSyllablesPt(word);
  if (syllables.length === 0) return { scansion: "", syllables: [] };
  const stressedIndex = findStressedSyllableIndex(syllables, word);
  const scansion = syllables.map((_, i) => (i === stressedIndex ? "1" : "0")).join("");
  return { scansion, syllables };
}

function getLineScansion(line: string) {
  const words = line.split(/\s+/).filter(Boolean);
  return words.map((w) => getWordScansion(w).scansion).join("");
}

function scansionMatchScore(found: string, known: string) {
  const eps = 1e-5;
  const len = Math.min(found.length, known.length);
  let matching0 = 0;
  let matching1 = 0;
  let known1 = 0;
  for (let i = 0; i < len; i++) {
    if (known[i] === "1") known1++;
    if (found[i] === "0" && known[i] === "0") matching0++;
    if (found[i] === "1" && known[i] === "1") matching1++;
  }
  const matching1Frac = known1 > 0 ? matching1 / known1 - eps : 0;
  return matching0 + matching1Frac;
}

const knownMetersInv: Record<string, string> = {
  "1010": "trochaic bimeter",
  "0101": "iambic bimeter",
};

function getKnownMeter(scansionList: string[]) {
  const matches: string[] = [];
  for (const scansion of scansionList) {
    const sameLen = Object.keys(knownMetersInv).filter((k) => k.length === scansion.length);
    if (!sameLen.length) continue;
    let best: { score: number; meter: string } | null = null;
    for (const k of sameLen) {
      const score = scansionMatchScore(scansion, k);
      const meter = knownMetersInv[k];
      if (!best || score > best.score) best = { score, meter };
    }
    if (best) matches.push(best.meter);
  }

  if (!matches.length) return "unknown";
  const freq = new Map<string, number>();
  for (const m of matches) freq.set(m, (freq.get(m) || 0) + 1);
  return [...freq.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "unknown";
}

function analyzeLocally(lines: string[]) {
  const original_lines = lines;
  const scansion = lines.map(getLineScansion);

  const word_details: MeterLineDetails[] = lines.map((line) => {
    const words = line.split(/\s+/).filter(Boolean);
    const details: MeterDetail[] = words.map((word) => {
      const { scansion, syllables } = getWordScansion(word);
      return {
        word,
        syllable_breakdown: syllables.join("-"),
        scansion,
        syllable_count: syllables.length,
      };
    });
    const total_syllables = details.reduce((acc, d) => acc + d.syllable_count, 0);
    return { details, total_syllables };
  });

  return {
    original_lines,
    scansion,
    word_details,
    combined_lines: original_lines,
    meter: getKnownMeter(scansion),
  };
}

async function tryAnalyzeViaFlask(lines: string[]) {
  const flaskUrl = process.env.METER_API_URL || "http://127.0.0.1:5001/analyze";
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 800);
  try {
    const flaskResponse = await fetch(flaskUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lines }),
      signal: controller.signal,
    });
    if (!flaskResponse.ok) return null;
    return await flaskResponse.json();
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const lines = Array.isArray(body?.lines) ? (body.lines as string[]) : null;

  if (!lines) {
    return new Response(JSON.stringify({ error: "Invalid payload: expected { lines: string[] }" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Em dev/local, tenta usar o Flask (se estiver rodando). Em produção/Vercel, cai no fallback TS.
  const useFlask =
    process.env.METER_API_URL ||
    process.env.NODE_ENV === "development" ||
    process.env.USE_FLASK_METER === "1";

  if (useFlask) {
    const flaskData = await tryAnalyzeViaFlask(lines);
    if (flaskData) {
      return new Response(JSON.stringify(flaskData), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const data = analyzeLocally(lines);
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
