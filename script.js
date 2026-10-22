// 申込みフォームのURL
const FORM_URL = "https://forms.gle/rqD2QmM5DxKUFzcv6";

// 広告の目印をフォームの任意回答へ引き継ぐ。個人情報は保存しない。
const SOURCE_ENTRY = "entry.600638058";
const SOURCE_STORAGE = "kidsmoney_referral_v3";
const SOURCE_TTL = 7 * 24 * 60 * 60 * 1000;
const referralLabel = (search) => {
  const p = new URLSearchParams(search);
  const source = (p.get("utm_source") || "").toLowerCase();
  if (!["instagram", "ig"].includes(source)) return "";
  const paid = ["paid_social", "paid", "cpc"].includes((p.get("utm_medium") || "").toLowerCase());
  if (!paid) return "Instagram（投稿・プロフィール）";
  const labels = { ad_a: "Instagram広告（①伝え方）", ad_b: "Instagram広告（②電子マネー）" };
  const creative = labels[p.get("utm_content")];
  return creative || "Instagram広告";
};
const getReferral = () => {
  const p = new URLSearchParams(window.location.search);
  const incoming = referralLabel(window.location.search);
  const knownLabels = ["Instagram広告", "Instagram広告（①伝え方）", "Instagram広告（②電子マネー）", "Instagram（投稿・プロフィール）"];
  try {
    // 別の流入元が明示されたら、以前の広告の目印を上書きする。
    if (p.has("utm_source")) {
      if (incoming) sessionStorage.setItem(SOURCE_STORAGE, JSON.stringify({ label: incoming, at: Date.now() }));
      else sessionStorage.removeItem(SOURCE_STORAGE);
      return incoming;
    }
    const saved = JSON.parse(sessionStorage.getItem(SOURCE_STORAGE) || "null");
    if (saved && knownLabels.includes(saved.label) && Number.isFinite(saved.at) && Date.now() - saved.at >= 0 && Date.now() - saved.at < SOURCE_TTL) return saved.label;
    sessionStorage.removeItem(SOURCE_STORAGE);
  } catch (_) { /* 保存できなくても、今回のリンクの目印は引き継ぐ。 */ }
  return incoming;
};
const REFERRAL = getReferral();
const withReferral = (url) => {
  if (!REFERRAL) return url;
  const result = new URL(url);
  result.searchParams.set(SOURCE_ENTRY, REFERRAL);
  return result.href;
};

const WEEK = ["日", "月", "火", "水", "木", "金", "土"];

// 日程を選んだ状態でGoogleフォームを開くためのURL
// (フォームの選択肢は「市名 会場名 M月D日㈰ 11:00～12:00」の形。半角スペース区切り)
const PREFILL_BASE = "https://docs.google.com/forms/d/e/1FAIpQLSfetelv97Szc19IsA71HUA94AB-erNb4Kf1Qyy0hOgquhuMHg/viewform?usp=pp_url&entry.382957548=";
const WEEK_MARK = ["㈰", "㈪", "㈫", "㈬", "㈭", "㈮", "㈯"];
const choiceLabel = (e) =>
  `${e.city} ${e.venue} ${e.day.getMonth() + 1}月${e.day.getDate()}日${WEEK_MARK[e.day.getDay()]} ${e.start}～${e.end}`;
const prefillUrl = (e) => withReferral(PREFILL_BASE + encodeURIComponent(choiceLabel(e)));

const linkToForm = (a) => {
  a.href = REFERRAL ? withReferral(PREFILL_BASE.slice(0, PREFILL_BASE.indexOf("&entry."))) : FORM_URL;
  a.target = "_blank";
  a.rel = "noopener";
};

// ===== 開催日程 =====
const now = new Date();

const events = EVENTS
  .map((e) => ({ ...e, day: new Date(e.date + "T00:00:00") }))
  .filter((e) => new Date(`${e.date}T${e.start.padStart(5, "0")}:00+09:00`) > now)
  .sort((a, b) => a.day - b.day || a.start.localeCompare(b.start, "ja", { numeric: true }));

const listEl = document.getElementById("schedule-list");
const filterEl = document.getElementById("filter");
const prefs = [...new Set(events.map((e) => e.pref))];

// 最初に見せる開催日の数(残りは「もっと見る」で開く)
const FIRST_DAYS = 3;
let expanded = false;
let currentPref = "すべて";
let currentCity = "";
let currentMonth = "";
const measure = (name, values = {}) => {
  if (typeof window.gtag === 'function') window.gtag('event', name, values);
};

