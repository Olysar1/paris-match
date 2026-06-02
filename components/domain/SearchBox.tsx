"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { parseAsString, useQueryState } from "nuqs";
import { useState, type FormEventHandler, type ReactElement } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEARCH_PATH = "/recherche";

export function SearchBox(): ReactElement {
  const router = useRouter();
  const pathname = usePathname();
  const [query, setQuery] = useQueryState(
    "q",
    parseAsString.withDefault("").withOptions({ shallow: false }),
  );
  const [expanded, setExpanded] = useState(false);
  const [value, setValue] = useState(query);

  function open(): void {
    setValue(query);
    setExpanded(true);
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    const term = value.trim();
    if (!term) {
      return;
    }
    if (pathname === SEARCH_PATH) {
      void setQuery(term);
    } else {
      router.push(`${SEARCH_PATH}?q=${encodeURIComponent(term)}`);
    }
    setExpanded(false);
  };

  if (!expanded) {
    return (
      <Button
        variant="ghost"
        size="sm"
        aria-expanded={false}
        aria-label="Ouvrir la recherche"
        onClick={open}
        className="cursor-pointer"
      >
        <Search aria-hidden="true" />
        <span className="hidden sm:inline">Rechercher</span>
      </Button>
    );
  }

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          setExpanded(false);
        }
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setExpanded(false);
        }
      }}
      className="flex items-center gap-2"
    >
      <Input
        type="search"
        autoFocus
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Rechercher un article…"
        aria-label="Rechercher des articles"
        className="w-44 sm:w-64"
      />
      <Button type="submit" className="cursor-pointer" size="sm">
        <Search aria-hidden="true" />
        <span className="hidden sm:inline">Rechercher</span>
      </Button>
    </form>
  );
}
