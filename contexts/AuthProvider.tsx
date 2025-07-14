import { auth, db } from "@/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
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

// AuthProvider component to provide user document context
export const AuthProvider = ({ children }: { children: ReactNode }) => {
 // the states that can be shared/used globally
  const [userDoc, setUserDoc] = useState<any>(null);

  // Function to fetch user document by userId
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
        setUserDoc(snapshot.data()); // set the userDoc state with the fetched data
      } else {
        console.log("AuthContext: No such user document found.");
      }
    } catch (error) {
      console.error("AuthContext: Failed to fetch user document: ", error);
    }
  };

  // Listen for auth state changes and user document updates
  useEffect(() => {
    let unsubscribeFromUserDoc: (() => void) | null = null;

    const unsubscribeFromAuth = onAuthStateChanged(auth, (user: User | null) => { 
      if (user) {
        const docRef = doc(db, "users", user.uid);

        // Fetch user document on auth state change
        unsubscribeFromUserDoc = onSnapshot(docRef, (snapshot) => {
          if (snapshot.exists()) {
            setUserDoc(snapshot.data()); // Update userDoc state with the fetched data
          } else {
            console.log("AuthContext: No such user document found.");
            setUserDoc(null);
          }
        });
      } else {
        setUserDoc(null);
        if (unsubscribeFromUserDoc) { // Cleanup previous listener if user logs out
          unsubscribeFromUserDoc();
          unsubscribeFromUserDoc = null;
        }
      }
    });
    return () => { // Cleanup listeners on unmount
      unsubscribeFromAuth();
      if (unsubscribeFromUserDoc) unsubscribeFromUserDoc();
    };
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
