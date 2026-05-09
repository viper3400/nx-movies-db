/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { VideoData } from "@nx-movies-db/shared-types";
import { UpsertVideoForm } from "./upsert-video-form";
import { upsertVideoData } from "../app/services/actions";
import { useAvailableMediaAndGenres } from "../hooks/useAvailableMediaAndGenres";
import { useAvailableOwners } from "../hooks/useAvailableOwners";
import { TMDB_IMPORT_DRAFT_STORAGE_KEY } from "../app/services/actions/tmdbMetadataMapper";

type UpsertVideoDataFormProps = {
  values: VideoData;
  onChange: (values: VideoData) => void;
  readOnly?: boolean;
  readOnlyFields?: Partial<Record<keyof VideoData, boolean>>;
};

const mockUpsertVideoDataForm = jest.fn((props: UpsertVideoDataFormProps) => {
  const fieldDisabled = (key: keyof VideoData) => props.readOnly || !!props.readOnlyFields?.[key];
  const updateTitle = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange({ ...props.values, title: event.target.value });
  };

  return (
    <div>
      {([
        "id",
        "md5",
        "filesize",
        "filedate",
        "audio_codec",
        "video_codec",
        "video_width",
        "video_height",
        "lastupdate",
        "created",
        "title",
        "diskid",
        "year",
        "owner_id",
      ] as Array<keyof VideoData>).map((key) => (
        <input
          key={key}
          data-testid={`mock-field-${String(key)}`}
          disabled={fieldDisabled(key)}
          value={key === "title" ? props.values.title ?? "" : props.values[key]?.toString() ?? ""}
          onChange={key === "title" ? updateTitle : undefined}
          readOnly={key !== "title"}
        />
      ))}
    </div>
  );
});

const mockReplace = jest.fn();

let mockMediaAndGenresState = {
  availableMediaTypes: [{ label: "DVD", value: "1" }],
  availableGenres: [],
  loadingMediaTypes: false,
  loadingGenres: false,
  mediaTypesError: null as Error | null,
  genresError: null as Error | null,
};

let mockOwnersState = {
  availableOwners: [{ label: "Session Owner", value: "7" }],
  loadingOwners: false,
  ownersError: null as Error | null,
};

jest.mock("@heroui/react", () => ({
  Button: ({
    children,
    isDisabled,
    isLoading,
    onPress,
    ...props
  }: {
    children: React.ReactNode;
    isDisabled?: boolean;
    isLoading?: boolean;
    onPress?: () => void;
  }) => (
    <button type="button" disabled={isDisabled || isLoading} onClick={onPress} {...props}>
      {children}
    </button>
  ),
  Card: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  CardBody: ({ children, ...props }: { children: React.ReactNode }) => <div {...props}>{children}</div>,
  Chip: ({ children, ...props }: { children: React.ReactNode }) => <span {...props}>{children}</span>,
  Skeleton: (props: Record<string, unknown>) => <div data-testid="mock-skeleton" {...props} />,
  Spacer: (props: Record<string, unknown>) => <div data-testid="mock-spacer" {...props} />,
  addToast: jest.fn(),
}));

jest.mock("@nx-movies-db/shared-ui", () => {
  const actual = jest.requireActual("../../../../libs/shared-ui/src/components/editable-form-wrapper");
  return {
    EditableFormWrapper: actual.EditableFormWrapper,
    UpsertVideoDataForm: (props: UpsertVideoDataFormProps) => mockUpsertVideoDataForm(props),
  };
});

jest.mock("../app/services/actions", () => ({
  getNextDiskIdSuggestion: jest.fn(),
  upsertVideoData: jest.fn(),
}));

jest.mock("../hooks/useAvailableMediaAndGenres", () => ({
  useAvailableMediaAndGenres: jest.fn(() => mockMediaAndGenresState),
}));

jest.mock("../hooks/useAvailableOwners", () => ({
  useAvailableOwners: jest.fn(() => mockOwnersState),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}));

const mockUpsertVideoData = jest.mocked(upsertVideoData);
const mockUseAvailableMediaAndGenres = jest.mocked(useAvailableMediaAndGenres);
const mockUseAvailableOwners = jest.mocked(useAvailableOwners);

