import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import React, {
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
  setUserDoc: React.Dispatch<React.SetStateAction<any>>;
  fetchUserDoc: (uid?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

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
        if (snapshot.exists()) {
          setUserDoc({ userId: uid, ...(snapshot.data() as any) });
        }
      } else {
        console.log("AuthContext: No such user document found.");
      }
    } catch (error) {
      console.error("AuthContext: Failed to fetch user document: ", error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        setUserDoc({ userId: user.uid, ...(docSnap.data() as any) });
      } else {
        setUserDoc(null); // clear it!
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        userDoc,
        setUserDoc,
        fetchUserDoc,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
