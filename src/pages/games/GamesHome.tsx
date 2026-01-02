import { Link, useNavigate } from "react-router-dom";
import { Users, Skull, Hand, HelpCircle, Dice5, ArrowLeft } from "lucide-react";
import { LucideIcon } from "lucide-react";

interface Game {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  players: string;
}

const games: Game[] = [
  {
    id: "impostor",
    title: "Самозванец",
    description: "Найди того, кто не знает слово",
    icon: Users,
    path: "/games/impostor",
    players: "3-20",
  },
  {
    id: "mafia",
    title: "Мафия",
    description: "Город засыпает, просыпается мафия",
    icon: Skull,
    path: "/games/mafia",
    players: "4-20",
  },
  {
    id: "crocodile",
    title: "Крокодил",
    description: "Покажи слово без слов",
    icon: Hand,
    path: "/games/crocodile",
    players: "2-20",
  },
  {
    id: "whoami",
    title: "Кто я?",
    description: "Угадай своего персонажа",
    icon: HelpCircle,
    path: "/games/whoami",
    players: "2-20",
  },
  {
    id: "casino",
    title: "Казино",
    description: "Угадай комбинацию символов",
    icon: Dice5,
    path: "/games/casino",
    players: "3-20",
  },
];

const GamesHome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background">
      <button
        onClick={() => navigate("/")}
        className="absolute top-4 left-4 p-2 hover:opacity-70 transition-opacity"
      >
        <ArrowLeft className="w-5 h-5 text-foreground" />
      </button>

      <div className="w-full max-w-md animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2 text-center">
          ИГРЫ
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          Выбери игру для компании
        </p>

        <div className="space-y-4">
          {games.map((game) => {
            const IconComponent = game.icon;
            return (
              <Link
                key={game.id}
                to={game.path}
                className="block p-6 border border-border rounded-lg hover:bg-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-foreground text-background rounded-lg group-hover:scale-105 transition-transform">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-foreground">
                      {game.title}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {game.description}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {game.players} игроков
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            Больше игр скоро появится
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamesHome;
