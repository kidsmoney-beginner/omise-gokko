// 申込みフォームのURL
const FORM_URL = "https://forms.gle/rqD2QmM5DxKUFzcv6";

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

// 日程を選んだ状態でGoogleフォームを開くためのURL
// (フォームの選択肢は「市名 会場名 M月D日㈰ 11:00～12:00」の形。半角スペース区切り)
const PREFILL_BASE = "https://docs.google.com/forms/d/e/1FAIpQLSfetelv97Szc19IsA71HUA94AB-erNb4Kf1Qyy0hOgquhuMHg/viewform?usp=pp_url&entry.382957548=";
const WEEK_MARK = ["㈰", "㈪", "㈫", "㈬", "㈭", "㈮", "㈯"];
const choiceLabel = (e) =>
  `${e.city} ${e.venue} ${e.day.getMonth() + 1}月${e.day.getDate()}日${WEEK_MARK[e.day.getDay()]} ${e.start}～${e.end}`;
const prefillUrl = (e) => PREFILL_BASE + encodeURIComponent(choiceLabel(e));

const linkToForm = (a) => {
  a.href = FORM_URL;
  a.target = "_blank";
  a.rel = "noopener";
};

// ===== 開催日程 =====
const today = new Date();
today.setHours(0, 0, 0, 0);

const events = EVENTS
  .map((e) => ({ ...e, day: new Date(e.date + "T00:00:00") }))
  .filter((e) => e.day >= today)
  .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start, "ja", { numeric: true }));

const listEl = document.getElementById("schedule-list");
const filterEl = document.getElementById("filter");
const prefs = [...new Set(events.map((e) => e.pref))];

// 最初に見せる開催日の数(残りは「もっと見る」で開く)
const FIRST_DAYS = 3;
let expanded = false;
let currentPref = "すべて";

const render = (pref) => {
  currentPref = pref;
  const shown = pref === "すべて" ? events : events.filter((e) => e.pref === pref);
  listEl.innerHTML = "";
  if (!shown.length) {
    listEl.innerHTML = '<p class="schedule__empty">現在、募集中の日程はありません。次回の開催をお待ちください。</p>';
    return;
  }

  // 同じ日の回を1つのまとまりにする
  const days = [];
  shown.forEach((e) => {
    const last = days[days.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else days.push({ date: e.date, day: e.day, items: [e] });
  });

  const visible = expanded ? days : days.slice(0, FIRST_DAYS);
  visible.forEach((d) => {
    const group = document.createElement("div");
    group.className = "day";
    group.innerHTML = `
      <p class="day__head">${d.day.getMonth() + 1}月${d.day.getDate()}日<span class="day__week">(${WEEK[d.day.getDay()]})</span></p>
      <ul class="day__list">
        ${d.items.map((e) => {
          const map = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(e.address || e.city + " " + e.venue);
          return `
          <li class="slot${e.full ? " is-full" : ""}">
            <span class="slot__time">${e.start}<small>〜${e.end}</small></span>
            <span class="slot__place">
              <span class="slot__venue">${e.city} ${e.venue}</span>
              <a class="slot__map" href="${map}" target="_blank" rel="noopener" title="${e.address}">地図</a>
            </span>
            ${e.full
              ? '<span class="slot__btn is-disabled" aria-disabled="true">満席</span>'
              : `<a class="slot__btn" href="${prefillUrl(e)}" target="_blank" rel="noopener">予約</a>`}
          </li>`;
        }).join("")}
      </ul>`;
    listEl.appendChild(group);
  });

  if (days.length > FIRST_DAYS) {
    const rest = days.slice(FIRST_DAYS).reduce((n, d) => n + d.items.length, 0);
    const more = document.createElement("button");
    more.type = "button";
    more.className = "more";
    more.textContent = expanded ? "日程を閉じる" : `ほかの日程も見る(あと${rest}回)`;
    more.addEventListener("click", () => {
      expanded = !expanded;
      render(currentPref);
      if (!expanded) document.getElementById("schedule").scrollIntoView();
    });
    listEl.appendChild(more);
  }
};

["すべて", ...prefs].forEach((p, i) => {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "filter__btn" + (i === 0 ? " is-active" : "");
  b.textContent = p;
  b.addEventListener("click", () => {
    filterEl.querySelectorAll(".filter__btn").forEach((x) => x.classList.remove("is-active"));
    b.classList.add("is-active");
    expanded = false;
    render(p);
  });
  filterEl.appendChild(b);
});
if (prefs.length < 2) filterEl.hidden = true;

render("すべて");

// 最初の画面に「次回開催」を表示(同じ日の市名をまとめる)
if (events.length) {
  const first = events[0];
  const sameDay = events.filter((e) => e.date === first.date);
  const cities = [...new Set(sameDay.map((e) => e.city))].join("・");
  document.getElementById("next-text").textContent =
    `${first.day.getMonth() + 1}月${first.day.getDate()}日(${WEEK[first.day.getDay()]}) ${cities}`;
  document.getElementById("next").hidden = false;
}

document.getElementById("area-list").textContent = prefs.join("・") || "各地";
document.getElementById("event-count").textContent = events.length;
document.getElementById("updated").textContent = UPDATED.replace(/^(\d+)-0?(\d+)-0?(\d+)$/, "$1年$2月$3日");

document.querySelectorAll("[data-form]").forEach(linkToForm);

// ===== 電話番号のコピー =====
const copyBtn = document.getElementById("copy-tel");
const telEl = document.getElementById("tel");
copyBtn.addEventListener("click", () => {
  const done = () => { copyBtn.textContent = "コピーしました"; setTimeout(() => (copyBtn.textContent = "番号をコピー"), 2000); };
  const selectText = () => {
    const r = document.createRange();
    r.selectNodeContents(telEl);
    const s = window.getSelection();
    s.removeAllRanges();
    s.addRange(r);
    copyBtn.textContent = "番号を選択しました";
  };
  if (navigator.clipboard) {
    navigator.clipboard.writeText(telEl.textContent.trim()).then(done, selectText);
  } else {
    selectText();
  }
});

// ===== スマホ:最初の画面を過ぎたら、画面下に予約ボタンを出す(日程エリアでは隠す) =====
const sticky = document.querySelector(".sticky-cta");
const hero = document.querySelector(".hero");
const schedule = document.querySelector("#schedule");
let pastHero = false;
let atSchedule = false;
const update = () => sticky.classList.toggle("is-show", pastHero && !atSchedule);

new IntersectionObserver(([e]) => { pastHero = !e.isIntersecting; update(); }).observe(hero);
new IntersectionObserver(([e]) => { atSchedule = e.isIntersecting; update(); }).observe(schedule);
