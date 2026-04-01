window.GAME_ART = {
  "scene-lobby": `<svg width="640" height="400" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Dark gray-green for fog and decay -->
  <rect width="640" height="400" fill="#2a2a25"/>
  
  <!-- Fog effect: Semi-transparent white/gray layers -->
  <rect width="640" height="100" y="0" fill="rgba(120,120,110,0.3)"/>
  <rect width="640" height="80" y="20" fill="rgba(100,100,90,0.2)"/>
  
  <!-- Art Deco floor tiles: Geometric pattern -->
  <rect x="0" y="300" width="640" height="100" fill="#1a1a18"/>
  <!-- Tile pattern -->
  <g stroke="#333330" stroke-width="2">
    <!-- Vertical lines -->
    <line x1="80" y1="300" x2="80" y2="400"/>
    <line x1="160" y1="300" x2="160" y2="400"/>
    <line x1="240" y1="300" x2="240" y2="400"/>
    <line x1="320" y1="300" x2="320" y2="400"/>
    <line x1="400" y1="300" x2="400" y2="400"/>
    <line x1="480" y1="300" x2="480" y2="400"/>
    <line x1="560" y1="300" x2="560" y2="400"/>
    <!-- Horizontal lines -->
    <line x1="0" y1="340" x2="640" y2="340"/>
    <line x1="0" y1="380" x2="640" y2="380"/>
  </g>
  
  <!-- Reception desk: Rectangular Art Deco piece -->
  <rect x="270" y="220" width="100" height="60" fill="#3a3a35" stroke="#555550" stroke-width="3"/>
  <rect x="275" y="225" width="90" height="50" fill="#2a2a25" stroke="#444440" stroke-width="2"/>
  <!-- Desk details: Ledger -->
  <rect x="280" y="240" width="80" height="30" fill="#1a1a18" stroke="#333330" stroke-width="1"/>
  
  <!-- Brass relay on velvet pad -->
  <rect x="320" y="200" width="40" height="30" fill="#d4af37" stroke="#b8860b" stroke-width="2"/> <!-- Brass color -->
  <rect x="315" y="195" width="50" height="40" fill="#654321" stroke="#8b6914" stroke-width="1"/> <!-- Velvet pad -->
  
  <!-- Transmitter room door -->
  <rect x="500" y="250" width="80" height="120" fill="#2a2a25" stroke="#555550" stroke-width="3"/>
  <!-- Stenciled letters TRANSMITTER ROOM (simplified as rectangles) -->
  <rect x="510" y="280" width="60" height="8" fill="#cccccc"/>
  <rect x="510" y="300" width="60" height="8" fill="#cccccc"/>
  <rect x="510" y="320" width="60" height="8" fill="#cccccc"/>
  <rect x="510" y="340" width="60" height="8" fill="#cccccc"/>
  <!-- Padlock -->
  <rect x="530" y="260" width="20" height="25" fill="#4a4a45" stroke="#666660" stroke-width="2"/>
  <circle cx="540" cy="285" r="8" fill="#4a4a45" stroke="#666660" stroke-width="2"/>
  
  <!-- Peeling wallpaper effect on left wall -->
  <path d="M0,100 L100,100 L100,200 L0,200 Z" fill="#8b4513" opacity="0.7"/>
  <path d="M0,100 L20,80 L20,180 L0,180 Z" fill="#8b0000" opacity="0.6"/>
  <path d="M80,100 L100,80 L100,180 L80,180 Z" fill="#8b0000" opacity="0.6"/>
  
  <!-- Fog particles: Small circles -->
  <circle cx="100" cy="50" r="3" fill="rgba(200,200,190,0.5)"/>
  <circle cx="200" cy="80" r="2" fill="rgba(200,200,190,0.4)"/>
  <circle cx="350" cy="40" r="4" fill="rgba(200,200,190,0.6)"/>
  <circle cx="500" cy="60" r="3" fill="rgba(200,200,190,0.5)"/>
  <circle cx="150" cy="120" r="2" fill="rgba(200,200,190,0.3)"/>
  <circle cx="400" cy="100" r="3" fill="rgba(200,200,190,0.4)"/>
</svg>`,
,
  "scene-transmitter-room": `<svg width="640" height="400" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Dark industrial -->
  <rect width="640" height="400" fill="#1a1a18"/>
  
  <!-- Concrete floor -->
  <rect x="0" y="320" width="640" height="80" fill="#2a2a25"/>
  <!-- Floor texture lines -->
  <g stroke="#333330" stroke-width="1">
    <line x1="0" y1="340" x2="640" y2="340"/>
    <line x1="0" y1="360" x2="640" y2="360"/>
    <line x1="0" y1="380" x2="640" y2="380"/>
  </g>
  
  <!-- Vacuum tubes on far wall - rows -->
  <g id="vacuum-tubes">
    <!-- Row 1 -->
    <rect x="50" y="50" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.8"/>
    <rect x="90" y="50" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.9"/>
    <rect x="130" y="50" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.7"/>
    <rect x="170" y="50" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.85"/>
    <rect x="210" y="50" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.6"/>
    <rect x="250" y="50" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.9"/>
    <rect x="290" y="50" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.7"/>
    <rect x="330" y="50" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.8"/>
    <rect x="370" y="50" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.75"/>
    <rect x="410" y="50" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.85"/>
    <rect x="450" y="50" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.65"/>
    <rect x="490" y="50" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.9"/>
    
    <!-- Row 2 -->
    <rect x="50" y="110" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.7"/>
    <rect x="90" y="110" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.8"/>
    <rect x="130" y="110" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.75"/>
    <rect x="170" y="110" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.9"/>
    <rect x="210" y="110" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.65"/>
    <rect x="250" y="110" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.85"/>
    <rect x="290" y="110" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.7"/>
    <rect x="330" y="110" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.8"/>
    <rect x="370" y="110" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.75"/>
    <rect x="410" y="110" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.85"/>
    <rect x="450" y="110" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.7"/>
    <rect x="490" y="110" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.9"/>
    
    <!-- Row 3 -->
    <rect x="50" y="170" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.75"/>
    <rect x="90" y="170" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.85"/>
    <rect x="130" y="170" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.8"/>
    <rect x="170" y="170" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.7"/>
    <rect x="210" y="170" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.85"/>
    <rect x="250" y="170" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.75"/>
    <rect x="290" y="170" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.9"/>
    <rect x="330" y="170" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.8"/>
    <rect x="370" y="170" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.7"/>
    <rect x="410" y="170" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.85"/>
    <rect x="450" y="170" width="20" height="40" fill="#aa00ff" stroke="#7700aa" stroke-width="2" opacity="0.75"/>
    <rect x="490" y="170" width="20" height="40" fill="#ff8800" stroke="#cc6600" stroke-width="2" opacity="0.9"/>
  </g>
  
  <!-- Broadcasting console at center -->
  <rect x="220" y="250" width="200" height="70" fill="#2a2a25" stroke="#555550" stroke-width="3"/>
  <!-- Console dials -->
  <g stroke="#ff8800" stroke-width="2">
    <circle cx="270" cy="285" r="15" fill="#1a1a18"/>
    <circle cx="320" cy="285" r="15" fill="#1a1a18"/>
    <circle cx="370" cy="285" r="15" fill="#1a1a18"/>
  </g>
  <!-- Console switches -->
  <rect x="240" y="260" width="10" height="20" fill="#333330" stroke="#555550"/>
  <rect x="260" y="260" width="10" height="20" fill="#333330" stroke="#555550"/>
  <rect x="400" y="260" width="10" height="20" fill="#333330" stroke="#555550"/>
  <rect x="420" y="260" width="10" height="20" fill="#333330" stroke="#555550"/>
  
  <!-- Cables on floor -->
  <path d="M100,350 Q150,320 200,350 T300,350 T400,350 T500,350" stroke="#333330" stroke-width="4" fill="none"/>
  <path d="M80,370 Q130,340 180,370 T280,370" stroke="#444440" stroke-width="3" fill="none"/>
  
  <!-- Fuse box on eastern wall -->
  <rect x="520" y="200" width="60" height="80" fill="#3a3a35" stroke="#555550" stroke-width="3"/>
  <!-- Rust texture on fuse box -->
  <rect x="525" y="205" width="50" height="70" fill="#8b4513" opacity="0.3"/>
  <rect x="530" y="210" width="40" height="60" fill="#2a2a25" stroke="#444440" stroke-width="2"/>
  <!-- Empty slot -->
  <rect x="540" y="240" width="20" height="20" fill="#1a1a18" stroke="#ff8800" stroke-width="2"/>
  <!-- Other slots -->
  <rect x="540" y="215" width="20" height="15" fill="#333330" stroke="#555550"/>
  <rect x="540" y="270" width="20" height="15" fill="#333330" stroke="#555550"/>
  
  <!-- Ambient glow from tubes -->
  <circle cx="320" cy="100" r="80" fill="#ff8800" opacity="0.1"/>
  <circle cx="320" cy="100" r="60" fill="#aa00ff" opacity="0.05"/>
</svg>`,
,
  "scene-control-booth": `<svg width="640" height="400" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Dark control room -->
  <rect width="640" height="400" fill="#1a1a18"/>
  
  <!-- Floor -->
  <rect x="0" y="340" width="640" height="60" fill="#2a2a25"/>
  <g stroke="#333330" stroke-width="1">
    <line x1="0" y1="360" x2="640" y2="360"/>
    <line x1="0" y1="380" x2="640" y2="380"/>
  </g>
  
  <!-- Mixing board (altar-like) -->
  <rect x="150" y="200" width="340" height="140" fill="#2a2a25" stroke="#555550" stroke-width="4"/>
  <!-- Top surface -->
  <rect x="155" y="205" width="330" height="20" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
  
  <!-- Scorch marks on mixing board -->
  <path d="M200,210 L220,250 L180,260 Z" fill="#000000" opacity="0.7"/>
  <path d="M350,210 L380,260 L340,270 Z" fill="#000000" opacity="0.6"/>
  <path d="M450,210 L470,240 L430,250 Z" fill="#000000" opacity="0.65"/>
  
  <!-- Faders (frozen mid-burn) -->
  <g stroke="#555550" stroke-width="3">
    <line x1="200" y1="230" x2="200" y2="320"/>
    <line x1="250" y1="240" x2="250" y2="310"/>
    <line x1="300" y1="225" x2="300" y2="315"/>
    <line x1="350" y1="235" x2="350" y2="305"/>
    <line x1="400" y1="220" x2="400" y2="325"/>
    <line x1="450" y1="245" x2="450" y2="300"/>
  </g>
  <!-- Fader knobs -->
  <circle cx="200" cy="275" r="8" fill="#ff8800" stroke="#cc6600" stroke-width="2"/>
  <circle cx="250" cy="275" r="8" fill="#aa00ff" stroke="#7700aa" stroke-width="2"/>
  <circle cx="300" cy="270" r="8" fill="#ff8800" stroke="#cc6600" stroke-width="2"/>
  <circle cx="350" cy="270" r="8" fill="#aa00ff" stroke="#7700aa" stroke-width="2"/>
  <circle cx="400" cy="272" r="8" fill="#ff8800" stroke="#cc6600" stroke-width="2"/>
  <circle cx="450" cy="272" r="8" fill="#aa00ff" stroke="#7700aa" stroke-width="2"/>
  
  <!-- Reel-to-reel machines -->
  <rect x="160" y="260" width="80" height="60" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
  <circle cx="200" cy="280" r="20" fill="#1a1a18" stroke="#ff8800" stroke-width="2"/>
  <circle cx="200" cy="280" r="15" fill="none" stroke="#ff8800" stroke-width="1"/>
  
  <rect x="400" y="260" width="80" height="60" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
  <circle cx="440" cy="280" r="20" fill="#1a1a18" stroke="#aa00ff" stroke-width="2"/>
  <circle cx="440" cy="280" r="15" fill="none" stroke="#aa00ff" stroke-width="1"/>
  <!-- Stretched tape -->
  <line x1="440" y1="280" x2="440" y2="200" stroke="#333330" stroke-width="3"/>
  
  <!-- Marcus Webb's dust outline on floor -->
  <path d="M250,380 Q260,375 270,378 L280,375 Q290,370 300,375 L310,370 Q320,365 330,370 L340,365 Q350,360 360,365 L350,375 Q340,380 330,378 L320,380 Q310,382 300,380 L290,382 Q280,380 270,382 Z" fill="#808080" opacity="0.5" stroke="#555550" stroke-width="1"/>
  <!-- Head tilt -->
  <circle cx="340" cy="360" r="15" fill="#808080" opacity="0.5" stroke="#555550"/>
  
  <!-- Glass window to sound booth -->
  <rect x="250" y="50" width="140" height="100" fill="#4a4a45" stroke="#666660" stroke-width="3"/>
  <!-- Reflection lines on glass -->
  <line x1="260" y1="60" x2="380" y2="140" stroke="#666660" stroke-width="1" opacity="0.5"/>
  <line x1="260" y1="80" x2="380" y2="120" stroke="#666660" stroke-width="1" opacity="0.3"/>
  
  <!-- Studio key hanging from hook -->
  <rect x="420" y="120" width="30" height="20" fill="#d4af37" stroke="#b8860b" stroke-width="2"/>
  <circle cx="425" cy="130" r="5" fill="#b8860b"/>
  <line x1="450" y1="125" x2="470" y2="125" stroke="#d4af37" stroke-width="3"/>
  <line x1="470" y1="120" x2="470" y2="130" stroke="#d4af37" stroke-width="3"/>
  
  <!-- Sound booth door -->
  <rect x="500" y="200" width="60" height="140" fill="#2a2a25" stroke="#555550" stroke-width="3"/>
  <circle cx="510" cy="270" r="8" fill="#4a4a45" stroke="#666660" stroke-width="2"/>
  
  <!-- Ambient glow from equipment -->
  <circle cx="320" cy="250" r="60" fill="#ff8800" opacity="0.05"/>
  <circle cx="320" cy="250" r="40" fill="#aa00ff" opacity="0.03"/>
</svg>`,
,
  "scene-sound-booth": `<svg width="640" height="400" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Dark soundproofed room -->
  <rect width="640" height="400" fill="#0a0a08"/>
  
  <!-- Diamond-patterned acoustic foam on all walls -->
  <defs>
    <pattern id="diamond-foam" patternUnits="userSpaceOnUse" width="40" height="40" patternTransform="rotate(45)">
      <rect width="20" height="20" fill="#1a1a18"/>
      <rect width="20" height="20" fill="#2a2a25" x="20" y="20"/>
    </pattern>
  </defs>
  
  <!-- Left wall foam -->
  <rect x="0" y="0" width="100" height="400" fill="url(#diamond-foam)"/>
  <!-- Right wall foam -->
  <rect x="540" y="0" width="100" height="400" fill="url(#diamond-foam)"/>
  <!-- Back wall foam -->
  <rect x="100" y="0" width="440" height="150" fill="url(#diamond-foam)"/>
  <!-- Floor foam -->
  <rect x="100" y="250" width="440" height="150" fill="url(#diamond-foam)"/>
  
  <!-- Darker disturbed foam on far wall -->
  <rect x="300" y="50" width="100" height="80" fill="#0a0a08" opacity="0.7"/>
  
  <!-- Numbers scratched into foam: 7-3-1-9 -->
  <text x="320" y="100" font-family="monospace" font-size="24" fill="#333330" stroke="#1a1a18" stroke-width="1">7-3-1-9</text>
  
  <!-- Microphone stand (skeletal) -->
  <line x1="320" y1="200" x2="320" y2="350" stroke="#4a4a45" stroke-width="4"/>
  <!-- Stand base -->
  <circle cx="320" cy="350" r="15" fill="#3a3a35" stroke="#555550" stroke-width="2"/>
  <!-- Arm reaching up -->
  <line x1="320" y1="200" x2="340" y2="180" stroke="#4a4a45" stroke-width="3"/>
  <circle cx="340" cy="180" r="5" fill="#4a4a45" stroke="#555550" stroke-width="1"/>
  
  <!-- Scroll of yellowed paper -->
  <rect x="200" y="300" width="60" height="40" fill="#d4af37" stroke="#b8860b" stroke-width="2" opacity="0.8"/>
  <!-- Faint pencil lines on scroll -->
  <line x1="210" y1="310" x2="250" y2="310" stroke="#8b6914" stroke-width="1" opacity="0.5"/>
  <line x1="210" y1="320" x2="240" y2="320" stroke="#8b6914" stroke-width="1" opacity="0.5"/>
  <line x1="210" y1="330" x2="230" y2="330" stroke="#8b6914" stroke-width="1" opacity="0.5"/>
  
  <!-- Sound absorption effect: subtle dark auras -->
  <circle cx="320" cy="250" r="80" fill="#000000" opacity="0.2"/>
  <circle cx="320" cy="250" r="60" fill="#000000" opacity="0.1"/>
  
  <!-- Door seal (pneumatic) -->
  <rect x="0" y="150" width="100" height="100" fill="#2a2a25" stroke="#444440" stroke-width="3"/>
  <line x1="50" y1="150" x2="50" y2="250" stroke="#555550" stroke-width="2"/>
  
  <!-- Additional foam texture details -->
  <g fill="#1a1a18" opacity="0.3">
    <rect x="120" y="160" width="30" height="30"/>
    <rect x="200" y="170" width="30" height="30"/>
    <rect x="380" y="160" width="30" height="30"/>
    <rect x="460" y="170" width="30" height="30"/>
  </g>
</svg>`,
,
  "scene-archives": `<svg width="640" height="400" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Dark archives room -->
  <rect width="640" height="400" fill="#1a1a18"/>
  
  <!-- Floor -->
  <rect x="0" y="340" width="640" height="60" fill="#2a2a25"/>
  <g stroke="#333330" stroke-width="1">
    <line x1="0" y1="360" x2="640" y2="360"/>
    <line x1="0" y1="380" x2="640" y2="380"/>
  </g>
  
  <!-- Filing cabinets on left wall -->
  <g id="filing-cabinets">
    <rect x="20" y="100" width="120" height="200" fill="#2a2a25" stroke="#555550" stroke-width="3"/>
    <!-- Cabinet drawers -->
    <rect x="30" y="110" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="30" y="155" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="30" y="200" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="30" y="245" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="30" y="290" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <!-- Labels -->
    <rect x="50" y="115" width="60" height="10" fill="#d4af37" opacity="0.5"/>
    <rect x="50" y="160" width="60" height="10" fill="#d4af37" opacity="0.5"/>
    <rect x="50" y="205" width="60" height="10" fill="#d4af37" opacity="0.5"/>
    <rect x="50" y="250" width="60" height="10" fill="#d4af37" opacity="0.5"/>
    <rect x="50" y="295" width="60" height="10" fill="#d4af37" opacity="0.5"/>
  </g>
  
  <!-- Second filing cabinet -->
  <g id="filing-cabinets-2">
    <rect x="150" y="100" width="120" height="200" fill="#2a2a25" stroke="#555550" stroke-width="3"/>
    <rect x="160" y="110" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="160" y="155" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="160" y="200" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="160" y="245" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
    <rect x="160" y="290" width="100" height="35" fill="#3a3a35" stroke="#444440" stroke-width="1"/>
  </g>
  
  <!-- Oak desk -->
  <rect x="250" y="200" width="180" height="80" fill="#8b4513" stroke="#5a2d0c" stroke-width="3"/>
  <!-- Desk top -->
  <rect x="255" y="205" width="170" height="10" fill="#a0522d" stroke="#5a2d0c" stroke-width="1"/>
  
  <!-- Dr. Holloway's journal (open) -->
  <rect x="280" y="210" width="60" height="40" fill="#d4af37" stroke="#b8860b" stroke-width="2"/>
  <line x1="310" y1="210" x2="310" y2="250" stroke="#b8860b" stroke-width="1"/>
  <!-- Handwriting lines -->
  <line x1="285" y1="220" x2="305" y2="220" stroke="#000000" stroke-width="1" opacity="0.6"/>
  <line x1="285" y1="225" x2="305" y2="225" stroke="#000000" stroke-width="1" opacity="0.6"/>
  <line x1="315" y1="220" x2="335" y2="220" stroke="#000000" stroke-width="1" opacity="0.6"/>
  <line x1="315" y1="225" x2="335" y2="225" stroke="#000000" stroke-width="1" opacity="0.6"/>
  <line x1="285" y1="235" x2="305" y2="235" stroke="#000000" stroke-width="1" opacity="0.4"/>
  <!-- Final entry trailing off -->
  <line x1="315" y1="240" x2="330" y2="240" stroke="#000000" stroke-width="1" opacity="0.3"/>
  
  <!-- Steel lockbox -->
  <rect x="350" y="220" width="60" height="40" fill="#4a4a45" stroke="#666660" stroke-width="3"/>
  <!-- Combination dial -->
  <circle cx="380" cy="240" r="12" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
  <circle cx="380" cy="240" r="8" fill="#3a3a35" stroke="#555550" stroke-width="1"/>
  <!-- Dial indicator -->
  <line x1="380" y1="240" x2="380" y2="230" stroke="#ff8800" stroke-width="2"/>
  
  <!-- Concrete stairs leading up -->
  <g id="stairs">
    <rect x="500" y="280" width="120" height="20" fill="#3a3a35" stroke="#555550" stroke-width="2"/>
    <rect x="500" y="260" width="120" height="20" fill="#3a3a35" stroke="#555550" stroke-width="2"/>
    <rect x="500" y="240" width="120" height="20" fill="#3a3a35" stroke="#555550" stroke-width="2"/>
    <rect x="500" y="220" width="120" height="20" fill="#3a3a35" stroke="#555550" stroke-width="2"/>
    <rect x="500" y="200" width="120" height="20" fill="#3a3a35" stroke="#555550" stroke-width="2"/>
  </g>
  <!-- Railing -->
  <line x1="610" y1="200" x2="610" y2="300" stroke="#4a4a45" stroke-width="3"/>
  <line x1="610" y1="200" x2="580" y2="200" stroke="#4a4a45" stroke-width="2"/>
  
  <!-- Reel-to-reel tapes stacked like vertebrae -->
  <g id="tapes">
    <rect x="450" y="120" width="40" height="30" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
    <rect x="450" y="150" width="40" height="30" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
    <rect x="450" y="180" width="40" height="30" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
    <rect x="450" y="210" width="40" height="30" fill="#2a2a25" stroke="#555550" stroke-width="2"/>
    <!-- Labels in erratic hand -->
    <rect x="455" y="125" width="30" height="8" fill="#d4af37" opacity="0.4"/>
    <rect x="455" y="155" width="30" height="8" fill="#d4af37" opacity="0.5"/>
    <rect x="455" y="185" width="30" height="8" fill="#d4af37" opacity="0.3"/>
    <rect x="455" y="215" width="30" height="8" fill="#d4af37" opacity="0.6"/>
  </g>
  
  <!-- Items: maintenance wrench and antenna crystal -->
  <!-- Wrench -->
  <rect x="300" y="300" width="60" height="10" fill="#708090" stroke="#4a5568" stroke-width="2"/>
  <rect x="355" y="295" width="15" height="20" fill="#708090" stroke="#4a5568" stroke-width="2"/>
  <!-- Rust stains -->
  <rect x="310" y="302" width="20" height="6" fill="#8b4513" opacity="0.5"/>
  
  <!-- Antenna crystal -->
  <polygon points="400,310 410,280 420,310 410,320" fill="#e0e0e0" stroke="#a0a0a0" stroke-width="2"/>
  <circle cx="410" cy="295" r="5" fill="#ffffff" opacity="0.8"/>
  
  <!-- Dust particles -->
  <circle cx="200" cy="300" r="2" fill="#808080" opacity="0.5"/>
  <circle cx="250" cy="250" r="1.5" fill="#808080" opacity="0.4"/>
  <circle cx="350" cy="180" r="2" fill="#808080" opacity="0.6"/>
  <circle cx="450" cy="250" r="1.5" fill="#808080" opacity="0.3"/>
</svg>`,
,
  "scene-antenna-tower": `<svg width="640" height="400" viewBox="0 0 640 400" xmlns="http://www.w3.org/2000/svg">
  <!-- Background: Inside the tower, fog-light -->
  <rect width="640" height="400" fill="#1a1a18"/>
  
  <!-- Fog-light from outside -->
  <rect x="0" y="0" width="640" height="100" fill="#2a2a25" opacity="0.4"/>
  <rect x="0" y="50" width="640" height="80" fill="#3a3a35" opacity="0.2"/>
  
  <!-- Tower interior walls -->
  <rect x="100" y="0" width="20" height="400" fill="#2a2a25"/>
  <rect x="520" y="0" width="20" height="400" fill="#2a2a25"/>
  
  <!-- Floor -->
  <rect x="0" y="350" width="640" height="50" fill="#1a1a18"/>
  <g stroke="#333330" stroke-width="1">
    <line x1="0" y1="370" x2="640" y2="370"/>
  </g>
  
  <!-- Skeletal frame of tower -->
  <g id="skeletal-frame">
    <!-- Vertical beams -->
    <line x1="150" y1="0" x2="150" y2="400" stroke="#4a4a45" stroke-width="5"/>
    <line x1="490" y1="0" x2="490" y2="400" stroke="#4a4a45" stroke-width="5"/>
    <line x1="200" y1="0" x2="200" y2="400" stroke="#4a4a45" stroke-width="3"/>
    <line x1="440" y1="0" x2="440" y2="400" stroke="#4a4a45" stroke-width="3"/>
    <!-- Horizontal crossbeams -->
    <line x1="150" y1="100" x2="490" y2="100" stroke="#4a4a45" stroke-width="2"/>
    <line x1="150" y1="200" x2="490" y2="200" stroke="#4a4a45" stroke-width="2"/>
    <line x1="150" y1="300" x2="490" y2="300" stroke="#4a4a45" stroke-width="2"/>
    <!-- Diagonal braces -->
    <line x1="150" y1="100" x2="200" y2="200" stroke="#4a4a45" stroke-width="1"/>
    <line x1="490" y1="100" x2="440" y2="200" stroke="#4a4a45" stroke-width="1"/>
    <line x1="200" y1="200" x2="150" y2="300" stroke="#4a4a45" stroke-width="1"/>
    <line x1="440" y1="200" x2="490" y2="300" stroke="#4a4a45" stroke-width="1"/>
  </g>
  
  <!-- Massive transmission coil -->
  <rect x="250" y="50" width="140" height="300" fill="#2a2a25" stroke="#555550" stroke-width="4"/>
  <!-- Copper windings (gleaming dully) -->
  <g stroke="#b87333" stroke-width="4" opacity="0.8">
    <line x1="260" y1="70" x2="380" y2="70"/>
    <line x1="260" y1="90" x2="380" y2="90"/>
    <line x1="260" y1="110" x2="380" y2="110"/>
    <line x1="260" y1="130" x2="380" y2="130"/>
    <line x1="260" y1="150" x2="380" y2="150"/>
    <line x1="260" y1="170" x2="380" y2="170"/>
    <line x1="260" y1="190" x2="380" y2="190"/>
    <line x1="260" y1="210" x2="380" y2="210"/>
    <line x1="260" y1="230" x2="380" y2="230"/>
    <line x1="260" y1="250" x2="380" y2="250"/>
    <line x1="260" y1="270" x2="380" y2="270"/>
    <line x1="260" y1="290" x2="380" y2="290"/>
    <line x1="260" y1="310" x2="380" y2="310"/>
    <line x1="260" y1="330" x2="380" y2="330"/>
  </g>
  
  <!-- Service panel (fully open) -->
  <rect x="280" y="150" width="80" height="100" fill="#3a3a35" stroke="#555550" stroke-width="3"/>
  <line x1="280" y1="175" x2="270" y2="170" stroke="#555550" stroke-width="2"/>
  <line x1="280" y1="200" x2="270" y2="205" stroke="#555550" stroke-width="2"/>
  <line x1="280" y1="225" x2="270" y2="220" stroke="#555550" stroke-width="2"/>
  <line x1="360" y1="175" x2="370" y2="170" stroke="#555550" stroke-width="2"/>
  <line x1="360" y1="200" x2="370" y2="205" stroke="#555550" stroke-width="2"/>
  <line x1="360" y1="225" x2="370" y2="220" stroke="#555550" stroke-width="2"/>
  
  <!-- Crystalline socket with antenna crystal installed -->
  <circle cx="320" cy="200" r="15" fill="#0a0a08" stroke="#333330" stroke-width="2"/>
  <!-- Antenna crystal glowing -->
  <polygon points="320,180 330,195 320,220 310,195" fill="#e0e0e0" stroke="#a0a0a0" stroke-width="2"/>
  <circle cx="320" cy="195" r="8" fill="#ffffff" opacity="0.9"/>
  <!-- Crystal glow -->
  <circle cx="320" cy="195" r="20" fill="#ffffff" opacity="0.3"/>
  <circle cx="320" cy="195" r="30" fill="#ff8800" opacity="0.1"/>
  
  <!-- Vibration lines around crystal -->
  <g stroke="#ff8800" stroke-width="1" opacity="0.5">
    <circle cx="320" cy="195" r="25"/>
    <circle cx="320" cy="195" r="35"/>
    <circle cx="320" cy="195" r="45"/>
  </g>
  
  <!-- Fog particles inside tower -->
  <circle cx="200" cy="100" r="3" fill="rgba(200,200,190,0.4)"/>
  <circle cx="400" cy="80" r="2" fill="rgba(200,200,190,0.3)"/>
  <circle cx="250" cy="300" r="3" fill="rgba(200,200,190,0.5)"/>
  <circle cx="450" cy="250" r="2" fill="rgba(200,200,190,0.4)"/>
  <circle cx="300" cy="350" r="2" fill="rgba(200,200,190,0.3)"/>
  
  <!-- Resonant frequency vibration effect -->
  <path d="M250,200 Q260,190 270,200 T290,200" stroke="#ff8800" stroke-width="1" fill="none" opacity="0.3"/>
  <path d="M350,200 Q360,190 370,200 T390,200" stroke="#ff8800" stroke-width="1" fill="none" opacity="0.3"/>
  <path d="M280,150 Q290,140 300,150 T320,150" stroke="#aa00ff" stroke-width="1" fill="none" opacity="0.2"/>
  <path d="M320,250 Q330,240 340,250 T360,250" stroke="#aa00ff" stroke-width="1" fill="none" opacity="0.2"/>
</svg>`
};