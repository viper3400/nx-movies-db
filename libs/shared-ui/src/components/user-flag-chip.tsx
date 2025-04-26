import { Chip } from "@heroui/react";
import { FlagFilled, FlagOutlined, HeartFilled, HeartOutlined } from "../icons/icons";

export interface UserFlagChipProperties {
  type: "Favorite" | "Watchagain";
  active: boolean;
  loading?: boolean;

}
export const UserFlagChip = ({ type, active, loading }: UserFlagChipProperties) => {
  return (
    <Chip className={`text-left w-full ${loading ? "animate-pulse" : ""}`} color={active ? "warning" : "default"}>
      {type === "Favorite" ? (
        active ? <HeartFilled /> : <HeartOutlined />
      ) : (
        active ? <FlagFilled /> : <FlagOutlined />
      )}
    </Chip>
  );
};
