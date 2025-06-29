import { Button, PressEvent, Tooltip } from "@heroui/react";
import { Surprise } from "../icons";

interface SurpriseButtonProperties {
  onPress?: (e: PressEvent) => void;
  tooltip?: string;
}
export const SurpriseButton = ({ onPress, tooltip }: SurpriseButtonProperties) => {
  return (
    <Tooltip content={tooltip}>
      <Button onPress={onPress} isIconOnly variant="ghost" size="lg">
        <Surprise />
      </Button>
    </Tooltip>
  );
};
