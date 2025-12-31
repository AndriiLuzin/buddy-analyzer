import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, UserCheck, Calendar, MessageSquare, TrendingUp, Clock, Cake, Activity } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/i18n/LanguageContext';

// Allowed admin email addresses
const ADMIN_EMAILS = ['andrii@luzin.ca'];

interface AdminStats {
  totalUsers: number;
  totalFriends: number;
  totalGroups: number;
  totalMeetings: number;
  totalMessages: number;
  usersWithQuiz: number;
  usersToday: number;
  friendsToday: number;
}

interface RecentUser {
  id: string;
  first_name: string;
  last_name: string;
  created_at: string;
  category: string | null;
}

interface CategoryDistribution {
  category: string;
  count: number;
}

const Admin = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [categoryDistribution, setCategoryDistribution] = useState<CategoryDistribution[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      setUser(session.user);
      
      // Check if user is admin
      if (ADMIN_EMAILS.includes(session.user.email || '')) {
        setIsAdmin(true);
        await loadStats();
      } else {
        setIsAdmin(false);
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, [navigate]);

  const loadStats = async () => {
    try {
      const [
        { count: totalUsers },
        { count: totalFriends },
        { count: totalGroups },
        { count: totalMeetings },
        { count: totalMessages },
        { data: profiles },
        { data: recentProfiles }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('friends').select('*', { count: 'exact', head: true }),
        supabase.from('groups').select('*', { count: 'exact', head: true }),
        supabase.from('meetings').select('*', { count: 'exact', head: true }),
        supabase.from('messages').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('category'),
        supabase.from('profiles').select('id, first_name, last_name, created_at, category').order('created_at', { ascending: false }).limit(10)
      ]);

      const usersWithQuiz = profiles?.filter(p => p.category)?.length || 0;

      const today = new Date().toISOString().split('T')[0];
      const { count: usersToday } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);
      
      const { count: friendsToday } = await supabase
        .from('friends')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', today);

      const categoryCount: Record<string, number> = {};
      profiles?.forEach(p => {
        if (p.category) {
          categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
        }
      });
      
      const distribution = Object.entries(categoryCount).map(([category, count]) => ({
        category,
        count
      })).sort((a, b) => b.count - a.count);

      setStats({
        totalUsers: totalUsers || 0,
        totalFriends: totalFriends || 0,
        totalGroups: totalGroups || 0,
        totalMeetings: totalMeetings || 0,
        totalMessages: totalMessages || 0,
        usersWithQuiz,
        usersToday: usersToday || 0,
        friendsToday: friendsToday || 0
      });

      setRecentUsers(recentProfiles || []);
      setCategoryDistribution(distribution);

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      soul_mate: `💫 ${t('category.soul_mate')}`,
      close_friend: `❤️ ${t('category.close_friend')}`,
      good_buddy: `🤝 ${t('category.good_buddy')}`,
      situational: `👋 ${t('category.situational')}`,
      distant: `🌙 ${t('category.distant')}`
    };
    return labels[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      soul_mate: 'bg-amber-500',
      close_friend: 'bg-orange-500',
      good_buddy: 'bg-teal-500',
      situational: 'bg-blue-500',
      distant: 'bg-slate-400'
    };
    return colors[category] || 'bg-muted';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
        <div className="text-6xl mb-4">🔒</div>
        <h1 className="text-xl font-bold text-foreground mb-2">{t('admin.access_denied')}</h1>
        <p className="text-muted-foreground text-center mb-6">
          {t('admin.no_access')}
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-xl font-medium"
        >
          {t('admin.back_home')}
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <header className="sticky top-0 z-20 glass-strong px-4 pt-8 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/')}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">{t('admin.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('admin.stats')}</p>
          </div>
          <button
            onClick={loadStats}
            className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Activity className="w-5 h-5 text-primary" />
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="px-3 py-3 space-y-2 pb-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label={t('admin.users')}
            value={stats?.totalUsers || 0}
            color="bg-primary/10 text-primary"
          />
          <StatCard
            icon={<UserCheck className="w-4 h-4" />}
            label={t('admin.friends')}
            value={stats?.totalFriends || 0}
            color="bg-teal-500/10 text-teal-500"
          />
          <StatCard
            icon={<Users className="w-4 h-4" />}
            label={t('admin.groups')}
            value={stats?.totalGroups || 0}
            color="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            icon={<Calendar className="w-4 h-4" />}
            label={t('admin.meetings')}
            value={stats?.totalMeetings || 0}
            color="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            icon={<MessageSquare className="w-4 h-4" />}
            label={t('admin.messages')}
            value={stats?.totalMessages || 0}
            color="bg-pink-500/10 text-pink-500"
          />
          <StatCard
            icon={<TrendingUp className="w-4 h-4" />}
            label={t('admin.with_quiz')}
            value={stats?.usersWithQuiz || 0}
            color="bg-purple-500/10 text-purple-500"
          />
        </div>

        {/* Today Stats */}
        <div className="glass rounded-xl p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {t('admin.today')}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-secondary/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats?.usersToday || 0}</p>
              <p className="text-[10px] text-muted-foreground">{t('admin.new_users')}</p>
            </div>
            <div className="bg-secondary/50 rounded-lg p-2 text-center">
              <p className="text-lg font-bold text-foreground">{stats?.friendsToday || 0}</p>
              <p className="text-[10px] text-muted-foreground">{t('admin.new_friends')}</p>
            </div>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="glass rounded-xl p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Cake className="w-3.5 h-3.5 text-primary" />
            {t('admin.category_distribution')}
          </h3>
          <div className="space-y-1.5">
            {categoryDistribution.map(({ category, count }) => {
              const total = stats?.usersWithQuiz || 1;
              const percentage = Math.round((count / total) * 100);
              
              return (
                <div key={category} className="space-y-0.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-foreground">{getCategoryLabel(category)}</span>
                    <span className="text-muted-foreground">{count} ({percentage}%)</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${getCategoryColor(category)} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
            {categoryDistribution.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {t('admin.no_category_data')}
              </p>
            )}
          </div>
        </div>

        {/* Recent Users */}
        <div className="glass rounded-xl p-3">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-primary" />
            {t('admin.recent_registrations')}
          </h3>
          <div className="space-y-1.5">
            {recentUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-secondary/50"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                  user.category ? getCategoryColor(user.category) : 'bg-muted'
                }`}>
                  {user.first_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : language, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {user.category && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-background">
                    {getCategoryLabel(user.category).split(' ')[0]}
                  </span>
                )}
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                {t('admin.no_registrations')}
              </p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

const StatCard = ({ icon, label, value, color }: StatCardProps) => (
  <div className="glass rounded-xl p-2.5">
    <div className={`w-7 h-7 rounded-lg ${color} flex items-center justify-center mb-1`}>
      {icon}
    </div>
    <p className="text-lg font-bold text-foreground">{value}</p>
    <p className="text-[10px] text-muted-foreground leading-tight">{label}</p>
  </div>
);

export default Admin;
