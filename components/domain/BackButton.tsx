"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import type { ReactElement } from "react";

import { Button } from "@/components/ui/button";

export function BackButton(): ReactElement {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className="cursor-pointer"
      size="sm"
      onClick={() => router.back()}
    >
      <ArrowLeft aria-hidden="true" />
      Retour
    </Button>
  );
}
