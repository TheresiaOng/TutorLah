import 'dotenv/config';

export default {
  expo: {
    name: "TutorLah!",
    slug: "TutorLah",
    version: "2.0.0",
    runtimeVersion: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/TutorLahLogo.png",
    scheme: "tutorlah",
    userInterfaceStyle: "automatic",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.theresiaong.TutorLah",
      supportsTablet: true,
    },
    android: {
      "minSdkVersion": 24,
      extraMavenRepos: [
          "$rootDir/../../../node_modules/@notifee/react-native/android/libs",
      ],
      package: "com.theresiaong.TutorLah",
      adaptiveIcon: {
        foregroundImage: "./assets/images/TutorLahLogo.png",
        backgroundColor: "#ffffff",
      },
      edgeToEdgeEnabled: true,
      permissions: ["INTERNET"],
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
      "expo-build-properties",
      "@stream-io/video-react-native-sdk",
      [
        "@config-plugins/react-native-webrtc",
        {
          // add your explanations for camera and microphone
          "cameraPermission": "$(PRODUCT_NAME) requires camera access in order to capture and transmit video",
          "microphonePermission": "$(PRODUCT_NAME) requires microphone access in order to capture and transmit audio"
        }
      ]
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
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
      stripeSecretKey: process.env.STRIPE_SECRET_KEY,
      "eas": {
        "projectId": "0f928a3d-92ed-4ca5-aef1-c6bf5bcb769f"
      },
      streamApiKey: process.env.STREAM_API_KEY,
      supabaseApiKey: process.env.SUPABASE_API_KEY
    },
    "updates": {
      "url": "https://u.expo.dev/0f928a3d-92ed-4ca5-aef1-c6bf5bcb769f"
    },
  },
};
