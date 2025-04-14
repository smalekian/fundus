// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./Utils.sol";

contract Crowdfunding is Ownable {
    using Utils for uint;

    enum State {
        Ongoing,
        Failed,
        Succeeded,
        PaidOut
    }

    event CampaignFinished(address addr, uint totalCollected, bool succeeded);

    string public name;
    uint public targetAmount;
    uint public fundingDeadline;
    address payable public beneficiary;
    State public state;
    mapping(address => uint) public amounts;
    bool public collected;

    modifier inState(State requiredState) {
        require(requiredState == state, "Incorrect crowdfunding state");
        _;
    }

    constructor(
        string memory campaignName,
        uint targetAmountEth,
        uint durationInMin,
        address payable beneficiaryAddress
    ) Ownable(msg.sender) {
        name = campaignName;
        targetAmount = targetAmountEth.etherToWei();
        fundingDeadline = currentTime() + durationInMin.minutesToSeconds();
        beneficiary = beneficiaryAddress;
        state = State.Ongoing;

        transferOwnership(beneficiary);
    }

    receive() external payable inState(State.Ongoing) {
        require(beforeDeadline(), "Deadline has passed");
        amounts[msg.sender] += msg.value;
        if (totalCollected() >= targetAmount) {
            collected = true;
        }
    }

    function collect() public inState(State.Succeeded) {
        if (beneficiary.send(totalCollected())) {
            state = State.PaidOut;
        } else {
            state = State.Failed;
        }
    }

    function withdraw() public inState(State.Failed) {
        require(
            amounts[msg.sender] > 0,
            "Caller did not contribute to campaign"
        );
        uint contributed = amounts[msg.sender];
        amounts[msg.sender] = 0;
        payable(msg.sender).transfer(contributed);
    }

    function cancelCrowdfunding() public inState(State.Ongoing) onlyOwner {
        require(beforeDeadline(), "Deadline has passed");

        state = State.Failed;
    }

    function finishCampaign() public inState(State.Ongoing) {
        require(afterDeadline(), "Deadline has not passed");

        if (!collected) {
            state = State.Failed;
        } else {
            state = State.Succeeded;
        }
        emit CampaignFinished(address(this), totalCollected(), collected);
    }

    function beforeDeadline() public view returns (bool) {
        return currentTime() < fundingDeadline;
    }

    function afterDeadline() internal view returns (bool) {
        return !beforeDeadline();
    }

    function totalCollected() public view returns (uint) {
        return address(this).balance;
    }

    function currentTime() private view returns (uint) {
        return block.timestamp;
    }
}
