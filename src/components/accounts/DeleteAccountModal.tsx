import React from "react";
import { spiderHairyCrawling, treeMonsterscream } from "@/assets";
import { ConfirmationModal } from "@/components/ui/ConfirmationModal";

interface DeleteAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeleteAccount: () => void;
  accountTitle: string;
}

export const DeleteAccountModal: React.FC<DeleteAccountModalProps> = ({
  isOpen,
  onClose,
  onDeleteAccount,
  accountTitle,
}) => {
  return (
    <ConfirmationModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onDeleteAccount}
      title="Delete Account"
      description="Are you sure you want to delete this account? This action will permanently delete all account data including credentials, usage logs, tags, and descriptions."
      itemTitle={accountTitle}
      itemDescription="Account and all associated data"
      confirmText="Delete Account"
      type="danger"
      decorationTopLeft={treeMonsterscream}
      decorationBottomRight={spiderHairyCrawling}
    />
  );
};
