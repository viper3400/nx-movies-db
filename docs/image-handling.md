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

Poster lookup is only a filesystem convention: use the movie ID as the filename in a poster directory, for example `530.jpg`. No poster URL is stored in the database, and saving movie metadata should not update poster state unless a future change explicitly adds that behavior.

If poster serving is added to this repo, it should use a separate route and configuration value from cover serving, for example `/api/poster-image/[id]` and `POSTER_IMAGE_PATH`.
