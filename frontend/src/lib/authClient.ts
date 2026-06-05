export type AuthUser = {
  uid: string;
  email: string | null;
};

export const authClient = {
  getCurrentUser: async (): Promise<AuthUser | null> => {
    // TODO: Firebase Auth 実装時に差し替える
    return null;
  },

  getIdToken: async (): Promise<string | null> => {
    // TODO: Firebase Auth 実装時に差し替える
    return null;
  },

  login: async (_email: string, _password: string): Promise<AuthUser> => {
    // TODO: Firebase Auth 実装時に差し替える
    throw new Error("Firebase Auth is not implemented yet.");
  },

  register: async (_email: string, _password: string): Promise<AuthUser> => {
    // TODO: Firebase Auth 実装時に差し替える
    throw new Error("Firebase Auth is not implemented yet.");
  },

  logout: async (): Promise<void> => {
    // TODO: Firebase Auth 実装時に差し替える
  },
};
