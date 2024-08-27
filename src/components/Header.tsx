"use client";

import { Fragment, useState } from "react";
import { useSessionContext } from "@/context/SessionContext";
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
  TransitionChild,
  MenuHeading,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  UserIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  PencilSquareIcon
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import LogoutDialog from "./LogoutDialog";
import { IoSettingsOutline } from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";

const navigation = [
  { name: "Parshah", href: "/topics/parshah" },
  { name: "Neviim", href: "/topics/neviim" },
  { name: "Chassidus", href: "/topics/chassidus" },
  { name: "Life's ways", href: "/topics/life's-ways" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const { session } = useSessionContext();

  const closeDialog = () => {
    setIsLoginDialogOpen(false);
    setIsSignupDialogOpen(false);
    setIsLogoutDialogOpen(false);
    setSelectedVideo(null);
  };

  return (
    <header className="bg-white shadow-md grid grid-cols-1 grid-rows-2">
      <nav
        aria-label="Global"
        className="grid grid-rows-1 grid-cols-12 gap-8 w-full p-4 px-6 lg:px-10 row-span-6 place-items-center"
      >
        <div className="grid grid-rows-1 col-span-1 lg:flex-1 items-center">
          <Link
            href="/"
            className="-m-1.5 p-1.5 justify-items-center text-gray-800 grid grid-col-1"
          >
            <span className="sr-only">My Torah Today</span>
            <Image
              alt="The Rosh Yeshiva Reb Shimon Semp"
              src="/images/rosh-yeshiva.png"
              className="h-20 w-auto rounded-full"
              width={200}
              height={100}
            />
            MyTorahToday
          </Link>
        </div>
        <div className="flex items-center justify-center col-span-1 col-end-9 md:col-end-10 xl:col-end-11">
          <Menu as="div" className="relative inline-block text-left">
            <div className="flex items-center justify-center">
              <MenuButton
                title="Open profile menu"
                className="flex items-center justify-start rounded-full w-fit xl:mr-10"
              >
                <span className="sr-only">Open profile menu</span>
                {session && session.user.username ? (
                  <span className="capitalize w-8 flex items-center justify-center text-xl font-semibold bg-primary-blue text-white rounded-full aspect-square border border-gray-700">{session.user.username.slice(0, 1)}</span>
                ) : (
                  <span className="flex flex-nowrap items-center justify-center w-max md:text-lg lg:text-xl xl:font-semibold text-gray-800 hover:text-primary-blue transition-colors duration-300 cursor-pointer">
                    <UserCircleIcon aria-hidden="true" className="h-10 w-10 stroke-1" />
                    <span className="ml-2 text-sm">Log in / Sign up</span>
                  </span>
                )}
              </MenuButton>
            </div>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-75"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <MenuItems className="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <div className="p-4 flex flex-col gap-2 items-center justify-center text-2xl">
                  {/* User Avatar */}
                  <div className="flex items-center justify-center">
                    <UserCircleIcon
                      aria-hidden="true"
                      className="h-10 w-10 stroke-1"
                    />
                  </div>
                  {session ? (
                    <div className="w-full h-full">
                      <h2 className="text-lg capitalize font-medium text-gray-900 text-center">
                        {session.user.username}
                      </h2>
                      <MenuItem>
                        <Link
                          href="#"
                          className="active:bg-gray-100 active:text-primary-blue text-gray-800 group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50"
                        >
                          <MdManageAccounts className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-500" aria-hidden="true" />
                          <span>My account</span>
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          href="#"
                          className="active:bg-gray-100 active:text-primary-blue text-gray-800 group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50"
                        >
                          <IoSettingsOutline className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-500" aria-hidden="true" />
                          <span>Settings</span>
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() => setIsLogoutDialogOpen(true)}
                          className="active:bg-gray-100 active:text-red-600 text-gray-800  group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-red-50 border-t border-gray-200"
                        >
                          <ArrowLeftStartOnRectangleIcon
                            title="Logout"
                            titleId="Logout"
                            className="mr-3 h-6 w-6 text-red-500 group-hover:text-red-600 group-hover:font-semibold"
                            aria-hidden="true"
                          />
                          <span>Logout</span>
                        </button>
                      </MenuItem>
                    </div>
                  ) : (
                    <>
                      <MenuItem>
                        <button
                          onClick={() => setIsLoginDialogOpen(true)}
                          className="active:bg-gray-100 active:text-primary-blue text-gray-800 group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50"
                        >
                          <ArrowRightEndOnRectangleIcon
                            title="Login"
                            titleId="Login"
                            className="mr-3 h-6 w-6 text-blue-500"
                            aria-hidden="true"
                          />
                          Log in
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() => setIsSignupDialogOpen(true)}
                          className="active:bg-gray-100 active:text-primary-blue text-gray-800 group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50"
                        >
                          <PencilSquareIcon
                            title="Signup"
                            titleId="Signup"
                            className="mr-3 h-6 w-6 text-green-500"
                            aria-hidden="true"
                          />
                          Sign up
                        </button>
                      </MenuItem>
                    </>
                  )}{" "}
                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
        <div className="flex items-center justify-center col-span-1 col-end-12">
          <button
            aria-label="Open main menu"
            title="Open main menu"
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-start rounded-md p-2.5 text-gray-600"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-9 w-8" />
          </button>
        </div>
      </nav>
      {/* Banner that says - Site in construction - with black and yellow striped construction bg */}
      <div className="flex bg-constructionStripes text-white font-bold justify-center row-span-1">
        <p className="bg-black/45 w-fit px-2 my-1 text-lg rounded">
          Site under construction
        </p>
      </div>
      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog onClose={setMobileMenuOpen}>
          <div className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50" />
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-150"
            leaveFrom="translate-x-0"
            leaveTo="translate-x-full"
          >
            <DialogPanel className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10 duration-200">
              <div className="flex items-center justify-between">
                <Link href="#" className="-m-1.5 p-1.5">
                  <span className="sr-only">Your Company</span>
                  <Image
                    alt="Torah Today icon"
                    src="/images/icon.jpg"
                    className="h-10 w-auto rounded-xl"
                    width={180}
                    height={48}
                  />
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="-m-2.5 rounded-md p-2.5 text-gray-800 font-bold flex items-center justify-center"
                >
                  <span className="sr-only">Close menu</span>
                  <XMarkIcon aria-hidden="true" className="h-6 w-6" />
                </button>
              </div>
              <div className="mt-6 flow-root">
                <div className="-my-6 divide-y divide-gray-500/25">
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-100"
                      >
                        {item.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
      <SignupDialog isOpen={isSignupDialogOpen} onClose={closeDialog} />
      <LoginDialog isOpen={isLoginDialogOpen} onClose={closeDialog} />
      <LogoutDialog isOpen={isLogoutDialogOpen} onClose={closeDialog} />
    </header>
  );
}
