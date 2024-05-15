"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mintNFT = void 0;
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const utils_1 = require("./utils");
function mintNFT() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log('Minting a new NFT...');
        const walletClient = (0, viem_1.createWalletClient)({
            account: utils_1.account,
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(utils_1.RPCProviderUrl),
        });
        const publicClient = (0, viem_1.createPublicClient)({
            chain: chains_1.sepolia,
            transport: (0, viem_1.http)(utils_1.RPCProviderUrl),
        });
        const { request } = yield publicClient.simulateContract({
            address: utils_1.NFTContractAddress,
            functionName: 'mint',
            args: [utils_1.account.address],
            abi: [utils_1.mintContractApi],
        });
        const hash = yield walletClient.writeContract(request);
        console.log(`Minted NFT successful with hash: ${hash}`);
        const receipt = yield publicClient.waitForTransactionReceipt({ hash });
        const tokenId = Number(receipt.logs[0].topics[3]).toString();
        console.log(`Minted NFT tokenId: ${tokenId}`);
        return tokenId;
    });
}
exports.mintNFT = mintNFT;
