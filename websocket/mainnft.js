'use strict'

const ethers = require("ethers");

const mainNftAbi = require("../abis/mainnft.json")
const mainNftContractAddress = "0xA3b157a0c84c00AA6260F3cd06cE8746541aA8aB"
const networkRpc = "https://data-seed-prebsc-1-s3.binance.org:8545";

const startListenEventsFromMainNftContract = async () => {

    let provider = new ethers.providers.JsonRpcProvider(networkRpc);
    
    let contract = new ethers.Contract(mainNftContractAddress, mainNftAbi, provider);

    contract.on("NewPaymentSessionCreated", (from, to, value, event) => {
        console.log(`New payment session event received from ${from}`)
        console.log(`New ${event}`);
    });

}

startListenEventsFromMainNftContract();