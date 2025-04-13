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
} from "@heroui/react";
import { Tune } from "../icons";

interface FilterDrawerProperties {
  labelFilterOptions: string;
  labelClose: string;
  labelExcludeDeleted: string;
  labelIncludeDeleted: string;
  labelOnlyDeleted: string;
  labelDeleteModeHeading: string;
  deleteMode: string;
  setDeleteMode: (mode: string) => void;
  filterForFavorites: boolean;
  setFilterForFavorites: () => void;
  filterForWatchAgain: boolean;
  setFilterForWatchAgain: () => void;
  favoriteMoviesFilterLabel: string;
  watchagainMoviesFilterLabel: string;
}
export function FilterDrawer(
  {
    labelClose,
    labelFilterOptions,
    labelExcludeDeleted,
    labelIncludeDeleted,
    labelOnlyDeleted,
    labelDeleteModeHeading,
    filterForFavorites,
    setFilterForFavorites,
    filterForWatchAgain,
    setFilterForWatchAgain,
    favoriteMoviesFilterLabel,
    watchagainMoviesFilterLabel,
    deleteMode,
    setDeleteMode }:
    FilterDrawerProperties) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  return (
    <>
      <Button size="lg" variant="ghost" onPress={onOpen} startContent={<Tune />}>
        Filter
      </Button>
      <Drawer isOpen={isOpen} onOpenChange={onOpenChange}>
        <DrawerContent>
          {(onClose) => (
            <>
              <DrawerHeader className="flex flex-col gap-1">{labelFilterOptions}</DrawerHeader>
              <DrawerBody>
                <div className="flex w-full flex-col">
                  <div className="pb-4">
                    <Switch
                      isSelected={filterForFavorites}
                      onValueChange={setFilterForFavorites}>{favoriteMoviesFilterLabel}</Switch>
                  </div>
                  <Switch
                    isSelected={filterForWatchAgain}
                    onValueChange={setFilterForWatchAgain}>{watchagainMoviesFilterLabel}</Switch>
                </div>
                <RadioGroup
                  value={deleteMode}
                  onValueChange={setDeleteMode}
                  orientation="vertical"
                  label={labelDeleteModeHeading}>
                  <Radio value="EXCLUDE_DELETED">{labelExcludeDeleted}</Radio>
                  <Radio value="INCLUDE_DELETED">{labelIncludeDeleted}</Radio>
                  <Radio value="ONLY_DELETED">{labelOnlyDeleted}</Radio>
                </RadioGroup>
              </DrawerBody>
              <DrawerFooter>
                <Button color="danger" variant="light" onPress={onClose}>
                  {labelClose}
                </Button>
              </DrawerFooter>
            </>
          )}
        </DrawerContent >
      </Drawer >
    </>
  );
}

export default FilterDrawer;
