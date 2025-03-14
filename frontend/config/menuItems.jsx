import {
  FiGrid,
  FiDollarSign,
  FiClock,
  FiPackage,
  FiSettings,
} from "react-icons/fi";
import {
  FiList,
  FiUserPlus,
  FiDownload,
  FiCamera,
  FiEye,
} from "react-icons/fi";
import {
  FaSchool,
  FaRegPlusSquare,
  FaUser,
  FaUsers,
  FaCalendarCheck,
  FaQrcode,
} from "react-icons/fa";

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
        id: "subject-class",
        label: "Subject Class",
        href: "/academic/subject/class",
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
    id: "employee",
    icon: FaUsers,
    label: "Employees",
    href: "/employee",
    roles: "",
    subItems: [
      {
        id: "employee_List",
        icon: FiList,
        label: "Employee List",
        href: "/employee",
        roles: "",
      },
      {
        id: "addEmployee",
        icon: FiUserPlus,
        label: "Add Employee",
        href: "/employee/addemployee",
        roles: "",
      },
    ],
  },
  {
    id: "attendance",
    icon: FaCalendarCheck,
    label: "Attendance",
    href: "/attendance",
    roles: "",
    subItems: [
      {
        id: "generate",
        icon: FaQrcode,
        label: "Generate QR Code",
        href: "/attendance/generate",
        roles: "",
      },
      {
        id: "scan",
        icon: FiCamera,
        label: "Scan QR Code",
        href: "/attendance/scan",
        roles: "",
      },
      {
        id: "list",
        icon: FiList,
        label: "Attendance List",
        href: "/attendance/list",
        roles: "",
      },
      {
        id: "view",
        icon: FiEye,
        label: "View Attendance",
        href: "/attendance/view",
        roles: "",
      },
    ],
  },
  {
    id: "announcementandevent",
    icon: FiSettings,
    label: "Announcements",
    href: "/communication/event",
    roles: "", // Roles can be updated later for access control (e.g., "admin,teacher")
    subItems: [
      {
        id: "event",
        label: "Events",
        href: "/communication/event",
        roles: "",
      },
      {
        id: "allEvents",
        label: "All Events",
        href: "/communication/event",
        roles: "",
      },
      {
        id: "createEvent",
        label: "Create Event",
        href: "/communication/event/create",
        roles: "",
      },
      {
        id: "pendingApprovals",
        label: "Pending Approvals",
        href: "/communication/event/pending-approval",
        roles: "", // Restrict to admins; adjust based on your role system
      },
      {
        id: "myAnnouncement",
        label: "My Announcement",
        href: "/communication/event/my-pending",
        roles: "", // Available to all creators
      },
      {
        id: "draft",
        label: "My Draft",
        href: "/communication/event/draft",
        roles: "", // Available to all creators
      },
      {
        id: "email",
        label: "Email",
        href: "/communication/email",
        roles: "",
      },
      {
        id: "notification",
        label: "Notification",
        href: "/communication/notification",
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
        label: "Communication Setting",
        href: "/setting/communication/preference",
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
