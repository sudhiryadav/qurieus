"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useState } from "react";
import SignIn from "./SignIn/index";
import SignUp from "./SignUp/index";
interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode?: "signin" | "signup";
  onSuccess?: () => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  mode = "signup",
  onSuccess,
}: AuthModalProps) {
  const [modalMode, setModalMode] = useState<"signin" | "signup">(mode);
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-dark-2">
                {modalMode === "signin" ? (
                  <SignIn
                    onSuccess={onSuccess}
                    handleOpenAuthModal={() => {
                      setModalMode("signup");
                    }}
                  />
                ) : (
                  <SignUp
                    onSuccess={onSuccess}
                    handleOpenAuthModal={() => {
                      setModalMode("signin");
                    }}
                  />
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
