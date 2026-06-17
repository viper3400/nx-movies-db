"use client";

import React from "react";
import Image from "next/image";
import { Button, Card, Chip } from "@heroui-v3/react";

export type TmdbSearchResultMediaKind = "movie" | "tv";

export interface TmdbSearchResultItem {
  id: number;
  mediaKind: TmdbSearchResultMediaKind;
  title: string;
  originalTitle: string;
  overview: string;
  releaseDate: string | null;
  posterUrl: string | null;
}

export interface TmdbSearchResultCardProps {
  result: TmdbSearchResultItem;
  onSelect?: (result: TmdbSearchResultItem) => void;
  selectLabel?: string;
}

function getReleaseYear(releaseDate: string | null): string {
  return releaseDate ? releaseDate.slice(0, 4) : "n/a";
}

export const TmdbSearchResultCard: React.FC<TmdbSearchResultCardProps> = ({
  result,
  onSelect,
  selectLabel = "Select",
}) => {
  return (
    <Card data-testid={`tmdb-result-card-${result.id}`} className="rounded-sm shadow-sm">
      <Card.Content>
        <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
          {result.posterUrl ? (
            <Image
              src={result.posterUrl}
              alt=""
              width={72}
              height={108}
              unoptimized
              className="h-[108px] w-[72px] rounded-small object-cover"
            />
          ) : (
            <div className="h-[108px] w-[72px] rounded-small bg-default-100" />
          )}
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="text-base font-semibold leading-6">{result.title}</h2>
              <Chip size="sm" variant="tertiary" color={result.mediaKind === "tv" ? "accent" : "default"}>
                {result.mediaKind === "tv" ? "TV" : "Movie"}
              </Chip>
              <Chip size="sm" variant="tertiary">{getReleaseYear(result.releaseDate)}</Chip>
            </div>
            {result.originalTitle && result.originalTitle !== result.title && (
              <p className="text-sm text-default-500">{result.originalTitle}</p>
            )}
            <p className="line-clamp-3 text-sm text-default-600">{result.overview}</p>
            <Button
              data-testid={`tmdb-result-${result.id}`}
              size="sm"
              variant="tertiary"
              onPress={() => onSelect?.(result)}
            >
              {selectLabel}
            </Button>
          </div>
        </div>
      </Card.Content>
    </Card>
  );
};

export default TmdbSearchResultCard;
