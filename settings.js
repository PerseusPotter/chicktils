import { Builder, Property } from './settingsLib';
import { StateProp } from './util/state';

export const $FONTS = new Map(java.awt.GraphicsEnvironment.getLocalGraphicsEnvironment().getAvailableFontFamilyNames().map(v => [v.replace(/\s/g, ''), v]));
$FONTS.set('Mojangles', 'Mojangles');
/** @param {import('./settingsLib').Property<0, boolean>} */
const addDependency = prop => new StateProp(prop).and(prop.shouldShow);

const $General = {
  enableGlobal: new Property('Enable', 0, 0, Property.Type.Toggle, true, { desc: 'toggles mod globally (scuffed, it doesnt really work)' }),
  autoUpdate: new Property('CheckForUpdates', 0, 0, Property.Type.Toggle, true, { desc: 'check for updates when loaded' }),
  isDev: new Property('IsDev', 0, 0, Property.Type.Toggle, false, { desc: 'negatively impacts loading performance and may spam your chat' }),
  pingRefreshDelay: new Property('PingRefreshDelay', 0, 0, Property.Type.Number, 10, { desc: 'how often (in seconds) to refresh ping. set to 0 to disable ping. requires skytils' }),
  preferUseTracer: new Property('PreferUseTracer', 0, 0, Property.Type.Toggle, true, { desc: 'when available, prefer to use a tracer rather than an arrow' }),
  textGuiFont: new Property('TextGuiFont', 0, 0, Property.Type.Option, 'Mojangles', { desc: 'font used for text guis', options: Array.from($FONTS.keys()) }),
};

