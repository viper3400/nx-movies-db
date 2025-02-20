# GraphQL Interface for Video Management

This GraphQL interface provides a way to interact with a video database, allowing you to query and filter videos based on various criteria.

## Available Options

The interface includes the following options:

1. **DeleteMode**: An enum type that defines the modes for filtering deleted videos. The available values are:
   - `ONLY_DELETED`: Includes only deleted videos.
   - `INCLUDE_DELETED`: Includes both deleted and non-deleted videos.
   - `EXCLUDE_DELETED`: Excludes deleted videos.

2. **RequestMeta**: A simple object type that represents the metadata of a request, including the total count of the returned videos.

3. **Video**: A simple object type that represents a video, with the following fields:
   - `id`: The unique identifier of the video.
   - `title`: The title of the video.
   - `subtitle`: The subtitle of the video.
   - `diskid`: The disk ID of the video.
   - `ownerid`: The ID of the video's owner.
   - `plot`: The plot or description of the video.
   - `favoriteOf`: A list of usernames who have marked the video as a favorite.
   - `genres`: A list of genre names associated with the video.
   - `mediaType`: The media type of the video.

4. **Videos**: A simple object type that represents the response of a video query, containing the following fields:
   - `requestMeta`: The metadata of the request, including the total count of the returned videos.
   - `videos`: The list of videos that match the query.

5. **Query**: The GraphQL query type that allows you to fetch videos based on various filters, including:
   - `id`: Filter videos by ID.
   - `title`: Filter videos by title.
   - `diskid`: Filter videos by disk ID.
   - `genreName`: Filter videos by genre name.
   - `mediaType`: Filter videos by media type.
   - `ownerid`: Filter videos by owner ID.
   - `queryPlot`: Include the video's plot in the result.
   - `queryUserSettings`: Include the user's movie settings in the result.
   - `userName`: Filter user movie settings by username.
   - `filterFavorites`: Filter only for user favorites (requires `userName`).
   - `filterFlagged`: Filter only for user flagged videos (requires `userName`).
   - `deleteMode`: Filter videos based on the delete mode.
   - `skip`: Skip a number of elements.
   - `take`: Take a number of elements.

## How to Use

To use this GraphQL interface, you can send a query to the GraphQL endpoint with the desired filters and options. Here's an example query:

```graphql
query {
  videos(
    title: "My Favorite Movie"
    mediaType: ["MOVIE", "TV_SHOW"]
    queryPlot: true
    queryUserSettings: true
    userName: "johndoe"
    filterFavorites: true
    skip: 0
    take: 10
  ) {
    requestMeta {
      totalCount
    }
    videos {
      id
      title
      subtitle
      diskid
      ownerid
      plot
      favoriteOf
      genres
      mediaType
    }
  }
}
```

This query will fetch the first 10 videos with the title "My Favorite Movie" and media types "MOVIE" or "TV_SHOW", including the video's plot and the user's movie settings for the user "johndoe". The results will be filtered to include only the user's favorite videos.

The response will include the total count of the matching videos in the `requestMeta.totalCount` field, and the list of videos in the `videos` field, with the requested fields populated.
