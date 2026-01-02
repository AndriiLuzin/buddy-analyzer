import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { X, Share2, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Share() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [userInitials, setUserInitials] = useState<string>('');
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
        
        // Fetch user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('user_id', session.user.id)
          .single();
        
        if (profile) {
          const fullName = `${profile.first_name} ${profile.last_name}`.trim();
          setUserName(fullName);
          setUserInitials(
            `${profile.first_name?.[0] || ''}${profile.last_name?.[0] || ''}`.toUpperCase()
          );
        }
      }
    };
    fetchUser();
  }, []);
  
  // Generate share URL with referrer ID
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = userId ? `${baseUrl}?ref=${userId}` : baseUrl;

  const shareMessage = t('share.message');

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'BuddyBe',
          text: shareMessage,
          url: shareUrl,
        });
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: t('share.copied'),
        description: t('share.link_copied'),
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: t('common.error'),
        description: t('share.link_copied'),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col bg-background relative overflow-hidden">
      {/* Pattern Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute inset-0 chat-pattern-telegram" />
      </div>

      {/* Main Content - QR Card */}
      <main className="flex-1 flex items-center justify-center px-6 pt-[calc(env(safe-area-inset-top)+2rem)] pb-8 relative z-10">
        <div className="relative w-full max-w-xs">
          {/* Avatar on top */}
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-bold text-2xl border-4 border-background shadow-lg">
              {userInitials || 'BB'}
            </div>
          </div>

          {/* QR Card with animated gradient border */}
          <div className="relative">
            {/* Animated gradient border */}
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 blur-sm animate-gradient-rotate" />
            <div className="absolute -inset-1 rounded-[28px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-gradient-rotate" />
            
            <div className="relative bg-white rounded-3xl p-6 pt-14 shadow-2xl">
              <div className="flex justify-center mb-4">
                <QRCodeSVG 
                  value={shareUrl || 'https://buddybe.app'} 
                  size={200}
                  level="M"
                  includeMargin={false}
                  bgColor="#ffffff"
                  fgColor="#1e40af"
                  imageSettings={{
                    src: '',
                    height: 0,
                    width: 0,
                    excavate: false,
                  }}
                  className="w-[180px] h-[180px] sm:w-[200px] sm:h-[200px]"
                />
              </div>
              <p className="text-center text-xl font-bold text-blue-900">
                @{userName || 'BuddyBe'}
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Sheet */}
      <div className="relative z-10 bg-card rounded-t-3xl border-t border-border/50 shadow-2xl">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X className="w-6 h-6 text-foreground" />
          </button>
          <h2 className="text-lg font-semibold text-foreground">QR Code</h2>
          <ThemeToggle />
        </div>

        {/* Action Buttons */}
        <div className="px-4 pb-4 space-y-3">
          <Button
            onClick={handleNativeShare}
            className="w-full h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-base"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {t('nav.share')} QR Code
          </Button>

          <button
            onClick={handleCopyLink}
            className="w-full flex items-center justify-center gap-2 py-4 text-primary font-medium"
          >
            <QrCode className="w-5 h-5" />
            {copied ? t('share.copied') : t('share.copy')}
          </button>
        </div>

        {/* Safe area padding */}
        <div className="pb-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  );
}