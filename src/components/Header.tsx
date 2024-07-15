"use client";

import { useState } from "react";
import { Dialog, DialogPanel } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

const navigation = [
  { name: "Parshah", href: "/topics/parshah" },
  { name: "Neviim", href: "/topics/neviim" },
  { name: "Chassidus", href: "/topics/chassidus" },
  { name: "Lifes ways", href: "/topics/lifes-ways" },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md grid grid-cols-1 grid-rows-7">
      <nav
        aria-label="Global"
        className="grid grid-rows-1 grid-cols-10 gap-8 w-full p-4 px-6 lg:px-10 row-span-6"
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
        <div className="grid lg:hidden col-span-1 col-end-10 md:col-end-11">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="-m-2.5 inline-flex items-center justify-start rounded-md p-2.5 text-gray-400"
          >
            <span className="sr-only">Open main menu</span>
            <Bars3Icon aria-hidden="true" className="h-6 w-6" />
          </button>
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
    </header>
  );
}
