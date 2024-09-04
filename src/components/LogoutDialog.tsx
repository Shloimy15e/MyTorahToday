import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import { useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useToast } from "../context/ToastProvider";
import { signOut } from "next-auth/react";
import { useSessionContext } from "@/context/SessionContext";
import LoadingAnimation from "./LoadingAnimation";

export default function LogoutDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const closeModal = () => props.onClose();
  const { session } = useSessionContext();

  const handleOnSubmit = async () => {
    if (!session) {
      showToast("You are not logged in", "error");
      closeModal();
      return;
    }
    console.log("handleOnSubmit called");
    setIsLoading(true);
    const response = await fetch("/api/auth/token/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Token ${""}`,
      },
    });
    const data = await response.json();
    await signOut({ redirect: false })
      .then(() => {
        document.cookie =
          "auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        showToast("Logged out successfully", "success");
        setIsLoading(false);
        props.onClose();
      })
      .catch((error) => {
        console.error("Failed to log out:", error);
        showToast("Failed to log out", "error");
        setIsLoading(false);
      });
  };
  return (
    <>
      <Transition show={props.isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/45" />
          </TransitionChild>

          <div className="fixed inset-0 flex items-center justify-center">
            <div className="w-2/3 p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900 text-pretty"
                  >
                    Are you sure you want to log out?
                  </DialogTitle>

                  <div className="mt-3 text-center sm:mt-0 sm:text-left">
                    <form className="mt-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="mt-3">
                          <button
                            type="submit"
                            title="Log out"
                            className="w-full flex-nowrap flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                              e.preventDefault();
                              handleOnSubmit();
                            }}
                          >
                            Log out
                          </button>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
                            title="Cancel"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                              e.preventDefault();
                              // Cancel and close
                              closeModal();
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                  {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
                      <div className="text-white text-2xl flex flex-col gap-1 items-center">
                        <LoadingAnimation />
                        <span>Please wait while we log you out</span>
                      </div>
                    </div>
                  )}
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
