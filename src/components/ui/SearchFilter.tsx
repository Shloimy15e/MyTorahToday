"use client";

import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";
import { CheckIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

export default function SearchFilter({ label, allLabel, value, options, onChange }: {
  label: string;
  allLabel: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <Listbox value={value} onChange={onChange}>
      <ListboxButton aria-label={label} className="group inline-flex min-h-11 min-w-0 max-w-full items-center justify-between gap-3 rounded-xl bg-stone-100 px-3.5 py-2 text-sm text-stone-700 transition-colors hover:bg-stone-200 data-[open]:bg-blue-50 data-[open]:text-primary-blue focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-blue motion-reduce:transition-none">
        <span className="truncate">{value === "all" ? allLabel : value}</span>
        <ChevronDownIcon aria-hidden="true" className="h-4 w-4 shrink-0 transition-transform duration-150 group-data-[open]:rotate-180 motion-reduce:transition-none" />
      </ListboxButton>
      <ListboxOptions
        aria-label={label}
        anchor={{ to: "bottom start", gap: 8, padding: 16 }}
        portal
        modal={false}
        transition
        className="z-[80] max-h-64 w-max min-w-52 max-w-[calc(100vw-32px)] overflow-y-auto overscroll-contain rounded-xl bg-[#fffefa] p-1.5 shadow-xl shadow-stone-900/15 ring-1 ring-stone-200 transition duration-150 ease-out data-[closed]:translate-y-1 data-[closed]:opacity-0 focus:outline-none motion-reduce:translate-y-0 motion-reduce:transition-none"
      >
        {[{ name: allLabel, value: "all" }, ...options.map((name) => ({ name, value: name }))].map((option) => (
          <ListboxOption key={option.value} value={option.value} className="group flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-stone-700 transition-colors data-[focus]:bg-stone-100 data-[selected]:font-medium data-[selected]:text-primary-blue motion-reduce:transition-none">
            <span className="min-w-0 flex-1 break-words">{option.name}</span>
            <CheckIcon aria-hidden="true" className="h-4 w-4 shrink-0 opacity-0 group-data-[selected]:opacity-100" />
          </ListboxOption>
        ))}
      </ListboxOptions>
    </Listbox>
  );
}

