import { Chip } from "@heroui/react";
import { TimeElapsedFormatter } from "../lib/time-elapsed-formatter";

export const SeenChips: React.FC<{
  seenDates?: Date[],
  loading: boolean
  deleteSeenDate: (date: string) => Promise<void>;
}> = ({ seenDates, loading, deleteSeenDate }) => {
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

  return (
    <>
      {
        loading && <Chip
          className={"mr-4 mb-4 animate-pulse"}
          color="secondary"
          variant="bordered">
          Lade ...
        </Chip>
      }
      {!loading && notSeen &&
        <Chip
          className={"mr-4 mb-4"}
          variant="bordered"
          color="secondary">
          noch nicht gesehen
        </Chip>

      }
      {seenDates && seenDates.length > 0 && !loading &&
        <Chip
          className={"mr-4 mb-4"}
          color="secondary">
          {seenDates.length} x gesehen
        </Chip>
      }
      {seenDates && seenDates.length > 0 &&
        <Chip color="primary" className="mr-4 mb-4">
          {TimeElapsedFormatter.getDurationStringForDate(new Date(seenDates[seenDates.length - 1]))}
        </Chip>
      }
      {seenDates && seenDates.length > 0 &&
        seenDates.map((date, index) => (
          <Chip
            key={index}
            className="mr-4 mb-4"
            color="secondary"
            variant="flat"
            onClose={() => deleteSeenDate(date.toString())}>
            {formatDate(date.toString())}
          </Chip>
        ))}
    </>
  );
};
