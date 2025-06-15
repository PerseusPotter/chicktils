import { Builder } from './settingsLib';
import { StateProp } from './util/state';

export const $FONTS = new Map(java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames().map(v => [v.replace(/\s/g, ''), v]));
$FONTS.set('Mojangles', 'Mojangles');
/** @param {import('./settingsLib').Property<0, boolean>} */
const addDependency = prop => new StateProp(prop).and(prop.shouldShow);
const builder = new Builder('ChickTils', 'settings.json')
  .addPage('General')
  .addToggle(
    'enableGlobal', 'Enable', true,
    p => ({ desc: 'toggles mod globally (scuffed, it doesnt really work)' })
  )
  .addToggle(
    'autoUpdate', 'CheckForUpdates', true,
    p => ({ desc: 'check for updates when loaded' })
  )
  .addToggle(
    'isDev', 'IsDev', false,
    p => ({ desc: 'negatively impacts loading performance and may spam your chat' })
  )
  .addNumber(
    'pingRefreshDelay', 'PingRefreshDelay', 10,
    p => ({ desc: 'how often (in seconds) to refresh ping. set to 0 to disable ping. requires skytils' })
  )
  .addToggle(
    'preferUseTracer', 'PreferUseTracer', true,
    p => ({ desc: 'when available, prefer to use a tracer rather than an arrow' })
  )
  .addOption(
    'textGuiFont', 'TextGuiFont', 'Mojangles',
    p => ({ desc: 'font used for text guis', options: Array.from($FONTS.keys()) })
  )

  .addPage('Kuudra')
  .addToggle(
    'enablekuudra', 'EnableKuudra', true,
    p => ({})
  )

  .addDivider()
  .addToggle(
    'kuudraRenderPearlTarget', 'KuudraRenderPearlTarget', true,
    p => ({ desc: 'render location to aim at for sky pearls\n(but not hardcoded + actually accurate + with timer)', shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraPearlTargetColor', 'KuudraPearlTargetColor', 0xFFFF00FF,
    p => ({ shouldShow: addDependency(p.kuudraRenderPearlTarget), shouldShow: addDependency(p.kuudraRenderPearlTarget) })
  )

  .addDivider()
  .addToggle(
    'kuudraRenderEmptySupplySpot', 'KuudraRenderEmptySupplySpot', true,
    p => ({ desc: 'render available supply dropoff location', shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraEmptySupplySpotColor', 'KuudraEmptySupplySpotColor', 0xFF0000FF,
    p => ({ shouldShow: addDependency(p.kuudraRenderEmptySupplySpot) })
  )

  .addDivider()
  .addToggle(
    'kuudraBoxSupplies', 'KuudraBoxSupplies', true,
    p => ({ shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraBoxSuppliesColor', 'KuudraBoxSuppliesColor', 0x00FF00FF,
    p => ({ shouldShow: addDependency(p.kuudraBoxSupplies) })
  )
  .addColor(
    'kuudraBoxSuppliesGiantColor', 'KuudraBoxSuppliesGiantColor', 0,
    p => ({ shouldShow: addDependency(p.kuudraBoxSupplies) })
  )
  .addToggle(
    'kuudraBoxSuppliesEsp', 'KuudraBoxSuppliesEsp', true,
    p => ({ shouldShow: addDependency(p.kuudraBoxSupplies) })
  )

  .addDivider()
  .addToggle(
    'kuudraBoxChunks', 'KuudraBoxChunks', true,
    p => ({ shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraBoxChunksColor', 'KuudraBoxChunksColor', 0xFF00FFFF,
    p => ({ shouldShow: addDependency(p.kuudraBoxChunks) })
  )
  .addToggle(
    'kuudraBoxChunksEsp', 'KuudraBoxChunksEsp', true,
    p => ({ shouldShow: addDependency(p.kuudraBoxChunks) })
  )

  .addDivider()
  .addToggle(
    'kuudraShowCannonAim', 'KuudraShowCannonAim', true,
    p => ({ desc: 'render location to aim at for cannon, (useful for when client desyncs)', shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraCannonAimColor', 'KuudraCannonAimColor', 0xFFFF00FF,
    p => ({ shouldShow: addDependency(p.kuudraShowCannonAim) })
  )

  .addDivider()
  .addToggle(
    'kuudraCustomBossBar', 'KuudraCustomBossBar', true,
    p => ({ desc: 'rescale kuudra health bar in t5 to go 100% -> 0% twice', shouldShow: addDependency(p.enablekuudra) })
  )

  .addDivider()
  .addToggle(
    'kuudraBoxKuudra', 'KuudraBoxKuudra', true,
    p => ({ desc: 'draws box around kuudra', shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraBoxKuudraColor', 'KuudraBoxKuudraColor', 0xFF0000FF,
    p => ({ shouldShow: addDependency(p.kuudraBoxKuudra) })
  )
  .addToggle(
    'kuudraBoxKuudraEsp', 'KuudraBoxKuudraEsp', true,
    p => ({ shouldShow: addDependency(p.kuudraBoxKuudra) })
  )

  .addDivider()
  .addToggle(
    'kuudraDrawArrowToKuudra', 'KuudraDrawArrowToKuudra', true,
    p => ({ desc: 'draw arrow pointing to kuudra in p5', shouldShow: addDependency(p.enablekuudra) })
  )
  .addColor(
    'kuudraArrowToKuudraColor', 'KuudraArrowToKuudraColor', 0x00FFFFFF,
    p => ({ shouldShow: addDependency(p.kuudraDrawArrowToKuudra) })
  )

  .addDivider()
  .addToggle(
    'kuudraDrawHpGui', 'KuudraDrawHpOnScreen', true,
    p => ({ desc: 'draw hp of kuudra onto hud', shouldShow: addDependency(p.enablekuudra) })
  )
  .addAction(
    'moveKuudraHp', 'MoveKuudraHp',
    p => ({ shouldShow: addDependency(p.kuudraDrawHpGui) })
  )
  .addInteger(
    'kuudraDrawHpDec', 'KuudraDrawHpDecimals', 3,
    p => ({ desc: 'number of decimals/sigfigs in the hp', min: 0, max: 3, shouldShow: addDependency(p.kuudraDrawHpGui) })
  )

  .addDivider()
  .addToggle(
    'kuudraAutoRefillPearls', 'KuudraAutoRefillPearls', true,
    p => ({ desc: 'automatically run /gfs at start of each run to replenish used pearls', shouldShow: addDependency(p.enablekuudra) })
  )
  .addInteger(
    'kuudraAutoRefillPearlsAmount', 'KuudraAutoRefillPearlsAmount', 16,
    p => ({ desc: 'amount of pearls you want to start run with', min: 0, max: 560, shouldShow: addDependency(p.kuudraAutoRefillPearls) })
  )

  .addPage('Dungeon')
  .addToggle(
    'enabledungeon', 'EnableDungeon', true,
    p => ({})
  )

  .addDivider()
  .addToggle(
    'dungeonBoxMobs', 'DungeonBoxMobs', true,
    p => ({ desc: 'draws boxes around starred mobs\nonly mobs with both nametag and corresponding entity (no ghost nametags!)', shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonBoxMobEsp', 'DungeonBoxMobEsp', false,
    p => ({ shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxMobColor', 'DungeonBoxMobColor', 0x00FFFFFF,
    p => ({ desc: 'color for basic mobs', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxKeyColor', 'DungeonBoxKeyColor', 0x00FF00FF,
    p => ({ desc: 'color for wither/blood keys', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxSAColor', 'DungeonBoxSAColor', 0xFF0000FF,
    p => ({ desc: 'color for SAs', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxSMColor', 'DungeonBoxSkeleMasterColor', 0xFF8000FF,
    p => ({ desc: 'color for skele masters', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxFelColor', 'DungeonBoxFelColor', 0x00FF80FF,
    p => ({ desc: 'color for fels', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxChonkColor', 'DungeonBoxChonkersColor', 0xFF0080FF,
    p => ({ desc: 'color for withermancers, commanders, lords, and super archers', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addColor(
    'dungeonBoxMiniColor', 'DungeonBoxMiniColor', 0xB400B4FF,
    p => ({ desc: 'color for LAs,  FAs, and AAs', shouldShow: addDependency(p.dungeonBoxMobs) })
  )
  .addToggle(
    'dungeonBoxMobDisableInBoss', 'DungeonBoxMobDisableInBoss', false,
    p => ({ desc: 'pretty much only relevant for SAs in p2', shouldShow: addDependency(p.dungeonBoxMobs) })
  )

  .addDivider()
  .addToggle(
    'dungeonBoxWither', 'DungeonBoxWither', false,
    p => ({ desc: 'boxes wither lords\nindependent from box mobs', shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonBoxWitherEsp', 'DungeonBoxWitherEsp', true,
    p => ({ shouldShow: addDependency(p.dungeonBoxWither) })
  )
  .addColor(
    'dungeonBoxWitherColor', 'DungeonBoxWitherColor', 0x515A0BFF,
    p => ({ shouldShow: addDependency(p.dungeonBoxWither) })
  )

  .addDivider()
  .addToggle(
    'dungeonBoxLivid', 'DungeonBoxLivid', false,
    p => ({ desc: 'independent from box mobs', shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonBoxLividEsp', 'DungeonBoxLividEsp', true,
    p => ({ shouldShow: addDependency(p.dungeonBoxLivid) })
  )
  .addColor(
    'dungeonBoxLividColor', 'DungeonBoxLividColor', 0xFF0000FF,
    p => ({ shouldShow: addDependency(p.dungeonBoxLivid) })
  )
  .addToggle(
    'dungeonBoxLividDrawArrow', 'DungeonBoxLividDrawArrow', true,
    p => ({ shouldShow: addDependency(p.dungeonBoxLivid) })
  )

  .addDivider()
  .addToggle(
    'dungeonBoxIceSprayed', 'DungeonBoxIceSprayedMobs', false,
    p => ({ desc: 'boxes frozen mobs\nindependent from box mobs', shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonBoxIceSprayedEsp', 'DungeonBoxIceSprayedEsp', false,
    p => ({ shouldShow: addDependency(p.dungeonBoxIceSprayed) })
  )
  .addColor(
    'dungeonBoxIceSprayedOutlineColor', 'DungeonBoxIceSprayedOutlineColor', 0XADD8E6FF,
    p => ({ shouldShow: addDependency(p.dungeonBoxIceSprayed) })
  )
  .addColor(
    'dungeonBoxIceSprayedFillColor', 'DungeonBoxIceSprayedFillColor', 0XADBCE650,
    p => ({ shouldShow: addDependency(p.dungeonBoxIceSprayed) })
  )

  .addDivider()
  .addToggle(
    'dungeonBoxTeammates', 'DungeonBoxTeammates', true,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonBoxTeammatesEsp', 'DungeonBoxTeammatesEsp', true,
    p => ({ shouldShow: addDependency(p.dungeonBoxTeammates) })
  )
  .addColor(
    'dungeonBoxTeammatesMageColor', 'DungeonBoxTeammatesMageColor', 0x1793C4FF,
    p => ({ shouldShow: addDependency(p.dungeonBoxTeammates) })
  )
  .addColor(
    'dungeonBoxTeammatesArchColor', 'DungeonBoxTeammatesArchColor', 0xE80F0FFF,
    p => ({ shouldShow: addDependency(p.dungeonBoxTeammates) })
  )
  .addColor(
    'dungeonBoxTeammatesBersColor', 'DungeonBoxTeammatesBersColor', 0xF77C1BFF,
    p => ({ shouldShow: addDependency(p.dungeonBoxTeammates) })
  )
  .addColor(
    'dungeonBoxTeammatesTankColor', 'DungeonBoxTeammatesTankColor', 0x47D147FF,
    p => ({ shouldShow: addDependency(p.dungeonBoxTeammates) })
  )
  .addColor(
    'dungeonBoxTeammatesHealColor', 'DungeonBoxTeammatesHealColor', 0xFF00FFFF,
    p => ({ shouldShow: addDependency(p.dungeonBoxTeammates) })
  )

  .addDivider()
  .addToggle(
    'dungeonCamp', 'DungeonEnableCamp', true,
    p => ({ desc: 'blood camp helper', shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonCampTimer', 'DungeonCampShowTimer', false,
    p => ({ desc: 'render timer underneath boxes', shouldShow: addDependency(p.dungeonCamp) })
  )
  .addColor(
    'dungeonCampWireColor', 'DungeonCampWireColor', 0x00FF00FF,
    p => ({ desc: 'color of wireframe', shouldShow: addDependency(p.dungeonCamp) })
  )
  .addColor(
    'dungeonCampBoxColor', 'DungeonCampBoxColor', 0x00FFFFFF,
    p => ({ desc: 'color of shaded box', shouldShow: addDependency(p.dungeonCamp) })
  )
  .addToggle(
    'dungeonCampBoxEsp', 'DungeonCampBoxEsp', false,
    p => ({ shouldShow: addDependency(p.dungeonCamp) })
  )
  .addInteger(
    'dungeonCampSmoothTime', 'DungeonCampSmoothTime', 500,
    p => ({ desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1, shouldShow: addDependency(p.dungeonCamp) })
  )
  .addToggle(
    'dungeonCampSkipTimer', 'DungeonCampDialogueSkipTimer', false,
    p => ({ desc: 'timer until when to kill first 4 blood mobs', shouldShow: addDependency(p.dungeonCamp) })
  )
  .addAction(
    'moveDungeonCampSkipTimer', 'MoveDungeonCampSkipTimer',
    p => ({ shouldShow: addDependency(p.dungeonCampSkipTimer) })
  )

  .addDivider()
  .addToggle(
    'dungeonHecatombAlert', 'DungeonHecatombAlert', false,
    p => ({ desc: 'alert before end of run to swap to hecatomb (does not work for f4/m4/m7)', shouldShow: addDependency(p.enabledungeon) })
  )
  .addInteger(
    'dungeonHecatombAlertTime', 'DungeonHecatombAlertTime', 5000,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.dungeonHecatombAlert) })
  )
  .addToggle(
    'dungeonHecatombAlertSound', 'DungeonHecatombAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.dungeonHecatombAlert) })
  )

  .addDivider()
  .addToggle(
    'dungeonMap', 'DungeonMap', false,
    p => ({ desc: 'does not work yet', shouldShow: addDependency(p.enabledungeon) })
  )
  .addAction(
    'moveDungeonMap', 'MoveDungeonMap',
    p => ({ shouldShow: addDependency(p.dungeonMap) })
  )
  .addToggle(
    'dungeonMapHideBoss', 'DungeonMapHideInBoss', false,
    p => ({ shouldShow: addDependency(p.dungeonMap) })
  )
  .addToggle(
    'dungeonMapRenderHead', 'DungeonMapRenderPlayerHeads', false,
    p => ({ desc: 'render heads instead of arrows on map', shouldShow: addDependency(p.dungeonMap) })
  )
  .addOption(
    'dungeonMapRenderName', 'DungeonMapRenderPlayerNames', 'Holding Leap',
    p => ({ desc: 'render names of players above their marker', options: ['Always', 'Never', 'Holding Leap'], shouldShow: addDependency(p.dungeonMap) })
  )
  .addOption(
    'dungeonMapRenderClass', 'DungeonMapRenderPlayerClass', 'Always',
    p => ({ desc: 'render class of players above their marker', options: ['Always', 'Never', 'Holding Leap'], shouldShow: addDependency(p.dungeonMap) })
  )
  .addOption(
    'dungeonMapBoxDoors', 'DungeonMapBoxDoors', 'Blood Doors',
    p => ({ desc: 'boxes wither/blood doors', options: ['Always', 'Never', 'Blood Doors'], shouldShow: addDependency(p.dungeonMap) })
  )
  .addColor(
    'dungeonMapBoxDoorOutlineColor', 'DungeonMapBoxDoorOutlineColor', 0x00FF00FF,
    p => ({ shouldShow: addDependency(p.dungeonMap) })
  )
  .addColor(
    'dungeonMapBoxDoorFillColor', 'DungeonMapBoxDoorFillColor', 0x00FF0050,
    p => ({ shouldShow: addDependency(p.dungeonMap) })
  )
  .addColor(
    'dungeonMapBoxLockedDoorOutlineColor', 'DungeonMapBoxLockedDoorOutlineColor', 0xFF0000FF,
    p => ({ shouldShow: addDependency(p.dungeonMap) })
  )
  .addColor(
    'dungeonMapBoxLockedDoorFillColor', 'DungeonMapBoxLockedDoorFillColor', 0xFF000050,
    p => ({ shouldShow: addDependency(p.dungeonMap) })
  )

  .addOption(
    'dungeonShowSecrets', 'DungeonShowSecrets', 'None',
    p => ({ desc: 'does not work yet, requires map to be on', options: ['None', 'Wire', 'Waypoint'], shouldShow: addDependency(p.dungeonMap) })
  )

  .addDivider()
  .addToggle(
    'dungeonHideHealerPowerups', 'DungeonHideHealerPowerups', true,
    p => ({ desc: 'hide healer power orbs (and particles!)', shouldShow: addDependency(p.enabledungeon) })
  )

  .addToggle(
    'dungeonAutoArchitect', 'DungeonAutoGFSArchitect', false,
    p => ({ desc: 'auto gfs on puzzle fail, and a friendly reminder', shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addOption(
    'dungeonNecronDragTimer', 'DungeonNecronDragTimer', 'None',
    p => ({ desc: 'timer when necron does some dragging\n(timer will automatically pop up when instamidding!)', options: ['OnScreen', 'InstaMid', 'Both', 'None'], shouldShow: addDependency(p.enabledungeon) })
  )
  .addAction(
    'moveNecronDragTimer', 'MoveNecronDragTimer',
    p => ({ shouldShow: addDependency(p.dungeonNecronDragTimer) })
  )
  .addInteger(
    'dungeonNecronDragDuration', 'DungeonNecronDragDuration', 120,
    p => ({ desc: 'in ticks, 120 = move/leap, 163 = immunity', min: 0, shouldShow: addDependency(p.dungeonNecronDragTimer) })
  )

  .addDivider()
  .addOption(
    'dungeonDev4Helper', 'DungeonClearViewDev4', 'Both',
    p => ({ desc: 'clearer vision while doing 4th dev', options: ['None', 'Titles', 'Particles', 'Both'], shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonDev4HighlightBlock', 'DungeonDev4HighlightBlock', true,
    p => ({ desc: 'highlights emerald block green, bypasses chunk updates', shouldShow: addDependency(p.enabledungeon) })
  )
  .addColor(
    'dungeonDev4HighlightBlockColor', 'DungeonDev4HighlightBlockColor', 0x50C878FF,
    p => ({ shouldShow: addDependency(p.dungeonDev4HighlightBlock) })
  )
  .addToggle(
    'dungeonDev4HighlightBlockEsp', 'DungeonDev4HighlightBlockEsp', false,
    p => ({ shouldShow: addDependency(p.dungeonDev4HighlightBlock) })
  )

  .addDivider()
  .addToggle(
    'dungeonStairStonkHelper', 'DungeonStairStonkHelper', false,
    p => ({ desc: 'stair stonker stuff', shouldShow: addDependency(p.enabledungeon) })
  )
  .addColor(
    'dungeonStairStonkHelperColor', 'DungeonStairStonkHelperColor', 0xFF0000FF,
    p => ({ desc: 'draw line to align yourself to dig down a stair\nsame as soopy but does not cut fps in half', shouldShow: addDependency(p.dungeonStairStonkHelper) })
  )
  .addColor(
    'dungeonStairStonkHelperHighlightColor', 'DungeonStairStonkHelperHighlightColor', 0x7DF9FF80,
    p => ({ desc: 'highlight stairs this color if they need to be ghosted to stonk', shouldShow: addDependency(p.dungeonStairStonkHelper) })
  )

  .addDivider()
  .addToggle(
    'dungeonAutoRefillPearls', 'DungeonAutoRefillPearls', false,
    p => ({ desc: 'automatically run /gfs to replenish used pearls', shouldShow: addDependency(p.enabledungeon) })
  )
  .addInteger(
    'dungeonAutoRefillPearlsAmount', 'DungeonAutoRefillPearlsAmount', 16,
    p => ({ desc: 'amount of pearls you want to have at a time', min: 0, max: 560, shouldShow: addDependency(p.dungeonAutoRefillPearls) })
  )
  .addInteger(
    'dungeonAutoRefillPearlsThreshold', 'DungeonAutoRefillPearlsThreshold', 0,
    p => ({ desc: 'automatically replenish pearls mid run when below this amount\n0 to disable', min: 0, max: 560, shouldShow: addDependency(p.dungeonAutoRefillPearls) })
  )
  .addToggle(
    'dungeonAutoRefillPearlsGhostPickFix', 'DungeonAutoRefillPearlsGhostPickFix', false,
    p => ({ desc: 'dont replenish when ghost pick\n(turn on if you ghost using pearls)', shouldShow: new StateProp(p.dungeonAutoRefillPearlsThreshold).notequals(0).and(p.dungeonAutoRefillPearlsThreshold.shouldShow) })
  )

  .addDivider()
  .addToggle(
    'dungeonM7LBWaypoints', 'DungeonDragonLBWaypoints', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonGoldorDpsStartAlert', 'DungeonGoldorDpsStartAlert', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addInteger(
    'dungeonGoldorDpsStartAlertTime', 'DungeonGoldorDpsStartAlertTime', 500,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.dungeonGoldorDpsStartAlert) })
  )
  .addToggle(
    'dungeonGoldorDpsStartAlertSound', 'DungeonGoldorDpsStartAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.dungeonGoldorDpsStartAlert) })
  )

  .addDivider()
  .addToggle(
    'dungeonTerminalBreakdown', 'DungeonTerminalBreakdown', false,
    p => ({ desc: 'displays terminals done by each person', shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonPlaySoundKey', 'DungeonPlaySoundOnKey', false,
    p => ({ desc: 'play dulkir secret sound on pickup key', shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonIceSprayAlert', 'DungeonRareMobDropAlert', true,
    p => ({ desc: 'alert on ice spray/sm cp', shouldShow: addDependency(p.enabledungeon) })
  )
  .addInteger(
    'dungeonIceSprayAlertTime', 'DungeonRareMobDropAlertTime', 2000,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.dungeonIceSprayAlert) })
  )
  .addToggle(
    'dungeonIceSprayAlertSound', 'DungeonRareMobDropAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.dungeonIceSprayAlert) })
  )

  .addDivider()
  .addToggle(
    'dungeonTerminalsHelper', 'DungeonTerminalsHelper', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addOption(
    'dungeonTerminalsGuiSize', 'DungeonTerminalsGuiSize', 'Unchanged',
    p => ({ desc: 'change gui size while in terminals', options: ['Unchanged', 'Small', 'Normal', 'Large', '4x', '5x', 'Auto'], shouldShow: addDependency(p.dungeonTerminalsHelper) })
  )
  .addToggle(
    'dungeonTerminalsHideInv', 'DungeonTerminalsHideInventory', false,
    p => ({ desc: 'hide inventory in terminals\nplease do not use, it will 1) break all solvers, 2) look shit, 3) probably breaks other things like locking slots', shouldShow: addDependency(p.dungeonTerminalsHelper) })
  )
  .addToggle(
    'dungeonTerminalsHideInvScuffed', 'DungeonTerminalsHideInventoryScuffed', false,
    p => ({ desc: 'hide inventory in terminals, but scuffed (basically centers around the chest instead of hiding)', shouldShow: addDependency(p.dungeonTerminalsHelper) })
  )

  .addDivider()
  .addToggle(
    'dungeonSpiritBearHelper', 'DungeonSpiritBearHelper', false,
    p => ({ desc: 'predict spirit bear spawn location', shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonSpiritBearTimer', 'DungeonSpiritBearShowTimer', false,
    p => ({ desc: 'render timer above box', shouldShow: addDependency(p.dungeonSpiritBearHelper) })
  )
  .addColor(
    'dungeonSpiritBearWireColor', 'DungeonSpiritBearWireColor', 0x00FF00FF,
    p => ({ desc: 'color of wireframe', shouldShow: addDependency(p.dungeonSpiritBearHelper) })
  )
  .addColor(
    'dungeonSpiritBearBoxColor', 'DungeonSpiritBearBoxColor', 0x00FFFFFF,
    p => ({ desc: 'color of shaded box', shouldShow: addDependency(p.dungeonSpiritBearHelper) })
  )
  .addToggle(
    'dungeonSpiritBearBoxEsp', 'DungeonSpiritBearBoxEsp', false,
    p => ({ shouldShow: addDependency(p.dungeonSpiritBearHelper) })
  )
  .addInteger(
    'dungeonSpiritBearSmoothTime', 'DungeonSpiritBearSmoothTime', 500,
    p => ({ desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1, shouldShow: addDependency(p.dungeonSpiritBearHelper) })
  )
  .addToggle(
    'dungeonSpiritBearTimerHud', 'DungeonSpiritBearTimerHud', true,
    p => ({ desc: 'show spirit bear timer on hud', shouldShow: addDependency(p.dungeonSpiritBearHelper) })
  )
  .addAction(
    'moveSpiritBearTimerHud', 'MoveSpiritBearTimerHud',
    p => ({ shouldShow: addDependency(p.dungeonSpiritBearTimerHud) })
  )

  .addDivider()
  .addToggle(
    'dungeonSilverfishHasteTimer', 'DungeonSilverfishHasteTimer', false,
    p => ({ desc: 'render how much longer haste from silverfish will last\nobsolete after haste artifact', shouldShow: addDependency(p.enabledungeon) })
  )
  .addAction(
    'moveSilverfishHasteTimer', 'MoveSilverfishHasteTimer',
    p => ({ shouldShow: addDependency(p.dungeonSilverfishHasteTimer) })
  )

  .addDivider()
  .addToggle(
    'dungeonHideFallingBlocks', 'DungeonHideFallingBlocks', true,
    p => ({ desc: 'dont render falling blocks in boss', shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonHideWitherKing', 'DungeonHideWitherKing', true,
    p => ({ desc: 'dont render wither king tentacles', shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonDragonHelper', 'DungeonDragonHelper', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addToggle(
    'dungeonDragonHelperTimer2D', 'DungeonDragonHelperTimerHUD', false,
    p => ({ desc: 'render timer until dragon spawn on hud', shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addAction(
    'moveDragonHelperTimer', 'MoveDragonHelperTimer',
    p => ({ shouldShow: addDependency(p.dungeonDragonHelperTimer2D) })
  )
  .addToggle(
    'dungeonDragonHelperTimer3D', 'DungeonDragonHelperTimerWorld', false,
    p => ({ desc: 'render timer until dragon spawn under its chin', shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addOption(
    'dungeonDragonHelperAlert', 'DungeonDragonHelperAlert', 'None',
    p => ({ desc: 'show alert when dragon is spawning', options: ['None', 'All', 'Split'], shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addInteger(
    'dungeonDragonHelperAlertTime', 'DungeonDragonHelperAlertTime', 1000,
    p => ({ desc: 'in ms', min: 0, shouldShow: new StateProp(p.dungeonDragonHelperAlert).notequals('None').and(p.dungeonDragonHelperAlert.shouldShow) })
  )
  .addToggle(
    'dungeonDragonHelperAlertSound', 'DungeonDragonHelperAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: new StateProp(p.dungeonDragonHelperAlert).notequals('None').and(p.dungeonDragonHelperAlert.shouldShow) })
  )
  .addToggle(
    'dungeonDragonHelperSplit', 'DungeonDragonHelperSplit', true,
    p => ({ desc: 'do you split', shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addText(
    'dungeonDragonHelperPrioS', 'DungeonDragonHelperPrioSplit', 'ogrbp',
    p => ({ desc: 'priority to use when splitting\nbers team -> ogrbp <- arch team', shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addText(
    'dungeonDragonHelperPrioNS', 'DungeonDragonHelperPrioNoSplit', 'robpg',
    p => ({ desc: 'priority to use when NOT splitting', shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addText(
    'dungeonDragonHelperBersTeam', 'DungeonDragonHelperBersTeam', 'bmh',
    p => ({ desc: 'classes that go w/ bers team\nb m h | a t', shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addOption(
    'dungeonDragonHelperTrackHits', 'DungeonDragonHelperTrackHits', 'Full',
    p => ({ desc: 'tracks number of arrow hits during drag dps\nnote: will count all arrow hits (will count any hits on husks)\nBurst: count initial "burst" of hits at start of spawn\n(i.e. first 1s if a/b, otherwise time until 5 lbs)\nFull: hits during entire duration dragon is alive\nBoth: full + burst stats', options: ['None', 'Burst', 'Full', 'Both'], shouldShow: addDependency(p.dungeonDragonHelper) })
  )
  .addOption(
    'dungeonDragonHelperTrackHitsTimeUnit', 'DungeonDragonHelperTrackHitsTimeUnit', 'Both',
    p => ({ desc: 'note: seconds is still measured in ticks, not real time', options: ['Ticks', 'Seconds', 'Both'], shouldShow: new StateProp(p.dungeonDragonHelperTrackHits).notequals('None').and(p.dungeonDragonHelperTrackHits.shouldShow) })
  )

  .addDivider()
  .addToggle(
    'dungeonLBPullProgress', 'DungeonLBPullProgress', false,
    p => ({ desc: 'play sounds indicating bow pull progress (accounting for lag)', shouldShow: addDependency(p.enabledungeon) })
  )
  .addNumber(
    'dungeonLBPullProgressVolume', 'DungeonLBPullProgressVolume', 1,
    p => ({ min: 0, max: 5, shouldShow: addDependency(p.dungeonLBPullProgress) })
  )
  .addInteger(
    'dungeonLBPullProgressThreshold', 'DungeonLBPullProgressThreshold', 8,
    p => ({ desc: 'how many ticks to swap to different sound\n0: always, 21: never', min: 0, max: 21, shouldShow: addDependency(p.dungeonLBPullProgress) })
  )

  .addDivider()
  .addToggle(
    'dungeonSimonSays', 'DungeonSimonSays', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addColor(
    'dungeonSimonSaysColor1', 'DungeonSimonSaysColor', 0x00FF00A0,
    p => ({ desc: 'color of the button to press ', shouldShow: addDependency(p.dungeonSimonSays) })
  )
  .addColor(
    'dungeonSimonSaysColor2', 'DungeonSimonSaysColorNext', 0xFFFF00A0,
    p => ({ desc: 'color of the next button to press', shouldShow: addDependency(p.dungeonSimonSays) })
  )
  .addColor(
    'dungeonSimonSaysColor3', 'DungeonSimonSaysColorOther', 0xFF0000A0,
    p => ({ desc: 'color of the other buttons', shouldShow: addDependency(p.dungeonSimonSays) })
  )
  .addOption(
    'dungeonSimonSaysBlock', 'DungeonSimonSaysBlockClicks', 'ExceptWhenCrouching',
    p => ({ desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'], shouldShow: addDependency(p.dungeonSimonSays) })
  )

  .addDivider()
  .addToggle(
    'dungeonArrowAlign', 'DungeonArrowAlign', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addOption(
    'dungeonArrowAlignBlock', 'DungeonArrowAlignBlockClicks', 'ExceptWhenCrouching',
    p => ({ desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'], shouldShow: addDependency(p.dungeonArrowAlign) })
  )
  .addToggle(
    'dungeonArrowAlignLeavePD', 'DungeonArrowAlignLeaveOnePD', true,
    p => ({ desc: 'leave 1 frame at 1 click away during pd', shouldShow: addDependency(p.dungeonArrowAlign) })
  )

  .addDivider()
  .addToggle(
    'dungeonGoldorFrenzyTimer', 'DungeonGoldorFrenzyTimer', false,
    p => ({ desc: 'show timer until next goldor frenzy tick', shouldShow: addDependency(p.enabledungeon) })
  )
  .addAction(
    'moveGoldorFrenzyTimer', 'MoveGoldorFrenzyTimer',
    p => ({ shouldShow: addDependency(p.dungeonGoldorFrenzyTimer) })
  )

  .addDivider()
  .addNumber(
    'dungeonBlockOverlaySize', 'DungeonBlockOverlaySize', 1,
    p => ({ desc: 'size of overlay when inside an opaque block\nin range [0, 1], 0 = none, 1 = default', min: 0, max: 1, shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addOption(
    'dungeonHideHealerFairy', 'DungeonHideHealerFairy', 'Own',
    p => ({ options: ['Never', 'Own', 'Always'], shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonDHubHighlightLow', 'DungeonDHubSelectorHighlight', true,
    p => ({ desc: 'green for low players :)', shouldShow: addDependency(p.enabledungeon) })
  )

  .addDivider()
  .addToggle(
    'dungeonTerracottaRespawn', 'DungeonTerracottaRespawnTimer', false,
    p => ({ shouldShow: addDependency(p.enabledungeon) })
  )
  .addOption(
    'dungeonTerracottaRespawnType', 'DungeonTerracottaRespawnTimerType', 'Timer',
    p => ({ options: ['Timer', 'Box', 'Both'], shouldShow: addDependency(p.dungeonTerracottaRespawn) })
  )
  .addColor(
    'dungeonTerracottaRespawnOutlineColor', 'DungeonTerracottaRespawnOutlineColor', 0x91553DFF,
    p => ({ shouldShow: new StateProp(p.dungeonTerracottaRespawnType).notequals('Timer').and(p.dungeonTerracottaRespawnType.shouldShow) })
  )
  .addColor(
    'dungeonTerracottaRespawnFillColor', 'DungeonTerracottaRespawnFillColor', 0xA27157A0,
    p => ({ shouldShow: new StateProp(p.dungeonTerracottaRespawnType).notequals('Timer').and(p.dungeonTerracottaRespawnType.shouldShow) })
  )
  .addToggle(
    'dungeonTerracottaRespawnGui', 'DungeonTerracottaRespawnGui', false,
    p => ({ desc: 'render the timer for the first terracotta on hud', shouldShow: addDependency(p.dungeonTerracottaRespawn) })
  )
  .addAction(
    'moveDungeonTerracottaRespawnGui', 'MoveDungeonTerracottaRespawnGui',
    p => ({ shouldShow: addDependency(p.dungeonTerracottaRespawnGui) })
  )

  .addDivider()
  .addToggle(
    'dungeonStormClearLaser', 'DungeonStormClearLaserChecker', false,
    p => ({ desc: 'warn when someone is using laser in storm clear', shouldShow: addDependency(p.enabledungeon) })
  )

  .addPage('Stat Gui')
  .addToggle(
    'enablestatgui', 'EnableStatGUI', false,
    p => ({ desc: 'render stats from tab onto hud' })
  )
  .addToggle(
    'loc0', 'EnablePrivateIslandGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc0', 'MovePrivateIslandGUI',
    p => ({ shouldShow: addDependency(p.loc0) })
  )
  .addToggle(
    'loc1', 'EnableHubGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc1', 'MoveHubGUI',
    p => ({ shouldShow: addDependency(p.loc1) })
  )
  .addToggle(
    'loc2', 'EnableDungeonHubGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc2', 'MoveDungeonHubGUI',
    p => ({ shouldShow: addDependency(p.loc2) })
  )
  .addToggle(
    'loc3', 'EnableTheFarmingIslandsGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc3', 'MoveTheFarmingIslandsGUI',
    p => ({ shouldShow: addDependency(p.loc3) })
  )
  .addToggle(
    'loc4', 'EnableGardenGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc4', 'MoveGardenGUI',
    p => ({ shouldShow: addDependency(p.loc4) })
  )
  .addToggle(
    'loc5', 'EnableTheParkGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc5', 'MoveTheParkGUI',
    p => ({ shouldShow: addDependency(p.loc5) })
  )
  .addToggle(
    'loc6', 'EnableGoldMineGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc6', 'MoveGoldMineGUI',
    p => ({ shouldShow: addDependency(p.loc6) })
  )
  .addToggle(
    'loc7', 'EnableDeepCavernsGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc7', 'MoveDeepCavernsGUI',
    p => ({ shouldShow: addDependency(p.loc7) })
  )
  .addToggle(
    'loc8', 'EnableDwarvenMinesGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc8', 'MoveDwarvenMinesGUI',
    p => ({ shouldShow: addDependency(p.loc8) })
  )
  .addToggle(
    'loc9', 'EnableCrystalHollowsGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc9', 'MoveCrystalHollowsGUI',
    p => ({ shouldShow: addDependency(p.loc9) })
  )
  .addToggle(
    'loc10', 'EnableSpidersDenGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc10', 'MoveSpidersDenGUI',
    p => ({ shouldShow: addDependency(p.loc10) })
  )
  .addToggle(
    'loc11', 'EnableTheEndGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc11', 'MoveTheEndGUI',
    p => ({ shouldShow: addDependency(p.loc11) })
  )
  .addToggle(
    'loc12', 'EnableCrimsonIsleGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc12', 'MoveCrimsonIsleGUI',
    p => ({ shouldShow: addDependency(p.loc12) })
  )
  .addToggle(
    'loc13', 'EnableKuudraGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc13', 'MoveKuudraGUI',
    p => ({ shouldShow: addDependency(p.loc13) })
  )
  .addToggle(
    'loc14', 'EnableTheRiftGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc14', 'MoveTheRiftGUI',
    p => ({ shouldShow: addDependency(p.loc14) })
  )
  .addToggle(
    'loc15', 'EnableJerrysWorkshopGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc15', 'MoveJerrysWorkshopGUI',
    p => ({ shouldShow: addDependency(p.loc15) })
  )
  .addToggle(
    'loc16', 'EnableCatacombsGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc16', 'MoveCatacombsGUI',
    p => ({ shouldShow: addDependency(p.loc16) })
  )
  .addToggle(
    'loc17', 'EnableBackwaterBayouGUI', true,
    p => ({ shouldShow: addDependency(p.enablestatgui) })
  )
  .addAction(
    'moveLoc17', 'MoveBackwaterBayouGUI',
    p => ({ shouldShow: addDependency(p.loc17) })
  )

  .addPage('Server Tracker')
  .addToggle(
    'enableservertracker', 'EnableServerTracker', true,
    p => ({ desc: 'tracks servers you\'ve been to, also /warp tab complete' })
  )
  .addInteger(
    'serverTrackerTransferCd', 'ServerTrackerTransferCd', 3000,
    p => ({ desc: 'delays warps by this long if spammed too quickly', min: 0, shouldShow: addDependency(p.enableservertracker) })
  )
  .addText(
    'serverTrackerCdMessage', 'ServerTrackerCdMessage', 'waiting for cd (u.U)｡｡｡ zzZ',
    p => ({ shouldShow: addDependency(p.enableservertracker) })
  )

  .addPage('RatTils')
  .addToggle(
    'enablerattils', 'EnableRatTils', true,
    p => ({ desc: 'boxes cheese and other stuff' })
  )
  .addDivider()
  .addColor(
    'ratTilsBoxColor', 'RatTilsBoxColor', 0x00FF80FF,
    p => ({ shouldShow: addDependency(p.enablerattils) })
  )
  .addToggle(
    'ratTilsBoxEsp', 'RatTilsBoxEsp', true,
    p => ({ shouldShow: addDependency(p.enablerattils) })
  )
  .addDivider()
  .addInteger(
    'ratTilsAlertTime', 'RatTilsAlertTime', 2000,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.enablerattils) })
  )
  .addToggle(
    'ratTilsAlertSound', 'RatTilsAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.enablerattils) })
  )
  .addDivider()
  .addText(
    'ratTilsMessage', 'RatTilsMessage', 'i.imgur.com/8da4IiM.png',
    p => ({ desc: 'empty to disable', shouldShow: addDependency(p.enablerattils) })
  )
  .addText(
    'ratTilsChannel', 'RatTilsChannel', 'pc',
    p => ({ shouldShow: new StateProp(p.ratTilsMessage).notequals('').and(p.ratTilsMessage.shouldShow) })
  )
  .addDivider()
  .addToggle(
    'ratTilsMuteSound', 'RatTilsMuteSound', true,
    p => ({ desc: 'mute rat squeaking sounds', shouldShow: addDependency(p.enablerattils) })
  )

  .addPage('Powder Chest')
  .addToggle(
    'enablepowderalert', 'EnablePowderAlert', false,
    p => ({ desc: 'alerts when powder chest spawns' })
  )
  .addDivider()
  .addInteger(
    'powderScanRange', 'PowderScanRange', 10,
    p => ({ min: 0, shouldShow: addDependency(p.enablepowderalert) })
  )
  .addDivider()
  .addToggle(
    'powderBoxEsp', 'PowderBoxEsp', true,
    p => ({ shouldShow: addDependency(p.enablepowderalert) })
  )
  .addColor(
    'powderBoxColor', 'PowderBoxColor', 0x00FFFFA0,
    p => ({ shouldShow: addDependency(p.enablepowderalert) })
  )
  .addColor(
    'powderBoxColor2', 'PowderBoxColorDead', 0xFF0000FF,
    p => ({ desc: '2nd color of gradient  between 1st and 2nd based on when chest will despawn', shouldShow: addDependency(p.enablepowderalert) })
  )
  .addDivider()
  .addInteger(
    'powderAlertTime', 'PowderAlertTime', 1000,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.enablepowderalert) })
  )
  .addToggle(
    'powderAlertSound', 'PowderAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.enablepowderalert) })
  )
  .addDivider()
  .addToggle(
    'powderBlockRewards', 'PowderHideMessage', true,
    p => ({ desc: 'hides chest rewards message', shouldShow: addDependency(p.enablepowderalert) })
  )
  .addToggle(
    'powderShowPowder', 'PowderHideMessageShowPowder', true,
    p => ({ desc: 'keep the powder gain message', shouldShow: addDependency(p.powderBlockRewards) })
  )

  .addPage('Crystal Alert')
  .addToggle(
    'enablecrystalalert', 'EnableCrystalAlert', false,
    p => ({ desc: 'alerts when end crystals spawn' })
  )
  .addColor(
    'crystalBoxColor', 'CrystalBoxColor', 0x00FF00FF,
    p => ({ shouldShow: addDependency(p.enablecrystalalert) })
  )
  .addToggle(
    'crystalBoxEsp', 'CrystalBoxEsp', true,
    p => ({ shouldShow: addDependency(p.enablecrystalalert) })
  )
  .addInteger(
    'crystalAlertTime', 'CrystalAlertTime', 1000,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.enablecrystalalert) })
  )
  .addToggle(
    'crystalAlertSound', 'CrystalAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.enablecrystalalert) })
  )

  .addPage('Command Aliases')
  .addToggle(
    'enablecmdalias', 'EnableCommandAliases', true,
    p => ({})
  )
  .addToggle(
    'cmdAliasStorage', 'EnableStorageShortcut', true,
    p => ({ desc: 'e.g. /b1, /e2, and /3 for /backpack 1, /enderchest 2, /backpack 3 respectively', shouldShow: addDependency(p.enablecmdalias) })
  )
  .addToggle(
    'cmdAliasDungeon', 'EnableDungeonShortcut', true,
    p => ({ desc: 'e.g. /f1, /m1, /fe', shouldShow: addDependency(p.enablecmdalias) })
  )
  .addToggle(
    'cmdAliasKuudra', 'EnableKuudraShortcut', true,
    p => ({ desc: 'e.g. /k1', shouldShow: addDependency(p.enablecmdalias) })
  )

  .addPage('Quiver Display')
  .addToggle(
    'enablequiver', 'EnableQuiverDisplay', false,
    p => ({ desc: 'arrow display on hud, only works when holding bow' })
  )
  .addAction(
    'moveQuiver', 'MoveQuiverDisplay',
    p => ({ shouldShow: addDependency(p.enablequiver) })
  )
  .addOption(
    'quiverSize', 'QuiverMaxSize', 'Giant',
    p => ({ desc: 'size of quiver (based on feather collection)', options: ['Medium', 'Large', 'Giant'], shouldShow: addDependency(p.enablequiver) })
  )
  .addToggle(
    'quiverShowRefill', 'QuiverShowRefillCost', false,
    p => ({ desc: 'show refill cost', shouldShow: addDependency(p.enablequiver) })
  )
  .addOption(
    'quiverRefillCost', 'QuiverRefillCostType', 'Instant',
    p => ({ desc: 'method of refilling\nInstant: whatever is fastest\nIndividual: spam left click at jax (cheaper, also ur a loser)\nJax: same as instant but jax flint arrows expensiver\nOphelia: same as instant', options: ['Instant', 'Individual', 'Jax', 'Ophelia'], shouldShow: addDependency(p.quiverShowRefill) })
  )
  .addPercent(
    'quiverShowRefillThresh', 'QuiverRefillCostDisplayThreshold', 25,
    p => ({ desc: 'only show refill cost when below this amount full', min: 0, max: 100, shouldShow: addDependency(p.quiverShowRefill) })
  )

  .addPage('Rabbit')
  .addToggle(
    'enablerabbit', 'EnableRabbitTils', false,
    p => ({})
  )
  .addToggle(
    'rabbitShowBestUpgrade', 'RabbitTilsShowBestUpgrade', true,
    p => ({ desc: 'highlight most cost effective rabbit upgrade', shouldShow: addDependency(p.enablerabbit) })
  )
  .addToggle(
    'rabbitCondenseChat', 'RabbitTilsCondenseChat', true,
    p => ({ desc: 'has been promoted lookin mf', shouldShow: addDependency(p.enablerabbit) })
  )

  .addPage('ChatTils')
  .addToggle(
    'enablechattils', 'EnableChatTils', false,
    p => ({})
  )

  .addDivider()
  .addToggle(
    'chatTilsWaypoint', 'ChatTilsFindWaypoints', true,
    p => ({ desc: 'look for waypoints in all the chats', shouldShow: addDependency(p.enablechattils) })
  )
  .addOption(
    'chatTilsWaypointType', 'ChatTilsWaypointType', 'Box',
    p => ({ desc: 'type of waypoint', options: ['Box', 'Wireframe', 'None'], shouldShow: addDependency(p.chatTilsWaypoint) })
  )
  .addColor(
    'chatTilsWaypointColor', 'ChatTilsWaypointColor', 0xC80000FF,
    p => ({ shouldShow: addDependency(p.chatTilsWaypoint) })
  )
  .addToggle(
    'chatTilsWaypointBeacon', 'ChatTilsWaypointShowBeacon', true,
    p => ({ desc: 'render beacon to waypoint', shouldShow: addDependency(p.chatTilsWaypoint) })
  )
  .addToggle(
    'chatTilsWaypointName', 'ChatTilsWaypointShowName', false,
    p => ({ desc: 'show name of player who sent waypoint', shouldShow: addDependency(p.chatTilsWaypoint) })
  )
  .addInteger(
    'chatTilsWaypointDuration', 'ChatTilsWaypointDuration', 60,
    p => ({ desc: 'time in seconds, 0 = forever', min: 0, shouldShow: addDependency(p.chatTilsWaypoint) })
  )
  .addToggle(
    'chatTilsWaypointShowOwn', 'ChatTilsWaypointShowOwn', true,
    p => ({ desc: 'show your own waypoints', shouldShow: addDependency(p.chatTilsWaypoint) })
  )
  .addToggle(
    'chatTilsWaypointPersist', 'ChatTilsWaypointPersist', false,
    p => ({ desc: 'whether to persist on swapping servers', shouldShow: addDependency(p.chatTilsWaypoint) })
  )

  .addDivider()
  .addOption(
    'chatTilsHideBonzo', 'ChatTilsHidePartyChatBonzo', 'False',
    p => ({ desc: '"Bonzo Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: addDependency(p.enablechattils) })
  )
  .addOption(
    'chatTilsHidePhoenix', 'ChatTilsHidePartyChatPhoenix', 'False',
    p => ({ desc: '"Phoenix Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: addDependency(p.enablechattils) })
  )
  .addOption(
    'chatTilsHideSpirit', 'ChatTilsHidePartyChatSpirit', 'False',
    p => ({ desc: '"Spirit Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: addDependency(p.enablechattils) })
  )
  .addOption(
    'chatTilsHideLeap', 'ChatTilsHidePartyChatLeaps', 'False',
    p => ({ desc: '"Leaped/Leaping to plinkingndriving" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: addDependency(p.enablechattils) })
  )
  .addOption(
    'chatTilsHideMelody', 'ChatTilsHidePartyChatMelody', 'False',
    p => ({ desc: '"melody (1/4)/25%" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: addDependency(p.enablechattils) })
  )
  .addToggle(
    'chatTilsCompactMelody', 'ChatTilsCompactPartyChatMelody', true,
    p => ({ desc: 'only keep most recent melody message from a player', shouldShow: addDependency(p.enablechattils) })
  )

  .addDivider()
  .addToggle(
    'chatTilsClickAnywhereFollow', 'ChatTilsClickAnywhereFollow', false,
    p => ({ desc: 'click anywhere after opening chat to follow party member\n(mostly for diana/assfang/jumpy dt cube)', shouldShow: addDependency(p.enablechattils) })
  )
  .addToggle(
    'chatTilsClickAnywhereFollowOnlyLead', 'ChatTilsClickAnywhereFollowOnlyLead', true,
    p => ({ desc: 'only follow leader', shouldShow: addDependency(p.chatTilsClickAnywhereFollow) })
  )

  .addDivider()
  .addToggle(
    'chatTilsImageArt', 'ChatTilsImageArt', false,
    p => ({ desc: 'generate ascii art from image\nusage: /printimage [image url]\n/printimage (will print image from clipboard)\n/printimage https://i.imgur.com/things.jpeg (will print image from url)', shouldShow: addDependency(p.enablechattils) })
  )
  .addToggle(
    'chatTilsImageArtParty', 'ChatTilsImageArtPartyChat', true,
    p => ({ desc: 'always send in party chat', shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addToggle(
    'chatTilsImageArtAutoPrint', 'ChatTilsImageArtAutoPrint', false,
    p => ({ desc: 'auto print all lines of the image', shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addInteger(
    'chatTilsImageArtWidth', 'ChatTilsImageArtPartyWidth', 40,
    p => ({ desc: 'width of the generated image (in characters)\nheight automatically scaled', min: 1, max: 128, shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addOption(
    'chatTilsImageArtEncoding', 'ChatTilsImageArtEncoding', 'Braille',
    p => ({ desc: 'encoding used', options: ['Braille', 'ASCII'], shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addToggle(
    'chatTilsImageArtUseGaussian', 'ChatTilsImageArtSmooth', false,
    p => ({ desc: 'apply a gaussian blur to image before processing (best results when sobel is used)', shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addToggle(
    'chatTilsImageArtSharpen', 'ChatTilsImageArtSharpen', true,
    p => ({ desc: 'sharpen source image', shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addToggle(
    'chatTilsImageArtDither', 'ChatTilsImageArtDither', true,
    p => ({ desc: 'apply dithering', shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addToggle(
    'chatTilsImageArtInvert', 'ChatTilsImageArtInvert', true,
    p => ({ desc: 'invert colors', shouldShow: addDependency(p.chatTilsImageArt) })
  )
  .addOption(
    'chatTilsImageArtAlgorithm', 'ChatTilsImageArtAlgorithm', 'Grayscale',
    p => ({ desc: 'transform algorithm used', options: ['Grayscale', 'Sobel'], shouldShow: addDependency(p.chatTilsImageArt) })
  )

  .addDivider()
  .addToggle(
    'chatTilsEssential', 'ChatTilsBetterEssential', false,
    p => ({ desc: 'show Essential messages in mc chat\n/we, /te, /re, and /fe for corresponding Essential actions', shouldShow: addDependency(p.enablechattils) })
  )
  .addToggle(
    'chatTilsEssentialPing', 'ChatTilsEssentialPing', true,
    p => ({ desc: 'send chat pings on recieve message', shouldShow: addDependency(p.chatTilsEssential) })
  )
  .addToggle(
    'chatTilsEssentialNotif', 'ChatTilsEssentialNotification', false,
    p => ({ desc: 'send Essential notification on recieve message', shouldShow: addDependency(p.chatTilsEssential) })
  )
  .addToggle(
    'chatTilsEssentialOverrideCommands', 'ChatTilsBetterEssentialOverrideCommands', false,
    p => ({ desc: 'override the /w, /t, /r, and /f commands to be Essential ones', shouldShow: addDependency(p.chatTilsEssential) })
  )
  .addToggle(
    'chatTilsEssentialForwardPartyDms', 'ChatTilsEssentialForwardPartyDms', false,
    p => ({ desc: 'when leader in a party, any essential dms from party members will be forwarded to party chat', shouldShow: addDependency(p.chatTilsEssential) })
  )
  .addToggle(
    'chatTilsEssentialRedirectPartyChat', 'ChatTilsEssentialRedirectPartyChat', false,
    p => ({ desc: 'redirect /pc to message leader on essentials\nalso enables /chat p and /chat party', shouldShow: addDependency(p.chatTilsEssential) })
  )

  .addPage('Diana')
  .addToggle(
    'enablediana', 'EnableDiana', false,
    p => ({})
  )
  .addDivider()
  .addToggle(
    'dianaArrowToBurrow', 'DianaArrowToBurrow', true,
    p => ({ desc: 'draw an arrow pointing to nearest burrow', shouldShow: addDependency(p.enablediana) })
  )
  .addColor(
    'dianaArrowToBurrowColor', 'DianaArrowToBurrowColor', 0x9FE2BF,
    p => ({ shouldShow: addDependency(p.dianaArrowToBurrow) })
  )
  .addDivider()
  .addToggle(
    'dianaScanBurrows', 'DianaScanBurrows', true,
    p => ({ desc: 'look for burrows by particles', shouldShow: addDependency(p.enablediana) })
  )
  .addColor(
    'dianaBurrowStartColor', 'DianaBurrowStartColor', 0xBBEEEEFF,
    p => ({ shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addColor(
    'dianaBurrowMobColor', 'DianaBurrowMobColor', 0x2A1D32FF,
    p => ({ shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addColor(
    'dianaBurrowTreasureColor', 'DianaBurrowTreasureColor', 0xFED02AFF,
    p => ({ shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addToggle(
    'dianaAlertFoundBurrow', 'DianaAlertFoundBurrow', true,
    p => ({ desc: 'alert when burrow is found', shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addToggle(
    'dianaAlertFoundBurrowNoStart', 'DianaAlertFoundBurrowNoStart', false,
    p => ({ desc: 'do not alert when found burrow is a start burrow', shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addInteger(
    'dianaAlertFoundBurrowTime', 'DianaAlertFoundBurrowTime', 500,
    p => ({ desc: 'in ms', shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addToggle(
    'dianaAlertFoundBurrowSound', 'DianaAlertFoundBurrowSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.dianaScanBurrows) })
  )
  .addDivider()
  .addToggle(
    'dianaGuessFromParticles', 'DianaGuessFromParticles', false,
    p => ({ desc: '/togglesound must be on', shouldShow: addDependency(p.enablediana) })
  )
  .addToggle(
    'dianaGuessRememberPrevious', 'DianaRememberPreviousGuesses', true,
    p => ({ desc: 'guesses only removed when nearby burrow is found i.e. DianaScanBurrows must be on\nor use /ctsremoveclosestdiana', shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addColor(
    'dianaBurrowPrevGuessColor', 'DianaBurrowPrevGuessColor', 0x707020FF,
    p => ({ shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addColor(
    'dianaGuessFromParticlesPathColor', 'DianaGuessFromParticlesPathColor', 0x00FFFFFF,
    p => ({ desc: 'color of path of particles', shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addToggle(
    'dianaGuessFromParticlesRenderName', 'DianaGuessFromParticlesRenderName', false,
    p => ({ shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addColor(
    'dianaGuessFromParticlesAverageColor', 'DianaGuessFromParticlesAverageColor', 0xB000B5FF,
    p => ({ desc: 'color of geometric median of all guesses', shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addColor(
    'dianaGuessFromParticlesSplineColor', 'DianaGuessFromParticlesSplineColor', 0x138686FF,
    p => ({ desc: 'color of guess from spline estimation', shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addColor(
    'dianaGuessFromParticlesMLATColor', 'DianaGuessFromParticlesMLATColor', 0xB31919FF,
    p => ({ desc: 'color of guess from multilateration', shouldShow: addDependency(p.dianaGuessFromParticles) })
  )
  .addColor(
    'dianaGuessFromParticlesBezierColor', 'DianaGuessFromParticlesBezierColor', 0xFF8000FF,
    p => ({ desc: 'color of guess from bezier + control point', shouldShow: addDependency(p.dianaGuessFromParticles) })
  )

  .addPage('HUD')
  .addToggle(
    'enableabsorption', 'EnableCustomAbsorption', false,
    p => ({ desc: 'custom absorption renderer to more accurately portray total hp' })
  )
  .addInteger(
    'absorptionMaxHearts', 'AbsorptionMaxHearts', 40,
    p => ({ desc: 'caps hearts for things like mastiff', min: 0, shouldShow: addDependency(p.enableabsorption) })
  )

  .addDivider()
  .addToggle(
    'enableserverscrutinizer', 'EnableServerScrutinizer', false,
    p => ({ desc: 'scrutinizes the server\'s tps and things' })
  )

  .addDivider()
  .addToggle(
    'serverScrutinizerTPSDisplay', 'ServerScrutinizerTPSDisplay', true,
    p => ({ desc: 'tracks tps', shouldShow: addDependency(p.enableserverscrutinizer) })
  )
  .addAction(
    'moveTPSDisplay', 'MoveTPSDisplay',
    p => ({ shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerTPSDisplayCap20', 'ServerScrutinizerCapTPS', false,
    p => ({ desc: 'caps all tps at 20', shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerTPSDisplayCurr', 'ServerScrutinizerDisplayCurrentTPS', false,
    p => ({ desc: 'show current tps', shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerTPSDisplayAvg', 'ServerScrutinizerDisplayAverageTPS', true,
    p => ({ desc: 'show average tps', shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerTPSDisplayMin', 'ServerScrutinizerDisplayMinimumTPS', false,
    p => ({ desc: 'show minimum tps', shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerTPSDisplayMax', 'ServerScrutinizerDisplayMaximumTPS', false,
    p => ({ desc: 'show maximum tps', shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )
  .addInteger(
    'serverScrutinizerTPSMaxAge', 'ServerScrutinizerTPSMaxAge', 5000,
    p => ({ desc: 'max age of ticks', min: 1000, shouldShow: addDependency(p.serverScrutinizerTPSDisplay) })
  )

  .addDivider()
  .addToggle(
    'serverScrutinizerLastTickDisplay', 'ServerScrutinizerLastPacketDisplay', true,
    p => ({ desc: 'tracks last packet sent time (lag spike)', shouldShow: addDependency(p.enableserverscrutinizer) })
  )
  .addAction(
    'moveLastTickDisplay', 'MoveLastTickDisplay',
    p => ({ shouldShow: addDependency(p.serverScrutinizerLastTickDisplay) })
  )
  .addInteger(
    'serverScrutinizerLastTickThreshold', 'ServerScrutinizerLastPacketThreshold', 200,
    p => ({ desc: 'only show when server has not responded for this amount of time\nin ms', shouldShow: addDependency(p.serverScrutinizerLastTickDisplay) })
  )

  .addDivider()
  .addToggle(
    'serverScrutinizerFPSDisplay', 'ServerScrutinizerFPSDisplay', false,
    p => ({ desc: 'tracks FPS', shouldShow: addDependency(p.enableserverscrutinizer) })
  )
  .addAction(
    'moveFPSDisplay', 'MoveFPSDisplay',
    p => ({ shouldShow: addDependency(p.serverScrutinizerFPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerFPSDisplayCurr', 'ServerScrutinizerDisplayCurrentFPS', true,
    p => ({ desc: 'show current fps', shouldShow: addDependency(p.serverScrutinizerFPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerFPSDisplayAvg', 'ServerScrutinizerDisplayAverageFPS', true,
    p => ({ desc: 'show average fps', shouldShow: addDependency(p.serverScrutinizerFPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerFPSDisplayMin', 'ServerScrutinizerDisplayMinimumFPS', true,
    p => ({ desc: 'show minimum fps', shouldShow: addDependency(p.serverScrutinizerFPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerFPSDisplayMax', 'ServerScrutinizerDisplayMaximumFPS', true,
    p => ({ desc: 'show maximum fps', shouldShow: addDependency(p.serverScrutinizerFPSDisplay) })
  )
  .addInteger(
    'serverScrutinizerFPSMaxAge', 'ServerScrutinizerFPSMaxAge', 5000,
    p => ({ desc: 'max age of ticks', min: 1000, shouldShow: addDependency(p.serverScrutinizerFPSDisplay) })
  )

  .addDivider()
  .addToggle(
    'serverScrutinizerPingDisplay', 'ServerScrutinizerPingDisplay', false,
    p => ({ desc: 'tracks ping', shouldShow: addDependency(p.enableserverscrutinizer) })
  )
  .addAction(
    'movePingDisplay', 'MovePingDisplay',
    p => ({ shouldShow: addDependency(p.serverScrutinizerPingDisplay) })
  )
  .addToggle(
    'serverScrutinizerPingDisplayCurr', 'ServerScrutinizerDisplayCurrentPing', true,
    p => ({ desc: 'show current ping', shouldShow: addDependency(p.serverScrutinizerPingDisplay) })
  )
  .addToggle(
    'serverScrutinizerPingDisplayAvg', 'ServerScrutinizerDisplayAveragePing', true,
    p => ({ desc: 'show average ping', shouldShow: addDependency(p.serverScrutinizerPingDisplay) })
  )

  .addDivider()
  .addToggle(
    'serverScrutinizerPPSDisplay', 'ServerScrutinizerPPSDisplay', false,
    p => ({ desc: 'tracks PPS (packets [send] per second)', shouldShow: addDependency(p.enableserverscrutinizer) })
  )
  .addAction(
    'movePPSDisplay', 'MovePPSDisplay',
    p => ({ shouldShow: addDependency(p.serverScrutinizerPPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerPPSDisplayCurr', 'ServerScrutinizerDisplayCurrentPPS', true,
    p => ({ desc: 'show current pps', shouldShow: addDependency(p.serverScrutinizerPPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerPPSDisplayAvg', 'ServerScrutinizerDisplayAveragePPS', true,
    p => ({ desc: 'show average pps', shouldShow: addDependency(p.serverScrutinizerPPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerPPSDisplayMin', 'ServerScrutinizerDisplayMinimumPPS', true,
    p => ({ desc: 'show minimum pps', shouldShow: addDependency(p.serverScrutinizerPPSDisplay) })
  )
  .addToggle(
    'serverScrutinizerPPSDisplayMax', 'ServerScrutinizerDisplayMaximumPPS', true,
    p => ({ desc: 'show maximum pps', shouldShow: addDependency(p.serverScrutinizerPPSDisplay) })
  )
  .addInteger(
    'serverScrutinizerPPSMaxAge', 'ServerScrutinizerPPSMaxAge', 5000,
    p => ({ desc: 'max age of ticks', min: 1000, shouldShow: addDependency(p.serverScrutinizerPPSDisplay) })
  )

  .addDivider()
  .addToggle(
    'enablespotify', 'EnableSpotifyDisplay', false,
    p => ({ desc: 'shows current song playing on spotify, only works on windows + app version' })
  )
  .addAction(
    'moveSpotifyDisplay', 'MoveSpotifyDisplay',
    p => ({ shouldShow: addDependency(p.enablespotify) })
  )
  .addToggle(
    'spotifyHideNotOpen', 'SpotifyHideIfNotOpened', true,
    p => ({ desc: 'hide if spotify is not opened', shouldShow: addDependency(p.enablespotify) })
  )
  .addInteger(
    'spotifyMaxSongLength', 'SpotifyMaxSongLength', 100,
    p => ({ desc: 'in pixels, 0 for uncapped length', min: 0, shouldShow: addDependency(p.enablespotify) })
  )

  .addDivider()
  .addToggle(
    'enablesacks', 'EnableSackTils', false,
    p => ({ desc: 'does things with the sacks message\nto turn on settings -> personal -> chat feedback -> sack notifs' })
  )
  .addToggle(
    'sacksDisableMessage', 'SackTilsDisableMessage', true,
    p => ({ desc: 'hide the message', shouldShow: addDependency(p.enablesacks) })
  )
  .addToggle(
    'sacksDisplay', 'SackTilsDisplay', true,
    p => ({ desc: 'gui showing change in items', shouldShow: addDependency(p.enablesacks) })
  )
  .addAction(
    'moveSacksDisplay', 'MoveSacktilsDisplay',
    p => ({ shouldShow: addDependency(p.sacksDisplay) })
  )
  .addNumber(
    'sacksDisplayTimeout', 'SackTilsDisplayTimeout', 5000,
    p => ({ desc: 'how long to show changes for in ms', shouldShow: addDependency(p.sacksDisplay) })
  )
  .addToggle(
    'sacksDisplayCombineQuantities', 'SackTilsDisplayCombineQuantities', false,
    p => ({ desc: 'combine +16 Ender Pearl and -3 Ender Pearl into +13 Ender Pearl', shouldShow: addDependency(p.sacksDisplay) })
  )
  .addToggle(
    'sacksDisplayTrackAggregateQuantities', 'SackTilsDisplayTrackAggregateQuantities', false,
    p => ({ desc: 'remember previous transactions (reset on restart/reload or manually)', shouldShow: addDependency(p.sacksDisplay) })
  )
  .addAction(
    'sacksDisplayResetAggregate', 'SackTilsDisplayResetAggregate',
    p => ({ shouldShow: addDependency(p.sacksDisplayTrackAggregateQuantities) })
  )
  .addText(
    'sacksDisplayItemWhitelist', 'SackTilsDisplayItemWhitelist', '',
    p => ({ desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato', shouldShow: addDependency(p.sacksDisplay) })
  )
  .addText(
    'sacksDisplayItemBlacklist', 'SackTilsDisplayItemBlacklist', '',
    p => ({ desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato', shouldShow: addDependency(p.sacksDisplay) })
  )

  .addToggle(
    'enabledeployable', 'EnableDeployableTils', false,
    p => ({ isNewSection: true })
  )
  .addOption(
    'deployableHUD', 'DeployableHUD', 'Compact',
    p => ({ desc: 'show current deployable\nwhat is bubblegum?', options: ['Compact', 'Full', 'None'], shouldShow: addDependency(p.enabledeployable) })
  )
  .addAction(
    'moveDeployableHUD', 'MoveDeployableHUD',
    p => ({ shouldShow: addDependency(p.deployableHUD) })
  )
  .addToggle(
    'deployableAssumeJalapeno', 'DeployableAssumeJalapeno', true,
    p => ({ desc: 'assume flares have jalapeno applied\n(cannot detect programmatically because fuck hypixel)', shouldShow: addDependency(p.deployableHUD) })
  )
  .addToggle(
    'deployableHUDColorTimer', 'DeployableHUDColorTime', true,
    p => ({ desc: 'color the timer based on time remaining', shouldShow: addDependency(p.deployableHUD) })
  )
  .addOption(
    'deployableParticlesOwn', 'DeployableParticlesOwn', 'Default',
    p => ({ options: ['Default', 'None', 'Custom'], desc: 'only applies to own deployables', shouldShow: addDependency(p.enabledeployable) })
  )
  .addOption(
    'deployableParticlesOther', 'DeployableParticlesOther', 'Default',
    p => ({ options: ['Default', 'None', 'Custom'], shouldShow: addDependency(p.enabledeployable) })
  )

  .addToggle(
    'enableferoestimate', 'EnableFeroEstimate', false,
    p => ({ isNewSection: true })
  )
  .addAction(
    'moveFeroEstimate', 'MoveFeroEstimate',
    p => ({ shouldShow: addDependency(p.enableferoestimate) })
  )
  .addInteger(
    'feroEstimateUpdateDelay', 'FeroEstimateUpdateDelay', 500,
    p => ({ desc: 'delay in ms to update guess', min: 0, shouldShow: addDependency(p.enableferoestimate) })
  )

  .addToggle(
    'enablecrosshair', 'EnableCustomCrosshair', false,
    p => ({ isNewSection: true })
  )
  .addOption(
    'crosshairType', 'CustomCrosshairType', '+',
    p => ({ options: ['+', 'X', '/\\', 'O', '.'], shouldShow: addDependency(p.enablecrosshair) })
  )
  .addColor(
    'crosshairColor', 'CustomCrosshairColor', 0xFFFFFFFF,
    p => ({ shouldShow: addDependency(p.enablecrosshair) })
  )
  .addToggle(
    'crosshairInvert', 'CustomCrosshairInvertColor', false,
    p => ({ shouldShow: addDependency(p.enablecrosshair) })
  )
  .addNumber(
    'crosshairWidth', 'CustomCrosshairWidth', 10,
    p => ({ min: 0, shouldShow: addDependency(p.enablecrosshair) })
  )
  .addNumber(
    'crosshairBreadth', 'CustomCrosshairBreadth', 1,
    p => ({ min: 0, shouldShow: addDependency(p.enablecrosshair) })
  )
  .addToggle(
    'crosshairRenderInGui', 'CustomCrosshairRenderInGuis', false,
    p => ({ shouldShow: addDependency(p.enablecrosshair) })
  )

  .addPage('Avarice Addons')
  .addToggle(
    'enableavarice', 'EnableAvariceAddons', false,
    p => ({ desc: 'things for avarice' })
  )

  .addDivider()
  .addToggle(
    'avariceShowCoinCounter', 'AvariceShowCoinCounter', true,
    p => ({ desc: 'show avarice coins in a hud', shouldShow: addDependency(p.enableavarice) })
  )
  .addAction(
    'moveAvariceCoinCounter', 'MoveAvariceCoinCounter',
    p => ({ shouldShow: addDependency(p.avariceShowCoinCounter) })
  )

  .addDivider()
  .addToggle(
    'avariceArachne', 'AvariceBigSpooderHelper', true,
    p => ({ desc: 'big spooder go die, i hate nons', shouldShow: addDependency(p.enableavarice) })
  )
  .addToggle(
    'avariceArachneHideBroodNames', 'AvariceHideSmallSpooderNames', true,
    p => ({ desc: 'make small spooder names go bye', shouldShow: addDependency(p.avariceArachne) })
  )
  .addToggle(
    'avariceArachneBoxBigSpooder', 'AvariceBoxBigSpooder', true,
    p => ({ shouldShow: addDependency(p.avariceArachne) })
  )
  .addColor(
    'avariceArachneBoxBigSpooderColor', 'AvariceBoxBigSpooderColor', 0xEB38BBFF,
    p => ({ shouldShow: addDependency(p.avariceArachneBoxBigSpooder) })
  )
  .addToggle(
    'avariceArachneBoxBigSpooderEsp', 'AvariceBoxBigSpooderEsp', false,
    p => ({ shouldShow: addDependency(p.avariceArachneBoxBigSpooder) })
  )
  .addToggle(
    'avariceArachneBoxBigSpooderDrawArrow', 'AvariceBoxBigSpooderDrawArrow', true,
    p => ({ shouldShow: addDependency(p.avariceArachneBoxBigSpooder) })
  )
  .addToggle(
    'avariceArachneBoxSmallSpooders', 'AvariceBoxSmallSpooders', true,
    p => ({ shouldShow: addDependency(p.avariceArachne) })
  )
  .addColor(
    'avariceArachneBoxSmallSpoodersColor', 'AvariceBoxSmallSpoodersColor', 0x26ED5EFF,
    p => ({ shouldShow: addDependency(p.avariceArachneBoxSmallSpooders) })
  )
  .addToggle(
    'avariceArachneBoxSmallSpoodersEsp', 'AvariceBoxSmallSpoodersEsp', false,
    p => ({ shouldShow: addDependency(p.avariceArachneBoxSmallSpooders) })
  )

  .addDivider()
  .addToggle(
    'avariceTaraTrader', 'AvariceTaraTrader', false,
    p => ({ desc: 'block hits on tara if slayer quest not started\nlag go brr\nnote: doesnt block custom hits (i.e. >3 block range)\nas of writing this, xp duping is patched and trading is not possible (i.e. obsolete)', shouldShow: addDependency(p.enableavarice) })
  )

  .addPage('Great Spook')
  .addToggle(
    'enablegreatspook', 'EnableGreatSpook', false,
    p => ({})
  )
  .addInteger(
    'greatSpookPrimalCd', 'GreatSpookPrimalCd', 75,
    p => ({ desc: 'cd between spawns, in seconds\ncheck at hub -> tyashoi alchemist', shouldShow: addDependency(p.enablegreatspook) })
  )

  .addDivider()
  .addToggle(
    'greatSpookPrimalTimer', 'GreatSpookPrimalTimer', true,
    p => ({ desc: 'timer until primal fear can spawn', shouldShow: addDependency(p.enablegreatspook) })
  )
  .addAction(
    'moveGreatSpookPrimalTimer', 'MoveGreatSpookPrimalTimer',
    p => ({ shouldShow: addDependency(p.greatSpookPrimalTimer) })
  )
  .addToggle(
    'greatSpookPrimalTimerHideReady', 'GreatSpookPrimalTimerHideReady', false,
    p => ({ desc: 'when cd is ready hide timer rather than show "READY"', shouldShow: addDependency(p.greatSpookPrimalTimer) })
  )

  .addToggle(
    'greatSpookPrimalAlert', 'GreatSpookPrimalAlert', true,
    p => ({ desc: 'show alert when primal is ready', shouldShow: addDependency(p.enablegreatspook) })
  )
  .addInteger(
    'greatSpookPrimalAlertTime', 'GreatSpookPrimalAlertTime', 2000,
    p => ({ desc: 'in ms', min: 0, shouldShow: addDependency(p.greatSpookPrimalAlert) })
  )
  .addToggle(
    'greatSpookPrimalAlertSound', 'GreatSpookPrimalAlertSound', true,
    p => ({ desc: 'play sound with the alert', shouldShow: addDependency(p.greatSpookPrimalAlert) })
  )

  .addPage('FishingTils')
  .addToggle(
    'enablefishingtils', 'EnableFishingTils', true,
    p => ({})
  )

  .addDivider()
  .addToggle(
    'fishingTilsHotspotWaypoint', 'FishingTilsHotspotWaypoint', false,
    p => ({ shouldShow: addDependency(p.enablefishingtils) })
  )
  .addColor(
    'fishingTilsHotspotWaypointColor', 'FishingTilsHotspotWaypointColor', 0xFA771EFF,
    p => ({ shouldShow: addDependency(p.fishingTilsHotspotWaypoint) })
  )
  .addInteger(
    'fishingTilsHotspotWaypointDisableRange', 'FishingTilsHotspotWaypointDisableRange', 10,
    p => ({ desc: 'disable when this many blocks (not including height) from hotspot', min: 0, shouldShow: addDependency(p.fishingTilsHotspotWaypoint) })
  )
  .addToggle(
    'fishingTilsHotspotWaypointArrow', 'FishingTilsHotspotWaypointArrow', true,
    p => ({ shouldShow: addDependency(p.fishingTilsHotspotWaypoint) })
  )

  .addDivider()
  .addToggle(
    'fishingTilsUpdateSBAList', 'FishingTilsUpdateSBAList', true,
    p => ({ desc: 'update the sba sea creature list\nrequires game restart to fully disable (why though)', shouldShow: addDependency(p.enablefishingtils) })
  )

  .addPage('Necromancy')
  .addToggle(
    'enablenecromancy', 'EnableNecromancy', false,
    p => ({})
  )

  .addDivider()
  .addToggle(
    'necromancyTrackSouls', 'NecromancyTrackSouls', true,
    p => ({ desc: 'track info about souls that get dropped', shouldShow: addDependency(p.enablenecromancy) })
  )
  .addText(
    'necromancySoulWhitelist', 'NecromancySoulWhitelist', '',
    p => ({ desc: 'comma separated names, will search inclusively, case sensitive', shouldShow: addDependency(p.necromancyTrackSouls) })
  )
  .addText(
    'necromancySoulBlacklist', 'NecromancySoulBlacklist', '',
    p => ({ desc: 'comma separated names, will search inclusively, case sensitive', shouldShow: addDependency(p.necromancyTrackSouls) })
  )
  .addToggle(
    'necromancyAlwaysTrackBoss', 'NecromancyAlwaysTrackBoss', true,
    p => ({ desc: 'always track powerful (dark) souls, regardless of white/blacklist', shouldShow: addDependency(p.necromancyTrackSouls) })
  )

  .addToggle(
    'necromancySoulEsp', 'NecromancySoulEsp', false,
    p => ({ desc: 'esp on soul rendering', shouldShow: addDependency(p.necromancyTrackSouls) })
  )
  .addToggle(
    'necromancyShowMobName', 'NecromancyShowMobName', true,
    p => ({ desc: 'render name of mob above soul', shouldShow: addDependency(p.necromancyTrackSouls) })
  )

  .addToggle(
    'necromancyBoxSoul', 'NecromancyBoxSoul', true,
    p => ({ shouldShow: addDependency(p.necromancyTrackSouls) })
  )
  .addColor(
    'necromancySoulColorNew', 'NecromancySoulColorNew', 0x00FFFFA0,
    p => ({ desc: 'color of newly dropped soul', shouldShow: addDependency(p.necromancyBoxSoul) })
  )
  .addColor(
    'necromancySoulColorOld', 'NecromancySoulColorOld', 0xFF0000FF,
    p => ({ desc: 'color of soul about to despawn', shouldShow: addDependency(p.necromancyBoxSoul) })
  )

  .addPage('Dojo')
  .addToggle(
    'enabledojo', 'EnableDojo', false,
    p => ({})
  )

  .addDivider()
  .addToggle(
    'dojoMastery', 'DojoMaster', true,
    p => ({ shouldShow: addDependency(p.enabledojo) })
  )
  .addToggle(
    'dojoMasteryPointToLowest', 'DojoMasteryPointToLowest', true,
    p => ({ shouldShow: addDependency(p.dojoMastery) })
  )
  .addColor(
    'dojoMasteryPointToLowestColor', 'DojoMasteryPointToLowestColor', 0x55FF55FF,
    p => ({ shouldShow: addDependency(p.dojoMasteryPointToLowest) })
  )
  .addToggle(
    'dojoMasteryShowLowestTime', 'DojoMasteryShowLowestTime', true,
    p => ({ desc: 'render lowest time below crosshair', shouldShow: addDependency(p.dojoMastery) })
  )
  .addToggle(
    'dojoMasteryPointToNext', 'DojoMasteryPointToNext', true,
    p => ({ shouldShow: addDependency(p.dojoMastery) })
  )
  .addColor(
    'dojoMasteryPointToNextColor', 'DojoMasteryPointToNextColor', 0x5555FFFF,
    p => ({ shouldShow: addDependency(p.dojoMasteryPointToNext) })
  )
  .addToggle(
    'dojoMasteryPointToNextTimer', 'DojoMasteryPointToNextTimer', true,
    p => ({ desc: 'show timer for the next block', shouldShow: addDependency(p.dojoMastery) })
  )
  .addToggle(
    'dojoMasteryHideTitles', 'DojoMasteryHideTitles', true,
    p => ({ shouldShow: addDependency(p.dojoMastery) })
  )

  .addPage('Testing')
  .addToggle(
    'enableboxallentities', 'EnableBoxAllEntities', false,
    p => ({ desc: 'mostly for debugging' })
  )
  .addToggle(
    'boxAllEntitiesInvis', 'BoxAllEntitiesInvisible', false,
    p => ({ desc: 'box invisible entities', shouldShow: addDependency(p.enableboxallentities) })
  )
  .addColor(
    'boxAllEntitiesColor', 'BoxAllEntitiesColor', 0xFF0000FF,
    p => ({ shouldShow: addDependency(p.enableboxallentities) })
  )
  .addToggle(
    'boxAllEntitiesEsp', 'BoxAllEntitiesEsp', true,
    p => ({ shouldShow: addDependency(p.enableboxallentities) })
  )
  .addToggle(
    'boxAllEntitiesName', 'BoxAllEntitiesName', false,
    p => ({ desc: 'show nametag', shouldShow: addDependency(p.enableboxallentities) })
  )
  .addToggle(
    'boxAllEntitiesClassName', 'BoxAllEntitiesClassName', false,
    p => ({ desc: 'show class name', shouldShow: addDependency(p.enableboxallentities) })
  )
  .addText(
    'boxAllEntitiesWhitelist', 'BoxAllEntitiesWhitelist', '',
    p => ({ desc: 'comma separated class names', shouldShow: addDependency(p.enableboxallentities) })
  )
  .addText(
    'boxAllEntitiesBlacklist', 'BoxAllEntitiesBlacklist', '',
    p => ({ desc: 'comma separated class names', shouldShow: addDependency(p.enableboxallentities) })
  )
  .addToggle(
    'boxAllEntitiesEntityId', 'BoxAllEntitiesEntityId', false,
    p => ({ desc: 'show entity id', shouldShow: addDependency(p.enableboxallentities) })
  )

  .addDivider()
  .addToggle(
    'enablelogdamage', 'EnableLogDamage', false,
    p => ({ desc: 'log damage numbers in chat' })
  )
  .addNumber(
    'logDamageRange', 'LogDamageRange', 5,
    p => ({ desc: 'ignore damage numbers outside this range\nin blocks', min: 0, shouldShow: addDependency(p.enablelogdamage) })
  )
  .addInteger(
    'logDamageThreshold', 'LogDamageThreshold', 0,
    p => ({ desc: 'only log damage when above this amount\n0 to disable', min: 0, shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageNormal', 'LogDamageNormal', true,
    p => ({ desc: 'non crit', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageCrit', 'LogDamageCrit', true,
    p => ({ desc: 'crit', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageWither', 'LogDamageWither', true,
    p => ({ desc: 'withering effect', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageVenomous', 'LogDamageVenomous', true,
    p => ({ desc: 'venomous/toxic poison', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageSuffocation', 'LogDamageSuffocation', true,
    p => ({ desc: 'suffocation/drowning', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageFire', 'LogDamageFire', true,
    p => ({ desc: 'fire/fa/flame', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageLightning', 'LogDamageLightning', true,
    p => ({ desc: 'thunderlord/thunderbolt', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamagePet', 'LogDamagePet', true,
    p => ({ desc: 'pet e.g. snowman', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageOverload', 'LogDamageOverload', true,
    p => ({ desc: 'overload', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageExtremeFocus', 'LogDamageExtremeFocus', true,
    p => ({ desc: 'extreme focus (endstone sword)', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageOctodexterity', 'LogDamageOctodexterity', true,
    p => ({ desc: 'octodexterity (tara full set)', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageWitherSkull', 'LogDamageWitherSkull', true,
    p => ({ desc: 'withermancer/withers', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageLove', 'LogDamageLove', true,
    p => ({ desc: 'ring of love etc. proc', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageCurse', 'LogDamageCurse', true,
    p => ({ desc: 'gaia construct lightning', shouldShow: addDependency(p.enablelogdamage) })
  )
  .addToggle(
    'logDamageCombo', 'LogDamageCombo', true,
    p => ({ desc: 'blaze dagger repeat', shouldShow: addDependency(p.enablelogdamage) })
  )

  .addPage('Misc.')
  .addToggle(
    'enableexcavatorsolver', 'EnableExcavatorSolver', false,
    p => ({ desc: 'find fossils' })
  )
  .addToggle(
    'excavatorSolverOnlyShowBest', 'ExcavatorSolverOnlyHighlightBest', true,
    p => ({ desc: 'only highlight the best move', shouldShow: addDependency(p.enableexcavatorsolver) })
  )
  .addToggle(
    'excavatorSolverShowRoute', 'ExcavatorSolverHighlightStartPath', false,
    p => ({ desc: 'highlight best starting path (turn off if citrine gemstones)', shouldShow: addDependency(p.enableexcavatorsolver) })
  )
  .addOption(
    'excavatorSolverDirtTooltip', 'ExcavatorSolverDirtTooltip', 'Custom',
    p => ({ options: ['Default', 'Hide', 'Custom'], shouldShow: addDependency(p.enableexcavatorsolver) })
  )
  .addOption(
    'excavatorSolverDustTooltip', 'ExcavatorSolverDustTooltip', 'Custom',
    p => ({ options: ['Default', 'Hide', 'Custom'], shouldShow: addDependency(p.enableexcavatorsolver) })
  )
  .addToggle(
    'excavatorSolverAutoClose', 'ExcavatorSolverAutoClose', false,
    p => ({ desc: 'automatically close excavator when all clicks used', shouldShow: addDependency(p.enableexcavatorsolver) })
  )

  .addDivider()
  .addToggle(
    'enablebettergfs', 'EnableBetterGFS', false,
    p => ({ desc: 'autocomplete for gfs, and shorthand\ne.g. /gfs w c 1 -> /gfs WITHER_CATALYST 1' })
  )
  .addOption(
    'betterGFSIDPref', 'BetterGFSIdPreference', 'ID',
    p => ({ desc: 'which format to prefer (name vs id)\nName: replace with qualified name, ID: coerce to ID\nDynamic: use whatever format was given (in theory) it is broken af so it is disabled :)', options: ['ID', 'Name'], shouldShow: addDependency(p.enablebettergfs) })
  )
  .addInteger(
    'betterGFSBlankAmount', 'BetterGFSUnspecifiedAmount', 1,
    p => ({ desc: 'amount to default to when not provided\ne.g. /gfs w c -> /gfs WITHER_CATALYST <insert amount>', min: 1, max: 2240, shouldShow: addDependency(p.enablebettergfs) })
  )

  .addDivider()
  .addToggle(
    'enablecpv', 'EnableChickTilsPV', true,
    p => ({ desc: '/cpv, neu /pv wrapper but with different api\n(almost 100% success rate!)' })
  )
  .addToggle(
    'cpvReplaceNeu', 'ChickTilsPVReplaceNEU', false,
    p => ({ desc: 'replace /pv command (may require restart when disabling)', shouldShow: addDependency(p.enablecpv) })
  )
  .addToggle(
    'cpvAutoCompleteTabList', 'ChickTilsPVAutoCompleteTabList', true,
    p => ({ desc: 'autocomplete /pv with names from tab list', shouldShow: addDependency(p.enablecpv) })
  )
  .addToggle(
    'cpvAutoCompleteParty', 'ChickTilsPVAutoCompleteParty', true,
    p => ({ desc: 'autcomplete /pv with party members', shouldShow: addDependency(p.enablecpv) })
  )

  .addDivider()
  .addToggle(
    'enableclipboard', 'EnableClipboardThing', true,
    p => ({ desc: '/clipboard\nset, get, list, and remove\n/cbs and /cbg and /cbl and /cbr\n/clipboard set <name> | /cbg <name> | /clipboard list | /cbr <name>' })
  )

  .addDivider()
  .addToggle(
    'enablevision', 'DisableBlindness', true,
    p => ({ desc: 'disable blindness' })
  )

  .addDivider()
  .addToggle(
    'enablecake', 'EnableCakeHelper', true,
    p => ({ desc: 'i like eat cake.' })
  )

  .addDivider()
  .addToggle(
    'enableunfocus', 'PreventRenderingWhenUnfocused', false,
    p => ({ desc: 'similar to patcher\'s unfocused fps\nbut instead of capping fps, it completely stops rendering' })
  )

  .addDivider()
  .addToggle(
    'enableassfangcheese', 'EnableAssfangCheeseHealth', false,
    p => ({ desc: 'show real assfang health\nobsolete' })
  )
  .addAction(
    'moveAssfangCheese', 'MoveAssfangCheeseHealth',
    p => ({ shouldShow: addDependency(p.enableassfangcheese) })
  )

  .addToggle(
    'enableblockhighlight', 'EnableBlockHighlight', false,
    p => ({ isNewSection: true })
  )
  .addToggle(
    'blockHighlightBoxEntity', 'BlockHighlightBoxEntity', false,
    p => ({ desc: 'box the entity you are looking at', shouldShow: addDependency(p.enableblockhighlight) })
  )
  .addColor(
    'blockHighlightWireColor', 'BlockHighlightWireColor', 0x00000066,
    p => ({ shouldShow: addDependency(p.enableblockhighlight) })
  )
  .addColor(
    'blockHighlightFillColor', 'BlockHighlightFillColor', 0x00000000,
    p => ({ shouldShow: addDependency(p.enableblockhighlight) })
  )
  .addNumber(
    'blockHighlightWireWidth', 'BlockHighlightWireWidth', 2,
    p => ({ min: 0, shouldShow: addDependency(p.enableblockhighlight) })
  )
  .addToggle(
    'blockHighlightCheckEther', 'BlockHighlightCheckEther', true,
    p => ({ shouldShow: addDependency(p.enableblockhighlight) })
  )
  .addColor(
    'blockHighlightEtherWireColor', 'BlockHighlightEtherWireColor', 0x2EDD17A0,
    p => ({ shouldShow: addDependency(p.blockHighlightCheckEther) })
  )
  .addColor(
    'blockHighlightEtherFillColor', 'BlockHighlightEtherFillColor', 0x60DE5560,
    p => ({ shouldShow: addDependency(p.blockHighlightCheckEther) })
  )
  .addNumber(
    'blockHighlightEtherWireWidth', 'BlockHighlightEtherWireWidth', 3,
    p => ({ min: 0, shouldShow: addDependency(p.blockHighlightCheckEther) })
  )
  .addColor(
    'blockHighlightCantEtherWireColor', 'BlockHighlightCantEtherWireColor', 0xCA2207A0,
    p => ({ shouldShow: addDependency(p.blockHighlightCheckEther) })
  )
  .addColor(
    'blockHighlightCantEtherFillColor', 'BlockHighlightCantEtherFillColor', 0xBA2B1E60,
    p => ({ shouldShow: addDependency(p.blockHighlightCheckEther) })
  )
  .addNumber(
    'blockHighlightCantEtherWireWidth', 'BlockHighlightCantEtherWireWidth', 3,
    p => ({ min: 0, shouldShow: addDependency(p.blockHighlightCheckEther) })
  )
  .addToggle(
    'blockHighlightCantEtherShowReason', 'BlockHighlightCantEtherShowReason', true,
    p => ({ shouldShow: addDependency(p.blockHighlightCheckEther) })
  )

  .addDivider()
  .addToggle(
    'enablehidedivanparticles', 'HideDivanCoatingParticles', true,
    p => ({ desc: 'only hides your own' })
  )

  .addDivider()
  .addToggle(
    'enablesbaenchant', 'UpdateSBAEnchantList', true,
    p => ({ desc: 'need to rs game to unload properly (why would you?)' })
  )

  .addToggle(
    'enablepearlpath', 'EnablePearlPath', false,
    p => ({ isNewSection: true })
  )
  .addToggle(
    'pearlPathEsp', 'PearlPathEsp', false,
    p => ({ shouldShow: addDependency(p.enablepearlpath) })
  )
  .addColor(
    'pearlPathPathColor', 'PearlPathColor', 0xFF0000FF,
    p => ({ desc: 'color of path of pearl', shouldShow: addDependency(p.enablepearlpath) })
  )
  .addColor(
    'pearlPathDestColorOutline', 'PearlPathDestinationColorOutline', 0x0000FFFF,
    p => ({ desc: 'outline color of player hitbox on teleport', shouldShow: addDependency(p.enablepearlpath) })
  )
  .addColor(
    'pearlPathDestColorFill', 'PearlPathDestinationColorFill', 0x00000000,
    p => ({ desc: 'fill color of player hitbox on teleport', shouldShow: addDependency(p.enablepearlpath) })
  )
  .addToggle(
    'pearlPathCollideEntity', 'PearlPathCollideWithEntities', false,
    p => ({ desc: 'whether to check for collisions with entities', shouldShow: addDependency(p.enablepearlpath) })
  )
  .addColor(
    'pearlPathCollidedEntityColor', 'PearlPathCollidedEntityColor', 0x00FF00FF,
    p => ({ desc: 'color to box entity that was collided with', shouldShow: addDependency(p.enablepearlpath) })
  )
  .addToggle(
    'pearlPathCheeto', 'PearlPathCheeto', false,
    p => ({ desc: 'shame shame shame\ndoesn\'t disable when looking at a block', shouldShow: addDependency(p.enablepearlpath) })
  )

  .addDivider()
  .addToggle(
    'enablelookat', 'EnableLookAt', true,
    p => ({ desc: '/lookat <pitch> <yaw>\ndisplays a thing to help aim' })
  )
  .addColor(
    'lookAtColor', 'LookAtColor', 0x00FFFFFF,
    p => ({ shouldShow: addDependency(p.enablelookat) })
  )
  .addNumber(
    'lookAtSize', 'LookAtSize', 0.01,
    p => ({ min: 0, shouldShow: addDependency(p.enablelookat) })
  )
  .addToggle(
    'lookAtPointTo', 'LookAtPointToLocation', false,
    p => ({ shouldShow: addDependency(p.enablelookat) })
  )
  .addNumber(
    'lookAtThreshold', 'LookAtTreshold', 0.1,
    p => ({ min: 0, desc: 'threshold (in degrees) until it is "good enough"', shouldShow: addDependency(p.enablelookat) })
  )
  .addInteger(
    'lookAtTimeout', 'LookAtTimeout', 600,
    p => ({ min: 1, desc: 'time (in ticks) until it gives up', shouldShow: addDependency(p.enablelookat) })
  )

  .addToggle(
    'enabledarkmonolith', 'EnableDarkMonolith', false,
    p => ({ isNewSection: true })
  )
  .addInteger(
    'darkMonolithScanDelay', 'DarkMonolithScanDelay', 5,
    p => ({ desc: 'time in ticks taken to scan all possible positions, lower = laggier', min: 1, shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addToggle(
    'darkMonolithEsp', 'DarkMonolithEsp', true,
    p => ({ shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addColor(
    'darkMonolithColor', 'DarkMonolithColor', 0x000000FF,
    p => ({ shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addColor(
    'darkMonolithPossibleColor', 'DarkMonolithPossibleColor', 0x55FF55FF,
    p => ({ shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addColor(
    'darkMonolithScannedColor', 'DarkMonolithScannedColor', 0xFF5555FF,
    p => ({ shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addToggle(
    'darkMonolithPointTo', 'DarkMonolithPointTo', true,
    p => ({ shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addToggle(
    'darkMonolithTrackDrops', 'DarkMonolithTrackDrops', true,
    p => ({ shouldShow: addDependency(p.enabledarkmonolith) })
  )
  .addAction(
    'moveDarkMonolithDropsTracker', 'MoveDarkMonolithDropsTracker',
    p => ({ shouldShow: addDependency(p.darkMonolithTrackDrops) })
  )
  .addAction(
    'resetDarkMonolithDropsTracker', 'ResetDarkMonolithDropsTracker',
    p => ({ shouldShow: addDependency(p.darkMonolithTrackDrops) })
  );

const settings = builder.build();
export default settings;
export const props = builder.props;