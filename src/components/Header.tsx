"use client";

import {
  ArrowLeftStartOnRectangleIcon, ArrowRightEndOnRectangleIcon, Bars3Icon,
  BookmarkIcon, ChevronDownIcon, EyeIcon, HandThumbUpIcon, HomeIcon,
  MagnifyingGlassIcon, PencilSquareIcon, RectangleGroupIcon, RectangleStackIcon,
  UserCircleIcon, XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  Dialog, DialogPanel, DialogTitle,
  Menu, MenuButton, MenuItem, MenuItems,
  Transition, TransitionChild,
} from "@headlessui/react";
import { Fragment, useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import LoginDialog from "./LoginDialog";
import LogoutDialog from "./LogoutDialog";
import SignupDialog from "./SignupDialog";
import SearchDialog from "./SearchDialog";
import Topic from "@/types/Topic";
import { useSessionContext } from "@/context/SessionContext";
import styles from "./ui/ScrollArea.module.css";

const libraryLinks = [
  { name: "Saved videos", href: "/videos/saved", icon: BookmarkIcon },
  { name: "Liked videos", href: "/videos/liked", icon: HandThumbUpIcon },
  { name: "Watched videos", href: "/videos/watched", icon: EyeIcon },
];
const controlClass = "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-150 hover:bg-stone-100 active:bg-stone-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue motion-reduce:transition-none";
const menuItemClass = "flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-stone-700 transition-colors hover:bg-stone-100 data-[focus]:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-blue motion-reduce:transition-none";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const queryParams = searchParams.get("query") || "";
  const topicParams = searchParams.get("topic") || "all";
  const subtopicParams = searchParams.get("subtopic") || "all";
  const [topics, setTopics] = useState<Topic[]>([]);
  const pathname = usePathname();
  const { session } = useSessionContext();

  useEffect(() => {
    const onSearchShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.ctrlKey || event.metaKey) && !event.altKey) {
        event.preventDefault();
        if (!event.repeat) setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onSearchShortcut);
    return () => window.removeEventListener("keydown", onSearchShortcut);
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/topics/", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to fetch topics");
        return response.json();
      })
      .then((data) => setTopics(data.results || []))
      .catch((error) => {
        if (error.name !== "AbortError") console.error("Error fetching topics:", error);
      });
    return () => controller.abort();
  }, [pathname]);

  const navigation = useMemo(() => [
    { name: "Home", href: "/", icon: HomeIcon },
    { name: "All topics", href: "/topics", icon: RectangleStackIcon },
    ...topics.filter((topic) => topic.subtopics.length > 0)
      .map((topic) => ({ name: topic.name, href: `/topics/${topic.id}`, icon: RectangleGroupIcon })),
  ], [topics]);

  const isCurrent = (href: string) => pathname === href || (
    href !== "/" && href !== "/topics" && pathname.startsWith(`${href}/`)
  ) || topics.some((topic) => href === `/topics/${topic.id}` &&
    topic.subtopics.some((subtopic) => pathname === `/subtopics/${subtopic.id}`));

  const closeDialog = () => {
    setIsLoginDialogOpen(false);
    setIsSignupDialogOpen(false);
    setIsLogoutDialogOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200 bg-[#fffefa] text-stone-800">
      <nav aria-label="Global" className="mx-auto flex max-w-screen-2xl flex-wrap items-center gap-x-3 px-4 py-2.5 sm:px-6 lg:gap-x-6 lg:px-8 lg:py-3">
        <Link href="/" className="group flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue">
          <Image alt="MyTorahToday.com" src="/images/mytorah-today-logo.webp" className="h-auto w-[72px] shrink-0 object-contain" width={177} height={130} priority />
          <span className="text-[15px] font-semibold tracking-tight text-primary-blue transition-colors group-hover:text-blue-950 sm:text-base motion-reduce:transition-none">My Torah Today</span>
        </Link>

        <button
          type="button"
          aria-label="Open search"
          aria-haspopup="dialog"
          onClick={() => setSearchOpen(true)}
          className="ml-auto hidden min-h-[44px] min-w-0 max-w-sm flex-1 items-center gap-3 rounded-xl border border-stone-300 bg-white px-3.5 text-sm text-stone-500 transition-colors hover:border-primary-blue hover:bg-stone-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue lg:flex motion-reduce:transition-none"
        >
          <MagnifyingGlassIcon aria-hidden="true" className="h-5 w-5 shrink-0" />
          <span className="truncate">Find a teaching…</span>
          <kbd className="ml-auto shrink-0 rounded border border-stone-200 bg-stone-50 px-1.5 py-0.5 font-sans text-xs text-stone-500">Ctrl K</kbd>
        </button>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1 lg:ml-0">
          <button type="button" aria-label="Open search" aria-haspopup="dialog" onClick={() => setSearchOpen(true)} className={`${controlClass} min-w-[44px] px-2 lg:hidden`}>
            <MagnifyingGlassIcon aria-hidden="true" className="h-5 w-5" />
            <span className="hidden min-[380px]:inline">Search</span>
          </button>
          <Menu as="div" className="relative hidden lg:block">
            <MenuButton className={`${controlClass} text-stone-600`}>
              <UserCircleIcon aria-hidden="true" className="h-5 w-5" />
              <span className="max-w-24 truncate">{session?.user.username || "Account"}</span>
              <ChevronDownIcon aria-hidden="true" className="h-3.5 w-3.5" />
            </MenuButton>
            <Transition as={Fragment} enter="transition duration-150 ease-out motion-reduce:transition-none" enterFrom="translate-y-1 opacity-0 motion-reduce:translate-y-0" enterTo="translate-y-0 opacity-100" leave="transition duration-100 ease-in motion-reduce:transition-none" leaveFrom="opacity-100" leaveTo="opacity-0">
              <MenuItems className="absolute right-0 z-50 mt-3 w-60 rounded-xl border border-stone-200 bg-[#fffefa] p-2 shadow-lg shadow-stone-900/10 focus:outline-none">
                {session ? <>
                  {libraryLinks.map((item) => <MenuItem key={item.href}><Link href={item.href} className={menuItemClass}><item.icon aria-hidden="true" className="h-5 w-5" />{item.name}</Link></MenuItem>)}
                  <div className="h-2" />
                  <MenuItem><button onClick={() => setIsLogoutDialogOpen(true)} className={menuItemClass}><ArrowLeftStartOnRectangleIcon aria-hidden="true" className="h-5 w-5" />Log out</button></MenuItem>
                </> : <>
                  <MenuItem><button onClick={() => setIsLoginDialogOpen(true)} className={menuItemClass}><ArrowRightEndOnRectangleIcon aria-hidden="true" className="h-5 w-5" />Log in</button></MenuItem>
                  <MenuItem><button onClick={() => setIsSignupDialogOpen(true)} className={menuItemClass}><PencilSquareIcon aria-hidden="true" className="h-5 w-5" />Sign up</button></MenuItem>
                </>}
              </MenuItems>
            </Transition>
          </Menu>
          <button type="button" aria-label="Browse topics and account" aria-expanded={mobileMenuOpen} onClick={() => setMobileMenuOpen(true)} className={`${controlClass} min-w-[44px] px-2 text-primary-blue`}>
            <Bars3Icon aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <Transition show={mobileMenuOpen} as={Fragment}>
        <Dialog onClose={setMobileMenuOpen} className="relative z-50">
          <TransitionChild as={Fragment} enter="transition-opacity duration-200 motion-reduce:transition-none" enterFrom="opacity-0" enterTo="opacity-100" leave="transition-opacity duration-150 motion-reduce:transition-none" leaveFrom="opacity-100" leaveTo="opacity-0"><div className="fixed inset-0 bg-stone-950/35" aria-hidden="true" /></TransitionChild>
          <TransitionChild as={Fragment} enter="transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none" enterFrom="translate-x-full motion-reduce:translate-x-0" enterTo="translate-x-0" leave="transition duration-200 ease-in motion-reduce:transition-none" leaveFrom="translate-x-0" leaveTo="translate-x-full motion-reduce:translate-x-0">
            <DialogPanel className="fixed inset-y-0 right-0 flex h-dvh w-full max-w-sm flex-col overflow-hidden bg-[#fffefa] px-6 pt-6 text-stone-800 shadow-xl shadow-stone-950/15" style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}>
              <div className="flex shrink-0 items-center justify-between gap-4 pb-3">
                <DialogTitle className="text-xl font-semibold tracking-tight">Browse teachings</DialogTitle>
                <button type="button" data-autofocus onClick={() => setMobileMenuOpen(false)} aria-label="Close navigation" className={`${controlClass} -mr-2 min-w-[44px] px-2`}><XMarkIcon aria-hidden="true" className="h-5 w-5" /></button>
              </div>
              <nav aria-label="Topics" className={`${styles.scrollbar} min-h-0 flex-1 space-y-1 overflow-y-auto overscroll-contain py-3 pr-1`}>
                {navigation.map((item) => <Link key={item.href} href={item.href} aria-current={isCurrent(item.href) ? "page" : undefined} onClick={() => setMobileMenuOpen(false)} className={`${menuItemClass} text-base ${isCurrent(item.href) ? "bg-blue-50 font-semibold text-primary-blue" : ""}`}><item.icon aria-hidden="true" className="h-5 w-5 shrink-0" />{item.name}</Link>)}
              </nav>
              <div className="shrink-0 bg-[#fffefa] pt-4">
                {session ? <>
                  <h3 className="mb-2 px-3 text-sm font-semibold text-stone-800">Your library</h3>
                  {libraryLinks.map((item) => <Link key={item.href} href={item.href} onClick={() => setMobileMenuOpen(false)} aria-current={isCurrent(item.href) ? "page" : undefined} className={`${menuItemClass} ${isCurrent(item.href) ? "bg-blue-50 text-primary-blue" : ""}`}><item.icon aria-hidden="true" className="h-5 w-5" />{item.name}</Link>)}
                  <button onClick={() => { setMobileMenuOpen(false); setIsLogoutDialogOpen(true); }} className={`${menuItemClass} mt-3`}><ArrowLeftStartOnRectangleIcon aria-hidden="true" className="h-5 w-5" />Log out</button>
                </> : <>
                  <button onClick={() => { setMobileMenuOpen(false); setIsLoginDialogOpen(true); }} className="flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg bg-primary-blue px-4 text-sm font-medium text-white transition-colors hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue motion-reduce:transition-none"><ArrowRightEndOnRectangleIcon aria-hidden="true" className="h-5 w-5" />Log in</button>
                  <button onClick={() => { setMobileMenuOpen(false); setIsSignupDialogOpen(true); }} className={`${menuItemClass} mt-2 justify-center`}>Sign up</button>
                </>}
              </div>
            </DialogPanel>
          </TransitionChild>
        </Dialog>
      </Transition>
      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} topics={topics}
        initialQuery={queryParams} initialTopic={topicParams} initialSubtopic={subtopicParams} />
      <SignupDialog isOpen={isSignupDialogOpen} onClose={closeDialog} />
      <LoginDialog isOpen={isLoginDialogOpen} onClose={closeDialog} />
      <LogoutDialog isOpen={isLogoutDialogOpen} onClose={closeDialog} />
    </header>
  );
}
