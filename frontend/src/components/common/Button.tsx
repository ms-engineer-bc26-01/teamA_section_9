import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

type ButtonSize = "sm" | "md" | "lg";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const variantClass: Record<ButtonVariant, string> = {
  primary: "bg-rose-500 text-white hover:bg-rose-600 active:bg-rose-700",
  secondary:
    "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 active:bg-gray-100",
  danger: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700",
  ghost: "bg-transparent text-gray-600 hover:bg-gray-100 active:bg-gray-200",
};

const sizeClass: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-xs rounded-lg",
  md: "px-4 py-3 text-sm rounded-xl",
  lg: "px-5 py-4 text-base rounded-xl",
};

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type = "button",
  ...props
}: ButtonProps) => {
  return (
    <button
      type={type}
      className={cn(
        "font-bold transition disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        sizeClass[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
};
