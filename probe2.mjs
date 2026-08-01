import { createPublicClient, http, keccak256, toHex } from 'viem';
const c = createPublicClient({ transport: http('https://sepolia-rpc.giwa.io') });
const A = {CoinFlip:'0x17b1B887da0985335AA3112a9a93CB34844BA562',HiLo:'0x7DBeB4311B620a27af9925232be1CC877E5dA7D3',LuckyDigit:'0x1BfFF6a04E53392Cf4A03FeE3c05e312AE8F0f8B',NumberGame:'0xD2abE17989bD5e2F54c95959D15DeCd6409F2b09',Closest:'0x04764Cca2A234046Dbe68761aa268DD4c2F189dC',PerfectBlock:'0x68a94e5c4Eb96A560B78e4E83b1aECfF5293319F',TxOU:'0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564',GasOU:'0x429Fa7120f24e4dDBd29a187a96cC27eC207281e'};
const sel = s => keccak256(toHex(s)).slice(0,10);
const pad = n => BigInt(n).toString(16).padStart(64,'0');
for (const [k,addr] of Object.entries(A)) {
  const rc = BigInt((await c.call({to:addr,data:sel('roundCounter()')})).data);
  for (const id of [rc-2n, rc]) {
    const d = (await c.call({to:addr,data:sel('getRound(uint256)')+pad(id)})).data.slice(2);
    const words = d.match(/.{64}/g);
    console.log(k, 'id',id.toString(), 'words',words.length);
    words.forEach((w,i)=>console.log('  ',i, BigInt('0x'+w).toString(), '0x'+w.replace(/^0+/,'')));
  }
}