const render = (pref) => {
  currentPref = pref;
  updateCityOptions(pref);
  const shown = events.filter(e => (pref === "すべて" || e.pref === pref) && (!currentCity || e.city === currentCity) && (!currentMonth || e.date.slice(0,7) === currentMonth));
  listEl.innerHTML = "";
  if (!shown.length) {
    listEl.innerHTML = '<p class="schedule__empty">この条件の募集中日程はありません。市・月・地域の条件を変更してください。</p>';
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
              <a class="slot__map" href="${map}" target="_blank" rel="noopener" title="${e.address}">地図を開く</a><details class="slot-access"><summary>会場アクセス</summary><p>${e.address || e.city + " " + e.venue}</p><a href="${map}" target="_blank" rel="noopener">地図で行き方を調べる</a></details>
            </span>
            ${e.full
              ? '<span class="slot__btn is-disabled" aria-disabled="true">満席</span>'
              : `<a class="slot__btn" data-event-date="${e.date}" data-region="${e.pref}" data-venue="${e.city} ${e.venue}" href="${prefillUrl(e)}" target="_blank" rel="noopener">無料で予約</a>`}
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
      measure('schedule_expand', {region: currentPref, expanded: expanded});
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
    currentCity = "";
    document.getElementById("city-filter").value = "";
    render(p);
    measure('region_select', {region: p, button_location: 'schedule'});
  });
  filterEl.appendChild(b);
});
if (prefs.length < 2) filterEl.hidden = true;

const cityFilter = document.getElementById('city-filter');
const monthFilter = document.getElementById('month-filter');
function updateCityOptions(pref) {
  const cities = [...new Set(events.filter(e => pref === 'すべて' || e.pref === pref).map(e => e.city))].sort((a,b) => a.localeCompare(b,'ja'));
  if (!cities.includes(currentCity)) currentCity = '';
  cityFilter.replaceChildren(new Option('すべての市', ''));
  cities.forEach(city => cityFilter.add(new Option(city, city)));
  cityFilter.value = currentCity;
}
[...new Set(events.map(e => e.date.slice(0,7)))].forEach(month => monthFilter.add(new Option(month.replace(/(\d+)-(\d+)/,'$1年$2月'),month)));
cityFilter.addEventListener('change', () => {
  currentCity = cityFilter.value; expanded = false;
  render(currentPref); measure('schedule_filter',{filter_type:'city',city:currentCity});
});
monthFilter.addEventListener('change', () => { currentMonth = monthFilter.value; expanded = false; render(currentPref); measure('schedule_filter',{filter_type:'month',month:currentMonth}); });

render("すべて");

// 最初の画面から地域を選び、該当地域の日程へ移動する。
const regionEntry = document.getElementById('region-entry');
if (regionEntry) prefs.forEach((pref) => {
  const first = events.find((e) => e.pref === pref && !e.full);
  if (!first) return;
  const a = document.createElement('a');
  a.className = 'region-entry__link';
  a.href = '#schedule';
  a.innerHTML = `<strong>${pref}</strong><span>${first.day.getMonth()+1}/${first.day.getDate()}(${WEEK[first.day.getDay()]})〜</span>`;
  a.addEventListener('click', () => {
    expanded = false;
    currentCity = ""; currentMonth = "";
    document.getElementById("city-filter").value = "";
    document.getElementById("month-filter").value = "";
    render(pref);
    filterEl.querySelectorAll('.filter__btn').forEach((b) => {
      b.classList.toggle('is-active', b.textContent === pref);
      b.setAttribute('aria-pressed', String(b.textContent === pref));
    });
    measure('region_select', {region: pref, button_location: 'hero'});
  });
  regionEntry.appendChild(a);
});

document.querySelectorAll('a[href="#schedule"]').forEach((a) => {
  a.addEventListener('click', () => measure('schedule_open', {
    region: currentPref,
    button_location: a.closest('.hero') ? 'hero' : (a.closest('.sticky-cta') ? 'sticky' : 'page')
  }));
});
let measuredSchedule = false;
new IntersectionObserver(([entry], observer) => {
  if (entry.isIntersecting && !measuredSchedule) {
    measuredSchedule = true;
    measure('schedule_view', {region: currentPref});
    observer.disconnect();
  }
}, {threshold: 0.5}).observe(document.querySelector('#schedule .section__title'));

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

document.addEventListener('click', e => {
  if (e.target.closest('a[href^="tel:"]')) measure('tel_click');
});
document.querySelector('#organizer details')?.addEventListener('toggle', e => {
  if (e.target.open) measure('support_view');
});
