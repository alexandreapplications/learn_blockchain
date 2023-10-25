let web3Connector;
const contractAddress = "0x876301501b019286Ed6c5198675756f8cd743545";
const contractAbi = [
    {
        "inputs": [],
        "name": "bid",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "payOwner",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_newArticleDescription",
                "type": "string"
            }
        ],
        "name": "setArticleDescription",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_newArticleImageUrl",
                "type": "string"
            }
        ],
        "name": "setArticleImageUrl",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_newArticleName",
                "type": "string"
            }
        ],
        "name": "setArticleName",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "initialArticleName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "initialArticleImageUrl",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "initialArticleDescription",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "inputs": [],
        "name": "articleDescription",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "articleImageUrl",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "articleName",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "highestBid",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "highestBidder",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

async function connectToWallet() {
    // Initialize web3.js connector
    web3Connector = new Web3(window.ethereum);

    const accounts = await window.ethereum.request({
        method: "eth_requestAccounts"
    });

    var options = accounts.map(element => {
        return `<option value="${element}">Account: ${element}</option>`
    });

    $("#accounts").html(options);

    updateAccountValues();
}

function updateAccountValues() {
    $("#accounts option").each((idx, obj) => {
        accountName = $(obj).val();
        getBalance(accountName).then((balance) => {
            $(obj).text(`Account: ${accountName} - Balance: ${balance}`);
        });
    })
}

function selectedAccount() {
    return $("#accounts").val();
}

async function getBalance(account) {
    const balance = await web3Connector.eth.getBalance(account);

    return web3Connector.utils.fromWei(balance, "ether");
}

async function getMessage() {
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    const articleName = await contract.methods.articleName().call();
    const elementMessage0 = document.getElementById("articleName");
    elementMessage0.innerText = articleName;
    const setArticleNameText = document.getElementById("setArticleNameText");
    setArticleNameText.value = articleName

    const articleDescription = await contract.methods.articleDescription().call();
    const elementMessage1 = document.getElementById("articleDescription");
    elementMessage1.innerText = articleDescription;
    const setArticleDescriptionText = document.getElementById("setArticleDescriptionText");
    setArticleDescriptionText.value = articleDescription;

    const highestBid = await contract.methods.highestBid().call();
    const highestBidSpan = document.getElementById("highestBidSpan");
    highestBidSpan.innerText = highestBid;

    const highestBidder = await contract.methods.highestBidder().call();
    const highestBidderSpan = document.getElementById("highestBidderSpan");
    highestBidderSpan.innerText = highestBidder;

    const imageUrl = await contract.methods.articleImageUrl().call();
    const imageUrl2 = document.getElementById("imageUrl2");
    imageUrl2.src = imageUrl;
    const setImageUrlText = document.getElementById("setImageUrlText");
    setImageUrlText.value = imageUrl;
}

async function setArticleDescription() {
    const setArticleDescriptionText = document.getElementById("setArticleDescriptionText");
    const articleDescription = setArticleDescriptionText.value;
    alert("Article Description: " + articleDescription);

    const elementAccount = document.getElementById("account");
    const account = elementAccount.innerText;
    alert("Account Description: " + account);
    alert("Contract Address: " + contractAddress);

    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.setArticleDescription(articleDescription).send({ from: account });
}

async function doBid() {
    const bidValue = document.getElementById("bidValue").value;

    const weis = web3Connector.utils.toWei(bidValue, "finney");

    const elementAccount = document.getElementById("account");
    const account = elementAccount.innerText;
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.bid().send({ from: account, value: weis });
}

$(document).ready(function() {
    connectToWallet();
})