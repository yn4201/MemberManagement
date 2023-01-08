import React from "react";
import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";
import SideBar from "./SideBar";

function Layout() {
  return (
    <div className="flex flex-row h-screen w-screen overflow-hidden">
      <SideBar />
      <div className="flex-1">
        <NavBar />
        {<Outlet />}
      </div>
    </div>
  );
}

export default Layout;
