import Page from "./page";
import { redirect } from "next/navigation";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

describe("TMDB import compatibility route", () => {
  it("redirects to the unified new-entry edit route", () => {
    Page();

    expect(redirect).toHaveBeenCalledWith("/edit/new");
  });
});
