pragma solidity ^0.5.0;
import "./DappToken.sol";
import "./DaiToken.sol";

contract TokenFarm{
    // all code goes here
    string public name = "Dapp Token Farm";
    string public note = "Learning Solidity My Ass";
    address public owner;
    DappToken public dappToken;
    DaiToken public daiToken;
    
    address[] public stakers; 
    mapping(address => uint) public stakingBalance;
    mapping(address => bool) public hasStaked;
    mapping(address => bool) public isStaking;
    constructor(DappToken _dappToken, DaiToken _daiToken)public{
        dappToken = _dappToken;
        daiToken = _daiToken;
        owner = msg.sender;
    }

    // 1. Stakes Tokens (Deposit)
    function stakeToken(uint _amount) public{

            require(_amount > 0, "amount must be greater than 0");
            // Transfer mock dai token to this contract for staking
            daiToken.transferFrom(msg.sender, address(this), _amount);
            
            //update staking balance
            stakingBalance[msg.sender] =stakingBalance[msg.sender] + _amount;

            // Add user to stakers array *only* if they haven't staked already
            if(!hasStaked[msg.sender]){
                stakers.push(msg.sender);
            }
            isStaking[msg.sender] = true;
            hasStaked[msg.sender] = true;
    }
    // 2. Unstaking Tokens (Withdraw)
    // 3. Issues Tokens
    function issueToken()public{
        require(msg.sender == owner, "caller must be the owner");
        for(uint i = 0; i < stakers.length; i++){
            address recipient = stakers[i];
            uint balance = stakingBalance[recipient];
            if(balance > 0){
                dappToken.transfer(recipient, balance);
            }
        }
    }

    function unstakeToken()public{
        uint balance = stakingBalance[msg.sender];

        // require amount greater than 0
        require(balance > 0, "staking balance connot be 0");
        daiToken.transfer(msg.sender, balance);
        //reset staking balance
        stakingBalance[msg.sender] = 0;
        isStaking[msg.sender] = false;
    }
}