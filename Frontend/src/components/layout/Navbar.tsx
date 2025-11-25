import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Moon, Sun, Menu, X, Zap, Languages } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement | null>(null);
  const location = useLocation();
  const { t, i18n } = useTranslation();
  const ariaLabels = {
    primaryNav: t('nav.ariaPrimary', { defaultValue: 'Primary navigation' }),
    themeToggle: t('nav.ariaThemeToggle', { defaultValue: 'Toggle color theme' }),
    openMenu: t('nav.ariaOpenMenu', { defaultValue: 'Open menu' }),
    closeMenu: t('nav.ariaCloseMenu', { defaultValue: 'Close menu' }),
  };

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove preload class after initial load
    root.classList.remove('preload');
    
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    
    // Modern theme transition with View Transition API (if supported)
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        setTheme(theme === "dark" ? "light" : "dark");
      });
    } else {
      // Fallback for browsers without View Transition API
      setTheme(theme === "dark" ? "light" : "dark");
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  const navItems = [
    { name: t('nav.home'), path: "/" },
    { name: t('nav.docs'), path: "/docs" },
    { name: t('nav.examples'), path: "/examples" },
    { name: t('nav.playground'), path: "/playground" },
    { name: t('nav.status'), path: "/status" },
    { name: t('nav.donate'), path: "/donate" },
  ];

  const isActive = (path: string) => location.pathname === path;

  const iconButtonClasses = "touch-target rounded-full bg-transparent hover:bg-secondary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background transition-colors";

  return (
    <>
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:backdrop-blur-xl" aria-label={ariaLabels.primaryNav}>
      <div className="container mx-auto safe-px">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-3">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-1.5 sm:gap-2 font-bold text-lg sm:text-xl min-w-0">
            <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-primary flex-shrink-0" />
            <span className="truncate">{t('footer.brand')}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 lg:px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive(item.path)
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center gap-2">
            {/* Language Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('language.select')} className={iconButtonClasses}>
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-50">
                <DropdownMenuItem
                  onClick={() => changeLanguage('en')}
                  className={i18n.language === 'en' ? 'bg-accent' : ''}
                >
                  🇬🇧 {t('language.en')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage('tr')}
                  className={i18n.language === 'tr' ? 'bg-accent' : ''}
                >
                  🇹🇷 {t('language.tr')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClasses}
              onClick={toggleTheme}
              aria-label={ariaLabels.themeToggle}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Language Selector Mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label={t('language.select')} className={iconButtonClasses}>
                  <Languages className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-background z-50">
                <DropdownMenuItem
                  onClick={() => changeLanguage('en')}
                  className={i18n.language === 'en' ? 'bg-accent' : ''}
                >
                  🇬🇧 {t('language.en')}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => changeLanguage('tr')}
                  className={i18n.language === 'tr' ? 'bg-accent' : ''}
                >
                  🇹🇷 {t('language.tr')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              className={iconButtonClasses}
              onClick={toggleTheme}
              aria-label={ariaLabels.themeToggle}
            >
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              ref={menuButtonRef}
              className={iconButtonClasses}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              aria-label={isMenuOpen ? ariaLabels.closeMenu : ariaLabels.openMenu}
              onClick={() => setIsMenuOpen((prev) => !prev)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
            <div
              id="mobile-navigation"
              role="menu"
              aria-label={ariaLabels.primaryNav}
              className="flex flex-col gap-1.5 rounded-xl sm:rounded-2xl border border-border bg-card/98 backdrop-blur-sm p-3 sm:p-4 shadow-lg"
            >
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  role="menuitem"
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl text-base font-medium transition-colors min-h-[44px] flex items-center ${
                    isActive(item.path)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
      </nav>
      {isMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-label={ariaLabels.closeMenu}
          onClick={() => {
            setIsMenuOpen(false);
            menuButtonRef.current?.focus();
          }}
        />
      )}
    </>
  );
};
