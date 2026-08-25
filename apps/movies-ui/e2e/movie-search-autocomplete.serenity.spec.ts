import { type Page } from "@playwright/test";
import { test } from "@serenity-js/playwright-test";
import { Ensure, equals, includes, isPresent, matches, not } from "@serenity-js/assertions";
import { Duration, Task, Wait } from "@serenity-js/core";
import {
  Attribute,
  By,
  Click,
  Enter,
  Key,
  Navigate,
  Page as SerenityPage,
  PageElement,
  Press,
  Text,
  isVisible,
} from "@serenity-js/web";

/**
 * The UI structure and test IDs live here. The scenarios below deliberately
 * speak in terms of a person searching their collection, rather than widgets.
 */
const CollectionSearch = {
  field: PageElement.located(
    By.css("[data-testid='MovieSearchField']"),
  ).describedAs("collection search"),
  autocompleteSwitch: PageElement.located(
    By.css("[data-testid='movie-search-autocomplete-toggle']"),
  ).describedAs("collection autocomplete switch"),
  suggestions: PageElement.located(
    By.css("[data-testid='movie-search-suggestions']"),
  ).describedAs("matching movies"),
  firstSuggestion: PageElement.located(
    By.css("[data-testid='movie-search-suggestions'] [role='option']:first-child"),
  ).describedAs("first matching movie"),
  noMatches: PageElement.located(
    By.css("[data-testid='movie-search-suggestions-empty']"),
  ).describedAs("no matching movies message"),
  resultCard: (id: number) => PageElement.located(
    By.css(`[data-testid='movie-card-${id}']`),
  ).describedAs(`movie ${id} in search results`),
};

const SearchesFor = (title: string) =>
  Task.where(`#actor searches their collection for "${title}"`,
    Enter.theValue(title).into(CollectionSearch.field),
  );

const ChoosesTheFirstSuggestedMovieWithTheKeyboard = () =>
  Task.where("#actor chooses the first suggested movie with the keyboard",
    Press.the(Key.ArrowDown, Key.Enter).in(CollectionSearch.field),
  );

const ChoosesTheFirstSuggestedMovieWithTheMouse = () =>
  Task.where("#actor chooses the first suggested movie with the mouse",
    Click.on(CollectionSearch.firstSuggestion),
  );

const SubmitsTheCollectionSearch = () =>
  Task.where("#actor submits the collection search",
    Press.the(Key.Enter).in(CollectionSearch.field),
  );

const defaultFilters = {
  deleteMode: "INCLUDE_DELETED",
  tvSeriesMode: "INCLUDE_TVSERIES",
  filterForFavorites: false,
  filterForWatchAgain: false,
  filterForMediaTypes: [],
  filterForGenres: [],
  randomExcludeDeleted: true,
};

async function setStoredCollectionSearchPreferences(page: Page, {
  autocompleteEnabled = true,
  tvSeriesMode = "INCLUDE_TVSERIES",
}: {
  autocompleteEnabled?: boolean;
  tvSeriesMode?: "INCLUDE_TVSERIES" | "EXCLUDE_TVSERIES";
} = {}) {
  await page.addInitScript((state) => {
    localStorage.setItem("moviesSearchState", JSON.stringify(state));
  }, {
    filters: { ...defaultFilters, tvSeriesMode },
    searchText: "",
    recentRandomMovieIds: [],
    autocompleteEnabled,
  });
}

async function addMovieToCollection(page: Page, {
  title,
  diskId,
  isTv = false,
}: {
  title: string;
  diskId: string;
  isTv?: boolean;
}) {
  const response = await page.request.post("/api/graphql-proxy", {
    data: {
      query: `
        mutation SeedAutocompleteVideo(
          $title: String!,
          $diskid: String!,
          $year: Int!,
          $istv: Int!,
          $lastupdate: DateTime!,
          $mediatype: Int!,
          $owner_id: Int!
        ) {
          upsertVideoData(
            title: $title,
            diskid: $diskid,
            year: $year,
            istv: $istv,
            lastupdate: $lastupdate,
            mediatype: $mediatype,
            owner_id: $owner_id
          ) {
            id
          }
        }
      `,
      variables: {
        title,
        diskid: diskId,
        year: 2024,
        istv: isTv ? 1 : 0,
        lastupdate: "2024-01-02T00:00:00.000Z",
        mediatype: 14,
        owner_id: 1,
      },
    },
  });

  if (!response.ok()) throw new Error(`Failed to seed autocomplete video "${title}"`);
  const body = await response.json();
  if (body.errors || !body.data?.upsertVideoData?.id) {
    throw new Error(`Could not seed autocomplete video: ${JSON.stringify(body.errors)}`);
  }

  return body.data.upsertVideoData.id as number;
}