const baseVideoData: VideoData = {
  id: null,
  md5: "",
  title: "Existing",
  subtitle: "",
  language: "en",
  diskid: "",
  comment: "",
  disklabel: "",
  imdbID: "",
  year: 2026,
  imgurl: "",
  director: "",
  actors: "",
  runtime: null,
  country: "",
  plot: "",
  rating: "",
  filename: "",
  filesize: null,
  filedate: null,
  audio_codec: "",
  video_codec: "",
  video_width: null,
  video_height: null,
  istv: 0,
  lastupdate: null,
  mediatype: 1,
  custom1: "",
  custom2: "",
  custom3: "",
  custom4: "",
  created: null,
  owner_id: 1,
  genreIds: [],
};

function changeTitleAndSave(title: string) {
  fireEvent.change(screen.getByTestId("mock-field-title"), {
    target: { value: title },
  });
  fireEvent.click(screen.getByTestId("editable-form-save"));
}

describe("UpsertVideoForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
    mockMediaAndGenresState = {
      availableMediaTypes: [{ label: "DVD", value: "1" }],
      availableGenres: [],
      loadingMediaTypes: false,
      loadingGenres: false,
      mediaTypesError: null,
      genresError: null,
    };
    mockOwnersState = {
      availableOwners: [{ label: "Session Owner", value: "7" }],
      loadingOwners: false,
      ownersError: null,
    };
    mockUpsertVideoData.mockResolvedValue({ id: 99, title: "Saved" } as VideoData);
  });

  it("uses the provided default owner id when saving a new blank entry", async () => {
    render(<UpsertVideoForm defaultOwnerId={7} />);

    changeTitleAndSave("New Title");

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "New Title",
          owner_id: 7,
        })
      );
    });
  });

  it("overrides TMDB import draft owner id with the provided default owner id", async () => {
    sessionStorage.setItem(
      TMDB_IMPORT_DRAFT_STORAGE_KEY,
      JSON.stringify({ ...baseVideoData, title: "Imported", owner_id: 1 })
    );

    render(<UpsertVideoForm consumeTmdbImportDraft defaultOwnerId={7} />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-field-title")).toHaveValue("Imported");
    });

    changeTitleAndSave("Imported Changed");

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Imported Changed",
          owner_id: 7,
        })
      );
    });
    expect(sessionStorage.getItem(TMDB_IMPORT_DRAFT_STORAGE_KEY)).toBeNull();
  });

  it("preserves owner id from existing initial values", async () => {
    render(<UpsertVideoForm defaultOwnerId={7} initialValues={{ ...baseVideoData, owner_id: 3 }} />);

    changeTitleAndSave("Existing Changed");

    await waitFor(() => {
      expect(mockUpsertVideoData).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Existing Changed",
          owner_id: 3,
        })
      );
    });
  });

  it("marks backend-managed fields readonly while keeping user-editable fields enabled", () => {
    render(<UpsertVideoForm defaultOwnerId={7} />);

    [
      "id",
      "md5",
      "filesize",
      "filedate",
      "audio_codec",
      "video_codec",
      "video_width",
      "video_height",
      "lastupdate",
      "created",
    ].forEach((field) => {
      expect(screen.getByTestId(`mock-field-${field}`)).toBeDisabled();
    });

    ["title", "diskid", "year", "owner_id"].forEach((field) => {
      expect(screen.getByTestId(`mock-field-${field}`)).toBeEnabled();
    });
  });

  it("disables owner id only while owner options are loading", () => {
    const { rerender } = render(<UpsertVideoForm defaultOwnerId={7} />);
    expect(screen.getByTestId("mock-field-owner_id")).toBeEnabled();

    mockOwnersState = {
      ...mockOwnersState,
      loadingOwners: true,
    };
    mockUseAvailableOwners.mockImplementation(() => mockOwnersState);
    mockUseAvailableMediaAndGenres.mockImplementation(() => mockMediaAndGenresState);

    rerender(<UpsertVideoForm defaultOwnerId={7} />);

    expect(screen.getByTestId("mock-field-owner_id")).toBeDisabled();
  });
});
