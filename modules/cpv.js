import { urlToString } from '../util/net';
import reg from '../util/registerer';
import settings from '../settings';
import { log } from '../util/log';
import * as Party from '../util/party';
import { run } from '../util/threading';

const userUUIDC = new Map();
function _getUUID(user) {
  if (!user) return Player.getUUID();
  let uuid;
  try {
    uuid = urlToString('https://api.mojang.com/users/profiles/minecraft/' + user);
    if (uuid) uuid = JSON.parse(uuid).id;
    if (uuid) return uuid;
  } catch (e) { }
  try {
    uuid = urlToString('https://api.ashcon.app/mojang/v2/uuid/' + user);
    if (uuid && uuid.length === 36) return uuid;
  } catch (e) { }
  return '';
}
function getUUID(user) {
  if (userUUIDC.has(user)) return userUUIDC.get(user);
  const uuid = _getUUID(user);
  if (uuid) userUUIDC.set(user, uuid);
  return uuid;
}
const NotEnoughUpdates = Java.type('io.github.moulberry.notenoughupdates.NotEnoughUpdates');
function cpv(user) {
  if (!NotEnoughUpdates) return log('you need neu silly');
  // if (!user) user = Player.getName();
  user = user?.toLowerCase();
  run(() => {
    try {
      const uuid = getUUID(user);
      if (!uuid) return log('Player not found.');

      const uuidNoDash = uuid.replace(/-/g, '');
      if (!NotEnoughUpdates.profileViewer.getUuidToHypixelProfile().containsKey(uuidNoDash)) {
        NotEnoughUpdates.profileViewer.getManager().ursaClient.get(`v1/hypixel/v2/player/${uuid}`, Java.type('com.google.gson.JsonObject').class).thenAccept(playerJson => {
          if (
            playerJson !== null &&
            playerJson.has('success') &&
            playerJson.get('success').getAsBoolean() &&
            playerJson.get('player').isJsonObject()
          ) {
            NotEnoughUpdates.profileViewer.getUuidToHypixelProfile().put(uuidNoDash, playerJson.get('player').getAsJsonObject());
          }
        });
      }

      const prof = NotEnoughUpdates.profileViewer.getOrLoadSkyblockProfiles(uuidNoDash, () => { });
      if (!prof) return log('&4Invalid player name. Maybe the API is down? Try again later.');
      prof.resetCache();
      Java.type('io.github.moulberry.notenoughupdates.profileviewer.ProfileViewerUtils').saveSearch(user);
      NotEnoughUpdates.INSTANCE.openGui = new (Java.type('io.github.moulberry.notenoughupdates.profileviewer.GuiProfileViewer'))(prof);
    } catch (e) {
      log('something went wrong');
      if (settings.isDev) log(e.toString(), e.stack);
      console.log(e + '\n' + e.stack);
    }
  });
}

const autocomplete = function(args) {
  const list = [];
  if (settings.cpvAutoCompleteParty) Party.getMembers().forEach(v => list.push(v));
  if (settings.cpvAutoCompleteTabList) Player.getPlayer().field_71174_a.func_175106_d().forEach(v => {
    const t = v.func_178850_i();
    if (!t || !t.func_96661_b().startsWith('a')) return;
    list.push(v.func_178845_a().getName());
  });
  const a = args[0].toLowerCase();
  if (a) return list.filter(v => v.toLowerCase().startsWith(a));
  return list;
};
const cmdReg = reg('command', cpv).setTabCompletions(autocomplete).setName('cpv');
const neuOverride = reg('command', cpv).setTabCompletions(autocomplete).setName('pv', true).setEnabled(settings._cpvReplaceNeu);

export function init() {
  settings._cpvAutoCompleteParty.listen(v => {
    if (v) Party.listen();
    else Party.unlisten();
  });
}
export function load() {
  cmdReg.register();
  neuOverride.register();
}
export function unload() {
  cmdReg.unregister();
  neuOverride.unregister();
}

/* happened one time too many
[io.github.moulberry.notenoughupdates.util.ApiUtil$Request:lambda$requestString0$3:273]: java.util.concurrent.CompletionException: HttpStatusCodeException(url=https://api.mojang.com/users/profiles/minecraft/notch?, statusCode=429, serverMessage=<!DOCTYPE html PUBLIC '-//W3C//DTD XHTML 1.0 Transitional//EN' 'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd'>
<html xmlns='http://www.w3.org/1999/xhtml'>

<head>
    <meta content='text/html; charset=utf-8' http-equiv='content-type' />
    <style type='text/css'>
        body {
            font-family: Arial;
            margin-left: 40px;
        }

        img {
            border: 0 none;
        }

        #content {
            margin-left: auto;
            margin-right: auto
        }

        #message h2 {
            font-size: 20px;
            font-weight: normal;
            color: #000000;
            margin: 34px 0px 0px 0px
        }

        #message p {
            font-size: 13px;
            color: #000000;
            margin: 7px 0px 0px0px
        }

        #errorref {
            font-size: 11px;
            color: #737373;
            margin-top: 41px
        }
    </style>
    <title>Service unavailable</title>
</head>

<body>
    <div id='content'>
        <div id='message'>
            <h2>The request is blocked.</h2>
        </div>
        <div id='errorref'>
            <span>20240420T152844Z-r1f8b879b596nkrk47cy335nug000000016000000000h6te            </span>
        </div>
    </div>
</body>
</html>
*/