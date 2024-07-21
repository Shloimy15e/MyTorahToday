"use client";

import { Fragment, useState, useEffect } from "react";
import {
  Dialog,
  DialogPanel,
  Menu,
  MenuButton,
  MenuItems,
  MenuItem,
  Transition,
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import LogoutDialog from "./LogoutDialog";

const navigation = [
  { name: "Parshah", href: "/topics/parshah" },
  { name: "Neviim", href: "/topics/neviim" },
  { name: "Chassidus", href: "/topics/chassidus" },
  { name: "Lifes ways", href: "/topics/lifes-ways" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const [, setSelectedVideo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const closeDialog = () => {
    setIsLoginDialogOpen(false);
    setIsSignupDialogOpen(false);
    setIsLogoutDialogOpen(false);
    setSelectedVideo(null);
  };

  useEffect(() => {
    const accessToken = typeof window !== 'undefined' ? localStorage.getItem("accessToken") : null;
    setIsLoggedIn(accessToken !== null && accessToken !== undefined);
  }, []);

  return (
    <header className="bg-white shadow-md grid grid-cols-1 grid-rows-7">
      <nav
        aria-label="Global"
        className="grid grid-rows-1 grid-cols-12 gap-8 w-full p-4 px-6 lg:px-10 row-span-6"
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
        <div className="hidden lg:grid lg:grid-cols-subgrid col-span-9 items-center justify-items-end">
          {navigation.map((item) => (
            <div key={item.name} className="col-span-2">
              <Link
                href={item.href}
                className="text-2xl font-semibold text-gray-800 hover:text-gray-900"
              >
                {item.name}
              </Link>
            </div>
          ))}
        </div>
        <div className="flex items-center col-span-1 col-end-11 lg:col-end-12">
          <Menu as="div" className="relative inline-block text-left">
            <div>
              <MenuButton className="-m-2.5 inline-flex items-center justify-start rounded-md p-2.5 text-gray-600">
                <span className="sr-only">Open profile menu</span>
                <UserCircleIcon aria-hidden="true" className="h-6 w-6" />
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
              <MenuItems className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <div className="px-1 py-1">
                  {isLoggedIn ? (
                    <MenuItem>
                      <button
                        onClick={() => setIsLogoutDialogOpen(true)}
                        className="active:bg-gray-100 active:text-red-900 text-red-500 font-semibold group flex w-full items-center rounded-md px-2 py-2 text-sm"
                      >
                        Log out
                      </button>
                    </MenuItem>
                  ) : (
                    <>
                      <MenuItem>
                        <button
                          onClick={() => setIsLoginDialogOpen(true)}
                          className="active:bg-gray-100 active:text-gray-900 text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-sm"
                        >
                          Log in
                        </button>
                      </MenuItem>
                      <MenuItem>
                        <button
                          onClick={() => setIsSignupDialogOpen(true)}
                          className="active:bg-gray-100 active:text-gray-900 text-gray-700 group flex w-full items-center rounded-md px-2 py-2 text-sm"
                        >
                          Sign up
                        </button>
                      </MenuItem>
                    </>
                  )}                </div>
              </MenuItems>
            </Transition>
          </Menu>
        </div>
        <div className="grid lg:hidden col-span-1 col-end-12">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-start rounded-md p-2.5 text-gray-400"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
        </div>
      </nav>
      {/* Banner that says - Site in construction - with black and yellow striped construction bg */}
      <div className="flex bg-constructionStripes text-white font-bold justify-center row-span-1">
        <p className="bg-black/45 w-fit px-2 my-1 text-lg rounded">
          Site in construction
        </p>
      </div>
      <Dialog
        open={mobileMenuOpen}
        onClose={setMobileMenuOpen}
        className="lg:hidden"
      >
        <div className="fixed inset-0 z-10 bg-gray-800 bg-opacity-50" />
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
              className="-m-2.5 rounded-md p-2.5 text-gray-800 font-bold"
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
      </Dialog>
      <SignupDialog isOpen={isSignupDialogOpen} onClose={closeDialog} />
      <LoginDialog isOpen={isLoginDialogOpen} onClose={closeDialog} />
      <LogoutDialog isOpen={isLogoutDialogOpen} onClose={closeDialog} />
    </header>
  );
}
