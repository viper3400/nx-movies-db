import { test } from "@serenity-js/playwright-test";
import {
  Ensure,
  equals,
  isPresent,
  matches,
  not,
} from "@serenity-js/assertions";
import { Duration, Wait } from "@serenity-js/core";
import {
  Attribute,
  By,
  Clear,
  Click,
  Enter,
  Key,
  Navigate,
  PageElement,
  Press,
  isEnabled,
  isVisible,
} from "@serenity-js/web";

const saveButton = PageElement.located(
  By.css("[data-testid='editable-form-save']"),
).describedAs("save button");
const discardButton = PageElement.located(
  By.css("[data-testid='editable-form-discard']"),
).describedAs("discard button");

const videoField = (name: string, description: string) =>
  PageElement.located(
    By.css(`[data-testid='video-field-${name}']`),
  ).describedAs(description);

const titleField = videoField("title", "title field");
const languageField = videoField("language", "language field");
const diskIdField = videoField("diskid", "disk id field");
const imdbIdField = videoField("imdbID", "IMDB ID field");
const imageUrlField = videoField("imgurl", "image url field");
const custom4Field = videoField("custom4", "custom4 field");
const diskIdSuggestion = PageElement.located(
  By.css("[data-testid='video-field-diskid-suggestion']"),
).describedAs("disk id suggestion");
const yearField = videoField("year", "year field");
const tmdbRefreshToggle = PageElement.located(
  By.css("[data-testid='tmdb-refresh-toggle']"),
).describedAs("TMDB refresh toggle");
const tmdbRefreshQuery = PageElement.located(
  By.css("[data-testid='tmdb-refresh-query']"),
).describedAs("TMDB refresh query");
const tmdbReviewBackToSearch = PageElement.located(
  By.css("[data-testid='tmdb-review-back-to-search']"),
).describedAs("back to TMDB search button");
const tmdbMergeApplyButton = PageElement.located(
  By.css("[data-testid='tmdb-merge-apply']"),
).describedAs("apply selected TMDB fields button");
const tmdbBackdropOption = (index: number) =>
  PageElement.located(
    By.css(`[data-testid='tmdb-backdrop-option-${index}']`),
  ).describedAs(`TMDB backdrop option ${index}`);

