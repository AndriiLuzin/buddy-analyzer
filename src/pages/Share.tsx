import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Link, Share2, Check, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

export default function Share() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    fetchUser();
  }, []);
  
  // Generate share URL with referrer ID
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = userId ? `${baseUrl}?ref=${userId}` : baseUrl;

  const shareMessage = t('share.message');

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

  return (
    <div className="h-[100dvh] flex flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background px-4 pt-[calc(env(safe-area-inset-top)+1rem)] pb-4 border-b border-border/50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-foreground">{t('share.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('share.subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">
        {/* QR Code */}
        <div className="bg-secondary rounded-2xl p-6 mb-6 flex flex-col items-center">
          <a 
            href={shareUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white rounded-xl p-3 mb-4 shadow-soft hover:shadow-md transition-shadow cursor-pointer"
          >
            <QRCodeSVG 
              value={shareUrl || 'https://example.com'} 
              size={156}
              level="M"
              includeMargin={false}
              bgColor="#ffffff"
              fgColor="#1a1a1a"
              className="w-[130px] h-[130px] sm:w-[182px] sm:h-[182px]"
            />
          </a>
          <p className="text-sm text-muted-foreground text-center">
            {t('share.qr')}
          </p>
        </div>

        {/* Share options */}
        <div className="space-y-3 mb-6">
          <div className="grid grid-cols-2 gap-3">
            <a
              href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#0088cc] flex items-center justify-center flex-shrink-0">
                <Send className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <span className="font-medium text-foreground truncate">{t('share.telegram')}</span>
            </a>

            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareMessage + ' ' + shareUrl)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors"
            >
              <div className="w-10 h-10 min-w-[40px] min-h-[40px] rounded-full bg-[#25D366] flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-5 h-5 text-white flex-shrink-0" />
              </div>
              <span className="font-medium text-foreground truncate">{t('share.whatsapp')}</span>
            </a>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNativeShare}
            className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
          >
            <Share2 className="w-5 h-5 mr-2" />
            {t('nav.share')}
          </Button>

          <Button
            onClick={handleCopyLink}
            variant="outline"
            className="w-full h-12 rounded-xl font-medium"
          >
            {copied ? (
              <>
                <Check className="w-5 h-5 mr-2 text-green-500" />
                {t('share.copied')}
              </>
            ) : (
              <>
                <Link className="w-5 h-5 mr-2" />
                {t('share.copy')}
              </>
            )}
          </Button>
        </div>
      </main>
    </div>
  );
}