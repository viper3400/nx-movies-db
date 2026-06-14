# Filtering and Search

This page explains how the movie search on the home page works today. It covers the search input, the random button, the filter drawer, and how those controls affect each other.

## Where Search Happens

The main movie search is the signed-in start page of the app.

- The text input is the main search field.
- The random button runs a random search.
- The `Filter` button opens a drawer with additional filters.
- Results appear below the search area and load in pages as you scroll.

## Search Input

The search input is the primary way to look up entries.

- You can type a title, subtitle, or shelf/disk identifier.
- The field label shows the current result count after a search has run.
- Clearing the field also clears the current result list from the page.
- Pressing Enter submits the current search.

### Title search vs. disk search

The backend treats the entered text in one of two ways:

- If the text matches the disk-id pattern `R##F#...`, it is treated as a disk/shelf search.
- Everything else is treated as a title search.

Examples:

- `R01F4` is treated as a disk search.
- `Alien` is treated as a title search.

An empty search is also allowed. In that case, the app returns results based only on the active filters.

## Search Button Behavior

There is no separate visible search button in the current UI. The form is submitted by pressing Enter in the input field.

When a normal search runs:

- The current text is sent together with the current filters.
- The app loads the first page with up to 10 results.
- Any old results are cleared before the new query starts.

## Random Button

The surprise/random button runs a different path from a normal search.

- It clears the current search text first.
- It uses the current filters.
- It also sets the backend request to `randomOrder = true`.
- It starts again from the first page and clears previous results first.

This is important because `Random` does not mean "pick from the entire database".

- If filters are active, random only picks from entries that match those filters.
- In practice, random means "pick a random result from the current filtered scope".

This means old text in the input field does not narrow random search anymore.

### Practical rule for users

If you want a truly broad random pick:

1. The search field will already be cleared for you when you press random.
2. Reset or loosen any filters you do not want.
3. Then press the random button.

Important interaction with deleted entries:

- Normal searches use the deleted filter exactly as selected in the filter drawer.
- Random searches override that when `Random search excludes deleted` is enabled.
- In the current implementation, that setting is enabled by default and shown as disabled in the drawer, so random searches effectively exclude deleted entries today.

This means:

- A normal search can include deleted entries.
- A random search currently will not return deleted entries, even if the deleted filter is set to include them.

## Filter Drawer

The `Filter` button opens a drawer with all advanced filter settings.

Important behavior:

- Changes inside the drawer are local until you press `Apply`.
- Closing the drawer without `Apply` keeps the previous filter state.
- When any non-default filter is active, the filter button shows a badge.

## Available Filters

### Favorites

`Favorite Movies` limits the results to entries marked as favorites for the current user context.

### Watch Again

`Watch Again` limits the results to entries marked for watching again.

### Media Type

The media type section is a multi-select filter.

- You can select more than one media type.
- If nothing is selected, media type does not limit the result set.
- The drawer subtitle shows the currently selected media types.

The available media types are loaded from the backend and then cached in the browser for reuse during the session.

### Genre

The genre section works the same way as media type.

- You can select multiple genres.
- If nothing is selected, genre does not limit the result set.
- The drawer subtitle shows the current genre selection.

Genres are also loaded from the backend and cached in the browser.

### TV Series

The TV series filter has three modes:

- `Exclude Tv Series`
- `Include Tv Series`
- `Only Tv Series`

Default behavior:

- The app starts with `Include Tv Series`, so movies and TV series can both appear unless you change this.

### Deleted Entries

The deleted-entry filter also has three modes:

- `Exclude Deleted`
- `Include Deleted`
- `Only Deleted`

Default behavior:

- The app starts with `Include Deleted`.

This filter affects normal searches directly. Random searches currently ignore it when the app-level random exclusion setting is active, which it is by default.

## Default Filter State

The search starts with these defaults:

- Deleted entries: `Include Deleted`
- TV series: `Include Tv Series`
- Favorites: off
- Watch Again: off
- Media types: none selected
- Genres: none selected
- Random excludes deleted: on

If the active filters match that default state, the filter button is shown without a badge.

## How Search and Filters Interact

The search text and filters are stored together as one search state in the browser.

### When changing filters

After you press `Apply` in the filter drawer:

- If the last action was a random search, the current result list is cleared.
- Otherwise, if there is search text or an existing result list, the app automatically runs a fresh search using the current text and the new filters.

This means you usually do not need to press Enter again after changing filters.

### When clearing the search field

Clearing the input does this:

- the current results are removed
- the search text becomes empty

After that, nothing is shown until you run a search again or use random.

This also matters for random search:

- random clears the field before running
- random therefore uses only the active filters

### When using empty text with filters

If the search field is empty and you submit the form:

- the app still runs the query
- only the active filters define the result set

That makes the filter drawer useful as a browsing tool, not only as a refinement step after typing text.

## Pagination and Infinite Scroll

Results are loaded in pages of 10 items.

- The first request loads page 1 of the visible list.
- As you scroll to the end of the result area, the app requests the next page automatically.
- This continues until all matching items are loaded.

Status messages below the list show:

- loading state while a request is in progress
- `No results found.` when nothing matches
- `No more results found.` when all matching items have already been loaded

## Persistence Across Reloads

The app saves the current search text and filter state in browser local storage.

That means:

- reloading the page keeps your last search text
- reloading the page keeps your last filter selections

The results themselves are not restored from storage. The app restores the controls, not the already-fetched result list.

## Practical Examples

### Find everything on one disk

1. Enter a disk id like `R01F4`.
2. Press Enter.
3. Adjust deleted or TV-series handling if needed.

### Browse only TV series

1. Open `Filter`.
2. Set `TV Series` to `Only Tv Series`.
3. Press `Apply`.
4. Run an empty search or a text search.

### Find a random movie but avoid deleted entries

1. Leave filters as needed.
2. Press the random button.

Today this already excludes deleted entries by default.

### Get a random pick from the widest possible pool

1. Open `Filter`.
2. Remove any restrictive filters you do not want.
3. Press `Apply`.
4. Press the random button.

### Show only deleted entries

1. Open `Filter`.
2. Set deleted entries to `Only Deleted`.
3. Press `Apply`.
4. Run a search or submit an empty search.

## Current Limitations and Notes

- Some users expect `Random` to ignore all current search state. That is not how it currently works. It clears the text field, but it still respects the active filters.
- The random-search deleted-entry behavior is not fully symmetrical with normal search behavior. Random currently excludes deleted entries by default.
- The UI text says the search field accepts shelf input. In the current implementation, disk-id detection depends on the `R##F#...` pattern.
- The result count shown in the input label reflects the total backend count for the current query, not only the number of items already rendered on screen.
