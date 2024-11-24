import { getVideos } from './get-videos';

describe('getVideos', () => {
  it('should find movie by title', async () => {
  const args = { title: "Grasgeflüster"};
  const query = undefined;
  const result = await getVideos(args, query);
  expect(result[0].diskid).toEqual('R18F5D06');
  });
});
