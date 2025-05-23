import { auth } from "@/firebase";
import { router } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import React, { useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import errorhandling from "./errorhandling";

const SignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const goLogin = () => {
    setEmail("");
    setPassword("");
    router.push("/loginScreens/login");
  };

  const createAccount = async () => {
    if (email && password) {
      try {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        console.log(userCredential.user);
        Alert.alert("Account created, please log in.");
        goLogin();
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
      <Text className="text-4xl font-bold color-primary p-4">
        Sign Up Screen
      </Text>
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
      <Button title="Sign Up" onPress={createAccount} />
    </View>
  );
};

export default SignUp;

const styles = StyleSheet.create({});
