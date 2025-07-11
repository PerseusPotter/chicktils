import { Builder, PropertyToggle, PropertyInteger, PropertyNumber, PropertyPercent, PropertyText, PropertyOption, PropertyColor, PropertyAction } from './settingsLib';
import { StateProp } from './util/state';

export const $FONTS = new Map(java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames().map(v => [v.replace(/\s/g, ''), v]));
$FONTS.set('Mojangles', 'Mojangles');
/** @param {import('./settingsLib').Property<boolean>} prop */
const addDependency = prop => new StateProp(prop).and(prop.shouldShow);

const $General = {
  enableGlobal: new PropertyToggle('Enable', true, { desc: 'toggles mod globally (scuffed, it doesnt really work)' }),
  autoUpdate: new PropertyToggle('CheckForUpdates', true, { desc: 'check for updates when loaded' }),
  isDev: new PropertyToggle('IsDev', false, { desc: 'negatively impacts loading performance and may spam your chat' }),
  pingRefreshDelay: new PropertyNumber('PingRefreshDelay', 10, { desc: 'how often (in seconds) to refresh ping. set to 0 to disable ping. requires skytils' }),
  preferUseTracer: new PropertyToggle('PreferUseTracer', true, { desc: 'when available, prefer to use a tracer rather than an arrow' }),
  textGuiFont: new PropertyOption('TextGuiFont', 'Mojangles', { desc: 'font used for text guis', options: Array.from($FONTS.keys()) }),
};

