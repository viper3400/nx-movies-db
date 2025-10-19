Totally get this—naming drift is sneaky, and once “video” and “movie” co-exist it spreads everywhere. Here’s a pragmatic way to clean it up without breaking your historical MySQL schema.

1) Pick a single canonical domain term

Use Movie for the “content item” (title, year, plot, etc.). Reserve Video only for actual media files/streams if you ever need that distinction. From your schema and UI, “Movie” is the right fit.

Create a tiny Glossary (one page in /docs) and stick to it across code, GraphQL, and docs:
	•	Movie: the catalog entity (was videodb_videodata)
	•	Genre, MediaType, Seen/WatchEvent, UserMovieSettings …

2) Keep the DB as-is; fix names in Prisma using @@map / @map

You can keep table/column names unchanged (so no risky migrations) and expose clean model/field names in Prisma.

Example (pattern):

/// Clean name, mapped to legacy table
model Movie {
  @@map("videodb_videodata")

  id        Int      @id @default(autoincrement())        @map("id")
  title     String?  @map("title")
  subtitle  String?  @map("subtitle")
  year      Int      @default(0)                          @map("year")
  plot      String?  @map("plot")
  imgUrl    String?  @map("imgurl")
  imdbId    String?  @map("imdbID")
  runtime   Int?     @map("runtime")
  isTv      Int      @default(0)                          @map("istv")
  mediaTypeId Int    @default(0)                          @map("mediatype")
  lastUpdate DateTime @default(now())                     @map("lastupdate")

  mediaType MediaType @relation(fields: [mediaTypeId], references: [id])

  // Relations renamed for clarity
  seenEvents         WatchEvent[]       // was userSeen
  userMovieSettings  UserMovieSettings[]

  genres MovieGenre[]
}

model MediaType {
  @@map("videodb_mediatypes")

  id     Int       @id @default(autoincrement()) @map("id")
  name   String?   @map("name")
  movies Movie[]
}

model Genre {
  @@map("videodb_genres")

  id     Int        @id @default(autoincrement()) @map("id")
  name   String     @map("name")
  movies MovieGenre[]
}

// Join table with clean name
model MovieGenre {
  @@map("videodb_videogenre")

  movieId Int @map("video_id")
  genreId Int @map("genre_id")

  movie Movie @relation(fields: [movieId], references: [id])
  genre Genre @relation(fields: [genreId], references: [id])

  @@id([movieId, genreId])
}

model WatchEvent {
  @@map("homewebbridge_userseen")

  id         Int      @id @default(autoincrement())            @map("id")
  movieId    Int                                           @map("vdb_videoid")
  viewedAt   DateTime                                      @map("viewdate")
  viewGroup  String                                        @map("asp_viewgroup")
  username   String                                        @map("asp_username")

  movie Movie @relation(fields: [movieId], references: [id])
}

model UserMovieSettings {
  @@map("homewebbridge_usermoviesettings")

  id         Int     @id @default(autoincrement())             @map("id")
  movieId    Int                                               @map("vdb_movieid")
  username   String                                            @map("asp_username")
  isFavorite Boolean?                                          @map("is_favorite")
  watchAgain Boolean?                                          @map("watchagain")

  movie Movie @relation(fields: [movieId], references: [id])
}

What this gives you
	•	Clean TypeScript names (prisma.movie.findMany()) while your MySQL tables stay videodb_*.
	•	Clear field names in your codebase (e.g., movie.imdbId vs legacy imdbID).

3) Give GraphQL the clean names too (Pothos/mercurius/apollo)

Map your GraphQL schema to the clean names:
	•	Types: Movie, Genre, MediaType, WatchEvent, UserMovieSettings
	•	Queries: getMovies, getMovieDetail, getMovieEdit, getSeenMovies

If you’ve already shipped queries like GetVideoDetail, keep a temporary alias and mark it deprecated:

type Query {
  getMovieDetail(id: ID!): Movie!
  getVideoDetail(id: ID!): Movie! @deprecated(reason: "Use getMovieDetail")
}

This lets clients migrate at their pace.

4) Fix your docs + UI naming

Your docs already lean “Movies” 👍. I’d align the remaining bits:
	•	In /docs/video-data-mapping.md
	•	Change “GraphQL Query: GetVideoDetail / GetVideoEdit” → GetMovieDetail / GetMovieEdit
	•	Change section header “### Detail” description “–” to mention Movie explicitly.
	•	In UI:
	•	Keep components like MovieCard, MovieCardDeck, etc.
	•	Prefer hooks/functions like getMovies, useMovieSearch, getMovieByTitle.

5) Guardrails so it stays consistent
	•	ESLint naming rule: use a simple custom rule (or a banned-words rule) that errors on new identifiers containing Video in app/domain packages (except prisma mapping and legacy adapters).
	•	Nx module boundaries: tag your domain libs (e.g., type:domain) and forbid imports from legacy video* libs into them.
	•	Codeowners + PR check: a grep in CI that fails on new Video usages outside the allowed paths.

6) Migration plan (low-risk, incremental)
	1.	Prisma schema: introduce the clean model/field names using @@map/@map (no DB change).
	2.	Data layer: update service code to prisma.movie, prisma.genre, etc.
	3.	GraphQL: expose clean names + keep deprecated aliases for 1–2 releases.
	4.	UI/docs: rename queries in code and documentation.
	5.	Enable guardrails to prevent regressions.
	6.	Remove deprecated GraphQL aliases when clients are migrated.

⸻

If you want, I can apply steps (2) and (4) right now to the two files you shared:
	•	update prisma.schema to the clean names (using @@map/@map)
	•	update docs/video-data-mapping.md to rename GetVideoDetail/GetVideoEdit → GetMovieDetail/GetMovieEdit

Say the word and I’ll patch those files accordingly.
