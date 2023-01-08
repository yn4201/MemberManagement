import React, { useEffect, useState } from "react";
import * as MdIcons from "react-icons/md";
import * as SiIcons from "react-icons/si";
import * as ImIcons from "react-icons/im";
import QRCode from "react-qr-code";
import { Spinner, Overlay } from "evergreen-ui";

import { db } from "../configs/firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  setDoc,
} from "firebase/firestore";

import { ethers } from "ethers";
import abi from "../utils/Accounts.json";

function AddRole() {
  const contractAddress = "0x441DCDD469F7d30C3e1294dAC5E62da96b6Af0BD";
  const contractABI = abi.abi;

  const [showManagerModal, setshowManagerModal] = useState(false);
  const [showAdminModal, setshowAdminModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isFalse, setIsFalse] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [transactionETH, setTransactionETH] = useState("");
  const [viewETHQrCode, setViewETHQrCode] = useState("");

  const [roles, setRoles] = useState([]);
  const [newID, setNewID] = useState("");
  const [newName, setNewName] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newDateAdded, setNewDateAdded] = useState("");

  const onClickViewQrcode = (address) => {
    setViewETHQrCode(address);
  };

  const onCloseViewQrcode = () => {
    setViewETHQrCode("");
  };

  const connectToBlockChain = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  };

  const checkAdmin = async () => {
    const contract = await connectToBlockChain();
    const admin = await contract.checkAdmin(currentAccount);
    console.log("Admin: ", admin);
    return admin;
  };

  const getRoles = async () => {
    try {
      setLoading(true);
      const rolesCollectionRef = collection(db, "roles");
      const rolesCollection = await getDocs(rolesCollectionRef);
      const rolesData = rolesCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRoles(rolesData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const addAdmin = async () => {
    try {
      setLoading(true);
      const contract = await connectToBlockChain();
      const transaction = await contract.addAdmin(newAddress, newName);
      await transaction.wait();
      console.log("Transaction: ", transaction.hash);
      setTransactionETH(transaction.hash);

      const rolesCollectionRef = doc(db, "roles", newAddress);
      await setDoc(rolesCollectionRef, {
        address: newAddress,
        name: newName,
        role: "Admin",
        dateAdded: newDateAdded,
        status: "Active",
        transactionETH: transaction.hash,
      });
      setLoading(false);
      setshowAdminModal(false);
      alert("Success", window.location.reload());
    } catch (error) {
      console.log(error);
      alert("Transaction Declined");
      setLoading(false);
    }
  };

  const addManager = async () => {
    try {
      setLoading(true);
      const contract = await connectToBlockChain();
      const transaction = await contract.addManager(newAddress, newName);
      await transaction.wait();
      console.log("Transaction: ", transaction.hash);
      setTransactionETH(transaction.hash);

      const rolesCollectionRef = doc(db, "roles", newAddress);
      await setDoc(rolesCollectionRef, {
        address: newAddress,
        name: newName,
        role: "Manager",
        dateAdded: newDateAdded,
        status: "Active",
        transactionETH: transaction.hash,
      });
      setLoading(false);
      setshowAdminModal(false);
      alert("Success", window.location.reload());
    } catch (error) {
      console.log(error);
      alert("Transaction Declined");
      setLoading(false);
    }
  };

  const removeAdmin = async (id) => {
    try {
      setLoading(true);
      const contract = await connectToBlockChain();
      const transaction = await contract.removeAdmin(id);
      await transaction.wait();
      setTransactionETH(transaction.hash);

      const rolesDocRef = doc(db, "roles", id);
      await updateDoc(rolesDocRef, {
        status: "Inactive",
        transactionETH: transaction.hash,
      });
      setLoading(false);
      alert("Admin removed from system", window.location.reload());
    } catch (error) {
      console.log(error);
      alert("Transaction Declined");
      setLoading(false);
    }
  };

  const removeManager = async (id) => {
    try {
      setLoading(true);
      const contract = await connectToBlockChain();
      const transaction = await contract.removeManager(id);
      await transaction.wait();
      setTransactionETH(transaction.hash);

      const rolesDocRef = doc(db, "roles", id);
      await updateDoc(rolesDocRef, {
        status: "Inactive",
        transactionETH: transaction.hash,
      });
      setLoading(false);
      alert("Manager removed from system", window.location.reload());
    } catch (error) {
      console.log(error);
      alert("Transaction Declined");
      setLoading(false);
    }
  };

  useEffect(() => {
    getRoles();
  }, []);

  return (
    <>
      <div className="h-auto w-4/5 p-4 border-2 my-16 border-gray-300 rounded-lg mx-auto bg-gray-100">
        <div className="flex w-full h-10 my-3 items-center">
          <div className="w-1/4">
            <div className="font-bold text-xl text-blue-600">
              Authorized members
            </div>
          </div>
          <div className="w-1/3">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MdIcons.MdSearch />
              </div>
              <input
                type="text"
                id="simple-search"
                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white hover:shadow-md dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder="Search"
              />
            </div>
          </div>
          <div className="w-1/6">
            <button className="relative">
              <select className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500 ml-5 hover:shadow-md cursor-pointer">
                <option>Fillter by</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Member</option>
              </select>
            </button>
          </div>
          <div className="w-1/5">
            <button
              className="float-right flex justify-center items-center bg-blue-600 text-white active:bg-blue-700 font-bold py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 w-3/4"
              type="button"
              onClick={() => setshowManagerModal(true)}
            >
              <p className="text-base">Add Manager</p>
            </button>
          </div>
          <div className="w-1/5">
            <button
              className="float-right flex justify-center items-center bg-blue-600 text-white active:bg-blue-700 font-bold py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 w-3/4"
              type="button"
              onClick={() => setshowAdminModal(true)}
            >
              <p className="text-base">Add Admin</p>
            </button>
          </div>
        </div>
        <div className="h-full w-full mt-8 mx-auto">
          <table className="table-fixed w-full mx-auto my-auto border-2 bg-white">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Status</th>
                <th>Added Date</th>
                <th>Address</th>
                <th>Transaction ETH</th>
                <th>Function</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role, i) => {
                return (
                  <tr key={i}>
                    <td>{role.name}</td>
                    <td>{role.role}</td>
                    {role.status === "Active" ? (
                      <td className="text-green-500">{role.status}</td>
                    ) : (
                      <td className="text-red-500">{role.status}</td>
                    )}
                    <td>{role.dateAdded}</td>
                    <td>{role.address}</td>
                    <td>
                      <button
                        className="bg-blue-600 text-white active:bg-blue-700 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setViewETHQrCode(role.transactionETH)}
                      >
                        View
                      </button>
                    </td>
                    {role.status === "Active" ? (
                      <td>
                        {role.role === "Manager" ? (
                          <button
                            className=" text-red-600 text-lg px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            onClick={() => {
                              removeManager(role.address);
                            }}
                          >
                            <ImIcons.ImCross />
                          </button>
                        ) : (
                          <button
                            className=" text-red-600 text-lg px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                            onClick={() => {
                              removeAdmin(role.address);
                            }}
                          >
                            <ImIcons.ImCross />
                          </button>
                        )}
                      </td>
                    ) : (
                      <td>
                        <button className=" text-gray-300 text-lg px-4 py-2 rounded outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150 cursor-not-allowed">
                          <ImIcons.ImCross />
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {viewETHQrCode && (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">
                        QRCode Etherscan
                      </h3>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <QRCode
                        value={
                          "https://goerli.etherscan.io/tx/" + viewETHQrCode
                        }
                      />
                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                      <button
                        className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setViewETHQrCode("")}
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-10 bg-black"></div>
            </>
          )}
          {/* AdminModal */}
          {showAdminModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Admin</h3>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <form className="w-full max-w-lg">
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-2/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Name
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              placeholder="Name"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-1/2 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Address
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              placeholder="MetaMask Address"
                              value={newAddress}
                              onChange={(e) => setNewAddress(e.target.value)}
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Added Date
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="date"
                              value={newDateAdded}
                              onChange={(e) => setNewDateAdded(e.target.value)}
                            />
                          </div>
                        </div>
                        {/* <div className="flex flex-wrap -mx-3 mb-2">

                      </div> */}
                      </form>
                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                      <button
                        className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setshowAdminModal(false)}
                      >
                        Close
                      </button>
                      <button
                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={addAdmin}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-10 bg-black"></div>
            </>
          ) : null}
          {/* ManagerModal */}
          {showManagerModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Manager</h3>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <form className="w-full max-w-lg">
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-2/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Name
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              placeholder="Name"
                              value={newName}
                              onChange={(e) => setNewName(e.target.value)}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-1/2 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Address
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              placeholder="Wallet Address"
                              value={newAddress}
                              onChange={(e) => setNewAddress(e.target.value)}
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Added Date
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="date"
                              value={newDateAdded}
                              onChange={(e) => setNewDateAdded(e.target.value)}
                            />
                          </div>
                        </div>
                      </form>
                    </div>
                    {/*footer*/}
                    <div className="flex items-center justify-end p-6 border-t border-solid border-slate-200 rounded-b">
                      <button
                        className="bg-red-500 text-white active:bg-red-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setshowManagerModal(false)}
                      >
                        Close
                      </button>
                      <button
                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={addManager}
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="opacity-25 fixed inset-0 z-10 bg-black"></div>
            </>
          ) : null}
        </div>
      </div>
      <React.Fragment>
        {/* turn of click close overlay */}
        <Overlay
          isShown={loading}
          shouldCloseOnClick={false}
          shouldCloseOnEscapePress={false}
        >
          <div className="spinner-load">
            <Spinner size={100} color="green" className="spinner" />
          </div>
        </Overlay>
      </React.Fragment>
    </>
  );
}

export default AddRole;
