import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Users, UserCheck, Calendar, MessageSquare, TrendingUp, Clock, Cake, Activity, CalendarIcon } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/i18n/LanguageContext';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { format, subDays, eachDayOfInterval, differenceInDays } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';


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

interface DailyActivity {
  date: string;
  label: string;
  users: number;
  friends: number;
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
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [chartStartDate, setChartStartDate] = useState<Date>(subDays(new Date(), 6));
  const [chartEndDate, setChartEndDate] = useState<Date>(new Date());
  const [allProfiles, setAllProfiles] = useState<{created_at: string}[]>([]);
  const [allFriendsData, setAllFriendsData] = useState<{created_at: string}[]>([]);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
        return;
      }
      
      setUser(session.user);
      
      // Check if user has admin role in user_roles table
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (roleData) {
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

      // Load all profiles and friends for chart
      const { data: profilesData } = await supabase.from('profiles').select('created_at');
      const { data: friendsData } = await supabase.from('friends').select('created_at');
      
      setAllProfiles(profilesData || []);
      setAllFriendsData(friendsData || []);

    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Update chart when date range changes
  useEffect(() => {
    if (allProfiles.length === 0 && allFriendsData.length === 0) return;
    
    const days = eachDayOfInterval({ start: chartStartDate, end: chartEndDate });
    const activityData: DailyActivity[] = days.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      const label = format(date, 'dd.MM');
      
      const usersCount = allProfiles.filter(p => 
        p.created_at.startsWith(dateStr)
      ).length;
      
      const friendsCount = allFriendsData.filter(f => 
        f.created_at.startsWith(dateStr)
      ).length;
      
      return { date: dateStr, label, users: usersCount, friends: friendsCount };
    });
    
    setDailyActivity(activityData);
  }, [chartStartDate, chartEndDate, allProfiles, allFriendsData]);

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
      <div className="h-[100dvh] bg-background flex items-center justify-center overflow-hidden">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="h-[100dvh] bg-background flex flex-col items-center justify-center p-6 overflow-hidden">
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
    <div className="h-[100dvh] bg-background animate-fade-in flex flex-col overflow-hidden">
      {/* Header */}
      <header className="shrink-0 z-20 glass-strong px-4 pt-8 pb-4">
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
      <main className="flex-1 overflow-y-auto px-3 py-3 space-y-2 pb-24">
        {/* Main Stats - Each on its own row */}
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

        {/* Activity Chart with Date Filter */}
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-foreground flex items-center gap-2">
              📈 {t('admin.activity_chart')}
            </h3>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {format(chartStartDate, 'dd.MM.yy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 bg-card" align="start">
                <CalendarComponent
                  mode="single"
                  selected={chartStartDate}
                  onSelect={(date) => date && setChartStartDate(date)}
                  disabled={(date) => date > chartEndDate || date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-muted-foreground self-center text-sm">—</span>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {format(chartEndDate, 'dd.MM.yy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50 bg-card" align="start">
                <CalendarComponent
                  mode="single"
                  selected={chartEndDate}
                  onSelect={(date) => date && setChartEndDate(date)}
                  disabled={(date) => date < chartStartDate || date > new Date()}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground self-center ml-auto">
              {differenceInDays(chartEndDate, chartStartDate) + 1} {t('admin.days')}
            </span>
          </div>
          
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFriends" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="label" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                  allowDecimals={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                  labelStyle={{ color: 'hsl(var(--foreground))' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="users" 
                  stroke="hsl(var(--primary))" 
                  fillOpacity={1} 
                  fill="url(#colorUsers)"
                  name={t('admin.users')}
                />
                <Area 
                  type="monotone" 
                  dataKey="friends" 
                  stroke="#14b8a6" 
                  fillOpacity={1} 
                  fill="url(#colorFriends)"
                  name={t('admin.friends')}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">{t('admin.users')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full bg-teal-500" />
              <span className="text-xs text-muted-foreground">{t('admin.friends')}</span>
            </div>
          </div>
        </div>

        {/* Today Stats */}
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
            🕐 {t('admin.today')}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stats?.usersToday || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin.new_users')}</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-foreground">{stats?.friendsToday || 0}</p>
              <p className="text-xs text-muted-foreground">{t('admin.new_friends')}</p>
            </div>
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-card rounded-2xl p-4 shadow-sm">
          <h3 className="text-base font-medium text-foreground mb-3 flex items-center gap-2">
            👥 {t('admin.recent_registrations')}
          </h3>
          <div className="space-y-2">
            {recentUsers.map((user) => (
              <div 
                key={user.id}
                className="flex items-center gap-3 p-2.5 rounded-xl bg-secondary/50"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  user.category ? getCategoryColor(user.category) : 'bg-muted'
                }`}>
                  {user.first_name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.first_name} {user.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(user.created_at).toLocaleDateString(language === 'en' ? 'en-US' : language === 'ru' ? 'ru-RU' : language, {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                {user.category && (
                  <span className="text-xs px-2 py-1 rounded-full bg-background">
                    {getCategoryLabel(user.category).split(' ')[0]}
                  </span>
                )}
              </div>
            ))}
            {recentUsers.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-3">
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
  <div className="bg-card rounded-2xl p-4 shadow-sm flex items-center justify-between">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
        {icon}
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
    <p className="text-2xl font-bold text-foreground">{value}</p>
  </div>
);

export default Admin;
