# Image Handling

Each movie has two types of images: a **cover image** (typically the Blu-ray cover) and a **poster image**, which serves as the movie’s background image.

Historically, the cover image was included in the metadata retrieved from the movie search engine, for example, from TMDB.

The poster image, on the other hand, was fetched separately using the movie’s name from TMDB. This sometimes resulted in the wrong poster being retrieved.

The cover image URL is stored in the `videodb_videodata.imgurl` field. Normally, this contains the remote URL to the image. When saving the movie, the image is downloaded to a local folder that stores all cover images. The downloaded file is named using the movie’s ID — for example, `530.jpg`. The `imgurl` field is then updated with the relative path (e.g. `./530.jpg`), while the original remote URL is preserved in the `videodb_videodata.custom3` field.

The background poster image is also downloaded when saving the movie and stored in another local folder, also named using the movie’s ID (e.g. `530.jpg`). The URLs for these background images are not stored in the database.
