import React, { useEffect, useState } from "react";
import { fb } from "../utils/constants/firebase";

export const AuthContext = React.createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [pending, setPending] = useState(true);
  useEffect(() => {
    fb.auth().onAuthStateChanged((user) => {
      setCurrentUser(user);
      setPending(false);
    });
  }, []);
  if (pending)
    return (
      <div className="loader">
        <div className="spinner-border text-primary" role="status">
          <span className="sr-only">Загрузка...</span>
        </div>
      </div>
    );
  return (
    <AuthContext.Provider value={{ currentUser }}>
      {children}
    </AuthContext.Provider>
  );
};
