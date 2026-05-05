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
const diskIdSuggestion = PageElement.located(
  By.css("[data-testid='video-field-diskid-suggestion']"),
).describedAs("disk id suggestion");
const yearField = videoField("year", "year field");

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
});
