// SPDX-License-Identifier: MIT
// An example of a consumer contract that relies on a subscription for funding.
pragma solidity 0.8.19;

import {VRFConsumerBaseV2Plus} from "@chainlink/contracts/src/v0.8/vrf/dev/VRFConsumerBaseV2Plus.sol";
import {VRFV2PlusClient} from "@chainlink/contracts/src/v0.8/vrf/dev/libraries/VRFV2PlusClient.sol";

contract CryptoLogo is VRFConsumerBaseV2Plus {
   
    // VRF Requirements
    uint256 constant subscriptionId = 93864159205146494731203092603402246210788088649646320402325043334800985992054;
    bytes32 constant keyHash = 0x9e1344a1247c8a1785d0a4681a27152bffdb43666ae5bf7d14d24a5efd44bf71;
    uint32 constant callBackGasLimit = 100000;
    uint16 constant requestConfirmations = 3;
    uint32 constant numWords = 1;

    address public  Caller;

    //Data Variables
    string[] internal logoLinks = [
        "https://altcoinsbox.com/wp-content/uploads/2023/01/avax-avalanche-logo.png",
        "https://altcoinsbox.com/wp-content/uploads/2023/09/bitcoin-logo-png.png",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/arweave-logo.webp?bwg=1678268854",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/mantle-logo.webp?bwg=1694084551",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/Internet-Computer-logo.webp?bwg=1678268854",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/dydx-logo.webp?bwg=1679475744",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/dogecoin-logo.webp?bwg=1678268855",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/opensea-logo.webp?bwg=1678618120",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/origintrail-logo.webp?bwg=1681124345",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/tezos-logo.webp?bwg=1678803744",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/defichain-logo.webp?bwg=1681198558",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/filecoin-logo.webp?bwg=1678268854",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/bithumb-logo.webp?bwg=1678268855",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/sushi-logo.webp?bwg=1678548565",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/coinex-logo.webp?bwg=1678268854",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/trust-wallet-logo.webp?bwg=1678558344",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/probit-global-logo.webp?bwg=1678368550",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/holo-logo.webp?bwg=1679576868",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/frontier-logo.webp?bwg=1678268854",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/terra-logo.webp?bwg=1678355668",
        "https://altcoinsbox.com/wp-content/uploads/2023/03/kaspa-logo.png",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/huobi-logo.webp?bwg=1678268855",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/green-satoshi-token-logo.webp?bwg=1680850498",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/binaryx-logo.webp?bwg=1680895796",
        "https://altcoinsbox.com/wp-content/uploads/photo-gallery/imported_from_media_libray/thumb/oasis-network-logo.webp?bwg=1679565244"

    ];

    string[] internal logoNames = [
        "avalanche",
        "bitcoin",
        "arweave",
        "mantle",
        "icp",
        "dydx",
        "doge",
        "opensea",
        "origintrail",
        "tezos",
        "defichain",
        "filecoin",
        "bithumb",
        "sushi",
        "coinex",
        "trust wallet",
        "probit",
        "holo",
        "frontier",
        "terra",
        "kaspa",
        "huobi",
        "green satoshi token",
        "binaryx",
        "oasis"
    ];

    mapping(uint8 => mapping(string => string)) internal logoIndexData;
    mapping(address => uint8[]) public generated;
    mapping(address => uint8) public activeNumber;

    // VRF Request and RandonWords Management
    struct RequestStatus {
        bool fulfilled;
        bool exists;
        uint256[] randomWords;
    }

    uint256[] public requestIds;
    uint256 public lastRequestId; 

    event RequestSent(uint256 requestId, uint256 numWords);
    event RequestReceived(uint256 requestId, uint8 randomWords);

    function assignData() private {
        for(uint8 Index = 0; Index < logoLinks.length; Index++ ){
            logoIndexData[Index][logoNames[Index]] = logoLinks[Index];
        }
    }

    constructor(address vrfCoordinator) VRFConsumerBaseV2Plus(vrfCoordinator) {
        assignData();
    }

    function checkRandomWord(address _user, uint8 _generatedNumber) view private returns(bool){
        bool numberState;
        for(uint8 Index = 0; Index < generated[_user].length; Index++){
           if(generated[_user][Index] == _generatedNumber){
            numberState = true;
            break;
           } 
        }
        return numberState;
    }

    function checkRequest(uint _request) view private returns(bool){
        bool requestState;
        for(uint8 Index = 0; Index < requestIds.length; Index++){
           if(requestIds[Index] == _request){
            requestState = true;
            break;
           } 
        }
        return requestState;
    }

    function requestRandomWords() public returns(uint256){
        Caller = msg.sender;
       uint256 requestId = s_vrfCoordinator.requestRandomWords(
            VRFV2PlusClient.RandomWordsRequest({
                keyHash: keyHash,
                subId: subscriptionId,
                requestConfirmations: requestConfirmations,
                callbackGasLimit: callBackGasLimit,
                numWords: numWords,
                extraArgs: VRFV2PlusClient._argsToBytes(VRFV2PlusClient.ExtraArgsV1({nativePayment: false}))}));
    
    requestIds.push(requestId);
    lastRequestId = requestId;
    emit RequestSent(requestId, numWords);
    return requestId;

    }

    uint public Number;

    function fulfillRandomWords(uint256 _requestId, uint256[] calldata _randomWords) internal override {
        Number = _randomWords[0];
        uint8 randomNumber = uint8(_randomWords[0]%logoNames.length);
        while(checkRandomWord(Caller, randomNumber)){
            requestRandomWords();
        }
        generated[Caller].push(randomNumber);
        activeNumber[Caller] = randomNumber;

        emit RequestReceived(_requestId, randomNumber);
    }

    function generatedLogo() public view returns(uint8,string memory, string memory){
        uint8 Active = activeNumber[msg.sender];
        string memory logoName = logoNames[Active];
        return (Active,logoName,logoIndexData[Active][logoName]);
    }

}

