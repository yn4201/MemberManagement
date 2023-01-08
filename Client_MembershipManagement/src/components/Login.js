import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ethers } from "ethers";
import abi from "../utils/Accounts.json";

import { Spinner, Overlay } from "evergreen-ui";

const Login = () => {
  const contractAddress = "0x441DCDD469F7d30C3e1294dAC5E62da96b6Af0BD";
  const contractABI = abi.abi;
  const [currentAccount, setCurrentAccount] = useState("");
  const [isFalse, setIsFalse] = useState("");
  const [loading, setLoading] = useState(false);

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

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const navigate = useNavigate();

  const handleAuth = async () => {
    try {
      if (currentAccount === null) {
        connectWallet();
      } else {
        setLoading(true);
        const checkRole = await checkPermission();
        console.log(checkRole);
        if (checkRole) {
          alert(
            "Login Success",
            navigate("/home/dashboard", { replace: true })
          );
        } else {
          alert("You don't have permission ", window.location.reload());
          setLoading(false);
        }
      }
    } catch (error) {}
  };

  useEffect(() => {
    connectWallet();
  }, []);

  return (
    <>
      <div className="flex h-screen w-screen justify-center items-center bg-gradient-to-r from-sky-500 to-blue-500">
        {!currentAccount && (
          <div className="w-1/2 h-1/2 border-2 flex justify-center items-center rounded-xl bg-gray-100 bg-[url('./images/login.png')] bg-cover">
            <button
              className=" bg-blue-600 border-none text-white rounded-2xl w-1/3 h-20 text-2xl font-bold text-center"
              onClick={connectWallet}
            >
              Connect Wallet
            </button>
          </div>
        )}
        {currentAccount && (
          <div className="w-1/2 h-1/2 border-2 flex justify-center items-center rounded-xl bg-gray-100 bg-[url('./images/login.png')] bg-cover">
            <button
              className=" bg-blue-600 border-none text-white p-5 rounded-2xl w-1/4 h-20 text-2xl font-bold"
              onClick={handleAuth}
            >
              Login
            </button>
          </div>
        )}
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

export default Login;
