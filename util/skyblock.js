// maybe current world and things idk

/**
 * @author Koenbezeg
 * @link https://discord.com/channels/119493402902528000/1109135083228643460/1244377006359969843
 */
export const getSbDate = (function() {
  const sbReleaseUnix = 1560275700000;
  const sbYear = 446400000;
  const sbMonth = 37200000;
  const sbDay = 1200000;
  const sbHour = 50000;
  const sbMinute = 8333;
  return function() {
    let timeSinceLaunch = Date.now() - sbReleaseUnix;
    //skyblock started on year 1 month 1 day 1 so add 1 to those
    const year = Math.floor(timeSinceLaunch / sbYear) + 1;
    timeSinceLaunch %= sbYear;

    const month = Math.floor(timeSinceLaunch / sbMonth) + 1;
    timeSinceLaunch %= sbMonth;

    const day = Math.floor(timeSinceLaunch / sbDay) + 1;
    timeSinceLaunch %= sbDay;

    const hour = Math.floor(timeSinceLaunch / sbHour);
    timeSinceLaunch %= sbHour;

    // minutes increases in steps of 10
    const minute = Math.floor(timeSinceLaunch / sbMinute) * 10;

    return { year, month, day, hour, minute };
  };
}());

/**=
 * @param {Item | import ('../../@types/External').JavaClass<'net.minecraft.item.ItemStack'>} item
 * @returns {string}
 */
export function getSbId(item) {
  if (!item) return '';
  return (item.itemStack ? item.itemStack : item).func_77978_p()?.func_74775_l('ExtraAttributes')?.func_74779_i('id');
}

/**
 * @param {string} sbId
 * @returns {number}
 */
export function countItems(sbId) {
  const inv = Player.getInventory();
  if (!inv) return 0;
  return inv.getItems().reduce((a, v) => a + (getSbId(v) === sbId ? v.getStackSize() : 0), 0);
}