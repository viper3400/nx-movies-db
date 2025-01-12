import { getVideos } from "./get-videos";

describe("getVideos", () => {
  it("should find movie by title", async () => {
    const args = { title: "Grasgeflüster"};
    const query = undefined;
    const result = await getVideos(args, query);
    expect(result.length).toBe(1);
    expect(result[0].diskid).toEqual("R18F5D06");
    expect(result[0].id).toBe(253);
  });

  it("should find movie by id", async () => {
    const args = { id: "253"};
    const query = undefined;
    const result = await getVideos(args, query);
    expect(result.length).toBe(1);
    expect(result[0].diskid).toEqual("R18F5D06");
  });
});
