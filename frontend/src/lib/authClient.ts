import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

export type AuthUser = {
  uid: string;
  email: string | null;
};

const toAuthUser = (user: User): AuthUser => {
  return {
    uid: user.uid,
    email: user.email,
  };
};

const waitForCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const authClient = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    const user = auth.currentUser ?? (await waitForCurrentUser());

    if (!user) {
      return null;
    }

    return toAuthUser(user);
  },

  getIdToken: async (): Promise<string | null> => {
    const user = auth.currentUser ?? (await waitForCurrentUser());

    if (!user) {
      return null;
    }

    return user.getIdToken();
  },

  login: async (email: string, password: string): Promise<AuthUser> => {
    const credential = await signInWithEmailAndPassword(auth, email, password);

    return toAuthUser(credential.user);
  },

  register: async (email: string, password: string): Promise<AuthUser> => {
    const credential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );

    return toAuthUser(credential.user);
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
