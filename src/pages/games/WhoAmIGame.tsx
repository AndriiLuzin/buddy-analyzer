import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Eye, EyeOff, RotateCcw, Play, HelpCircle, ChevronRight, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Персонажи по категориям
const charactersByCategory: Record<string, string[]> = {
  "Знаменитости": ["Илон Маск", "Дональд Трамп", "Ким Кардашьян", "Криштиану Роналду", "Билл Гейтс", "Опра Уинфри"],
  "Персонажи фильмов": ["Джек Воробей", "Дарт Вейдер", "Гарри Поттер", "Шрек", "Терминатор", "Джокер", "Эльза"],
  "Мультперсонажи": ["Микки Маус", "Спанч Боб", "Том и Джерри", "Симба", "Рапунцель", "Миньон", "Маша"],
  "Исторические личности": ["Наполеон", "Клеопатра", "Эйнштейн", "Леонардо да Винчи", "Чингисхан", "Гагарин"],
  "Сказочные персонажи": ["Баба Яга", "Золушка", "Красная Шапочка", "Кот в сапогах", "Пиноккио", "Снежная королева"],
  "Супергерои": ["Бэтмен", "Человек-паук", "Супермен", "Железный человек", "Халк", "Чудо-женщина"],
};

const allCharacters = Object.values(charactersByCategory).flat();

type GameState = "setup" | "assigning" | "playing";

interface Player {
  name: string;
  character: string;
  guessed: boolean;
}

