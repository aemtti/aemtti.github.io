(function(AB){
  const W=AB.Balance.world.width,F=AB.Balance.world.floorY;
  const floor={x:0,y:F,w:W,h:80,oneWay:false};
  AB.RoomTemplates=[
    {id:'forge-span',name:'단조 회랑',platforms:[floor,{x:250,y:520,w:230,h:22,oneWay:true},{x:610,y:455,w:240,h:22,oneWay:true},{x:990,y:520,w:210,h:22,oneWay:true},{x:1320,y:430,w:220,h:22,oneWay:true}],spawns:[420,790,1120,1450]},
    {id:'broken-steps',name:'부서진 계단',platforms:[floor,{x:240,y:545,w:220,h:22,oneWay:true},{x:520,y:465,w:220,h:22,oneWay:true},{x:800,y:385,w:220,h:22,oneWay:true},{x:1080,y:465,w:220,h:22,oneWay:true},{x:1360,y:545,w:180,h:22,oneWay:true}],spawns:[360,680,980,1320]},
    {id:'cinder-pits',name:'잿불 저수조',platforms:[floor,{x:190,y:450,w:260,h:22,oneWay:true},{x:570,y:535,w:260,h:22,oneWay:true},{x:940,y:430,w:270,h:22,oneWay:true},{x:1340,y:510,w:230,h:22,oneWay:true}],spawns:[300,720,1080,1450]},
    {id:'watcher-gallery',name:'감시자의 화랑',platforms:[floor,{x:310,y:505,w:260,h:22,oneWay:true},{x:700,y:410,w:360,h:22,oneWay:true},{x:1190,y:505,w:250,h:22,oneWay:true}],spawns:[460,820,1010,1340]},
    {id:'ash-vault',name:'재의 금고',platforms:[floor,{x:230,y:515,w:310,h:22,oneWay:true},{x:720,y:485,w:320,h:22,oneWay:true},{x:1220,y:515,w:300,h:22,oneWay:true}],spawns:[390,610,910,1300]}
  ];
})(window.AB=window.AB||{});
