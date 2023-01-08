import React, { useEffect, useState } from "react";
import * as MdIcons from "react-icons/md";
import QRCode from "react-qr-code";
import { Spinner, Overlay } from "evergreen-ui";

import { db } from "../configs/firebase";
import { collection, doc, onSnapshot, setDoc } from "firebase/firestore";

import { ethers } from "ethers";
import abi from "../utils/Events.json";

const Event = () => {
  const contractAddress = "0x6CD090e3Df2C90302c013C1fEA3676e10Aee8D1C";
  const contractABI = abi.abi;

  const [currentAccount, setCurrentAccount] = useState("");
  const [transactionETH, setTransactionETH] = useState("");

  const [loading, setLoading] = useState(false);
  const [showAddModal, setshowAddModal] = useState(false);
  const [showUpdateModal, setshowUpdateModal] = useState(false);

  const [events, setEvents] = useState([]);
  const eventsCollectionRef = collection(db, "events");

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newBonus, setNewBonus] = useState(0);
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newStatus, setNewStatus] = useState("");
  const [viewETHQrCode, setViewETHQrCode] = useState("");

  const connectToBlockChain = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  };

  const createEvent = async () => {
    try {
      setLoading(true);
      const { ethereum } = window;
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
      let newID = Math.random().toString(36);
      const contract = await connectToBlockChain();
      const transaction = await contract.createEvent(
        newID,
        currentAccount,
        newTitle,
        newBonus,
        newDescription,
        newStatus,
        newStartDate,
        newEndDate
      );
      await transaction.wait();
      setTransactionETH(transaction.hash);

      let id = Math.random().toString(36);
      const docRef = doc(db, "events", id);
      await setDoc(docRef, {
        organizer: currentAccount,
        title: newTitle,
        bonus: newBonus,
        description: newDescription,
        status: newStatus,
        startDate: newStartDate,
        endDate: newEndDate,
        transactionETH: transaction.hash,
      });
      setLoading(false);
      setshowAddModal(false);
      alert("Create event successfully!", window.location.reload());
    } catch (error) {
      console.log(error);
      alert("Transaction Declined!");
      setLoading(false);
    }
  };

  const getEvents = async () => {
    try {
      setLoading(true);
      const data = onSnapshot(eventsCollectionRef, (snapshot) => {
        const events = [];
        snapshot.forEach((doc) => {
          events.push({ ...doc.data(), id: doc.id });
        });
        setLoading(false);
        setEvents(events);
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getEvents();
  }, []);

  const onClickViewQrcode = (address) => {
    setViewETHQrCode(address);
  };

  const onCloseViewQrcode = () => {
    setViewETHQrCode("");
  };

  return (
    <>
      <div className="h-auto w-4/5 p-4 my-16 border-2 border-gray-300 rounded-lg mx-auto bg-gray-100">
        <div className="flex w-full h-10 my-3 items-center">
          <div className="w-1/5">
            <div className="font-bold text-xl text-blue-600">Events List</div>
          </div>
          <div className="w-1/2 flex">
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
              <select className="block appearance-none w-full bg-white border border-gray-300 text-gray-700 px-4 pr-8 rounded-lg focus:outline-none focus:bg-white focus:border-gray-500 ml-5">
                <option>Fillter by</option>
                <option>Admin</option>
                <option>Manager</option>
                <option>Member</option>
              </select>
            </button>
          </div>
          <div className="w-1/4">
            <button
              className="float-right flex justify-center items-center bg-blue-600 text-white active:bg-blue-700 font-bold py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 w-3/5"
              type="button"
              onClick={() => setshowAddModal(true)}
            >
              <p className="text-base">Add New</p>
              <MdIcons.MdEmojiEvents className="ml-2 text-xl" />
            </button>
          </div>
        </div>
        <div className="h-full w-full mt-8 mx-auto">
          <table className="table-fixed w-full mx-auto my-auto border-2 bg-white">
            <thead>
              <tr>
                <th>ID</th>
                <th>Organizer</th>
                <th>Title</th>
                <th>Description</th>
                <th>Bonus Point</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Status</th>
                <th>Transaction ETH</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event, i) => {
                return (
                  <tr key={i}>
                    <td>{event.id}</td>
                    <td>{event.organizer}</td>
                    <td>{event.title}</td>
                    <td>{event.description}</td>
                    <td>{event.bonus} P</td>
                    <td>{event.startDate}</td>
                    <td>{event.endDate}</td>
                    <td>{event.status}</td>
                    <td>
                      <button
                        className="bg-blue-600 text-white active:bg-blue-700 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setViewETHQrCode(event.transactionETH)}
                      >
                        View
                      </button>
                    </td>
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
                      <button
                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={() => setViewETHQrCode("")}
                      >
                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                          ×
                        </span>
                      </button>
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
          {showAddModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Add New Event</h3>
                      <button
                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={() => setshowAddModal(false)}
                      >
                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                          ×
                        </span>
                      </button>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <form className="w-full max-w-lg">
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-1/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Title
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              onChange={(event) =>
                                setNewTitle(event.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Bonus
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="number"
                              onChange={(event) =>
                                setNewBonus(event.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Status
                            </label>
                            <select
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              onChange={(event) =>
                                setNewStatus(event.target.value)
                              }
                            >
                              <option></option>
                              <option>Available</option>
                              <option>Unavailable</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Description
                            </label>
                            <textarea
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              rows="2"
                              onChange={(event) =>
                                setNewDescription(event.target.value)
                              }
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Start Date
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="datetime-local"
                              onChange={(event) =>
                                setNewStartDate(event.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              End Date
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="datetime-local"
                              onChange={(event) =>
                                setNewEndDate(event.target.value)
                              }
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
                        onClick={() => setshowAddModal(false)}
                      >
                        Close
                      </button>
                      <button
                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={createEvent}
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
          {showUpdateModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Update Event</h3>
                      <button
                        className="p-1 ml-auto bg-transparent border-0 text-black opacity-5 float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                        onClick={() => setshowUpdateModal(false)}
                      >
                        <span className="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                          ×
                        </span>
                      </button>
                    </div>
                    {/*body*/}
                    <div className="relative p-6 flex-auto">
                      <form className="w-full max-w-lg">
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-1/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Title
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Bonus
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Status
                            </label>
                            <select
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                            >
                              <option></option>
                              <option>Available</option>
                              <option>Unavailable</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Description
                            </label>
                            <textarea
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              rows="2"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Start Date
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="datetime-local"
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              End Date
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="datetime-local"
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
                        onClick={() => setshowUpdateModal(false)}
                      >
                        Close
                      </button>
                      <button
                        className="bg-emerald-500 text-white active:bg-emerald-600 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setshowUpdateModal(false)}
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
            <Spinner size={100} color="blue" className="Spinner" />
          </div>
        </Overlay>
      </React.Fragment>
    </>
  );
};

export default Event;
