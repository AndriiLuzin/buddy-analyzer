import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Link, Share2, Check, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/i18n/LanguageContext';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
}

export const ShareModal = ({ isOpen, onClose, userId }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { t } = useLanguage();
  
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-0 rounded-3xl" hideClose>
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">{t('share.title')}</DialogTitle>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-2">{t('share.subtitle')}</p>
        </DialogHeader>

        <div className="p-6">
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
                size={140}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
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
        </div>
      </DialogContent>
    </Dialog>
  );
};
