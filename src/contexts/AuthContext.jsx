import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase.config";
import { createContext, useContext } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { getFirestore, doc, setDoc } from "firebase/firestore";

export const authContext = createContext();

const db = getFirestore();

export const useAuth = () => {
  const context = useContext(authContext);
  if (!context) {
    console.log("Error creando contexto de usuario");
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState("");
  useEffect(() => {
    const suscribed = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        console.log("El usuario no está logueado");
        setUser("");
      } else {
        setUser(currentUser);
      }
    });
    return () => suscribed();
  }, []);

  const completarRegistro = async (docuRef, data) => {
    try {
      await setDoc(docuRef, data, { merge: true });
      console.log("Registro completado con éxito");
    } catch (error) {
      console.error("Error al completar el registro:", error);
    }
  };

  const register = async (email, password) => {
    const response = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    console.log(response);
    const docuRef = doc(db, `users/${response.user.uid}`);

    completarRegistro(docuRef, { correo: email, rol: "customer" });
  };

  const login = async (email, password) => {
    const response = await signInWithEmailAndPassword(auth, email, password);
    console.log(response);
  };
  const loginWithGoogle = async () => {
    const responseGoogle = new GoogleAuthProvider();
    return await signInWithPopup(auth, responseGoogle);
  };
  const logout = async () => {
    const response = await signOut(auth);
    console.log(response);
  };

  return (
    <authContext.Provider
      value={{ register, login, loginWithGoogle, logout, user }}
    >
      {children}
    </authContext.Provider>
  );
}