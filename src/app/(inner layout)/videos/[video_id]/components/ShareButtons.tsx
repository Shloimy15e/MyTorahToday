"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ClipboardDocumentIcon, EnvelopeIcon, ShareIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useToast } from "@/context/ToastProvider";
import Video from "@/types/Video";
import { videoShareUrl } from "./watch-utils";

export default function ShareButtons({ video }: { video: Video }) {
  const [url, setUrl] = useState(videoShareUrl(video.id, process.env.NEXT_PUBLIC_BASE_URL || "https://mytorahtoday.com"));
  const [canShare, setCanShare] = useState(false);
  const [showCopyLink, setShowCopyLink] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    setUrl(videoShareUrl(video.id, process.env.NEXT_PUBLIC_BASE_URL || window.location.origin));
    setCanShare(typeof navigator.share === "function");
    setShowCopyLink(false);
  }, [video.id]);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      showToast("Teaching link copied", "success");
    } catch {
      setShowCopyLink(true);
    }
  }

  async function share() {
    try {
      await navigator.share({ title: video.title, text: `${video.title} — Rabbi Shimon Semp`, url });
    } catch (error) {
      if (!(error instanceof Error && error.name === "AbortError")) await copyLink();
    }
  }

  const itemClass = "flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm text-stone-700 data-[focus]:bg-stone-100";
  return (
    <div className="relative">
      <Menu>
        <MenuButton className="inline-flex min-h-11 items-center gap-2 rounded-full border border-stone-300 bg-white px-4 text-sm font-medium text-stone-700 transition-colors duration-200 hover:bg-stone-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-blue motion-reduce:transition-none"><ShareIcon className="h-4 w-4" aria-hidden="true" />Share</MenuButton>
        <MenuItems anchor="bottom end" transition className="z-50 mt-2 w-52 origin-top-right rounded-2xl border border-stone-200 bg-white p-1.5 shadow-lg transition duration-150 ease-out data-[closed]:scale-95 data-[closed]:opacity-0 focus:outline-none motion-reduce:transition-none">
          <MenuItem><button type="button" onClick={copyLink} className={itemClass}><ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />Copy link</button></MenuItem>
          <MenuItem><a href={`mailto:?subject=${encodeURIComponent(video.title)}&body=${encodeURIComponent(`${video.title}\nRabbi Shimon Semp\n${url}`)}`} className={itemClass}><EnvelopeIcon className="h-4 w-4" aria-hidden="true" />Email</a></MenuItem>
          <MenuItem><a href={`https://wa.me/?text=${encodeURIComponent(`${video.title}\n${url}`)}`} target="_blank" rel="noopener noreferrer" className={itemClass}><ShareIcon className="h-4 w-4" aria-hidden="true" />WhatsApp</a></MenuItem>
          {canShare && <MenuItem><button type="button" onClick={share} className={itemClass}><ShareIcon className="h-4 w-4" aria-hidden="true" />More sharing options</button></MenuItem>}
        </MenuItems>
      </Menu>
      {showCopyLink && <div className="absolute right-0 top-full z-40 mt-2 w-64 rounded-xl border border-stone-200 bg-white p-3 shadow-lg"><label className="text-xs text-stone-600" htmlFor={`share-url-${video.id}`}>Select and copy this link</label><input id={`share-url-${video.id}`} aria-label="Teaching link" readOnly value={url} onFocus={(event) => event.currentTarget.select()} className="mt-1 min-h-11 w-full rounded-md border border-stone-300 px-2 text-sm text-stone-800" /><button type="button" onClick={() => setShowCopyLink(false)} className="mt-1 min-h-11 text-sm text-primary-blue">Done</button></div>}
    </div>
  );
}
