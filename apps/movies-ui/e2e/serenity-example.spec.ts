import { test } from "@serenity-js/playwright-test";
import { Ensure, includes } from "@serenity-js/assertions";
import { By, Navigate, Page, PageElements, Text, isVisible } from "@serenity-js/web";

const MoviesNavigationTitle = PageElements.located(By.css("p.font-bold.text-inherit")).describedAs("movies navigation title").first();
const MoviesSearchField = PageElements.located(By.css("input[data-type='text']")).describedAs("movie search input").first();

test("actor can inspect the movies landing page", async ({ actorCalled }) => {
  const actor = actorCalled("Serena");

  await actor.attemptsTo(
    Navigate.to("/movies"),
    Ensure.that(Page.current().title(), includes("Filmdatenbank")),
    Ensure.that(Text.of(MoviesNavigationTitle), includes("Filmdatenbank")),
    Ensure.that(MoviesSearchField, isVisible())
  );
});
