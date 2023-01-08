// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

import "./Roles.sol";

contract GiftExchange is Roleable {
    struct GiftExchangeData {
        string giftId;
        uint256 timestamp;
    }

    mapping(address => GiftExchangeData[]) public giftExchanges;

    constructor() {
        owner = msg.sender;
    }

    function createGiftExchange(address _recipient, string memory _giftId)
        public
        onlyAdminOrManager
    {
        giftExchanges[_recipient].push(
            GiftExchangeData({giftId: _giftId, timestamp: block.timestamp})
        );
    }

    function getGiftExchange(address _recipient)
        public
        view
        returns (GiftExchangeData[] memory)
    {
        return giftExchanges[_recipient];
    }
}
