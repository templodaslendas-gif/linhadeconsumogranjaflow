export type CurvePoint = {
  day: number;
  week: number;
  phase: string;
  daily: number;
  accumulated: number;
};

export type PhaseDefinition = {
  name: string;
  shortName: string;
  startDay: number;
  endDay: number;
  officialTotal: number;
  color: string;
  pale: string;
  unclassified?: boolean;
};

export const dailyValues = [
  1.25, 1.25, 1.3, 1.3, 1.35, 1.35, 1.4,
  1.4, 1.4, 1.45, 1.45, 1.45, 1.5, 1.5,
  1.5, 1.55, 1.55, 1.55, 1.6, 1.6, 1.6,
  1.65, 1.65, 1.65, 1.7, 1.7, 1.7, 1.75,
  1.75, 1.75, 1.8, 1.8, 1.8, 1.85, 1.85,
  1.85, 1.9, 1.9, 1.9, 2, 2, 2,
  2.1, 2.1, 2.1, 2.15, 2.15, 2.15, 2.2,
  2.2, 2.25, 2.25, 2.3, 2.3, 2.35, 2.35,
  2.4, 2.4, 2.45, 2.45, 2.5, 2.5, 2.55,
  2.55, 2.6, 2.6, 2.65, 2.65, 2.7, 2.7,
  2.75, 2.75, 2.75, 2.75, 2.8, 2.8, 2.8,
  2.8, 2.85, 2.85, 2.85, 2.85, 2.85, 2.9,
  2.9, 2.9, 2.9, 2.9, 2.95, 2.95, 2.95,
  2.95, 2.95, 2.95, 3, 3, 3, 3,
  3, 3.1, 3.1, 3.1, 3.1, 3.1, 3.1,
  3.15, 3.15, 3.15, 3.15, 3.15, 3.15, 3.15,
] as const;

export const phases: PhaseDefinition[] = [
  { name: "ALOJAM", shortName: "Alojamento", startDay: 1, endDay: 12, officialTotal: 16.35, color: "#009B3A", pale: "#DDF4E5" },
  { name: "CRESC", shortName: "Crescimento", startDay: 13, endDay: 34, officialTotal: 36.5, color: "#32B34A", pale: "#E8F7EA" },
  { name: "EXTRA I", shortName: "Extra I", startDay: 35, endDay: 46, officialTotal: 23.85, color: "#FFCD00", pale: "#FFF5BF" },
  { name: "TERM I", shortName: "Terminação I", startDay: 47, endDay: 66, officialTotal: 47.5, color: "#075A8C", pale: "#E2EFF7" },
  { name: "EXTRA II", shortName: "Extra II", startDay: 67, endDay: 78, officialTotal: 32.9, color: "#18A999", pale: "#E1F5F2" },
  { name: "TERM II", shortName: "Terminação II", startDay: 79, endDay: 105, officialTotal: 80.05, color: "#063B64", pale: "#E0EAF1" },
  { name: "NÃO INFORMADA", shortName: "Sem fase", startDay: 106, endDay: 112, officialTotal: 22.05, color: "#E3A900", pale: "#FFF1BA", unclassified: true },
];

export function phaseForDay(day: number) {
  return phases.find((phase) => day >= phase.startDay && day <= phase.endDay) ?? phases.at(-1)!;
}

let runningTotal = 0;

export const curveData: CurvePoint[] = dailyValues.map((daily, index) => {
  const day = index + 1;
  runningTotal = Math.round((runningTotal + daily) * 100) / 100;
  return {
    day,
    week: Math.ceil(day / 7),
    phase: phaseForDay(day).name,
    daily,
    accumulated: runningTotal,
  };
});

export const weeklyData = Array.from({ length: 16 }, (_, index) => {
  const week = index + 1;
  const entries = curveData.filter((point) => point.week === week);
  const total = Math.round(entries.reduce((sum, point) => sum + point.daily, 0) * 100) / 100;
  return {
    week,
    total,
    average: Math.round((total / entries.length) * 100) / 100,
  };
});

export const officialPhaseTotal = 237.15;
export const finalCurveTotal = 259.2;
