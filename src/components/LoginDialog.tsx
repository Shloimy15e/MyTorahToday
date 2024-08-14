"use client";
import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import { useToast } from "./ToastProvider";
import { parse } from "path";

export default function LoginDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const closeModal = () => props.onClose();

  // Login function
  async function login(username: string, password: string) {
    // Make sure user is not logged in yet
    if (
      localStorage.getItem("accessToken") &&
      localStorage.getItem("accessToken") !== "undefined"
    ) {
      showToast("You are already logged in!");
      closeModal();
      return;
    }
    setIsLoading(true);
    try {
      // Check if they are both valid
      if (
        username.length < 1 ||
        password.length < 1 ||
        !username ||
        !password
      ) {
        alert("Please enter a valid username and password");
        return;
      }

      // API call to login url
      const response = await fetch("/api/auth/token/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      });
      const data = await response.json();
      // If response is not ok, throw error
      if (!response.ok) {
        console.error(JSON.stringify(data));
        throw new Error(JSON.stringify({ data, status: response.status }));
      }

      setTimeout(() => {
        setIsLoading(false);

        // Set the access token in local storage
        localStorage.setItem("accessToken", data.auth_token);
        // Set logged in to true
        localStorage.setItem("loggedIn", "true");
        showToast("Login successful", "info");
        // close modal
        closeModal();
        // Redirect to home page
        window.location.href = "/";
      }, 1000);
    } catch (error: any) {
      // Extract the error message and response status
      const errorMessage = "Login failed";
      showToast(errorMessage, "error");
      setIsLoading(false);
      return;
    }
  }

  function LoginForm() {
    return (
      <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
        <form className="mt-3">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-3">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
              aria-describedby="password-description"
            >
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              <p
                className="mt-2 text-sm text-gray-500"
                id="password-description"
              >
                Remember me for 30 days.
                <a
                  href="#"
                  className="font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Forgot password?
                </a>
              </p>
            </div>
            <div className="mt-3">
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                onClick={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget.closest("form");
                  const username = form?.querySelector(
                    "#email"
                  ) as HTMLInputElement;
                  const password = form?.querySelector(
                    "#password"
                  ) as HTMLInputElement;
                  login(username.value, password.value);
                }}
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    );
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
                    Log in to your account
                  </DialogTitle>

                  <LoginForm />
                  {isLoading && (
                    <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
                      <div className="text-white text-2xl flex flex-col gap-1 items-center">
                        <ArrowPathIcon className="animate-spin h-10 w-10" />
                        <span>Logging you in...</span>
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
