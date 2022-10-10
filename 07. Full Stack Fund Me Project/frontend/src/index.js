import { ethers } from "./ethers-5.6.esm.min.js";
import { abi, contractAddress } from "./constants.js";

let connectButtonElement = document.querySelector("#connect-btn");
let fundButtonElement = document.querySelector("#fund-btn");
let balanceButtonElement = document.querySelector("#balance-btn");
let withdrawButtonElement = document.querySelector("#withdraw-btn");

connectButtonElement.addEventListener("click", async () => {
  if (typeof window.ethereum != "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("Connected!");
    connectButtonElement.textContent = "Connected!";
    connectButtonElement.classList.add("disabled");
  } else {
    connectButtonElement.textContent = "Please install MetaMask!";
  }
});

// fund function
fundButtonElement.addEventListener("click", async (e) => {
  let amount = document.querySelector("#fund-amount-input").value.toString();

  if (typeof window.ethereum != "undefined") {
    console.log(`Funding with ${amount}...`);
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(amount),
      });

      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error.message);
      alert("Transaction was rejected!");
    }
  } else {
    connectButtonElement.textContent = "Please install MetaMask!";
  }
});

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    try {
      provider.once(transactionResponse.hash, (transactionReceipt) => {
        console.log(
          `Completed with ${transactionReceipt.confirmations} confirmations. `
        );
        resolve();
      });
    } catch (error) {
      reject(error);
    }
  });
}

balanceButtonElement.addEventListener("click", async () => {
  if (typeof window.ethereum != "undefined") {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);

      const balance = await provider.getBalance(contractAddress);
      console.log(ethers.utils.formatEther(balance).toString());

      let balanceSpanElement = document.querySelector("#balance-span");
      balanceSpanElement.textContent = ethers.utils
        .formatEther(balance)
        .toString();
    } catch (error) {
      console.log(error.message);
    }
  } else {
    connectButtonElement.textContent = "Please install MetaMask!";
  }
});

withdrawButtonElement.addEventListener("clcik", async () => {
  if (typeof window.ethereum != "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    // await provider.send("eth_requestAccoounts", []);

    console.log("Withdrawing...");
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);

      await transactionResponse.wait(1);

      console.log("Done!");
    } catch (error) {
      console.log(error.message);
    }
  } else {
    connectButtonElement.textContent = "Please install MetaMask!";
  }
});
