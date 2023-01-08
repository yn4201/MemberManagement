import React from "react";
import * as MdIcons from "react-icons/md";

function History() {
  return (
    <div className="h-auto w-2/3 p-4 my-16 border-2 border-gray-300 rounded-lg mx-auto bg-gray-100">
      <div className="flex w-full h-10 my-3 justify-between items-center">
        <div className="w-1/5">
          <div className="font-bold text-xl text-blue-600">
            Exchange History
          </div>
        </div>
        <div className="w-1/2">
          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <MdIcons.MdSearch />
            </div>
            <input
              type="text"
              id="simple-search"
              className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
              placeholder="Search"
            />
          </div>
        </div>
        <div className="w-1/6">
        <button className="relative">
            <select className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500">
              <option>Fillter by</option>
              <option>Income</option>
              <option>Outcome</option>
            </select>
          </button>
        </div>
      </div>
      <div className="h-full w-full mt-8 mx-auto">
        <table className="table-fixed w-full mx-auto my-auto border-2 bg-white">
          <thead>
            <tr>
              <th>UID</th>
              <th>Owner</th>
              <th>Cost</th>
              <th>Product</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>A123</td>
              <td>Nguyễn Văn Tèo</td>
              <td>+25P</td>
              <td>Bonus Point</td>
              <td>22/11/2022</td>
              <td>Income</td>
            </tr>
            <tr>
              <td>A456</td>
              <td>Nguyễn Văn Tí</td>
              <td>-25P</td>
              <td>Hoodie</td>
              <td>22/11/2022</td>
              <td>Outcome</td>
            </tr>
            <tr>
              <td>A123</td>
              <td>Nguyễn Văn Tèo</td>
              <td>+25P</td>
              <td>Bonus Point</td>
              <td>22/11/2022</td>
              <td>Income</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
