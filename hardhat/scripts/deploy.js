const { ethers } = require("hardhat");

async function main() {

    const whitelistContract = await ethers.getContractFactory("Whitelist");
    const deployedWhitelistContract = await whitelistContract.deploy(4);

    await deployedWhitelistContract.deployed();

    console.log("Whitelist Contract Address:", deployedWhitelistContract.address);
    //0xe28EA7ee81dCA245770ffcBEa50DaAc38A1a8B0B
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });