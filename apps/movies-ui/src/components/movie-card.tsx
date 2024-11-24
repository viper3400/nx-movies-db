import { Card, CardHeader, CardBody } from "@nextui-org/card";
import { Chip } from "@nextui-org/chip";
import { Divider } from "@nextui-org/divider";
// Define the interface for a single movie
export interface Movie {
  id: string;
  title: string;
  diskid?: string; // Optional
  mediaType: string;
  genres: string[];
  ownerid: string;
}

// Define the props for the MovieCard component
export interface MovieCardProps {
  movies: Movie[];
}

export const MovieCard = ({ movies }: MovieCardProps) => {
  //console.log(movieCardProps);

  if (movies.length === 0) {
    return <p>No movies found.</p>;
  }

  return (
    <>
      {movies.map(({ id, title, diskid, mediaType, genres, ownerid }: any) => (
        <div key={id}>
          <Card>
            <CardHeader className="flex items-center justify-between px-4 py-2">
              <div className="text-left font-semibold text-lg pr-2">
                {title}
              </div>
              <div className="flex gap-2">
                <Chip color="secondary">{mediaType}</Chip>
                {diskid && <Chip color="primary">{diskid}</Chip>}
              </div>
            </CardHeader>
            <Divider />
            <CardBody className="flex flex-row gap-2">
              {ownerid === "999" && (
                <Chip color="danger">Gelöschter Eintrag</Chip>
              )}
              {genres &&
                genres.map((genreName: any) => (
                  <Chip key={genreName} color="primary" variant="flat">
                    {genreName}
                  </Chip>
                ))}
            </CardBody>
          </Card>
        </div>
      ))}
    </>
  );
};
