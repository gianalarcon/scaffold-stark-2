const {
  Provider,
  Account,
  Contract,
  json,
  stark,
  uint256,
  shortString,
  RpcProvider,
  hash,
} = require("starknet");

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
dotenv.config();

const network = process.argv[2] || "sepolia"; // Get the network name from the command line, default to "sepolia"

const providerUrl = network === "goerli" ? process.env.RPC_URL_GOERLI : process.env.RPC_URL_SEPOLIA;
const privateKey = network === "goerli" ? process.env.PRIVATE_KEY_0 : process.env.ACCOUNT_SEPOLIA_PRIVATE_KEY;
const accountAddress = network === "goerli" ? process.env.ACCOUNT_0_ADDRESS : process.env.ACCOUNT_SEPOLIA;

const provider = new RpcProvider({
  nodeUrl: providerUrl,
});

const account0 = new Account(provider, accountAddress, privateKey, 1);

const deployContract = async (contractName) => {
  const compiledContractCasm = JSON.parse(
    fs
      .readFileSync(
        path.resolve(
          __dirname,
          `../target/dev/contracts_${contractName}.compiled_contract_class.json`
        )
      )
      .toString("ascii")
  );

  const compiledContractSierra = JSON.parse(
    fs
      .readFileSync(
        path.resolve(
          __dirname,
          `../target/dev/contracts_${contractName}.contract_class.json`
        )
      )
      .toString("ascii")
  );

  let classHash;
  let existingClass;
  let contractAddress;
  try {
    const tryDeclareAndDeploy = await account0.declareAndDeploy({
      contract: compiledContractSierra,
      casm: compiledContractCasm,
    });
    await provider.waitForTransaction(
      tryDeclareAndDeploy.deploy.transaction_hash
    );
    classHash = tryDeclareAndDeploy.declare.class_hash;
    existingClass = await provider.getClassByHash(classHash);
    contractAddress = tryDeclareAndDeploy.deploy.address;
  } catch (e) {
    console.log("Error", e);
  }
  return {
    classHash: classHash,
    abi: json.stringify(existingClass.abi),
    address: contractAddress,
  };
};

const deployScript = async () => {
  const {
    classHash: helloStarknetClassHash,
    abi: helloStarknetAbi,
    address: ContractAddress,
  } = await deployContract("HelloStarknet");
  console.log("HelloStarknet Class Hash", helloStarknetClassHash);
  console.log("HelloStarknet ABI", helloStarknetAbi);
  console.log("HelloStarknet Address", ContractAddress);
};

deployScript()
  .then(() => {
    console.log("All Setup Done");
  })
  .catch(console.error);
