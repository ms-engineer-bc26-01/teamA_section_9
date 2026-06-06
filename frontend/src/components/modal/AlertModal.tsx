"use client";

import { Button } from "@/components/common/Button";
import { BaseModal } from "@/components/modal/BaseModal";

type AlertModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  buttonLabel?: string;
  onClose: () => void;
};

export const AlertModal = ({
  isOpen,
  title,
  message,
  buttonLabel = "OK",
  onClose,
}: AlertModalProps) => {
  return (
    <BaseModal isOpen={isOpen} title={title} onClose={onClose}>
      <p className="mb-5 text-sm leading-relaxed text-gray-600">{message}</p>

      <Button fullWidth onClick={onClose}>
        {buttonLabel}
      </Button>
    </BaseModal>
  );
};
