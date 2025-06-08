import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";

// context can be used by any file by importing the
// state needed using useAuth();

type AuthContextType = {
  userDocID: any;
  setUserDocID: Dispatch<SetStateAction<any>>;
  userRole: "tutor" | "tutee" | null;
  setUserRole: Dispatch<SetStateAction<"tutor" | "tutee" | null>>;
  userDoc: any;
  fetchUserDoc: () => Promise<void>;
};

const authContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // the states that can be shared/used globally
  const [userDocID, setUserDocID] = useState<any>(null);
  const [userRole, setUserRole] = useState<"tutor" | "tutee" | null>(null);
  const [userDoc, setUserDoc] = useState<any>(null);

  const fetchUserDoc = async () => {
    if (!userDocID || !userRole) return;

    // retrieve collection path based on user's role
    const path =
      userRole === "tutor" ? "users/roles/tutors" : "users/roles/tutees";

    try {
      const docRef = doc(db, path, userDocID);
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
    fetchUserDoc();
  }, [userDocID, userRole]);

  return (
    <authContext.Provider
      value={{
        userDocID,
        setUserDocID,
        userRole,
        setUserRole,
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
