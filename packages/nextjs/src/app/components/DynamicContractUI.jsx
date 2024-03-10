"use client";
import { useEffect, useState } from "react";
import result from "../../contracts/result.json";
import { connect, disconnect } from "starknetkit";
import { Contract } from "starknet";
import { Button, TextField } from "@radix-ui/themes";
import { useUser } from "@/contexts/userContenxt";
import { constants, RpcProvider } from "starknet";
import { Reload } from "@radix-ui/themes";
import { WalletState } from "./WalletState";
const networkChainIds = [
  { network: 'mainnet', chainId: '0x534e5f4d41494e' },
  { network: 'goerli', chainId: '0x534e5f474f45524c49' },
  { network: 'sepolia', chainId: '0x534e5f5345504f4c4941' },
];

const ContractPlayground = ({ contractDefinition }) => {
  const [inputValues, setInputValues] = useState({});
  const [provider, setProvider] = useState(null);
  const [contractInstance, setContractInstance] = useState(null);
  const [lastConsultResponse, setLastConsultResponse] = useState(null);
  
  const userContext = useUser();

  
  
  const handleInputChange = (functionName, inputName, value) => {
    setInputValues((prevValues) => ({
      ...prevValues,
      [functionName]: {
        ...prevValues[functionName],
        [inputName]: value,
      },
    }));
    console.log("inputValues", inputValues);
  };

  useEffect(() => {
    if (contractDefinition.rpc_endpoint) {
      console.log("Contract address:", contractDefinition.address);
      let tempProvider = new RpcProvider({
        nodeUrl: contractDefinition.rpc_endpoint,
        //chainId: constants.StarknetChainId.SN_GOERLI,
      });
      console.log("Provider set with the following endpoint:", contractDefinition.rpc_endpoint);
      setProvider(tempProvider);
    }
  }, [contractDefinition]);

  useEffect(() => {
    if (userContext.account) {
      console.log("Contract address:", contractDefinition.address);
      let contractInstance = new Contract(
        contractDefinition.abi,
        contractDefinition.address,
        userContext.account
      );
       // Get the raw chainId
    userContext.account.provider.getChainId().then((chainId) => {
      console.log("Raw ChainId:", chainId);
    });
      setContractInstance(contractInstance);
    }
  }, [userContext.isLoggedIn, contractDefinition]);

  const handleFunctionCall = async (functionName) => {
    if (!contractInstance) {
      console.error(
        "Contract instance is undefined. Please connect the wallet first."
      );
      return;
    }

    console.log("Calling function:", functionName);

    const functionAbi = contractDefinition.abi
      .filter((item) => item.type === "interface")
      .flatMap((interfaceItem) => interfaceItem.items)
      .find((item) => item.type === "function" && item.name === functionName);

    if (!functionAbi) {
      console.error(`Function ${functionName} not found in the contract ABI.`);
      return;
    }

    {
      /* Check that user is connected */
    }
    if (!userContext.account) {
      console.error("User is not connected. Please connect the wallet first.");
      return;
    }

    const functionInputs = inputValues[functionName] || {};

    if (functionAbi.state_mutability === "view") {
      try {
        const result = await contractInstance[functionName](
          ...Object.values(functionInputs)
        );
        setLastConsultResponse({
          functionName,
          result,
        });
        console.log(`Result of ${functionName}:`, result);
      } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
      }
    } else {
      try {
        console.log("contractDefinition.address", contractDefinition.address);
        console.log("functionName", functionName);
        console.log("functionInputs", functionInputs);
        const tx = await userContext.account.execute(
          {
            contractAddress: contractDefinition.address,
            entrypoint: functionName,
            calldata: Object.values(functionInputs),
          },
          undefined,
          { maxFee: constants.DEFAULT_MAX_FEE }
        );
        await provider.waitForTransaction(tx.transaction_hash);
        console.log(
          `Transaction hash of ${functionName}:`,
          tx.transaction_hash
        );
      } catch (error) {
        console.error(`Error calling ${functionName}:`, error);
      }
    }
  };

  return (
    <div className="card w-96 bg-base-100 shadow-xl text-justify-center ">
      <div className="flex row">
        <h2 className="text-2xl font-bold ba card-title inear-gradient(rgb(136, 108, 241) 55.41%, rgb(67, 41, 166) 100%) padding-box text">Contract Playground</h2>
      </div>

      {/* Contract and network info */}
         {/* Contract and network info */}
    <div className="bg-gray-100 p-4 rounded-lg mb-4">
      <p className="mb-2">
        Contract Address:{' '}
        <a
          href={`https://${contractDefinition.network}.voyager.online/contract/${
            contractDefinition.address.startsWith('0x0')
              ? contractDefinition.address
              : '0x0' + contractDefinition.address.slice(2)
          }`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {contractDefinition.address}
        </a>
      </p>
      <p className="mb-2">Network: {contractDefinition.network}</p>
      <p>
        Connected to wallet:{' '}
        {userContext.address
          ? `${userContext.address.substring(0, 4)}...${userContext.address.substring(
              userContext.address.length - 4
            )}`
          : 'Not connected'}
        {userContext.account && (
          <>
          <span
            className={`inline-block w-2 h-2 rounded-full ml-2 ${
              networkChainIds.find(
                (item) => item.network === contractDefinition.network
              )?.chainId === userContext.account
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
          />
          <div>
            {
              networkChainIds.find(
                (item) => item.network === contractDefinition.network
              )?.chainId
            }
          </div>
         
          {/*
          <WalletState
        account={userContext.account}
        contractsChainId={networkChainIds.find(
          (item) => item.network === contractDefinition.network
        )?.chainId}></WalletState>
          */}
          </>
        )}
      </p>
    </div>
      {contractDefinition.abi
        .filter((item) => item.type === "interface")
        .flatMap((interfaceItem) => interfaceItem.items)
        .filter((item) => item.type === "function")
        .map((functionItem) => (
          <div
            key={functionItem.name}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "5px",
              flexDirection: "column",
            }}
          >
            <h3>{functionItem.name}</h3>
            {functionItem.inputs.map((input) => (
              <div key={input.name}>
                <h3 htmlFor={input.name} className="badge-ghost badge">
                  {input.name}
                </h3>

                <TextField.Input
                  type="text"
                  id={input.name}
                  onChange={(e) =>
                    handleInputChange(
                      functionItem.name,
                      input.name,
                      e.target.value
                    )
                  }
                />
              </div>
            ))}
            <Button
              className="btn-sm bg-primary flex space-x-4"
              onClick={() => handleFunctionCall(functionItem.name)}
            >
              {functionItem.inputs == 0 ? "Consult" : "Transact"}
            </Button>
            {lastConsultResponse &&
              functionItem.name == lastConsultResponse.functionName && (
                <div style={{ display: "flex", alignItems: "center" }}>
                  <svg
                    strokeWidth="2px"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    role="img"
                    version="1.1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    className="sc-iGgWBj Ixkvr"
                  >
                    <path
                      d="M15 10L20 15L15 20"
                      stroke="#4B4B4B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                    <path
                      d="M4 4V11C4 12.0609 4.42143 13.0783 5.17157 13.8284C5.92172 14.5786 6.93913 15 8 15H20"
                      stroke="#4B4B4B"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    ></path>
                  </svg>
                  <div>{String(lastConsultResponse.result)}</div>
                </div>
              )}
          </div>
        ))}
    </div>
  );
};

export default function DynamicContractUI() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <ContractPlayground contractDefinition={result} />
    </main>
  );
}