import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { auth } from "../../firebase";
import errorhandling from "./errorhandling";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // Navigate to the home screen after successful login
  // This function is called only when the user successfully logs in
  const success = () => {
    router.push("/HomeScreen");
  };

  const loginEmailPassword = async () => {
    if (email != "" && password != "") {
      try {
        // Sign in with email and password
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(userCredential.user);
        // Call the success function to navigate to the home screen
        success();
      } catch (error: any) {
        const errorMessage = errorhandling(error);
        setErrorMsg(errorMessage ?? "");
      }
    } else {
      setErrorMsg("Please enter email and password.");
    }
  };

  return (
    <View className="flex-1 justify-center items-center">
      <View className="absolute top-14 left-0 z-10 m-4 border-primary border-2 bg-primary rounded-lg">
        <Button color="black" title="Back" onPress={() => router.back()} />
      </View>
      <Text className="text-4xl font-bold color-primary p-4">Login Screen</Text>
      {errorMsg != "" && (
        <Text className="text-sm m-4 text-red-500">{errorMsg}</Text>
      )}

      {/* Input fields for email and password */}
      <TextInput
        className="border-2 border-gray p-2 mb-4 w-96"
        placeholder="Email"
        placeholderTextColor={"#000"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View className="flex-row items-center max-w-96">
        <TextInput
          className="border-2 border-gray p-2 mb-4 flex-1"
          secureTextEntry={hidden}
          placeholder="Password"
          placeholderTextColor={"#000"}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <View className="min-w-12">
          <Button
            title={hidden ? "◡" : "👁️"}
            onPress={() => setHidden(!hidden)}
            color={"#000"}
          />
        </View>
      </View>
      <Button title="Login" onPress={loginEmailPassword} />
    </View>
  );
};

export default Login;
