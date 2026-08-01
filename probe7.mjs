import { createPublicClient, http, keccak256, toHex } from 'viem';
const c = createPublicClient({ transport: http('https://sepolia-rpc.giwa.io') });
const A={CoinFlip:'0x17b1B887da0985335AA3112a9a93CB34844BA562',HiLo:'0x7DBeB4311B620a27af9925232be1CC877E5dA7D3',LuckyDigit:'0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B',NumberGame:'0xD2abE17989bD5e2F54c95959D15DeCd6409F2b09',Closest:'0x04764Cca2A234046Dbe68761aa268DD4c2F189dC',PerfectBlock:'0x68a94e5c4Eb96A560B78e4E83b1aECfF5293319F',GasOU:'0x429Fa7120f24e4dDBd29a187a96cC27eC207281e'};
const cands=['RoundCreated(uint256,uint256,uint256)','RoundLocked(uint256)','RoundSettled(uint256,uint8,uint256,bytes32,uint256)','RoundSettled(uint256,uint8,uint256,bytes32)','RoundSettled(uint256,uint256,uint256,bytes32)','BetPlaced(uint256,address,uint8,uint256)','BetPlaced(uint256,address,uint16,uint256)','BetPlaced(uint256,address,uint256,uint256)','Payout(uint256,address,uint256)'];
const m=Object.fromEntries(cands.map(s=>[keccak256(toHex(s)),s]));
const head = await c.getBlockNumber();
for (const [k,a] of Object.entries(A)) {
  const code=await c.getBytecode({address:a});
  console.log(k, cands.filter(s=>code.includes(keccak256(toHex(s)).slice(2))).join(' | '));
  const logs = await c.getLogs({address:a, fromBlock: head-9000n, toBlock: head});
  const seen=new Map(); logs.forEach(l=>seen.set(l.topics[0],l));
  for (const [t,l] of seen) console.log('   ',m[t]||t,'topics',l.topics.length,'data',l.data.slice(0,200));
}
