import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider, ScrollShadow } from "@heroui/react";
import Image from "next/image";
import { Movie, UserFlagsDTO } from "../interfaces";
import { useEffect, useState } from "react";
import { UserFlagButton } from "./user-flag-button";
import { EyeOutlined } from "../icons/eye-outlined";
import { DatePickerModal } from "./datepicker-modal";
import { DeleteSeenDateModal } from "./delete-seen-date-modal";
import { TvNextOutlined } from "../icons";
import { SeenChips } from "./seen-chips";
import { t } from "i18next";

export interface MovieCardLangResources {
  seenTodayLabel: string;
  chooseDateLabel: string;
  deletedEntryLabel: string;
}
export interface MovieCardProps {
  movie: Movie;
  imageUrl: string;
  bodyBackgroundImageUrl?: string;
  detailsUrl?: string;
  editUrl?: string;
  showDetailsButton?: boolean;
  showMarkAsSeenButtons?: boolean;
  loadSeenDatesForMovie: (movieId: string) => Promise<string[]>;
  loadUserFlagsForMovie: (movieId: string) => Promise<UserFlagsDTO>;
  updateFlagsForMovie: (flags: UserFlagsDTO) => Promise<void>;
  setUserSeenDateForMovie: (movieId: string, date: Date) => Promise<void>;
  deleteUserSeenDateForMovie: (movieId: string, date: Date) => Promise<void>;
  onAllSeenDatesDeleted?: (movieId: string) => void;
  langResources: MovieCardLangResources;
  stretchToFill?: boolean;
}
export const MovieCard = ({
  movie,
  imageUrl,
  bodyBackgroundImageUrl,
  detailsUrl,
  editUrl,
  showDetailsButton,
  showMarkAsSeenButtons,
  loadSeenDatesForMovie,
  loadUserFlagsForMovie,
  updateFlagsForMovie,
  setUserSeenDateForMovie,
  deleteUserSeenDateForMovie,
  onAllSeenDatesDeleted,
  langResources,
  stretchToFill = false,
}: MovieCardProps) => {

  const [seenDates, setSeenDates] = useState<string[]>([]);
  const [seenDatesLoading, setSeenDatesLoading] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlagsDTO>();
  const [userFlagsLoading, setUserFlagsLoading] = useState(true);
  const [additionalDataLoaded, setAdditionalDatesLoaded] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeletedMovie, setIsDeletedMovie] = useState(false);
  const [pendingRemovalNotification, setPendingRemovalNotification] = useState(false);

  const handleSeenDateDeletion = async (date: string) => {
    await deleteUserSeenDateForMovie(movie.id, new Date(date));
    setSeenDates((prev) => {
      const current = prev ?? [];
      const next = current.filter((seenDate) => seenDate !== date);
      if (next.length === 0) {
        setPendingRemovalNotification(true);
      }
      return next;
    });
    setAdditionalDatesLoaded(false);
  };

  useEffect(() => {
    setIsDeletedMovie(movie.ownerid === 999);
  }, [movie]);

  useEffect(() => {
    if (pendingRemovalNotification && seenDates.length === 0) {
      onAllSeenDatesDeleted?.(movie.id);
      setPendingRemovalNotification(false);
    }
  }, [pendingRemovalNotification, seenDates.length, movie.id, onAllSeenDatesDeleted]);

  useEffect(() => {
    const fetchSeenDates = async () => {
      setSeenDatesLoading(true);
      const dates = await loadSeenDatesForMovie(movie.id);

      setSeenDates(dates);
      setSeenDatesLoading(false);
    };

    const fetchUserFlags = async () => {
      setUserFlagsLoading(true);
      const flags = await loadUserFlagsForMovie(movie.id);
      setUserFlags(flags);
      setUserFlagsLoading(false);
    };

    if (!additionalDataLoaded) {
      fetchSeenDates();
      fetchUserFlags();
      setAdditionalDatesLoaded(true);
    }
  }, [movie.id, additionalDataLoaded, loadSeenDatesForMovie, loadUserFlagsForMovie]);

  return (
    <div key={movie.id} data-testid={`movie-card-${movie.id}`} className={stretchToFill ? "h-full" : undefined}>
      <Card className={`relative overflow-hidden border border-black/32 shadow-[0_10px_36px_rgba(0,0,0,0.14)] dark:border-white/22 dark:shadow-[0_12px_40px_rgba(0,0,0,0.42)] ${stretchToFill ? "flex h-full flex-col" : ""}`}>
        {bodyBackgroundImageUrl && (
          <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 bg-cover bg-no-repeat opacity-40 dark:opacity-30 ${stretchToFill ? "bg-center" : "bg-right-top"}`}
            style={{ backgroundImage: `url("${bodyBackgroundImageUrl}")` }}
          />
        )}
        <CardHeader className="relative z-10 flex flex-col items-start gap-1 bg-content1/30 px-4 py-2 md:flex-row">
          <div className="flex-1 min-w-0">
            <div
              data-testid="movie-card-title"
              className="pr-2 text-left text-lg font-semibold [text-shadow:0_1px_2px_rgba(255,255,255,0.68),0_0_24px_rgba(255,255,255,0.32)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.88),0_0_26px_rgba(0,0,0,0.62)]"
            >
              {movie.title}
            </div>
            {movie.subtitle && (
              <div className="text-left text-sm [text-shadow:0_1px_2px_rgba(255,255,255,0.58),0_0_18px_rgba(255,255,255,0.24)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.82),0_0_20px_rgba(0,0,0,0.56)]">
                {movie.subtitle}
              </div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap mt-2 shrink-0">
            <UserFlagButton
              userFlagChipProps={{ type: "Favorite", active: userFlags?.isFavorite ?? false, loading: userFlagsLoading }}
              onPress={async () => {
                const flags: UserFlagsDTO = { movieId: movie.id, isFavorite: !userFlags?.isFavorite, isWatchAgain: userFlags?.isWatchAgain ?? false };
                setUserFlags(flags);
                updateFlagsForMovie(flags);
              }}
            />
            <UserFlagButton
              userFlagChipProps={{ type: "Watchagain", active: userFlags?.isWatchAgain ?? false, loading: userFlagsLoading }}
              onPress={async () => {
                const flags: UserFlagsDTO = { movieId: movie.id, isFavorite: userFlags?.isFavorite ?? false, isWatchAgain: !userFlags?.isWatchAgain };
                setUserFlags(flags);
                updateFlagsForMovie(flags);
              }}
            />
            {movie.istv && (
              <Chip className="bg-primary-500">
                <TvNextOutlined />
              </Chip>
            )}
            <Chip color="secondary">{movie.mediaType}</Chip>
            {movie.diskid && <Chip color="primary">{movie.diskid}</Chip>}
          </div>
        </CardHeader>
        <Divider />
        <div className={stretchToFill ? "flex min-h-0 flex-1 flex-col" : undefined}>
          <CardBody className={`relative overflow-hidden ${stretchToFill ? "flex flex-1 flex-col" : ""}`}>
            <div className="relative z-10 flex flex-col items-start md:flex-row ">
              {isDeletedMovie &&
                <div className="mr-4 mb-4">
                  <Chip
                    data-testid="deleted-chip"
                    color="danger"
                  >{langResources.deletedEntryLabel}</Chip>
                </div>
              }
              <SeenChips
                seenDates={seenDates ? seenDates : []}
                loading={seenDatesLoading}
                deleteSeenDate={async (date) => {
                  setDeleteDate(date);
                  setDeleteModalIsOpen(true);
                }} />
              <DeleteSeenDateModal
                isOpen={deleteModalIsOpen}
                date={deleteDate}
                onOpenChange={() => setDeleteModalIsOpen(!deleteModalIsOpen)}
                onDeleteConfirmed={(date) => {
                  void handleSeenDateDeletion(date);
                }} />
            </div>
            <div className={`relative z-10 flex gap-4 ${stretchToFill ? "min-h-0 flex-1" : ""}`}>
              <div className="shrink-0">
                {detailsUrl ? (
                  <a href={detailsUrl} target="_blank" rel="noopener noreferrer">
                    <div className="relative h-[180px] w-[120px]">
                      <Image
                        alt="Movie Cover"
                        src={imageUrl}
                        fill
                        sizes="120px"
                        className={`rounded shadow-[0_0_34px_rgba(255,255,255,0.28)] dark:shadow-[0_0_36px_rgba(0,0,0,0.62)] ${stretchToFill ? "object-contain" : "object-cover"}`}
                        unoptimized
                      />
                    </div>
                  </a>
                ) : (
                  <div className="relative h-[180px] w-[120px]">
                    <Image
                      alt="Movie Cover"
                      src={imageUrl}
                      fill
                      sizes="120px"
                      className={`rounded shadow-[0_0_34px_rgba(255,255,255,0.28)] dark:shadow-[0_0_36px_rgba(0,0,0,0.62)] ${stretchToFill ? "object-contain" : "object-cover"}`}
                      unoptimized
                    />
                  </div>
                )}
              </div> <ScrollShadow className={stretchToFill ? "min-h-0 flex-1" : "h-[280px]"}>
                <div className="flex-1 text-left">
                  <p className="text-justify [text-shadow:0_1px_2px_rgba(255,255,255,0.68),0_0_20px_rgba(255,255,255,0.34)] dark:[text-shadow:0_1px_2px_rgba(0,0,0,0.88),0_0_24px_rgba(0,0,0,0.62)]">
                    {movie.plot}
                  </p>
                </div>
              </ScrollShadow>
            </div>
          </CardBody>
          <Divider />
        </div>

        <CardFooter className={`relative z-10 bg-content1/30 ${stretchToFill ? "mt-auto" : ""}`}>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex gap-4 md:flex-row flex-col">
              <div className="flex gap-2 flex-wrap">
                {movie.genres &&
                  movie.genres.map((genreName: string) => (
                    <Chip key={genreName} color="primary" variant="flat">
                      {genreName}
                    </Chip>
                  ))}
              </div>
              <div className="flex gap-2">
                {movie.runtime &&
                  <Chip color="secondary" variant="flat">{movie.runtime} min</Chip>
                }
                {movie.rating &&
                  <Chip color="warning" variant="flat">{`${t("movie_card.rating")} ${movie.rating}`}</Chip>
                }
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              {showMarkAsSeenButtons && !isDeletedMovie &&
                <>
                  <Button
                    data-testid="seen-today-button"
                    startContent={<EyeOutlined />}
                    onPress={() => {
                      setUserSeenDateForMovie(movie.id, new Date());
                      setAdditionalDatesLoaded(false);
                    }}>
                    {langResources.seenTodayLabel}
                  </Button>
                  <DatePickerModal
                    data-testid="seen-on-date-button"
                    onDateSelected={(date) => {
                      if (date) {
                        setUserSeenDateForMovie(movie.id, date);
                        setAdditionalDatesLoaded(false);
                      }
                    }} />
                </>
              }
              {showDetailsButton && detailsUrl &&
                <Button onPress={() => window.open(detailsUrl, "_blank")}>Details</Button>
              }
              {editUrl &&
                <Button
                  data-testid="edit-movie-button"
                  onPress={() => {
                    window.location.href = editUrl;
                  }}
                >
                  Edit
                </Button>
              }
            </div>
          </div>
        </CardFooter>
      </Card>
    </div >
  );
};
