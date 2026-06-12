"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import type { LoginFormValues } from "@/features/auth/types";

type LoginFormProps = {
  onSubmit: (values: LoginFormValues) => Promise<void>;
  onClickRegister: () => void;
  isSubmitting?: boolean;
};

export const LoginForm = ({
  onSubmit,
  onClickRegister,
  isSubmitting: externalIsSubmitting = false,
}: LoginFormProps) => {
  const [values, setValues] = useState<LoginFormValues>({
    email: "",
    password: "",
  });

  const [errorMessage, setErrorMessage] = useState("");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

  const handleChange = (key: keyof LoginFormValues, value: string) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!values.email || !values.password) {
      setErrorMessage("メールアドレスとパスワードを入力してください。");
      return;
    }

    try {
      setInternalIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error(error);
      setErrorMessage("ログインに失敗しました。");
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-full flex-col justify-center px-8 py-10">
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-rose-100 bg-rose-50 text-3xl shadow-sm">
          ✨
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-gray-800">
          SkinMate
        </h1>

        <p className="mt-2 text-xs font-medium text-gray-500">
          ログインしてスキンケア管理を始めましょう
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && <ErrorMessage message={errorMessage} />}

        <Input
          id="login-email"
          type="email"
          label="メールアドレス"
          placeholder="mail@example.com"
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />

        <Input
          id="login-password"
          type="password"
          label="パスワード"
          placeholder="••••••••"
          value={values.password}
          onChange={(event) => handleChange("password", event.target.value)}
        />

        <div className="space-y-3 pt-4">
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "ログイン中..." : "ログイン"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            fullWidth
            onClick={onClickRegister}
            disabled={isSubmitting}
          >
            新規登録
          </Button>
        </div>
      </form>

      <button
        type="button"
        className="mt-6 w-full text-center text-[10px] font-bold text-gray-400 underline"
      >
        パスワードを忘れた方
      </button>
    </div>
  );
};
