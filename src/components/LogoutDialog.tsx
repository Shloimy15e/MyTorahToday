"use client";
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
import { useToast } from "./ToastProvider";

export default function LogoutDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const closeModal = () => props.onClose();

  async function logout() {
    setIsLoading(true);
    const accessToken = localStorage.getItem("accessToken");
    // Make sure user is not logged in yet
    if (!accessToken || accessToken === "undefined") {
      showToast("You are not logged in", "error");
      closeModal();
      return;
    }
    try {
      // API call to log out
      const response = await fetch("/api/auth/token/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: accessToken,
        },
      });
      const data = await response.json();
      // If response is not ok, throw error
      if (!response.ok) {
        throw new Error(JSON.stringify(data));
      }

      setTimeout(() => {
        setIsLoading(false);
        showToast("Logged out successfully");
        localStorage.removeItem("accessToken");
        localStorage.setItem("loggedIn", "false");
        closeModal();
        window.location.href = "/";
      }, 2000);
    } catch (error: any) {
      console.error("Full error object:", error);
      console.error("Error type:", Object.prototype.toString.call(error));
      console.error("Error properties:", Object.getOwnPropertyNames(error));

      let errorMessage = "logout failed. Error: " + error;
      showToast(errorMessage);
      return;
    }
  }

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
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            onClick={(e) => {
                              e.preventDefault();
                              // Logout
                              logout();
                            }}
                          >
                            Log out
                          </button>
                        </div>
                        <div className="mt-3">
                          <button
                            type="button"
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
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
                      <div className="text-white text-2xl flex flex-col gap-1 items-center">
                        <ArrowPathIcon className="animate-spin h-10 w-10" />
                        <span>Logging you out...</span>
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