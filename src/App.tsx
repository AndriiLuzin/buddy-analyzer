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
import GroupCreate from "./pages/GroupCreate";
import GroupEdit from "./pages/GroupEdit";
import Meetings from "./pages/Meetings";
import MeetingCreate from "./pages/MeetingCreate";
import Install from "./pages/Install";
import Admin from "./pages/Admin";
import FriendProfile from "./pages/FriendProfile";
import FriendDateCreate from "./pages/FriendDateCreate";
import FriendDateEdit from "./pages/FriendDateEdit";
import FriendActions from "./pages/FriendActions";
import Share from "./pages/Share";
import Chat from "./pages/Chat";
import Games from "./pages/Games";
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
                <Route path="/friend/:friendId" element={<FriendProfile />} />
                <Route path="/friend/:friendId/date/create" element={<FriendDateCreate />} />
                <Route path="/friend/:friendId/date/:dateId/edit" element={<FriendDateEdit />} />
                <Route path="/friend/:friendId/actions" element={<FriendActions />} />
                <Route path="/chats" element={<Chats />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/groups/create" element={<GroupCreate />} />
                <Route path="/groups/:groupId/edit" element={<GroupEdit />} />
                <Route path="/meetings" element={<Meetings />} />
                <Route path="/meetings/create" element={<MeetingCreate />} />
                <Route path="/share" element={<Share />} />
                <Route path="/games" element={<Games />} />
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
