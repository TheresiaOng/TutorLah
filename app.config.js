import 'dotenv/config';

export default {
  expo: {
    name: "TutorLah!",
    slug: "TutorLah",
    version: "2.0.0",
    runtimeVersion: {
      policy: "appVersion"
    },
    orientation: "portrait",
    icon: "./assets/images/TutorLahLogo.png",
    scheme: "tutorlah",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      supportsTablet: true,
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/TutorLahLogo.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
    },
    web: {
      bundler: "metro",
      output: "static",
      favicon: "./assets/images/TutorLahLogo.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/TutorLahLogo.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
    },
    extra: {
      firebaseApiKey: process.env.FIREBASE_API_KEY,
      firebaseAuthDomain: process.env.FIREBASE_AUTH_DOMAIN,
      firebaseDatabaseURL: process.env.FIREBASE_DATABASE_URL,
      firebaseProjectId: process.env.FIREBASE_PROJECT_ID,
      firebaseStorageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      firebaseMessagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      firebaseAppId: process.env.FIREBASE_APP_ID,
      firebaseMeasurementId: process.env.FIREBASE_MEASUREMENT_ID,
      "eas": {
        "projectId": "0f928a3d-92ed-4ca5-aef1-c6bf5bcb769f"
      },
      streamApiKey: process.env.STREAM_API_KEY,
      streamSecretKey: process.env.STREAM_SECRET_KEY
    },
    "updates": {
      "url": "https://u.expo.dev/0f928a3d-92ed-4ca5-aef1-c6bf5bcb769f"
    },
    "runtimeVersion": {
      "policy": "appVersion"
    }
  },
};
