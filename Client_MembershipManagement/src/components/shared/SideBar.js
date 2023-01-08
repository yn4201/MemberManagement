import classNames from "classnames";
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { DASHBOARD_SIDEBAR_LINKS } from "../../lib/consts/navigation";
import * as BiIcons from "react-icons/bi";

function SideBar() {
  return (
    <div className="flex flex-col w-24 p-3 bg-gray-200 text-black place-items-center relative">
      <div className="flex">
        <p className="font-bold text-3xl text-blue-600 font-sans">UTH</p>
      </div>
      <div className="flex h-full justify-center">
        <div className="absolute top-1/4">
          {DASHBOARD_SIDEBAR_LINKS.map((link) => (
            <SideBarLink key={link.key} link={link} />
          ))}
        </div>
      </div>
      <div className={classNames("w-full flex justify-center text-red-500 text-4xl")}>
        <BiIcons.BiLogOut />
      </div>
    </div>
  );
}

function SideBarLink({ link }) {
  const { pathname } = useLocation();

  return (
    <Link
      to={link.path}
      className={classNames(
        linkClassess,
        pathname === link.path ? linkActive : linkUnactive
      )}
    >
      <div className="flex flex-col items-center justify-center mx-auto">
        <div className="text-3xl">{link.icon}</div>
        <div className="text-xs">{link.label}</div>
      </div>
    </Link>
  );
}

const linkActive = "text-blue-600 bg-gray-300 shadow-md";
const linkUnactive = "text-slate-700";
const linkClassess = "flex item-center mx-auto px-2.5 py-3 rounded-lg";

// const SideBarIcon = ({ icon }) => <div className="sidebar-icon">{icon}</div>;

// function Header() {
//   return (
//     <div className="mb-4 mt-4">
//       <img className="w-4/5 mx-auto" src={require("../../images/logo.png")} />
//     </div>
//   );
// }

// function Bottom() {
//   return (
//     <div className="border-2 border-blue-600 rounded-full w-3/4 p-0.5 m-auto">
//       <img
//         className="rounded-full w-auto m-auto"
//         src={require("../../images/avatar.jpg")}
//       />
//     </div>
//   );
// }

export default SideBar;
