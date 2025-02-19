import {
  FiGrid,
  FiDollarSign,
  FiClock,
  FiPackage,
  FiSettings,
} from "react-icons/fi";
import { FaSchool, FaRegPlusSquare } from "react-icons/fa";

export const MENU_ITEMS = [
  {
    id: "dashboard",
    icon: FiGrid,
    label: "Dashboard",
    href: "/dashboard",
    roles: "",
  },
  {
    id: "school",
    icon: FaSchool,
    label: "School",
    href: "/school",
    roles: "",
  },
  {
    id: "createschool",
    icon: FaRegPlusSquare,
    label: "Create School",
    href: "/school/createschool",
    roles: "",
  },
  {
    id: "subscription",
    icon: FiDollarSign,
    label: "Subscription",
    href: "/subscription",
    roles: "",
  },
  {
    id: "pandingrequest",
    icon: FiClock,
    label: "Pending Request",
    href: "/pandingrequest",
    roles: "",
  },
  {
    id: "package",
    icon: FiPackage,
    label: "Package",
    href: "/package",
    roles: "",
  },
  {
    id: "academic",
    icon: FiSettings,
    label: "Academic",
    href: "/academic",
    roles: "",
    subItems: [
      {
        id: "subject",
        label: "Subject",
        href: "/academic/subject",
        roles: "",
      },
      {
        id: "class",
        label: "Class",
        href: "/academic/class",
        roles: "",
      },
      {
        id: "stream ",
        label: "Stream",
        href: "/academic/stream",
        roles: "",
      },
      {
        id: "timetable",
        label: "Time Table",
        href: "/academic/timetable",
        roles: "",
      },
    ],
  },
  {
    id: "setting",
    icon: FiSettings,
    label: "Settings",
    href: "/setting",
    roles: "",
    subItems: [
      {
        id: "system",
        label: "System Setting",
        href: "/setting/system",
        roles: "",
      },
      {
        id: "payment ",
        label: "Payment Setting",
        href: "/setting/payment",
        roles: "",
      },
      {
        id: "about",
        label: "About",
        href: "/setting/about",
        roles: "",
      },
    ],
  },
];
