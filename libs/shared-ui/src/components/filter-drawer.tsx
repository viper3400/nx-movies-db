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
import { useState } from "react";

interface FilterDrawerProperties {
  labelFilterOptions: string;
  labelClose: string;
  labelApply: string;
  labelExcludeDeleted: string;
  labelIncludeDeleted: string;
  labelOnlyDeleted: string;
  labelDeleteModeHeading: string;
  deleteMode: string;
  setDeleteMode: (mode: string) => void;
  filterForFavorites: boolean;
  setFilterForFavorites: (value: boolean) => void;
  filterForWatchAgain: boolean;
  setFilterForWatchAgain: (value: boolean) => void;
  favoriteMoviesFilterLabel: string;
  watchagainMoviesFilterLabel: string;
}

export function FilterDrawer(
  {
    labelClose,
    labelApply,
    labelFilterOptions,
    labelExcludeDeleted,
    labelIncludeDeleted,
    labelOnlyDeleted,
    labelDeleteModeHeading,
    favoriteMoviesFilterLabel,
    watchagainMoviesFilterLabel,

    deleteMode: parentDeleteMode,
    setDeleteMode,
    filterForFavorites: parentFilterForFavorites,
    setFilterForFavorites,
    filterForWatchAgain: parentFilterForWatchAgain,
    setFilterForWatchAgain,
  }: FilterDrawerProperties) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Local state to manage changes within the component
  const [localDeleteMode, setLocalDeleteMode] = useState(parentDeleteMode);
  const [localFilterForFavorites, setLocalFilterForFavorites] = useState(parentFilterForFavorites);
  const [localFilterForWatchAgain, setLocalFilterForWatchAgain] = useState(parentFilterForWatchAgain);

  // Sync local state with parent state when the drawer is opened
  const handleOpen = () => {
    setLocalDeleteMode(parentDeleteMode);
    setLocalFilterForFavorites(parentFilterForFavorites);
    setLocalFilterForWatchAgain(parentFilterForWatchAgain);
    onOpen();
  };

  // Apply changes to the parent state
  const handleApply = async (onClose: () => void) => {
    setDeleteMode(localDeleteMode);
    setFilterForFavorites(localFilterForFavorites);
    setFilterForWatchAgain(localFilterForWatchAgain);
    onClose(); // Close the drawer
  };

  return (
    <>
      <Button size="lg" variant="ghost" onPress={handleOpen} startContent={<Tune />}>
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
                      isSelected={localFilterForFavorites}
                      onValueChange={setLocalFilterForFavorites}>{favoriteMoviesFilterLabel}</Switch>
                  </div>
                  <Switch
                    isSelected={localFilterForWatchAgain}
                    onValueChange={setLocalFilterForWatchAgain}>{watchagainMoviesFilterLabel}</Switch>
                </div>
                <RadioGroup
                  value={localDeleteMode}
                  onValueChange={setLocalDeleteMode}
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
                <Button color="default" onPress={
                  () => {
                    handleApply(onClose);
                    onClose();
                  }}>
                  {labelApply}
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
