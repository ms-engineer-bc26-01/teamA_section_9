import type { SkinType } from "@/types/models";

export type AuthMode = "login" | "register";

export type LoginFormValues = {
  email: string;
  password: string;
};

export type RegisterFormValues = {
  name: string;
  birthDay: string;
  email: string;
  password: string;
  skinType: SkinType;
};
