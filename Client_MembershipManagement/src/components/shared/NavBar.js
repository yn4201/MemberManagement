import React from "react";
import * as BsIcons from "react-icons/bs";
import * as MdIcons from "react-icons/md";

function NavBar() {
  return (
    <div className="flex w-full justify-center items-center border-b-2">
      <div className="h-20 w-2/3 flex justify-between items-center ">
        <div className="relative w-1/2">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MdIcons.MdSearch />
          </div>
          <input
            type="text"
            id="simple-search"
            className="bg-white border-2 border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 hover:shadow-md"
            placeholder="Search"
          />
        </div>
        <div>
          <BsIcons.BsBell size={25} className="cursor-pointer" />
        </div>
      </div>
    </div>
  );
}

export default NavBar;
