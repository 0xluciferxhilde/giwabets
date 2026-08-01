import { createPublicClient, http, keccak256, toHex } from 'viem';
const c = createPublicClient({ transport: http('https://sepolia-rpc.giwa.io') });
const A = {CoinFlip:'0x17b1B887da0985335AA3112a9a93CB34844BA562',HiLo:'0x7DBeB4311B620a27af9925232be1CC877E5dA7D3',LuckyDigit:'0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B',NumberGame:'0xD2abE17989bD5e2F54c95959D15DeCd6409F2b09',Closest:'0x04764Cca2A234046Dbe68761aa268DD4c2F189dC',PerfectBlock:'0x68a94e5c4Eb96A560B78e4E83b1aECfF5293319F',TxOU:'0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564',GasOU:'0x429Fa7120f24e4dDBd29a187a96cC27eC207281e'};
const sel = s => keccak256(toHex(s)).slice(0,10);
const cands = ['placeBet(uint256,uint8)','placeBet(uint256,uint256)','getRound(uint256)','roundCounter()','createRound(uint256,uint256)','lockRound(uint256)','settleRound(uint256,uint256,bytes32)','settleRound(uint256,uint256,bytes32,uint256)','owner()','treasuryBalance()','getBets(uint256)','getUserBets(uint256,address)','TX_LINE()','GAS_LINE()','BET_AMOUNT()','betAmount()','getRoundBets(uint256)','bets(uint256,uint256)'];
const map = Object.fromEntries(cands.map(s=>[sel(s),s]));
for (const [k,addr] of Object.entries(A)) {
  const code = await c.getBytecode({address:addr});
  const found = cands.filter(s=>code.includes(sel(s).slice(2)));
  console.log(k, found.join(' | '));
}
