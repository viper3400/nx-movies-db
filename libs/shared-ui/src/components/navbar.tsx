"use client";

import { ThemeSwitch } from "./theme-switch";
import { NavbarUserSummary } from "./navbar-user-summary";
import { SceneLogo, GithubIcon } from "../icons/icons";
import { Fragment, useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";

export interface NavbarMenuLink {
  href: string;
  label: string;
}

export interface NavbarComponentProperties {
  brandLabel?: string;
  menuLinks: NavbarMenuLink[];
  userName?: string;
  userImage?: string;
  userEmail?: string;
  handleSignOut?: () => void;
  handleGoogleLogout?: () => void;
  handleGithubLogout?: () => void;
}

function navActionClassName(intent: "primary" | "danger" | "warning" | "secondary" = "primary") {
  const intentClasses = {
    primary: "border-accent/30 bg-accent/10 text-accent hover:bg-accent/15",
    danger: "border-danger/30 bg-danger/10 text-danger hover:bg-danger/15",
    warning: "border-warning/30 bg-warning/10 text-warning hover:bg-warning/15",
    secondary: "border-accent/30 bg-accent/10 text-accent hover:bg-accent/15",
  };

  return `flex min-h-11 w-full items-center justify-center rounded-[12px] border px-4 py-2 text-sm font-medium transition-colors ${intentClasses[intent]}`;
}

export const NavbarComponent = ({
  brandLabel = "Filmdatenbank",
  menuLinks,
  userName,
  userImage,
  userEmail,
  handleSignOut,
  handleGoogleLogout,
  handleGithubLogout
}: NavbarComponentProperties) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const menuId = useId();
  const isGoogleUser = !!handleGoogleLogout && !!userEmail?.match(/@(gmail\.com|.*\.google\.com)$/);
  const isGithubUser = !!handleGithubLogout && !!userEmail?.includes("@github.com");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const menuOverlay = (
    <div
      id={menuId}
      data-testid="navbar-menu-overlay"
      className="fixed inset-0 z-[70] overflow-y-auto bg-background/95 px-4 pb-6 pt-20 supports-[backdrop-filter]:bg-background/90 backdrop-blur-sm"
    >
      <button
        type="button"
        aria-label="Close navigation menu"
        data-testid="navbar-menu-close"
        onClick={() => setIsMenuOpen(false)}
        className="fixed right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-default-200 bg-default-100/70 text-foreground transition-colors hover:bg-default-200/70"
      >
        <span aria-hidden="true" className="text-2xl leading-none">×</span>
      </button>
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        {userEmail && (
          <div className="w-full">
            <NavbarUserSummary userName={userName} userImage={userImage} userEmail={userEmail} />
          </div>
        )}

        {userEmail && (
          <>
            {menuLinks.map((menuLink) => (
              <Fragment key={menuLink.href}>
                <div className="h-px w-full bg-default-200" />
                <div className="w-full md:w-auto">
                  <a
                    href={menuLink.href}
                    className={navActionClassName("primary")}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {menuLink.label}
                  </a>
                </div>
              </Fragment>
            ))}
            {handleSignOut && (
              <>
                <div className="h-px w-full bg-default-200" />
                <div className="w-full md:w-auto">
                  <button
                    type="button"
                    className={navActionClassName("danger")}
                    onClick={() => {
                      handleSignOut();
                      setIsMenuOpen(false);
                    }}
                  >
                    HomeWeb Logout
                  </button>
                </div>
              </>
            )}
            {isGoogleUser && (
              <>
                <div className="h-px w-full bg-default-200" />
                <div className="w-full md:w-auto">
                  <button
                    type="button"
                    className={navActionClassName("warning")}
                    onClick={() => {
                      handleGoogleLogout?.();
                      setIsMenuOpen(false);
                    }}
                  >
                    Google Logout
                  </button>
                </div>
              </>
            )}
            {isGithubUser && (
              <>
                <div className="h-px w-full bg-default-200" />
                <div className="w-full md:w-auto">
                  <button
                    type="button"
                    className={`${navActionClassName("secondary")} gap-2`}
                    onClick={() => {
                      handleGithubLogout?.();
                      setIsMenuOpen(false);
                    }}
                  >
                    <GithubIcon size={18} />
                    Github Logout
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );

  return (
    <nav
      className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
      aria-label="Primary"
    >
      <div className="mx-auto flex min-h-16 w-full items-center justify-between gap-4 px-4">
        <div data-testid="NavbarBrand" className="flex min-w-0 items-center gap-4">
          <SceneLogo />
          <p className="truncate font-bold text-inherit">{brandLabel}</p>
        </div>

        <div className="flex items-center gap-2">
          <ThemeSwitch />
          <button
            type="button"
            aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            data-testid="navbar-menu-toggle"
            aria-expanded={isMenuOpen}
            aria-controls={menuId}
            onClick={() => setIsMenuOpen((open) => !open)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-[12px] border border-default-200 bg-default-100/70 text-foreground transition-colors hover:bg-default-200/70"
          >
            <span className="sr-only">{isMenuOpen ? "Close navigation menu" : "Open navigation menu"}</span>
            <span className="flex flex-col gap-1.5" aria-hidden="true">
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${isMenuOpen ? "translate-y-2 rotate-45" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-opacity ${isMenuOpen ? "opacity-0" : ""}`} />
              <span className={`block h-0.5 w-5 rounded-full bg-current transition-transform ${isMenuOpen ? "-translate-y-2 -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </div>
      <div className="mx-4 border-b border-default" />

      {isMenuOpen && isMounted && createPortal(menuOverlay, document.body)}
    </nav>
  );
};

export default NavbarComponent;
