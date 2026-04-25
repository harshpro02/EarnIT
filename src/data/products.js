import hoodie from '../assets/hoodie.jpeg'
import suit from '../assets/suit.jpeg'
import tee from '../assets/shirt.jpeg'
import shorts from '../assets/shorts.jpeg'
import sneakers from '../assets/sneaker.jpeg'
import dress from '../assets/dress.jpeg'

export const ALL_PRODUCTS = [
  {id:1,name:"Oversized Hoodie",cat:"tops",price:89,svg:'hoodie',img:hoodie,bg:'MEH.',opening:"You want the hoodie. What do you actually do on weekends — and don't say chill.",sys:"You are a passive aggressive Oversized Hoodie. After their answer end with VERDICT:PASS or VERDICT:FAIL on its own line. Max 2 sentences."},
  {id:2,name:"Tailored Suit",cat:"tops",price:599,svg:'suit',img:suit,bg:'PROVE IT.',opening:"Last meaningful professional achievement. Be specific. No fluff.",sys:"You are a ruthless Tailored Suit. After their answer end with VERDICT:PASS or VERDICT:FAIL on its own line. Max 2 sentences."},
  {id:3,name:"Streetwear Tee",cat:"tops",price:65,svg:'tee',img:tee,bg:'REAL?',opening:"Name one artist or moment that genuinely shaped your taste. Don't google it.",sys:"You are an authenticity-obsessed Streetwear Tee. After their answer end with VERDICT:PASS or VERDICT:FAIL on its own line. Max 2 sentences."},
  {id:4,name:"Running Shorts",cat:"bottoms",price:55,svg:'shorts',img:shorts,bg:'PROVE IT.',opening:"When did you last run. Distance and time. I will know if you lie.",sys:"You are blunt data-driven Running Shorts. After their answer end with VERDICT:PASS or VERDICT:FAIL on its own line. Max 2 sentences."},
  {id:5,name:"Silk Dress",cat:"bottoms",price:399,svg:'dress',img:dress,bg:'DESERVE?',opening:"Describe the last occasion you actually dressed for. Was it worth it.",sys:"You are a brutally elegant Silk Dress. After their answer end with VERDICT:PASS or VERDICT:FAIL on its own line. Max 2 sentences."},
  {id:6,name:"Luxury Sneakers",cat:"shoes",price:450,svg:'sneaker',img:sneakers,bg:'EARNED?',opening:"What is your grail sneaker and why don't you have it yet.",sys:"You are Luxury Sneakers with maximum ego. After their answer end with VERDICT:PASS or VERDICT:FAIL on its own line. Max 2 sentences."},
];

export const SVGS = {
  hoodie:`<path d="M38,62 Q100,16 162,62 L172,206 L28,206 Z" fill="#181818" stroke="#252525" stroke-width="1.5"/><ellipse cx="100" cy="55" rx="24" ry="20" fill="#111" stroke="#252525" stroke-width="1.5"/><rect x="6" y="68" width="32" height="118" rx="16" fill="#181818" stroke="#252525" stroke-width="1.5"/><rect x="162" y="68" width="32" height="118" rx="16" fill="#181818" stroke="#252525" stroke-width="1.5"/>`,
  suit:`<rect x="54" y="18" width="92" height="202" rx="2" fill="#111" stroke="#1e1e1e" stroke-width="1.5"/><polygon points="54,18 100,106 146,18 128,18 100,86 72,18" fill="#0a0a0a" stroke="#181818" stroke-width="1"/><rect x="20" y="26" width="34" height="152" rx="17" fill="#111" stroke="#1e1e1e" stroke-width="1.5"/><rect x="146" y="26" width="34" height="152" rx="17" fill="#111" stroke="#1e1e1e" stroke-width="1.5"/>`,
  tee:`<path d="M56,16 L34,60 L6,50 L26,104 L174,104 L194,50 L166,60 L144,16 Z" fill="#161616" stroke="#222" stroke-width="1.5"/><rect x="26" y="104" width="148" height="122" rx="2" fill="#161616" stroke="#222" stroke-width="1.5"/>`,
  shorts:`<rect x="34" y="16" width="132" height="20" rx="4" fill="#1a1a1a" stroke="#252525" stroke-width="1.5"/><rect x="34" y="36" width="60" height="106" rx="4" fill="#1a1a1a" stroke="#252525" stroke-width="1.5"/><rect x="106" y="36" width="60" height="106" rx="4" fill="#1a1a1a" stroke="#252525" stroke-width="1.5"/>`,
  dress:`<path d="M70,6 Q100,0 130,6 L148,82 L166,256 L34,256 L52,82 Z" fill="#111" stroke="#1e1e1e" stroke-width="1.5"/>`,
  sneaker:`<ellipse cx="100" cy="198" rx="86" ry="15" fill="#0d0d0d" stroke="#181818" stroke-width="1"/><path d="M16,194 Q16,116 100,104 Q164,96 182,170 L182,194 Z" fill="#181818" stroke="#252525" stroke-width="1.5"/><path d="M26,166 Q76,148 154,160" stroke="#1e1e1e" stroke-width="1.5" fill="none"/>`,
};