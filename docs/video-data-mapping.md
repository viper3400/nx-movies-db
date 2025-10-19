## Overview
<!-- AUTO-GENERATED: overview:start -->
| Use Case      | Path     | GraphQL Query |
|---------------|----------|---------------|
| Search Result | root | GetMovies |
| Detail | details | GetVideoDetail |
| Edit | edit | GetVideoEdit |
| Seen Movies | seen | GetSeenMovies |
<!-- AUTO-GENERATED: overview:end -->

## Use Cases – Details
<!-- AUTO-GENERATED: details:start -->
### Search Result
- Path: root
- GraphQL Query: GetMovies
- UI Components:
  - MoviesComponent (movies.tsx)
  - SearchForm (shared-ui)
  - MovieCardDeck (shared-ui)
  - MovieCard (shared-ui)
- Description:
  - MovieCardDeck takes result set from SearchForm
  - paging in place
  - useMovieSearch hook (external)
  - hook handles states (for example filter states)
  - getMovies function calls const getMovieByTitle
  - getMovieByTitle calls gqlQuery "GetMovies" --> videos (video-list.ts)

### Detail
- Path: details
- GraphQL Query: GetVideoDetail
- UI Components:
  - MovieCard (shared-ui)
- Description: –


### Edit
- Path: edit
- GraphQL Query: GetVideoEdit
- UI Components: –

- Description: –


### Seen Movies
- Path: seen
- GraphQL Query: GetSeenMovies
- UI Components: –

- Description: –

<!-- AUTO-GENERATED: details:end -->
