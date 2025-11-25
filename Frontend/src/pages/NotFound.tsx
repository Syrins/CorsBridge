import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const location = useLocation();
  const { t } = useTranslation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background safe-px">
        <div className="text-center space-y-4" aria-live="polite">
          <p className="text-6xl font-bold text-muted-foreground">404</p>
          <p className="text-xl text-muted-foreground">{t('notFound.title')}</p>
          <p className="text-sm text-muted-foreground">{t('notFound.description')}</p>
        </div>
    </div>
  );
};

export default NotFound;
