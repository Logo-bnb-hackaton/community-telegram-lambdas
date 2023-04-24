'use strict'

const ethers = require("ethers");
const subscriptionContractABI = require("../abis/subscription.json")
const subscriptionContractAddress = "0xe56e5FD2D7aeAde39B04EFb41992a233948D304e";
const networkRpc = "https://data-seed-prebsc-1-s3.binance.org:8545";

const startListenEventsFromSubscriptionContract = async () => {
    
    console.log("Start listening new subscription events");
    
    let provider = new ethers.providers.JsonRpcProvider(networkRpc);
    
    let contract = new ethers.Contract(subscriptionContractAddress, subscriptionContractABI, provider);

    contract.on("NewSubscription", (from, to, value, event) => {
        console.log(`New subscription event received from ${from}`)
        console.log(`New ${event}`);
    });
}

startListenEventsFromSubscriptionContract()