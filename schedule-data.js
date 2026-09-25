// 開催日程データ(毎週月曜日0時に申込みフォームの内容から自動更新)
// full: true にすると「満席」と表示され、予約ボタンが押せなくなります
// 開催日を過ぎた回は自動で表示されなくなります
const UPDATED = "2026-09-24";

const EVENTS = [
  { date: "2026-09-27", start: "11:00", end: "12:00", pref: "大阪", city: "寝屋川市", venue: "市民会館", address: "大阪府寝屋川市秦町41-1", full: false },
  { date: "2026-09-27", start: "13:00", end: "14:00", pref: "大阪", city: "枚方市", venue: "総合文化芸術センター別館", address: "大阪府枚方市新町2-1-5", full: false },
  { date: "2026-09-27", start: "15:00", end: "16:00", pref: "大阪", city: "枚方市", venue: "楠葉生涯学習市民センター", address: "大阪府枚方市楠葉並木2-29-5", full: false },
  { date: "2026-10-10", start: "11:00", end: "12:00", pref: "大阪", city: "松原市", venue: "ゆめニティ松原", address: "大阪府松原市上田3-6-1", full: false },
  { date: "2026-10-10", start: "13:00", end: "14:00", pref: "大阪", city: "八尾市", venue: "八尾プリズムホール", address: "大阪府八尾市光町2-40", full: false },
  { date: "2026-10-18", start: "9:30", end: "10:30", pref: "大阪", city: "大阪市", venue: "旭区民センター", address: "大阪市旭区中宮1-11-14", full: false },
  { date: "2026-10-18", start: "11:30", end: "12:30", pref: "大阪", city: "大阪市", venue: "城東区民センター", address: "大阪市城東区中央3-5-45", full: false },
  { date: "2026-10-18", start: "13:30", end: "14:30", pref: "大阪", city: "大阪市", venue: "鶴見区民センター", address: "大阪市鶴見区横堤5-3-15", full: false },
  { date: "2026-11-07", start: "11:00", end: "12:00", pref: "大阪", city: "東大阪市", venue: "文化創造館", address: "大阪府東大阪市御厨南2-3-4", full: false },
  { date: "2026-11-07", start: "13:00", end: "14:00", pref: "大阪", city: "東大阪市", venue: "市民多目的センター", address: "大阪府東大阪市高井田元町1-2-13", full: false },
  { date: "2026-11-08", start: "11:00", end: "12:00", pref: "大阪", city: "大阪市", venue: "平野区民センター", address: "大阪市平野区長吉出戸5-3-58", full: false },
  { date: "2026-11-08", start: "13:00", end: "14:00", pref: "大阪", city: "大阪市", venue: "東住吉会館", address: "大阪市東住吉区東田辺2-11-28", full: false },
  { date: "2026-11-08", start: "15:00", end: "16:00", pref: "大阪", city: "大阪市", venue: "住之江会館", address: "大阪市住之江区南加賀屋3-1-20", full: false },
  { date: "2026-11-22", start: "11:00", end: "12:00", pref: "兵庫", city: "尼崎市", venue: "すこやかプラザ", address: "兵庫県尼崎市七松町1-3-1 フェスタ立花南館5階", full: false },
  { date: "2026-11-22", start: "13:00", end: "14:00", pref: "兵庫", city: "尼崎市", venue: "塚口さんさんタウン", address: "兵庫県尼崎市南塚口町2-1", full: false },
  { date: "2026-11-28", start: "10:30", end: "11:40", pref: "広島", city: "広島市", venue: "南区民文化センター", address: "広島市南区比治山本町16-27", full: false },
  { date: "2026-11-28", start: "13:00", end: "14:10", pref: "広島", city: "広島市", venue: "佐伯区民文化センター", address: "広島市佐伯区五日市中央6-1-10", full: false },
  { date: "2026-11-28", start: "15:30", end: "16:40", pref: "広島", city: "広島市", venue: "東区民文化センター", address: "広島市東区東蟹屋町10-31", full: false },
  { date: "2026-11-29", start: "11:00", end: "12:00", pref: "大阪", city: "大阪市", venue: "港区民センター", address: "大阪市港区磯路1-7-17", full: false },
  { date: "2026-11-29", start: "13:00", end: "14:00", pref: "大阪", city: "大阪市", venue: "西淀川区民会館", address: "大阪市西淀川区大和田2-5-7", full: false },
  { date: "2026-12-05", start: "11:00", end: "12:00", pref: "大阪", city: "大阪市", venue: "東成区民センター", address: "大阪市東成区大今里西3-2-17", full: false },
  { date: "2026-12-12", start: "10:30", end: "11:30", pref: "兵庫", city: "西宮市", venue: "市民・大学共創プラザ", address: "兵庫県西宮市北口町1-2 ACTA西宮東館6階", full: false },
  { date: "2026-12-12", start: "13:00", end: "14:00", pref: "兵庫", city: "宝塚市", venue: "中央公民館", address: "兵庫県宝塚市末広町3-53", full: false },
  { date: "2026-12-12", start: "15:00", end: "16:00", pref: "兵庫", city: "伊丹市", venue: "東リ いたみホール", address: "兵庫県伊丹市宮ノ前1-1-3", full: false },
];
