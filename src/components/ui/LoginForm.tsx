import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { useToast } from "@/context/ToastProvider";
import { useRouter } from "next/navigation";
import LoadingAnimation from "../LoadingAnimation";
import { useState } from "react";


export function LoginForm({ onClose }: { onClose: () => void }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    console.log("Submitting form data for user:", data.username);
    const result = await signIn("credentials", {
      username: data.username,
      password: data.password,
      redirect: false,
    });

    console.log("Sign in result:", result);
    if (result?.error) {
      console.error("Failed to sign in:", result.error);
      showToast("Invalid username or password", "error");
      setIsLoading(false);
    } else {
      onClose();
      showToast(`Logged in successfully as`, "success");
      setIsLoading(false);
      router.refresh();
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="mt-3">
        <div className="relative">
          <input
            id="username"
            type="text"
            autoComplete="username"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Username or Email"
            {...register("username", {
              required: true,
              validate: (value: string) =>
                value.trim() !== "" || "Username or email is required",
            })}
          />
          <label
            htmlFor="username"
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
          >
            Username or Email
          </label>
          {errors.username && (
            <p className="text-red-500 text-xs italic mt-1">
              {errors.username.message as string}
            </p>
          )}
        </div>
      </div>
      <div className="mt-3">
        <div className="relative">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            {...register("password", {
              required: true,
              validate: (value: string) =>
                value.trim() !== "" || "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-xs italic">
              {errors.password.message as string}
            </p>
          )}
          <label
            htmlFor="password"
            className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-indigo-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
          >
            Password
          </label>
        </div>
      </div>
      <div className="mt-3">
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-blue hover:bg-blue-950 disabled:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600"
          disabled={isLoading}
        >
          Log in to your account
        </button>
      </div>
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-65 flex items-center justify-center z-50">
          <div className="text-white text-2xl flex flex-col gap-1 items-center">
            <LoadingAnimation />
            <span>Logging you in...</span>
          </div>
        </div>
      )}
    </form>
  );
}
