import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Hand, HelpCircle } from 'lucide-react';

const games = [
  {
    id: "spy",
    title: "Шпион",
    description: "Найди того, кто не знает локацию",
    icon: Users,
    path: "/games/spy",
    players: "3-10",
    color: "bg-red-500/20 text-red-500",
  },
  {
    id: "crocodile",
    title: "Крокодил",
    description: "Покажи слово без слов",
    icon: Hand,
    path: "/games/crocodile",
    players: "2-10",
    color: "bg-green-500/20 text-green-500",
  },
  {
    id: "whoami",
    title: "Кто я?",
    description: "Угадай своего персонажа",
    icon: HelpCircle,
    path: "/games/whoami",
    players: "2-10",
    color: "bg-blue-500/20 text-blue-500",
  },
];

const Games = () => {
  const navigate = useNavigate();

  return (
    <div className="h-[100dvh] bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 hover:opacity-70 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-xl font-bold text-foreground">Игры</h1>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6 pb-24">
        <p className="text-muted-foreground text-sm text-center mb-6">
          Выбери игру для компании друзей
        </p>

        <div className="space-y-3">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => navigate(game.path)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors text-left"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${game.color}`}>
                <game.icon className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground">{game.title}</h3>
                <p className="text-sm text-muted-foreground">{game.description}</p>
              </div>
              <span className="text-xs text-muted-foreground bg-background/50 px-2 py-1 rounded">
                {game.players} игроков
              </span>
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Games;
