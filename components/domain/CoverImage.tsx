import Image from "next/image";
import type { ReactElement } from "react";

import type { ArticleImage } from "@/domain/article/article";
import { cn } from "@/lib/utils";

interface CoverImageProps {
  image: ArticleImage | null;
  sizes: string;
  priority?: boolean;
  className?: string;
}

export function CoverImage({
  image,
  sizes,
  priority = false,
  className,
}: CoverImageProps): ReactElement {
  if (!image) {
    return (
      <div
        aria-hidden="true"
        className={cn(
          "flex h-full w-full items-center justify-center bg-muted",
          className,
        )}
      >
        <span className="font-heading text-lg font-semibold tracking-tight text-muted-foreground">
          Paris&nbsp;Match
        </span>
      </div>
    );
  }

  return (
    <Image
      src={image.url}
      alt={image.alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
    />
  );
}
