import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, HashRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { LanguageProvider } from "./i18n/LanguageContext";
import { Capacitor } from "@capacitor/core";
import Index from "./pages/Index";
import Chats from "./pages/Chats";
import NotificationsPage from "./pages/Notifications";
import Groups from "./pages/Groups";
import Meetings from "./pages/Meetings";
import Install from "./pages/Install";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  // Capacitor runs from file://, so BrowserRouter history API routing is unreliable there.
  // HashRouter keeps deep-links working on iOS/Android out of the box.
  const Router = Capacitor.isNativePlatform() ? HashRouter : BrowserRouter;

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <Router>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/notifications" element={<Index initialRoute="notifications" />} />
                <Route path="/install" element={<Install />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Router>
          </TooltipProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
