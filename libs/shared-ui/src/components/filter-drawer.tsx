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
} from "@heroui/react";
import { Tune } from "../icons";
import { useState } from "react";
import { t } from "i18next";

interface FilterDrawerProperties {
  deleteMode: string;
  setDeleteMode: (mode: string) => void;
  tvSeriesMode: string;
  setTvSeriesMode: (mode: string) => void;
  filterForFavorites: boolean;
  setFilterForFavorites: (value: boolean) => void;
  filterForWatchAgain: boolean;
  setFilterForWatchAgain: (value: boolean) => void;
  filterForRandomMovies: boolean;
  setFilterForRandomMovies: (value: boolean) => void;
  isDefaultFilter: boolean;
}
export function FilterDrawer(
  {
    deleteMode: parentDeleteMode,
    setDeleteMode,
    tvSeriesMode: parentTvSeriesMode,
    setTvSeriesMode,
    filterForFavorites: parentFilterForFavorites,
    setFilterForFavorites,
    filterForWatchAgain: parentFilterForWatchAgain,
    setFilterForWatchAgain,
    filterForRandomMovies: parentFilterForRandomMovies,
    setFilterForRandomMovies,
    isDefaultFilter
  }: FilterDrawerProperties) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Local state to manage changes within the component
  const [localDeleteMode, setLocalDeleteMode] = useState(parentDeleteMode);
  const [localTvSeriesMode, setLocalTvSeriesMode] = useState(parentTvSeriesMode);
  const [localFilterForFavorites, setLocalFilterForFavorites] = useState(parentFilterForFavorites);
  const [localFilterForWatchAgain, setLocalFilterForWatchAgain] = useState(parentFilterForWatchAgain);
  const [localFilterForRandomMovies, setLocalFilterForRandomMovies] = useState(parentFilterForRandomMovies);

  // Sync local state with parent state when the drawer is opened
  const handleOpen = () => {
    setLocalDeleteMode(parentDeleteMode);
    setLocalTvSeriesMode(parentTvSeriesMode);
    setLocalFilterForFavorites(parentFilterForFavorites);
    setLocalFilterForWatchAgain(parentFilterForWatchAgain);
    setLocalFilterForRandomMovies(parentFilterForRandomMovies);
    onOpen();
  };

  // Apply changes to the parent state
  const handleApply = async (onClose: () => void) => {
    setDeleteMode(localDeleteMode);
    setTvSeriesMode(localTvSeriesMode);
    setFilterForFavorites(localFilterForFavorites);
    setFilterForWatchAgain(localFilterForWatchAgain);
    setFilterForRandomMovies(localFilterForRandomMovies);
    onClose(); // Close the drawer
  };

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
                    isSelected={localFilterForFavorites}
                    onValueChange={setLocalFilterForFavorites}>{t("search.favoriteMoviesFilterLabel")}</Switch>
                  <Switch
                    isSelected={localFilterForWatchAgain}
                    onValueChange={setLocalFilterForWatchAgain}>{t("search.watchagainMoviesFilterLabel")}</Switch>
                  <Switch
                    isSelected={localFilterForRandomMovies}
                    onValueChange={setLocalFilterForRandomMovies}>{t("search.randomMoviesFilterLabel")}</Switch>
                </div>
                <RadioGroup
                  value={localTvSeriesMode}
                  onValueChange={setLocalTvSeriesMode}
                  orientation="vertical"
                  label={t("search.tvSeriesFilterLabel")}>
                  <Radio value="EXCLUDE_TVSERIES">{t("search.tvSeriesFilterExcludeTvSeries")}</Radio>
                  <Radio value="INCLUDE_TVSERIES">{t("search.tvSeriesFilterIncludeTvSeries")}</Radio>
                  <Radio value="ONLY_TVSERIES">{t("search.tvSeriesFilterOnlyTvSeries")}</Radio>
                </RadioGroup>
                <RadioGroup
                  value={localDeleteMode}
                  onValueChange={setLocalDeleteMode}
                  orientation="vertical"
                  label={t("search.deletedMoviesFilterLabel")}>
                  <Radio value="EXCLUDE_DELETED">{t("search.deletedMoviesFilterExcludeDeleted")}</Radio>
                  <Radio value="INCLUDE_DELETED">{t("search.deletedMoviesFilterIncludeDeleted")}</Radio>
                  <Radio value="ONLY_DELETED">{t("search.deletedMoviesFilterOnlyDeleted")}</Radio>
                </RadioGroup>
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
