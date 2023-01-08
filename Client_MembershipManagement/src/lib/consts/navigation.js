import * as AiIcons from "react-icons/ai";
import * as BiIcons from "react-icons/bi";
import * as FiIcons from "react-icons/fi";
import * as RiIcons from "react-icons/ri";
import * as MdIcons from "react-icons/md";

export const DASHBOARD_SIDEBAR_LINKS = [
  {
    key: "dashboard",
    label: "Dashboard",
    path: "/home/dashboard",
    icon: <BiIcons.BiHomeAlt />,
  },
  {
    key: "addrole",
    label: "Add Role",
    path: "/home/addrole",
    icon: <AiIcons.AiOutlineUserAdd />,
  },
  {
    key: "history",
    label: "History",
    path: "/home/histories",
    icon: <RiIcons.RiHistoryFill />,
  },
  {
    key: "gift",
    label: "Gift",
    path: "/home/gifts",
    icon: <FiIcons.FiGift />,
  },
  {
    key: "event",
    label: "Event",
    path: "/home/events",
    icon: <MdIcons.MdOutlineEmojiEvents />,
  },
];
