function errorhandling(error) {
  if (error.code === "auth/user-not-found") {
    return "User not found. Please check your email and try again.";
  } else if (error.code === "auth/wrong-password") {
    return "Incorrect password. Please try again.";
  } else if (error.code === "auth/invalid-email") {
    return "Invalid email format. Please enter a valid email address.";
  } else if (error.code === "auth/email-already-in-use") {
    return "Email already in use. Please use a different email address.";
  }
}

export default errorhandling;