test.describe("Edit page using Serenity/JS", () => {
  test("actor can start a new video entry", async ({ actorCalled }) => {
    const actor = actorCalled("Nina");

    await actor.attemptsTo(
      Navigate.to("/edit/new"),
      Wait.until(titleField, isVisible()),
      Ensure.that(Attribute.called("value").of(titleField), equals("")),
      Ensure.that(Attribute.called("value").of(languageField), equals("en")),
      Ensure.that(saveButton, not(isEnabled())),
      Enter.theValue("SerenityJS Showcase Title").into(titleField),
      Press.the(Key.Tab).in(titleField),
      Ensure.that(
        Attribute.called("value").of(titleField),
        equals("SerenityJS Showcase Title"),
      ),
      Ensure.that(saveButton, isEnabled()),
    );
  });

  test.skip("actor sees existing film data before making edits", async ({
    actorCalled,
  }) => {
    const actor = actorCalled("Edgar");
    const originalTitle = "Demolition Man";
    const editedTitle = `${originalTitle} (Edited)`;

    await actor.attemptsTo(
      Navigate.to("/edit/59"),
      Wait.until(titleField, isVisible()),
      Ensure.that(
        Attribute.called("value").of(titleField),
        equals(originalTitle),
      ),
      Ensure.that(
        Attribute.called("value").of(languageField),
        equals("german, english, spanish"),
      ),
      Ensure.that(
        Attribute.called("value").of(diskIdField),
        equals("R04F4D01"),
      ),
      Ensure.that(Attribute.called("value").of(yearField), equals("1993")),
      Ensure.that(saveButton, not(isEnabled())),
      Clear.theValueOf(titleField),
      Enter.theValue(editedTitle).into(titleField),
      Press.the(Key.Tab).in(titleField),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
      Navigate.reloadPage(),
      Wait.upTo(Duration.ofSeconds(15)).until(titleField, isVisible()),
      Ensure.that(
        Attribute.called("value").of(titleField),
        equals(editedTitle),
      ),
      Clear.theValueOf(titleField),
      Enter.theValue(originalTitle).into(titleField),
      Press.the(Key.Tab).in(titleField),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
      Navigate.reloadPage(),
      Wait.upTo(Duration.ofSeconds(15)).until(titleField, isVisible()),
      Ensure.that(
        Attribute.called("value").of(titleField),
        equals(originalTitle),
      ),
    );
  });

  test("actor can discard edits to restore original data", async ({
    actorCalled,
  }) => {
    const actor = actorCalled("Edgar");
    const originalTitle = "Demolition Man";
    const draftTitle = `${originalTitle} Draft`;

    await actor.attemptsTo(
      Navigate.to("/edit/59"),
      Wait.until(titleField, isVisible()),
      Ensure.that(
        Attribute.called("value").of(titleField),
        equals(originalTitle),
      ),
      Clear.theValueOf(titleField),
      Enter.theValue(draftTitle).into(titleField),
      Press.the(Key.Tab).in(titleField),
      Ensure.that(saveButton, isEnabled()),
      Ensure.that(discardButton, isEnabled()),
      Click.on(discardButton),
      Wait.until(saveButton, not(isEnabled())),
      Ensure.that(
        Attribute.called("value").of(titleField),
        equals(originalTitle),
      ),
    );
  });

  test.skip("actor can edit disk info and year, persist, and revert", async ({
    actorCalled,
  }) => {
    const actor = actorCalled("Edgar");
    const originalDiskId = "R04F4D01";
    const editedDiskId = "R04F4D99";
    const originalYear = "1993";
    const editedYear = "1994";

    await actor.attemptsTo(
      Navigate.to("/edit/59"),
      Wait.until(diskIdField, isVisible()),
      Ensure.that(
        Attribute.called("value").of(diskIdField),
        equals(originalDiskId),
      ),
      Ensure.that(
        Attribute.called("value").of(yearField),
        equals(originalYear),
      ),
      Clear.theValueOf(diskIdField),
      Enter.theValue(editedDiskId).into(diskIdField),
      Press.the(Key.Tab).in(diskIdField),
      Clear.theValueOf(yearField),
      Enter.theValue(editedYear).into(yearField),
      Press.the(Key.Tab).in(yearField),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
      Navigate.reloadPage(),
      Wait.upTo(Duration.ofSeconds(15)).until(diskIdField, isPresent()),
      Ensure.that(
        Attribute.called("value").of(diskIdField),
        equals(editedDiskId),
      ),
      Ensure.that(Attribute.called("value").of(yearField), equals(editedYear)),
      Clear.theValueOf(diskIdField),
      Enter.theValue(originalDiskId).into(diskIdField),
      Press.the(Key.Tab).in(diskIdField),
      Clear.theValueOf(yearField),
      Enter.theValue(originalYear).into(yearField),
      Press.the(Key.Tab).in(yearField),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
      Navigate.reloadPage(),
      Wait.upTo(Duration.ofSeconds(15)).until(diskIdField, isVisible()),
      Ensure.that(
        Attribute.called("value").of(diskIdField),
        equals(originalDiskId),
      ),
      Ensure.that(
        Attribute.called("value").of(yearField),
        equals(originalYear),
      ),
    );
  });

  test("actor can use disk id suggestion while drafting a manual entry", async ({
    actorCalled,
  }) => {
    const actor = actorCalled("Mara");
    const uniqueToken = Date.now();
    const draftTitle = `Serenity Draft ${uniqueToken}`;
    const diskPrefix = `R${String((uniqueToken % 80) + 10).padStart(2, "0")}F${String((Math.floor(uniqueToken / 100) % 80) + 10).padStart(2, "0")}`;

    await actor.attemptsTo(
      Navigate.to("/edit/new"),
      Wait.until(titleField, isVisible()),
      Enter.theValue(draftTitle).into(titleField),
      Press.the(Key.Tab).in(titleField),
      Enter.theValue(diskPrefix).into(diskIdField),
      Wait.until(diskIdSuggestion, isVisible()),
      Click.on(diskIdSuggestion),
      Ensure.that(
        Attribute.called("value").of(diskIdField),
        matches(new RegExp(`^${diskPrefix}D\\d{2}$`)),
      ),
      Ensure.that(saveButton, isEnabled()),
      Ensure.that(discardButton, isEnabled()),
      Click.on(discardButton),
      Ensure.that(Attribute.called("value").of(titleField), equals("")),
      Ensure.that(Attribute.called("value").of(diskIdField), equals("")),
      Ensure.that(saveButton, not(isEnabled())),
    );
  });

  test("actor can apply a TMDB backdrop without changing the cover image source", async ({
    actorCalled,
    page,
  }) => {
    const actor = actorCalled("Tara");
    const uniqueToken = Date.now();
    const createdTitle = `Serenity TMDB Draft ${uniqueToken}`;
    const diskPrefix = `R${String((uniqueToken % 80) + 10).padStart(2, "0")}F${String((Math.floor(uniqueToken / 100) % 80) + 10).padStart(2, "0")}`;
    const localCoverUrl = "http://127.0.0.1:3000/not_found.jpg?cover=603";
    const primaryBackdropUrl = "http://127.0.0.1:3000/not_found.jpg?backdrop=primary";
    const alternateBackdropUrl = "http://127.0.0.1:3000/not_found.jpg?backdrop=alternate";

    await page.route("**/api/tmdb/movie/603", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: 603,
          mediaKind: "movie",
          title: "The Matrix",
          originalTitle: "The Matrix",
          overview: "A computer hacker learns about the true nature of reality.",
          releaseDate: "1999-03-31",
          runtime: 136,
          voteAverage: 8.2,
          posterUrl: localCoverUrl,
          backdropUrl: primaryBackdropUrl,
          backdropCandidates: [
            {
              filePath: "/backdrop-primary.jpg",
              url: primaryBackdropUrl,
              width: 1280,
              height: 720,
              voteAverage: 5.6,
              voteCount: 40,
              iso639_1: null,
              isPrimary: true,
            },
            {
              filePath: "/backdrop-alt.jpg",
              url: alternateBackdropUrl,
              width: 1280,
              height: 720,
              voteAverage: 5.4,
              voteCount: 20,
              iso639_1: null,
              isPrimary: false,
            },
          ],
          imdbId: "tt0133093",
          genres: ["Action", "Science Fiction"],
          productionCountries: ["United States of America"],
          directors: ["Lana Wachowski", "Lilly Wachowski"],
          cast: [],
          language: "en-US",
        }),
      });
    });

    await actor.attemptsTo(
      Navigate.to("/edit/new"),
      Wait.until(titleField, isVisible()),
      Enter.theValue(createdTitle).into(titleField),
      Press.the(Key.Tab).in(titleField),
      Enter.theValue(diskPrefix).into(diskIdField),
      Wait.until(diskIdSuggestion, isVisible()),
      Click.on(diskIdSuggestion),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
    );

    await page.waitForURL(/\/edit\/\d+$/);
    await page.goto(page.url(), { waitUntil: "domcontentloaded" });
    await actor.attemptsTo(
      Wait.upTo(Duration.ofSeconds(15)).until(titleField, isVisible()),
      Wait.upTo(Duration.ofSeconds(15)).until(tmdbRefreshToggle, isVisible()),
    );

    await actor.attemptsTo(
      Clear.theValueOf(imdbIdField),
      Enter.theValue("tmdb:movie:603").into(imdbIdField),
      Press.the(Key.Tab).in(imdbIdField),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
    );

    await page.goto(page.url(), { waitUntil: "domcontentloaded" });

    await actor.attemptsTo(
      Wait.upTo(Duration.ofSeconds(15)).until(titleField, isVisible()),
      Wait.upTo(Duration.ofSeconds(15)).until(tmdbRefreshToggle, isVisible()),
      Click.on(tmdbRefreshToggle),
      Wait.until(tmdbReviewBackToSearch, isVisible()),
      Ensure.that(tmdbRefreshQuery, not(isPresent())),
      Click.on(tmdbReviewBackToSearch),
      Wait.until(tmdbRefreshQuery, isVisible()),
      Click.on(tmdbRefreshToggle),
      Click.on(tmdbRefreshToggle),
      Wait.until(tmdbReviewBackToSearch, isVisible()),
      Wait.until(tmdbBackdropOption(1), isVisible()),
      Click.on(tmdbBackdropOption(1)),
      Click.on(tmdbMergeApplyButton),
      Ensure.that(Attribute.called("value").of(imageUrlField), equals(localCoverUrl)),
      Ensure.that(Attribute.called("value").of(custom4Field), equals(alternateBackdropUrl)),
      Ensure.that(saveButton, isEnabled()),
      Click.on(saveButton),
      Wait.until(saveButton, not(isEnabled())),
    );

    await page.reload();

    await actor.attemptsTo(
      Wait.until(titleField, isVisible()),
      Ensure.that(Attribute.called("value").of(imageUrlField), equals(localCoverUrl)),
      Ensure.that(Attribute.called("value").of(custom4Field), equals(alternateBackdropUrl)),
      Ensure.that(Attribute.called("value").of(imdbIdField), equals("tmdb:movie:603")),
    );
  });
});
