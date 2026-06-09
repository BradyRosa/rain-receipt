// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract RainReceipt {
    mapping(address => uint256) public userDrizzles;
    mapping(address => uint256) public userUmbrellas;
    mapping(address => uint256) public userClears;

    uint256 public totalDrizzles;
    uint256 public totalUmbrellas;
    uint256 public totalClears;

    event DrizzleLogged(address indexed user, uint256 userDrizzles, uint256 totalDrizzles);
    event UmbrellaOpened(address indexed user, uint256 userUmbrellas, uint256 totalUmbrellas);
    event SkyCleared(address indexed user, uint256 userClears, uint256 totalClears);

    function logDrizzle() external {
        unchecked {
            userDrizzles[msg.sender] += 1;
            totalDrizzles += 1;
        }

        emit DrizzleLogged(msg.sender, userDrizzles[msg.sender], totalDrizzles);
    }

    function openUmbrella() external {
        unchecked {
            userUmbrellas[msg.sender] += 1;
            totalUmbrellas += 1;
        }

        emit UmbrellaOpened(msg.sender, userUmbrellas[msg.sender], totalUmbrellas);
    }

    function clearSky() external {
        unchecked {
            userClears[msg.sender] += 1;
            totalClears += 1;
        }

        emit SkyCleared(msg.sender, userClears[msg.sender], totalClears);
    }
}
