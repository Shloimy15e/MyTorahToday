import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import React, { Fragment, useState } from "react";
import { useToast } from "../context/ToastProvider";
import { useForm } from "react-hook-form";
import { signIn } from "next-auth/react";
import LoadingAnimation from "./LoadingAnimation";
import { BiHide, BiShow } from "react-icons/bi";

// Remove the import statement for 'fs' module
export default function SignupDialog(props: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const closeModal = () => props.onClose();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
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
      showToast("Signup successful.", "info");
      showToast("Automatically logging in...", "info");
      setIsLoggingIn(true);
      const result = await signIn("credentials", {
        redirect: false,
        username: data.username,
        password: data.password,
      });
      if (result?.error) {
        showToast("Failed to log in. Please reload and try again.", "error");
      } else {
        showToast("Log in successful", "success");
      }
    } else {
      try {
        const data = await response.json();
        if (data.error) {
          if (data.error.includes("already exists") || (data.error.username && data.error.username[0].includes("already exists"))) {
            showToast("Username or email already exists", "error");
          } else {
            showToast("Failed to sign up. Please try again", "error");
          }
        }
      } catch (error) {
        showToast("Failed to sign up. Please try again", "error");
      }
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
                      <div className="mt-1">
                        <div className=" relative">
                          <input
                            id="username"
                            type="text"
                            required
                            placeholder="Username"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            {...register("username", {
                              required: true,
                              validate: (value: string) =>
                                value.trim() !== "" || "Username is required",
                            })}
                          />

                          {errors.username && (
                            <p className="mt-2 text-left text-sm text-red-600">
                              {errors.username.message as React.ReactNode}
                            </p>
                          )}
                          <label
                            htmlFor="username"
                            className="absolute tracking-wide text-sm font-semibold text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                          >
                            Username
                          </label>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="relative">
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
                            placeholder="Email"
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.email && (
                            <p className="text-red-500 text-left text-sm mt-1">
                              {errors.email.message as React.ReactNode}
                            </p>
                          )}
                          <label
                            htmlFor="email"
                            className="absolute tracking-wide text-sm font-semibold text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                          >
                            Email
                          </label>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="relative">
                          <input
                            placeholder="Password"
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
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.password && (
                            <p className="mt-2 text-sm text-red-600">
                              {errors.password.message as React.ReactNode}
                            </p>
                          )}
                          <label
                            htmlFor="password"
                            className="absolute tracking-wide text-sm font-semibold text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                          >
                            Password
                          </label>
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-gray-600"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <BiHide className="h-5 w-5" />
                            ) : (
                              <BiShow className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="relative">
                          <input
                            placeholder="Confirm Password"
                            id="confirmPassword"
                            {...register("confirmPassword", {
                              required: "Confirm Password is required",
                              validate: (value, formValues) =>
                                value === formValues.password ||
                                "Passwords do not match",
                            })}
                            autoComplete="new-password"
                            type={showPassword ? "text" : "password"}
                            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          {errors.confirmPassword && (
                            <p className="mt-2 text-left text-sm text-red-600">
                              {errors.confirmPassword.message as React.ReactNode}
                            </p>
                          )}
                          <label
                            htmlFor="confirmPassword"
                            className="absolute tracking-wide text-sm font-semibold text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                          >
                            Confirm Password
                          </label>
                          <button
                            type="button"
                            className="absolute top-2 right-2 text-gray-600"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <BiHide className="h-5 w-5" />
                            ) : (
                              <BiShow className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button
                          type="submit"
                          title="Sign up"
                          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue active:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Sign up
                        </button>
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
            <span>
              Please wait while we {isLoggingIn ? "log you in" : "sign you up"}
            </span>
          </div>
        </div>
      )}
    </>
  );
}
