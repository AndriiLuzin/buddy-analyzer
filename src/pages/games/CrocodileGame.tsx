import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RotateCcw, Play, Hand, Timer, Check, X, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Слова для игры по категориям
const wordsByCategory: Record<string, string[]> = {
  "Животные": ["Кошка", "Собака", "Слон", "Жираф", "Крокодил", "Обезьяна", "Пингвин", "Бабочка", "Змея", "Лев"],
  "Профессии": ["Врач", "Пожарный", "Учитель", "Повар", "Художник", "Музыкант", "Пилот", "Фотограф", "Танцор", "Клоун"],
  "Действия": ["Плавать", "Бегать", "Прыгать", "Танцевать", "Петь", "Спать", "Есть", "Чихать", "Смеяться", "Плакать"],
  "Предметы": ["Зонтик", "Телефон", "Часы", "Зеркало", "Ключ", "Лампа", "Книга", "Чашка", "Ножницы", "Пылесос"],
  "Еда": ["Пицца", "Мороженое", "Спагетти", "Суп", "Бутерброд", "Торт", "Арбуз", "Банан", "Яичница", "Шашлык"],
  "Фильмы/Персонажи": ["Гарри Поттер", "Шрек", "Человек-паук", "Эльза", "Бэтмен", "Йода", "Джек Воробей", "Терминатор", "Рапунцель", "Миньон"],
};

const allWords = Object.entries(wordsByCategory).flatMap(([category, words]) => 
  words.map(word => ({ word, category }))
);

type GameState = "setup" | "showing" | "guessing" | "result";

const CrocodileGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [roundTime, setRoundTime] = useState(60);
  const [timeLeft, setTimeLeft] = useState(60);
  const [showWord, setShowWord] = useState(false);
  const [currentWord, setCurrentWord] = useState<{ word: string; category: string } | null>(null);
  const [score, setScore] = useState({ guessed: 0, skipped: 0 });
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const getRandomWord = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * allWords.length);
    return allWords[randomIndex];
  }, []);

  const startGame = () => {
    setCurrentWord(getRandomWord());
    setTimeLeft(roundTime);
    setShowWord(false);
    setScore({ guessed: 0, skipped: 0 });
    setGameState("showing");
  };

  const startGuessing = () => {
    setShowWord(false);
    setIsTimerRunning(true);
    setGameState("guessing");
  };

  const handleGuessed = () => {
    setScore(prev => ({ ...prev, guessed: prev.guessed + 1 }));
    setCurrentWord(getRandomWord());
  };

  const handleSkip = () => {
    setScore(prev => ({ ...prev, skipped: prev.skipped + 1 }));
    setCurrentWord(getRandomWord());
  };

  const resetGame = () => {
    setGameState("setup");
    setTimeLeft(roundTime);
    setShowWord(false);
    setCurrentWord(null);
    setScore({ guessed: 0, skipped: 0 });
    setIsTimerRunning(false);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      setGameState("result");
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => gameState === "setup" ? navigate("/games") : resetGame()}
            className="p-2 -ml-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Крокодил</h1>
          {gameState === "guessing" && (
            <div className="ml-auto flex items-center gap-2 text-lg font-mono">
              <Timer className="w-5 h-5 text-muted-foreground" />
              <span className={timeLeft <= 10 ? "text-red-500" : "text-foreground"}>
                {formatTime(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {gameState === "setup" && (
          <div className="w-full max-w-sm space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Hand className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Крокодил</h2>
              <p className="text-muted-foreground text-sm">
                Объясни слово жестами, без слов и звуков!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Время раунда (секунды)
                </label>
                <Input
                  type="number"
                  min={30}
                  max={180}
                  step={10}
                  value={roundTime}
                  onChange={(e) => setRoundTime(Math.min(180, Math.max(30, parseInt(e.target.value) || 60)))}
                  className="text-center text-lg"
                />
              </div>

              <Button onClick={startGame} className="w-full" size="lg">
                <Play className="w-5 h-5 mr-2" />
                Начать игру
              </Button>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2">Правила:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Показывающий смотрит слово тайно</li>
                <li>• Объясняй только жестами</li>
                <li>• Нельзя говорить и издавать звуки</li>
                <li>• Угадали — получаете очко</li>
                <li>• Можно пропустить слово</li>
              </ul>
            </div>
          </div>
        )}

        {gameState === "showing" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
            <p className="text-muted-foreground text-sm">
              Только показывающий смотрит слово!
            </p>

            <div className="bg-secondary/50 rounded-2xl p-8">
              {!showWord ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                    <EyeOff className="w-12 h-12 text-green-500" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    Готов показывать?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Убедись, что другие не видят экран
                  </p>
                  <Button onClick={() => setShowWord(true)} size="lg" className="w-full">
                    <Eye className="w-5 h-5 mr-2" />
                    Показать слово
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                    <span className="text-5xl">🎭</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {currentWord?.category}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {currentWord?.word}
                    </p>
                  </div>
                  <Button onClick={startGuessing} size="lg" className="w-full">
                    Запомнил, начинаем!
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === "guessing" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
            <div className="bg-secondary/50 rounded-2xl p-8">
              <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-6">
                <Hand className="w-12 h-12 text-green-500" />
              </div>
              
              <p className="text-xl font-medium text-foreground mb-2">
                Покажи слово!
              </p>
              <p className="text-sm text-muted-foreground mb-6">
                Только жесты, без слов и звуков
              </p>

              <div className="flex gap-3">
                <Button 
                  onClick={handleGuessed} 
                  size="lg" 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  <Check className="w-5 h-5 mr-2" />
                  Угадали
                </Button>
                <Button 
                  onClick={handleSkip} 
                  size="lg" 
                  variant="outline"
                  className="flex-1"
                >
                  <SkipForward className="w-5 h-5 mr-2" />
                  Пропуск
                </Button>
              </div>
            </div>

            <div className="flex justify-center gap-8 text-center">
              <div>
                <p className="text-3xl font-bold text-green-500">{score.guessed}</p>
                <p className="text-xs text-muted-foreground">Угадано</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-muted-foreground">{score.skipped}</p>
                <p className="text-xs text-muted-foreground">Пропущено</p>
              </div>
            </div>
          </div>
        )}

        {gameState === "result" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <span className="text-5xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Время вышло!
            </h2>

            <div className="bg-secondary/50 rounded-xl p-6">
              <div className="flex justify-center gap-12 mb-4">
                <div>
                  <p className="text-4xl font-bold text-green-500">{score.guessed}</p>
                  <p className="text-sm text-muted-foreground">Угадано</p>
                </div>
                <div>
                  <p className="text-4xl font-bold text-muted-foreground">{score.skipped}</p>
                  <p className="text-sm text-muted-foreground">Пропущено</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                {score.guessed >= 5 ? "Отличный результат! 🔥" : 
                 score.guessed >= 3 ? "Хорошая работа! 👍" : 
                 "Попробуй ещё раз! 💪"}
              </p>
            </div>

            <Button onClick={resetGame} size="lg" className="w-full">
              <RotateCcw className="w-5 h-5 mr-2" />
              Играть снова
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default CrocodileGame;
