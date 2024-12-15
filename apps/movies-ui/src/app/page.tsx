import { MovieComponent } from "../components/movies";
import Github from "../components/github";
export default function Index() {
  /*
   * Replace the elements below with your own.
   *
   * Note: The corresponding styles are in the ./index.tailwind file.
   */
  return (
    <div>
        <div className="flex justify-between items-center">
          <div className="text-2xl underline">Filmdatenbank</div>
          <Github />
      </div>
      <MovieComponent/>
    </div>
  );
}
