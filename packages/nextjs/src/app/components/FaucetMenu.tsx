"use client";

import { DropdownMenu, Button } from '@radix-ui/themes';
import { CaretDownIcon } from '@radix-ui/react-icons';

export default function FaucetMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="outline">
          Faucet <CaretDownIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
      
        <DropdownMenu.Item>
          <a href="https://faucet.goerli.starknet.io/" target="_blank" rel="noopener noreferrer">
            Goerli
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <a href="https://starknet-faucet.vercel.app/" target="_blank" rel="noopener noreferrer">
            Sepolia
          </a>
        </DropdownMenu.Item>
        <DropdownMenu.Item>
          <a className=" p-2 rounded hover:text-black" href="https://www.ledger.com/academy/what-is-a-crypto-faucet" target="_blank" rel="noopener noreferrer">What´s Faucet? 🌟
          </a>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}