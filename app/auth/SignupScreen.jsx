import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { useRouter } from "expo-router";
import { apiCall } from "../../utils/api";

function SignupScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authCtx = useContext(AuthContext);
  const router = useRouter();

  async function signupHandler(formData) {
    setIsAuthenticating(true);

    console.log(formData.email + " - " + formData.password);
    router.navigate('/(tabs)')
    /*
    try {
      let res = await apiCall("post", "/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });
      console.log("res :" + JSON.stringify(res));

      if (res.success) {
        // go to homepage
        const isVerified = res.data.isVerified;
        if (isVerified == 0) {
          router.replace({
            pathname: "/Auth/OtpScreen",
            params: { email: formData.email },
          });
        }
        // const refreshToken = res.data.refreshToken;
        // authCtx.authenticate(accessToken, refreshToken);
      } else {
        console.log(res.data.errorCode);
        // Alert.alert("Authentication failed!", "User Already exist.");
        setIsAuthenticating(false);
      }
    } catch (error) {
      // Alert.alert(
      //   "Authentication failed!",
      //   "Could not log you in. Please check your credentials or try again later!"
      // );
      setIsAuthenticating(false);
    }
    */
  }

  if (isAuthenticating) {
    return <Text>Loading...</Text>;
  }

  return (
    <AuthContent
      type="register"
      onSubmit={signupHandler}
    />
  );
}

export default SignupScreen;
