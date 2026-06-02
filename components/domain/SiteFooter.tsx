import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const YEAR = new Date().getFullYear();

export function SiteFooter(): ReactElement {
  return (
    <footer className="border-t bg-muted/30">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <p className="font-heading text-lg font-bold tracking-tight text-brand">
          Paris Match
        </p>
        <p className="mt-2 max-w-prose text-sm text-muted-foreground">
          Projet de démonstration. Les contenus (titres, résumés et images)
          proviennent du flux RSS public de Le Monde et restent la propriété de
          leurs auteurs.
        </p>
        <Button asChild variant="link" className="mt-1 h-auto px-0">
          <a
            href="https://www.lemonde.fr/international/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Source : Le Monde — International
          </a>
        </Button>
        <Separator className="my-6" />
        <p className="text-xs text-muted-foreground">
          © {YEAR} Paris Match — projet de démonstration technique.
        </p>
      </div>
    </footer>
  );
}
