import { Accordion, Button, Checkbox, CheckboxGroup, Drawer, Radio, RadioGroup, Switch, Tooltip } from "@heroui/react";
import { Tune } from "../icons";
import { useState } from "react";
import { t } from "i18next";
import { CheckboxValue, DeleteMode, MovieSearchFilters, TvSeriesMode } from "../interfaces";

interface FilterDrawerProperties {
  filters: MovieSearchFilters;
  setFilters: (f: MovieSearchFilters) => void;
  isDefaultFilter: boolean;
  mediaTypes: CheckboxValue[];
  genres: CheckboxValue[];
  dataTestId?: string;
}
export function FilterDrawer(
  {
    filters: parent,
    setFilters: setParent,
    isDefaultFilter,
    mediaTypes,
    genres,
    dataTestId,
  }: FilterDrawerProperties) {
  const [isOpen, setIsOpen] = useState(false);

  // Local state to manage changes within the component
  const [local, setLocal] = useState<MovieSearchFilters>(parent);

  // Sync local state with parent state when the drawer is opened
  const handleOpen = () => {
    setLocal(parent); // Sync local state with parent when opening
    setIsOpen(true);
  };

  // Apply changes to the parent state
  const handleApply = () => {
    setParent(local);
  };

  const createLocalUpdater = <K extends keyof MovieSearchFilters>(key: K) =>
    (value: MovieSearchFilters[K]) =>
      setLocal(prev => ({ ...prev, [key]: value }));

  const updateFavorites = createLocalUpdater("filterForFavorites");
  const updateWatchAgain = createLocalUpdater("filterForWatchAgain");
  const updateMediaTypes = createLocalUpdater("filterForMediaTypes");
  const updateGenres = createLocalUpdater("filterForGenres");
  const updateRandomExcludeDeleted = createLocalUpdater("randomExcludeDeleted");
  const updateTvSeriesMode = (value: string) =>
    setLocal(prev => ({
      ...prev,
      tvSeriesMode: value as TvSeriesMode,
    }));

  const updateDeleteMode = (value: string) =>
    setLocal(prev => ({
      ...prev,
      deleteMode: value as DeleteMode,
    }));

  return (
    <>

      <Button
        data-testid={dataTestId}
        size="lg"
        variant="outline"
        onPress={handleOpen}
      >
        {isDefaultFilter ? (
          <Tune />
        ) : (
          <span className="relative inline-flex">
            <Tune />
            <span
              aria-hidden="true"
              className="absolute -bottom-0.5 -right-1 h-2.5 w-2.5 rounded-full bg-accent ring-2 ring-background"
            />
          </span>
        )}
        Filter
      </Button>

      <Drawer>
        <Drawer.Backdrop
          isOpen={isOpen}
          onOpenChange={setIsOpen}
          className="z-[80]"
        >
          <Drawer.Content
            placement="right"
            className="z-[81]"
          >
            <Drawer.Dialog className="h-dvh w-screen max-w-none rounded-none md:h-auto md:w-auto md:max-w-md md:rounded-l-large">
              {({ close }) => (
                <>
                  <Drawer.Header className="flex flex-col gap-1">
                    <Drawer.Heading>{t("search.moviesFilterLabel")}</Drawer.Heading>
                  </Drawer.Header>
                  <Drawer.Body>
                    <div className="flex w-full flex-col gap-4">
                      <Switch
                        isSelected={local.filterForFavorites}
                        onChange={updateFavorites}
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          {t("search.favoriteMoviesFilterLabel")}
                        </Switch.Content>
                      </Switch>
                      <Switch
                        isSelected={local.filterForWatchAgain}
                        onChange={updateWatchAgain}
                      >
                        <Switch.Content>
                          <Switch.Control>
                            <Switch.Thumb />
                          </Switch.Control>
                          {t("search.watchagainMoviesFilterLabel")}
                        </Switch.Content>
                      </Switch>
                    </div>
                    <Accordion>
                      <Accordion.Item
                        id="1"
                        aria-label="local-mediatype-filter"
                      >
                        <Accordion.Heading>
                          <Accordion.Trigger>
                            <div className="flex flex-1 flex-col text-left">
                              <span>{t("search.mediaTypeFilterLabel")}</span>
                              <span className="text-sm text-default-500">
                                {local.filterForMediaTypes.length !== 0 ?
                                  local.filterForMediaTypes
                                    .map((mt) => mediaTypes.find((m) => m.value === mt)?.label)
                                    .filter(Boolean)
                                    .join(", ") :
                                  t("search.nofilter")
                                }
                              </span>
                            </div>
                            <Accordion.Indicator />
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          <Accordion.Body>
                            <CheckboxGroup
                              name="media-types"
                              value={local.filterForMediaTypes}
                              onChange={updateMediaTypes}
                            >
                              {mediaTypes.map((mt) => (
                                <Checkbox
                                  key={mt.value}
                                  value={mt.value}
                                  variant="secondary"
                                >
                                  <Checkbox.Content>
                                    <Checkbox.Control>
                                      <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    {mt.label}
                                  </Checkbox.Content>
                                </Checkbox>
                              ))}
                            </CheckboxGroup>
                          </Accordion.Body>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item
                        id="2"
                        aria-label="local-genre-filter"
                      >
                        <Accordion.Heading>
                          <Accordion.Trigger>
                            <div className="flex flex-1 flex-col text-left">
                              <span>{t("search.genreFilterLabel")}</span>
                              <span className="text-sm text-default-500">
                                {local.filterForGenres.length !== 0 ?
                                  local.filterForGenres
                                    .map((mt) => genres.find((m) => m.value === mt)?.label)
                                    .filter(Boolean)
                                    .join(", ") :
                                  t("search.nofilter")
                                }
                              </span>
                            </div>
                            <Accordion.Indicator />
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          <Accordion.Body>
                            <CheckboxGroup
                              name="genres"
                              value={local.filterForGenres}
                              onChange={updateGenres}
                            >
                              {genres.map((mt) => (
                                <Checkbox
                                  key={mt.value}
                                  value={mt.value}
                                  variant="secondary"
                                >
                                  <Checkbox.Content>
                                    <Checkbox.Control>
                                      <Checkbox.Indicator />
                                    </Checkbox.Control>
                                    {mt.label}
                                  </Checkbox.Content>
                                </Checkbox>
                              ))}
                            </CheckboxGroup>
                          </Accordion.Body>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item id="3" aria-label="local-tv-series-filter">
                        <Accordion.Heading>
                          <Accordion.Trigger>
                            <div className="flex flex-1 flex-col text-left">
                              <span>{t("search.tvSeriesFilterLabel")}</span>
                              <span className="text-sm text-default-500">
                                {`${t(
                                  local.tvSeriesMode === "EXCLUDE_TVSERIES"
                                    ? "search.tvSeriesFilterExcludeTvSeries"
                                    : local.tvSeriesMode === "INCLUDE_TVSERIES"
                                      ? "search.tvSeriesFilterIncludeTvSeries"
                                      : "search.tvSeriesFilterOnlyTvSeries"
                                )}`}
                              </span>
                            </div>
                            <Accordion.Indicator />
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          <Accordion.Body>
                            <RadioGroup
                              name="tv-series-mode"
                              value={local.tvSeriesMode}
                              onChange={updateTvSeriesMode}
                              orientation="vertical"
                            >
                              <Radio value="EXCLUDE_TVSERIES">
                                <Radio.Content>
                                  <Radio.Control>
                                    <Radio.Indicator />
                                  </Radio.Control>
                                  {t("search.tvSeriesFilterExcludeTvSeries")}
                                </Radio.Content>
                              </Radio>
                              <Radio value="INCLUDE_TVSERIES">
                                <Radio.Content>
                                  <Radio.Control>
                                    <Radio.Indicator />
                                  </Radio.Control>
                                  {t("search.tvSeriesFilterIncludeTvSeries")}
                                </Radio.Content>
                              </Radio>
                              <Radio value="ONLY_TVSERIES">
                                <Radio.Content>
                                  <Radio.Control>
                                    <Radio.Indicator />
                                  </Radio.Control>
                                  {t("search.tvSeriesFilterOnlyTvSeries")}
                                </Radio.Content>
                              </Radio>
                            </RadioGroup>
                          </Accordion.Body>
                        </Accordion.Panel>
                      </Accordion.Item>
                      <Accordion.Item
                        id="4"
                        aria-label="deleted-movies-filter"
                        data-testid="deleted-movies-filter-accordion"
                      >
                        <Accordion.Heading>
                          <Accordion.Trigger data-testid="deleted-movies-filter-accordion-trigger">
                            <div className="flex flex-1 flex-col text-left">
                              <Tooltip delay={0}>
                                <button
                                  type="button"
                                  className="inline-flex cursor-help bg-transparent p-0 text-inherit"
                                >
                                  <span>{t("search.deletedMoviesFilterLabel")}</span>
                                </button>
                                <Tooltip.Content>
                                  {t("search.deletedMoviesFilterTooltip")}
                                </Tooltip.Content>
                              </Tooltip>
                              <span className="text-sm text-default-500">
                                {`${t(
                                  local.deleteMode === "EXCLUDE_DELETED"
                                    ? "search.deletedMoviesFilterExcludeDeleted"
                                    : local.deleteMode === "INCLUDE_DELETED"
                                      ? "search.deletedMoviesFilterIncludeDeleted"
                                      : "search.deletedMoviesFilterOnlyDeleted"
                                )}`}
                              </span>
                            </div>
                            <Accordion.Indicator />
                          </Accordion.Trigger>
                        </Accordion.Heading>
                        <Accordion.Panel>
                          <Accordion.Body>
                            <RadioGroup
                              name="delete-mode"
                              value={local.deleteMode}
                              onChange={updateDeleteMode}
                              orientation="vertical"
                            >
                              <Radio value="EXCLUDE_DELETED">
                                <Radio.Content>
                                  <Radio.Control>
                                    <Radio.Indicator />
                                  </Radio.Control>
                                  {t("search.deletedMoviesFilterExcludeDeleted")}
                                </Radio.Content>
                              </Radio>
                              <Radio value="INCLUDE_DELETED">
                                <Radio.Content>
                                  <Radio.Control>
                                    <Radio.Indicator />
                                  </Radio.Control>
                                  {t("search.deletedMoviesFilterIncludeDeleted")}
                                </Radio.Content>
                              </Radio>
                              <Radio value="ONLY_DELETED">
                                <Radio.Content>
                                  <Radio.Control>
                                    <Radio.Indicator />
                                  </Radio.Control>
                                  {t("search.deletedMoviesFilterOnlyDeleted")}
                                </Radio.Content>
                              </Radio>
                            </RadioGroup>
                            <div className="py-6">
                              <Switch
                                isSelected={local.randomExcludeDeleted}
                                onChange={updateRandomExcludeDeleted}
                                isDisabled
                              >
                                <Switch.Content>
                                  <Switch.Control>
                                    <Switch.Thumb />
                                  </Switch.Control>
                                  {t("search.randomExcludeDeletedLabel")}
                                </Switch.Content>
                              </Switch>
                            </div>
                          </Accordion.Body>
                        </Accordion.Panel>
                      </Accordion.Item>
                    </Accordion>
                  </Drawer.Body>
                  <Drawer.Footer>
                    <Button variant="danger-soft" onPress={close}>
                      {t("common.close")}
                    </Button>
                    <Button
                      variant="secondary"
                      onPress={() => {
                        handleApply();
                        close();
                      }}
                    >
                      {t("common.apply")}
                    </Button>
                  </Drawer.Footer>
                </>
              )}
            </Drawer.Dialog>
          </Drawer.Content>
        </Drawer.Backdrop>
      </Drawer>
    </>
  );
}

export default FilterDrawer;
