"use client";

import Link from "next/link";
import { useEffect, type ReactElement } from "react";

import { Button } from "@/components/ui/button";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function Error({ error, reset }: ErrorProps): ReactElement {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <p className="font-heading text-sm font-semibold tracking-[0.25em] text-brand uppercase">
        Une erreur est survenue
      </p>
      <h1 className="mt-3 font-heading text-3xl font-bold tracking-tight sm:text-4xl">
        Quelque chose s’est mal passé
      </h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Impossible d’afficher cette page pour le moment. Veuillez réessayer.
      </p>
      <div className="mt-6 flex gap-3">
        <Button onClick={reset}>Réessayer</Button>
        <Button asChild variant="outline">
          <Link href="/">Retour à l’accueil</Link>
        </Button>
      </div>
    </div>
  );
}
