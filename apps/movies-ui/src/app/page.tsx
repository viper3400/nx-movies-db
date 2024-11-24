import { MovieComponent } from "../components/movies";

export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <div>
     <div className="text-2xl underline">Filmdatenbank</div>
     <MovieComponent/>
    </div>
  );
}
