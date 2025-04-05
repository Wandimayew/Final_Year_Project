"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  InboxIcon,
  PaperAirplaneIcon,
  StarIcon,
  TrashIcon,
  PencilSquareIcon,
} from "@heroicons/react/24/solid";

const MailBoxFolder = () => {
  const router = useRouter();
  const pathname = usePathname();

  const folders = [
    { path: "/communication/email", name: "Inbox", icon: InboxIcon, count: 5 },
    {
      path: "/communication/email/sent",
      name: "Sent",
      icon: PaperAirplaneIcon,
      count: 3,
    },
    {
      path: "/communication/email/important",
      name: "Important",
      icon: StarIcon,
      count: 2,
    },
    {
      path: "/communication/email/trash",
      name: "Trash",
      icon: TrashIcon,
      count: 1,
    },
  ];

  return (
    <div className="w-60 bg-gradient-to-b from-blue-50 to-gray-100 border-r border-gray-200 h-screen fixed overflow-y-auto shadow-md">
      {/* Compose Button */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-400 flex justify-end items-center">
        <button
          onClick={() => router.push("/communication/email/compose")}
          className="p-2 bg-white/20 text-white rounded-full hover:bg-white/30 transform hover:scale-110 transition-all"
          aria-label="Compose Email"
        >
          <PencilSquareIcon className="h-6 w-6" />
        </button>
      </div>

      {/* Folder List */}
      <ul className="space-y-1 p-2">
        {folders.map((folder) => {
          const isSelected = pathname === folder.path;
          return (
            <li
              key={folder.name}
              onClick={() => router.push(folder.path)}
              className={`flex items-center gap-3 p-3 rounded-r-lg cursor-pointer transition-all ${
                isSelected
                  ? "bg-blue-100 text-blue-700 shadow-md"
                  : "hover:bg-blue-50 hover:translate-x-1 hover:shadow-sm"
              }`}
            >
              <folder.icon
                className={`h-6 w-6 ${
                  isSelected ? "text-blue-700" : "text-blue-500"
                }`}
              />
              <div className="flex-1">
                <span
                  className={`font-semibold ${
                    isSelected ? "text-blue-700" : "text-gray-700"
                  }`}
                >
                  {folder.name}
                </span>
                {folder.count > 0 && (
                  <span className="ml-2 text-sm text-gray-500">
                    ({folder.count})
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default MailBoxFolder;
