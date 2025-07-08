import React from "react";

const SwitchOption = ({
  isPassword,
  setIsPassword,
}: {
  isPassword: boolean;
  setIsPassword: any;
}) => {
  // Magic link is hidden for now, always show password option
  React.useEffect(() => {
    setIsPassword(true);
  }, [setIsPassword]);

  // Hide the entire switch since only password option is available
  return null;
};

export default SwitchOption;
