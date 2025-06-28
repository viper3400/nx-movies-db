import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerFooter,
  Button,
  useDisclosure,
  Radio,
  RadioGroup,
  Switch,
  Badge,
  Accordion,
  AccordionItem,
  Checkbox,
  CheckboxGroup,
} from "@heroui/react";
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


}
export function FilterDrawer(
  {
    filters: parent,
    setFilters: setParent,
    isDefaultFilter,
    mediaTypes,
    genres,
  }: FilterDrawerProperties) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Local state to manage changes within the component
  const [local, setLocal] = useState<MovieSearchFilters>(parent);

  // Sync local state with parent state when the drawer is opened
  const handleOpen = () => {
    setLocal(parent); // Sync local state with parent when opening
    onOpen();
  };

  // Apply changes to the parent state
  const handleApply = async (onClose: () => void) => {
    setParent(local); // <-- This updates the parent with the new filters!
    onClose(); // Close the drawer
  };

  const createLocalUpdater = <K extends keyof MovieSearchFilters>(key: K) =>
    (value: MovieSearchFilters[K]) =>
      setLocal(prev => ({ ...prev, [key]: value }));

  const updateFavorites = createLocalUpdater("filterForFavorites");
  const updateWatchAgain = createLocalUpdater("filterForWatchAgain");
  const updateRandomMovies = createLocalUpdater("filterForRandomMovies");
  const updateMediaTypes = createLocalUpdater("filterForMediaTypes");
  const updateGenres = createLocalUpdater("filterForGenres");
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
        size="lg"
        variant="ghost"
        onPress={handleOpen}
        startContent={
          isDefaultFilter ? (
            <Tune />
          ) : (
            <Badge color="secondary" content="" placement="bottom-right" shape="circle">
              <Tune />
            </Badge>
          )
        }
      >
        Filter
      </Button>

      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">{t("search.moviesFilterLabel")}</DrawerHeader>
              <DrawerBody>
                <div className="flex w-full flex-col gap-4">
                  <Switch
                    isSelected={local.filterForFavorites}
                    onValueChange={updateFavorites}>{t("search.favoriteMoviesFilterLabel")}</Switch>
                  <Switch
                    isSelected={local.filterForWatchAgain}
                    onValueChange={updateWatchAgain}>{t("search.watchagainMoviesFilterLabel")}</Switch>
                  <Switch
                    isSelected={local.filterForRandomMovies}
                    onValueChange={updateRandomMovies}>{t("search.randomMoviesFilterLabel")}</Switch>
                </div>
                <Accordion>
                  <AccordionItem
                    key="1"
                    aria-label="local-mediatype-filter"
                    title={t("search.mediaTypeFilterLabel")}
                    subtitle={local.filterForMediaTypes.length !== 0 ?
                      local.filterForMediaTypes
                        .map((mt) => mediaTypes.find((m) => m.value === mt)?.label)
                        .filter(Boolean)
                        .join(", ") :
                      t("search.nofilter")
                    }
                  >
                    <CheckboxGroup
                      value={local.filterForMediaTypes}
                      onValueChange={updateMediaTypes}
                    >
                      {mediaTypes.map((mt) => (
                        <Checkbox key={mt.value} value={mt.value}>{mt.label}</Checkbox>
                      ))}
                    </CheckboxGroup>
                  </AccordionItem>
                  <AccordionItem
                    key="2"
                    aria-label="local-genre-filter"
                    title={t("search.genreFilterLabel")}
                    subtitle={local.filterForGenres.length !== 0 ?
                      local.filterForGenres
                        .map((mt) => genres.find((m) => m.value === mt)?.label)
                        .filter(Boolean)
                        .join(", ") :
                      t("search.nofilter")
                    }
                  >
                    <CheckboxGroup
                      value={local.filterForGenres}
                      onValueChange={updateGenres}
                    >
                      {genres.map((mt) => (
                        <Checkbox key={mt.value} value={mt.value}>{mt.label}</Checkbox>
                      ))}
                    </CheckboxGroup>
                  </AccordionItem>
                  <AccordionItem key="3" aria-label="local-tv-series-filter"
                    title={t("search.tvSeriesFilterLabel")}
                    subtitle={
                      `${t(
                        local.tvSeriesMode === "EXCLUDE_TVSERIES"
                          ? "search.tvSeriesFilterExcludeTvSeries"
                          : local.tvSeriesMode === "INCLUDE_TVSERIES"
                            ? "search.tvSeriesFilterIncludeTvSeries"
                            : "search.tvSeriesFilterOnlyTvSeries"
                      )
                      }`
                    }>
                    <RadioGroup
                      value={local.tvSeriesMode}
                      onValueChange={updateTvSeriesMode}
                      orientation="vertical"
                    >
                      <Radio value="EXCLUDE_TVSERIES">{t("search.tvSeriesFilterExcludeTvSeries")}</Radio>
                      <Radio value="INCLUDE_TVSERIES">{t("search.tvSeriesFilterIncludeTvSeries")}</Radio>
                      <Radio value="ONLY_TVSERIES">{t("search.tvSeriesFilterOnlyTvSeries")}</Radio>
                    </RadioGroup>
                  </AccordionItem>
                  <AccordionItem
                    key="4"
                    aria-label="deleted-movies-filter"
                    title={t("search.deletedMoviesFilterLabel")}
                    subtitle={
                      `${t(
                        local.deleteMode === "EXCLUDE_DELETED"
                          ? "search.deletedMoviesFilterExcludeDeleted"
                          : local.deleteMode === "INCLUDE_DELETED"
                            ? "search.deletedMoviesFilterIncludeDeleted"
                            : "search.deletedMoviesFilterOnlyDeleted"
                      )
                      }`
                    }
                  >
                    <RadioGroup
                      value={local.deleteMode}
                      onValueChange={updateDeleteMode}
                      orientation="vertical"
                    >
                      <Radio value="EXCLUDE_DELETED">{t("search.deletedMoviesFilterExcludeDeleted")}</Radio>
                      <Radio value="INCLUDE_DELETED">{t("search.deletedMoviesFilterIncludeDeleted")}</Radio>
                      <Radio value="ONLY_DELETED">{t("search.deletedMoviesFilterOnlyDeleted")}</Radio>
                    </RadioGroup>
                  </AccordionItem>
                </Accordion>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {t("common.close")}
                </Button>
                <Button color="default" onPress={
                  () => {
                    handleApply(onClose);
                    onClose();
                  }}>
                  {t("common.apply")}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer >
    </>
  );
}

export default FilterDrawer;
