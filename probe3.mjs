import { createPublicClient, http, keccak256, toHex } from 'viem';
const c = createPublicClient({ transport: http('https://sepolia-rpc.giwa.io') });
const A = {CoinFlip:'0x17b1B887da0985335AA3112a9a93CB34844BA562',TxOU:'0x9131DFc812321E7C93BA985Dad49FbBBd9cfc564'};
const sel = s => keccak256(toHex(s)).slice(0,10);
const pad = n => BigInt(n).toString(16).padStart(64,'0');
// scan for nonzero rounds
for (const [k,addr] of Object.entries(A)) {
  const rc = Number(BigInt((await c.call({to:addr,data:sel('roundCounter()')})).data));
  for (let id=1; id<=rc; id++) {
    const d = (await c.call({to:addr,data:sel('getRound(uint256)')+pad(id)})).data.slice(2);
    const w = d.match(/.{64}/g).map(x=>BigInt('0x'+x));
    if (w.slice(3).some(x=>x!==0n)) { console.log(k,id, w.map((x,i)=>i+':'+x.toString()).join(' ')); }
  }
  const code = await c.getBytecode({address:addr});
  console.log(k,'codelen',code.length);
}
