import { Chip } from "@heroui/react";
import { TimeElapsedFormatter } from "../lib";
import { useTranslation } from "react-i18next";

export const SeenChips: React.FC<{
  seenDates?: string[],
  loading: boolean
  deleteSeenDate: (date: string) => Promise<void>;
}> = ({ seenDates, loading, deleteSeenDate }) => {
  const { t } = useTranslation();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    // Format as DD.MM.YYYY
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  };

  const notSeen = seenDates?.length === 0 || !seenDates;
  const durationString = (seenDates: Date[]) => {
    const durationString = TimeElapsedFormatter.getDurationStringForDateArray(seenDates);
    if (durationString === "0d") return t("movie_card.seen_today");
    return durationString;
  };

  const parsedDates = seenDates?.map(date => new Date(date)).filter(date => !isNaN(date.getTime())) || [];

  return (
    <div className="flex flex-col md:flex-row items-left">
      {
        loading && <Chip
          data-testid="loading_chip"
          className={"mr-4 mb-4 animate-pulse"}
          color="secondary"
          variant="bordered">
          {t("common.loading")}
        </Chip>
      }
      {!loading && notSeen &&
        <Chip
          data-testid="not_seen_chip"
          className={"mr-4 mb-4"}
          variant="bordered"
          color="secondary">
          {t("movie_card.not_seen")}
        </Chip>

      }
      {seenDates && seenDates.length > 0 && !loading &&
        <div className="flex flex-row">
          <Chip
            data-testid="times_seen_chip"
            className={"mr-4 mb-4"}
            color="secondary">
            {seenDates.length} {t("movie_card.times_seen")}
          </Chip>

          <Chip
            data-testid="seen_date_duration_chip"
            color="primary"
            className="mr-4 mb-4">
            {durationString(parsedDates)}
          </Chip>
        </div>
      }
      {seenDates && seenDates.length > 0 && !loading &&
        <div className="flex flex-row flex-wrap">
          {
            seenDates.map((date, index) => (
              <Chip
                data-testid="seen_date_chip"
                key={index}
                className="mr-4 mb-4"
                color="secondary"
                variant="flat"
                onClose={() => deleteSeenDate(date.toString())}>
                {formatDate(date.toString())}
              </Chip>
            ))}
        </div>
      }
    </div>
  );
};

export default SeenChips;
