"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { getMyProfile, updateMyProfile } from "@/api/profiles";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import type {
  AuthMode,
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/types";

export const AuthScreen = () => {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const { signIn, signUp, loading } = useAuth();

  const handleLogin = async (values: LoginFormValues) => {
    await signIn(values.email, values.password);
    await getMyProfile();

    router.push("/");
  };

  const handleRegister = async (values: RegisterFormValues) => {
    await signUp(values.email, values.password);

    await getMyProfile();

    await updateMyProfile({
      name: values.name,
      birthDay: values.birthDay,
      skinType: values.skinType,
    });

    router.push("/");
  };

  return (
    <div className="flex min-h-screen justify-center bg-gray-200 text-gray-800">
      <div className="relative h-screen w-full overflow-y-auto bg-white sm:h-[844px] sm:max-h-[95vh] sm:w-[390px] sm:self-center sm:rounded-[3rem] sm:border-[8px] sm:border-white sm:shadow-2xl">
        {authMode === "login" ? (
          <LoginForm
            onSubmit={handleLogin}
            onClickRegister={() => setAuthMode("register")}
            isSubmitting={loading}
          />
        ) : (
          <RegisterForm
            onSubmit={handleRegister}
            onClickLogin={() => setAuthMode("login")}
            isSubmitting={loading}
          />
        )}
      </div>
    </div>
  );
};
