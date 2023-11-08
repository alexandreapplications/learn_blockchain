let web3Connector;
const contractAddresses = ["0x4d521cbd49289348c270e6ea491e22F806604aD9"];
const contractAbi = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "_articleName",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_articleImageUrl",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "_articleDescription",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "finalBid",
                "type": "uint256"
            }
        ],
        "name": "AuctionEnded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "bid",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "endAuction",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "newBidder",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "newBid",
                "type": "uint256"
            }
        ],
        "name": "HighestBidIncreased",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "previousBidder",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "valueRefunded",
                "type": "uint256"
            }
        ],
        "name": "PreviousBidRefunded",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "newArticleDescription",
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
                "name": "newArticleImageUrl",
                "type": "string"
            }
        ],
        "name": "setArticleImageUrl",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
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
        "name": "auctionEnded",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
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

async function getMessage(containerName, contractAddress) {
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);

    const articleName = await contract.methods.articleName().call();
    $(`${containerName} .articleName`).text(articleName)

    const articleDescription = await contract.methods.articleDescription().call();
    $(`${containerName} .articleDescription`).text(articleDescription)

    const highestBid = await contract.methods.highestBid().call();
    $(`${containerName} .highestBidSpan`).text(highestBid)
    $(`${containerName} .highestBidText`).val(highestBid)

    const highestBidder = await contract.methods.highestBidder().call();
    $(`${containerName} .highestBidderSpan`).text(highestBidder)
    $(`${containerName} .highestBidderText`).val(highestBidder)

    const auctionEnded = await contract.methods.auctionEnded().call();
    if (auctionEnded) {
        $(`${containerName} .auctionEnded`).show()
        $(`${containerName} .auctionOpen`).hide()
    } else {
        $(`${containerName} .auctionEnded`).hide()
        $(`${containerName} .auctionOpen`).show()
    }

    const imageUrl = await contract.methods.articleImageUrl().call();
    $(`${containerName} .imageUrl`).attr('src', imageUrl)

    $(`${containerName} .contractAddress`).val(contractAddress)
}

function submitBid(sender) {
    bidValue = $(".bidValue", sender).val()
    contractAddress = $(".contractAddress", sender).val()
    doBid(contractAddress, bidValue).then(() => {
        alert("Funcionou")
    })
    return false
}

async function setArticleDescription(containerName, contractAddress) {
    const articleDescription = $(`${containerName} .articleDescription`).text();
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.setArticleDescription(articleDescription).send({ from: contractAddress });
}

async function doAuctionEnd(contractAddress) {
    const account = selectedAccount();
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.endAuction().send({ from: account });

}

async function doBid(contractAddress, bidValue) {
    const weis = web3Connector.utils.toWei(bidValue, "finney");

    const account = selectedAccount();
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.bid().send({ from: account, value: weis });
}

$(document).ready(function () {
    connectToWallet();
    getMessage('#audition', contractAddresses[0]);
})