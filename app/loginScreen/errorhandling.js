// This function handles errors from Firebase authentication
// (login and signup) and returns user-friendly messages.

function errorhandling(error) {
  console.log("errorHandling: checking for error");
  if (error.code === "auth/email-already-in-use") {
    return "Email already in use. Please use a different email address.";
  } else if (error.code === "auth/weak-password") {
    return "Weak password. Minimum password length is 6.";
  } else if (error.code === "auth/user-not-found") {
    return "User not found. Please check your email and try again.";
  } else if (error.code === "auth/wrong-password") {
    return "Incorrect password. Please try again.";
  } else if (error.code === "auth/invalid-email") {
    return "Invalid email format. Please enter a valid email address.";
  } else if (error.code === "auth/invalid-credential") {
    return "Incorrect email or password. Please try again.";
  } else {
    return "An unexpected error occurred. Please try again.";
  }
}

export default errorhandling;