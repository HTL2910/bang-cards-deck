import type { ReactNode } from "react";

export type AppShellProps = {
  title: string;
  subtitle?: string;
  note?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ title, subtitle, note, actions, children }: AppShellProps) {
  return (
    <div className="bang-app-shell">
      <header className="bang-app-header">
        <div>
          <p className="bang-app-header__eyebrow">BANG! Deck</p>
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {actions ? <div className="bang-app-header__actions">{actions}</div> : null}
      </header>
      <main>{children}</main>
      {note ? <footer className="bang-app-footer">{note}</footer> : null}
    </div>
  );
}
