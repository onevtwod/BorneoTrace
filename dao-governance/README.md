# DAO Governance System for BorneoTrace

A decentralized autonomous organization (DAO) governance system for the BorneoTrace platform, enabling community-driven decision making for protocol upgrades, parameter changes, and ecosystem development.

## Overview

The BorneoTrace DAO allows stakeholders to:
- Propose protocol upgrades and improvements
- Vote on system parameters and configurations
- Manage treasury funds for ecosystem development
- Elect and manage governance representatives
- Participate in decentralized decision making

## Governance Structure

### 1. Governance Token (BTRACE)

#### Token Distribution
- **Ecosystem Development**: 40% - Community rewards, partnerships, and development
- **Team & Advisors**: 20% - Core team and advisory board
- **Public Sale**: 25% - Public token sale
- **Liquidity Mining**: 10% - Liquidity provider rewards
- **Treasury Reserve**: 5% - Emergency fund and future development

#### Token Utility
- **Voting Power**: Weighted voting on proposals
- **Staking Rewards**: Earn rewards for participating in governance
- **Fee Discounts**: Reduced fees for active participants
- **Governance Rights**: Right to propose and vote on changes
- **Treasury Access**: Share in protocol revenue

### 2. Governance Mechanisms

#### Proposal Types
1. **Protocol Upgrades**: Smart contract upgrades and new features
2. **Parameter Changes**: Fee structures, thresholds, and limits
3. **Treasury Management**: Fund allocation and spending proposals
4. **Governance Changes**: Modifications to governance itself
5. **Partnership Proposals**: Strategic partnerships and integrations

#### Voting System
- **Weighted Voting**: Voting power based on token holdings
- **Time-Locked Voting**: Tokens locked during voting period
- **Quorum Requirements**: Minimum participation thresholds
- **Super Majority**: High threshold for critical changes
- **Execution Delay**: Time delay before proposal execution

## Smart Contract Architecture

### 1. Governance Token Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Votes.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BorneoTraceToken is ERC20Votes, Ownable {
    uint256 public constant MAX_SUPPLY = 1000000000 * 10**18; // 1 billion tokens
    uint256 public constant VESTING_DURATION = 365 days;
    
    mapping(address => uint256) public vestingStart;
    mapping(address => uint256) public vestingAmount;
    
    event TokensVested(address indexed account, uint256 amount);
    
    constructor() ERC20("BorneoTrace", "BTRACE") EIP712("BorneoTrace", "1") Ownable(msg.sender) {
        _mint(msg.sender, MAX_SUPPLY);
    }
    
    function vestTokens(address account, uint256 amount) external onlyOwner {
        require(vestingAmount[account] == 0, "Already vested");
        require(amount <= balanceOf(owner()), "Insufficient balance");
        
        vestingAmount[account] = amount;
        vestingStart[account] = block.timestamp;
        
        _transfer(owner(), account, amount);
        emit TokensVested(account, amount);
    }
    
    function getVestedAmount(address account) public view returns (uint256) {
        if (vestingAmount[account] == 0) return 0;
        
        uint256 elapsed = block.timestamp - vestingStart[account];
        if (elapsed >= VESTING_DURATION) {
            return vestingAmount[account];
        }
        
        return (vestingAmount[account] * elapsed) / VESTING_DURATION;
    }
    
    function getAvailableVotingPower(address account) public view returns (uint256) {
        return getVestedAmount(account);
    }
}
```

### 2. Governance Contract

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

contract BorneoTraceGovernor is 
    Governor, 
    GovernorSettings, 
    GovernorCountingSimple, 
    GovernorVotes, 
    GovernorVotesQuorumFraction, 
    GovernorTimelockControl 
{
    constructor(
        IVotes _token,
        TimelockController _timelock,
        uint256 _quorumPercentage,
        uint256 _votingDelay,
        uint256 _votingPeriod,
        uint256 _proposalThreshold
    )
        Governor("BorneoTraceGovernor")
        GovernorSettings(
            _votingDelay,     // 1 block
            _votingPeriod,    // 45818 blocks (~1 week)
            _proposalThreshold // 100,000 tokens
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(_quorumPercentage)
        GovernorTimelockControl(_timelock)
    {}
    
    function votingDelay() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingDelay();
    }
    
    function votingPeriod() public view override(IGovernor, GovernorSettings) returns (uint256) {
        return super.votingPeriod();
    }
    
    function quorum(uint256 blockNumber) public view override(IGovernor, GovernorVotesQuorumFraction) returns (uint256) {
        return super.quorum(blockNumber);
    }
    
    function state(uint256 proposalId) public view override(IGovernor, GovernorTimelockControl) returns (ProposalState) {
        return super.state(proposalId);
    }
    
    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(IGovernor, Governor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }
    
    function proposalThreshold() public view override(Governor, GovernorSettings) returns (uint256) {
        return super.proposalThreshold();
    }
    
    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }
    
    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }
    
    function _executor() internal view override(Governor, GovernorTimelockControl) returns (address) {
        return super._executor();
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(IGovernor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
```

