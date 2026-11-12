export interface UserProfile {
  id: string;
  name: string;
  email: string;
  university: string;
  faculty: string;
  major: string;
  studentId: string;
}

export interface SummarySection {
  overview: string;
  mainConcepts: string[];
  importantDefinitions: { term: string; definition: string }[];
  subchapters: { title: string; explanation: string }[];
  terminology: { term: string; meaning: string }[];
  keyPoints: string[];
  finalConclusion: string;
}

export interface Question {
  id: string;
  questionText: string;
  type: 'multiple_choice' | 'true_false';
  options: string[]; // ['A. ...', 'B. ...', 'C. ...', 'D. ...'] or ['A. Benar', 'B. Salah']
  correctAnswer: string; // 'A' | 'B' | 'C' | 'D'
  explanation: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface QuestionConfig {
  count: number; // 5, 10, 15, 20, 30, 50
  difficulty: 'easy' | 'medium' | 'hard';
  type: 'multiple_choice' | 'true_false';
}

export interface LectureMaterial {
  id: string;
  userId: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  charCount: number;
  wordCount: number;
  extractedText: string;
  uploadedAt: string;
  summary?: SummarySection;
  questions?: Question[];
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: string;
  isCorrect: boolean;
}

export interface QuizEvaluation {
  strongTopics: string[];
  weakTopics: string[];
  studyRecommendations: string[];
}

export interface QuizAttempt {
  id: string;
  userId: string;
  materialId: string;
  materialTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number; // 0 - 100
  percentage: number;
  answers: QuizAnswer[];
  questionsSnapshot: Question[];
  evaluatedAt: string;
  evaluation: QuizEvaluation;
}

export interface AssessmentComponent {
  id: string;
  name: string;
  weight: number; // in percentage e.g. 25 for 25%
  isGraded: boolean;
  score: number | null; // 0 - 100 or null if not yet graded
}

export interface GradeBoundary {
  grade: string;
  minScore: number;
}

export interface CourseContract {
  id: string;
  userId: string;
  courseName: string;
  courseCode: string;
  semester: string;
  academicYear: string;
  components: AssessmentComponent[];
  gradeBoundaries: GradeBoundary[];
  targetGrade: string; // 'A', 'AB', 'B', etc.
  customTargetScore?: number;
  updatedAt: string;
}

export interface GradeCalculationResult {
  totalWeight: number;
  gradedWeight: number;
  remainingWeight: number;
  currentContribution: number;
  targetScore: number;
  requiredAverageRemaining: number | null;
  isAchievable: boolean;
  isSecured: boolean;
  isComplete: boolean;
  projectedFinalScore: number;
  projectedFinalGrade: string;
  explanation: string;
}

export interface ScenarioSimulationResult {
  simulatedContribution: number;
  totalGradedAndSimulatedWeight: number;
  remainingUnsimulatedWeight: number;
  projectedScore: number;
  projectedGrade: string;
  requiredAverageUnsimulated: number | null;
  isAchievable: boolean;
  isSecured: boolean;
}
