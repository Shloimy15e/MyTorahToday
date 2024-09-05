"use client";
import { Fragment, useEffect, useState, useMemo } from "react";
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
} from "@headlessui/react";
import {
  Bars3Icon,
  XMarkIcon,
  UserCircleIcon,
  ArrowLeftStartOnRectangleIcon,
  ArrowRightEndOnRectangleIcon,
  PencilSquareIcon,
  HomeIcon,
  RectangleGroupIcon,
  RectangleStackIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import LoginDialog from "./LoginDialog";
import SignupDialog from "./SignupDialog";
import LogoutDialog from "./LogoutDialog";
import {
  IoBookmarksOutline,
  IoSearchOutline,
  IoSettingsOutline,
} from "react-icons/io5";
import { MdManageAccounts } from "react-icons/md";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import Topic from "@/types/Topic";
import { useMediaQuery } from "react-responsive";
import { BiLike } from "react-icons/bi";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);
  const searchParams = useSearchParams();
  const { queryParams, topicParams, subtopicParams } = useMemo(() => {
    return {
      queryParams: searchParams.get("query") || "",
      topicParams: searchParams.get("topic") || "all",
      subtopicParams: searchParams.get("subtopic") || "all",
    };
  }, [searchParams]);
  const [query, setQuery] = useState(queryParams);
  const [selectedTopic, setSelectedTopic] = useState(topicParams);
  const [selectedSubtopic, setSelectedSubtopic] = useState(subtopicParams);
  const [topics, setTopics] = useState<Topic[]>([]);
  const router = useRouter();
  const { session } = useSessionContext();
  const isMobile = useMediaQuery({ query: "(max-width: 640px)" });
  const [showSearchbar, setShowSearchbar] = useState(!isMobile);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const navigation = useMemo(() => {
    const defaultNavigation = [
      { name: "All Topics", href: "/topics", icon: RectangleStackIcon },
    ];
    const homeNavigation = [
      { name: "Home", href: "/", icon: HomeIcon },
      ...(pathname === "/topics" ? [] : defaultNavigation),
    ];
    return pathname === "/" ? defaultNavigation : homeNavigation;
  }, [pathname]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchTopics = async () => {
      const res = await fetch(`/api/topics/`);
      const data = await res.json();
      setTopics(data.results);
    };
    if (topics.length === 0) {
      fetchTopics();
    }
  }, [topics]);

  useEffect(() => {
    const addNavObjects = () => {
      const navObjects = topics
        .filter(
          (topic) => !pathname.includes(`/topics/${topic.name.toLowerCase()}`)
        )
        .sort((a, b) => b.subtopics.length - a.subtopics.length)
        .slice(0, 4)
        .map((topic) => ({
          name: topic.name,
          href: `/topics/${topic.name.toLowerCase()}`,
          icon: RectangleGroupIcon,
        }));
      if (pathname === "/topics") {
        navigation.push(
          ...navObjects.filter(
            (item) => !navigation.some((navItem) => navItem.name === item.name)
          )
        );
      } else {
        navigation.splice(
          -1,
          0,
          ...navObjects.filter(
            (item) => !navigation.some((navItem) => navItem.name === item.name)
          )
        );
      }
    };
    if (topics.length > 0) {
      addNavObjects();
    }
  }, [topics, pathname, navigation]);

  const handleSearch = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (query.trim() !== "") {
      if (selectedTopic === "all" && selectedSubtopic === "all") {
        router.push(`/videos/search?query=${query}`);
      } else if (selectedTopic !== "all" && selectedSubtopic === "all") {
        router.push(`/videos/search?query=${query}&topic=${selectedTopic}`);
      } else if (selectedTopic !== "all" && selectedSubtopic !== "all") {
        router.push(
          `/videos/search?query=${query}&topic=${selectedTopic}&subtopic=${selectedSubtopic}`
        );
      } else {
        router.push(
          `/videos/search?query=${query}&subtopic=${selectedSubtopic}`
        );
      }
    }
  };

  const closeDialog = () => {
    setIsLoginDialogOpen(false);
    setIsSignupDialogOpen(false);
    setIsLogoutDialogOpen(false);
  };

  return (
    <header className="bg-white shadow-md grid grid-cols-1 grid-rows-2">
      <nav
        aria-label="Global"
        className="grid grid-rows-1 gap-2 w-full p-3 md:p-4 lg:px-10 row-span-6 place-items-center"
      >
        <div className="grid grid-rows-1 col-span-3 lg:flex-1 items-center">
          <Link
            href="/"
            className="md:px-1.5 justify-center items-center text-gray-800 flex flex-col my-2 md:my-0"
          >
            <span className="sr-only">My Torah Today</span>
            <picture>
              <source srcSet="/images/rosh-yeshiva.webp" type="image/webp" />
              <Image
                alt="The Rosh Yeshiva Reb Shimon Semp"
                src="/images/rosh-yeshiva.jpg"
                className="h-16 md:h-20 w-auto aspect-square rounded-full"
                width={563}
                height={551}
                loading="eager"
              />
            </picture>
            <span className="hidden md:inline">MyTorahToday</span>
          </Link>
        </div>
        {mounted && !showSearchbar && (
          <button
            onClick={() => setShowSearchbar(true)}
            aria-label="Open search bar"
            title="Open search bar"
            className="col-span-1 col-end-10 flex items-center justify-center gap-1.5 p-2.5 rounded-full border border-primary-blue text-gray-700 hover:bg-gray-100 active:bg-gray-200"
          >
            <IoSearchOutline className="h-6 w-6" />
          </button>
        )}

        <Transition as={Fragment} show={showSearchbar}>
          <form className="grid h-fit md:h-10 grid-rows-auto md:grid-rows-1 grid-cols-12 items-center border border-primary-blue rounded-2xl md:rounded-full justify-center col-start-4 md:col-start-8 col-end-10  transition duration-300 ease-in data-[closed]:opacity-0">
            <div className="col-span-full row-start-2 md:row-auto md:col-span-3 flex md:flex-col items-start justify-center w-full h-full rounded-b-2xl md:rounded-l-full border-t md:border-t-0 md:border-r border-primary-blue">
              <div
                className={`px-1 w-full hover:bg-gray-100 active:bg-gray-200 ${
                  selectedTopic == "all"
                    ? "rounded-b-2xl md:rounded-l-full  h-full"
                    : "rounded-bl-2xl md:rounded-tl-full h-full md:h-1/2"
                }`}
              >
                <label
                  htmlFor="topicSelect"
                  className="sr-only"
                  title="Select a topic"
                >
                  Select a topic
                </label>
                <select
                  id="topicSelect"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className={`w-full h-full px-1 text-left align-top placeholder-gray-500 bg-transparent cursor-pointer rounded-b-2xl focus:outline-none focus:ring-0 sm:text-sm ${
                    selectedTopic == "all"
                      ? "rounded-b-2xl md:rounded-l-full"
                      : "rounded-bl-2xl md:rounded-tl-full"
                  }`}
                >
                  <option value="all" className="text-gray-800">
                    All Videos
                  </option>
                  {topics
                    .filter((topic) => topic.subtopics.length > 0)
                    .map((topic) => (
                      <option
                        className="text-gray-800"
                        key={topic.id}
                        value={topic.name}
                      >
                        {topic.name}
                      </option>
                    ))}
                </select>
              </div>
              {selectedTopic != "all" && (
                <div className="px-1 h-full md:h-1/2 w-full hover:bg-gray-100 active:bg-gray-200 rounded-br-2xl md:rounded-bl-full border-l md:border-l-0 md:border-t border-primary-blue">
                  <label
                    htmlFor="subtopicSelect"
                    className="sr-only"
                    title="Select a subtopic"
                  >
                    Select a subtopic
                  </label>
                  <select
                    id="subtopicSelect"
                    value={selectedSubtopic}
                    onChange={(e) => setSelectedSubtopic(e.target.value)}
                    className="w-full h-full px-1 align-top text-left placeholder-gray-500 bg-transparent cursor-pointer rounded-none focus:outline-none focus:ring-0 sm:text-sm"
                  >
                    <option value="all" className="text-gray-800">
                      All Subtopics
                    </option>
                    {topics
                      .find((topic) => topic.name === selectedTopic)
                      ?.subtopics.map((subtopic) => (
                        <option
                          className="text-gray-800"
                          key={subtopic.id}
                          value={subtopic.name}
                        >
                          {subtopic.name}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a video"
              className="w-full col-span-8 md:col-span-6 p-1 md:p-3 md:ml-2.5 inline-flex items-center justify-center text-gray-800 placeholder-gray-500 bg-inherit rounded-none focus:outline-none focus:ring-0 sm:text-sm"
            />
            <button
              type="submit"
              onClick={(e) => handleSearch(e)}
              aria-label="Search"
              title="Search"
              className="w-full h-full gap-1 md:gap-2 col-end-auto text-center col-span-4 md:col-span-3 inline-flex items-center justify-center rounded-tr-2xl md:rounded-r-full bg-primary-blue hover:bg-blue-950 text-white"
            >
              <IoSearchOutline className="h-6 w-6 flex-shrink-0" />
              <span className="hidden md:inline">Search</span>
            </button>
          </form>
        </Transition>
        <div className="flex items-center justify-center col-span-1 col-end-11">
          <Menu as="div" className="relative inline-block text-left">
            <div className="flex items-center justify-center">
              <MenuButton
                title="Open profile menu"
                className="flex items-center justify-start rounded-full w-fit xl:mr-10"
              >
                <span className="sr-only">Open profile menu</span>
                {session && session.user.username ? (
                  <span className="capitalize w-10 flex items-center justify-center text-xl font-semibold bg-primary-blue md:bg-inherit text-white md:text-primary-blue rounded-full aspect-square border border-gray-700 md:border-primary-blue">
                    {session.user.username.slice(0, 1)}
                  </span>
                ) : (
                  <span className="flex flex-col items-center justify-center w-max md:text-lg lg:text-xl xl:font-semibold text-gray-800 hover:text-primary-blue transition-colors duration-300 cursor-pointer">
                    <UserCircleIcon
                      aria-hidden="true"
                      className="h-10 w-10 stroke-1"
                    />
                    <span className="ml-2 text-sm hidden md:inline">
                      Log in / Sign up
                    </span>
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
                          href="/videos/saved"
                          className="active:bg-gray-100 active:text-primary-blue text-gray-800 group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50"
                        >
                          <IoBookmarksOutline
                            className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          <span>Saved videos</span>
                        </Link>
                      </MenuItem>
                      <MenuItem>
                        <Link
                          href={"/videos/liked"}
                          className="active:bg-gray-100 active:text-primary-blue text-gray-800 group flex w-full items-center justify-start rounded-md px-4 py-3 transition duration-150 ease-in-out hover:bg-gray-50"
                        >
                          <BiLike
                            className="mr-3 h-6 w-6 text-gray-500 group-hover:text-gray-500"
                            aria-hidden="true"
                          />
                          <span>Liked videos</span>
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
                <Link href="/" className="-m-1.5 p-1.5">
                  <span className="sr-only">My Torah Today</span>
                  <picture>
                    <source srcSet="/images/icon.webp" type="image/webp" />
                    <Image
                      alt="Torah Today icon"
                      src="/images/icon.jpg"
                      className="h-16 w-auto rounded-xl"
                      width={160}
                      height={160}
                    />
                  </picture>
                </Link>
                <button
                  type="button"
                  title="Close menu"
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
                        className="-mx-3 flex w-full gap-3 items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-100"
                      >
                        <item.icon className="h-6 w-6" />
                        {item.name}
                      </Link>
                    ))}
                    {session ? (
                      <>
                        <Link
                          href={`/videos/saved`}
                          className="-mx-3 flex w-full gap-3 items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-100"
                        >
                          <IoBookmarksOutline className="h-6 w-6" />
                          Saved videos
                        </Link>
                        <Link
                          href={`/videos/liked`}
                          className="-mx-3 flex w-full gap-3 items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-100"
                        >
                          <BiLike className="h-6 w-6" />
                          Liked videos
                        </Link>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsLoginDialogOpen(true)}
                          title="Log in"
                          className="-mx-3 flex w-full gap-3 items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-100"
                        >
                          <ArrowRightEndOnRectangleIcon className="h-6 w-6" />
                          Log in
                        </button>
                        <button
                          onClick={() => setIsSignupDialogOpen(true)}
                          title="Sign up"
                          className="-mx-3 flex w-full gap-3 items-center rounded-lg px-3 py-2 text-base font-semibold leading-7 text-gray-800 hover:bg-gray-100"
                        >
                          <PencilSquareIcon className="h-6 w-6" />
                          Sign up
                        </button>
                      </>
                    )}
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
