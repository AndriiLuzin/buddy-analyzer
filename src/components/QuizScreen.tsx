import { useState } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/i18n/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { QUIZ_QUESTIONS_LOCALIZED } from '@/i18n/quizQuestions';

interface QuizScreenProps {
  onComplete: (answers: number[]) => void;
  title?: string;
  subtitle?: string;
}

export const QuizScreen = ({ onComplete, title, subtitle }: QuizScreenProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const { t, language } = useLanguage();

  const displayTitle = title || t('quiz.title');
  const displaySubtitle = subtitle || t('quiz.subtitle');

  const questions = QUIZ_QUESTIONS_LOCALIZED[language];
  const question = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

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
    <div className="min-h-screen flex flex-col p-4 pb-24 animate-fade-in">
      {/* Language selector */}
      <div className="absolute top-4 right-4">
        <LanguageSelector />
      </div>

      {/* Header */}
      <div className="text-center mb-8 pt-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
          <Sparkles className="w-4 h-4" />
          <span className="text-sm font-medium">{t('quiz.question')} {currentQuestion + 1} {t('quiz.of')} {questions.length}</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{displayTitle}</h1>
        <p className="text-muted-foreground text-sm">{displaySubtitle}</p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <Progress value={progress} className="h-2 bg-secondary" />
      </div>

      {/* Question Card */}
      <div className="flex-1 flex flex-col">
        <div className="glass rounded-2xl p-6 shadow-card mb-6 animate-scale-in" key={currentQuestion}>
          <h2 className="text-lg font-semibold text-foreground mb-6 leading-relaxed">
            {question.text}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleOptionSelect(index)}
                className={`w-full p-4 rounded-xl text-left transition-all duration-200 border-2 ${
                  selectedOption === index
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-card/50 text-foreground hover:border-primary/50 hover:bg-primary/5'
                }`}
              >
                <span className="font-medium">{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-auto">
          {currentQuestion > 0 && (
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex-1 h-14 rounded-xl text-base font-medium"
            >
              <ChevronLeft className="w-5 h-5 mr-2" />
              {t('quiz.back')}
            </Button>
          )}
          <Button
            onClick={handleNext}
            disabled={selectedOption === null}
            className="flex-1 h-14 rounded-xl text-base font-medium bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50"
          >
            {currentQuestion === questions.length - 1 ? (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                {t('quiz.complete')}
              </>
            ) : (
              <>
                {t('quiz.next')}
                <ChevronRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
