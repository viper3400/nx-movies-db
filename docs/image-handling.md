# Image Handling

Each movie can have two different image concepts:

- A **cover image**, typically the Blu-ray/DVD cover.
- A **poster image**, used as the movie background image.

These concepts should stay separate. Covers are part of the legacy movie metadata model. Posters were added later as a filesystem convention and currently have no database or GraphQL model attached.

## Cover Images

The cover image URL is stored in `videodb_videodata.imgurl`. Historically this value came from movie metadata retrieved from the movie search engine, for example TMDB.

When a cover is downloaded into local storage, the file is named with the movie ID, for example `530.jpg`. The localized `imgurl` value may then point to the local relative path, for example `./530.jpg`, while the original remote URL is preserved in `videodb_videodata.custom3`.

The current UI serves local cover images through `/api/cover-image/[id]`. That route reads files from `COVER_IMAGE_PATH` and resolves movie ID `530` to `530.jpg`, falling back to `not_found.jpg` when the file is missing.

## Poster Images

Poster images are separate from covers. They were introduced later as background images and are not represented by a Prisma field, GraphQL field, or `videodb_videodata` column.

Poster lookup is a filesystem convention: use the movie ID as the filename in a poster directory, for example `530.jpg`. The current UI serves these files through `/api/poster-image/[id]`, which reads from `POSTER_IMAGE_PATH` and falls back to `not_found.jpg` when the file is missing.

Saving metadata can also localize a remote poster/background URL into `POSTER_IMAGE_PATH`. This is separate from cover localization and does not write a poster path back into the database.
