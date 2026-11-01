const MYSPENSAB_URL    = "https://aventra-x-2026-web-bydandi.netlify.app/";
const GOOGLE_CLIENT_ID = ""

const $ = id => document.getElementById(id);
const WEB = MYSPENSAB_URL.replace(/\/?$/, "/");

/* ---- Pengguna (disimpan di browser) ---- */
const getU = () => { try { return JSON.parse(localStorage.getItem("ms_user")); } catch (e) { return null; } };
const setU = u => { try { u ? localStorage.setItem("ms_user", JSON.stringify(u)) : localStorage.removeItem("ms_user"); } catch (e) {} };
function jwt(t){
  const b = t.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
  return JSON.parse(decodeURIComponent(atob(b).split("").map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2)).join("")));
}

/* ---- Deteksi perangkat ---- */
const ua = navigator.userAgent;
const dev = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1) ? "ios"
          : /android/i.test(ua) ? "android" : "pc";
function tab(t){
  ["android", "ios", "pc"].forEach(k => $("t-" + k).classList.toggle("hide", k !== t));
  document.querySelectorAll(".tab").forEach(b => b.setAttribute("aria-selected", b.dataset.t === t));
}
document.querySelectorAll(".tab").forEach(b => b.onclick = () => tab(b.dataset.t));

/* ---- Navbar kiri di ponsel ---- */
const setMenu = open => { document.body.classList.toggle("open", open); $("menu").setAttribute("aria-expanded", open); };
$("menu").onclick = () => setMenu(!document.body.classList.contains("open"));
$("scrim").onclick = () => setMenu(false);

/* ---- Tampilan ---- */
const VIEWS = { beranda: "home", pasang: "install", bantuan: "help" };
function show(){
  const u = getU();
  const key = (location.hash || "#beranda").slice(1);
  const v = u ? (VIEWS[key] || "home") : "login";

  ["login", "home", "install", "help"].forEach(n => $("v-" + n).classList.toggle("hide", n !== v));
  document.querySelector(".side").classList.toggle("locked", !u);
  $("me").classList.toggle("hide", !u);
  $("menu").classList.toggle("hide", !u);
  $("lockhint").classList.toggle("hide", !!u);

  document.querySelectorAll("nav a[data-v]").forEach(a => {
    if (a.dataset.v === v) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  if (u){
    $("hi").textContent = (u.name || u.email || "").split(" ")[0];
    $("uname").textContent = u.name || u.email;
    $("umail").textContent = u.email || "";
    $("avatar").src = u.picture || "";
    $("avatar").classList.toggle("hide", !u.picture);
    $("navWeb").href = $("goWeb").href = WEB;
    $("goInstall").href = WEB + "?pasang=1";
    tab(dev);
    $("tbInit").textContent = (u.name || u.email || "?").trim().charAt(0).toUpperCase();
    $("menu").style.backgroundImage = u.picture ? "url(" + u.picture + ")" : "";
    if (u.picture) $("tbInit").textContent = "";
    $("statMail").textContent = u.email || "-";
    $("devName").textContent = { ios: "iPhone / iPad", android: "Android", pc: "Laptop" }[dev];
    const br = /edg/i.test(ua) ? "Edge" : /opr|opera/i.test(ua) ? "Opera" : /firefox|fxios/i.test(ua) ? "Firefox"
             : /crios|chrome/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : "Browser";
    const ok = dev === "ios" ? br === "Safari" : (br === "Chrome" || br === "Edge");
    $("brName").textContent = br;
    $("brOk").textContent = ok ? "Cocok untuk memasang" : (dev === "ios" ? "Buka di Safari" : "Pakai Chrome atau Edge");
    $("brOk").className = "pill " + (ok ? "good" : "warn");
  } else {
    $("navWeb").removeAttribute("href");
    startLogin();
  }
  window.scrollTo(0, 0);
}

/* ---- Login Google (wajib) ---- */
function startLogin(){
  if (GOOGLE_CLIENT_ID){
    if (window.google && google.accounts){
      google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: r => { const p = jwt(r.credential); setU({ name: p.name, email: p.email, picture: p.picture }); location.hash = "#beranda"; show(); }
      });
      $("gbtn").innerHTML = "";
      google.accounts.id.renderButton($("gbtn"), { theme: "filled_blue", size: "large", shape: "pill", locale: "id" });
    } else setTimeout(startLogin, 800);
  } else {
    $("demo").classList.remove("hide");
    $("demoNote").classList.remove("hide");
  }
}
$("demo").onclick = () => { setU({ name: "Pengguna Uji", email: "uji@gmail.com" }); location.hash = "#beranda"; show(); };
$("logout").onclick = () => {
  setU(null);
  if (window.google && google.accounts) google.accounts.id.disableAutoSelect();
  location.hash = "#beranda"; setMenu(false); show();
};

addEventListener("hashchange", () => { setMenu(false); show(); });
show();

/* ---- Kilau kaca mengikuti kursor / sentuhan ---- */
["pointermove", "pointerdown"].forEach(ev => document.addEventListener(ev, e => {
  const g = e.target.closest && e.target.closest(".glass");
  if (!g) return;
  const r = g.getBoundingClientRect();
  g.style.setProperty("--mx", (e.clientX - r.left) + "px");
  g.style.setProperty("--my", (e.clientY - r.top) + "px");
}));