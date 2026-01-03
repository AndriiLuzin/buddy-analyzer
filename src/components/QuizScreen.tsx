import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { QUIZ_QUESTIONS_LOCALIZED, getQuestionsByAgeGroup, getAgeGroup, getAgeFromBirthday, AgeGroup } from '@/i18n/quizQuestions';

const QUIZ_PROGRESS_KEY = 'buddybe_quiz_progress';

interface QuizProgress {
  currentQuestion: number;
  answers: number[];
  timestamp: number;
}

interface QuizScreenProps {
  onComplete: (answers: number[]) => void;
  onSkip?: () => void;
  title?: string;
  subtitle?: string;
  showSkip?: boolean;
  birthday?: Date; // Optional birthday for age-based questions
  ageGroup?: AgeGroup; // Direct age group override
}

export const QuizScreen = ({ onComplete, onSkip, title, subtitle, showSkip = false, birthday, ageGroup: providedAgeGroup }: QuizScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { t, language } = useLanguage();

  const displayTitle = title || t('quiz.title');
  const displaySubtitle = subtitle || t('quiz.subtitle');

  // Determine age group from birthday or use provided one, default to adults
  const ageGroup: AgeGroup = providedAgeGroup || (birthday ? getAgeGroup(getAgeFromBirthday(birthday)) : 'adults');
  
  // Get questions based on age group
  const questions = getQuestionsByAgeGroup(ageGroup, language);
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Load saved progress on mount
  useEffect(() => {
    const savedProgress = localStorage.getItem(QUIZ_PROGRESS_KEY);
    if (savedProgress) {
      try {
        const parsed: QuizProgress = JSON.parse(savedProgress);
        // Only restore if less than 24 hours old
        const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && parsed.answers.length > 0) {
          setCurrentQuestion(parsed.currentQuestion);
          setAnswers(parsed.answers);
          // If we have an answer for current question, preselect it
          if (parsed.answers[parsed.currentQuestion] !== undefined) {
            setSelectedOption(parsed.answers[parsed.currentQuestion]);
          }
        }
      } catch (e) {
        console.error('Error loading quiz progress:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save progress whenever answers change
  useEffect(() => {
    if (isLoaded && answers.length > 0) {
      const progress: QuizProgress = {
        currentQuestion,
        answers,
        timestamp: Date.now()
      };
      localStorage.setItem(QUIZ_PROGRESS_KEY, JSON.stringify(progress));
    }
  }, [answers, currentQuestion, isLoaded]);

  // Clear progress when quiz is completed
  const clearProgress = () => {
    localStorage.removeItem(QUIZ_PROGRESS_KEY);
  };

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOption(optionIndex);
  };

  const handleNext = () => {
    if (selectedOption === null) return;

    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedOption(null);
    } else {
      clearProgress();
      onComplete(newAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedOption(answers[currentQuestion - 1] ?? null);
      setAnswers(answers.slice(0, -1));
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col px-4 py-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-[calc(env(safe-area-inset-bottom)+6rem)] animate-fade-in overflow-y-auto">
      {/* Skip & Language selector */}
      <div className="absolute top-[calc(env(safe-area-inset-top)+1rem)] right-4 flex items-center gap-2 z-10">
        {showSkip && onSkip && (
          <button
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {t('quiz.skip')}
          </button>
        )}
        <LanguageSelector />
      </div>

      {/* Header */}
      <div className="text-center mb-6 sm:mb-8 pt-8 sm:pt-8">
        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary mb-3 sm:mb-4">
          <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="text-xs sm:text-sm font-medium">{t('quiz.question')} {currentQuestion + 1} {t('quiz.of')} {questions.length}</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2 px-2">{displayTitle}</h1>
        <p className="text-muted-foreground text-xs sm:text-sm px-2">{displaySubtitle}</p>
      </div>

      {/* Progress */}
      <div className="mb-6 sm:mb-8">
        <Progress value={progress} className="h-1.5 sm:h-2 bg-secondary" />
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col">
        <div className="glass rounded-2xl p-4 sm:p-6 shadow-card mb-4 sm:mb-6 animate-scale-in" key={currentQuestion}>
          <h2 className="text-base sm:text-lg font-semibold text-foreground mb-4 sm:mb-6 leading-relaxed">
            {question.text}
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 border ${
                  selectedOption === index
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card hover:border-primary/50 hover:bg-muted/50'
                }`}
              >
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                  selectedOption === index
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-primary/10 text-primary'
                }`}>
                  {String.fromCharCode(65 + index)}
                </div>
                <span className="font-medium text-sm sm:text-base text-foreground">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-2 sm:gap-3 mt-auto sticky bottom-0 pb-2 bg-background/80 backdrop-blur-sm -mx-4 px-4 pt-2">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-12 sm:h-14 rounded-xl text-sm sm:text-base font-medium"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              {t('quiz.back')}
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="flex-1 h-12 sm:h-14 rounded-xl text-sm sm:text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
                {t('quiz.complete')}
              </>
            ) : (
              <>
                {t('quiz.next')}
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1 sm:ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
