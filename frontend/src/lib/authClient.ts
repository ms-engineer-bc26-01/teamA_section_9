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

const getFirebaseErrorCode = (error: unknown) => {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = (error as { code?: unknown }).code;

    if (typeof code === "string") {
      return code;
    }
  }

  if (error instanceof Error) {
    return error.message.match(/auth\/[a-z0-9-]+/i)?.[0];
  }

  return undefined;
};

const getLoginErrorMessage = (error: unknown) => {
  const code = getFirebaseErrorCode(error);

  switch (code) {
    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。";

    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "メールアドレスまたはパスワードが正しくありません。";

    case "auth/network-request-failed":
      return "通信に失敗しました。通信環境を確認して再度お試しください。";

    default:
      return "ログインに失敗しました。入力内容を確認して再度お試しください。";
  }
};

const getRegisterErrorMessage = (error: unknown) => {
  const code = getFirebaseErrorCode(error);

  switch (code) {
    case "auth/email-already-in-use":
      return "このメールアドレスはすでに登録されています。ログイン画面からログインしてください。";

    case "auth/invalid-email":
      return "メールアドレスの形式が正しくありません。入力内容を確認してください。";

    case "auth/weak-password":
      return "パスワードは8文字以上で入力してください。";

    case "auth/network-request-failed":
      return "通信に失敗しました。通信環境を確認して再度お試しください。";

    default:
      return "新規登録に失敗しました。入力内容を確認して再度お試しください。";
  }
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
    try {
      const credential = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );

      return toAuthUser(credential.user);
    } catch (error) {
      throw new Error(getLoginErrorMessage(error));
    }
  },

  register: async (email: string, password: string): Promise<AuthUser> => {
    try {
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      return toAuthUser(credential.user);
    } catch (error) {
      throw new Error(getRegisterErrorMessage(error));
    }
  },

  logout: async (): Promise<void> => {
    await signOut(auth);
  },
};
