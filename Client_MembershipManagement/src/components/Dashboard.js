import React, { useEffect, useState } from "react";
import * as MdIcons from "react-icons/md";
import QRCode from "react-qr-code";
import ReactPaginate from "react-paginate";
import { Spinner, Overlay } from "evergreen-ui";

import { db } from "../configs/firebase";
import { collection, getDocs, addDoc, onSnapshot } from "firebase/firestore";

import { ethers } from "ethers";
import abi from "../utils/Accounts.json";

function Dashboard() {
  const contractAddress = "0x441DCDD469F7d30C3e1294dAC5E62da96b6Af0BD";
  const contractABI = abi.abi;

  const [showAddModal, setshowAddModal] = useState(false);
  const [showUpdateModal, setshowUpdateModal] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isFalse, setIsFalse] = useState("");
  const [currentAccount, setCurrentAccount] = useState("");
  const [transactionETH, setTransactionETH] = useState("");

  // const [currentItems, setCurrentItems] = useState(null);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 4;

  const membersCollectionRef = collection(db, "members");
  const [members, setMembers] = useState([]);
  const [newID, setNewID] = useState("");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [newBalance, setNewBalance] = useState(0);
  const [newDob, setNewDob] = useState("");
  const [newJoinDate, setNewJoinDate] = useState("");
  const [viewETHQrCode, setViewETHQrCode] = useState("");

  const connectToBlockChain = async () => {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, contractABI, signer);
    return contract;
  };

  const checkPermission = async () => {
    const contract = await connectToBlockChain();
    const checkRole = await contract.checkOwnerOrAdminOrManager(currentAccount);
    setIsFalse(checkRole);
    return checkRole;
  };

  const dateAdded = Date.now().toString();

  function dateFormat() {
    let date = new Date();
    let dateIn = date.toISOString().split("T")[0];
    let dateFormated = dateIn.split("-").reverse().join("/");
    return dateFormated;
  }

  const connectWallet = async () => {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setCurrentAccount(accounts[0]);
  };

  function pagination() {
    const endOffset = itemOffset + itemsPerPage;
    console.log(`Loading items from ${itemOffset} to ${endOffset}`);
    setMembers(members.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(members.length / itemsPerPage));
  }

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % members.length;
    console.log(
      `User requested page number ${event.selected}, which is offset ${newOffset}`
    );
    setItemOffset(newOffset);
  };

  const getMembers = async () => {
    try {
      setLoading(true);
      const membersCollection = await getDocs(membersCollectionRef);
      const membersData = membersCollection.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMembers(membersData);
      setLoading(false);
    } catch (error) {
      console.log(error);
      setLoading(false);
    }

    // const data = onSnapshot(membersCollectionRef, (snapshot) => {
    //   const members = [];
    //   snapshot.forEach((doc) => {
    //     members.push({ ...doc.data(), id: doc.id });
    //   });
    //   setMembers(members);
    // });
  };

  const createMember = async () => {
    const contract = await connectToBlockChain();
    const checkRole = await checkPermission();

    setLoading(true);
    try {
      if (checkRole) {
        let transaction = await contract.createAccount(
          newName,
          newEmail,
          newRole,
          newBalance,
          newDob,
          newJoinDate
        );
        await transaction.wait();
        setTransactionETH(transaction.hash);

        await addDoc(membersCollectionRef, {
          name: newName,
          email: newEmail,
          role: newRole,
          balance: newBalance,
          dob: newDob,
          joinDate: newJoinDate,
          deployAddress: currentAccount,
          transactionETH: transaction.hash,
        });
        setLoading(false);
        setshowAddModal(false);
        alert("Member Added Successfully", window.location.reload());
      }
    } catch (error) {
      console.log(error);
      alert("Transaction Declined");
      setLoading(false);
    }
  };

  useEffect(() => {
    getMembers();
    connectWallet();
    // pagination();
  }, []);

  const onClickViewQrcode = (address) => {
    setViewETHQrCode(address);
  };

  const onCloseViewQrcode = () => {
    setViewETHQrCode("");
  };

  return (
    <>
      <div className="h-auto w-4/5 p-4 border-2 my-16 border-gray-300 rounded-lg mx-auto bg-gray-100">
        <div className="flex w-full h-10 my-3 items-center">
          <div className="w-1/4">
            <div className="font-bold text-xl text-blue-600">Members List</div>
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
          <div className="w-1/4">
            <button
              className="float-right flex justify-center items-center bg-blue-600 text-white active:bg-blue-700 font-bold py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 w-3/5"
              type="button"
              onClick={() => setshowAddModal(true)}
            >
              <MdIcons.MdPersonAddAlt1 className="mr-2 text-xl" />
              <p className="text-base">Add New</p>
            </button>
          </div>
        </div>
        <div className="h-full w-full mt-8 mx-auto">
          <table className="table-fixed w-full mx-auto my-auto border-2 bg-white">
            <thead>
              <tr>
                <th>UID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Balance</th>
                <th>DoB</th>
                <th>Join Date</th>
                <th>Transaction ETH</th>
                {/* <th>Function</th> */}
              </tr>
            </thead>
            <tbody>
              {members.map((member, i) => {
                return (
                  <tr key={i}>
                    <td>{member.id}</td>
                    <td>{member.name}</td>
                    <td>{member.email}</td>
                    <td>{member.balance} P</td>
                    <td>{member.dob}</td>
                    <td>{member.joinDate}</td>
                    <td>
                      <button
                        className="bg-blue-600 text-white active:bg-blue-700 font-bold uppercase text-sm px-4 py-2 rounded shadow hover:shadow-lg outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150"
                        type="button"
                        onClick={() => setViewETHQrCode(member.transactionETH)}
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
          {/* <div>
          <ReactPaginate
            breakLabel="..."
            nextLabel="next >"
            onPageChange={handlePageClick}
            pageRangeDisplayed={3}
            pageCount={pageCount}
            previousLabel="< previous"
            renderOnZeroPageCount={null}
            containerClassName="pagination"
            pageLinkClassName="page-num"
            previousLinkClassName="page-num"
            nextLinkClassName="page-num"
            activeLinkClassName="active"
          />
        </div> */}
          {/* AddModal */}
          {showAddModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Add New Member</h3>
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
                          <div className="w-full md:w-2/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Name
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              placeholder="Name"
                              value={newName}
                              onChange={(event) =>
                                setNewName(event.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Role
                            </label>
                            <div className="relative">
                              <select
                                className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                                value={newRole}
                                onChange={(event) =>
                                  setNewRole(event.target.value)
                                }
                              >
                                <option></option>
                                <option>Admin</option>
                                <option>Manager</option>
                                <option>Member</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-1/2 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Email
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="email"
                              placeholder="abc@gmail.com"
                              value={newEmail}
                              onChange={(event) =>
                                setNewEmail(event.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Balance
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="number"
                              placeholder="0"
                              value={newBalance}
                              onChange={(event) => {
                                setNewBalance(event.target.valueAsNumber);
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Date Join
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="datetime-local"
                              value={newJoinDate}
                              onChange={(event) =>
                                setNewJoinDate(event.target.value)
                              }
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              DoB
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="date"
                              value={newDob}
                              onChange={(event) =>
                                setNewDob(event.target.value)
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
                        onClick={createMember}
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
          {/* UpdateModal */}
          {showUpdateModal ? (
            <>
              <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-20 outline-none focus:outline-none">
                <div className="relative w-auto my-6 mx-auto max-w-3xl">
                  {/*content*/}
                  <div className="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
                    {/*header*/}
                    <div className="flex mx-auto p-5 border-b border-solid border-slate-200 rounded-t">
                      <h3 className="text-3xl font-semibold">Update Member</h3>
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
                          <div className="w-full md:w-2/3 px-3">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Name
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="text"
                              placeholder="Name"
                            />
                          </div>
                          <div className="w-full md:w-1/3 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Role
                            </label>
                            <div className="relative">
                              <select className="block appearance-none w-full bg-gray-200 border border-gray-200 text-gray-700 py-3 px-4 pr-8 rounded leading-tight focus:outline-none focus:bg-white focus:border-gray-500">
                                <option></option>
                                <option>Admin</option>
                                <option>Manager</option>
                                <option>Member</option>
                              </select>
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-6">
                          <div className="w-full md:w-1/2 px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Email
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="email"
                              placeholder="abc@gmail.com"
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3">
                            <label class="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Balance
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 mb-3 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="number"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div className="flex flex-wrap -mx-3 mb-2">
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              Date Join
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="datetime-local"
                            />
                          </div>
                          <div className="w-full md:w-1/2 px-3 mb-6 md:mb-0">
                            <label className="block uppercase tracking-wide text-gray-700 text-xs font-bold mb-2">
                              DoB
                            </label>
                            <input
                              className="appearance-none block w-full bg-gray-200 text-gray-700 border border-gray-200 rounded py-3 px-4 leading-tight focus:outline-none focus:bg-white focus:border-gray-500"
                              type="date"
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
}

export default Dashboard;