const $Kuudra = {
  enablekuudra: new Property('EnableKuudra', 0, 0, Property.Type.Toggle, true, {}),

  kuudraRenderPearlTarget: new Property('KuudraRenderPearlTarget', 0, 0, Property.Type.Toggle, true, { desc: 'render location to aim at for sky pearls\n(but not hardcoded + actually accurate + with timer)', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraPearlTargetColor: new Property('KuudraPearlTargetColor', 0, 0, Property.Type.Color, 0xFFFF00FF, { shouldShow: p => addDependency(p.kuudraRenderPearlTarget), shouldShow: p => addDependency(p.kuudraRenderPearlTarget) }),

  kuudraRenderEmptySupplySpot: new Property('KuudraRenderEmptySupplySpot', 0, 0, Property.Type.Toggle, true, { desc: 'render available supply dropoff location', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraEmptySupplySpotColor: new Property('KuudraEmptySupplySpotColor', 0, 0, Property.Type.Color, 0xFF0000FF, { shouldShow: p => addDependency(p.kuudraRenderEmptySupplySpot) }),

  kuudraBoxSupplies: new Property('KuudraBoxSupplies', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraBoxSuppliesColor: new Property('KuudraBoxSuppliesColor', 0, 0, Property.Type.Color, 0x00FF00FF, { shouldShow: p => addDependency(p.kuudraBoxSupplies) }),
  kuudraBoxSuppliesGiantColor: new Property('KuudraBoxSuppliesGiantColor', 0, 0, Property.Type.Color, 0, { shouldShow: p => addDependency(p.kuudraBoxSupplies) }),
  kuudraBoxSuppliesEsp: new Property('KuudraBoxSuppliesEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.kuudraBoxSupplies) }),

  kuudraBoxChunks: new Property('KuudraBoxChunks', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraBoxChunksColor: new Property('KuudraBoxChunksColor', 0, 0, Property.Type.Color, 0xFF00FFFF, { shouldShow: p => addDependency(p.kuudraBoxChunks) }),
  kuudraBoxChunksEsp: new Property('KuudraBoxChunksEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.kuudraBoxChunks) }),

  kuudraShowCannonAim: new Property('KuudraShowCannonAim', 0, 0, Property.Type.Toggle, true, { desc: 'render location to aim at for cannon, (useful for when client desyncs)', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraCannonAimColor: new Property('KuudraCannonAimColor', 0, 0, Property.Type.Color, 0xFFFF00FF, { shouldShow: p => addDependency(p.kuudraShowCannonAim) }),

  kuudraCustomBossBar: new Property('KuudraCustomBossBar', 0, 0, Property.Type.Toggle, true, { desc: 'rescale kuudra health bar in t5 to go 100% -> 0% twice', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),

  kuudraBoxKuudra: new Property('KuudraBoxKuudra', 0, 0, Property.Type.Toggle, true, { desc: 'draws box around kuudra', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraBoxKuudraColor: new Property('KuudraBoxKuudraColor', 0, 0, Property.Type.Color, 0xFF0000FF, { shouldShow: p => addDependency(p.kuudraBoxKuudra) }),
  kuudraBoxKuudraEsp: new Property('KuudraBoxKuudraEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.kuudraBoxKuudra) }),

  kuudraDrawArrowToKuudra: new Property('KuudraDrawArrowToKuudra', 0, 0, Property.Type.Toggle, true, { desc: 'draw arrow pointing to kuudra in p5', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraArrowToKuudraColor: new Property('KuudraArrowToKuudraColor', 0, 0, Property.Type.Color, 0x00FFFFFF, { shouldShow: p => addDependency(p.kuudraDrawArrowToKuudra) }),

  kuudraDrawHpGui: new Property('KuudraDrawHpOnScreen', 0, 0, Property.Type.Toggle, true, { desc: 'draw hp of kuudra onto hud', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  moveKuudraHp: new Property('MoveKuudraHp', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.kuudraDrawHpGui) }),
  kuudraDrawHpDec: new Property('KuudraDrawHpDecimals', 0, 0, Property.Type.Integer, 3, { desc: 'number of decimals/sigfigs in the hp', min: 0, max: 3, shouldShow: p => addDependency(p.kuudraDrawHpGui) }),

  kuudraAutoRefillPearls: new Property('KuudraAutoRefillPearls', 0, 0, Property.Type.Toggle, true, { desc: 'automatically run /gfs at start of each run to replenish used pearls', shouldShow: p => addDependency(p.enablekuudra), isNewSection: true }),
  kuudraAutoRefillPearlsAmount: new Property('KuudraAutoRefillPearlsAmount', 0, 0, Property.Type.Integer, 16, { desc: 'amount of pearls you want to start run with', min: 0, max: 560, shouldShow: p => addDependency(p.kuudraAutoRefillPearls) }),
};

const $Dungeon = {
  enabledungeon: new Property('EnableDungeon', 0, 0, Property.Type.Toggle, true, {}),

  dungeonBoxMobs: new Property('DungeonBoxMobs', 0, 0, Property.Type.Toggle, true, { desc: 'draws boxes around starred mobs\nonly mobs with both nametag and corresponding entity (no ghost nametags!)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxMobEsp: new Property('DungeonBoxMobEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxMobColor: new Property('DungeonBoxMobColor', 0, 0, Property.Type.Color, 0x00FFFFFF, { desc: 'color for basic mobs', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxKeyColor: new Property('DungeonBoxKeyColor', 0, 0, Property.Type.Color, 0x00FF00FF, { desc: 'color for wither/blood keys', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxSAColor: new Property('DungeonBoxSAColor', 0, 0, Property.Type.Color, 0xFF0000FF, { desc: 'color for SAs', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxSMColor: new Property('DungeonBoxSkeleMasterColor', 0, 0, Property.Type.Color, 0xFF8000FF, { desc: 'color for skele masters', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxFelColor: new Property('DungeonBoxFelColor', 0, 0, Property.Type.Color, 0x00FF80FF, { desc: 'color for fels', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxChonkColor: new Property('DungeonBoxChonkersColor', 0, 0, Property.Type.Color, 0xFF0080FF, { desc: 'color for withermancers, commanders, lords, and super archers', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxMiniColor: new Property('DungeonBoxMiniColor', 0, 0, Property.Type.Color, 0xB400B4FF, { desc: 'color for LAs,  FAs, and AAs', shouldShow: p => addDependency(p.dungeonBoxMobs) }),
  dungeonBoxMobDisableInBoss: new Property('DungeonBoxMobDisableInBoss', 0, 0, Property.Type.Toggle, false, { desc: 'pretty much only relevant for SAs in p2', shouldShow: p => addDependency(p.dungeonBoxMobs) }),

  dungeonBoxWither: new Property('DungeonBoxWither', 0, 0, Property.Type.Toggle, false, { desc: 'boxes wither lords\nindependent from box mobs', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxWitherEsp: new Property('DungeonBoxWitherEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dungeonBoxWither) }),
  dungeonBoxWitherColor: new Property('DungeonBoxWitherColor', 0, 0, Property.Type.Color, 0x515A0BFF, { shouldShow: p => addDependency(p.dungeonBoxWither) }),

  dungeonBoxLivid: new Property('DungeonBoxLivid', 0, 0, Property.Type.Toggle, false, { desc: 'independent from box mobs', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxLividEsp: new Property('DungeonBoxLividEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dungeonBoxLivid) }),
  dungeonBoxLividColor: new Property('DungeonBoxLividColor', 0, 0, Property.Type.Color, 0xFF0000FF, { shouldShow: p => addDependency(p.dungeonBoxLivid) }),
  dungeonBoxLividDrawArrow: new Property('DungeonBoxLividDrawArrow', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dungeonBoxLivid) }),

  dungeonBoxIceSprayed: new Property('DungeonBoxIceSprayedMobs', 0, 0, Property.Type.Toggle, false, { desc: 'boxes frozen mobs\nindependent from box mobs', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxIceSprayedEsp: new Property('DungeonBoxIceSprayedEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dungeonBoxIceSprayed) }),
  dungeonBoxIceSprayedOutlineColor: new Property('DungeonBoxIceSprayedOutlineColor', 0, 0, Property.Type.Color, 0XADD8E6FF, { shouldShow: p => addDependency(p.dungeonBoxIceSprayed) }),
  dungeonBoxIceSprayedFillColor: new Property('DungeonBoxIceSprayedFillColor', 0, 0, Property.Type.Color, 0XADBCE650, { shouldShow: p => addDependency(p.dungeonBoxIceSprayed) }),

  dungeonBoxTeammates: new Property('DungeonBoxTeammates', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonBoxTeammatesEsp: new Property('DungeonBoxTeammatesEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesMageColor: new Property('DungeonBoxTeammatesMageColor', 0, 0, Property.Type.Color, 0x1793C4FF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesArchColor: new Property('DungeonBoxTeammatesArchColor', 0, 0, Property.Type.Color, 0xE80F0FFF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesBersColor: new Property('DungeonBoxTeammatesBersColor', 0, 0, Property.Type.Color, 0xF77C1BFF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesTankColor: new Property('DungeonBoxTeammatesTankColor', 0, 0, Property.Type.Color, 0x47D147FF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),
  dungeonBoxTeammatesHealColor: new Property('DungeonBoxTeammatesHealColor', 0, 0, Property.Type.Color, 0xFF00FFFF, { shouldShow: p => addDependency(p.dungeonBoxTeammates) }),

  dungeonCamp: new Property('DungeonEnableCamp', 0, 0, Property.Type.Toggle, true, { desc: 'blood camp helper', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonCampTimer: new Property('DungeonCampShowTimer', 0, 0, Property.Type.Toggle, false, { desc: 'render timer underneath boxes', shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampWireColor: new Property('DungeonCampWireColor', 0, 0, Property.Type.Color, 0x00FF00FF, { desc: 'color of wireframe', shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampBoxColor: new Property('DungeonCampBoxColor', 0, 0, Property.Type.Color, 0x00FFFFFF, { desc: 'color of shaded box', shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampBoxEsp: new Property('DungeonCampBoxEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampSmoothTime: new Property('DungeonCampSmoothTime', 0, 0, Property.Type.Integer, 500, { desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1, shouldShow: p => addDependency(p.dungeonCamp) }),
  dungeonCampSkipTimer: new Property('DungeonCampDialogueSkipTimer', 0, 0, Property.Type.Toggle, false, { desc: 'timer until when to kill first 4 blood mobs', shouldShow: p => addDependency(p.dungeonCamp) }),
  moveDungeonCampSkipTimer: new Property('MoveDungeonCampSkipTimer', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonCampSkipTimer) }),

  dungeonHecatombAlert: new Property('DungeonHecatombAlert', 0, 0, Property.Type.Toggle, false, { desc: 'alert before end of run to swap to hecatomb (does not work for f4/m4/m7)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonHecatombAlertTime: new Property('DungeonHecatombAlertTime', 0, 0, Property.Type.Integer, 5000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.dungeonHecatombAlert) }),
  dungeonHecatombAlertSound: new Property('DungeonHecatombAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dungeonHecatombAlert) }),

  dungeonMap: new Property('DungeonMap', 0, 0, Property.Type.Toggle, false, { desc: 'does not work yet', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveDungeonMap: new Property('MoveDungeonMap', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapHideBoss: new Property('DungeonMapHideInBoss', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapRenderHead: new Property('DungeonMapRenderPlayerHeads', 0, 0, Property.Type.Toggle, false, { desc: 'render heads instead of arrows on map', shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapRenderName: new Property('DungeonMapRenderPlayerNames', 0, 0, Property.Type.Option, 'Holding Leap', { desc: 'render names of players above their marker', options: ['Always', 'Never', 'Holding Leap'], shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapRenderClass: new Property('DungeonMapRenderPlayerClass', 0, 0, Property.Type.Option, 'Always', { desc: 'render class of players above their marker', options: ['Always', 'Never', 'Holding Leap'], shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxDoors: new Property('DungeonMapBoxDoors', 0, 0, Property.Type.Option, 'Blood Doors', { desc: 'boxes wither/blood doors', options: ['Always', 'Never', 'Blood Doors'], shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxDoorOutlineColor: new Property('DungeonMapBoxDoorOutlineColor', 0, 0, Property.Type.Color, 0x00FF00FF, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxDoorFillColor: new Property('DungeonMapBoxDoorFillColor', 0, 0, Property.Type.Color, 0x00FF0050, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxLockedDoorOutlineColor: new Property('DungeonMapBoxLockedDoorOutlineColor', 0, 0, Property.Type.Color, 0xFF0000FF, { shouldShow: p => addDependency(p.dungeonMap) }),
  dungeonMapBoxLockedDoorFillColor: new Property('DungeonMapBoxLockedDoorFillColor', 0, 0, Property.Type.Color, 0xFF000050, { shouldShow: p => addDependency(p.dungeonMap) }),

  dungeonShowSecrets: new Property('DungeonShowSecrets', 0, 0, Property.Type.Option, 'None', { desc: 'does not work yet, requires map to be on', options: ['None', 'Wire', 'Waypoint'], shouldShow: p => addDependency(p.dungeonMap) }),

  dungeonHideHealerPowerups: new Property('DungeonHideHealerPowerups', 0, 0, Property.Type.Toggle, true, { desc: 'hide healer power orbs (and particles!)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonAutoArchitect: new Property('DungeonAutoGFSArchitect', 0, 0, Property.Type.Toggle, false, { desc: 'auto gfs on puzzle fail, and a friendly reminder', shouldShow: p => addDependency(p.enabledungeon) }),

  dungeonNecronDragTimer: new Property('DungeonNecronDragTimer', 0, 0, Property.Type.Option, 'None', { desc: 'timer when necron does some dragging\n(timer will automatically pop up when instamidding!)', options: ['OnScreen', 'InstaMid', 'Both', 'None'], shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveNecronDragTimer: new Property('MoveNecronDragTimer', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonNecronDragTimer) }),
  dungeonNecronDragDuration: new Property('DungeonNecronDragDuration', 0, 0, Property.Type.Integer, 120, { desc: 'in ticks, 120 = move/leap, 163 = immunity', min: 0, shouldShow: p => addDependency(p.dungeonNecronDragTimer) }),

  dungeonDev4Helper: new Property('DungeonClearViewDev4', 0, 0, Property.Type.Option, 'Both', { desc: 'clearer vision while doing 4th dev', options: ['None', 'Titles', 'Particles', 'Both'], shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonDev4HighlightBlock: new Property('DungeonDev4HighlightBlock', 0, 0, Property.Type.Toggle, true, { desc: 'highlights emerald block green, bypasses chunk updates', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonDev4HighlightBlockColor: new Property('DungeonDev4HighlightBlockColor', 0, 0, Property.Type.Color, 0x50C878FF, { shouldShow: p => addDependency(p.dungeonDev4HighlightBlock) }),
  dungeonDev4HighlightBlockEsp: new Property('DungeonDev4HighlightBlockEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dungeonDev4HighlightBlock) }),

  dungeonStairStonkHelper: new Property('DungeonStairStonkHelper', 0, 0, Property.Type.Toggle, false, { desc: 'stair stonker stuff', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonStairStonkHelperColor: new Property('DungeonStairStonkHelperColor', 0, 0, Property.Type.Color, 0xFF0000FF, { desc: 'draw line to align yourself to dig down a stair\nsame as soopy but does not cut fps in half', shouldShow: p => addDependency(p.dungeonStairStonkHelper) }),
  dungeonStairStonkHelperHighlightColor: new Property('DungeonStairStonkHelperHighlightColor', 0, 0, Property.Type.Color, 0x7DF9FF80, { desc: 'highlight stairs this color if they need to be ghosted to stonk', shouldShow: p => addDependency(p.dungeonStairStonkHelper) }),

  dungeonAutoRefillPearls: new Property('DungeonAutoRefillPearls', 0, 0, Property.Type.Toggle, false, { desc: 'automatically run /gfs to replenish used pearls', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonAutoRefillPearlsAmount: new Property('DungeonAutoRefillPearlsAmount', 0, 0, Property.Type.Integer, 16, { desc: 'amount of pearls you want to have at a time', min: 0, max: 560, shouldShow: p => addDependency(p.dungeonAutoRefillPearls) }),
  dungeonAutoRefillPearlsThreshold: new Property('DungeonAutoRefillPearlsThreshold', 0, 0, Property.Type.Integer, 0, { desc: 'automatically replenish pearls mid run when below this amount\n0 to disable', min: 0, max: 560, shouldShow: p => addDependency(p.dungeonAutoRefillPearls) }),
  dungeonAutoRefillPearlsGhostPickFix: new Property('DungeonAutoRefillPearlsGhostPickFix', 0, 0, Property.Type.Toggle, false, { desc: 'dont replenish when ghost pick\n(turn on if you ghost using pearls)', shouldShow: p => new StateProp(p.dungeonAutoRefillPearlsThreshold).notequals(0).and(p.dungeonAutoRefillPearlsThreshold.shouldShow) }),

  dungeonM7LBWaypoints: new Property('DungeonDragonLBWaypoints', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonGoldorDpsStartAlert: new Property('DungeonGoldorDpsStartAlert', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonGoldorDpsStartAlertTime: new Property('DungeonGoldorDpsStartAlertTime', 0, 0, Property.Type.Integer, 500, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.dungeonGoldorDpsStartAlert) }),
  dungeonGoldorDpsStartAlertSound: new Property('DungeonGoldorDpsStartAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dungeonGoldorDpsStartAlert) }),

  dungeonTerminalBreakdown: new Property('DungeonTerminalBreakdown', 0, 0, Property.Type.Toggle, false, { desc: 'displays terminals done by each person', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonPlaySoundKey: new Property('DungeonPlaySoundOnKey', 0, 0, Property.Type.Toggle, false, { desc: 'play dulkir secret sound on pickup key', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonIceSprayAlert: new Property('DungeonRareMobDropAlert', 0, 0, Property.Type.Toggle, true, { desc: 'alert on ice spray/sm cp', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonIceSprayAlertTime: new Property('DungeonRareMobDropAlertTime', 0, 0, Property.Type.Integer, 2000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.dungeonIceSprayAlert) }),
  dungeonIceSprayAlertSound: new Property('DungeonRareMobDropAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dungeonIceSprayAlert) }),

  dungeonTerminalsHelper: new Property('DungeonTerminalsHelper', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonTerminalsGuiSize: new Property('DungeonTerminalsGuiSize', 0, 0, Property.Type.Option, 'Unchanged', { desc: 'change gui size while in terminals', options: ['Unchanged', 'Small', 'Normal', 'Large', '4x', '5x', 'Auto'], shouldShow: p => addDependency(p.dungeonTerminalsHelper) }),
  dungeonTerminalsHideInv: new Property('DungeonTerminalsHideInventory', 0, 0, Property.Type.Toggle, false, { desc: 'hide inventory in terminals\nplease do not use, it will 1) break all solvers, 2) look shit, 3) probably breaks other things like locking slots', shouldShow: p => addDependency(p.dungeonTerminalsHelper) }),
  dungeonTerminalsHideInvScuffed: new Property('DungeonTerminalsHideInventoryScuffed', 0, 0, Property.Type.Toggle, false, { desc: 'hide inventory in terminals, but scuffed (basically centers around the chest instead of hiding)', shouldShow: p => addDependency(p.dungeonTerminalsHelper) }),

  dungeonSpiritBearHelper: new Property('DungeonSpiritBearHelper', 0, 0, Property.Type.Toggle, false, { desc: 'predict spirit bear spawn location', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonSpiritBearTimer: new Property('DungeonSpiritBearShowTimer', 0, 0, Property.Type.Toggle, false, { desc: 'render timer above box', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearWireColor: new Property('DungeonSpiritBearWireColor', 0, 0, Property.Type.Color, 0x00FF00FF, { desc: 'color of wireframe', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearBoxColor: new Property('DungeonSpiritBearBoxColor', 0, 0, Property.Type.Color, 0x00FFFFFF, { desc: 'color of shaded box', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearBoxEsp: new Property('DungeonSpiritBearBoxEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearSmoothTime: new Property('DungeonSpiritBearSmoothTime', 0, 0, Property.Type.Integer, 500, { desc: 'amount of time in ms spent lerping between different guesses\n(and how often to make guesses)', min: 1, shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  dungeonSpiritBearTimerHud: new Property('DungeonSpiritBearTimerHud', 0, 0, Property.Type.Toggle, true, { desc: 'show spirit bear timer on hud', shouldShow: p => addDependency(p.dungeonSpiritBearHelper) }),
  moveSpiritBearTimerHud: new Property('MoveSpiritBearTimerHud', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonSpiritBearTimerHud) }),

  dungeonSilverfishHasteTimer: new Property('DungeonSilverfishHasteTimer', 0, 0, Property.Type.Toggle, false, { desc: 'render how much longer haste from silverfish will last\nobsolete after haste artifact', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveSilverfishHasteTimer: new Property('MoveSilverfishHasteTimer', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonSilverfishHasteTimer) }),

  dungeonHideFallingBlocks: new Property('DungeonHideFallingBlocks', 0, 0, Property.Type.Toggle, true, { desc: 'dont render falling blocks in boss', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonHideWitherKing: new Property('DungeonHideWitherKing', 0, 0, Property.Type.Toggle, true, { desc: 'dont render wither king tentacles', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonDragonHelper: new Property('DungeonDragonHelper', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonDragonHelperTimer2D: new Property('DungeonDragonHelperTimerHUD', 0, 0, Property.Type.Toggle, false, { desc: 'render timer until dragon spawn on hud', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  moveDragonHelperTimer: new Property('MoveDragonHelperTimer', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonDragonHelperTimer2D) }),
  dungeonDragonHelperTimer3D: new Property('DungeonDragonHelperTimerWorld', 0, 0, Property.Type.Toggle, false, { desc: 'render timer until dragon spawn under its chin', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperAlert: new Property('DungeonDragonHelperAlert', 0, 0, Property.Type.Option, 'None', { desc: 'show alert when dragon is spawning', options: ['None', 'All', 'Split'], shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperAlertTime: new Property('DungeonDragonHelperAlertTime', 0, 0, Property.Type.Integer, 1000, { desc: 'in ms', min: 0, shouldShow: p => new StateProp(p.dungeonDragonHelperAlert).notequals('None').and(p.dungeonDragonHelperAlert.shouldShow) }),
  dungeonDragonHelperAlertSound: new Property('DungeonDragonHelperAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => new StateProp(p.dungeonDragonHelperAlert).notequals('None').and(p.dungeonDragonHelperAlert.shouldShow) }),
  dungeonDragonHelperSplit: new Property('DungeonDragonHelperSplit', 0, 0, Property.Type.Toggle, true, { desc: 'do you split', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperPrioS: new Property('DungeonDragonHelperPrioSplit', 0, 0, Property.Type.Text, 'ogrbp', { desc: 'priority to use when splitting\nbers team -> ogrbp <- arch team', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperPrioNS: new Property('DungeonDragonHelperPrioNoSplit', 0, 0, Property.Type.Text, 'robpg', { desc: 'priority to use when NOT splitting', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperBersTeam: new Property('DungeonDragonHelperBersTeam', 0, 0, Property.Type.Text, 'bmh', { desc: 'classes that go w/ bers team\nb m h | a t', shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperTrackHits: new Property('DungeonDragonHelperTrackHits', 0, 0, Property.Type.Option, 'Full', { desc: 'tracks number of arrow hits during drag dps\nnote: will count all arrow hits (will count any hits on husks)\nBurst: count initial "burst" of hits at start of spawn\n(i.e. first 1s if a/b, otherwise time until 5 lbs)\nFull: hits during entire duration dragon is alive\nBoth: full + burst stats', options: ['None', 'Burst', 'Full', 'Both'], shouldShow: p => addDependency(p.dungeonDragonHelper) }),
  dungeonDragonHelperTrackHitsTimeUnit: new Property('DungeonDragonHelperTrackHitsTimeUnit', 0, 0, Property.Type.Option, 'Both', { desc: 'note: seconds is still measured in ticks, not real time', options: ['Ticks', 'Seconds', 'Both'], shouldShow: p => new StateProp(p.dungeonDragonHelperTrackHits).notequals('None').and(p.dungeonDragonHelperTrackHits.shouldShow) }),

  dungeonLBPullProgress: new Property('DungeonLBPullProgress', 0, 0, Property.Type.Toggle, false, { desc: 'play sounds indicating bow pull progress (accounting for lag)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonLBPullProgressVolume: new Property('DungeonLBPullProgressVolume', 0, 0, Property.Type.Number, 1, { min: 0, max: 5, shouldShow: p => addDependency(p.dungeonLBPullProgress) }),
  dungeonLBPullProgressThreshold: new Property('DungeonLBPullProgressThreshold', 0, 0, Property.Type.Integer, 8, { desc: 'how many ticks to swap to different sound\n0: always, 21: never', min: 0, max: 21, shouldShow: p => addDependency(p.dungeonLBPullProgress) }),

  dungeonSimonSays: new Property('DungeonSimonSays', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonSimonSaysColor1: new Property('DungeonSimonSaysColor', 0, 0, Property.Type.Color, 0x00FF00A0, { desc: 'color of the button to press ', shouldShow: p => addDependency(p.dungeonSimonSays) }),
  dungeonSimonSaysColor2: new Property('DungeonSimonSaysColorNext', 0, 0, Property.Type.Color, 0xFFFF00A0, { desc: 'color of the next button to press', shouldShow: p => addDependency(p.dungeonSimonSays) }),
  dungeonSimonSaysColor3: new Property('DungeonSimonSaysColorOther', 0, 0, Property.Type.Color, 0xFF0000A0, { desc: 'color of the other buttons', shouldShow: p => addDependency(p.dungeonSimonSays) }),
  dungeonSimonSaysBlock: new Property('DungeonSimonSaysBlockClicks', 0, 0, Property.Type.Option, 'ExceptWhenCrouching', { desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'], shouldShow: p => addDependency(p.dungeonSimonSays) }),

  dungeonArrowAlign: new Property('DungeonArrowAlign', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonArrowAlignBlock: new Property('DungeonArrowAlignBlockClicks', 0, 0, Property.Type.Option, 'ExceptWhenCrouching', { desc: 'block incorrect clicks', options: ['Never', 'Always', 'WhenCrouching', 'ExceptWhenCrouching'], shouldShow: p => addDependency(p.dungeonArrowAlign) }),
  dungeonArrowAlignLeavePD: new Property('DungeonArrowAlignLeaveOnePD', 0, 0, Property.Type.Toggle, true, { desc: 'leave 1 frame at 1 click away during pd', shouldShow: p => addDependency(p.dungeonArrowAlign) }),

  dungeonGoldorFrenzyTimer: new Property('DungeonGoldorFrenzyTimer', 0, 0, Property.Type.Toggle, false, { desc: 'show timer until next goldor frenzy tick', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  moveGoldorFrenzyTimer: new Property('MoveGoldorFrenzyTimer', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonGoldorFrenzyTimer) }),

  dungeonBlockOverlaySize: new Property('DungeonBlockOverlaySize', 0, 0, Property.Type.Number, 1, { desc: 'size of overlay when inside an opaque block\nin range [0, 1], 0 = none, 1 = default', min: 0, max: 1, shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonHideHealerFairy: new Property('DungeonHideHealerFairy', 0, 0, Property.Type.Option, 'Own', { options: ['Never', 'Own', 'Always'], shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonDHubHighlightLow: new Property('DungeonDHubSelectorHighlight', 0, 0, Property.Type.Toggle, true, { desc: 'green for low players :)', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),

  dungeonTerracottaRespawn: new Property('DungeonTerracottaRespawnTimer', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
  dungeonTerracottaRespawnType: new Property('DungeonTerracottaRespawnTimerType', 0, 0, Property.Type.Option, 'Timer', { options: ['Timer', 'Box', 'Both'], shouldShow: p => addDependency(p.dungeonTerracottaRespawn) }),
  dungeonTerracottaRespawnOutlineColor: new Property('DungeonTerracottaRespawnOutlineColor', 0, 0, Property.Type.Color, 0x91553DFF, { shouldShow: p => new StateProp(p.dungeonTerracottaRespawnType).notequals('Timer').and(p.dungeonTerracottaRespawnType.shouldShow) }),
  dungeonTerracottaRespawnFillColor: new Property('DungeonTerracottaRespawnFillColor', 0, 0, Property.Type.Color, 0xA27157A0, { shouldShow: p => new StateProp(p.dungeonTerracottaRespawnType).notequals('Timer').and(p.dungeonTerracottaRespawnType.shouldShow) }),
  dungeonTerracottaRespawnGui: new Property('DungeonTerracottaRespawnGui', 0, 0, Property.Type.Toggle, false, { desc: 'render the timer for the first terracotta on hud', shouldShow: p => addDependency(p.dungeonTerracottaRespawn) }),
  moveDungeonTerracottaRespawnGui: new Property('MoveDungeonTerracottaRespawnGui', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.dungeonTerracottaRespawnGui) }),

  dungeonStormClearLaser: new Property('DungeonStormClearLaserChecker', 0, 0, Property.Type.Toggle, false, { desc: 'warn when someone is using laser in storm clear', shouldShow: p => addDependency(p.enabledungeon), isNewSection: true }),
};

const $ServerTracker = {
  enableservertracker: new Property('EnableServerTracker', 0, 0, Property.Type.Toggle, true, { desc: 'tracks servers you\'ve been to, also /warp tab complete' }),
  serverTrackerTransferCd: new Property('ServerTrackerTransferCd', 0, 0, Property.Type.Integer, 3000, { desc: 'delays warps by this long if spammed too quickly', min: 0, shouldShow: p => addDependency(p.enableservertracker) }),
  serverTrackerCdMessage: new Property('ServerTrackerCdMessage', 0, 0, Property.Type.Text, 'waiting for cd (u.U)｡｡｡ zzZ', { shouldShow: p => addDependency(p.enableservertracker) }),
};

const $StatGui = {
  enablestatgui: new Property('EnableStatGUI', 0, 0, Property.Type.Toggle, false, { desc: 'render stats from tab onto hud' }),
  loc0: new Property('EnablePrivateIslandGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc0: new Property('MovePrivateIslandGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc0) }),
  loc1: new Property('EnableHubGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc1: new Property('MoveHubGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc1) }),
  loc2: new Property('EnableDungeonHubGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc2: new Property('MoveDungeonHubGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc2) }),
  loc3: new Property('EnableTheFarmingIslandsGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc3: new Property('MoveTheFarmingIslandsGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc3) }),
  loc4: new Property('EnableGardenGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc4: new Property('MoveGardenGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc4) }),
  loc5: new Property('EnableTheParkGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc5: new Property('MoveTheParkGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc5) }),
  loc6: new Property('EnableGoldMineGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc6: new Property('MoveGoldMineGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc6) }),
  loc7: new Property('EnableDeepCavernsGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc7: new Property('MoveDeepCavernsGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc7) }),
  loc8: new Property('EnableDwarvenMinesGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc8: new Property('MoveDwarvenMinesGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc8) }),
  loc9: new Property('EnableCrystalHollowsGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc9: new Property('MoveCrystalHollowsGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc9) }),
  loc10: new Property('EnableSpidersDenGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc10: new Property('MoveSpidersDenGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc10) }),
  loc11: new Property('EnableTheEndGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc11: new Property('MoveTheEndGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc11) }),
  loc12: new Property('EnableCrimsonIsleGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc12: new Property('MoveCrimsonIsleGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc12) }),
  loc13: new Property('EnableKuudraGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc13: new Property('MoveKuudraGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc13) }),
  loc14: new Property('EnableTheRiftGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc14: new Property('MoveTheRiftGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc14) }),
  loc15: new Property('EnableJerrysWorkshopGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc15: new Property('MoveJerrysWorkshopGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc15) }),
  loc16: new Property('EnableCatacombsGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc16: new Property('MoveCatacombsGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc16) }),
  loc17: new Property('EnableBackwaterBayouGUI', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablestatgui) }),
  moveLoc17: new Property('MoveBackwaterBayouGUI', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.loc17) }),
};

const $RatTils = {
  enablerattils: new Property('EnableRatTils', 0, 0, Property.Type.Toggle, true, { desc: 'boxes cheese and other stuff' }),
  ratTilsBoxColor: new Property('RatTilsBoxColor', 0, 0, Property.Type.Color, 0x00FF80FF, { shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
  ratTilsBoxEsp: new Property('RatTilsBoxEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablerattils) }),
  ratTilsAlertTime: new Property('RatTilsAlertTime', 0, 0, Property.Type.Integer, 2000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
  ratTilsAlertSound: new Property('RatTilsAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.enablerattils) }),
  ratTilsMessage: new Property('RatTilsMessage', 0, 0, Property.Type.Text, 'i.imgur.com/8da4IiM.png', { desc: 'empty to disable', shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
  ratTilsChannel: new Property('RatTilsChannel', 0, 0, Property.Type.Text, 'pc', { shouldShow: p => new StateProp(p.ratTilsMessage).notequals('').and(p.ratTilsMessage.shouldShow) }),
  ratTilsMuteSound: new Property('RatTilsMuteSound', 0, 0, Property.Type.Toggle, true, { desc: 'mute rat squeaking sounds', shouldShow: p => addDependency(p.enablerattils), isNewSection: true }),
};

const $PowderChest = {
  enablepowderalert: new Property('EnablePowderAlert', 0, 0, Property.Type.Toggle, false, { desc: 'alerts when powder chest spawns' }),
  powderScanRange: new Property('PowderScanRange', 0, 0, Property.Type.Integer, 10, { min: 0, shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderBoxEsp: new Property('PowderBoxEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderBoxColor: new Property('PowderBoxColor', 0, 0, Property.Type.Color, 0x00FFFFA0, { shouldShow: p => addDependency(p.enablepowderalert) }),
  powderBoxColor2: new Property('PowderBoxColorDead', 0, 0, Property.Type.Color, 0xFF0000FF, { desc: '2nd color of gradient  between 1st and 2nd based on when chest will despawn', shouldShow: p => addDependency(p.enablepowderalert) }),
  powderAlertTime: new Property('PowderAlertTime', 0, 0, Property.Type.Integer, 1000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderAlertSound: new Property('PowderAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.enablepowderalert) }),
  powderBlockRewards: new Property('PowderHideMessage', 0, 0, Property.Type.Toggle, true, { desc: 'hides chest rewards message', shouldShow: p => addDependency(p.enablepowderalert), isNewSection: true }),
  powderShowPowder: new Property('PowderHideMessageShowPowder', 0, 0, Property.Type.Toggle, true, { desc: 'keep the powder gain message', shouldShow: p => addDependency(p.powderBlockRewards) }),
};

const $CrystalAlert = {
  enablecrystalalert: new Property('EnableCrystalAlert', 0, 0, Property.Type.Toggle, false, { desc: 'alerts when end crystals spawn' }),
  crystalBoxColor: new Property('CrystalBoxColor', 0, 0, Property.Type.Color, 0x00FF00FF, { shouldShow: p => addDependency(p.enablecrystalalert) }),
  crystalBoxEsp: new Property('CrystalBoxEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enablecrystalalert) }),
  crystalAlertTime: new Property('CrystalAlertTime', 0, 0, Property.Type.Integer, 1000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.enablecrystalalert) }),
  crystalAlertSound: new Property('CrystalAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.enablecrystalalert) }),
};

const $CommandAliases = {
  enablecmdalias: new Property('EnableCommandAliases', 0, 0, Property.Type.Toggle, true, {}),
  cmdAliasStorage: new Property('EnableStorageShortcut', 0, 0, Property.Type.Toggle, true, { desc: 'e.g. /b1, /e2, and /3 for /backpack 1, /enderchest 2, /backpack 3 respectively', shouldShow: p => addDependency(p.enablecmdalias) }),
  cmdAliasDungeon: new Property('EnableDungeonShortcut', 0, 0, Property.Type.Toggle, true, { desc: 'e.g. /f1, /m1, /fe', shouldShow: p => addDependency(p.enablecmdalias) }),
  cmdAliasKuudra: new Property('EnableKuudraShortcut', 0, 0, Property.Type.Toggle, true, { desc: 'e.g. /k1', shouldShow: p => addDependency(p.enablecmdalias) }),
};

const $QuiverDisplay = {
  enablequiver: new Property('EnableQuiverDisplay', 0, 0, Property.Type.Toggle, false, { desc: 'arrow display on hud, only works when holding bow' }),
  moveQuiver: new Property('MoveQuiverDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.enablequiver) }),
  quiverSize: new Property('QuiverMaxSize', 0, 0, Property.Type.Option, 'Giant', { desc: 'size of quiver (based on feather collection)', options: ['Medium', 'Large', 'Giant'], shouldShow: p => addDependency(p.enablequiver) }),
  quiverShowRefill: new Property('QuiverShowRefillCost', 0, 0, Property.Type.Toggle, false, { desc: 'show refill cost', shouldShow: p => addDependency(p.enablequiver) }),
  quiverRefillCost: new Property('QuiverRefillCostType', 0, 0, Property.Type.Option, 'Instant', { desc: 'method of refilling\nInstant: whatever is fastest\nIndividual: spam left click at jax (cheaper, also ur a loser)\nJax: same as instant but jax flint arrows expensiver\nOphelia: same as instant', options: ['Instant', 'Individual', 'Jax', 'Ophelia'], shouldShow: p => addDependency(p.quiverShowRefill) }),
  quiverShowRefillThresh: new Property('QuiverRefillCostDisplayThreshold', 0, 0, Property.Type.Percent, 25, { desc: 'only show refill cost when below this amount full', min: 0, max: 100, shouldShow: p => addDependency(p.quiverShowRefill) }),
};

const $Rabbit = {
  enablerabbit: new Property('EnableRabbitTils', 0, 0, Property.Type.Toggle, false, {}),
  rabbitShowBestUpgrade: new Property('RabbitTilsShowBestUpgrade', 0, 0, Property.Type.Toggle, true, { desc: 'highlight most cost effective rabbit upgrade', shouldShow: p => addDependency(p.enablerabbit) }),
  rabbitCondenseChat: new Property('RabbitTilsCondenseChat', 0, 0, Property.Type.Toggle, true, { desc: 'has been promoted lookin mf', shouldShow: p => addDependency(p.enablerabbit) }),
};

const $ChatTils = {
  enablechattils: new Property('EnableChatTils', 0, 0, Property.Type.Toggle, false, {}),

  chatTilsWaypoint: new Property('ChatTilsFindWaypoints', 0, 0, Property.Type.Toggle, true, { desc: 'look for waypoints in all the chats', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsWaypointType: new Property('ChatTilsWaypointType', 0, 0, Property.Type.Option, 'Box', { desc: 'type of waypoint', options: ['Box', 'Wireframe', 'None'], shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointColor: new Property('ChatTilsWaypointColor', 0, 0, Property.Type.Color, 0xC80000FF, { shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointBeacon: new Property('ChatTilsWaypointShowBeacon', 0, 0, Property.Type.Toggle, true, { desc: 'render beacon to waypoint', shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointName: new Property('ChatTilsWaypointShowName', 0, 0, Property.Type.Toggle, false, { desc: 'show name of player who sent waypoint', shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointDuration: new Property('ChatTilsWaypointDuration', 0, 0, Property.Type.Integer, 60, { desc: 'time in seconds, 0 = forever', min: 0, shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointShowOwn: new Property('ChatTilsWaypointShowOwn', 0, 0, Property.Type.Toggle, true, { desc: 'show your own waypoints', shouldShow: p => addDependency(p.chatTilsWaypoint) }),
  chatTilsWaypointPersist: new Property('ChatTilsWaypointPersist', 0, 0, Property.Type.Toggle, false, { desc: 'whether to persist on swapping servers', shouldShow: p => addDependency(p.chatTilsWaypoint) }),

  chatTilsHideBonzo: new Property('ChatTilsHidePartyChatBonzo', 0, 0, Property.Type.Option, 'False', { desc: '"Bonzo Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsHidePhoenix: new Property('ChatTilsHidePartyChatPhoenix', 0, 0, Property.Type.Option, 'False', { desc: '"Phoenix Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsHideSpirit: new Property('ChatTilsHidePartyChatSpirit', 0, 0, Property.Type.Option, 'False', { desc: '"Spirit Procced (3s)" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsHideLeap: new Property('ChatTilsHidePartyChatLeaps', 0, 0, Property.Type.Option, 'False', { desc: '"Leaped/Leaping to plinkingndriving" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsHideMelody: new Property('ChatTilsHidePartyChatMelody', 0, 0, Property.Type.Option, 'False', { desc: '"melody (1/4)/25%" ("Both" hides chat + sound)', options: ['False', 'Sound', 'Both'], shouldShow: p => addDependency(p.enablechattils) }),
  chatTilsCompactMelody: new Property('ChatTilsCompactPartyChatMelody', 0, 0, Property.Type.Toggle, true, { desc: 'only keep most recent melody message from a player', shouldShow: p => addDependency(p.enablechattils) }),

  chatTilsClickAnywhereFollow: new Property('ChatTilsClickAnywhereFollow', 0, 0, Property.Type.Toggle, false, { desc: 'click anywhere after opening chat to follow party member\n(mostly for diana/assfang/jumpy dt cube)', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsClickAnywhereFollowOnlyLead: new Property('ChatTilsClickAnywhereFollowOnlyLead', 0, 0, Property.Type.Toggle, true, { desc: 'only follow leader', shouldShow: p => addDependency(p.chatTilsClickAnywhereFollow) }),

  chatTilsImageArt: new Property('ChatTilsImageArt', 0, 0, Property.Type.Toggle, false, { desc: 'generate ascii art from image\nusage: /printimage [image url]\n/printimage (will print image from clipboard)\n/printimage https://i.imgur.com/things.jpeg (will print image from url)', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsImageArtParty: new Property('ChatTilsImageArtPartyChat', 0, 0, Property.Type.Toggle, true, { desc: 'always send in party chat', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtAutoPrint: new Property('ChatTilsImageArtAutoPrint', 0, 0, Property.Type.Toggle, false, { desc: 'auto print all lines of the image', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtWidth: new Property('ChatTilsImageArtPartyWidth', 0, 0, Property.Type.Integer, 40, { desc: 'width of the generated image (in characters)\nheight automatically scaled', min: 1, max: 128, shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtEncoding: new Property('ChatTilsImageArtEncoding', 0, 0, Property.Type.Option, 'Braille', { desc: 'encoding used', options: ['Braille', 'ASCII'], shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtUseGaussian: new Property('ChatTilsImageArtSmooth', 0, 0, Property.Type.Toggle, false, { desc: 'apply a gaussian blur to image before processing (best results when sobel is used)', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtSharpen: new Property('ChatTilsImageArtSharpen', 0, 0, Property.Type.Toggle, true, { desc: 'sharpen source image', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtDither: new Property('ChatTilsImageArtDither', 0, 0, Property.Type.Toggle, true, { desc: 'apply dithering', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtInvert: new Property('ChatTilsImageArtInvert', 0, 0, Property.Type.Toggle, true, { desc: 'invert colors', shouldShow: p => addDependency(p.chatTilsImageArt) }),
  chatTilsImageArtAlgorithm: new Property('ChatTilsImageArtAlgorithm', 0, 0, Property.Type.Option, 'Grayscale', { desc: 'transform algorithm used', options: ['Grayscale', 'Sobel'], shouldShow: p => addDependency(p.chatTilsImageArt) }),

  chatTilsEssential: new Property('ChatTilsBetterEssential', 0, 0, Property.Type.Toggle, false, { desc: 'show Essential messages in mc chat\n/we, /te, /re, and /fe for corresponding Essential actions', shouldShow: p => addDependency(p.enablechattils), isNewSection: true }),
  chatTilsEssentialPing: new Property('ChatTilsEssentialPing', 0, 0, Property.Type.Toggle, true, { desc: 'send chat pings on recieve message', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialNotif: new Property('ChatTilsEssentialNotification', 0, 0, Property.Type.Toggle, false, { desc: 'send Essential notification on recieve message', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialOverrideCommands: new Property('ChatTilsBetterEssentialOverrideCommands', 0, 0, Property.Type.Toggle, false, { desc: 'override the /w, /t, /r, and /f commands to be Essential ones', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialForwardPartyDms: new Property('ChatTilsEssentialForwardPartyDms', 0, 0, Property.Type.Toggle, false, { desc: 'when leader in a party, any essential dms from party members will be forwarded to party chat', shouldShow: p => addDependency(p.chatTilsEssential) }),
  chatTilsEssentialRedirectPartyChat: new Property('ChatTilsEssentialRedirectPartyChat', 0, 0, Property.Type.Toggle, false, { desc: 'redirect /pc to message leader on essentials\nalso enables /chat p and /chat party', shouldShow: p => addDependency(p.chatTilsEssential) }),
};

const $Diana = {
  enablediana: new Property('EnableDiana', 0, 0, Property.Type.Toggle, false, {}),
  dianaArrowToBurrow: new Property('DianaArrowToBurrow', 0, 0, Property.Type.Toggle, true, { desc: 'draw an arrow pointing to nearest burrow', shouldShow: p => addDependency(p.enablediana), isNewSection: true }),
  dianaArrowToBurrowColor: new Property('DianaArrowToBurrowColor', 0, 0, Property.Type.Color, 0x9FE2BF, { shouldShow: p => addDependency(p.dianaArrowToBurrow) }),
  dianaScanBurrows: new Property('DianaScanBurrows', 0, 0, Property.Type.Toggle, true, { desc: 'look for burrows by particles', shouldShow: p => addDependency(p.enablediana), isNewSection: true }),
  dianaBurrowStartColor: new Property('DianaBurrowStartColor', 0, 0, Property.Type.Color, 0xBBEEEEFF, { shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaBurrowMobColor: new Property('DianaBurrowMobColor', 0, 0, Property.Type.Color, 0x2A1D32FF, { shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaBurrowTreasureColor: new Property('DianaBurrowTreasureColor', 0, 0, Property.Type.Color, 0xFED02AFF, { shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrow: new Property('DianaAlertFoundBurrow', 0, 0, Property.Type.Toggle, true, { desc: 'alert when burrow is found', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrowNoStart: new Property('DianaAlertFoundBurrowNoStart', 0, 0, Property.Type.Toggle, false, { desc: 'do not alert when found burrow is a start burrow', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrowTime: new Property('DianaAlertFoundBurrowTime', 0, 0, Property.Type.Integer, 500, { desc: 'in ms', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaAlertFoundBurrowSound: new Property('DianaAlertFoundBurrowSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.dianaScanBurrows) }),
  dianaGuessFromParticles: new Property('DianaGuessFromParticles', 0, 0, Property.Type.Toggle, false, { desc: '/togglesound must be on', shouldShow: p => addDependency(p.enablediana), isNewSection: true }),
  dianaGuessRememberPrevious: new Property('DianaRememberPreviousGuesses', 0, 0, Property.Type.Toggle, true, { desc: 'guesses only removed when nearby burrow is found i.e. DianaScanBurrows must be on\nor use /ctsremoveclosestdiana', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaBurrowPrevGuessColor: new Property('DianaBurrowPrevGuessColor', 0, 0, Property.Type.Color, 0x707020FF, { shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesPathColor: new Property('DianaGuessFromParticlesPathColor', 0, 0, Property.Type.Color, 0x00FFFFFF, { desc: 'color of path of particles', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesRenderName: new Property('DianaGuessFromParticlesRenderName', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesAverageColor: new Property('DianaGuessFromParticlesAverageColor', 0, 0, Property.Type.Color, 0xB000B5FF, { desc: 'color of geometric median of all guesses', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesSplineColor: new Property('DianaGuessFromParticlesSplineColor', 0, 0, Property.Type.Color, 0x138686FF, { desc: 'color of guess from spline estimation', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesMLATColor: new Property('DianaGuessFromParticlesMLATColor', 0, 0, Property.Type.Color, 0xB31919FF, { desc: 'color of guess from multilateration', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
  dianaGuessFromParticlesBezierColor: new Property('DianaGuessFromParticlesBezierColor', 0, 0, Property.Type.Color, 0xFF8000FF, { desc: 'color of guess from bezier + control point', shouldShow: p => addDependency(p.dianaGuessFromParticles) }),
};

const $HUD = {
  enableabsorption: new Property('EnableCustomAbsorption', 0, 0, Property.Type.Toggle, false, { desc: 'custom absorption renderer to more accurately portray total hp' }),
  absorptionMaxHearts: new Property('AbsorptionMaxHearts', 0, 0, Property.Type.Integer, 40, { desc: 'caps hearts for things like mastiff', min: 0, shouldShow: p => addDependency(p.enableabsorption) }),

  enableserverscrutinizer: new Property('EnableServerScrutinizer', 0, 0, Property.Type.Toggle, false, { desc: 'scrutinizes the server\'s tps and things', isNewSection: true }),

  serverScrutinizerTPSDisplay: new Property('ServerScrutinizerTPSDisplay', 0, 0, Property.Type.Toggle, true, { desc: 'tracks tps', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  moveTPSDisplay: new Property('MoveTPSDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayCap20: new Property('ServerScrutinizerCapTPS', 0, 0, Property.Type.Toggle, false, { desc: 'caps all tps at 20', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayCurr: new Property('ServerScrutinizerDisplayCurrentTPS', 0, 0, Property.Type.Toggle, false, { desc: 'show current tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayAvg: new Property('ServerScrutinizerDisplayAverageTPS', 0, 0, Property.Type.Toggle, true, { desc: 'show average tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayMin: new Property('ServerScrutinizerDisplayMinimumTPS', 0, 0, Property.Type.Toggle, false, { desc: 'show minimum tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSDisplayMax: new Property('ServerScrutinizerDisplayMaximumTPS', 0, 0, Property.Type.Toggle, false, { desc: 'show maximum tps', shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),
  serverScrutinizerTPSMaxAge: new Property('ServerScrutinizerTPSMaxAge', 0, 0, Property.Type.Integer, 5000, { desc: 'max age of ticks', min: 1000, shouldShow: p => addDependency(p.serverScrutinizerTPSDisplay) }),

  serverScrutinizerLastTickDisplay: new Property('ServerScrutinizerLastPacketDisplay', 0, 0, Property.Type.Toggle, true, { desc: 'tracks last packet sent time (lag spike)', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  moveLastTickDisplay: new Property('MoveLastTickDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.serverScrutinizerLastTickDisplay) }),
  serverScrutinizerLastTickThreshold: new Property('ServerScrutinizerLastPacketThreshold', 0, 0, Property.Type.Integer, 200, { desc: 'only show when server has not responded for this amount of time\nin ms', shouldShow: p => addDependency(p.serverScrutinizerLastTickDisplay) }),

  serverScrutinizerFPSDisplay: new Property('ServerScrutinizerFPSDisplay', 0, 0, Property.Type.Toggle, false, { desc: 'tracks FPS', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  moveFPSDisplay: new Property('MoveFPSDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayCurr: new Property('ServerScrutinizerDisplayCurrentFPS', 0, 0, Property.Type.Toggle, true, { desc: 'show current fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayAvg: new Property('ServerScrutinizerDisplayAverageFPS', 0, 0, Property.Type.Toggle, true, { desc: 'show average fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayMin: new Property('ServerScrutinizerDisplayMinimumFPS', 0, 0, Property.Type.Toggle, true, { desc: 'show minimum fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSDisplayMax: new Property('ServerScrutinizerDisplayMaximumFPS', 0, 0, Property.Type.Toggle, true, { desc: 'show maximum fps', shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),
  serverScrutinizerFPSMaxAge: new Property('ServerScrutinizerFPSMaxAge', 0, 0, Property.Type.Integer, 5000, { desc: 'max age of ticks', min: 1000, shouldShow: p => addDependency(p.serverScrutinizerFPSDisplay) }),

  serverScrutinizerPingDisplay: new Property('ServerScrutinizerPingDisplay', 0, 0, Property.Type.Toggle, false, { desc: 'tracks ping', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  movePingDisplay: new Property('MovePingDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.serverScrutinizerPingDisplay) }),
  serverScrutinizerPingDisplayCurr: new Property('ServerScrutinizerDisplayCurrentPing', 0, 0, Property.Type.Toggle, true, { desc: 'show current ping', shouldShow: p => addDependency(p.serverScrutinizerPingDisplay) }),
  serverScrutinizerPingDisplayAvg: new Property('ServerScrutinizerDisplayAveragePing', 0, 0, Property.Type.Toggle, true, { desc: 'show average ping', shouldShow: p => addDependency(p.serverScrutinizerPingDisplay) }),

  serverScrutinizerPPSDisplay: new Property('ServerScrutinizerPPSDisplay', 0, 0, Property.Type.Toggle, false, { desc: 'tracks PPS (packets [send] per second)', shouldShow: p => addDependency(p.enableserverscrutinizer), isNewSection: true }),
  movePPSDisplay: new Property('MovePPSDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayCurr: new Property('ServerScrutinizerDisplayCurrentPPS', 0, 0, Property.Type.Toggle, true, { desc: 'show current pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayAvg: new Property('ServerScrutinizerDisplayAveragePPS', 0, 0, Property.Type.Toggle, true, { desc: 'show average pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayMin: new Property('ServerScrutinizerDisplayMinimumPPS', 0, 0, Property.Type.Toggle, true, { desc: 'show minimum pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSDisplayMax: new Property('ServerScrutinizerDisplayMaximumPPS', 0, 0, Property.Type.Toggle, true, { desc: 'show maximum pps', shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),
  serverScrutinizerPPSMaxAge: new Property('ServerScrutinizerPPSMaxAge', 0, 0, Property.Type.Integer, 5000, { desc: 'max age of ticks', min: 1000, shouldShow: p => addDependency(p.serverScrutinizerPPSDisplay) }),

  enablespotify: new Property('EnableSpotifyDisplay', 0, 0, Property.Type.Toggle, false, { desc: 'shows current song playing on spotify, only works on windows + app version', isNewSection: true }),
  moveSpotifyDisplay: new Property('MoveSpotifyDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.enablespotify) }),
  spotifyHideNotOpen: new Property('SpotifyHideIfNotOpened', 0, 0, Property.Type.Toggle, true, { desc: 'hide if spotify is not opened', shouldShow: p => addDependency(p.enablespotify) }),
  spotifyMaxSongLength: new Property('SpotifyMaxSongLength', 0, 0, Property.Type.Integer, 100, { desc: 'in pixels, 0 for uncapped length', min: 0, shouldShow: p => addDependency(p.enablespotify) }),

  enablesacks: new Property('EnableSackTils', 0, 0, Property.Type.Toggle, false, { desc: 'does things with the sacks message\nto turn on settings -> personal -> chat feedback -> sack notifs', isNewSection: true }),
  sacksDisableMessage: new Property('SackTilsDisableMessage', 0, 0, Property.Type.Toggle, true, { desc: 'hide the message', shouldShow: p => addDependency(p.enablesacks) }),
  sacksDisplay: new Property('SackTilsDisplay', 0, 0, Property.Type.Toggle, true, { desc: 'gui showing change in items', shouldShow: p => addDependency(p.enablesacks) }),
  moveSacksDisplay: new Property('MoveSacktilsDisplay', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayTimeout: new Property('SackTilsDisplayTimeout', 0, 0, Property.Type.Number, 5000, { desc: 'how long to show changes for in ms', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayCombineQuantities: new Property('SackTilsDisplayCombineQuantities', 0, 0, Property.Type.Toggle, false, { desc: 'combine +16 Ender Pearl and -3 Ender Pearl into +13 Ender Pearl', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayTrackAggregateQuantities: new Property('SackTilsDisplayTrackAggregateQuantities', 0, 0, Property.Type.Toggle, false, { desc: 'remember previous transactions (reset on restart/reload or manually)', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayResetAggregate: new Property('SackTilsDisplayResetAggregate', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.sacksDisplayTrackAggregateQuantities) }),
  sacksDisplayItemWhitelist: new Property('SackTilsDisplayItemWhitelist', 0, 0, Property.Type.Text, '', { desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato', shouldShow: p => addDependency(p.sacksDisplay) }),
  sacksDisplayItemBlacklist: new Property('SackTilsDisplayItemBlacklist', 0, 0, Property.Type.Text, '', { desc: 'case insensitive comma separated values\ndo not use quotes, they will not be parsed\nall formatting codes and non alphanumeric characters will be stripped\nwill first attempt to match by id, then strict name, then a check without spaces\nall the following will match the item "Jack o\' Lantern"\nJACK_O_LANTERN,Jack o\' Lantern,jack o lantern,jackolantern\nthe following will NOT match:\njack lantern,ack o lanter,poisonous potato', shouldShow: p => addDependency(p.sacksDisplay) }),

  enabledeployable: new Property('EnableDeployableTils', 0, 0, Property.Type.Toggle, false, { isNewSection: true }),
  deployableHUD: new Property('DeployableHUD', 0, 0, Property.Type.Option, 'Compact', { desc: 'show current deployable\nwhat is bubblegum?', options: ['Compact', 'Full', 'None'], shouldShow: p => addDependency(p.enabledeployable) }),
  moveDeployableHUD: new Property('MoveDeployableHUD', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.deployableHUD) }),
  deployableAssumeJalapeno: new Property('DeployableAssumeJalapeno', 0, 0, Property.Type.Toggle, true, { desc: 'assume flares have jalapeno applied\n(cannot detect programmatically because fuck hypixel)', shouldShow: p => addDependency(p.deployableHUD) }),
  deployableHUDColorTimer: new Property('DeployableHUDColorTime', 0, 0, Property.Type.Toggle, true, { desc: 'color the timer based on time remaining', shouldShow: p => addDependency(p.deployableHUD) }),
  deployableParticlesOwn: new Property('DeployableParticlesOwn', 0, 0, Property.Type.Option, 'Default', { options: ['Default', 'None', 'Custom'], desc: 'only applies to own deployables', shouldShow: p => addDependency(p.enabledeployable) }),
  deployableParticlesOther: new Property('DeployableParticlesOther', 0, 0, Property.Type.Option, 'Default', { options: ['Default', 'None', 'Custom'], shouldShow: p => addDependency(p.enabledeployable) }),

  enableferoestimate: new Property('EnableFeroEstimate', 0, 0, Property.Type.Toggle, false, { isNewSection: true }),
  moveFeroEstimate: new Property('MoveFeroEstimate', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.enableferoestimate) }),
  feroEstimateUpdateDelay: new Property('FeroEstimateUpdateDelay', 0, 0, Property.Type.Integer, 500, { desc: 'delay in ms to update guess', min: 0, shouldShow: p => addDependency(p.enableferoestimate) }),

  enablecrosshair: new Property('EnableCustomCrosshair', 0, 0, Property.Type.Toggle, false, { isNewSection: true }),
  crosshairType: new Property('CustomCrosshairType', 0, 0, Property.Type.Option, '+', { options: ['+', 'X', '/\\', 'O', '.'], shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairColor: new Property('CustomCrosshairColor', 0, 0, Property.Type.Color, 0xFFFFFFFF, { shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairInvert: new Property('CustomCrosshairInvertColor', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairWidth: new Property('CustomCrosshairWidth', 0, 0, Property.Type.Number, 10, { min: 0, shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairBreadth: new Property('CustomCrosshairBreadth', 0, 0, Property.Type.Number, 1, { min: 0, shouldShow: p => addDependency(p.enablecrosshair) }),
  crosshairRenderInGui: new Property('CustomCrosshairRenderInGuis', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enablecrosshair) }),
};

const $AvariceAddons = {
  enableavarice: new Property('EnableAvariceAddons', 0, 0, Property.Type.Toggle, false, { desc: 'things for avarice' }),

  avariceShowCoinCounter: new Property('AvariceShowCoinCounter', 0, 0, Property.Type.Toggle, true, { desc: 'show avarice coins in a hud', shouldShow: p => addDependency(p.enableavarice), isNewSection: true }),
  moveAvariceCoinCounter: new Property('MoveAvariceCoinCounter', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.avariceShowCoinCounter) }),

  avariceArachne: new Property('AvariceBigSpooderHelper', 0, 0, Property.Type.Toggle, true, { desc: 'big spooder go die, i hate nons', shouldShow: p => addDependency(p.enableavarice), isNewSection: true }),
  avariceArachneHideBroodNames: new Property('AvariceHideSmallSpooderNames', 0, 0, Property.Type.Toggle, true, { desc: 'make small spooder names go bye', shouldShow: p => addDependency(p.avariceArachne) }),
  avariceArachneBoxBigSpooder: new Property('AvariceBoxBigSpooder', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.avariceArachne) }),
  avariceArachneBoxBigSpooderColor: new Property('AvariceBoxBigSpooderColor', 0, 0, Property.Type.Color, 0xEB38BBFF, { shouldShow: p => addDependency(p.avariceArachneBoxBigSpooder) }),
  avariceArachneBoxBigSpooderEsp: new Property('AvariceBoxBigSpooderEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.avariceArachneBoxBigSpooder) }),
  avariceArachneBoxBigSpooderDrawArrow: new Property('AvariceBoxBigSpooderDrawArrow', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.avariceArachneBoxBigSpooder) }),
  avariceArachneBoxSmallSpooders: new Property('AvariceBoxSmallSpooders', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.avariceArachne) }),
  avariceArachneBoxSmallSpoodersColor: new Property('AvariceBoxSmallSpoodersColor', 0, 0, Property.Type.Color, 0x26ED5EFF, { shouldShow: p => addDependency(p.avariceArachneBoxSmallSpooders) }),
  avariceArachneBoxSmallSpoodersEsp: new Property('AvariceBoxSmallSpoodersEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.avariceArachneBoxSmallSpooders) }),

  avariceTaraTrader: new Property('AvariceTaraTrader', 0, 0, Property.Type.Toggle, false, { desc: 'block hits on tara if slayer quest not started\nlag go brr\nnote: doesnt block custom hits (i.e. >3 block range)\nas of writing this, xp duping is patched and trading is not possible (i.e. obsolete)', shouldShow: p => addDependency(p.enableavarice), isNewSection: true }),
};

const $GreatSpook = {
  enablegreatspook: new Property('EnableGreatSpook', 0, 0, Property.Type.Toggle, false, {}),
  greatSpookPrimalCd: new Property('GreatSpookPrimalCd', 0, 0, Property.Type.Integer, 75, { desc: 'cd between spawns, in seconds\ncheck at hub -> tyashoi alchemist', shouldShow: p => addDependency(p.enablegreatspook) }),

  greatSpookPrimalTimer: new Property('GreatSpookPrimalTimer', 0, 0, Property.Type.Toggle, true, { desc: 'timer until primal fear can spawn', shouldShow: p => addDependency(p.enablegreatspook), isNewSection: true }),
  moveGreatSpookPrimalTimer: new Property('MoveGreatSpookPrimalTimer', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.greatSpookPrimalTimer) }),
  greatSpookPrimalTimerHideReady: new Property('GreatSpookPrimalTimerHideReady', 0, 0, Property.Type.Toggle, false, { desc: 'when cd is ready hide timer rather than show "READY"', shouldShow: p => addDependency(p.greatSpookPrimalTimer) }),

  greatSpookPrimalAlert: new Property('GreatSpookPrimalAlert', 0, 0, Property.Type.Toggle, true, { desc: 'show alert when primal is ready', shouldShow: p => addDependency(p.enablegreatspook) }),
  greatSpookPrimalAlertTime: new Property('GreatSpookPrimalAlertTime', 0, 0, Property.Type.Integer, 2000, { desc: 'in ms', min: 0, shouldShow: p => addDependency(p.greatSpookPrimalAlert) }),
  greatSpookPrimalAlertSound: new Property('GreatSpookPrimalAlertSound', 0, 0, Property.Type.Toggle, true, { desc: 'play sound with the alert', shouldShow: p => addDependency(p.greatSpookPrimalAlert) }),
};

const $FishingTils = {
  enablefishingtils: new Property('EnableFishingTils', 0, 0, Property.Type.Toggle, true, {}),

  fishingTilsHotspotWaypoint: new Property('FishingTilsHotspotWaypoint', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enablefishingtils), isNewSection: true }),
  fishingTilsHotspotWaypointColor: new Property('FishingTilsHotspotWaypointColor', 0, 0, Property.Type.Color, 0xFA771EFF, { shouldShow: p => addDependency(p.fishingTilsHotspotWaypoint) }),
  fishingTilsHotspotWaypointDisableRange: new Property('FishingTilsHotspotWaypointDisableRange', 0, 0, Property.Type.Integer, 10, { desc: 'disable when this many blocks (not including height) from hotspot', min: 0, shouldShow: p => addDependency(p.fishingTilsHotspotWaypoint) }),
  fishingTilsHotspotWaypointArrow: new Property('FishingTilsHotspotWaypointArrow', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.fishingTilsHotspotWaypoint) }),

  fishingTilsUpdateSBAList: new Property('FishingTilsUpdateSBAList', 0, 0, Property.Type.Toggle, true, { desc: 'update the sba sea creature list\nrequires game restart to fully disable (why though)', shouldShow: p => addDependency(p.enablefishingtils), isNewSection: true }),
};

const $Necromancy = {
  enablenecromancy: new Property('EnableNecromancy', 0, 0, Property.Type.Toggle, false, {}),

  necromancyTrackSouls: new Property('NecromancyTrackSouls', 0, 0, Property.Type.Toggle, true, { desc: 'track info about souls that get dropped', shouldShow: p => addDependency(p.enablenecromancy), isNewSection: true }),
  necromancySoulWhitelist: new Property('NecromancySoulWhitelist', 0, 0, Property.Type.Text, '', { desc: 'comma separated names, will search inclusively, case sensitive', shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancySoulBlacklist: new Property('NecromancySoulBlacklist', 0, 0, Property.Type.Text, '', { desc: 'comma separated names, will search inclusively, case sensitive', shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancyAlwaysTrackBoss: new Property('NecromancyAlwaysTrackBoss', 0, 0, Property.Type.Toggle, true, { desc: 'always track powerful (dark) souls, regardless of white/blacklist', shouldShow: p => addDependency(p.necromancyTrackSouls) }),

  necromancySoulEsp: new Property('NecromancySoulEsp', 0, 0, Property.Type.Toggle, false, { desc: 'esp on soul rendering', shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancyShowMobName: new Property('NecromancyShowMobName', 0, 0, Property.Type.Toggle, true, { desc: 'render name of mob above soul', shouldShow: p => addDependency(p.necromancyTrackSouls) }),

  necromancyBoxSoul: new Property('NecromancyBoxSoul', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.necromancyTrackSouls) }),
  necromancySoulColorNew: new Property('NecromancySoulColorNew', 0, 0, Property.Type.Color, 0x00FFFFA0, { desc: 'color of newly dropped soul', shouldShow: p => addDependency(p.necromancyBoxSoul) }),
  necromancySoulColorOld: new Property('NecromancySoulColorOld', 0, 0, Property.Type.Color, 0xFF0000FF, { desc: 'color of soul about to despawn', shouldShow: p => addDependency(p.necromancyBoxSoul) }),
};

const $Dojo = {
  enabledojo: new Property('EnableDojo', 0, 0, Property.Type.Toggle, false, {}),

  dojoMastery: new Property('DojoMaster', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enabledojo), isNewSection: true }),
  dojoMasteryPointToLowest: new Property('DojoMasteryPointToLowest', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryPointToLowestColor: new Property('DojoMasteryPointToLowestColor', 0, 0, Property.Type.Color, 0x55FF55FF, { shouldShow: p => addDependency(p.dojoMasteryPointToLowest) }),
  dojoMasteryShowLowestTime: new Property('DojoMasteryShowLowestTime', 0, 0, Property.Type.Toggle, true, { desc: 'render lowest time below crosshair', shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryPointToNext: new Property('DojoMasteryPointToNext', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryPointToNextColor: new Property('DojoMasteryPointToNextColor', 0, 0, Property.Type.Color, 0x5555FFFF, { shouldShow: p => addDependency(p.dojoMasteryPointToNext) }),
  dojoMasteryPointToNextTimer: new Property('DojoMasteryPointToNextTimer', 0, 0, Property.Type.Toggle, true, { desc: 'show timer for the next block', shouldShow: p => addDependency(p.dojoMastery) }),
  dojoMasteryHideTitles: new Property('DojoMasteryHideTitles', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.dojoMastery) }),
};

const $EntityReducer = {
  enableentityreducer: new Property('EnableEntityReducer', 0, 0, Property.Type.Toggle, false, { desc: 'reduce strain from excess entity spam\n"hiding" the entity prevents them from rendering, but you can still interact with them\n"removing" the entity completely deletes them\nremoving is better for performance but to get them back you must reload them from the server' }),

  entityReducerHub: new Property('ReduceHubEntities', 0, 0, Property.Type.Toggle, true, { isNewSection: true }),
  entityReducerHubMap: new Property('ReduceHubMap', 0, 0, Property.Type.Option, 'Remove', { desc: 'map of skyblock @ hub', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubCityProject: new Property('ReduceHubCityProject', 0, 0, Property.Type.Option, 'Remove', { options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubTopAuctions: new Property('ReduceHubTopAuctions', 0, 0, Property.Type.Option, 'Remove', { desc: 'top listings on AH, under auction house (only the cases not the items)', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubHex: new Property('ReduceHubHex', 0, 0, Property.Type.Option, 'Remove', { desc: 'physical hex pedestal', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubDHub: new Property('ReduceHubCatacombs', 0, 0, Property.Type.Option, 'Remove', { desc: 'the catacombs entrance near crypts', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubJax: new Property('ReduceHubJax', 0, 0, Property.Type.Option, 'Remove', { desc: 'random bows, arrows ,swords, etc near jax/rosetta', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubKatHouse: new Property('ReduceHubKatHouse', 0, 0, Property.Type.Option, 'Remove', { desc: 'pet care area on 2nd floor of kat house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubVincent: new Property('ReduceHubVincent', 0, 0, Property.Type.Option, 'Remove', { desc: 'paintings in vincent house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubTaylor: new Property('ReduceHubTaylor', 0, 0, Property.Type.Option, 'Remove', { desc: 'armor in basement of taylor house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubCarpenter: new Property('ReduceHubCarpenter', 0, 0, Property.Type.Option, 'Remove', { desc: 'carpentry objects', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubMarco: new Property('ReduceHubMarco', 0, 0, Property.Type.Option, 'Remove', { desc: 'paintings in marco house', options: ['Normal', 'Hide', 'Remove'] }),
  entityReducerHubRabbit: new Property('ReduceHubRabbitFamily', 0, 0, Property.Type.Option, 'Remove', { desc: 'rabbit house residents', options: ['Normal', 'Hide', 'Remove'] }),

  entityReducerDHub: new Property('ReduceDungeonHubEntities', 0, 0, Property.Type.Toggle, true, { isNewSection: true }),
  entityReducerDHubRace: new Property('ReduceDHubRaceLeaderboard', 0, 0, Property.Type.Option, 'Remove', { desc: 'leaderboard for races', options: ['Normal', 'Hide', 'Remove'] }),
};

const $Testing = {
  enableboxallentities: new Property('EnableBoxAllEntities', 0, 0, Property.Type.Toggle, false, { desc: 'mostly for debugging' }),
  boxAllEntitiesInvis: new Property('BoxAllEntitiesInvisible', 0, 0, Property.Type.Toggle, false, { desc: 'box invisible entities', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesColor: new Property('BoxAllEntitiesColor', 0, 0, Property.Type.Color, 0xFF0000FF, { shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesEsp: new Property('BoxAllEntitiesEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesName: new Property('BoxAllEntitiesName', 0, 0, Property.Type.Toggle, false, { desc: 'show nametag', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesClassName: new Property('BoxAllEntitiesClassName', 0, 0, Property.Type.Toggle, false, { desc: 'show class name', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesWhitelist: new Property('BoxAllEntitiesWhitelist', 0, 0, Property.Type.Text, '', { desc: 'comma separated class names', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesBlacklist: new Property('BoxAllEntitiesBlacklist', 0, 0, Property.Type.Text, '', { desc: 'comma separated class names', shouldShow: p => addDependency(p.enableboxallentities) }),
  boxAllEntitiesEntityId: new Property('BoxAllEntitiesEntityId', 0, 0, Property.Type.Toggle, false, { desc: 'show entity id', shouldShow: p => addDependency(p.enableboxallentities) }),

  enablelogdamage: new Property('EnableLogDamage', 0, 0, Property.Type.Toggle, false, { desc: 'log damage numbers in chat', isNewSection: true }),
  logDamageRange: new Property('LogDamageRange', 0, 0, Property.Type.Number, 5, { desc: 'ignore damage numbers outside this range\nin blocks', min: 0, shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageThreshold: new Property('LogDamageThreshold', 0, 0, Property.Type.Integer, 0, { desc: 'only log damage when above this amount\n0 to disable', min: 0, shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageNormal: new Property('LogDamageNormal', 0, 0, Property.Type.Toggle, true, { desc: 'non crit', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageCrit: new Property('LogDamageCrit', 0, 0, Property.Type.Toggle, true, { desc: 'crit', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageWither: new Property('LogDamageWither', 0, 0, Property.Type.Toggle, true, { desc: 'withering effect', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageVenomous: new Property('LogDamageVenomous', 0, 0, Property.Type.Toggle, true, { desc: 'venomous/toxic poison', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageSuffocation: new Property('LogDamageSuffocation', 0, 0, Property.Type.Toggle, true, { desc: 'suffocation/drowning', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageFire: new Property('LogDamageFire', 0, 0, Property.Type.Toggle, true, { desc: 'fire/fa/flame', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageLightning: new Property('LogDamageLightning', 0, 0, Property.Type.Toggle, true, { desc: 'thunderlord/thunderbolt', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamagePet: new Property('LogDamagePet', 0, 0, Property.Type.Toggle, true, { desc: 'pet e.g. snowman', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageOverload: new Property('LogDamageOverload', 0, 0, Property.Type.Toggle, true, { desc: 'overload', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageExtremeFocus: new Property('LogDamageExtremeFocus', 0, 0, Property.Type.Toggle, true, { desc: 'extreme focus (endstone sword)', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageOctodexterity: new Property('LogDamageOctodexterity', 0, 0, Property.Type.Toggle, true, { desc: 'octodexterity (tara full set)', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageWitherSkull: new Property('LogDamageWitherSkull', 0, 0, Property.Type.Toggle, true, { desc: 'withermancer/withers', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageLove: new Property('LogDamageLove', 0, 0, Property.Type.Toggle, true, { desc: 'ring of love etc. proc', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageCurse: new Property('LogDamageCurse', 0, 0, Property.Type.Toggle, true, { desc: 'gaia construct lightning', shouldShow: p => addDependency(p.enablelogdamage) }),
  logDamageCombo: new Property('LogDamageCombo', 0, 0, Property.Type.Toggle, true, { desc: 'blaze dagger repeat', shouldShow: p => addDependency(p.enablelogdamage) }),
};

const $Misc = {
  enableexcavatorsolver: new Property('EnableExcavatorSolver', 0, 0, Property.Type.Toggle, false, { desc: 'find fossils' }),
  excavatorSolverOnlyShowBest: new Property('ExcavatorSolverOnlyHighlightBest', 0, 0, Property.Type.Toggle, true, { desc: 'only highlight the best move', shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverShowRoute: new Property('ExcavatorSolverHighlightStartPath', 0, 0, Property.Type.Toggle, false, { desc: 'highlight best starting path (turn off if citrine gemstones)', shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverDirtTooltip: new Property('ExcavatorSolverDirtTooltip', 0, 0, Property.Type.Option, 'Custom', { options: ['Default', 'Hide', 'Custom'], shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverDustTooltip: new Property('ExcavatorSolverDustTooltip', 0, 0, Property.Type.Option, 'Custom', { options: ['Default', 'Hide', 'Custom'], shouldShow: p => addDependency(p.enableexcavatorsolver) }),
  excavatorSolverAutoClose: new Property('ExcavatorSolverAutoClose', 0, 0, Property.Type.Toggle, false, { desc: 'automatically close excavator when all clicks used', shouldShow: p => addDependency(p.enableexcavatorsolver) }),

  enablebettergfs: new Property('EnableBetterGFS', 0, 0, Property.Type.Toggle, false, { desc: 'autocomplete for gfs, and shorthand\ne.g. /gfs w c 1 -> /gfs WITHER_CATALYST 1', isNewSection: true }),
  betterGFSIDPref: new Property('BetterGFSIdPreference', 0, 0, Property.Type.Option, 'ID', { desc: 'which format to prefer (name vs id)\nName: replace with qualified name, ID: coerce to ID\nDynamic: use whatever format was given (in theory) it is broken af so it is disabled :)', options: ['ID', 'Name'], shouldShow: p => addDependency(p.enablebettergfs) }),
  betterGFSBlankAmount: new Property('BetterGFSUnspecifiedAmount', 0, 0, Property.Type.Integer, 1, { desc: 'amount to default to when not provided\ne.g. /gfs w c -> /gfs WITHER_CATALYST <insert amount>', min: 1, max: 2240, shouldShow: p => addDependency(p.enablebettergfs) }),

  enablecpv: new Property('EnableChickTilsPV', 0, 0, Property.Type.Toggle, true, { desc: '/cpv, neu /pv wrapper but with different api\n(almost 100% success rate!)', isNewSection: true }),
  cpvReplaceNeu: new Property('ChickTilsPVReplaceNEU', 0, 0, Property.Type.Toggle, false, { desc: 'replace /pv command (may require restart when disabling)', shouldShow: p => addDependency(p.enablecpv) }),
  cpvAutoCompleteTabList: new Property('ChickTilsPVAutoCompleteTabList', 0, 0, Property.Type.Toggle, true, { desc: 'autocomplete /pv with names from tab list', shouldShow: p => addDependency(p.enablecpv) }),
  cpvAutoCompleteParty: new Property('ChickTilsPVAutoCompleteParty', 0, 0, Property.Type.Toggle, true, { desc: 'autcomplete /pv with party members', shouldShow: p => addDependency(p.enablecpv) }),

  enableclipboard: new Property('EnableClipboardThing', 0, 0, Property.Type.Toggle, true, { desc: '/clipboard\nset, get, list, and remove\n/cbs and /cbg and /cbl and /cbr\n/clipboard set <name> | /cbg <name> | /clipboard list | /cbr <name>', isNewSection: true }),

  enablevision: new Property('DisableBlindness', 0, 0, Property.Type.Toggle, true, { desc: 'disable blindness', isNewSection: true }),

  enablecake: new Property('EnableCakeHelper', 0, 0, Property.Type.Toggle, true, { desc: 'i like eat cake.', isNewSection: true }),

  enableunfocus: new Property('PreventRenderingWhenUnfocused', 0, 0, Property.Type.Toggle, false, { desc: 'similar to patcher\'s unfocused fps\nbut instead of capping fps, it completely stops rendering', isNewSection: true }),

  enableassfangcheese: new Property('EnableAssfangCheeseHealth', 0, 0, Property.Type.Toggle, false, { desc: 'show real assfang health\nobsolete', isNewSection: true }),
  moveAssfangCheese: new Property('MoveAssfangCheeseHealth', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.enableassfangcheese) }),

  enableblockhighlight: new Property('EnableBlockHighlight', 0, 0, Property.Type.Toggle, false, { isNewSection: true }),
  blockHighlightBoxEntity: new Property('BlockHighlightBoxEntity', 0, 0, Property.Type.Toggle, false, { desc: 'box the entity you are looking at', shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightWireColor: new Property('BlockHighlightWireColor', 0, 0, Property.Type.Color, 0x00000066, { shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightFillColor: new Property('BlockHighlightFillColor', 0, 0, Property.Type.Color, 0x00000000, { shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightWireWidth: new Property('BlockHighlightWireWidth', 0, 0, Property.Type.Number, 2, { min: 0, shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightCheckEther: new Property('BlockHighlightCheckEther', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enableblockhighlight) }),
  blockHighlightEtherWireColor: new Property('BlockHighlightEtherWireColor', 0, 0, Property.Type.Color, 0x2EDD17A0, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightEtherFillColor: new Property('BlockHighlightEtherFillColor', 0, 0, Property.Type.Color, 0x60DE5560, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightEtherWireWidth: new Property('BlockHighlightEtherWireWidth', 0, 0, Property.Type.Number, 3, { min: 0, shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherWireColor: new Property('BlockHighlightCantEtherWireColor', 0, 0, Property.Type.Color, 0xCA2207A0, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherFillColor: new Property('BlockHighlightCantEtherFillColor', 0, 0, Property.Type.Color, 0xBA2B1E60, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherWireWidth: new Property('BlockHighlightCantEtherWireWidth', 0, 0, Property.Type.Number, 3, { min: 0, shouldShow: p => addDependency(p.blockHighlightCheckEther) }),
  blockHighlightCantEtherShowReason: new Property('BlockHighlightCantEtherShowReason', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.blockHighlightCheckEther) }),

  enablehidedivanparticles: new Property('HideDivanCoatingParticles', 0, 0, Property.Type.Toggle, true, { desc: 'only hides your own', isNewSection: true }),

  enablesbaenchant: new Property('UpdateSBAEnchantList', 0, 0, Property.Type.Toggle, true, { desc: 'need to rs game to unload properly (why would you?)', isNewSection: true }),

  enablepearlpath: new Property('EnablePearlPath', 0, 0, Property.Type.Toggle, false, { isNewSection: true }),
  pearlPathEsp: new Property('PearlPathEsp', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathPathColor: new Property('PearlPathColor', 0, 0, Property.Type.Color, 0xFF0000FF, { desc: 'color of path of pearl', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathDestColorOutline: new Property('PearlPathDestinationColorOutline', 0, 0, Property.Type.Color, 0x0000FFFF, { desc: 'outline color of player hitbox on teleport', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathDestColorFill: new Property('PearlPathDestinationColorFill', 0, 0, Property.Type.Color, 0x00000000, { desc: 'fill color of player hitbox on teleport', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathCollideEntity: new Property('PearlPathCollideWithEntities', 0, 0, Property.Type.Toggle, false, { desc: 'whether to check for collisions with entities', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathCollidedEntityColor: new Property('PearlPathCollidedEntityColor', 0, 0, Property.Type.Color, 0x00FF00FF, { desc: 'color to box entity that was collided with', shouldShow: p => addDependency(p.enablepearlpath) }),
  pearlPathCheeto: new Property('PearlPathCheeto', 0, 0, Property.Type.Toggle, false, { desc: 'shame shame shame\ndoesn\'t disable when looking at a block', shouldShow: p => addDependency(p.enablepearlpath) }),

  enablelookat: new Property('EnableLookAt', 0, 0, Property.Type.Toggle, true, { desc: '/lookat <pitch> <yaw>\ndisplays a thing to help aim', isNewSection: true }),
  lookAtColor: new Property('LookAtColor', 0, 0, Property.Type.Color, 0x00FFFFFF, { shouldShow: p => addDependency(p.enablelookat) }),
  lookAtSize: new Property('LookAtSize', 0, 0, Property.Type.Number, 0.01, { min: 0, shouldShow: p => addDependency(p.enablelookat) }),
  lookAtPointTo: new Property('LookAtPointToLocation', 0, 0, Property.Type.Toggle, false, { shouldShow: p => addDependency(p.enablelookat) }),
  lookAtThreshold: new Property('LookAtTreshold', 0, 0, Property.Type.Number, 0.1, { min: 0, desc: 'threshold (in degrees) until it is "good enough"', shouldShow: p => addDependency(p.enablelookat) }),
  lookAtTimeout: new Property('LookAtTimeout', 0, 0, Property.Type.Integer, 600, { min: 1, desc: 'time (in ticks) until it gives up', shouldShow: p => addDependency(p.enablelookat) }),

  enabledarkmonolith: new Property('EnableDarkMonolith', 0, 0, Property.Type.Toggle, false, { isNewSection: true }),
  darkMonolithScanDelay: new Property('DarkMonolithScanDelay', 0, 0, Property.Type.Integer, 5, { desc: 'time in ticks taken to scan all possible positions, lower = laggier', min: 1, shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithEsp: new Property('DarkMonolithEsp', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithColor: new Property('DarkMonolithColor', 0, 0, Property.Type.Color, 0x000000FF, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithPossibleColor: new Property('DarkMonolithPossibleColor', 0, 0, Property.Type.Color, 0x55FF55FF, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithScannedColor: new Property('DarkMonolithScannedColor', 0, 0, Property.Type.Color, 0xFF5555FF, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithPointTo: new Property('DarkMonolithPointTo', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  darkMonolithTrackDrops: new Property('DarkMonolithTrackDrops', 0, 0, Property.Type.Toggle, true, { shouldShow: p => addDependency(p.enabledarkmonolith) }),
  moveDarkMonolithDropsTracker: new Property('MoveDarkMonolithDropsTracker', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.darkMonolithTrackDrops) }),
  resetDarkMonolithDropsTracker: new Property('ResetDarkMonolithDropsTracker', 0, 0, Property.Type.Action, null, { shouldShow: p => addDependency(p.darkMonolithTrackDrops) }),
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