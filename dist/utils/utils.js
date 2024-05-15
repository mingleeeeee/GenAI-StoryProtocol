"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintContractApi = exports.CurrencyAddress = exports.RPCProviderUrl = exports.NFTContractAddress = exports.NonCommercialSocialRemixingTermsId = void 0;
// Set up your wallet for this tutorial.
// - Add your private key to your .env file.
// - Add your rpc provider url to your .env file
//      - We recommend the Sepolia test network: https://rpc.ankr.com/eth_sepolia
// This is a pre-configured PIL Flavor: https://docs.storyprotocol.xyz/docs/pil-flavors
exports.NonCommercialSocialRemixingTermsId = '2';
// A NFT contract address that will be used to represent your IP Assets
exports.NFTContractAddress = '0x7ee32b8B515dEE0Ba2F25f612A04a731eEc24F49';
// Sepolia testnet. You can provide your own by going to Alchemy, creating a test Sepolia app,
// and get a free RPC provider URL.
exports.RPCProviderUrl = 'https://ethereum-sepolia-rpc.publicnode.com';
// Mock token contract for paying License Token
exports.CurrencyAddress = '0xB132A6B7AE652c974EE1557A3521D53d18F6739f';
exports.mintContractApi = {
    inputs: [{ internalType: 'address', name: 'to', type: 'address' },
        { internalType: 'string', name: 'customUri', type: 'string' }
    ],
    name: 'mint',
    outputs: [{ internalType: 'uint256', name: 'tokenId', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
};
