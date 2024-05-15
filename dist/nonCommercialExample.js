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
const core_sdk_1 = require("@story-protocol/core-sdk");
const viem_1 = require("viem");
const utils_1 = require("./utils/utils");
// BEFORE YOU RUN THIS FUNCTION: Make sure to read the README which contains instructions for running this non-commercial example.
const main = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // 1. Set up your Story Config
        //
        // Docs: https://docs.storyprotocol.xyz/docs/typescript-sdk-setup
        const config = {
            account: utils_1.account,
            transport: (0, viem_1.http)(utils_1.RPCProviderUrl),
            chainId: 'sepolia',
        };
        const client = core_sdk_1.StoryClient.newClient(config);
        // 2. Register an IP Asset
        //
        // Docs: https://docs.storyprotocol.xyz/docs/register-an-nft-as-an-ip-asset
        // const tokenId = await mintNFT()
        const registeredIpAssetResponse = yield client.ipAsset.register({
            nftContract: utils_1.NFTContractAddress,
            tokenId: '6464',
            txOptions: { waitForTransaction: true },
        });
        console.log(`Root IPA created at transaction hash ${registeredIpAssetResponse.txHash}, IPA ID: ${registeredIpAssetResponse.ipId}`);
        // 3. Attach License Terms to IP
        //
        // Docs: https://docs.storyprotocol.xyz/docs/attach-terms-to-an-ip-asset
        try {
            const attachLicenseTermsResponse = yield client.license.attachLicenseTerms({
                licenseTermsId: utils_1.NonCommercialSocialRemixingTermsId,
                ipId: registeredIpAssetResponse.ipId,
                txOptions: { waitForTransaction: true },
            });
            console.log(`Attached License Terms to IP at transaction hash ${attachLicenseTermsResponse.txHash}`);
        }
        catch (e) {
            console.log(`License Terms ID ${utils_1.NonCommercialSocialRemixingTermsId} already attached to this IPA.`);
        }
    });
};
main();
