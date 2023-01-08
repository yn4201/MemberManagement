// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Roles.sol";

contract CheckInEvent is Roleable {
    struct CheckInData {
        string eventId;
        uint256 timestamp;
        uint256 amount;
    }

    mapping(address => CheckInData[]) public checkInEvents;

    constructor() {
        owner = msg.sender;
    }

    function createCheckInEvent(address _participant, string memory _eventId)
        public
        onlyAdminOrManager
    {
        checkInEvents[_participant].push(
            CheckInData({eventId: _eventId, timestamp: block.timestamp, amount: 1})
        );
    }

    function getCheckInEvent(address _participant)
        public
        view
        onlyAdminOrManager
        returns (CheckInData[] memory)
    {
        return checkInEvents[_participant];
    }
}
