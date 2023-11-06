let web3Connector;
const contractAddresses = ["0x876301501b019286Ed6c5198675756f8cd743545"];
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
    
    const imageUrl = await contract.methods.articleImageUrl().call();
    $(`${containerName} .imageUrl`).attr('src', imageUrl)
    
    $(`${containerName} .contractAddress`).val(contractAddress)
    
    $(`${containerName} .bidButton`).click(function() {
        const bidValue = $(`${containerName} .bidValue`).val()
        doBid(contractAddress, bidValue)
    })
    $(`${containerName} .refreshBtn`).click(function() {
        getMessage(containerName, contractAddress)
    }).text("Refresh")
    $(`${containerName} .editBtn`).click(function() {
        setEditable(containerName, contractAddress)
    })

    $(`${containerName} .refreshBtn`).text("Refresh")
    $(`${containerName} .saveBtn`).hide()
    $(`${containerName} .editBtn`).show()
    $(`${containerName} .articleDescription`).attr("disabled", "disabled")

}

async function setEditable(containerName, contractAddress) {
    $(`${containerName} .articleDescription`).removeAttr("disabled")
    $(`${containerName} .editBtn`).hide()
    $(`${containerName} .refreshBtn`).text("Cancel")
    $(`${containerName} .saveBtn`).show()
    $(`${containerName} .saveBtn`).click(function() {
        setArticleDescription(containerName, contractAddress)
        getMessage(containerName, contractAddress)
    })
}

async function setArticleDescription(containerName, contractAddress) {
    const articleDescription = $(`${containerName} .articleDescription`).text();
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.setArticleDescription(articleDescription).send({ from: contractAddress });
}

async function doBid(contractAddress, bidValue) {
    const weis = web3Connector.utils.toWei(bidValue, "finney");

    const account = selectedAccount();
    const contract = new web3Connector.eth.Contract(contractAbi, contractAddress);
    await contract.methods.bid().send({ from: account, value: weis });
}

$(document).ready(function() {
    connectToWallet();
    getMessage('#audition', contractAddresses[0]);
})