const WhoAmIGame = () => {
  const navigate = useNavigate();
  const [gameState, setGameState] = useState<GameState>("setup");
  const [players, setPlayers] = useState<Player[]>([]);
  const [newPlayerName, setNewPlayerName] = useState("");
  const [currentAssigning, setCurrentAssigning] = useState(0);
  const [showCharacter, setShowCharacter] = useState(false);
  const [currentCharacter, setCurrentCharacter] = useState("");

  const addPlayer = () => {
    if (newPlayerName.trim() && players.length < 10) {
      setPlayers([...players, { name: newPlayerName.trim(), character: "", guessed: false }]);
      setNewPlayerName("");
    }
  };

  const removePlayer = (index: number) => {
    setPlayers(players.filter((_, i) => i !== index));
  };

  const startAssigning = () => {
    if (players.length >= 2) {
      setCurrentAssigning(0);
      setShowCharacter(false);
      setGameState("assigning");
    }
  };

  const getRandomCharacter = () => {
    const usedCharacters = players.map(p => p.character);
    const available = allCharacters.filter(c => !usedCharacters.includes(c));
    if (available.length === 0) return allCharacters[Math.floor(Math.random() * allCharacters.length)];
    return available[Math.floor(Math.random() * available.length)];
  };

  const assignCharacter = () => {
    const character = currentCharacter || getRandomCharacter();
    const updatedPlayers = [...players];
    // Assign character to NEXT player (the one who will guess)
    const targetIndex = (currentAssigning + 1) % players.length;
    updatedPlayers[targetIndex].character = character;
    setPlayers(updatedPlayers);
    
    setShowCharacter(false);
    setCurrentCharacter("");
    
    if (currentAssigning < players.length - 1) {
      setCurrentAssigning(currentAssigning + 1);
    } else {
      setGameState("playing");
    }
  };

  const prepareAssignment = () => {
    setCurrentCharacter(getRandomCharacter());
    setShowCharacter(true);
  };

  const toggleGuessed = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].guessed = !updatedPlayers[index].guessed;
    setPlayers(updatedPlayers);
  };

  const resetGame = () => {
    setGameState("setup");
    setPlayers([]);
    setCurrentAssigning(0);
    setShowCharacter(false);
    setCurrentCharacter("");
  };

  const allGuessed = players.every(p => p.guessed);

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
          <h1 className="text-xl font-bold text-foreground">Кто я?</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-24 overflow-y-auto">
        {gameState === "setup" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Кто я?</h2>
              <p className="text-muted-foreground text-sm">
                Угадай персонажа на своём лбу, задавая вопросы!
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Имя игрока"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPlayer()}
                  className="flex-1"
                />
                <Button onClick={addPlayer} size="icon" disabled={!newPlayerName.trim() || players.length >= 10}>
                  <Plus className="w-5 h-5" />
                </Button>
              </div>

              {players.length > 0 && (
                <div className="bg-secondary/50 rounded-xl p-3 space-y-2">
                  {players.map((player, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-foreground">{player.name}</span>
                      <button onClick={() => removePlayer(index)} className="p-1 hover:opacity-70">
                        <X className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <Button 
                onClick={startAssigning} 
                className="w-full" 
                size="lg"
                disabled={players.length < 2}
              >
                <Play className="w-5 h-5 mr-2" />
                Начать ({players.length} игроков)
              </Button>
            </div>

            <div className="bg-secondary/50 rounded-xl p-4">
              <h3 className="font-semibold text-foreground mb-2">Правила:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Каждый загадывает персонажа соседу</li>
                <li>• Персонаж "на лбу" — ты не видишь</li>
                <li>• Задавай вопросы с ответом да/нет</li>
                <li>• Угадай своего персонажа!</li>
              </ul>
            </div>
          </div>
        )}

        {gameState === "assigning" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in text-center">
            <p className="text-muted-foreground text-sm">
              Игрок {currentAssigning + 1} из {players.length}
            </p>

            <div className="bg-secondary/50 rounded-2xl p-8">
              {!showCharacter ? (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                    <EyeOff className="w-12 h-12 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground mb-1">
                      {players[currentAssigning].name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Загадай персонажа для: <strong>{players[(currentAssigning + 1) % players.length].name}</strong>
                    </p>
                  </div>
                  <Button onClick={prepareAssignment} size="lg" className="w-full">
                    <Eye className="w-5 h-5 mr-2" />
                    Показать персонажа
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="w-24 h-24 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto">
                    <span className="text-5xl">🎭</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Персонаж для {players[(currentAssigning + 1) % players.length].name}:
                    </p>
                    <p className="text-2xl font-bold text-foreground">
                      {currentCharacter}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Покажи этого персонажа на лоб {players[(currentAssigning + 1) % players.length].name}
                  </p>
                  <Button onClick={assignCharacter} size="lg" className="w-full">
                    <ChevronRight className="w-5 h-5 mr-2" />
                    {currentAssigning < players.length - 1 ? "Следующий" : "Начать игру"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {gameState === "playing" && (
          <div className="w-full max-w-sm space-y-6 animate-fade-in">
            <div className="text-center">
              <h2 className="text-xl font-bold text-foreground mb-2">
                {allGuessed ? "Все угадали! 🎉" : "Угадывайте персонажей!"}
              </h2>
              <p className="text-muted-foreground text-sm">
                Задавайте вопросы с ответом да/нет
              </p>
            </div>

            <div className="space-y-3">
              {players.map((player, index) => (
                <button
                  key={index}
                  onClick={() => toggleGuessed(index)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-colors text-left ${
                    player.guessed 
                      ? "bg-green-500/20 border border-green-500/30" 
                      : "bg-secondary/50 hover:bg-secondary"
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    player.guessed ? "bg-green-500" : "bg-blue-500/20"
                  }`}>
                    {player.guessed ? (
                      <span className="text-white text-lg">✓</span>
                    ) : (
                      <HelpCircle className="w-5 h-5 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{player.name}</p>
                    <p className={`text-sm ${player.guessed ? "text-green-500" : "text-muted-foreground"}`}>
                      {player.guessed ? player.character : "???"}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <Button onClick={resetGame} size="lg" className="w-full" variant={allGuessed ? "default" : "outline"}>
              <RotateCcw className="w-5 h-5 mr-2" />
              Играть снова
            </Button>
          </div>
        )}
      </main>
    </div>
  );
};

export default WhoAmIGame;
