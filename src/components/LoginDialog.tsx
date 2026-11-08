"use client";

import SignupDialog from "./SignupDialog";

export default function LoginDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  return <SignupDialog isOpen={isOpen} onClose={onClose} initialView="login" />;
}
