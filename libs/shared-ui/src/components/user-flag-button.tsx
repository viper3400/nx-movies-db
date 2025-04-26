import { UserFlagChip, UserFlagChipProperties } from "./user-flag-chip";

interface UserFlagButtonProperties {
  userFlagChipProps: UserFlagChipProperties;
  onPress?: () => Promise<void>;
}
export const UserFlagButton = ({userFlagChipProps, onPress} : UserFlagButtonProperties) => {
  return (
    <button onClick={onPress} disabled={userFlagChipProps.loading}>
      <UserFlagChip type={userFlagChipProps.type} active={userFlagChipProps.active} loading={userFlagChipProps.loading}/>
    </button>
  );
};
