import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { useToast } from "./ToastProvider";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import { set } from "zod";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import LoadingAnimation from "./LoadingAnimation";

// Remove the import statement for 'fs' module
export default function SignupDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeModal = () => props.onClose();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    const response = await fetch("/api/auth/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // Automatically log in the user after successful signup
      showToast("Signup successful. Automatically logging in...", "info");
      setIsLoggingIn(true);
      console.log("Signup successful. Automatically logging in...");
      const result = await signIn("credentials", {
        redirect: false,
        username: data.username,
        password: data.password,
      });
      if (result?.error) {
        console.error("Failed to sign in:", result.error);
        showToast("Failed to log in. Please reload and try again.", "error");
      } else {
        console.log("log in successful:", result);
        showToast("Log in successful", "info");
      }
    } else {
      const errorData = await response.json();
      console.error("Signup failed:", errorData);
      showToast("Signup failed. Please try again later.", "error");
    }
    setIsLoading(false);
    setIsLoggingIn(false);
    props.onClose();
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
                    Create an account
                  </DialogTitle>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <form className="mt-3" onSubmit={handleSubmit(onSubmit)}>
                      <div>
                        <label
                          htmlFor="username"
                          className="block text-sm font-medium text-gray-700"
                        >
                          username
                        </label>
                        <div className="mt-1">
                          <input
                            id="username"
                            {...register("username", {
                              required: true,
                              validate: (value: string) =>
                                value.trim() !== "" || "Username is required",
                            })}
                            type="text"
                            autoComplete="username"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.username && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.username.message as React.ReactNode}
                            </p>
                          )}
                        </div>
                      </div>
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
                            {...register("email", {
                              required: false,
                              pattern: {
                                value:
                                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address",
                              },
                            })}
                            type="email"
                            autoComplete="email"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-sm mt-1">
                              {errors.email.message as React.ReactNode}
                            </p>
                          )}
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
                            {...register("password", {
                              required: "Password is required",
                              minLength: {
                                value: 8,
                                message:
                                  "Password must be at least 8 characters long",
                              },
                              validate: {
                                hasNumber: (value) =>
                                  /\d/.test(value) ||
                                  "Password must contain at least one number",
                                doesNotContainUsername: (value, formValues) =>
                                  !value.includes(formValues.username) ||
                                  "Password cannot contain your username",
                              },
                            })}
                            type="password"
                            autoComplete="current-password"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.password && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.password.message as React.ReactNode}
                            </p>
                          )}
                        </div>
                        <div className="mt-3">
                          <button
                            type="submit"
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Sign up
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
          <div className="text-white text-2xl flex flex-col gap-1 items-center">
            <LoadingAnimation />
            <span>Please wait while we {isLoggingIn ? ("log you in") : ("sign you up")}</span>
          </div>
        </div>
      )}
    </>
  );
}
