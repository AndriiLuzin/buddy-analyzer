import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { X, Link, Share2, Check, MessageCircle, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal = ({ isOpen, onClose }: ShareModalProps) => {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  
  const shareUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Ссылка скопирована!",
        description: "Теперь вы можете поделиться ею с друзьями",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Ошибка",
        description: "Не удалось скопировать ссылку",
        variant: "destructive",
      });
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Узнай свой тип дружбы',
          text: 'Пройди тест и узнай, какой ты друг! А ещё мы определим вашу совместимость 💫',
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

  const shareToTelegram = () => {
    const text = encodeURIComponent('Пройди тест и узнай свой тип дружбы! 💫');
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`, '_blank');
  };

  const shareToWhatsApp = () => {
    const text = encodeURIComponent('Пройди тест и узнай свой тип дружбы! 💫 ' + shareUrl);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-card border-0 rounded-3xl" hideClose>
        {/* Header */}
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold text-foreground">Поделиться тестом</DialogTitle>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
        </DialogHeader>

        <div className="p-6">
          {/* QR Code */}
          <div className="bg-secondary rounded-2xl p-6 mb-6 flex flex-col items-center">
            <div className="bg-white rounded-xl p-3 mb-4 shadow-soft">
              <QRCodeSVG 
                value={shareUrl || 'https://example.com'} 
                size={140}
                level="M"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#1a1a1a"
              />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Отсканируйте QR-код камерой телефона
            </p>
          </div>

          {/* Share options */}
          <div className="space-y-3 mb-6">
            <p className="text-sm font-medium text-muted-foreground mb-3">Отправить напрямую:</p>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={shareToTelegram}
                className="flex items-center gap-3 p-4 bg-[#0088cc]/10 hover:bg-[#0088cc]/20 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#0088cc] flex items-center justify-center">
                  <Send className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">Telegram</span>
              </button>

              <button
                onClick={shareToWhatsApp}
                className="flex items-center gap-3 p-4 bg-[#25D366]/10 hover:bg-[#25D366]/20 rounded-xl transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-[#25D366] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-medium text-foreground">WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleNativeShare}
              className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
            >
              <Share2 className="w-5 h-5 mr-2" />
              Поделиться
            </Button>

            <Button
              onClick={handleCopyLink}
              variant="outline"
              className="w-full h-12 rounded-xl font-medium"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2 text-green-500" />
                  Скопировано!
                </>
              ) : (
                <>
                  <Link className="w-5 h-5 mr-2" />
                  Скопировать ссылку
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
