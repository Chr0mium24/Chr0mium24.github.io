// 示例数据：结构照原文代码解析的字段编（code / message / data[].roomSn / resvInfo[].startTime,endTime 毫秒）。
// 房间号和预约都是编的，固定种子，每次一样。
export const KINDS = {
  oldlib_quietroom: { id: 101766982, name: '旧馆安静室', prefix: 'OQ' },
  oldlib_groupstudyroom: { id: 101420505, name: '旧馆小组室', prefix: 'OG' },
  newlib_quietroom: { id: 101505911, name: '新馆安静室', prefix: 'NQ' },
  newlib_groupstudyroom: { id: 100462149, name: '新馆小组室', prefix: 'NG' },
};
export const DATE = '2025-04-01';
const DAY0 = Date.parse(DATE + 'T00:00:00+08:00');   // 当天 0 点（GMT+8）的毫秒时间戳

function rng(seed) { return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

export function fakeResponse(kind) {
  const k = KINDS[kind], r = rng(k.id);
  const data = [];
  for (let i = 1; i <= 5; i++) {
    const resvInfo = [];
    let h = 8 + Math.floor(r() * 3) * .5;
    while (h < 21) {
      const len = 1 + Math.floor(r() * 4) * .5;         // 一次约 1–2.5 小时
      if (r() < .6) resvInfo.push({ startTime: DAY0 + h * 3600e3, endTime: DAY0 + Math.min(22, h + len) * 3600e3 });
      h += len + Math.floor(r() * 3) * .5;
    }
    data.push({ roomSn: `${k.prefix}${100 + i}`, resvInfo });
  }
  return { code: 0, message: '查询成功', data };
}

// 照搬原文 timestamp_to_gmt8_time_of_day：毫秒 → 秒 → UTC → GMT+8 → "HH:MM:SS"
export function toGmt8(ms) {
  if (typeof ms !== 'number' || !isFinite(ms)) return null;
  return new Date(ms + 8 * 3600e3).toISOString().slice(11, 19);
}

// 照搬原文 fetch_room_reservations 里解析的那段
export function parse(resp) {
  if (!(resp.code === 0 && resp.message === '查询成功')) return null;
  const reservations = {};
  for (const room of resp.data) {
    for (const reserve of room.resvInfo) {
      (reservations[room.roomSn] ??= []).push({ startTime: toGmt8(reserve.startTime), endTime: toGmt8(reserve.endTime) });
    }
    reservations[room.roomSn] ??= [];
  }
  return reservations;
}
export const hm = t => t.slice(0, 5);
export const toH = t => +t.slice(0, 2) + +t.slice(3, 5) / 60;
