"use client";

import { FormEvent, useState } from "react";
import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import { ErrorMessage } from "@/components/common/ErrorMessage";
import { TermsModal } from "@/components/common/TermsModal";
import { SkinTypeSelector } from "@/features/auth/components/SkinTypeSelector";
import type { RegisterFormValues } from "@/features/auth/types";

type RegisterFormProps = {
  onSubmit: (values: RegisterFormValues) => Promise<void>;
  onClickLogin: () => void;
  isSubmitting?: boolean;
};

export const RegisterForm = ({
  onSubmit,
  onClickLogin,
  isSubmitting: externalIsSubmitting = false,
}: RegisterFormProps) => {
  const [values, setValues] = useState<RegisterFormValues>({
    name: "",
    birthDay: "",
    email: "",
    password: "",
    skinType: "normal",
  });

  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [internalIsSubmitting, setInternalIsSubmitting] = useState(false);

  const isSubmitting = externalIsSubmitting || internalIsSubmitting;

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
      setInternalIsSubmitting(true);
      await onSubmit(values);
    } catch (error) {
      console.error(error);
      setErrorMessage("新規登録に失敗しました。");
    } finally {
      setInternalIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="min-h-full px-8 py-10">
        <button
          type="button"
          onClick={onClickLogin}
          disabled={isSubmitting}
          className="mb-6 text-sm text-gray-400 active:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          ← 戻る
        </button>

        <h1 className="mb-6 text-xl font-bold text-gray-800">
          アカウントを作成
        </h1>

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

          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setIsTermsModalOpen(true)}
              disabled={isSubmitting}
              className="whitespace-nowrap text-[10px] font-bold text-rose-500 underline underline-offset-2 transition hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              利用規約・プライバシーポリシーを確認する
            </button>

            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={isTermsAccepted}
                onChange={(event) => setIsTermsAccepted(event.target.checked)}
                disabled={isSubmitting}
                className="mt-0.5 rounded border-gray-300 text-rose-500 focus:ring-rose-500 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <span className="text-[10px] font-medium leading-relaxed text-gray-500">
                内容を確認し、利用規約およびプライバシーポリシーに同意します
              </span>
            </label>
          </div>

          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? "登録中..." : "登録してはじめる"}
          </Button>
        </form>
      </div>

      <TermsModal
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </>
  );
};