/**
 * Pairwise-oriented matrix (with invalid combinations constrained):
 *
 *  autocomplete | query       | collection scope | interaction
 *  enabled      | < 2 chars   | all              | keyboard
 *  enabled      | match       | all              | keyboard
 *  enabled      | match       | all              | mouse
 *  enabled      | match       | TV excluded      | keyboard
 *  disabled     | match       | all              | form submit
 */
test.describe("Movie search autocomplete", () => {
  test("does not open suggestions below the two-character threshold", async ({ actorCalled, page }) => {
    await setStoredCollectionSearchPreferences(page);
    const actor = actorCalled("Serena");

    await actor.attemptsTo(
      Navigate.to("/"),
      Wait.until(CollectionSearch.field, isVisible()),
      SearchesFor("x"),
      Ensure.that(CollectionSearch.suggestions, not(isPresent())),
    );
  });

  test("keeps the actor on collection search after choosing a suggested movie with the keyboard", async ({ actorCalled, page }) => {
    const token = Date.now();
    const title = `The Keyboard Navigator (seed ${token})`;
    const id = await addMovieToCollection(page, { title, diskId: `R31F${token % 100}D01` });
    await setStoredCollectionSearchPreferences(page);
    const actor = actorCalled("Kai");

    await actor.attemptsTo(
      Navigate.to("/"),
      Wait.until(CollectionSearch.field, isVisible()),
      SearchesFor(title),
      Wait.upTo(Duration.ofSeconds(5)).until(CollectionSearch.firstSuggestion, isVisible()),
      Ensure.that(Text.of(CollectionSearch.firstSuggestion), includes(title)),
      ChoosesTheFirstSuggestedMovieWithTheKeyboard(),
      Ensure.that(Attribute.called("value").of(CollectionSearch.field), equals(title)),
      Ensure.that(SerenityPage.current().url().href, matches(/\/$/)),
      Wait.upTo(Duration.ofSeconds(5)).until(CollectionSearch.resultCard(id), isVisible()),
    );
  });

  test("shows a selected movie in collection search after choosing it with the mouse", async ({ actorCalled, page }) => {
    const token = Date.now();
    const title = `A Mouse Click Away (seed ${token})`;
    const id = await addMovieToCollection(page, { title, diskId: `R32F${token % 100}D01` });
    await setStoredCollectionSearchPreferences(page);
    const actor = actorCalled("Mara");

    await actor.attemptsTo(
      Navigate.to("/"),
      Wait.until(CollectionSearch.field, isVisible()),
      SearchesFor(title),
      Wait.upTo(Duration.ofSeconds(5)).until(CollectionSearch.firstSuggestion, isVisible()),
      ChoosesTheFirstSuggestedMovieWithTheMouse(),
      Ensure.that(Attribute.called("value").of(CollectionSearch.field), equals(title)),
      Ensure.that(SerenityPage.current().url().href, matches(/\/$/)),
      Wait.upTo(Duration.ofSeconds(5)).until(CollectionSearch.resultCard(id), isVisible()),
    );
  });

  test("honours an active TV exclusion filter when finding suggestions", async ({ actorCalled, page }) => {
    const token = Date.now();
    const title = `The Hidden Television Series (seed ${token})`;
    await addMovieToCollection(page, { title, diskId: `R33F${token % 100}D01`, isTv: true });
    await setStoredCollectionSearchPreferences(page, { tvSeriesMode: "EXCLUDE_TVSERIES" });
    const actor = actorCalled("Tara");

    await actor.attemptsTo(
      Navigate.to("/"),
      Wait.until(CollectionSearch.field, isVisible()),
      SearchesFor(title),
      Wait.upTo(Duration.ofSeconds(5)).until(CollectionSearch.noMatches, isVisible()),
    );
  });

  test("suppresses suggestions when disabled while retaining normal form search", async ({ actorCalled, page }) => {
    const token = Date.now();
    const title = `The Manually Found Movie (seed ${token})`;
    const id = await addMovieToCollection(page, { title, diskId: `R34F${token % 100}D01` });
    await setStoredCollectionSearchPreferences(page, { autocompleteEnabled: false });
    const actor = actorCalled("Drew");

    await actor.attemptsTo(
      Navigate.to("/"),
      Wait.until(CollectionSearch.field, isVisible()),
      Ensure.that(Attribute.called("aria-pressed").of(CollectionSearch.autocompleteSwitch), equals("false")),
      SearchesFor(title),
      Wait.upTo(Duration.ofSeconds(1)).until(CollectionSearch.suggestions, not(isPresent())),
      SubmitsTheCollectionSearch(),
      Wait.upTo(Duration.ofSeconds(5)).until(CollectionSearch.resultCard(id), isVisible()),
    );
  });
});
