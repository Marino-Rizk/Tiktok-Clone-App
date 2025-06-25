import { useContext, useState } from "react";
import AuthContent from "../../components/Auth/AuthContent";
import { AuthContext } from "../../store/auth-context";
import { apiCall } from "../../utils/api";
import { useRouter } from "expo-router";

function LoginScreen() {
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // const authCtx = useContext(AuthContext);
  const router = useRouter();

  async function loginHandler(formData) {
    setIsAuthenticating(true);

    console.log(formData.email + " - " + formData.password);
    router.navigate('/(tabs)')
    /*
    try {
      let res = await apiCall("post", "/auth/login", {
        email: formData.email,
        password: formData.password,
      });
      console.log("res " + JSON.stringify(res));

      if (res.success) {
        // go to homepage
        const accessToken = res.data.accessToken;
        const refreshToken = res.data.refreshToken;
        const user = res.data.user;
        // authCtx.authenticate(accessToken, refreshToken, user);
      } else {
        console.log(res.data);
        console.log(res.data.errorCode);
        setIsAuthenticating(false);
        if (res.data.errorCode == "forbidden") {
          // call send otp api
          router.replace({
            pathname: "/Auth/OtpScreen",
            params: { email: formData.email },
          });
        } else {
          // Alert.alert("Error", res.data.errorMessage, [
          //   { text: "Cancel", onPress: () => console.log("Cancel Pressed"), style: "cancel" },
          //   { text: "OK", onPress: () => console.log("OK Pressed") },
          // ]);
        }
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
      type="login"
      onSubmit={loginHandler}
    />
  );
}

export default LoginScreen;
