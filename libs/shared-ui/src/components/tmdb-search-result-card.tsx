"use client";

import React from "react";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Image,
} from "@heroui/react";

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
    <Card data-testid={`tmdb-result-card-${result.id}`} shadow="sm" radius="sm">
      <CardBody>
        <div className="grid grid-cols-[72px_minmax(0,1fr)] gap-3">
          {result.posterUrl ? (
            <Image
              src={result.posterUrl}
              alt=""
              width={72}
              height={108}
              radius="sm"
              className="h-[108px] w-[72px] object-cover"
            />
          ) : (
            <div className="h-[108px] w-[72px] rounded-small bg-default-100" />
          )}
          <div className="min-w-0 space-y-2">
            <div className="flex flex-wrap items-start gap-2">
              <h2 className="text-base font-semibold leading-6">{result.title}</h2>
              <Chip size="sm" variant="flat" color={result.mediaKind === "tv" ? "secondary" : "default"}>
                {result.mediaKind === "tv" ? "TV" : "Movie"}
              </Chip>
              <Chip size="sm" variant="flat">{getReleaseYear(result.releaseDate)}</Chip>
            </div>
            {result.originalTitle && result.originalTitle !== result.title && (
              <p className="text-sm text-default-500">{result.originalTitle}</p>
            )}
            <p className="line-clamp-3 text-sm text-default-600">{result.overview}</p>
            <Button
              data-testid={`tmdb-result-${result.id}`}
              size="sm"
              variant="flat"
              color="primary"
              onPress={() => onSelect?.(result)}
            >
              {selectLabel}
            </Button>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default TmdbSearchResultCard;
