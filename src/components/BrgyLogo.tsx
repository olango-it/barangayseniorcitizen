import React from 'react';

interface BrgyLogoProps {
  className?: string;
  size?: number | string;
}

export default function BrgyLogo({ className = '', size = '100%' }: BrgyLogoProps) {
  // Generate radiating sunburst rays (alternating Philippine Flag blue & red)
  const raysCount = 24;
  const rays = [];
  const centerX = 250;
  const centerY = 195; // Slightly raised center for aesthetic balance
  const rayRadius = 160;

  for (let i = 0; i < raysCount; i++) {
    const angleStart = (i * (360 / raysCount) * Math.PI) / 180;
    const angleEnd = (((i + 1) * (360 / raysCount)) * Math.PI) / 180;
    
    const x1 = centerX + rayRadius * Math.cos(angleStart);
    const y1 = centerY + rayRadius * Math.sin(angleStart);
    const x2 = centerX + rayRadius * Math.cos(angleEnd);
    const y2 = centerY + rayRadius * Math.sin(angleEnd);
    
    // Alternating blue (#0f3080) and red (#d6221d)
    const fill = i % 2 === 0 ? '#113a94' : '#dc2626';
    
    rays.push(
      <path
        key={i}
        d={`M ${centerX} ${centerY} L ${x1} ${y1} A ${rayRadius} ${rayRadius} 0 0 1 ${x2} ${y2} Z`}
        fill={fill}
      />
    );
  }

  return (
    <svg 
      className={`select-none ${className}`} 
      width={size} 
      height={size} 
      viewBox="0 0 500 500" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Gold gradients for pristine outer ring and banners */}
        <linearGradient id="goldRim" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="25%" stopColor="#ca8a04" />
          <stop offset="50%" stopColor="#fef08a" />
          <stop offset="75%" stopColor="#854d0e" />
          <stop offset="100%" stopColor="#eab308" />
        </linearGradient>

        <linearGradient id="goldRibbon" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ca8a04" />
          <stop offset="20%" stopColor="#fef08a" />
          <stop offset="50%" stopColor="#eab308" />
          <stop offset="80%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>

        {/* Text curving pathways (Perfect geometries) */}
        {/* Outer Top Path: radius 214 */}
        <path id="outerTopPath" d="M 50 250 A 200 200 0 0 1 450 250" fill="none" />
        {/* Outer Bottom Path: radius 214 */}
        <path id="outerBottomPath" d="M 450 250 A 200 200 0 0 1 50 250" fill="none" />

        {/* Inner Top Path: radius 145 */}
        <path id="innerTopPath" d="M 115 250 A 135 135 0 0 1 385 250" fill="none" />
        {/* Inner Bottom Path: radius 145 */}
        <path id="innerBottomPath" d="M 385 250 A 135 135 0 0 1 115 250" fill="none" />

        {/* Clip path to cleanly crop the central elements inside the golden border */}
        <clipPath id="innerCircleClip">
          <circle cx="250" cy="250" r="146" />
        </clipPath>
      </defs>

      {/* 1. OUTER RING (Dark Metallic Blue with Gold Rim Highlights) */}
      <circle cx="250" cy="250" r="242" fill="url(#goldRim)" />
      <circle cx="250" cy="250" r="236" fill="#081e3f" />

      {/* 2. OUTER TEXT WRAPPERS ("BARANGAY SAN VICENTE" & "ASSOCIATION OF SENIOR CITIZEN") */}
      <text fill="#ffffff" fontSize="23" fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="900" letterSpacing="6px">
        <textPath href="#outerTopPath" startOffset="50%" textAnchor="middle">
          BARANGAY SAN VICENTE
        </textPath>
      </text>

      <text fill="#ffffff" fontSize="19" fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="950" letterSpacing="4.5px">
        <textPath href="#outerBottomPath" startOffset="50%" textAnchor="middle">
          ASSOCIATION OF SENIOR CITIZEN
        </textPath>
      </text>

      {/* Outer Stars & Laurel Leaves Decoration */}
      {/* 3 o'clock Gold Star */}
      <polygon points="458,250 464,242 473,243 467,249 469,258 461,253 453,258 455,249 449,243 458,242" fill="url(#goldRim)" />
      {/* 9 o'clock Gold Star */}
      <polygon points="42,250 48,242 57,243 51,249 53,258 45,253 37,258 39,249 33,243 42,242" fill="url(#goldRim)" />

      {/* Left Laurel Leaves */}
      <g stroke="url(#goldRim)" strokeWidth="1.5" fill="none" opacity="0.85">
        <path d="M 50 170 Q 72 210 50 330" />
        {/* Leaf details */}
        <path d="M 50 180 Q 64 175 54 188 Z" fill="url(#goldRim)" />
        <path d="M 53 205 Q 67 200 57 213 Z" fill="url(#goldRim)" />
        <path d="M 55 230 Q 69 225 59 238 Z" fill="url(#goldRim)" />
        <path d="M 56 255 Q 70 250 60 263 Z" fill="url(#goldRim)" />
        <path d="M 54 280 Q 68 277 58 288 Z" fill="url(#goldRim)" />
        <path d="M 51 305 Q 65 304 55 313 Z" fill="url(#goldRim)" />
      </g>

      {/* Right Laurel Leaves */}
      <g stroke="url(#goldRim)" strokeWidth="1.5" fill="none" opacity="0.85">
        <path d="M 450 170 Q 428 210 450 330" />
        {/* Leaf details */}
        <path d="M 450 180 Q 436 175 446 188 Z" fill="url(#goldRim)" />
        <path d="M 447 205 Q 433 200 443 213 Z" fill="url(#goldRim)" />
        <path d="M 445 230 Q 431 225 441 238 Z" fill="url(#goldRim)" />
        <path d="M 444 255 Q 430 250 440 263 Z" fill="url(#goldRim)" />
        <path d="M 446 280 Q 432 277 442 288 Z" fill="url(#goldRim)" />
        <path d="M 449 305 Q 435 304 445 313 Z" fill="url(#goldRim)" />
      </g>

      {/* 3. INNER CIRCLE WITH CENTRAL SHIELDS & ARTWORKS (Clipped safely inside R=146) */}
      <circle cx="250" cy="250" r="162" fill="url(#goldRim)" />
      <circle cx="250" cy="250" r="150" fill="#fcf6d6" /> {/* Pale golden background */}

      {/* Inner Circle Border Text ("SAN VICENTE" & "LAPU-LAPU CITY • FOUNDED 1995") */}
      <text fill="#0c1d3c" fontSize="17.5" fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="900" letterSpacing="4px">
        <textPath href="#innerTopPath" startOffset="50%" textAnchor="middle">
          SAN VICENTE
        </textPath>
      </text>

      <text fill="#0c1d3c" fontSize="12.5" fontFamily="'Space Grotesk', 'Inter', sans-serif" fontWeight="950" letterSpacing="1px">
        <textPath href="#innerBottomPath" startOffset="50%" textAnchor="middle">
          LAPU-LAPU CITY • FOUNDED 1995
        </textPath>
      </text>

      {/* Clamped graphics area */}
      <g clipPath="url(#innerCircleClip)">
        {/* A. Dynamic Sunburst Background (Radiating Flag Sun Rays) */}
        <g opacity="0.95">
          {rays}
        </g>

        {/* B. Scenic Sea Beach at the very bottom of the sunray scope */}
        {/* Ocean Background (Curved blue bottom portion representing Lapu-Lapu coast) */}
        <path d="M 100 240 Q 250 265 400 240 L 400 400 L 100 400 Z" fill="#0284c7" />
        <path d="M 100 245 Q 250 270 400 245 L 400 400 L 100 400 Z" fill="#0369a1" />
        
        {/* Shiny Waves */}
        <path d="M 120 255 Q 185 258 250 255 T 380 255" stroke="#38bdf8" strokeWidth="2.5" fill="none" opacity="0.6" />
        <path d="M 110 275 Q 175 278 240 275 T 390 275" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* Distant Palms (Island Oasis on beach) */}
        <path d="M 200 248 L 202 232 L 204 248 Z" fill="#713f12" />
        <path d="M 194 233 Q 202 225 210 233 Q 202 235 194 233" fill="#15803d" />
        
        <path d="M 280 246 L 283 228 L 286 246 Z" fill="#713f12" />
        <path d="M 274 229 Q 283 219 292 229 Q 283 231 274 229" fill="#15803d" />

        {/* banca/boat details */}
        <g transform="translate(305, 240) scale(0.65)" opacity="0.9">
          <path d="M 0 5 L 8 5 L 12 -2 L 15 -2 L 10 7 L -10 7 L -15 -2 L -12 -2 Z" fill="#78350f" />
          <line x1="-18" y1="5" x2="18" y2="5" stroke="#ffffff" strokeWidth="1.5" />
          <path d="M -15 0 L 15 0" stroke="#78350f" strokeWidth="1" />
        </g>
        
        {/* Swimming Orange Fishes */}
        <path d="M 152 265 Q 155 261 158 265 L 161 262 L 160 268 Z" fill="#f97316" />
        <path d="M 172 278 Q 175 274 178 278 L 181 275 L 180 281 Z" fill="#f97316" />

        {/* C. Beautiful Wing Elements (Detailed feathers) */}
        <g stroke="#041a3d" strokeWidth="1" strokeLinejoin="round" fill="#ffffff" opacity="0.98">
          {/* Left Wing */}
          <path d="M 250 178 
                   C 215 152, 175 142, 115 170 
                   C 105 175, 102 186, 112 192 
                   C 125 200, 145 198, 160 190 
                   C 130 206, 118 214, 128 221 
                   C 140 228, 165 220, 182 208 
                   C 152 228, 142 238, 155 244 
                   C 170 248, 195 235, 212 218
                   C 192 240, 185 252, 198 255
                   C 212 258, 230 238, 250 218 Z" />
                   
          {/* Left Wing Inner Feather Lines */}
          <path d="M 160 180 Q 130 188 122 182" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 175 192 Q 145 204 136 198" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 190 205 Q 160 220 152 212" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

          {/* Right Wing */}
          <path d="M 250 178 
                   C 285 152, 325 142, 385 170 
                   C 395 175, 398 186, 388 192 
                   C 375 200, 355 198, 340 190 
                   C 370 206, 382 214, 372 221 
                   C 360 228, 335 220, 318 208 
                   C 348 228, 358 238, 345 244 
                   C 330 248, 305 235, 288 218
                   C 308 240, 315 252, 302 255
                   C 288 258, 270 238, 250 218 Z" />

          {/* Right Wing Inner Feather Lines */}
          <path d="M 340 180 Q 370 188 378 182" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 325 192 Q 355 204 364 198" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
          <path d="M 310 205 Q 340 220 348 212" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
        </g>

        {/* D. Sacred Torch & Holy Bible Core Centric Assembly */}
        {/* Bible outline and book */}
        <g transform="translate(0, -6)">
          {/* Holy Bible Base Pages */}
          <rect x="227" y="185" width="46" height="52" rx="3" fill="#fafafa" stroke="#475569" strokeWidth="1.5" />
          {/* Inner Black Cover Cover folds */}
          <rect x="225" y="184" width="50" height="54" rx="2.5" fill="none" stroke="#000000" strokeWidth="1" />
          <rect x="228" y="183" width="44" height="54" rx="1" fill="#1e293b" />
          {/* Cross / Details on Bible */}
          <line x1="250" y1="205" x2="250" y2="225" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="242" y1="212" x2="258" y2="212" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          {/* "HOLY BIBLE" sub-text */}
          <text x="250" y="196" fill="#fef08a" fontSize="5.5" fontFamily="serif" fontWeight="900" textAnchor="middle" letterSpacing="0.5px">HOLY BIBLE</text>

          {/* Torch and Core Flame */}
          {/* Torch Handle/Base */}
          <path d="M 245 183 L 255 183 L 252 170 L 248 170 Z" fill="url(#goldRim)" stroke="#451a03" strokeWidth="1" />
          <circle cx="250" cy="183" r="3.5" fill="#facc15" />
          
          {/* Radiant Flames */}
          {/* Outer red flame */}
          <path d="M 250 134 
                   C 238 152, 238 168, 250 172 
                   C 262 168, 262 152, 250 134 Z" fill="#ef4444" opacity="0.9" />
          {/* Mid orange flame */}
          <path d="M 250 144 
                   C 242 156, 242 168, 250 171 
                   C 258 168, 258 156, 250 144 Z" fill="#f97316" opacity="0.95" />
          {/* Inner bright yellow flame */}
          <path d="M 250 154 
                   C 245 162, 245 168, 250 170 
                   C 255 168, 255 162, 250 154 Z" fill="#facc15" />
        </g>
      </g>

      {/* 4. PRESTIGE GOLD RIBBON ("UNITED IN SERVICE, RESPECT & CARE") */}
      <g opacity="0.98">
        {/* Background dark ribbon fold shadows */}
        <polygon points="105,325 125,290 120,335" fill="#854d0e" />
        <polygon points="395,325 375,290 380,335" fill="#854d0e" />

        {/* Ribbon Side Tails */}
        <path d="M 60 335 L 110 310 L 110 342 L 55 352 Z" fill="url(#goldRibbon)" stroke="#854d0e" strokeWidth="1" />
        <path d="M 440 335 L 390 310 L 390 342 L 445 352 Z" fill="url(#goldRibbon)" stroke="#854d0e" strokeWidth="1" />
        
        {/* Main Ribbon Fold Plinth */}
        <path d="M 98 322 C 160 290, 340 290, 402 322 L 392 355 C 330 325, 170 325, 108 355 Z" fill="url(#goldRibbon)" stroke="#854d0e" strokeWidth="1.5" />
        
        {/* Curved Invisible Path inside ribbon for text */}
        <path id="ribbonTextPath" d="M 120 342 C 170 318, 330 318, 380 342" fill="none" />
        <text fontSize="14" fontFamily="'Inter', 'Space Grotesk', sans-serif" fontWeight="950" fill="#081e3f" letterSpacing="2.5px">
          <textPath href="#ribbonTextPath" startOffset="50%" textAnchor="middle">
            UNITED IN SERVICE, RESPECT & CARE
          </textPath>
        </text>
      </g>

      {/* 5. ELDER COUPLE SILHOUETTE & GOLDEN HEART (Bottom anchor representation) */}
      <g transform="translate(0, 10)">
        {/* Grandmother Silhouette */}
        <path d="M 190 415 
                 C 192 402, 195 398, 204 394 
                 C 210 395, 219 390, 214 378
                 C 212 374, 216 364, 206 364
                 C 198 364, 196 374, 198 378
                 C 194 378, 193 372, 189 374
                 C 186 376, 188 384, 192 384
                 C 190 388, 183 392, 180 400
                 C 176 405, 172 410, 172 415 Z" fill="url(#goldRim)" />

        {/* Grandfather Silhouette with Cap */}
        <path d="M 310 415 
                 C 308 402, 305 398, 296 394 
                 C 290 395, 281 390, 286 378
                 C 285 370, 275 365, 269 368
                 C 264 371, 266 378, 272 381
                 C 275 383, 275 388, 282 390
                 C 286 392, 290 400, 295 405
                 C 298 410, 302 412, 310 415 Z" fill="url(#goldRim)" />

        {/* Supporting Hands or Leafs surrounding couple */}
        <path d="M 160 415 Q 170 380 190 375" stroke="url(#goldRim)" strokeWidth="2.5" fill="none" opacity="0.65" />
        <path d="M 340 415 Q 330 380 310 375" stroke="url(#goldRim)" strokeWidth="2.5" fill="none" opacity="0.65" />

        {/* Centered Golden Heart */}
        <path d="M 250 386 
                 C 250 386, 242 378, 236 384 
                 C 230 390, 244 402, 250 406 
                 C 256 402, 270 390, 264 384 
                 C 258 378, 250 386, 250 386 Z" fill="url(#goldRim)" stroke="#854d0e" strokeWidth="0.5" />
      </g>
    </svg>
  );
}
