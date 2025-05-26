import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

// context can be used by any file by importing the
// state needed using useAuth();

type AuthContextType = {
  userDocID: any;
  setUserDocID: Dispatch<SetStateAction<any>>;
  userRole: "tutor" | "tutee" | null;
  setUserRole: Dispatch<SetStateAction<"tutor" | "tutee" | null>>;
};

const authContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // the states that can be shared/used globally
  const [userDocID, setUserDocID] = useState<any>(null);
  const [userRole, setUserRole] = useState<"tutor" | "tutee" | null>(null);

  return (
    <authContext.Provider
      value={{ userDocID, setUserDocID, userRole, setUserRole }}
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
