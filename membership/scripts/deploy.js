const main = async () => {
  let contracts = ["Roleable","Accounts", "Gifts", "Events"];
  for (let i = 0; i < contracts.length; i++) {
    const Contract = await hre.ethers.getContractFactory(contracts[i]);
    const contract = await Contract.deploy();
    console.log(contracts[i] + " deployed to:", contract.address);
  }
};

const runMain = async () => {
  try {
    await main();
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

runMain();
