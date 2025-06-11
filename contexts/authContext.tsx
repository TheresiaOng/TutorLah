import { auth, db } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

// context can be used by any file by importing the
// state needed using useAuth();

type AuthContextType = {
  userDoc: any;
  fetchUserDoc: (uid?: string) => Promise<void>;
};

const authContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // the states that can be shared/used globally
  const [userDoc, setUserDoc] = useState<any>(null);

  const fetchUserDoc = async (uid?: string) => {
    if (!uid) {
      console.log("fetchUserDoc skipped: userId is null");
      return;
    }

    console.log("fetchUserDoc: fetching for userId =", uid);

    try {
      const docRef = doc(db, "users", uid);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        setUserDoc(snapshot.data());
      } else {
        console.log("authContext: No such user document found.");
      }
    } catch (error) {
      console.error("authContext: Failed to fetch user document: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user: User | null) => {
      if (user) {
        await fetchUserDoc(user.uid);
      } else {
        setUserDoc(null);
      }
    });

    return unsubscribe;
  }, []);

  return (
    <authContext.Provider
      value={{
        userDoc,
        fetchUserDoc,
      }}
    >
      {children}
    </authContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
