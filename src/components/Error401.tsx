"use client";

import { useState } from "react";
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import LogoutDialog from "./LogoutDialog";
import { useSessionContext } from "@/context/SessionContext";
import { useRouter } from "next/navigation";

export const Error401 = () => {
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const { session } = useSessionContext();
  const router = useRouter();

  const closeDialog = () => {
    setIsLoginDialogOpen(false);
    setIsSignupDialogOpen(false);
    setIsLogoutDialogOpen(false);
  };

  return (
    <>
      <main className="bg-neutral-100 flex flex-col gap-6 min-h-screen">
        <h2 className="text-2xl text-center mx-auto mt-10 w-full">
          {session
            ? "Something went wrong."
            : "You have been logged out succesfully."}
        </h2>
        <h3 className="text-xl text-center mx-6 my-4 w-full">
          {session ? (
            <>
              We&apos;re sorry, but your login credentials seem to be invalid.
              <br />
              Please try logging out and logging back in.
            </>
          ) : (
            <>
              You can log back in, sign up for a new account, or reload the page
              to continue.
            </>
          )}
        </h3>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          {session ? (
            <button
              onClick={() => setIsLogoutDialogOpen(true)}
              className="bg-primary-blue w-1/3 hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
            >
              Log out
            </button>
          ) : (
            <>
              <button
                onClick={() => setIsLoginDialogOpen(true)}
                className="bg-primary-blue w-1/4 hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
              >
                Log in
              </button>
              <button
                onClick={() => router.refresh()}
                className="bg-primary-blue w-1/4 hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
              >
                Reload
              </button>
              <button
                onClick={() => setIsSignupDialogOpen(true)}
                className="bg-primary-blue w-1/4 hover:bg-blue-700 active:scale-90 text-white font-bold py-2 px-4 rounded"
              >
                Sign up
              </button>
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 items-center justify-center mx-6">
          <p className="text-center text-lg text-gray-700">
            This error occurs when you log out on one device and are still
            logged in on another.
          </p>
          <p className="text-center text-gray-600">
            Technical explanation: When you log out, you are effectively
            terminating your session on the backend server and the frontend
            website. However, if you are still logged in on another device, that
            device may incorrectly assume that your session is still valid on
            the backend server, when in reality, it has been invalidated.
          </p>
        </div>
      </main>
      <SignupDialog isOpen={isSignupDialogOpen} onClose={closeDialog} />
      <LoginDialog isOpen={isLoginDialogOpen} onClose={closeDialog} />
      <LogoutDialog isOpen={isLogoutDialogOpen} onClose={closeDialog} />
    </>
  );
};
