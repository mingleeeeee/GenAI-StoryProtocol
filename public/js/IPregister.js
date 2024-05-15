// Function to display status messages under the modal
function displayStatusMessage(message, isSuccess) {
    var statusContainer = document.createElement('div');
    statusContainer.className = isSuccess ? 'status-success' : 'status-error';
    statusContainer.textContent = message;
  
    var modalContent = document.querySelector('.modal-content');
    modalContent.appendChild(statusContainer);
  }
  
  // // Function to create IP asset and return values to /registerIP
  async function createIPAsset() {
    try {
    var IPid = document.getElementById('IPid').value;
    var Tokenid = document.getElementById('Tokenid').value;
      // Send IPid and Tokenid to /registerIP endpoint
      const response = await fetch('/registerIP', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ IPid: IPid, derivativeTokenId: Tokenid })
      });
      if (response.ok) {
        const responseData = await response.json();
        console.log('IP asset created successfully:', responseData);
  
        // Display success message under the modal
        displayStatusMessage('IP asset created successfully.', true);
      } else {
        console.error('Failed to create IP asset.');
        displayStatusMessage('Failed to create IP asset. Please try again.', false);
      }
    } catch (error) {
      console.error('Error creating IP asset:', error);
      displayStatusMessage('Error creating IP asset. Please try again.', false);
    }
  }
  
// Function to open the modal
function openModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
    }
  }
    // Function to close the modal
  function closeModal() {
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
      modalOverlay.style.display = 'none';
    }
  }
    // IPA button click event to open modal
  document.getElementById('IPA-button').addEventListener('click', openModal);
  
  // Get the modal element
var modal = document.getElementById('modalOverlay');

// Get the close button (x) element
var closeButton = document.getElementById('modalClose');

// When the user clicks the close button or outside the modal content, close the modal
closeButton.onclick = function() {
  modal.style.display = 'none';
};

// // Function to handle registration of IP asset
// async function createIPAsset() {
//   try {
//       var IPid = document.getElementById('IPid').value;
//       var derivativeTokenId = document.getElementById('Tokenid').value;

//       if (window.ethereum) {
//           // Request account access from MetaMask
//           const accounts = await window.ethereum.request({
//               method: "eth_requestAccounts",
//           });

//           const account = accounts[0]; // Get the first account from MetaMask

//           // Configure Ethers.js provider and signer
//           const provider = new ethers.providers.Web3Provider(window.ethereum);
//           const signer = provider.getSigner();

//           // Replace the following constants with your actual contract addresses and IDs
//           const NFTContractAddress = '0x123abc...'; // Example NFT contract address
//           const NonCommercialSocialRemixingTermsId = 1; // Example license terms ID
//           const OwnerAddress = '0x456def...'; // Example owner address

//           // Create contract instances
//           const storyProtocolContract = new ethers.Contract(STORY_PROTOCOL_ADDRESS, STORY_PROTOCOL_ABI, signer);

//           // Mint license tokens
//           const mintLicenseResponse = await storyProtocolContract.mintLicenseTokens(
//               NonCommercialSocialRemixingTermsId,
//               IPid,
//               OwnerAddress,
//               1, // amount
//               { gasLimit: 300000 } // Customize gas limit if needed
//           );
//           console.log(`License Token minted at transaction hash ${mintLicenseResponse.hash}, License ID: ${mintLicenseResponse.licenseTokenId}`);

//           // Register IP asset
//           const ipAssetContract = new ethers.Contract(NFTContractAddress, NFT_CONTRACT_ABI, signer);
//           const registeredIpAssetDerivativeResponse = await ipAssetContract.register(
//               derivativeTokenId,
//               { gasLimit: 300000 } // Customize gas limit if needed
//           );
//           console.log(`Derivative IPA created at transaction hash ${registeredIpAssetDerivativeResponse.hash}, IPA ID: ${registeredIpAssetDerivativeResponse.ipId}`);

//           // Link derivative IPA to parent
//           const linkDerivativeResponse = await storyProtocolContract.registerDerivativeWithLicenseTokens(
//               registeredIpAssetDerivativeResponse.ipId,
//               [mintLicenseResponse.licenseTokenId],
//               { gasLimit: 300000 } // Customize gas limit if needed
//           );
//           console.log(`Derivative IPA linked to parent at transaction hash ${linkDerivativeResponse.hash}`);

//           alert('Ethereum logic executed successfully.');
//       } else {
//           console.error('MetaMask not detected.');
//           alert('MetaMask is required to interact with this feature.');
//       }
//   } catch (error) {
//       console.error('Error executing Ethereum logic:', error);
//       alert('Error executing Ethereum logic. Please try again.');
//   }
// }

