


"use client";


export default function Header({account, contractsChainId}) {

        
        return (
                <div>
                        <p>
                        {account.getChainId() === contractsChainId ? 'bg-green-500' : 'bg-red-500'}
                        </p>
                        <div>
                        {
                        account.getChainId()
                        }
                        </div>
                        <p>
                        {contractsChainId}
                        </p>
                </div>
        )}
                

