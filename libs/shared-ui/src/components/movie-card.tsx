import { Button, Card, CardBody, CardFooter, CardHeader, Chip, Divider } from "@heroui/react";
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
  appBasePath?: string;
  showDetailsButton?: boolean;
  showMarkAsSeenButtons?: boolean;
  loadSeenDatesForMovie: (movieId: string) => Promise<string[]>;
  loadUserFlagsForMovie: (movieId: string) => Promise<UserFlagsDTO>;
  updateFlagsForMovie: (flags: UserFlagsDTO) => Promise<void>;
  setUserSeenDateForMovie: (movieId: string, date: Date) => Promise<void>;
  deleteUserSeenDateForMovie: (movieId: string, date: Date) => Promise<void>;
  langResources: MovieCardLangResources;
}
export const MovieCard = ({
  movie,
  imageUrl,
  appBasePath,
  showDetailsButton,
  showMarkAsSeenButtons,
  loadSeenDatesForMovie,
  loadUserFlagsForMovie,
  updateFlagsForMovie,
  setUserSeenDateForMovie,
  deleteUserSeenDateForMovie,
  langResources }: MovieCardProps) => {

  const [seenDates, setSeenDates] = useState<string[]>([]);
  const [seenDatesLoading, setSeenDatesLoading] = useState(false);
  const [userFlags, setUserFlags] = useState<UserFlagsDTO>();
  const [userFlagsLoading, setUserFlagsLoading] = useState(true);
  const [additionalDataLoaded, setAdditionalDatesLoaded] = useState(false);
  const [deleteModalIsOpen, setDeleteModalIsOpen] = useState(false);
  const [deleteDate, setDeleteDate] = useState("");
  const [isDeletedMovie, setIsDeletedMovie] = useState(false);

  useEffect(() => {
    setIsDeletedMovie(movie.ownerid === 999);
  }, [movie]);

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
    <div key={movie.id}>
      <Card>
        <CardHeader className="flex flex-col md:flex-row items-start gap-1 px-4 py-2">
          <div className="flex-1 min-w-0">
            <div className="text-left font-semibold text-lg pr-2">{movie.title}</div>
            {movie.subtitle && (
              <div className="text-left text-sm">{movie.subtitle}</div>
            )}
          </div>
          <div className="flex gap-2 flex-wrap mt-2 flex-shrink-0">
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
        <div>
          <CardBody>
            <div className="flex flex-col md:flex-row items-start ">
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
                onDeleteConfirmed={async (date) => {
                  await deleteUserSeenDateForMovie(movie.id, new Date(date));
                  setAdditionalDatesLoaded(false);
                }} />
            </div>
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <a href={`${appBasePath}/details/${movie.id}`} target="_blank" rel="noopener noreferrer">
                  <Image
                    alt="Movie Cover"
                    height={180}
                    src={imageUrl}
                    width={120}
                    className="rounded"
                  />
                </a>
              </div>
              <div className="flex-1 text-left">
                <p className="text-justify">{movie.plot}</p>
              </div>
            </div>
          </CardBody>
          <Divider />
        </div>

        <CardFooter>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between w-full">
            <div className="flex gap-4 md:flex-row flex-col">
              <div className="flex gap-2">
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
              {showDetailsButton &&
                <Button onPress={() => window.open(appBasePath + "/details/" + movie.id, "_blank")}>Details</Button>
              }
            </div>
          </div>
        </CardFooter>
      </Card>
    </div >
  );
};
