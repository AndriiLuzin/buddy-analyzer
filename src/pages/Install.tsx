import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/i18n/LanguageContext";
import { Download, Smartphone, Share, MoreVertical, Plus, Check, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const Install = () => {
  const { t } = useLanguage();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true);
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="h-[100dvh] bg-background p-4 sm:p-6 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-6">
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t("install.back")}
        </Link>

        <div className="text-center space-y-2">
          <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg">
            <span className="text-3xl font-bold text-primary-foreground">B</span>
          </div>
          <h1 className="text-2xl font-bold">{t("install.title")}</h1>
          <p className="text-muted-foreground">{t("install.subtitle")}</p>
        </div>

        {isInstalled ? (
          <Card className="border-green-500/50 bg-green-500/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 text-green-500">
                <Check className="w-6 h-6" />
                <span className="font-medium">{t("install.already_installed")}</span>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {deferredPrompt && (
              <Button onClick={handleInstall} size="lg" className="w-full gap-2">
                <Download className="w-5 h-5" />
                {t("install.install_button")}
              </Button>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5" />
                  {isIOS ? t("install.ios_title") : t("install.android_title")}
                </CardTitle>
                <CardDescription>
                  {t("install.manual_instruction")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isIOS ? (
                  <div className="space-y-4">
                    <Step number={1} icon={<Share className="w-5 h-5" />}>
                      {t("install.ios_step1")}
                    </Step>
                    <Step number={2} icon={<Plus className="w-5 h-5" />}>
                      {t("install.ios_step2")}
                    </Step>
                    <Step number={3} icon={<Check className="w-5 h-5" />}>
                      {t("install.ios_step3")}
                    </Step>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Step number={1} icon={<MoreVertical className="w-5 h-5" />}>
                      {t("install.android_step1")}
                    </Step>
                    <Step number={2} icon={<Download className="w-5 h-5" />}>
                      {t("install.android_step2")}
                    </Step>
                    <Step number={3} icon={<Check className="w-5 h-5" />}>
                      {t("install.android_step3")}
                    </Step>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("install.benefits_title")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{t("install.benefit1")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{t("install.benefit2")}</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                    <span>{t("install.benefit3")}</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

const Step = ({ number, icon, children }: { number: number; icon: React.ReactNode; children: React.ReactNode }) => (
  <div className="flex items-start gap-4">
    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold shrink-0">
      {number}
    </div>
    <div className="flex items-center gap-2 pt-1">
      <span className="text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </div>
  </div>
);

export default Install;
