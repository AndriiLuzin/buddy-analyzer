import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RotateCcw, Play, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Локации для игры
const locations = [
  { name: "Пляж", hints: ["песок", "море", "солнце", "зонтик"] },
  { name: "Больница", hints: ["врач", "пациент", "палата", "укол"] },
  { name: "Ресторан", hints: ["официант", "меню", "столик", "чаевые"] },
  { name: "Школа", hints: ["учитель", "урок", "доска", "перемена"] },
  { name: "Самолёт", hints: ["стюардесса", "турбулентность", "посадка", "багаж"] },
  { name: "Банк", hints: ["кассир", "сейф", "кредит", "очередь"] },
  { name: "Казино", hints: ["рулетка", "карты", "фишки", "джекпот"] },
  { name: "Цирк", hints: ["клоун", "арена", "акробат", "дрессировщик"] },
  { name: "Полицейский участок", hints: ["детектив", "камера", "допрос", "улики"] },
  { name: "Супермаркет", hints: ["тележка", "касса", "полки", "скидки"] },
  { name: "Кинотеатр", hints: ["попкорн", "экран", "билет", "премьера"] },
  { name: "Спортзал", hints: ["тренер", "гантели", "беговая дорожка", "раздевалка"] },
  { name: "Космический корабль", hints: ["невесомость", "скафандр", "астронавт", "орбита"] },
  { name: "Пиратский корабль", hints: ["капитан", "сокровища", "парус", "абордаж"] },
  { name: "Библиотека", hints: ["книги", "тишина", "читатель", "каталог"] },
  { name: "Зоопарк", hints: ["животные", "клетки", "кормление", "экскурсия"] },
  { name: "Свадьба", hints: ["невеста", "торт", "кольца", "букет"] },
  { name: "Похороны", hints: ["венки", "траур", "прощание", "кладбище"] },
  { name: "Метро", hints: ["эскалатор", "поезд", "станция", "толпа"] },
  { name: "Ночной клуб", hints: ["диджей", "танцпол", "бар", "неон"] },
];

type GameState = "setup" | "playing" | "reveal";

const SpyGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [playerCount, setPlayerCount] = useState(4);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [showRole, setShowRole] = useState(false);
  const [spyIndex, setSpyIndex] = useState<number | null>(null);
  const [location, setLocation] = useState<typeof locations[0] | null>(null);

  const startGame = () => {
    const randomLocation = locations[Math.floor(Math.random() * locations.length)];
    const randomSpy = Math.floor(Math.random() * playerCount);
    setLocation(randomLocation);
    setSpyIndex(randomSpy);
    setCurrentPlayer(0);
    setShowRole(false);
    setGameState("playing");
  };

  const nextPlayer = () => {
    setShowRole(false);
    if (currentPlayer < playerCount - 1) {
      setCurrentPlayer(currentPlayer + 1);
    } else {
      setGameState("reveal");
    }
  };

  const resetGame = () => {
    setGameState("setup");
    setCurrentPlayer(0);
    setShowRole(false);
    setSpyIndex(null);
    setLocation(null);
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
          <h1 className="text-xl font-bold text-foreground">Шпион</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24">
        {gameState === "setup" && (
          <div className="w-full max-w-sm space-y-8 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Шпион</h2>
              <p className="text-muted-foreground text-sm">
                Все игроки кроме шпиона знают локацию. Задавайте вопросы и найдите шпиона!
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Количество игроков
                </label>
                <Input
                  type="number"
                  min={3}
                  max={10}
                  value={playerCount}
                  onChange={(e) => setPlayerCount(Math.min(10, Math.max(3, parseInt(e.target.value) || 3)))}
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
                <li>• Передавайте телефон по кругу</li>
                <li>• Каждый смотрит свою роль тайно</li>
                <li>• Шпион не знает локацию</li>
                <li>• Задавайте вопросы по очереди</li>
                <li>• Голосуйте за шпиона в конце</li>
              </ul>
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
            <div className="text-muted-foreground text-sm">
              Игрок {currentPlayer + 1} из {playerCount}
            </div>

            <div className="bg-secondary/50 rounded-2xl p-8">
              {!showRole ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                    <EyeOff className="w-12 h-12 text-primary" />
                  </div>
                  <p className="text-lg font-medium text-foreground">
                    Игрок {currentPlayer + 1}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Убедись, что другие не видят экран
                  </p>
                  <Button onClick={() => setShowRole(true)} size="lg" className="w-full">
                    <Eye className="w-5 h-5 mr-2" />
                    Показать роль
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {currentPlayer === spyIndex ? (
                    <>
                      <div className="w-24 h-24 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                        <span className="text-5xl">🕵️</span>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-red-500 mb-2">
                          Ты ШПИОН!
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Ты не знаешь локацию. Слушай вопросы и пытайся угадать!
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                        <span className="text-5xl">📍</span>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Локация:
                        </p>
                        <p className="text-3xl font-bold text-foreground">
                          {location?.name}
                        </p>
                      </div>
                    </>
                  )}
                  <Button onClick={nextPlayer} size="lg" className="w-full">
                    {currentPlayer < playerCount - 1 ? "Следующий игрок" : "Начать обсуждение"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === "reveal" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
            <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
              <span className="text-5xl">🎉</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground">
              Время обсуждения!
            </h2>

            <p className="text-muted-foreground">
              Задавайте вопросы по очереди и голосуйте за шпиона
            </p>

            <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
              <p className="text-sm text-muted-foreground">Подсказки для вопросов:</p>
              <div className="flex flex-wrap gap-2 justify-center">
                {location?.hints.map((hint, i) => (
                  <span key={i} className="bg-background px-3 py-1 rounded-full text-sm text-foreground">
                    {hint}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-sm text-muted-foreground mb-1">Шпион был:</p>
              <p className="text-xl font-bold text-red-500">Игрок {(spyIndex ?? 0) + 1}</p>
              <p className="text-sm text-muted-foreground mt-1">Локация: {location?.name}</p>
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

export default SpyGame;
