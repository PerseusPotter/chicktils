import { getPlayerName } from './format';
import { log } from './log';
import reg from './registerer';

let _hasLoaded = false;
let _inParty = false;
let _members = new Set();
let _leader = '';

export function getLeader() {
  return _leader;
}
export function isLeader() {
  return _leader == Player.getName();
}
export function isInParty() {
  return _inParty;
}
export function getMembers() {
  return _members;
}

export function testLoad() {
  // if (!_hasLoaded) log('please run /pl');
  if (!_hasLoaded) {
    log('Loading Party...');
    Client.scheduleTask(10, () => ChatLib.command('party list'));
    _hasLoaded = true;
  }
}
function createParty() {
  testLoad();
  if (!_inParty) {
    if (_hasLoaded) _leader = Player.getName();;
    _members.add(Player.getName());
  }
  _inParty = true;
}
function clearParty() {
  _hasLoaded = true;
  _inParty = false;
  _members.clear();
  _leader = '';
}
function addMember(name) {
  createParty();
  _members.add(getPlayerName(name));
}
function removeMember(name) {
  createParty();
  _members.delete(getPlayerName(name));
}
function setLead(name) {
  createParty();
  _leader = getPlayerName(name);
}

const regs = [
  reg('chat', () => clearParty()).setCriteria('&cYou are not in a party.&r'),
  reg('chat', () => clearParty()).setCriteria('&cYou are not currently in a party!&r'),
  reg('chat', () => clearParty()).setCriteria('&cYou are not in a party right now.&r'),

  reg('chat', () => clearParty()).setCriteria('&eYou left the party.&r'),
  reg('chat', () => clearParty()).setCriteria('${p} &r&ehas disbanded the party!&r'),
  reg('chat', () => clearParty()).setCriteria('&eYou have been kicked from the party by ${p}'),
  reg('chat', () => clearParty()).setCriteria('&cThe party was disbanded because all invites expired and the party was empty.&r'),
  reg('chat', () => clearParty()).setCriteria('&cThe party was disbanded because the party leader disconnected.&r'),

  reg('chat', () => {
    createParty();
    _leader = Player.getName();
  }).setCriteria('&r&eQueueing your party...&r'),
  reg('chat', () => {
    createParty();
    _leader = '';
  }).setCriteria('&cYou are not this party\'s leader!&r'),
  reg('chat', () => createParty()).setCriteria('&r&9Party &8> ${ign}&f: &r${msg}&r'),

  reg('chat', (p1, p2) => {
    createParty();
    addMember(p1);
  }).setCriteria('${p1} &r&einvited ${p2} &r&eto the party! They have &r&c60 &r&eseconds to accept.&r'),
  reg('chat', p => createParty()).setCriteria('${p} &r&chas already been invited to the party.&r'),
  reg('chat', (p1, p2) => {
    setLead(p1);
    addMember(p1);
    addMember(p2);
  }).setCriteria('&eThe party was transferred to ${p1} &r&eby ${p2}&r'),
  reg('chat', (p1, p2) => {
    setLead(p1);
    addMember(p1);
    removeMember(p2);
  }).setCriteria('&eThe party was transferred to ${p1} &r&ebecause ${p2} &r&eleft&r'),
  reg('chat', (p1, p2) => {
    setLead(p1);
    addMember(p1);
    addMember(p2);
  }).setCriteria('${p1} has promoted ${p2} &r&eto Party Moderator&r'),
  reg('chat', (p1, p2) => {
    setLead(p2);
    addMember(p1);
    addMember(p2);
  }).setCriteria('${p1} has promoted ${p2} &r&eto Party Leader&r'),

  reg('chat', p => addMember(p)).setCriteria('${p} &r&ejoined the party.&r'),
  reg('chat', p => addMember(p)).setCriteria('&dParty Finder &r&f> ${p} &r&ejoined the ${*}'),
  reg('chat', p => removeMember(p)).setCriteria('&eKicked ${p} because they were offline.&r'),
  reg('chat', p => removeMember(p)).setCriteria('${p} &r&ewas removed from your party because they disconnected.&r'),
  reg('chat', p => removeMember(p)).setCriteria('${p} &r&ehas been removed from the party.&r'),
  reg('chat', p => removeMember(p)).setCriteria('${p} &r&ehas left the party.&r'),

  reg('chat', p => {
    clearParty();
    createParty();
    addMember(p);
    setLead(p);
  }).setCriteria('&eYou have joined ${p}\'s &r&eparty!&r'),
  reg('chat', names => names.split(', ').forEach(p => addMember(p))).setCriteria('&eYou\'ll be partying with: ${names}&r'),
  reg('chat', p => {
    clearParty();
    createParty();
    addMember(p);
    setLead(p);
  }).setCriteria('&eParty Leader: ${p} &r&${*}●&r'),
  reg('chat', names => names.split(/&. ● /).slice(0, -1).forEach(p => addMember(p))).setCriteria('&eParty Moderators: ${names}&r'),
  reg('chat', names => names.split(/&. ● /).slice(0, -1).forEach(p => addMember(p))).setCriteria('&eParty Members: ${names}&r')
];

let activeListeners = 0;
export function listen() {
  activeListeners++;
  if (activeListeners === 1) regs.forEach(v => v.register());
}
export function unlisten() {
  activeListeners--;
  if (activeListeners === 0) regs.forEach(v => v.unregister());
}