import { Link, useNavigate } from "react-router-dom";
import { Users, Skull, Hand, HelpCircle, Dice5, ArrowLeft } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface Game {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: LucideIcon;
  path: string;
  playersKey: string;
}

const games: Game[] = [
  {
    id: "impostor",
    titleKey: "games.impostor.title",
    descriptionKey: "games.impostor.description",
    icon: Users,
    path: "/games/impostor",
    playersKey: "games.impostor.players_range",
  },
  {
    id: "mafia",
    titleKey: "games.mafia.title",
    descriptionKey: "games.mafia.description",
    icon: Skull,
    path: "/games/mafia",
    playersKey: "games.mafia.players_range",
  },
  {
    id: "crocodile",
    titleKey: "games.crocodile.title",
    descriptionKey: "games.crocodile.description",
    icon: Hand,
    path: "/games/crocodile",
    playersKey: "games.crocodile.players_range",
  },
  {
    id: "whoami",
    titleKey: "games.whoami.title",
    descriptionKey: "games.whoami.description",
    icon: HelpCircle,
    path: "/games/whoami",
    playersKey: "games.whoami.players_range",
  },
  {
    id: "casino",
    titleKey: "games.casino.title",
    descriptionKey: "games.casino.description",
    icon: Dice5,
    path: "/games/casino",
    playersKey: "games.casino.players_range",
  },
];

const GamesHome = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

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
          {t("games.title")}
        </h1>
        <p className="text-muted-foreground text-sm text-center mb-12">
          {t("games.subtitle")}
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
                      {t(game.titleKey)}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {t(game.descriptionKey)}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {t(game.playersKey)} {t("games.players")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-16 text-center">
          <p className="text-xs text-muted-foreground">
            {t("games.more_coming")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamesHome;