import { test } from "@serenity-js/playwright-test";
import { Ensure, equals, not } from "@serenity-js/assertions";
import { Wait } from "@serenity-js/core";
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

const editForm = PageElement.located(By.css("[data-testid='editable-form-wrapper']")).describedAs("edit video form");
const saveButton = PageElement.located(By.css("[data-testid='editable-form-save']")).describedAs("save button");

const videoField = (name: string, description: string) =>
  PageElement.located(By.css(`[data-testid='video-field-${name}']`)).describedAs(description);

const titleField = videoField("title", "title field");
const languageField = videoField("language", "language field");
const diskIdField = videoField("diskid", "disk id field");
const yearField = videoField("year", "year field");

test("actor can start a new video entry", async ({ actorCalled }) => {
  const actor = actorCalled("Nina");

  await actor.attemptsTo(
    Navigate.to("/movies/edit/new"),
    Wait.until(titleField, isVisible()),
    Ensure.that(Attribute.called("value").of(titleField), equals("")),
    Ensure.that(Attribute.called("value").of(languageField), equals("en")),
    Ensure.that(saveButton, not(isEnabled())),
    Enter.theValue("SerenityJS Showcase Title").into(titleField),
    Press.the(Key.Tab).in(titleField),
    Ensure.that(Attribute.called("value").of(titleField), equals("SerenityJS Showcase Title")),
    Ensure.that(saveButton, isEnabled())
  );
});

test("actor sees existing film data before making edits", async ({ actorCalled }) => {
  const actor = actorCalled("Edgar");
  const originalTitle = "Demolition Man";
  const editedTitle = `${originalTitle} (Edited)`;

  await actor.attemptsTo(
    Navigate.to("/movies/edit/59"),
    Wait.until(titleField, isVisible()),
    Ensure.that(Attribute.called("value").of(titleField), equals(originalTitle)),
    Ensure.that(Attribute.called("value").of(languageField), equals("german, english, spanish")),
    Ensure.that(Attribute.called("value").of(diskIdField), equals("R04F4D01")),
    Ensure.that(Attribute.called("value").of(yearField), equals("1993")),
    Ensure.that(saveButton, not(isEnabled())),
    Clear.theValueOf(titleField),
    Enter.theValue(editedTitle).into(titleField),
    Press.the(Key.Tab).in(titleField),
    Ensure.that(saveButton, isEnabled()),
    Click.on(saveButton),
    Wait.until(saveButton, not(isEnabled())),
    Navigate.reloadPage(),
    Wait.until(titleField, isVisible()),
    Ensure.that(Attribute.called("value").of(titleField), equals(editedTitle)),
    Clear.theValueOf(titleField),
    Enter.theValue(originalTitle).into(titleField),
    Press.the(Key.Tab).in(titleField),
    Ensure.that(saveButton, isEnabled()),
    Click.on(saveButton),
    Wait.until(saveButton, not(isEnabled())),
    Navigate.reloadPage(),
    Wait.until(titleField, isVisible()),
    Ensure.that(Attribute.called("value").of(titleField), equals(originalTitle))
  );
});
