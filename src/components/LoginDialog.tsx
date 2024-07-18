import {
  Dialog,
  Transition,
  DialogPanel,
  DialogTitle,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";


// Login function
async function login(username: string, password: string) {
  // Make sure user is not logged in yet
  if (localStorage.getItem("loggedIn") === "true") {
    alert("You are already logged in!");
    window.location.href = "/";
    return;
  }
  try {
    console.log(username, password);
    // Check if they are both valid
    if (username.length < 1 || password.length < 1 || !username || !password) {
      alert("Please enter a valid username and password");
      return;
    }

    // API call to login url
    const response = await fetch(
      "/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: password,
        }),
      }
    );
    const data = await response.json();
    // If response is not ok, throw error
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(JSON.stringify(errorData));
    }
    // Get the access token from the response
    
    // Set the access token in local storage
    localStorage.setItem("accessToken", data.access);
    // Set logged in to true
    localStorage.setItem("loggedIn", "true");
    alert("Login successful!");
    // load home page
    window.location.href = "/";
  } catch (error: any) {
    console.error("Full error object:", error);
    console.error("Error type:", Object.prototype.toString.call(error));
    console.error("Error properties:", Object.getOwnPropertyNames(error));

    let errorMessage = "Login failed. Error: " + error;
    alert(errorMessage);
    return;
  }
}

export function LoginForm() {
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
            <p className="mt-2 text-sm text-gray-500" id="password-description">
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

export default function LoginDialog(props: {
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
                    Log in to your account
                  </DialogTitle>

                  <LoginForm />
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}