const $Kuudra = {
  enablekuudra: new PropertyToggle('EnableKuudra', true, {}),

  kuudraRenderPearlTarget: new PropertyToggle('KuudraRenderPearlTarget', true, { desc: 'render location to aim at for sky pearls\n(but not hardcoded + actually accurate + with timer)', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraPearlTargetColor: new PropertyColor('KuudraPearlTargetColor', 0xFFFF00FF, { shouldShow: p => addDependency(p.kuudraRenderPearlTarget), shouldShow: p => addDependency(p.kuudraRenderPearlTarget) }),

  kuudraRenderEmptySupplySpot: new PropertyToggle('KuudraRenderEmptySupplySpot', true, { desc: 'render available supply dropoff location', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraEmptySupplySpotColor: new PropertyColor('KuudraEmptySupplySpotColor', 0xFF0000FF, { shouldShow: p => addDependency(p.kuudraRenderEmptySupplySpot) }),

  kuudraBoxSupplies: new PropertyToggle('KuudraBoxSupplies', true, { shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraBoxSuppliesColor: new PropertyColor('KuudraBoxSuppliesColor', 0x00FF00FF, { shouldShow: p => addDependency(p.kuudraBoxSupplies) }),
  kuudraBoxSuppliesGiantColor: new PropertyColor('KuudraBoxSuppliesGiantColor', 0, { shouldShow: p => addDependency(p.kuudraBoxSupplies) }),
  kuudraBoxSuppliesEsp: new PropertyToggle('KuudraBoxSuppliesEsp', true, { shouldShow: p => addDependency(p.kuudraBoxSupplies) }),

  kuudraBoxChunks: new PropertyToggle('KuudraBoxChunks', true, { shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraBoxChunksColor: new PropertyColor('KuudraBoxChunksColor', 0xFF00FFFF, { shouldShow: p => addDependency(p.kuudraBoxChunks) }),
  kuudraBoxChunksEsp: new PropertyToggle('KuudraBoxChunksEsp', true, { shouldShow: p => addDependency(p.kuudraBoxChunks) }),

  kuudraShowCannonAim: new PropertyToggle('KuudraShowCannonAim', true, { desc: 'render location to aim at for cannon, (useful for when client desyncs)', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraCannonAimColor: new PropertyColor('KuudraCannonAimColor', 0xFFFF00FF, { shouldShow: p => addDependency(p.kuudraShowCannonAim) }),

  kuudraCustomBossBar: new PropertyToggle('KuudraCustomBossBar', true, { desc: 'rescale kuudra health bar in t5 to go 100% -> 0% twice', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),

  kuudraBoxKuudra: new PropertyToggle('KuudraBoxKuudra', true, { desc: 'draws box around kuudra', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraBoxKuudraColor: new PropertyColor('KuudraBoxKuudraColor', 0xFF0000FF, { shouldShow: p => addDependency(p.kuudraBoxKuudra) }),
  kuudraBoxKuudraEsp: new PropertyToggle('KuudraBoxKuudraEsp', true, { shouldShow: p => addDependency(p.kuudraBoxKuudra) }),

  kuudraDrawArrowToKuudra: new PropertyToggle('KuudraDrawArrowToKuudra', true, { desc: 'draw arrow pointing to kuudra in p5', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraArrowToKuudraColor: new PropertyColor('KuudraArrowToKuudraColor', 0x00FFFFFF, { shouldShow: p => addDependency(p.kuudraDrawArrowToKuudra) }),

  kuudraDrawHpGui: new PropertyToggle('KuudraDrawHpOnScreen', true, { desc: 'draw hp of kuudra onto hud', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  moveKuudraHp: new PropertyAction('MoveKuudraHp', null, { shouldShow: p => addDependency(p.kuudraDrawHpGui) }),
  kuudraDrawHpDec: new PropertyInteger('KuudraDrawHpDecimals', 3, { desc: 'number of decimals/sigfigs in the hp', min: 0, max: 3, shouldShow: p => addDependency(p.kuudraDrawHpGui) }),

  kuudraAutoRefillPearls: new PropertyToggle('KuudraAutoRefillPearls', true, { desc: 'automatically run /gfs at start of each run to replenish used pearls', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraAutoRefillPearlsAmount: new PropertyInteger('KuudraAutoRefillPearlsAmount', 16, { desc: 'amount of pearls you want to start run with', min: 0, max: 560, shouldShow: p => addDependency(p.kuudraAutoRefillPearls) }),

  kuudraPickupTitle: new PropertyOption('KuudraPickupTitle', 'Default', { options: ['Default', 'Simplified', 'None'] }),
};

const $Dungeon = {
  enabledungeon: new PropertyToggle('EnableDungeon', true, {}),

  dungeonBoxMobs: new PropertyToggle('DungeonBoxMobs', true, { desc: 'draws boxes around starred mobs\nonly mobs with both nametag and corresponding entity (no ghost nametags!)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxMobEsp: new PropertyToggle('DungeonBoxMobEsp', false, { shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxMobColor: new PropertyColor('DungeonBoxMobColor', 0x00FFFFFF, { desc: 'color for basic mobs', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxKeyColor: new PropertyColor('DungeonBoxKeyColor', 0x00FF00FF, { desc: 'color for wither/blood keys', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxSAColor: new PropertyColor('DungeonBoxSAColor', 0xFF0000FF, { desc: 'color for SAs', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxSMColor: new PropertyColor('DungeonBoxSkeleMasterColor', 0xFF8000FF, { desc: 'color for skele masters', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxFelColor: new PropertyColor('DungeonBoxFelColor', 0x00FF80FF, { desc: 'color for fels', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxChonkColor: new PropertyColor('DungeonBoxChonkersColor', 0xFF0080FF, { desc: 'color for withermancers, commanders, lords, and super archers', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxMiniColor: new PropertyColor('DungeonBoxMiniColor', 0xB400B4FF, { desc: 'color for LAs,  FAs, and AAs', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxMobDisableInBoss: new PropertyToggle('DungeonBoxMobDisableInBoss', false, { desc: 'pretty much only relevant for SAs in p2', shouldShow: p => addDependency(p.dungeonBoxMobs) }),

  dungeonBoxWither: new PropertyToggle('DungeonBoxWither', false, { desc: 'boxes wither lords\nindependent from box mobs', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxWitherEsp: new PropertyToggle('DungeonBoxWitherEsp', true, { shouldShow: p => addDependency(p.dungeonBoxWither) }),
  dungeonBoxWitherColor: new PropertyColor('DungeonBoxWitherColor', 0x515A0BFF, { shouldShow: p => addDependency(p.dungeonBoxWither) }),

  dungeonBoxLivid: new PropertyToggle('DungeonBoxLivid', false, { desc: 'independent from box mobs', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxLividEsp: new PropertyToggle('DungeonBoxLividEsp', true, { shouldShow: p => addDependency(p.dungeonBoxLivid) }),
  dungeonBoxLividColor: new PropertyColor('DungeonBoxLividColor', 0xFF0000FF, { shouldShow: p => addDependency(p.dungeonBoxLivid) }),
  dungeonBoxLividDrawArrow: new PropertyToggle('DungeonBoxLividDrawArrow', true, { shouldShow: p => addDependency(p.dungeonBoxLivid) }),

  dungeonBoxIceSprayed: new PropertyToggle('DungeonBoxIceSprayedMobs', false, { desc: 'boxes frozen mobs\nindependent from box mobs', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxIceSprayedEsp: new PropertyToggle('DungeonBoxIceSprayedEsp', false, { shouldShow: p => addDependency(p.dungeonBoxIceSprayed) }),
  dungeonBoxIceSprayedOutlineColor: new PropertyColor('DungeonBoxIceSprayedOutlineColor', 0XADD8E6FF, { shouldShow: p => addDependency(p.dungeonBoxIceSprayed) }),
  dungeonBoxIceSprayedFillColor: new PropertyColor('DungeonBoxIceSprayedFillColor', 0XADBCE650, { shouldShow: p => addDependency(p.dungeonBoxIceSprayed) }),

  dungeonBoxTeammates: new PropertyToggle('DungeonBoxTeammates', true, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxTeammatesEsp: new PropertyToggle('DungeonBoxTeammatesEsp', true, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesMageColor: new PropertyColor('DungeonBoxTeammatesMageColor', 0x1793C4FF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesArchColor: new PropertyColor('DungeonBoxTeammatesArchColor', 0xE80F0FFF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesBersColor: new PropertyColor('DungeonBoxTeammatesBersColor', 0xF77C1BFF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesTankColor: new PropertyColor('DungeonBoxTeammatesTankColor', 0x47D147FF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesHealColor: new PropertyColor('DungeonBoxTeammatesHealColor', 0xFF00FFFF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),

  dungeonCamp: new PropertyToggle('DungeonEnableCamp', true, { desc: 'blood camp helper', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonCampTimer: new PropertyToggle('DungeonCampShowTimer', false, { desc: 'render timer underneath boxes', shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampWireColor: new PropertyColor('DungeonCampWireColor', 0x00FF00FF, { desc: 'color of wireframe', shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampBoxColor: new PropertyColor('DungeonCampBoxColor', 0x00FFFFFF, { desc: 'color of shaded box', shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampBoxEsp: new PropertyToggle('DungeonCampBoxEsp', false, { shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampSmoothTime: new PropertyInteger('DungeonCampSmoothTime', 500, { desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1, shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampSkipTimer: new PropertyToggle('DungeonCampDialogueSkipTimer', false, { desc: 'timer until when to kill first 4 blood mobs', shouldShow: p => addDependency(p.dungeonCamp) }),
  moveDungeonCampSkipTimer: new PropertyAction('MoveDungeonCampSkipTimer', null, { shouldShow: p => addDependency(p.dungeonCampSkipTimer) }),

  dungeonHecatombAlert: new PropertyToggle('DungeonHecatombAlert', false, { desc: 'alert before end of run to swap to hecatomb (does not work for f4/m4/m7)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonHecatombAlertTime: new PropertyInteger('DungeonHecatombAlertTime', 5000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.dungeonHecatombAlert) }),
  dungeonHecatombAlertSound: new PropertyToggle('DungeonHecatombAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dungeonHecatombAlert) }),

  dungeonMap: new PropertyToggle('DungeonMap', false, { desc: 'does not work yet', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveDungeonMap: new PropertyAction('MoveDungeonMap', null, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapHideBoss: new PropertyToggle('DungeonMapHideInBoss', false, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapRenderHead: new PropertyToggle('DungeonMapRenderPlayerHeads', false, { desc: 'render heads instead of arrows on map', shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapRenderName: new PropertyOption('DungeonMapRenderPlayerNames', 'Holding Leap', { desc: 'render names of players above their marker', options: ['Always', 'Never', 'Holding Leap'], shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapRenderClass: new PropertyOption('DungeonMapRenderPlayerClass', 'Always', { desc: 'render class of players above their marker', options: ['Always', 'Never', 'Holding Leap'], shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxDoors: new PropertyOption('DungeonMapBoxDoors', 'Blood Doors', { desc: 'boxes wither/blood doors', options: ['Always', 'Never', 'Blood Doors'], shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxDoorOutlineColor: new PropertyColor('DungeonMapBoxDoorOutlineColor', 0x00FF00FF, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxDoorFillColor: new PropertyColor('DungeonMapBoxDoorFillColor', 0x00FF0050, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxLockedDoorOutlineColor: new PropertyColor('DungeonMapBoxLockedDoorOutlineColor', 0xFF0000FF, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxLockedDoorFillColor: new PropertyColor('DungeonMapBoxLockedDoorFillColor', 0xFF000050, { shouldShow: p => addDependency(p.dungeonMap) }),

  dungeonShowSecrets: new PropertyOption('DungeonShowSecrets', 'None', { desc: 'does not work yet, requires map to be on', options: ['None', 'Wire', 'Waypoint'], shouldShow: p => addDependency(p.dungeonMap) }),

  dungeonHideHealerPowerups: new PropertyToggle('DungeonHideHealerPowerups', true, { desc: 'hide healer power orbs (and particles!)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonAutoArchitect: new PropertyToggle('DungeonAutoGFSArchitect', false, { desc: 'auto gfs on puzzle fail, and a friendly reminder', shouldShow: p => addDependency(p.enabledungeon) }),

  dungeonNecronDragTimer: new PropertyOption('DungeonNecronDragTimer', 'None', { desc: 'timer when necron does some dragging\n(timer will automatically pop up when instamidding!)', options: ['OnScreen', 'InstaMid', 'Both', 'None'], shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveNecronDragTimer: new PropertyAction('MoveNecronDragTimer', null, { shouldShow: p => addDependency(p.dungeonNecronDragTimer) }),
  dungeonNecronDragDuration: new PropertyInteger('DungeonNecronDragDuration', 120, { desc: 'in ticks, 120 = move/leap, 163 = immunity', min: 0, shouldShow: p => addDependency(p.dungeonNecronDragTimer) }),

  dungeonDev4Helper: new PropertyOption('DungeonClearViewDev4', 'Both', { desc: 'clearer vision while doing 4th dev', options: ['None', 'Titles', 'Particles', 'Both'], shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonDev4HighlightBlock: new PropertyToggle('DungeonDev4HighlightBlock', true, { desc: 'highlights emerald block green, bypasses chunk updates', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonDev4HighlightBlockColor: new PropertyColor('DungeonDev4HighlightBlockColor', 0x50C878FF, { shouldShow: p => addDependency(p.dungeonDev4HighlightBlock) }),
  dungeonDev4HighlightBlockEsp: new PropertyToggle('DungeonDev4HighlightBlockEsp', false, { shouldShow: p => addDependency(p.dungeonDev4HighlightBlock) }),

  dungeonStairStonkHelper: new PropertyToggle('DungeonStairStonkHelper', false, { desc: 'stair stonker stuff', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonStairStonkHelperColor: new PropertyColor('DungeonStairStonkHelperColor', 0xFF0000FF, { desc: 'draw line to align yourself to dig down a stair\nsame as soopy but does not cut fps in half', shouldShow: p => addDependency(p.dungeonStairStonkHelper) }),
  dungeonStairStonkHelperHighlightColor: new PropertyColor('DungeonStairStonkHelperHighlightColor', 0x7DF9FF80, { desc: 'highlight stairs this color if they need to be ghosted to stonk', shouldShow: p => addDependency(p.dungeonStairStonkHelper) }),

  dungeonAutoRefillPearls: new PropertyToggle('DungeonAutoRefillPearls', false, { desc: 'automatically run /gfs to replenish used pearls', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonAutoRefillPearlsAmount: new PropertyInteger('DungeonAutoRefillPearlsAmount', 16, { desc: 'amount of pearls you want to have at a time', min: 0, max: 560, shouldShow: p => addDependency(p.dungeonAutoRefillPearls) }),
  dungeonAutoRefillPearlsThreshold: new PropertyInteger('DungeonAutoRefillPearlsThreshold', 0, { desc: 'automatically replenish pearls mid run when below this amount\n0 to disable', min: 0, max: 560, shouldShow: p => addDependency(p.dungeonAutoRefillPearls) }),
  dungeonAutoRefillPearlsGhostPickFix: new PropertyToggle('DungeonAutoRefillPearlsGhostPickFix', false, { desc: 'dont replenish when ghost pick\n(turn on if you ghost using pearls)', shouldShow: p => new StateProp(p.dungeonAutoRefillPearlsThreshold).notequals(0).and(p.dungeonAutoRefillPearlsThreshold.shouldShow) }),

  dungeonM7LBWaypoints: new PropertyToggle('DungeonDragonLBWaypoints', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonGoldorDpsStartAlert: new PropertyToggle('DungeonGoldorDpsStartAlert', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonGoldorDpsStartAlertTime: new PropertyInteger('DungeonGoldorDpsStartAlertTime', 500, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.dungeonGoldorDpsStartAlert) }),
  dungeonGoldorDpsStartAlertSound: new PropertyToggle('DungeonGoldorDpsStartAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dungeonGoldorDpsStartAlert) }),

  dungeonTerminalBreakdown: new PropertyToggle('DungeonTerminalBreakdown', false, { desc: 'displays terminals done by each person', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonPlaySoundKey: new PropertyToggle('DungeonPlaySoundOnKey', false, { desc: 'play dulkir secret sound on pickup key', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonIceSprayAlert: new PropertyToggle('DungeonRareMobDropAlert', true, { desc: 'alert on ice spray/sm cp', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonIceSprayAlertTime: new PropertyInteger('DungeonRareMobDropAlertTime', 2000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.dungeonIceSprayAlert) }),
  dungeonIceSprayAlertSound: new PropertyToggle('DungeonRareMobDropAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dungeonIceSprayAlert) }),

  dungeonTerminalsHelper: new PropertyToggle('DungeonTerminalsHelper', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonTerminalsGuiSize: new PropertyOption('DungeonTerminalsGuiSize', 'Unchanged', { desc: 'change gui size while in terminals', options: ['Unchanged', 'Small', 'Normal', 'Large', '4x', '5x', 'Auto'], shouldShow: p => addDependency(p.dungeonTerminalsHelper) }),
  dungeonTerminalsHideInv: new PropertyToggle('DungeonTerminalsHideInventory', false, { desc: 'hide inventory in terminals\nplease do not use, it will 1) break all solvers, 2) look shit, 3) probably breaks other things like locking slots', shouldShow: p => addDependency(p.dungeonTerminalsHelper) }),
  dungeonTerminalsHideInvScuffed: new PropertyToggle('DungeonTerminalsHideInventoryScuffed', false, { desc: 'hide inventory in terminals, but scuffed (basically centers around the chest instead of hiding)', shouldShow: p => addDependency(p.dungeonTerminalsHelper) }),

  dungeonSpiritBearHelper: new PropertyToggle('DungeonSpiritBearHelper', false, { desc: 'predict spirit bear spawn location', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonSpiritBearTimer: new PropertyToggle('DungeonSpiritBearShowTimer', false, { desc: 'render timer above box', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearWireColor: new PropertyColor('DungeonSpiritBearWireColor', 0x00FF00FF, { desc: 'color of wireframe', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearBoxColor: new PropertyColor('DungeonSpiritBearBoxColor', 0x00FFFFFF, { desc: 'color of shaded box', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearBoxEsp: new PropertyToggle('DungeonSpiritBearBoxEsp', false, { shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearSmoothTime: new PropertyInteger('DungeonSpiritBearSmoothTime', 500, { desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1, shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearTimerHud: new PropertyToggle('DungeonSpiritBearTimerHud', true, { desc: 'show spirit bear timer on hud', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  moveSpiritBearTimerHud: new PropertyAction('MoveSpiritBearTimerHud', null, { shouldShow: p => addDependency(p.dungeonSpiritBearTimerHud) }),

  dungeonSilverfishHasteTimer: new PropertyToggle('DungeonSilverfishHasteTimer', false, { desc: 'render how much longer haste from silverfish will last\nobsolete after haste artifact', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveSilverfishHasteTimer: new PropertyAction('MoveSilverfishHasteTimer', null, { shouldShow: p => addDependency(p.dungeonSilverfishHasteTimer) }),

  dungeonHideFallingBlocks: new PropertyToggle('DungeonHideFallingBlocks', true, { desc: 'dont render falling blocks in boss', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonHideWitherKing: new PropertyToggle('DungeonHideWitherKing', true, { desc: 'dont render wither king tentacles', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonDragonHelper: new PropertyToggle('DungeonDragonHelper', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonDragonHelperTimer2D: new PropertyToggle('DungeonDragonHelperTimerHUD', false, { desc: 'render timer until dragon spawn on hud', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  moveDragonHelperTimer: new PropertyAction('MoveDragonHelperTimer', null, { shouldShow: p => addDependency(p.dungeonDragonHelperTimer2D) }),
  dungeonDragonHelperTimer3D: new PropertyToggle('DungeonDragonHelperTimerWorld', false, { desc: 'render timer until dragon spawn under its chin', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperAlert: new PropertyOption('DungeonDragonHelperAlert', 'None', { desc: 'show alert when dragon is spawning', options: ['None', 'All', 'Split'], shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperAlertTime: new PropertyInteger('DungeonDragonHelperAlertTime', 1000, { desc: 'in ms', min: 0, shouldShow: p => new StateProp(p.dungeonDragonHelperAlert).notequals('None').and(p.dungeonDragonHelperAlert.shouldShow) }),
  dungeonDragonHelperAlertSound: new PropertyToggle('DungeonDragonHelperAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => new StateProp(p.dungeonDragonHelperAlert).notequals('None').and(p.dungeonDragonHelperAlert.shouldShow) }),
  dungeonDragonHelperSplit: new PropertyToggle('DungeonDragonHelperSplit', true, { desc: 'do you split', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperPrioS: new PropertyText('DungeonDragonHelperPrioSplit', 'ogrbp', { desc: 'priority to use when splitting\nbers team -> ogrbp <- arch team', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperPrioNS: new PropertyText('DungeonDragonHelperPrioNoSplit', 'robpg', { desc: 'priority to use when NOT splitting', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperBersTeam: new PropertyText('DungeonDragonHelperBersTeam', 'bmh', { desc: 'classes that go w/ bers team\nb m h | a t', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperTrackHits: new PropertyOption('DungeonDragonHelperTrackHits', 'Full', { desc: 'tracks number of arrow hits during drag dps\nnote: will count all arrow hits (will count any hits on husks)\nBurst: count initial "burst" of hits at start of spawn\n(i.e. first 1s if a/b, otherwise time until 5 lbs)\nFull: hits during entire duration dragon is alive\nBoth: full + burst stats', options: ['None', 'Burst', 'Full', 'Both'], shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperTrackHitsTimeUnit: new PropertyOption('DungeonDragonHelperTrackHitsTimeUnit', 'Both', { desc: 'note: seconds is still measured in ticks, not real time', options: ['Ticks', 'Seconds', 'Both'], shouldShow: p => new StateProp(p.dungeonDragonHelperTrackHits).notequals('None').and(p.dungeonDragonHelperTrackHits.shouldShow) }),

  dungeonLBPullProgress: new PropertyToggle('DungeonLBPullProgress', false, { desc: 'play sounds indicating bow pull progress (accounting for lag)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonLBPullProgressVolume: new PropertyNumber('DungeonLBPullProgressVolume', 1, { min: 0, max: 5, shouldShow: p => addDependency(p.dungeonLBPullProgress) }),
  dungeonLBPullProgressThreshold: new PropertyInteger('DungeonLBPullProgressThreshold', 8, { desc: 'how many ticks to swap to different sound\n0: always, 21: never', min: 0, max: 21, shouldShow: p => addDependency(p.dungeonLBPullProgress) }),

  dungeonSimonSays: new PropertyToggle('DungeonSimonSays', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonSimonSaysColor1: new PropertyColor('DungeonSimonSaysColor', 0x00FF00A0, { desc: 'color of the button to press ', shouldShow: p => addDependency(p.dungeonSimonSays) }),
  dungeonSimonSaysColor2: new PropertyColor('DungeonSimonSaysColorNext', 0xFFFF00A0, { desc: 'color of the next button to press', shouldShow: p => addDependency(p.dungeonSimonSays) }),
  dungeonSimonSaysColor3: new PropertyColor('DungeonSimonSaysColorOther', 0xFF0000A0, { desc: 'color of the other buttons', shouldShow: p => addDependency(p.dungeonSimonSays) }),
  dungeonSimonSaysBlock: new PropertyOption('DungeonSimonSaysBlockClicks', 'ExceptWhenCrouching', { desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'], shouldShow: p => addDependency(p.dungeonSimonSays) }),

  dungeonArrowAlign: new PropertyToggle('DungeonArrowAlign', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonArrowAlignBlock: new PropertyOption('DungeonArrowAlignBlockClicks', 'ExceptWhenCrouching', { desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'], shouldShow: p => addDependency(p.dungeonArrowAlign) }),
  dungeonArrowAlignLeavePD: new PropertyToggle('DungeonArrowAlignLeaveOnePD', true, { desc: 'leave 1 frame at 1 click away during pd', shouldShow: p => addDependency(p.dungeonArrowAlign) }),

  dungeonGoldorFrenzyTimer: new PropertyToggle('DungeonGoldorFrenzyTimer', false, { desc: 'show timer until next goldor frenzy tick', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveGoldorFrenzyTimer: new PropertyAction('MoveGoldorFrenzyTimer', null, { shouldShow: p => addDependency(p.dungeonGoldorFrenzyTimer) }),

  dungeonBlockOverlaySize: new PropertyNumber('DungeonBlockOverlaySize', 1, { desc: 'size of overlay when inside an opaque block\nin range [0, 1], 0 = none, 1 = default', min: 0, max: 1, shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonHideHealerFairy: new PropertyOption('DungeonHideHealerFairy', 'Own', { options: ['Never', 'Own', 'Always'], shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonDHubHighlightLow: new PropertyToggle('DungeonDHubSelectorHighlight', true, { desc: 'green for low players :)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonTerracottaRespawn: new PropertyToggle('DungeonTerracottaRespawnTimer', false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonTerracottaRespawnType: new PropertyOption('DungeonTerracottaRespawnTimerType', 'Timer', { options: ['Timer', 'Box', 'Both'], shouldShow: p => addDependency(p.dungeonTerracottaRespawn) }),
  dungeonTerracottaRespawnOutlineColor: new PropertyColor('DungeonTerracottaRespawnOutlineColor', 0x91553DFF, { shouldShow: p => new StateProp(p.dungeonTerracottaRespawnType).notequals('Timer').and(p.dungeonTerracottaRespawnType.shouldShow) }),
  dungeonTerracottaRespawnFillColor: new PropertyColor('DungeonTerracottaRespawnFillColor', 0xA27157A0, { shouldShow: p => new StateProp(p.dungeonTerracottaRespawnType).notequals('Timer').and(p.dungeonTerracottaRespawnType.shouldShow) }),
  dungeonTerracottaRespawnGui: new PropertyToggle('DungeonTerracottaRespawnGui', false, { desc: 'render the timer for the first terracotta on hud', shouldShow: p => addDependency(p.dungeonTerracottaRespawn) }),
  moveDungeonTerracottaRespawnGui: new PropertyAction('MoveDungeonTerracottaRespawnGui', null, { shouldShow: p => addDependency(p.dungeonTerracottaRespawnGui) }),

  dungeonStormClearLaser: new PropertyToggle('DungeonStormClearLaserChecker', false, { desc: 'warn when someone is using laser in storm clear', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonHideSoulweaverSkulls: new PropertyToggle('DungeonHideSoulweaverSkulls', true),
};

const $ServerTracker = {
  enableservertracker: new PropertyToggle('EnableServerTracker', true, { desc: 'tracks servers you\'ve been to, also /warp tab complete' }),
  serverTrackerTransferCd: new PropertyInteger('ServerTrackerTransferCd', 3000, { desc: 'delays warps by this long if spammed too quickly', min: 0, shouldShow: p => addDependency(p.enableservertracker) }),
  serverTrackerCdMessage: new PropertyText('ServerTrackerCdMessage', 'waiting for cd (u.U)｡｡｡ zzZ', { shouldShow: p => addDependency(p.enableservertracker) }),
};

const $StatGui = {
  enablestatgui: new PropertyToggle('EnableStatGUI', false, { desc: 'render stats from tab onto hud' }),
  loc0: new PropertyToggle('EnablePrivateIslandGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc0: new PropertyAction('MovePrivateIslandGUI', null, { shouldShow: p => addDependency(p.loc0) }),
  loc1: new PropertyToggle('EnableHubGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc1: new PropertyAction('MoveHubGUI', null, { shouldShow: p => addDependency(p.loc1) }),
  loc2: new PropertyToggle('EnableDungeonHubGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc2: new PropertyAction('MoveDungeonHubGUI', null, { shouldShow: p => addDependency(p.loc2) }),
  loc3: new PropertyToggle('EnableTheFarmingIslandsGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc3: new PropertyAction('MoveTheFarmingIslandsGUI', null, { shouldShow: p => addDependency(p.loc3) }),
  loc4: new PropertyToggle('EnableGardenGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc4: new PropertyAction('MoveGardenGUI', null, { shouldShow: p => addDependency(p.loc4) }),
  loc5: new PropertyToggle('EnableTheParkGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc5: new PropertyAction('MoveTheParkGUI', null, { shouldShow: p => addDependency(p.loc5) }),
  loc6: new PropertyToggle('EnableGoldMineGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc6: new PropertyAction('MoveGoldMineGUI', null, { shouldShow: p => addDependency(p.loc6) }),
  loc7: new PropertyToggle('EnableDeepCavernsGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc7: new PropertyAction('MoveDeepCavernsGUI', null, { shouldShow: p => addDependency(p.loc7) }),
  loc8: new PropertyToggle('EnableDwarvenMinesGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc8: new PropertyAction('MoveDwarvenMinesGUI', null, { shouldShow: p => addDependency(p.loc8) }),
  loc9: new PropertyToggle('EnableCrystalHollowsGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc9: new PropertyAction('MoveCrystalHollowsGUI', null, { shouldShow: p => addDependency(p.loc9) }),
  loc10: new PropertyToggle('EnableSpidersDenGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc10: new PropertyAction('MoveSpidersDenGUI', null, { shouldShow: p => addDependency(p.loc10) }),
  loc11: new PropertyToggle('EnableTheEndGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc11: new PropertyAction('MoveTheEndGUI', null, { shouldShow: p => addDependency(p.loc11) }),
  loc12: new PropertyToggle('EnableCrimsonIsleGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc12: new PropertyAction('MoveCrimsonIsleGUI', null, { shouldShow: p => addDependency(p.loc12) }),
  loc13: new PropertyToggle('EnableKuudraGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc13: new PropertyAction('MoveKuudraGUI', null, { shouldShow: p => addDependency(p.loc13) }),
  loc14: new PropertyToggle('EnableTheRiftGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc14: new PropertyAction('MoveTheRiftGUI', null, { shouldShow: p => addDependency(p.loc14) }),
  loc15: new PropertyToggle('EnableJerrysWorkshopGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc15: new PropertyAction('MoveJerrysWorkshopGUI', null, { shouldShow: p => addDependency(p.loc15) }),
  loc16: new PropertyToggle('EnableCatacombsGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc16: new PropertyAction('MoveCatacombsGUI', null, { shouldShow: p => addDependency(p.loc16) }),
  loc17: new PropertyToggle('EnableBackwaterBayouGUI', true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc17: new PropertyAction('MoveBackwaterBayouGUI', null, { shouldShow: p => addDependency(p.loc17) }),
};

const $RatTils = {
  enablerattils: new PropertyToggle('EnableRatTils', true, { desc: 'boxes cheese and other stuff' }),
  ratTilsBoxColor: new PropertyColor('RatTilsBoxColor', 0x00FF80FF, { shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
  ratTilsBoxEsp: new PropertyToggle('RatTilsBoxEsp', true, { shouldShow: p => addDependency(p.enablerattils) }),
  ratTilsAlertTime: new PropertyInteger('RatTilsAlertTime', 2000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
  ratTilsAlertSound: new PropertyToggle('RatTilsAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.enablerattils) }),
  ratTilsMessage: new PropertyText('RatTilsMessage', 'i.imgur.com/8da4IiM.png', { desc: 'empty to disable', shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
  ratTilsChannel: new PropertyText('RatTilsChannel', 'pc', { shouldShow: p => new StateProp(p.ratTilsMessage).notequals('').and(p.ratTilsMessage.shouldShow) }),
  ratTilsMuteSound: new PropertyToggle('RatTilsMuteSound', true, { desc: 'mute rat squeaking sounds', shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
};

const $PowderChest = {
  enablepowderalert: new PropertyToggle('EnablePowderAlert', false, { desc: 'alerts when powder chest spawns' }),
  powderScanRange: new PropertyInteger('PowderScanRange', 10, { min: 0, shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderBoxEsp: new PropertyToggle('PowderBoxEsp', true, { shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderBoxColor: new PropertyColor('PowderBoxColor', 0x00FFFFA0, { shouldShow: p => addDependency(p.enablepowderalert) }),
  powderBoxColor2: new PropertyColor('PowderBoxColorDead', 0xFF0000FF, { desc: '2nd color of gradient  between 1st and 2nd based on when chest will despawn', shouldShow: p => addDependency(p.enablepowderalert) }),
  powderAlertTime: new PropertyInteger('PowderAlertTime', 1000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderAlertSound: new PropertyToggle('PowderAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.enablepowderalert) }),
  powderBlockRewards: new PropertyToggle('PowderHideMessage', true, { desc: 'hides chest rewards message', shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderShowPowder: new PropertyToggle('PowderHideMessageShowPowder', true, { desc: 'keep the powder gain message', shouldShow: p => addDependency(p.powderBlockRewards) }),
};

const $CrystalAlert = {
  enablecrystalalert: new PropertyToggle('EnableCrystalAlert', false, { desc: 'alerts when end crystals spawn' }),
  crystalBoxColor: new PropertyColor('CrystalBoxColor', 0x00FF00FF, { shouldShow: p => addDependency(p.enablecrystalalert) }),
  crystalBoxEsp: new PropertyToggle('CrystalBoxEsp', true, { shouldShow: p => addDependency(p.enablecrystalalert) }),
  crystalAlertTime: new PropertyInteger('CrystalAlertTime', 1000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.enablecrystalalert) }),
  crystalAlertSound: new PropertyToggle('CrystalAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.enablecrystalalert) }),
};

const $CommandAliases = {
  enablecmdalias: new PropertyToggle('EnableCommandAliases', true, {}),
  cmdAliasStorage: new PropertyToggle('EnableStorageShortcut', true, { desc: 'e.g. /b1, /e2, and /3 for /backpack 1, /enderchest 2, /backpack 3 respectively', shouldShow: p => addDependency(p.enablecmdalias) }),
  cmdAliasDungeon: new PropertyToggle('EnableDungeonShortcut', true, { desc: 'e.g. /f1, /m1, /fe', shouldShow: p => addDependency(p.enablecmdalias) }),
  cmdAliasKuudra: new PropertyToggle('EnableKuudraShortcut', true, { desc: 'e.g. /k1', shouldShow: p => addDependency(p.enablecmdalias) }),
};

const $QuiverDisplay = {
  enablequiver: new PropertyToggle('EnableQuiverDisplay', false, { desc: 'arrow display on hud, only works when holding bow' }),
  moveQuiver: new PropertyAction('MoveQuiverDisplay', null, { shouldShow: p => addDependency(p.enablequiver) }),
  quiverSize: new PropertyOption('QuiverMaxSize', 'Giant', { desc: 'size of quiver (based on feather collection)', options: ['Medium', 'Large', 'Giant'], shouldShow: p => addDependency(p.enablequiver) }),
  quiverShowRefill: new PropertyToggle('QuiverShowRefillCost', false, { desc: 'show refill cost', shouldShow: p => addDependency(p.enablequiver) }),
  quiverRefillCost: new PropertyOption('QuiverRefillCostType', 'Instant', { desc: 'method of refilling\nInstant: whatever is fastest\nIndividual: spam left click at jax (cheaper, also ur a loser)\nJax: same as instant but jax flint arrows expensiver\nOphelia: same as instant', options: ['Instant', 'Individual', 'Jax', 'Ophelia'], shouldShow: p => addDependency(p.quiverShowRefill) }),
  quiverShowRefillThresh: new PropertyPercent('QuiverRefillCostDisplayThreshold', 25, { desc: 'only show refill cost when below this amount full', min: 0, max: 100, shouldShow: p => addDependency(p.quiverShowRefill) }),
};

const $Rabbit = {
  enablerabbit: new PropertyToggle('EnableRabbitTils', false, {}),
  rabbitShowBestUpgrade: new PropertyToggle('RabbitTilsShowBestUpgrade', true, { desc: 'highlight most cost effective rabbit upgrade', shouldShow: p => addDependency(p.enablerabbit) }),
  rabbitCondenseChat: new PropertyToggle('RabbitTilsCondenseChat', true, { desc: 'has been promoted lookin mf', shouldShow: p => addDependency(p.enablerabbit) }),
};

const $ChatTils = {
  enablechattils: new PropertyToggle('EnableChatTils', false, {}),

  chatTilsWaypoint: new PropertyToggle('ChatTilsFindWaypoints', true, { desc: 'look for waypoints in all the chats', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsWaypointType: new PropertyOption('ChatTilsWaypointType', 'Box', { desc: 'type of waypoint', options: ['Box', 'Wireframe', 'None'], shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointColor: new PropertyColor('ChatTilsWaypointColor', 0xC80000FF, { shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointBeacon: new PropertyToggle('ChatTilsWaypointShowBeacon', true, { desc: 'render beacon to waypoint', shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointName: new PropertyToggle('ChatTilsWaypointShowName', false, { desc: 'show name of player who sent waypoint', shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointDuration: new PropertyInteger('ChatTilsWaypointDuration', 60, { desc: 'time in seconds, 0 = forever', min: 0, shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointShowOwn: new PropertyToggle('ChatTilsWaypointShowOwn', true, { desc: 'show your own waypoints', shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointPersist: new PropertyToggle('ChatTilsWaypointPersist', false, { desc: 'whether to persist on swapping servers', shouldShow: p => addDependency(p.chatTilsWaypoint) }),

  chatTilsHideBonzo: new PropertyOption('ChatTilsHidePartyChatBonzo', 'False', { desc: '"Bonzo Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsHidePhoenix: new PropertyOption('ChatTilsHidePartyChatPhoenix', 'False', { desc: '"Phoenix Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsHideSpirit: new PropertyOption('ChatTilsHidePartyChatSpirit', 'False', { desc: '"Spirit Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsHideLeap: new PropertyOption('ChatTilsHidePartyChatLeaps', 'False', { desc: '"Leaped/Leaping to plinkingndriving" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsHideMelody: new PropertyOption('ChatTilsHidePartyChatMelody', 'False', { desc: '"melody (1/4)/25%" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsCompactMelody: new PropertyToggle('ChatTilsCompactPartyChatMelody', true, { desc: 'only keep most recent melody message from a player', shouldShow: p => addDependency(p.enablechattils) }),

  chatTilsClickAnywhereFollow: new PropertyToggle('ChatTilsClickAnywhereFollow', false, { desc: 'click anywhere after opening chat to follow party member\n(mostly for diana/assfang/jumpy dt cube)', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsClickAnywhereFollowOnlyLead: new PropertyToggle('ChatTilsClickAnywhereFollowOnlyLead', true, { desc: 'only follow leader', shouldShow: p => addDependency(p.chatTilsClickAnywhereFollow) }),

  chatTilsImageArt: new PropertyToggle('ChatTilsImageArt', false, { desc: 'generate ascii art from image\nusage: /printimage [image url]\n/printimage (will print image from clipboard)\n/printimage https://i.imgur.com/things.jpeg (will print image from url)', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsImageArtParty: new PropertyToggle('ChatTilsImageArtPartyChat', true, { desc: 'always send in party chat', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtAutoPrint: new PropertyToggle('ChatTilsImageArtAutoPrint', false, { desc: 'auto print all lines of the image', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtWidth: new PropertyInteger('ChatTilsImageArtPartyWidth', 40, { desc: 'width of the generated image (in characters)\nheight automatically scaled', min: 1, max: 128, shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtEncoding: new PropertyOption('ChatTilsImageArtEncoding', 'Braille', { desc: 'encoding used', options: ['Braille', 'ASCII'], shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtUseGaussian: new PropertyToggle('ChatTilsImageArtSmooth', false, { desc: 'apply a gaussian blur to image before processing (best results when sobel is used)', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtSharpen: new PropertyToggle('ChatTilsImageArtSharpen', true, { desc: 'sharpen source image', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtDither: new PropertyToggle('ChatTilsImageArtDither', true, { desc: 'apply dithering', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtInvert: new PropertyToggle('ChatTilsImageArtInvert', true, { desc: 'invert colors', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtAlgorithm: new PropertyOption('ChatTilsImageArtAlgorithm', 'Grayscale', { desc: 'transform algorithm used', options: ['Grayscale', 'Sobel'], shouldShow: p => addDependency(p.chatTilsImageArt) }),

  chatTilsEssential: new PropertyToggle('ChatTilsBetterEssential', false, { desc: 'show Essential messages in mc chat\n/we, /te, /re, and /fe for corresponding Essential actions', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsEssentialPing: new PropertyToggle('ChatTilsEssentialPing', true, { desc: 'send chat pings on recieve message', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialNotif: new PropertyToggle('ChatTilsEssentialNotification', false, { desc: 'send Essential notification on recieve message', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialOverrideCommands: new PropertyToggle('ChatTilsBetterEssentialOverrideCommands', false, { desc: 'override the /w, /t, /r, and /f commands to be Essential ones', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialForwardPartyDms: new PropertyToggle('ChatTilsEssentialForwardPartyDms', false, { desc: 'when leader in a party, any essential dms from party members will be forwarded to party chat', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialRedirectPartyChat: new PropertyToggle('ChatTilsEssentialRedirectPartyChat', false, { desc: 'redirect /pc to message leader on essentials\nalso enables /chat p and /chat party', shouldShow: p => addDependency(p.chatTilsEssential) }),
};

const $Diana = {
  enablediana: new PropertyToggle('EnableDiana', false, {}),
  dianaArrowToBurrow: new PropertyToggle('DianaArrowToBurrow', true, { desc: 'draw an arrow pointing to nearest burrow', shouldShow: p => addDependency(p.enablediana), isNewSection: true }),
  dianaArrowToBurrowColor: new PropertyColor('DianaArrowToBurrowColor', 0x9FE2BF, { shouldShow: p => addDependency(p.dianaArrowToBurrow) }),
  dianaScanBurrows: new PropertyToggle('DianaScanBurrows', true, { desc: 'look for burrows by particles', shouldShow: p => addDependency(p.enablediana), isNewSection: true }),
  dianaBurrowStartColor: new PropertyColor('DianaBurrowStartColor', 0xBBEEEEFF, { shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaBurrowMobColor: new PropertyColor('DianaBurrowMobColor', 0x2A1D32FF, { shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaBurrowTreasureColor: new PropertyColor('DianaBurrowTreasureColor', 0xFED02AFF, { shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrow: new PropertyToggle('DianaAlertFoundBurrow', true, { desc: 'alert when burrow is found', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrowNoStart: new PropertyToggle('DianaAlertFoundBurrowNoStart', false, { desc: 'do not alert when found burrow is a start burrow', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrowTime: new PropertyInteger('DianaAlertFoundBurrowTime', 500, { desc: 'in ms', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrowSound: new PropertyToggle('DianaAlertFoundBurrowSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaGuessFromParticles: new PropertyToggle('DianaGuessFromParticles', false, { desc: '/togglesound must be on', shouldShow: p => addDependency(p.enablediana), isNewSection: true }),
  dianaGuessRememberPrevious: new PropertyToggle('DianaRememberPreviousGuesses', true, { desc: 'guesses only removed when nearby burrow is found i.e. DianaScanBurrows must be on\nor use /ctsremoveclosestdiana', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaBurrowPrevGuessColor: new PropertyColor('DianaBurrowPrevGuessColor', 0x707020FF, { shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesPathColor: new PropertyColor('DianaGuessFromParticlesPathColor', 0x00FFFFFF, { desc: 'color of path of particles', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesRenderName: new PropertyToggle('DianaGuessFromParticlesRenderName', false, { shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesAverageColor: new PropertyColor('DianaGuessFromParticlesAverageColor', 0xB000B5FF, { desc: 'color of geometric median of all guesses', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesSplineColor: new PropertyColor('DianaGuessFromParticlesSplineColor', 0x138686FF, { desc: 'color of guess from spline estimation', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesMLATColor: new PropertyColor('DianaGuessFromParticlesMLATColor', 0xB31919FF, { desc: 'color of guess from multilateration', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesBezierColor: new PropertyColor('DianaGuessFromParticlesBezierColor', 0xFF8000FF, { desc: 'color of guess from bezier + control point', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
};

const $HUD = {
  enableabsorption: new PropertyToggle('EnableCustomAbsorption', false, { desc: 'custom absorption renderer to more accurately portray total hp' }),
  absorptionMaxHearts: new PropertyInteger('AbsorptionMaxHearts', 40, { desc: 'caps hearts for things like mastiff', min: 0, shouldShow: p => addDependency(p.enableabsorption) }),

  enableserverscrutinizer: new PropertyToggle('EnableServerScrutinizer', false, { desc: 'scrutinizes the server\'s tps and things', isNewSection: true }),

  serverScrutinizerTPSDisplay: new PropertyToggle('ServerScrutinizerTPSDisplay', true, { desc: 'tracks tps', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  moveTPSDisplay: new PropertyAction('MoveTPSDisplay', null, { shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayCap20: new PropertyToggle('ServerScrutinizerCapTPS', false, { desc: 'caps all tps at 20', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayCurr: new PropertyToggle('ServerScrutinizerDisplayCurrentTPS', false, { desc: 'show current tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayAvg: new PropertyToggle('ServerScrutinizerDisplayAverageTPS', true, { desc: 'show average tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayMin: new PropertyToggle('ServerScrutinizerDisplayMinimumTPS', false, { desc: 'show minimum tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayMax: new PropertyToggle('ServerScrutinizerDisplayMaximumTPS', false, { desc: 'show maximum tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSMaxAge: new PropertyInteger('ServerScrutinizerTPSMaxAge', 5000, { desc: 'max age of ticks', min: 1000, shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),

  serverScrutinizerLastTickDisplay: new PropertyToggle('ServerScrutinizerLastPacketDisplay', true, { desc: 'tracks last packet sent time (lag spike)', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  moveLastTickDisplay: new PropertyAction('MoveLastTickDisplay', null, { shouldShow: p => addDependency(p.serverScrutinizerLastTickDisplay) }),
  serverScrutinizerLastTickThreshold: new PropertyInteger('ServerScrutinizerLastPacketThreshold', 200, { desc: 'only show when server has not responded for this amount of time\nin ms', shouldShow: p => addDependency(p.serverScrutinizerLastTickDisplay) }),

  serverScrutinizerFPSDisplay: new PropertyToggle('ServerScrutinizerFPSDisplay', false, { desc: 'tracks FPS', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  moveFPSDisplay: new PropertyAction('MoveFPSDisplay', null, { shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayCurr: new PropertyToggle('ServerScrutinizerDisplayCurrentFPS', true, { desc: 'show current fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayAvg: new PropertyToggle('ServerScrutinizerDisplayAverageFPS', true, { desc: 'show average fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayMin: new PropertyToggle('ServerScrutinizerDisplayMinimumFPS', true, { desc: 'show minimum fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayMax: new PropertyToggle('ServerScrutinizerDisplayMaximumFPS', true, { desc: 'show maximum fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSMaxAge: new PropertyInteger('ServerScrutinizerFPSMaxAge', 5000, { desc: 'max age of ticks', min: 1000, shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),

  serverScrutinizerPingDisplay: new PropertyToggle('ServerScrutinizerPingDisplay', false, { desc: 'tracks ping', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  movePingDisplay: new PropertyAction('MovePingDisplay', null, { shouldShow: p => addDependency(p.serverScrutinizerPingDisplay) }),
  serverScrutinizerPingDisplayCurr: new PropertyToggle('ServerScrutinizerDisplayCurrentPing', true, { desc: 'show current ping', shouldShow: p => addDependency(p.serverScrutinizerPingDisplay) }),
  serverScrutinizerPingDisplayAvg: new PropertyToggle('ServerScrutinizerDisplayAveragePing', true, { desc: 'show average ping', shouldShow: p => addDependency(p.serverScrutinizerPingDisplay) }),

  serverScrutinizerPPSDisplay: new PropertyToggle('ServerScrutinizerPPSDisplay', false, { desc: 'tracks PPS (packets [send] per second)', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  movePPSDisplay: new PropertyAction('MovePPSDisplay', null, { shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayCurr: new PropertyToggle('ServerScrutinizerDisplayCurrentPPS', true, { desc: 'show current pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayAvg: new PropertyToggle('ServerScrutinizerDisplayAveragePPS', true, { desc: 'show average pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayMin: new PropertyToggle('ServerScrutinizerDisplayMinimumPPS', true, { desc: 'show minimum pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayMax: new PropertyToggle('ServerScrutinizerDisplayMaximumPPS', true, { desc: 'show maximum pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSMaxAge: new PropertyInteger('ServerScrutinizerPPSMaxAge', 5000, { desc: 'max age of ticks', min: 1000, shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),

  enablespotify: new PropertyToggle('EnableSpotifyDisplay', false, { desc: 'shows current song playing on spotify, only works on windows + app version', isNewSection: true }),
  moveSpotifyDisplay: new PropertyAction('MoveSpotifyDisplay', null, { shouldShow: p => addDependency(p.enablespotify) }),
  spotifyHideNotOpen: new PropertyToggle('SpotifyHideIfNotOpened', true, { desc: 'hide if spotify is not opened', shouldShow: p => addDependency(p.enablespotify) }),
  spotifyMaxSongLength: new PropertyInteger('SpotifyMaxSongLength', 100, { desc: 'in pixels, 0 for uncapped length', min: 0, shouldShow: p => addDependency(p.enablespotify) }),

  enablesacks: new PropertyToggle('EnableSackTils', false, { desc: 'does things with the sacks message\nto turn on settings -> personal -> chat feedback -> sack notifs', isNewSection: true }),
  sacksDisableMessage: new PropertyToggle('SackTilsDisableMessage', true, { desc: 'hide the message', shouldShow: p => addDependency(p.enablesacks) }),
  sacksDisplay: new PropertyToggle('SackTilsDisplay', true, { desc: 'gui showing change in items', shouldShow: p => addDependency(p.enablesacks) }),
  moveSacksDisplay: new PropertyAction('MoveSacktilsDisplay', null, { shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayTimeout: new PropertyNumber('SackTilsDisplayTimeout', 5000, { desc: 'how long to show changes for in ms', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayCombineQuantities: new PropertyToggle('SackTilsDisplayCombineQuantities', false, { desc: 'combine +16 Ender Pearl and -3 Ender Pearl into +13 Ender Pearl', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayTrackAggregateQuantities: new PropertyToggle('SackTilsDisplayTrackAggregateQuantities', false, { desc: 'remember previous transactions (reset on restart/reload or manually)', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayResetAggregate: new PropertyAction('SackTilsDisplayResetAggregate', null, { shouldShow: p => addDependency(p.sacksDisplayTrackAggregateQuantities) }),
  sacksDisplayItemWhitelist: new PropertyText('SackTilsDisplayItemWhitelist', '', { desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayItemBlacklist: new PropertyText('SackTilsDisplayItemBlacklist', '', { desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato', shouldShow: p => addDependency(p.sacksDisplay) }),

  enabledeployable: new PropertyToggle('EnableDeployableTils', false, { isNewSection: true }),
  deployableHUD: new PropertyOption('DeployableHUD', 'Compact', { desc: 'show current deployable\nwhat is bubblegum?', options: ['Compact', 'Full', 'None'], shouldShow: p => addDependency(p.enabledeployable) }),
  moveDeployableHUD: new PropertyAction('MoveDeployableHUD', null, { shouldShow: p => addDependency(p.deployableHUD) }),
  deployableAssumeJalapeno: new PropertyToggle('DeployableAssumeJalapeno', true, { desc: 'assume flares have jalapeno applied\n(cannot detect programmatically because fuck hypixel)', shouldShow: p => addDependency(p.deployableHUD) }),
  deployableHUDColorTimer: new PropertyToggle('DeployableHUDColorTime', true, { desc: 'color the timer based on time remaining', shouldShow: p => addDependency(p.deployableHUD) }),
  deployableParticlesOwn: new PropertyOption('DeployableParticlesOwn', 'Default', { options: ['Default', 'None', 'Custom'], desc: 'only applies to own deployables', shouldShow: p => addDependency(p.enabledeployable) }),
  deployableParticlesOther: new PropertyOption('DeployableParticlesOther', 'Default', { options: ['Default', 'None', 'Custom'], shouldShow: p => addDependency(p.enabledeployable) }),

  enableferoestimate: new PropertyToggle('EnableFeroEstimate', false, { isNewSection: true }),
  moveFeroEstimate: new PropertyAction('MoveFeroEstimate', null, { shouldShow: p => addDependency(p.enableferoestimate) }),
  feroEstimateUpdateDelay: new PropertyInteger('FeroEstimateUpdateDelay', 500, { desc: 'delay in ms to update guess', min: 0, shouldShow: p => addDependency(p.enableferoestimate) }),

  enablecrosshair: new PropertyToggle('EnableCustomCrosshair', false, { isNewSection: true }),
  crosshairType: new PropertyOption('CustomCrosshairType', '+', { options: ['+', 'X', '/\\', 'O', '.'], shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairColor: new PropertyColor('CustomCrosshairColor', 0xFFFFFFFF, { shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairInvert: new PropertyToggle('CustomCrosshairInvertColor', false, { shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairWidth: new PropertyNumber('CustomCrosshairWidth', 10, { min: 0, shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairBreadth: new PropertyNumber('CustomCrosshairBreadth', 1, { min: 0, shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairRenderInGui: new PropertyToggle('CustomCrosshairRenderInGuis', false, { shouldShow: p => addDependency(p.enablecrosshair) }),
};

const $AvariceAddons = {
  enableavarice: new PropertyToggle('EnableAvariceAddons', false, { desc: 'things for avarice' }),

  avariceShowCoinCounter: new PropertyToggle('AvariceShowCoinCounter', true, { desc: 'show avarice coins in a hud', shouldShow: p => addDependency(p.enableavarice), isNewSection: true }),
  moveAvariceCoinCounter: new PropertyAction('MoveAvariceCoinCounter', null, { shouldShow: p => addDependency(p.avariceShowCoinCounter) }),

  avariceArachne: new PropertyToggle('AvariceBigSpooderHelper', true, { desc: 'big spooder go die, i hate nons', shouldShow: p => addDependency(p.enableavarice), isNewSection: true }),
  avariceArachneHideBroodNames: new PropertyToggle('AvariceHideSmallSpooderNames', true, { desc: 'make small spooder names go bye', shouldShow: p => addDependency(p.avariceArachne) }),
  avariceArachneBoxBigSpooder: new PropertyToggle('AvariceBoxBigSpooder', true, { shouldShow: p => addDependency(p.avariceArachne) }),
  avariceArachneBoxBigSpooderColor: new PropertyColor('AvariceBoxBigSpooderColor', 0xEB38BBFF, { shouldShow: p => addDependency(p.avariceArachneBoxBigSpooder) }),
  avariceArachneBoxBigSpooderEsp: new PropertyToggle('AvariceBoxBigSpooderEsp', false, { shouldShow: p => addDependency(p.avariceArachneBoxBigSpooder) }),
  avariceArachneBoxBigSpooderDrawArrow: new PropertyToggle('AvariceBoxBigSpooderDrawArrow', true, { shouldShow: p => addDependency(p.avariceArachneBoxBigSpooder) }),
  avariceArachneBoxSmallSpooders: new PropertyToggle('AvariceBoxSmallSpooders', true, { shouldShow: p => addDependency(p.avariceArachne) }),
  avariceArachneBoxSmallSpoodersColor: new PropertyColor('AvariceBoxSmallSpoodersColor', 0x26ED5EFF, { shouldShow: p => addDependency(p.avariceArachneBoxSmallSpooders) }),
  avariceArachneBoxSmallSpoodersEsp: new PropertyToggle('AvariceBoxSmallSpoodersEsp', false, { shouldShow: p => addDependency(p.avariceArachneBoxSmallSpooders) }),

  avariceTaraTrader: new PropertyToggle('AvariceTaraTrader', false, { desc: 'block hits on tara if slayer quest not started\nlag go brr\nnote: doesnt block custom hits (i.e. >3 block range)\nas of writing this, xp duping is patched and trading is not possible (i.e. obsolete)', shouldShow: p => addDependency(p.enableavarice), isNewSection: true }),
};

const $GreatSpook = {
  enablegreatspook: new PropertyToggle('EnableGreatSpook', false, {}),
  greatSpookPrimalCd: new PropertyInteger('GreatSpookPrimalCd', 75, { desc: 'cd between spawns, in seconds\ncheck at hub -> tyashoi alchemist', shouldShow: p => addDependency(p.enablegreatspook) }),

  greatSpookPrimalTimer: new PropertyToggle('GreatSpookPrimalTimer', true, { desc: 'timer until primal fear can spawn', shouldShow: p => addDependency(p.enablegreatspook), isNewSection: true }),
  moveGreatSpookPrimalTimer: new PropertyAction('MoveGreatSpookPrimalTimer', null, { shouldShow: p => addDependency(p.greatSpookPrimalTimer) }),
  greatSpookPrimalTimerHideReady: new PropertyToggle('GreatSpookPrimalTimerHideReady', false, { desc: 'when cd is ready hide timer rather than show "READY"', shouldShow: p => addDependency(p.greatSpookPrimalTimer) }),

  greatSpookPrimalAlert: new PropertyToggle('GreatSpookPrimalAlert', true, { desc: 'show alert when primal is ready', shouldShow: p => addDependency(p.enablegreatspook) }),
  greatSpookPrimalAlertTime: new PropertyInteger('GreatSpookPrimalAlertTime', 2000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.greatSpookPrimalAlert) }),
  greatSpookPrimalAlertSound: new PropertyToggle('GreatSpookPrimalAlertSound', true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.greatSpookPrimalAlert) }),
};

const $FishingTils = {
  enablefishingtils: new PropertyToggle('EnableFishingTils', true, {}),

  fishingTilsHotspotWaypoint: new PropertyToggle('FishingTilsHotspotWaypoint', false, { shouldShow: p => addDependency(p.enablefishingtils), isNewSection: true }),
  fishingTilsHotspotWaypointColor: new PropertyColor('FishingTilsHotspotWaypointColor', 0xFA771EFF, { shouldShow: p => addDependency(p.fishingTilsHotspotWaypoint) }),
  fishingTilsHotspotWaypointDisableRange: new PropertyInteger('FishingTilsHotspotWaypointDisableRange', 10, { desc: 'disable when this many blocks (not including height) from hotspot', min: 0, shouldShow: p => addDependency(p.fishingTilsHotspotWaypoint) }),
  fishingTilsHotspotWaypointArrow: new PropertyToggle('FishingTilsHotspotWaypointArrow', true, { shouldShow: p => addDependency(p.fishingTilsHotspotWaypoint) }),

  fishingTilsUpdateSBAList: new PropertyToggle('FishingTilsUpdateSBAList', true, { desc: 'update the sba sea creature list\nrequires game restart to fully disable (why though)', shouldShow: p => addDependency(p.enablefishingtils), isNewSection: true }),
};

const $Necromancy = {
  enablenecromancy: new PropertyToggle('EnableNecromancy', false, {}),

  necromancyTrackSouls: new PropertyToggle('NecromancyTrackSouls', true, { desc: 'track info about souls that get dropped', shouldShow: p => addDependency(p.enablenecromancy), isNewSection: true }),
  necromancySoulWhitelist: new PropertyText('NecromancySoulWhitelist', '', { desc: 'comma separated names, will search inclusively, case sensitive', shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancySoulBlacklist: new PropertyText('NecromancySoulBlacklist', '', { desc: 'comma separated names, will search inclusively, case sensitive', shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancyAlwaysTrackBoss: new PropertyToggle('NecromancyAlwaysTrackBoss', true, { desc: 'always track powerful (dark) souls, regardless of white/blacklist', shouldShow: p => addDependency(p.necromancyTrackSouls) }),

  necromancySoulEsp: new PropertyToggle('NecromancySoulEsp', false, { desc: 'esp on soul rendering', shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancyShowMobName: new PropertyToggle('NecromancyShowMobName', true, { desc: 'render name of mob above soul', shouldShow: p => addDependency(p.necromancyTrackSouls) }),

  necromancyBoxSoul: new PropertyToggle('NecromancyBoxSoul', true, { shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancySoulColorNew: new PropertyColor('NecromancySoulColorNew', 0x00FFFFA0, { desc: 'color of newly dropped soul', shouldShow: p => addDependency(p.necromancyBoxSoul) }),
  necromancySoulColorOld: new PropertyColor('NecromancySoulColorOld', 0xFF0000FF, { desc: 'color of soul about to despawn', shouldShow: p => addDependency(p.necromancyBoxSoul) }),
};

const $Dojo = {
  enabledojo: new PropertyToggle('EnableDojo', false, {}),

  dojoMastery: new PropertyToggle('DojoMaster', true, { shouldShow: p => addDependency(p.enabledojo), isNewSection: true }),
  dojoMasteryPointToLowest: new PropertyToggle('DojoMasteryPointToLowest', true, { shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryPointToLowestColor: new PropertyColor('DojoMasteryPointToLowestColor', 0x55FF55FF, { shouldShow: p => addDependency(p.dojoMasteryPointToLowest) }),
  dojoMasteryShowLowestTime: new PropertyToggle('DojoMasteryShowLowestTime', true, { desc: 'render lowest time below crosshair', shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryPointToNext: new PropertyToggle('DojoMasteryPointToNext', true, { shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryPointToNextColor: new PropertyColor('DojoMasteryPointToNextColor', 0x5555FFFF, { shouldShow: p => addDependency(p.dojoMasteryPointToNext) }),
  dojoMasteryPointToNextTimer: new PropertyToggle('DojoMasteryPointToNextTimer', true, { desc: 'show timer for the next block', shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryHideTitles: new PropertyToggle('DojoMasteryHideTitles', true, { shouldShow: p => addDependency(p.dojoMastery) }),
};

const $EntityReducer = {
  enableentityreducer: new PropertyToggle('EnableEntityReducer', false, { desc: 'reduce strain from excess entity spam\n"hiding" the entity prevents them from rendering, but you can still interact with them\n"removing" the entity completely deletes them\nremoving is better for performance but to get them back you must reload them from the server' }),

  entityReducerHub: new PropertyToggle('ReduceHubEntities', true, { isNewSection: true }),
  entityReducerHubMap: new PropertyOption('ReduceHubMap', 'Remove', { desc: 'map of skyblock @ hub', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubCityProject: new PropertyOption('ReduceHubCityProject', 'Remove', { options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubTopAuctions: new PropertyOption('ReduceHubTopAuctions', 'Remove', { desc: 'top listings on AH, under auction house (only the cases not the items)', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubHex: new PropertyOption('ReduceHubHex', 'Remove', { desc: 'physical hex pedestal', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubDHub: new PropertyOption('ReduceHubCatacombs', 'Remove', { desc: 'the catacombs entrance near crypts', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubJax: new PropertyOption('ReduceHubJax', 'Remove', { desc: 'random bows, arrows ,swords, etc near jax/rosetta', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubKatHouse: new PropertyOption('ReduceHubKatHouse', 'Remove', { desc: 'pet care area on 2nd floor of kat house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubVincent: new PropertyOption('ReduceHubVincent', 'Remove', { desc: 'paintings in vincent house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubTaylor: new PropertyOption('ReduceHubTaylor', 'Remove', { desc: 'armor in basement of taylor house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubCarpenter: new PropertyOption('ReduceHubCarpenter', 'Remove', { desc: 'carpentry objects', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubMarco: new PropertyOption('ReduceHubMarco', 'Remove', { desc: 'paintings in marco house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubRabbit: new PropertyOption('ReduceHubRabbitFamily', 'Remove', { desc: 'rabbit house residents', options: ['Normal', 'Hide', 'Remove'] }),

  entityReducerDHub: new PropertyToggle('ReduceDungeonHubEntities', true, { isNewSection: true }),
  entityReducerDHubRace: new PropertyOption('ReduceDHubRaceLeaderboard', 'Remove', { desc: 'leaderboard for races', options: ['Normal', 'Hide', 'Remove'] }),

  entityReducerMines: new PropertyToggle('ReduceDwarvenMinesEntities', true, { isNewSection: true }),
  entityReducerMinesFossil: new PropertyOption('ReduceDwarvenFossilCenter', 'Remove', { desc: 'fossil research center in tunnels', options: ['Normal', 'Hide', 'Remove'] }),
};

const $Testing = {
  enableboxallentities: new PropertyToggle('EnableBoxAllEntities', false, { desc: 'mostly for debugging' }),
  boxAllEntitiesInvis: new PropertyToggle('BoxAllEntitiesInvisible', false, { desc: 'box invisible entities', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesColor: new PropertyColor('BoxAllEntitiesColor', 0xFF0000FF, { shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesEsp: new PropertyToggle('BoxAllEntitiesEsp', true, { shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesName: new PropertyToggle('BoxAllEntitiesName', false, { desc: 'show nametag', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesClassName: new PropertyToggle('BoxAllEntitiesClassName', false, { desc: 'show class name', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesWhitelist: new PropertyText('BoxAllEntitiesWhitelist', '', { desc: 'comma separated class names', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesBlacklist: new PropertyText('BoxAllEntitiesBlacklist', '', { desc: 'comma separated class names', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesEntityId: new PropertyToggle('BoxAllEntitiesEntityId', false, { desc: 'show entity id', shouldShow: p => addDependency(p.enableboxallentities) }),

  enablelogdamage: new PropertyToggle('EnableLogDamage', false, { desc: 'log damage numbers in chat', isNewSection: true }),
  logDamageRange: new PropertyNumber('LogDamageRange', 5, { desc: 'ignore damage numbers outside this range\nin blocks', min: 0, shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageThreshold: new PropertyInteger('LogDamageThreshold', 0, { desc: 'only log damage when above this amount\n0 to disable', min: 0, shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageNormal: new PropertyToggle('LogDamageNormal', true, { desc: 'non crit', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageCrit: new PropertyToggle('LogDamageCrit', true, { desc: 'crit', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageWither: new PropertyToggle('LogDamageWither', true, { desc: 'withering effect', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageVenomous: new PropertyToggle('LogDamageVenomous', true, { desc: 'venomous/toxic poison', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageSuffocation: new PropertyToggle('LogDamageSuffocation', true, { desc: 'suffocation/drowning', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageFire: new PropertyToggle('LogDamageFire', true, { desc: 'fire/fa/flame', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageLightning: new PropertyToggle('LogDamageLightning', true, { desc: 'thunderlord/thunderbolt', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamagePet: new PropertyToggle('LogDamagePet', true, { desc: 'pet e.g. snowman', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageOverload: new PropertyToggle('LogDamageOverload', true, { desc: 'overload', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageExtremeFocus: new PropertyToggle('LogDamageExtremeFocus', true, { desc: 'extreme focus (endstone sword)', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageOctodexterity: new PropertyToggle('LogDamageOctodexterity', true, { desc: 'octodexterity (tara full set)', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageWitherSkull: new PropertyToggle('LogDamageWitherSkull', true, { desc: 'withermancer/withers', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageLove: new PropertyToggle('LogDamageLove', true, { desc: 'ring of love etc. proc', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageCurse: new PropertyToggle('LogDamageCurse', true, { desc: 'gaia construct lightning', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageCombo: new PropertyToggle('LogDamageCombo', true, { desc: 'blaze dagger repeat', shouldShow: p => addDependency(p.enablelogdamage) }),
};

const $Misc = {
  enableexcavatorsolver: new PropertyToggle('EnableExcavatorSolver', false, { desc: 'find fossils' }),
  excavatorSolverOnlyShowBest: new PropertyToggle('ExcavatorSolverOnlyHighlightBest', true, { desc: 'only highlight the best move', shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverShowRoute: new PropertyToggle('ExcavatorSolverHighlightStartPath', false, { desc: 'highlight best starting path (turn off if citrine gemstones)', shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverDirtTooltip: new PropertyOption('ExcavatorSolverDirtTooltip', 'Custom', { options: ['Default', 'Hide', 'Custom'], shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverDustTooltip: new PropertyOption('ExcavatorSolverDustTooltip', 'Custom', { options: ['Default', 'Hide', 'Custom'], shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverAutoClose: new PropertyToggle('ExcavatorSolverAutoClose', false, { desc: 'automatically close excavator when all clicks used', shouldShow: p => addDependency(p.enableexcavatorsolver) }),

  enablebettergfs: new PropertyToggle('EnableBetterGFS', false, { desc: 'autocomplete for gfs, and shorthand\ne.g. /gfs w c 1 -> /gfs WITHER_CATALYST 1', isNewSection: true }),
  betterGFSIDPref: new PropertyOption('BetterGFSIdPreference', 'ID', { desc: 'which format to prefer (name vs id)\nName: replace with qualified name, ID: coerce to ID\nDynamic: use whatever format was given (in theory) it is broken af so it is disabled :)', options: ['ID', 'Name'], shouldShow: p => addDependency(p.enablebettergfs) }),
  betterGFSBlankAmount: new PropertyInteger('BetterGFSUnspecifiedAmount', 1, { desc: 'amount to default to when not provided\ne.g. /gfs w c -> /gfs WITHER_CATALYST <insert amount>', min: 1, max: 2240, shouldShow: p => addDependency(p.enablebettergfs) }),

  enablecpv: new PropertyToggle('EnableChickTilsPV', true, { desc: '/cpv, neu /pv wrapper but with different api\n(almost 100% success rate!)', isNewSection: true }),
  cpvReplaceNeu: new PropertyToggle('ChickTilsPVReplaceNEU', false, { desc: 'replace /pv command (may require restart when disabling)', shouldShow: p => addDependency(p.enablecpv) }),
  cpvAutoCompleteTabList: new PropertyToggle('ChickTilsPVAutoCompleteTabList', true, { desc: 'autocomplete /pv with names from tab list', shouldShow: p => addDependency(p.enablecpv) }),
  cpvAutoCompleteParty: new PropertyToggle('ChickTilsPVAutoCompleteParty', true, { desc: 'autcomplete /pv with party members', shouldShow: p => addDependency(p.enablecpv) }),

  enableclipboard: new PropertyToggle('EnableClipboardThing', true, { desc: '/clipboard\nset, get, list, and remove\n/cbs and /cbg and /cbl and /cbr\n/clipboard set <name> | /cbg <name> | /clipboard list | /cbr <name>', isNewSection: true }),

  enablevision: new PropertyToggle('DisableBlindness', true, { desc: 'disable blindness', isNewSection: true }),

  enablecake: new PropertyToggle('EnableCakeHelper', true, { desc: 'i like eat cake.', isNewSection: true }),

  enableunfocus: new PropertyToggle('PreventRenderingWhenUnfocused', false, { desc: 'similar to patcher\'s unfocused fps\nbut instead of capping fps, it completely stops rendering', isNewSection: true }),

  enableassfangcheese: new PropertyToggle('EnableAssfangCheeseHealth', false, { desc: 'show real assfang health\nobsolete', isNewSection: true }),
  moveAssfangCheese: new PropertyAction('MoveAssfangCheeseHealth', null, { shouldShow: p => addDependency(p.enableassfangcheese) }),

  enableblockhighlight: new PropertyToggle('EnableBlockHighlight', false, { isNewSection: true }),
  blockHighlightBoxEntity: new PropertyToggle('BlockHighlightBoxEntity', false, { desc: 'box the entity you are looking at', shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightWireColor: new PropertyColor('BlockHighlightWireColor', 0x00000066, { shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightFillColor: new PropertyColor('BlockHighlightFillColor', 0x00000000, { shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightWireWidth: new PropertyNumber('BlockHighlightWireWidth', 2, { min: 0, shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightCheckEther: new PropertyToggle('BlockHighlightCheckEther', true, { shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightEtherWireColor: new PropertyColor('BlockHighlightEtherWireColor', 0x2EDD17A0, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightEtherFillColor: new PropertyColor('BlockHighlightEtherFillColor', 0x60DE5560, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightEtherWireWidth: new PropertyNumber('BlockHighlightEtherWireWidth', 3, { min: 0, shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherWireColor: new PropertyColor('BlockHighlightCantEtherWireColor', 0xCA2207A0, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherFillColor: new PropertyColor('BlockHighlightCantEtherFillColor', 0xBA2B1E60, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherWireWidth: new PropertyNumber('BlockHighlightCantEtherWireWidth', 3, { min: 0, shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherShowReason: new PropertyToggle('BlockHighlightCantEtherShowReason', true, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),

  enablehidedivanparticles: new PropertyToggle('HideDivanCoatingParticles', true, { desc: 'only hides your own', isNewSection: true }),

  enablesbaenchant: new PropertyToggle('UpdateSBAEnchantList', true, { desc: 'need to rs game to unload properly (why would you?)', isNewSection: true }),

  enablepearlpath: new PropertyToggle('EnablePearlPath', false, { isNewSection: true }),
  pearlPathEsp: new PropertyToggle('PearlPathEsp', false, { shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathPathColor: new PropertyColor('PearlPathColor', 0xFF0000FF, { desc: 'color of path of pearl', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathDestColorOutline: new PropertyColor('PearlPathDestinationColorOutline', 0x0000FFFF, { desc: 'outline color of player hitbox on teleport', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathDestColorFill: new PropertyColor('PearlPathDestinationColorFill', 0x00000000, { desc: 'fill color of player hitbox on teleport', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathCollideEntity: new PropertyToggle('PearlPathCollideWithEntities', false, { desc: 'whether to check for collisions with entities', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathCollidedEntityColor: new PropertyColor('PearlPathCollidedEntityColor', 0x00FF00FF, { desc: 'color to box entity that was collided with', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathCheeto: new PropertyToggle('PearlPathCheeto', false, { desc: 'shame shame shame\ndoesn\'t disable when looking at a block', shouldShow: p => addDependency(p.enablepearlpath) }),

  enablelookat: new PropertyToggle('EnableLookAt', true, { desc: '/lookat <pitch> <yaw>\ndisplays a thing to help aim', isNewSection: true }),
  lookAtColor: new PropertyColor('LookAtColor', 0x00FFFFFF, { shouldShow: p => addDependency(p.enablelookat) }),
  lookAtSize: new PropertyNumber('LookAtSize', 0.01, { min: 0, shouldShow: p => addDependency(p.enablelookat) }),
  lookAtPointTo: new PropertyToggle('LookAtPointToLocation', false, { shouldShow: p => addDependency(p.enablelookat) }),
  lookAtThreshold: new PropertyNumber('LookAtTreshold', 0.1, { min: 0, desc: 'threshold (in degrees) until it is "good enough"', shouldShow: p => addDependency(p.enablelookat) }),
  lookAtTimeout: new PropertyInteger('LookAtTimeout', 600, { min: 1, desc: 'time (in ticks) until it gives up', shouldShow: p => addDependency(p.enablelookat) }),

  enabledarkmonolith: new PropertyToggle('EnableDarkMonolith', false, { isNewSection: true }),
  darkMonolithScanDelay: new PropertyInteger('DarkMonolithScanDelay', 5, { desc: 'time in ticks taken to scan all possible positions, lower = laggier', min: 1, shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithEsp: new PropertyToggle('DarkMonolithEsp', true, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithColor: new PropertyColor('DarkMonolithColor', 0x000000FF, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithPossibleColor: new PropertyColor('DarkMonolithPossibleColor', 0x55FF55FF, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithScannedColor: new PropertyColor('DarkMonolithScannedColor', 0xFF5555FF, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithPointTo: new PropertyToggle('DarkMonolithPointTo', true, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithTrackDrops: new PropertyToggle('DarkMonolithTrackDrops', true, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  moveDarkMonolithDropsTracker: new PropertyAction('MoveDarkMonolithDropsTracker', null, { shouldShow: p => addDependency(p.darkMonolithTrackDrops) }),
  resetDarkMonolithDropsTracker: new PropertyAction('ResetDarkMonolithDropsTracker', null, { shouldShow: p => addDependency(p.darkMonolithTrackDrops) }),
};

const builder = new Builder('ChickTils', 'settings.json')
  .addPage('General')
  .addBulk($General)
  .addPage('Kuudra')
  .addBulk($Kuudra)
  .addPage('Dungeon')
  .addBulk($Dungeon)
  .addPage('Stat Gui')
  .addBulk($StatGui)
  .addPage('Server Tracker')
  .addBulk($ServerTracker)
  .addPage('RatTils')
  .addBulk($RatTils)
  .addPage('Powder Chest')
  .addBulk($PowderChest)
  .addPage('Crystal Alert')
  .addBulk($CrystalAlert)
  .addPage('Command Aliases')
  .addBulk($CommandAliases)
  .addPage('Quiver Display')
  .addBulk($QuiverDisplay)
  .addPage('Rabbit')
  .addBulk($Rabbit)
  .addPage('ChatTils')
  .addBulk($ChatTils)
  .addPage('Diana')
  .addBulk($Diana)
  .addPage('HUD')
  .addBulk($HUD)
  .addPage('Avarice Addons')
  .addBulk($AvariceAddons)
  .addPage('Great Spook')
  .addBulk($GreatSpook)
  .addPage('FishingTils')
  .addBulk($FishingTils)
  .addPage('Necromancy')
  .addBulk($Necromancy)
  .addPage('Dojo')
  .addBulk($Dojo)
  .addPage('Entity Reducer')
  .addBulk($EntityReducer)
  .addPage('Testing')
  .addBulk($Testing)
  .addPage('Misc.')
  .addBulk($Misc);

const settings = builder.build();
export default settings;
export const props = builder.props;