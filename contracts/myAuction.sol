// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyAction {
    string public articleName;
    string public articleImageUrl;
    string public articleDescription;
    address auctionOwner;
    address public highestBidder;
    uint256 public highestBid;

    // events
    event HighestBidIncreased (address newBidder, uint256 newBid);
    event PreviousBidRefunded (address previousBidder, uint256 valueRefunded);
    event AuctionEnded (address winner, uint256 finalBid);

    constructor(
        string memory _articleName,
        string memory _articleImageUrl,
        string memory _articleDescription
    ) {
        articleName = _articleName;
        articleImageUrl = _articleImageUrl;
        articleDescription = _articleDescription;
        auctionOwner = msg.sender;
    }
    modifier onlyOwner() {
        require(msg.sender == auctionOwner, "You are not the owner");
        _;
    }
    function bid() public payable {
        require(msg.value > 0, "Valor tem que ser maior que ZERO");
        require(
            msg.value > highestBid,
            "Valor tem que ser maior que montante existente"
        );

        if (highestBid > 0) {
            // Transfer amount from contract's balance to the previous sender
            emit PreviousBidRefunded(highestBidder, highestBid);
            payable(highestBidder).transfer(highestBid);
        }
        // Store new values
        highestBid = msg.value;
        highestBidder = msg.sender;
        emit HighestBidIncreased(highestBidder, highestBid);
    }
    function payOwner() public payable onlyOwner {
        address contractAddress = address(this);
        uint256 contractBalance = contractAddress.balance;
        require(contractBalance > 0, "Balance is 0");
        payable(auctionOwner).transfer(contractBalance);
        emit AuctionEnded(highestBidder, highestBid);
        // Reset value since we now transfered the whole balance
        highestBid = 0;
    }
    function setArticleDescription(string memory newArticleDescription)
        public
        onlyOwner
    {
        articleDescription = newArticleDescription;
    }

    function setArticleImageUrl(string memory newArticleImageUrl) public {
        articleImageUrl = newArticleImageUrl;
    }
}
