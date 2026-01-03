import { Dialog, DialogContent } from './ui/dialog';
import { 
  MessageCircle, 
  Share2, 
  Send,
  Copy,
  Check,
  X
} from 'lucide-react';
import { useState } from 'react';
import { useToast } from '../hooks/use-toast';

interface MessageShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
  friendName: string;
  friendUserId?: string;
  onSendInApp?: () => void;
}

export const MessageShareModal = ({
  isOpen,
  onClose,
  message,
  friendName,
  friendUserId,
  onSendInApp
}: MessageShareModalProps) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleShareExternal = async () => {
    // Check if Web Share API is available
    if (navigator.share) {
      try {
        await navigator.share({
          text: message,
        });
        onClose();
      } catch (error) {
        // User cancelled or error
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
      }
    } else {
      // Fallback - copy to clipboard
      handleCopy();
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    toast({
      title: "Скопировано!",
      description: "Отличный шаг. Вы поддержали важную связь",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendInApp = () => {
    if (onSendInApp) {
      onSendInApp();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 gap-0 bg-background border rounded-2xl">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Отправить сообщение</h3>
        </div>

        {/* Message preview */}
        <div className="p-4 bg-muted/30 border-b border-border">
          <p className="text-foreground text-base leading-relaxed">{message}</p>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-2">
          {/* Send in app */}
          {friendUserId && (
            <button
              onClick={handleSendInApp}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-primary/10 hover:bg-primary/20 transition-all text-left"
            >
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Send className="w-5 h-5 text-primary-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-foreground">Отправить {friendName}</p>
                <p className="text-sm text-muted-foreground">В чат приложения</p>
              </div>
            </button>
          )}

          {/* Share to messengers */}
          <button
            onClick={handleShareExternal}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-muted transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Поделиться</p>
              <p className="text-sm text-muted-foreground">WhatsApp, Telegram, SMS...</p>
            </div>
          </button>

          {/* Copy */}
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 p-4 rounded-xl bg-card border border-border hover:bg-muted transition-all text-left"
          >
            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
              {copied ? (
                <Check className="w-5 h-5 text-green-500" />
              ) : (
                <Copy className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">
                {copied ? 'Скопировано!' : 'Скопировать'}
              </p>
              <p className="text-sm text-muted-foreground">В буфер обмена</p>
            </div>
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};