### 3. Treasury Management

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract Treasury is Ownable, ReentrancyGuard {
    struct SpendingProposal {
        address recipient;
        uint256 amount;
        string description;
        bool executed;
        uint256 approvalCount;
        mapping(address => bool) approvals;
    }
    
    mapping(uint256 => SpendingProposal) public spendingProposals;
    uint256 public proposalCount;
    
    address[] public approvers;
    uint256 public requiredApprovals;
    
    event SpendingProposalCreated(uint256 indexed proposalId, address indexed recipient, uint256 amount);
    event SpendingProposalApproved(uint256 indexed proposalId, address indexed approver);
    event SpendingProposalExecuted(uint256 indexed proposalId, address indexed recipient, uint256 amount);
    
    modifier onlyApprover() {
        require(isApprover(msg.sender), "Not an approver");
        _;
    }
    
    constructor(address[] memory _approvers, uint256 _requiredApprovals) Ownable(msg.sender) {
        approvers = _approvers;
        requiredApprovals = _requiredApprovals;
    }
    
    function isApprover(address account) public view returns (bool) {
        for (uint256 i = 0; i < approvers.length; i++) {
            if (approvers[i] == account) {
                return true;
            }
        }
        return false;
    }
    
    function createSpendingProposal(
        address recipient,
        uint256 amount,
        string memory description
    ) external onlyApprover returns (uint256) {
        proposalCount++;
        SpendingProposal storage proposal = spendingProposals[proposalCount];
        proposal.recipient = recipient;
        proposal.amount = amount;
        proposal.description = description;
        proposal.executed = false;
        proposal.approvalCount = 0;
        
        emit SpendingProposalCreated(proposalCount, recipient, amount);
        return proposalCount;
    }
    
    function approveSpendingProposal(uint256 proposalId) external onlyApprover {
        SpendingProposal storage proposal = spendingProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(!proposal.approvals[msg.sender], "Already approved");
        
        proposal.approvals[msg.sender] = true;
        proposal.approvalCount++;
        
        emit SpendingProposalApproved(proposalId, msg.sender);
        
        if (proposal.approvalCount >= requiredApprovals) {
            executeSpendingProposal(proposalId);
        }
    }
    
    function executeSpendingProposal(uint256 proposalId) public nonReentrant {
        SpendingProposal storage proposal = spendingProposals[proposalId];
        require(!proposal.executed, "Proposal already executed");
        require(proposal.approvalCount >= requiredApprovals, "Insufficient approvals");
        
        proposal.executed = true;
        
        (bool success, ) = proposal.recipient.call{value: proposal.amount}("");
        require(success, "Transfer failed");
        
        emit SpendingProposalExecuted(proposalId, proposal.recipient, proposal.amount);
    }
    
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).transfer(owner(), amount);
    }
    
    function addApprover(address approver) external onlyOwner {
        require(!isApprover(approver), "Already an approver");
        approvers.push(approver);
    }
    
    function removeApprover(address approver) external onlyOwner {
        for (uint256 i = 0; i < approvers.length; i++) {
            if (approvers[i] == approver) {
                approvers[i] = approvers[approvers.length - 1];
                approvers.pop();
                break;
            }
        }
    }
    
    receive() external payable {}
}
```

## Frontend Interface

### 1. Governance Dashboard

```typescript
// src/components/GovernanceDashboard.tsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Chip,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import { useWeb3 } from '../contexts/Web3Context';

