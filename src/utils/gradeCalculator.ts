import {
  AssessmentComponent,
  GradeBoundary,
  GradeCalculationResult,
  ScenarioSimulationResult,
} from '../types';

export const DEFAULT_GRADE_BOUNDARIES: GradeBoundary[] = [
  { grade: 'A', minScore: 85 },
  { grade: 'AB', minScore: 80 },
  { grade: 'B', minScore: 75 },
  { grade: 'BC', minScore: 70 },
  { grade: 'C', minScore: 65 },
  { grade: 'D', minScore: 55 },
  { grade: 'E', minScore: 0 },
];

export function determineGradeFromScore(
  score: number,
  boundaries: GradeBoundary[] = DEFAULT_GRADE_BOUNDARIES
): string {
  // Sort descending by minScore
  const sorted = [...boundaries].sort((a, b) => b.minScore - a.minScore);
  for (const b of sorted) {
    if (score >= b.minScore) {
      return b.grade;
    }
  }
  return sorted[sorted.length - 1]?.grade || 'E';
}

export function validateWeights(components: AssessmentComponent[]): {
  isValid: boolean;
  totalWeight: number;
  message: string;
} {
  const total = components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  const rounded = Math.round(total * 100) / 100;

  if (Math.abs(rounded - 100) < 0.01) {
    return {
      isValid: true,
      totalWeight: 100,
      message: 'Total bobot valid (100%).',
    };
  }

  return {
    isValid: false,
    totalWeight: rounded,
    message: `Total bobot komponen saat ini adalah ${rounded}%. Total bobot penilaian harus tepat 100%. Silakan sesuaikan bobot komponen.`,
  };
}

export function calculateGradePrediction(
  components: AssessmentComponent[],
  targetScore: number,
  boundaries: GradeBoundary[] = DEFAULT_GRADE_BOUNDARIES
): GradeCalculationResult {
  const totalWeight = components.reduce((sum, c) => sum + (Number(c.weight) || 0), 0);
  let gradedWeight = 0;
  let currentContribution = 0;

  for (const comp of components) {
    // Only components marked as isGraded and having a non-null score
    if (comp.isGraded && comp.score !== null && comp.score !== undefined) {
      const validScore = Math.min(100, Math.max(0, Number(comp.score)));
      gradedWeight += Number(comp.weight) || 0;
      currentContribution += (validScore * (Number(comp.weight) || 0)) / 100;
    }
  }

  gradedWeight = Math.round(gradedWeight * 100) / 100;
  currentContribution = Math.round(currentContribution * 100) / 100;
  const remainingWeight = Math.max(0, Math.round((100 - gradedWeight) * 100) / 100);

  const isComplete = remainingWeight <= 0.001;

  let requiredAverageRemaining: number | null = null;
  let isAchievable = true;
  let isSecured = false;
  let explanation = '';

  if (isComplete) {
    // All components graded
    const finalScore = Math.round(currentContribution * 100) / 100;
    const finalGrade = determineGradeFromScore(finalScore, boundaries);
    requiredAverageRemaining = 0;
    isSecured = finalScore >= targetScore;
    isAchievable = finalScore >= targetScore;

    explanation = `Seluruh komponen evaluasi (${gradedWeight}%) telah selesai dinilai. Nilai akhir aktual Anda adalah ${finalScore.toFixed(
      2
    )} dengan predikat ${finalGrade}. ${
      finalScore >= targetScore
        ? `Selamat! Target nilai ${targetScore} berhasil dicapai.`
        : `Target nilai ${targetScore} belum tercapai pada semester ini.`
    }`;

    return {
      totalWeight,
      gradedWeight,
      remainingWeight: 0,
      currentContribution,
      targetScore,
      requiredAverageRemaining,
      isAchievable,
      isSecured,
      isComplete: true,
      projectedFinalScore: finalScore,
      projectedFinalGrade: finalGrade,
      explanation,
    };
  }

  // Calculate needed points
  const pointsNeeded = targetScore - currentContribution;
  const rawRequiredAverage = (pointsNeeded / remainingWeight) * 100;
  requiredAverageRemaining = Math.round(rawRequiredAverage * 100) / 100;

  if (requiredAverageRemaining > 100) {
    isAchievable = false;
    isSecured = false;
    const maxPossible = Math.round((currentContribution + (100 * remainingWeight) / 100) * 100) / 100;
    const maxGrade = determineGradeFromScore(maxPossible, boundaries);
    explanation = `Target nilai ${targetScore} tidak dapat dicapai secara matematis berdasarkan sisa komponen evaluasi (${remainingWeight}%). Rata-rata nilai yang dibutuhkan adalah ${requiredAverageRemaining.toFixed(
      2
    )} (melebihi batas maksimal 100). Nilai akhir tertinggi yang mungkin diraih jika seluruh sisa komponen mendapat nilai 100 adalah ${maxPossible.toFixed(
      2
    )} (${maxGrade}).`;
  } else if (requiredAverageRemaining <= 0) {
    isAchievable = true;
    isSecured = true;
    explanation = `Target nilai ${targetScore} telah AMAN secara matematis! Kontribusi nilai Anda saat ini (${currentContribution.toFixed(
      2
    )} poin) sudah melampaui target minimum, bahkan jika seluruh sisa komponen (${remainingWeight}%) mendapatkan nilai 0.`;
  } else {
    isAchievable = true;
    isSecured = false;
    explanation = `Untuk meraih target nilai ${targetScore}, Anda membutuhkan rata-rata minimal ${requiredAverageRemaining.toFixed(
      2
    )} pada seluruh sisa komponen penilaian (${remainingWeight}%).`;
  }

  // Projected grade assuming student gets their current average or required score
  const projectedFinalScore = isAchievable
    ? Math.min(100, Math.max(currentContribution, targetScore))
    : Math.round((currentContribution + (100 * remainingWeight) / 100) * 100) / 100;
  const projectedFinalGrade = determineGradeFromScore(projectedFinalScore, boundaries);

  return {
    totalWeight,
    gradedWeight,
    remainingWeight,
    currentContribution,
    targetScore,
    requiredAverageRemaining,
    isAchievable,
    isSecured,
    isComplete: false,
    projectedFinalScore,
    projectedFinalGrade,
    explanation,
  };
}

