import { createPublicClient, http, keccak256, toHex } from 'viem';
const c = createPublicClient({ transport: http('https://sepolia-rpc.giwa.io') });
for (const t of ['uint16','uint32','uint256','uint8'])
  if (keccak256(toHex(`RoundSettled(uint256,${t},uint256,bytes32)`))==='0x3c4c50ab9f7ab97da1936a3ebd35d265940694b73c4a5a297d5a40505dc50a77') console.log('closest settle',t);
const sel = s => keccak256(toHex(s)).slice(0,10);
const pad = n => BigInt(n).toString(16).padStart(64,'0');
const head=await c.getBlockNumber();
const A={CoinFlip:'0x17b1B887da0985335AA3112a9a93CB34844BA562',LuckyDigit:'0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B',Closest:'0x04764Cca2A234046Dbe68761aa268DD4c2F189dC'};
for (const [k,a] of Object.entries(A)) {
  const logs=(await c.getLogs({address:a,fromBlock:head-40000n,toBlock:head})).filter(l=>l.topics[0]===keccak256(toHex('BetPlaced(uint256,address,uint8,uint256)'))||l.topics[0]===keccak256(toHex('BetPlaced(uint256,address,uint16,uint256)')));
  for (const l of logs.slice(-4)) {
    const rid=BigInt(l.topics[1]); const pick=BigInt('0x'+l.data.slice(2,66));
    const d=(await c.call({to:a,data:sel('getRound(uint256)')+pad(rid)})).data.slice(2).match(/.{64}/g).map(x=>BigInt('0x'+x));
    console.log(k,'round',rid.toString(),'pick',pick.toString(),'words',d.map((x,i)=>i+':'+x).join(' '));
  }
}