interface Proposal {
  id: string;
  title: string;
  description: string;
  proposer: string;
  startBlock: number;
  endBlock: number;
  votesFor: number;
  votesAgainst: number;
  votesAbstain: number;
  executed: boolean;
  state: string;
}

interface VotingPower {
  total: number;
  delegated: number;
  available: number;
}

const GovernanceDashboard: React.FC = () => {
  const { account, contracts } = useWeb3();
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [votingPower, setVotingPower] = useState<VotingPower>({
    total: 0,
    delegated: 0,
    available: 0
  });
  const [loading, setLoading] = useState(true);
  const [createProposalOpen, setCreateProposalOpen] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    type: 'protocol_upgrade'
  });

  useEffect(() => {
    if (contracts.governor) {
      loadGovernanceData();
    }
  }, [contracts.governor]);

  const loadGovernanceData = async () => {
    try {
      setLoading(true);
      
      // Load voting power
      if (account) {
        const power = await contracts.governor.getVotes(account);
        setVotingPower({
          total: power.toNumber(),
          delegated: 0,
          available: power.toNumber()
        });
      }

      // Load proposals
      const proposalCount = await contracts.governor.proposalCount();
      const loadedProposals: Proposal[] = [];

      for (let i = 1; i <= proposalCount; i++) {
        try {
          const proposal = await contracts.governor.proposals(i);
          const state = await contracts.governor.state(i);
          
          loadedProposals.push({
            id: i.toString(),
            title: proposal.description.split('\n')[0],
            description: proposal.description,
            proposer: proposal.proposer,
            startBlock: proposal.startBlock,
            endBlock: proposal.endBlock,
            votesFor: proposal.forVotes.toNumber(),
            votesAgainst: proposal.againstVotes.toNumber(),
            votesAbstain: proposal.abstainVotes.toNumber(),
            executed: state === 7, // Executed state
            state: getStateString(state)
          });
        } catch (error) {
          console.error(`Failed to load proposal ${i}:`, error);
        }
      }

      setProposals(loadedProposals.reverse());
    } catch (error) {
      console.error('Failed to load governance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStateString = (state: number): string => {
    const states = [
      'Pending',
      'Active',
      'Canceled',
      'Defeated',
      'Succeeded',
      'Queued',
      'Expired',
      'Executed'
    ];
    return states[state] || 'Unknown';
  };

  const getStateColor = (state: string): 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning' => {
    switch (state) {
      case 'Active': return 'primary';
      case 'Succeeded': return 'success';
      case 'Executed': return 'success';
      case 'Defeated': return 'error';
      case 'Canceled': return 'warning';
      default: return 'default';
    }
  };

  const handleVote = async (proposalId: string, support: number) => {
    try {
      const tx = await contracts.governor.castVote(proposalId, support);
      await tx.wait();
      loadGovernanceData(); // Refresh data
    } catch (error) {
      console.error('Failed to vote:', error);
    }
  };

  const handleCreateProposal = async () => {
    try {
      // This would create a proposal transaction
      // Implementation depends on the specific proposal type
      setCreateProposalOpen(false);
      loadGovernanceData();
    } catch (error) {
      console.error('Failed to create proposal:', error);
    }
  };

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Governance Dashboard
      </Typography>

      {/* Voting Power Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Your Voting Power
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Total Power
              </Typography>
              <Typography variant="h6">
                {votingPower.total.toLocaleString()} BTRACE
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Delegated
              </Typography>
              <Typography variant="h6">
                {votingPower.delegated.toLocaleString()} BTRACE
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <Typography variant="body2" color="text.secondary">
                Available
              </Typography>
              <Typography variant="h6">
                {votingPower.available.toLocaleString()} BTRACE
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Create Proposal Button */}
      <Box sx={{ mb: 3 }}>
        <Button
          variant="contained"
          onClick={() => setCreateProposalOpen(true)}
          disabled={votingPower.available < 100000} // Minimum threshold
        >
          Create Proposal
        </Button>
        {votingPower.available < 100000 && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            You need at least 100,000 BTRACE tokens to create a proposal
          </Alert>
        )}
      </Box>

      {/* Proposals List */}
      <Typography variant="h5" gutterBottom>
        Active Proposals
      </Typography>

      {proposals.map((proposal) => (
        <Card key={proposal.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
              <Typography variant="h6">
                {proposal.title}
              </Typography>
              <Chip
                label={proposal.state}
                color={getStateColor(proposal.state)}
                size="small"
              />
            </Box>

            <Typography variant="body2" color="text.secondary" paragraph>
              {proposal.description}
            </Typography>

            <Typography variant="body2" color="text.secondary" gutterBottom>
              Proposed by: {proposal.proposer.slice(0, 6)}...{proposal.proposer.slice(-4)}
            </Typography>

            {/* Voting Results */}
            <Box sx={{ mb: 2 }}>
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">For</Typography>
                <Typography variant="body2">{proposal.votesFor.toLocaleString()}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(proposal.votesFor / (proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain)) * 100}
                sx={{ mb: 1 }}
              />
              
              <Box display="flex" justifyContent="space-between" mb={1}>
                <Typography variant="body2">Against</Typography>
                <Typography variant="body2">{proposal.votesAgainst.toLocaleString()}</Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(proposal.votesAgainst / (proposal.votesFor + proposal.votesAgainst + proposal.votesAbstain)) * 100}
                color="error"
                sx={{ mb: 1 }}
              />
            </Box>

            {/* Vote Buttons */}
            {proposal.state === 'Active' && (
              <Box display="flex" gap={1}>
                <Button
                  variant="contained"
                  color="success"
                  size="small"
                  onClick={() => handleVote(proposal.id, 1)}
                >
                  Vote For
                </Button>
                <Button
                  variant="contained"
                  color="error"
                  size="small"
                  onClick={() => handleVote(proposal.id, 0)}
                >
                  Vote Against
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleVote(proposal.id, 2)}
                >
                  Abstain
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      ))}

      {/* Create Proposal Dialog */}
      <Dialog open={createProposalOpen} onClose={() => setCreateProposalOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Proposal</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Proposal Title"
            value={newProposal.title}
            onChange={(e) => setNewProposal({ ...newProposal, title: e.target.value })}
            margin="normal"
          />
          
          <FormControl fullWidth margin="normal">
            <InputLabel>Proposal Type</InputLabel>
            <Select
              value={newProposal.type}
              onChange={(e) => setNewProposal({ ...newProposal, type: e.target.value })}
            >
              <MenuItem value="protocol_upgrade">Protocol Upgrade</MenuItem>
              <MenuItem value="parameter_change">Parameter Change</MenuItem>
              <MenuItem value="treasury_spending">Treasury Spending</MenuItem>
              <MenuItem value="governance_change">Governance Change</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Proposal Description"
            multiline
            rows={6}
            value={newProposal.description}
            onChange={(e) => setNewProposal({ ...newProposal, description: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateProposalOpen(false)}>Cancel</Button>
          <Button onClick={handleCreateProposal} variant="contained">
            Create Proposal
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GovernanceDashboard;
```

## Deployment and Configuration

### 1. Deploy Governance Contracts

```typescript
// scripts/deploy-governance.ts
import { ethers } from 'hardhat';

async function main() {
  console.log('Deploying Governance System...');

  // Deploy governance token
  const BorneoTraceToken = await ethers.getContractFactory('BorneoTraceToken');
  const token = await BorneoTraceToken.deploy();
  await token.deployed();
  console.log(`BorneoTrace Token deployed to: ${token.address}`);

  // Deploy timelock controller
  const TimelockController = await ethers.getContractFactory('TimelockController');
  const timelock = await TimelockController.deploy(
    172800, // 2 days delay
    [process.env.GOVERNOR_ADDRESS || ''], // proposers
    [process.env.GOVERNOR_ADDRESS || ''], // executors
    ethers.constants.AddressZero // admin
  );
  await timelock.deployed();
  console.log(`Timelock Controller deployed to: ${timelock.address}`);

  // Deploy governor
  const BorneoTraceGovernor = await ethers.getContractFactory('BorneoTraceGovernor');
  const governor = await BorneoTraceGovernor.deploy(
    token.address,
    timelock.address,
    4, // 4% quorum
    1, // 1 block voting delay
    45818, // ~1 week voting period
    100000 * 10**18 // 100,000 token proposal threshold
  );
  await governor.deployed();
  console.log(`Governor deployed to: ${governor.address}`);

  // Deploy treasury
  const Treasury = await ethers.getContractFactory('Treasury');
  const treasury = await Treasury.deploy(
    [process.env.TREASURY_ADMIN || ''], // approvers
    2 // required approvals
  );
  await treasury.deployed();
  console.log(`Treasury deployed to: ${treasury.address}`);

  console.log('Governance system deployed successfully!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

### 2. Initialize Governance

```typescript
// scripts/initialize-governance.ts
import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  
  // Get deployed contracts
  const token = await ethers.getContractAt('BorneoTraceToken', process.env.TOKEN_ADDRESS!);
  const governor = await ethers.getContractAt('BorneoTraceGovernor', process.env.GOVERNOR_ADDRESS!);
  const timelock = await ethers.getContractAt('TimelockController', process.env.TIMELOCK_ADDRESS!);

  // Transfer ownership to timelock
  await token.transferOwnership(timelock.address);
  console.log('Token ownership transferred to timelock');

  // Grant proposer and executor roles to governor
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  
  await timelock.grantRole(PROPOSER_ROLE, governor.address);
  await timelock.grantRole(EXECUTOR_ROLE, governor.address);
  console.log('Governor roles granted');

  // Renounce admin role
  const ADMIN_ROLE = await timelock.DEFAULT_ADMIN_ROLE();
  await timelock.renounceRole(ADMIN_ROLE, deployer.address);
  console.log('Admin role renounced');

  console.log('Governance system initialized!');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
```

## Governance Parameters

### Voting Parameters
- **Voting Delay**: 1 block (~13 seconds)
- **Voting Period**: 45,818 blocks (~1 week)
- **Proposal Threshold**: 100,000 BTRACE tokens
- **Quorum**: 4% of total token supply
- **Execution Delay**: 2 days

### Treasury Parameters
- **Required Approvals**: 2 out of 3 approvers
- **Maximum Single Spending**: 10% of treasury
- **Emergency Spending**: 24-hour delay
- **Regular Spending**: 7-day delay

## Community Guidelines

### 1. Proposal Guidelines
- Clear and concise descriptions
- Technical implementation details
- Risk assessment and mitigation
- Community impact analysis
- Timeline and milestones

### 2. Voting Guidelines
- Research proposals thoroughly
- Consider long-term implications
- Participate in community discussions
- Respect diverse opinions
- Vote based on protocol best interests

### 3. Governance Participation
- Regular community meetings
- Technical discussions
- Proposal reviews
- Governance improvements
- Ecosystem development

## Security Considerations

1. **Multi-signature Requirements**: Critical operations require multiple signatures
2. **Time Delays**: Execution delays for security
3. **Quorum Requirements**: Minimum participation thresholds
4. **Emergency Procedures**: Emergency pause and recovery mechanisms
5. **Audit Requirements**: Regular security audits

## Future Enhancements

1. **Delegation System**: Token delegation for voting
2. **Governance Mining**: Rewards for participation
3. **Cross-chain Governance**: Multi-chain governance support
4. **Automated Execution**: Smart contract automation
5. **Governance Analytics**: Advanced analytics and insights

---

This DAO governance system provides a robust framework for decentralized decision-making in the BorneoTrace ecosystem, ensuring community-driven development and sustainable growth.
