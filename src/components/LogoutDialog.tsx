import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";

async function logout() {
  const accessToken = localStorage.getItem("accessToken");
  // Make sure user is not logged in yet
  if (!accessToken || accessToken === "undefined") {
    alert("You are not logged in!");
    window.location.href = "/";
    return;
  }
  try {
    // API call to log out
    const response = await fetch("/api/auth/token/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": accessToken,
      },
    });
    const data = await response.json();
    // If response is not ok, throw error
    if (!response.ok) {
      throw new Error(JSON.stringify(data));
    }
    alert("you logged out successfully!");
    // Clear the access token from local storage
    localStorage.removeItem("accessToken");
    localStorage.setItem("loggedIn", "false");
    // load home page
    window.location.href = "/";
  } catch (error: any) {
    console.error("Full error object:", error);
    console.error("Error type:", Object.prototype.toString.call(error));
    console.error("Error properties:", Object.getOwnPropertyNames(error));

    let errorMessage = "logout failed. Error: " + error;
    alert(errorMessage);
    return;
  }
}

export function LogoutForm() {
  return (
    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
      <form className="mt-3">
        <div>
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
        </div>
      </form>
    </div>
  );
}

export default function LogoutDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeModal = () => props.onClose();
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <TransitionChild
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <DialogPanel className="w-full max-w-4xl md:max-w-2xl lg:max-w-4xl 2xl:max-w-5xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Are you sure you want to log out?
                  </DialogTitle>

                  <LogoutForm />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
