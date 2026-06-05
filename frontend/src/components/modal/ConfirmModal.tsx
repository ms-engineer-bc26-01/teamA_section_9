"use client";

import { Button } from "@/components/common/Button";
import { BaseModal } from "@/components/modal/BaseModal";

type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
};

export const ConfirmModal = ({
  isOpen,
  title,
  message,
  confirmLabel = "実行する",
  cancelLabel = "キャンセル",
  onConfirm,
  onCancel,
}: ConfirmModalProps) => {
  return (
    <BaseModal isOpen={isOpen} title={title} onClose={onCancel}>
      <p className="mb-5 text-sm leading-relaxed text-gray-600">{message}</p>

      <div className="grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={onCancel}>
          {cancelLabel}
        </Button>

        <Button variant="danger" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </div>
    </BaseModal>
  );
};
