import Link from "next/link";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";

export default function NotFound(): ReactElement {
  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-sm font-semibold tracking-[0.25em] text-brand uppercase">
        Erreur 404
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Page introuvable
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        La page que vous recherchez n’existe pas ou n’est plus disponible.
      </p>
      <Button asChild className="mt-6">
        <Link href="/">Retour à l’accueil</Link>
      </Button>
    </div>
  );
}
