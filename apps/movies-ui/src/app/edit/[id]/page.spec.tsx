import React from "react";
import Page from "./page";
import { UpsertVideoForm } from "../../../components/upsert-video-form";
import { getAllowedSession } from "../../services/actions/getAllowedSession";
import { getVideoData } from "../../services/actions";
import type { VideoData } from "@nx-movies-db/shared-types";

jest.mock("../../../components/upsert-video-form", () => ({
  UpsertVideoForm: jest.fn(() => null),
}));

jest.mock("../../services/actions/getAllowedSession", () => ({
  getAllowedSession: jest.fn(),
}));

jest.mock("../../services/actions", () => ({
  getVideoData: jest.fn(),
}));

const mockGetAllowedSession = jest.mocked(getAllowedSession);
const mockGetVideoData = jest.mocked(getVideoData);
const mockUpsertVideoForm = jest.mocked(UpsertVideoForm);

function findElementByType(node: React.ReactNode, type: React.ElementType): React.ReactElement | undefined {
  if (!React.isValidElement(node)) return undefined;
  if (node.type === type) return node;

  const children = (node.props as { children?: React.ReactNode }).children;
  if (!children) return undefined;

  const childArray = React.Children.toArray(children);
  for (const child of childArray) {
    const found = findElementByType(child, type);
    if (found) return found;
  }

  return undefined;
}

describe("Edit page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetAllowedSession.mockResolvedValue({
      userName: "Session Owner",
      eMail: "owner@example.com",
      ownerId: 7,
      avatarUrl: "",
    });
  });

  it("passes the session owner id to new video forms", async () => {
    const result = await Page({
      params: Promise.resolve({ id: "new" }),
    });

    const form = findElementByType(result, mockUpsertVideoForm);

    expect(form?.props).toEqual(
      expect.objectContaining({
        consumeTmdbImportDraft: false,
        defaultOwnerId: 7,
      })
    );
    expect(mockGetVideoData).not.toHaveBeenCalled();
  });

  it("passes TMDB import mode and the session owner id to new video forms", async () => {
    const result = await Page({
      params: Promise.resolve({ id: "new" }),
      searchParams: Promise.resolve({ import: "tmdb" }),
    });

    const form = findElementByType(result, mockUpsertVideoForm);

    expect(form?.props).toEqual(
      expect.objectContaining({
        consumeTmdbImportDraft: true,
        defaultOwnerId: 7,
      })
    );
  });

  it("passes existing video values without overriding the owner id", async () => {
    const video = {
      id: 59,
      title: "Existing",
      owner_id: 3,
    } as VideoData;
    mockGetVideoData.mockResolvedValue(video);

    const result = await Page({
      params: Promise.resolve({ id: "59" }),
    });

    const form = findElementByType(result, mockUpsertVideoForm);

    expect(mockGetVideoData).toHaveBeenCalledWith(59);
    expect(form?.props).toEqual({
      initialValues: video,
    });
  });
});
