import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gamepad2 } from 'lucide-react';

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
      <main className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-6">
          <Gamepad2 className="w-10 h-10 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">Скоро здесь будут игры</h2>
        <p className="text-muted-foreground text-center max-w-xs">
          Мы работаем над интересными играми для вас и ваших друзей
        </p>
      </main>
    </div>
  );
};

export default Games;
