import { router } from "expo-router";
import { signInWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Button, StyleSheet, Text, TextInput, View } from "react-native";
import { auth } from "../../firebase";
import errorhandling from "./errorhandling";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const success = () => {
    setEmail("");
    setPassword("");
    router.push("/HomeScreen");
  };

  const loginEmailPassword = async () => {
    if (email != "" && password != "") {
      try {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(userCredential.user);
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
      <Text className="text-4xl font-bold color-primary p-4">Login Screen</Text>
      {errorMsg != "" && (
        <Text className="text-sm m-4 text-red-500">{errorMsg}</Text>
      )}
      <TextInput
        className="border-2 border-gray-300 p-2 mb-4 min-w-96"
        placeholder="Email"
        placeholderTextColor={"#000"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <View className="flex flex-row items-center max-w-96">
        <TextInput
          className="border-2 border-gray-300 p-2 mb-4 flex-1"
          secureTextEntry={hidden}
          placeholder="Password"
          placeholderTextColor={"#000"}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
        <Button
          title={hidden ? "◡" : "👁️"}
          onPress={() => setHidden(!hidden)}
          color={"#000"}
        />
      </View>
      <Button title="Login" onPress={loginEmailPassword} />
    </View>
  );
};

export default Login;

const styles = StyleSheet.create({});
