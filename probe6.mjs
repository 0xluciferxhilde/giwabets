import { keccak256, toHex } from 'viem';
const T=['0x68e7b09ec44e876e76ff05157850e3261aa63a8680fe21a2ba93dcbb2b09f58f','0x4db1a5664c4551e921dafe1963a4e165c22ba942f241504318e60db0d95a2147','0x4f1eed5e863a822b0f9eb960dfdab2cc5a99beec4b191f2a7a9c7e28e5a15524','0x5f7341a552ae2d452b071917104c05fbac3663936a69be768a05c40605056e7d'];
const cands=[];
const push=s=>cands.push(s);
push('RoundCreated(uint256,uint256,uint256)');
push('RoundLocked(uint256)');
push('RoundSettled(uint256,uint8,uint256,bytes32,uint256)');
push('RoundSettled(uint256,uint256,bytes32,uint8,uint256)');
push('RoundSettled(uint256,uint8,uint256,bytes32)');
for (const p of ['uint8','uint16','uint256'])
 for (const order of [`BetPlaced(uint256,address,${p},uint256)`,`BetPlaced(uint256,address,uint256,${p})`]) push(order);
push('Payout(uint256,address,uint256)');
push('PayoutSent(uint256,address,uint256)');
push('Paid(uint256,address,uint256)');
push('WinnerPaid(uint256,address,uint256)');
push('TreasuryFunded(uint256)');
push('TreasuryDeposit(address,uint256)');
const m=Object.fromEntries(cands.map(s=>[keccak256(toHex(s)),s]));
T.forEach(t=>console.log(t, m[t]||'?'));