export function simulateScenario(
  components: AssessmentComponent[],
  targetScore: number,
  simulatedScores: Record<string, number>, // componentId -> hypothetical score (0 - 100)
  boundaries: GradeBoundary[] = DEFAULT_GRADE_BOUNDARIES
): ScenarioSimulationResult {
  let gradedWeight = 0;
  let currentContribution = 0;
  let simulatedWeight = 0;
  let simulatedContribution = 0;

  for (const comp of components) {
    if (comp.isGraded && comp.score !== null) {
      const validScore = Math.min(100, Math.max(0, Number(comp.score)));
      gradedWeight += Number(comp.weight) || 0;
      currentContribution += (validScore * (Number(comp.weight) || 0)) / 100;
    } else if (simulatedScores[comp.id] !== undefined && simulatedScores[comp.id] !== null) {
      const simScore = Math.min(100, Math.max(0, Number(simulatedScores[comp.id])));
      simulatedWeight += Number(comp.weight) || 0;
      simulatedContribution += (simScore * (Number(comp.weight) || 0)) / 100;
    }
  }

  const totalGradedAndSimulatedWeight = Math.round((gradedWeight + simulatedWeight) * 100) / 100;
  const remainingUnsimulatedWeight = Math.max(0, Math.round((100 - totalGradedAndSimulatedWeight) * 100) / 100);
  const totalEarnedSoFar = Math.round((currentContribution + simulatedContribution) * 100) / 100;

  let requiredAverageUnsimulated: number | null = null;
  let isAchievable = true;
  let isSecured = false;

  if (remainingUnsimulatedWeight <= 0.001) {
    requiredAverageUnsimulated = 0;
    isSecured = totalEarnedSoFar >= targetScore;
    isAchievable = totalEarnedSoFar >= targetScore;
  } else {
    const pointsNeeded = targetScore - totalEarnedSoFar;
    const req = (pointsNeeded / remainingUnsimulatedWeight) * 100;
    requiredAverageUnsimulated = Math.round(req * 100) / 100;

    if (requiredAverageUnsimulated > 100) {
      isAchievable = false;
      isSecured = false;
    } else if (requiredAverageUnsimulated <= 0) {
      isAchievable = true;
      isSecured = true;
    } else {
      isAchievable = true;
      isSecured = false;
    }
  }

  const projectedScore = totalEarnedSoFar;
  const projectedGrade = determineGradeFromScore(projectedScore, boundaries);

  return {
    simulatedContribution: Math.round(simulatedContribution * 100) / 100,
    totalGradedAndSimulatedWeight,
    remainingUnsimulatedWeight,
    projectedScore,
    projectedGrade,
    requiredAverageUnsimulated,
    isAchievable,
    isSecured,
  };
}
