import { parseUserString } from '../src/lib/allowed-user-parser';
describe("Allowed user parser", () => {
  it("should parse a single user string", () => {
    const testString = "my@example.com,Michael,3";

    const actual = parseUserString(testString);
    expect(actual.length).toBe(1);
    expect(actual[0].name).toEqual("Michael");
    expect(actual[0].email).toEqual("my@example.com");
    expect(actual[0].id).toBe(3);
  });

  it("should parse a multi user string", () => {
    const testString = "my@example.com,Michael,3;jane@doe.com,Jane,2";

    const actual = parseUserString(testString);
    expect(actual.length).toBe(2);

    expect(actual[0].name).toEqual("Michael");
    expect(actual[0].email).toEqual("my@example.com");
    expect(actual[0].id).toBe(3);

    expect(actual[1].name).toEqual("Jane");
    expect(actual[1].email).toEqual("jane@doe.com");
    expect(actual[1].id).toBe(2);
  });

});
