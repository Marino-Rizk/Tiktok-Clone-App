import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { apiCall } from "../../utils/api";
import { useRouter } from "expo-router";

function ForgotPassword() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);
  const router = useRouter();

  async function forgotPasswordHandler({ phoneNumber, password }) {
    //setIsAuthenticating(true);

    console.log(phoneNumber + " - " + password);
  }

  if (isAuthenticating) {
    return <Text>Loading...</Text>;
  }

  return (
    <AuthContent
      screen="forgotPassword"
      headerHeight={40}
      onAuthenticate={forgotPasswordHandler}
    />
  );
}

export default ForgotPassword;
