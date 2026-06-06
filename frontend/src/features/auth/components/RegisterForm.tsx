"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { SkinTypeSelector } from "@/features/auth/components/SkinTypeSelector";
import type { RegisterFormValues } from "@/features/auth/types";

type RegisterFormProps = {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  onClickLogin: () => void;
};

export const RegisterForm = ({ onSubmit, onClickLogin }: RegisterFormProps) => {
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    birthDay: "",
    email: "",
    password: "",
    skinType: "normal",
  });

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (
    key: keyof RegisterFormValues,
    value: RegisterFormValues[keyof RegisterFormValues],
  ) => {
    setValues((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");

    if (!values.name || !values.birthDay || !values.email || !values.password) {
      setErrorMessage("すべての必須項目を入力してください。");
      return;
    }

    if (values.password.length < 8) {
      setErrorMessage("パスワードは8文字以上で入力してください。");
      return;
    }

    if (!isTermsAccepted) {
      setErrorMessage("利用規約とプライバシーポリシーに同意してください。");
      return;
    }

    try {
      setIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error(error);
      setErrorMessage("新規登録に失敗しました。");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-full px-8 py-10">
      <button
        type="button"
        onClick={onClickLogin}
        className="mb-6 text-sm text-gray-400 active:text-gray-600"
      >
        ← 戻る
      </button>

      <h1 className="mb-6 text-xl font-bold text-gray-800">アカウントを作成</h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        {errorMessage && <ErrorMessage message={errorMessage} />}

        <Input
          id="register-name"
          type="text"
          label="お名前"
          placeholder="加藤 美咲"
          value={values.name}
          onChange={(event) => handleChange("name", event.target.value)}
        />

        <Input
          id="register-birth-day"
          type="date"
          label="生年月日"
          value={values.birthDay}
          onChange={(event) => handleChange("birthDay", event.target.value)}
        />

        <Input
          id="register-email"
          type="email"
          label="メールアドレス"
          placeholder="mail@example.com"
          value={values.email}
          onChange={(event) => handleChange("email", event.target.value)}
        />

        <Input
          id="register-password"
          type="password"
          label="パスワード"
          placeholder="8文字以上"
          value={values.password}
          onChange={(event) => handleChange("password", event.target.value)}
        />

        <SkinTypeSelector
          value={values.skinType}
          onChange={(skinType) => handleChange("skinType", skinType)}
        />

        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={isTermsAccepted}
            onChange={(event) => setIsTermsAccepted(event.target.checked)}
            className="mt-0.5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
          />

          <span className="text-[10px] font-medium leading-relaxed text-gray-500">
            利用規約およびプライバシーポリシーに同意します
          </span>
        </label>

        <Button type="submit" fullWidth disabled={isSubmitting}>
          {isSubmitting ? "登録中..." : "登録してはじめる"}
        </Button>
      </form>
    </div>
  );
};
