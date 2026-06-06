"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/types";

export const AuthScreen = () => {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const handleLogin = async (_values: LoginFormValues) => {
    // TODO: Firebase Auth 実装時に authClient.login に差し替える
    router.push("/");
  };

  const handleRegister = async (_values: RegisterFormValues) => {
    // TODO: Firebase Auth 実装時に authClient.register と profile作成APIに差し替える
    router.push("/");
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-200 text-gray-800">
      <div className="relative h-screen w-full overflow-y-auto bg-white sm:h-[844px] sm:max-h-[95vh] sm:w-[390px] sm:self-center sm:rounded-[3rem] sm:border-[8px] sm:border-white sm:shadow-2xl">
        {authMode === "login" ? (
          <LoginForm
            onSubmit={handleLogin}
            onClickRegister={() => setAuthMode("register")}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onClickLogin={() => setAuthMode("login")}
          />
        )}
      </div>
    </div>
  );
};
