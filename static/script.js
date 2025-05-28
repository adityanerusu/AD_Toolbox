// --- DARK MODE LOGIC ---
const darkModeBtn = document.getElementById("darkModeBtn");
const body = document.body;
function setTheme(mode) {
 if (mode === "dark") {
   body.classList.add("dark");
   body.classList.remove("light");
   darkModeBtn.classList.add("active");
 } else {
   body.classList.remove("dark");
   body.classList.add("light");
   darkModeBtn.classList.remove("active");
 }
 localStorage.setItem("theme", mode);
}
if (darkModeBtn) {
 darkModeBtn.addEventListener("click", () => {
   const isDark = body.classList.contains("dark");
   setTheme(isDark ? "light" : "dark");
 });
}
window.onload = function () {
 const theme = localStorage.getItem("theme") || "light";
 setTheme(theme);
 document.querySelectorAll('.animate-in').forEach((el, i) => {
   setTimeout(() => el.classList.add('entry'), (parseFloat(el.style.animationDelay) || i * 120) + 120);
 });
}
// --- WAKE LOCK LOGIC ---
let wakeLock = null;
const wakeBtn = document.getElementById("wakeBtn");
const statusSpan = document.getElementById("status");
function updateWakeUI(active) {
 if (!wakeBtn || !statusSpan) return;
 if (active) {
   wakeBtn.classList.add('active');
   statusSpan.textContent = "Wake Lock active. Screen will stay awake.";
   wakeBtn.querySelector('.wake-text').textContent = "Screen will stay awake";
 } else {
   wakeBtn.classList.remove('active');
   statusSpan.textContent = "Wake Lock off. Screen may sleep.";
   wakeBtn.querySelector('.wake-text').textContent = "Keep screen on";
 }
}
async function requestWakeLock() {
 try {
   wakeLock = await navigator.wakeLock.request("screen");
   wakeLock.addEventListener("release", () => updateWakeUI(false));
   updateWakeUI(true);
 } catch (err) {
   statusSpan.textContent = "Wake Lock not supported or denied.";
   updateWakeUI(false);
 }
}
function releaseWakeLock() {
 if (wakeLock !== null) {
   wakeLock.release();
   wakeLock = null;
   updateWakeUI(false);
 }
}
// Fallback (video hack)
function setupWakeLockHandler() {
 if (!wakeBtn) return;
 if ("wakeLock" in navigator) {
   wakeBtn.addEventListener("click", () => {
     if (!wakeBtn.classList.contains('active')) requestWakeLock();
     else releaseWakeLock();
   });
 } else {
   const video = document.createElement("video");
   video.src = "https://www.w3schools.com/html/mov_bbb.mp4";
   video.muted = true;
   video.loop = true;
   video.style.display = "none";
   document.body.appendChild(video);
   statusSpan.textContent = "Wake Lock API not supported. Fallback active.";
   wakeBtn.addEventListener("click", () => {
     if (!wakeBtn.classList.contains('active')) {
       video.play();
       wakeBtn.classList.add('active');
       statusSpan.textContent = "Fallback: Playing video to keep screen awake.";
       wakeBtn.querySelector('.wake-text').textContent = "Screen will stay awake";
     } else {
       video.pause();
       wakeBtn.classList.remove('active');
       statusSpan.textContent = "Wake Lock off. Screen may sleep.";
       wakeBtn.querySelector('.wake-text').textContent = "Keep screen on";
     }
   });
 }
}
if (wakeBtn) setupWakeLockHandler();
// --- SUMMARIZER LOGIC ---
const summarizeForm = document.getElementById("summarizeForm");
if (summarizeForm) {
 const inputText = document.getElementById("inputText");
 const lengthRange = document.getElementById("lengthRange");
 const lengthValue = document.getElementById("lengthValue");
 const summaryResult = document.getElementById("summaryResult");
 // Update summary length display
 lengthRange.addEventListener("input", () => {
   lengthValue.textContent = lengthRange.value;
 });
 summarizeForm.addEventListener("submit", (e) => {
   e.preventDefault();
   const text = inputText.value;
   const sentCount = parseInt(lengthRange.value);
   if (text.trim().length === 0) return;
   summaryResult.innerHTML = '<div class="loader"></div>';
   setTimeout(() => {
     const summary = summarizeText(text, sentCount);
     summaryResult.innerHTML = `
<h3>Summary:</h3>
<div class="summary-box">${summary}</div>
     `;
   }, 600); // Animation for "thinking"
 });
 function summarizeText(text, sentCount) {
   // Very basic extractive summarizer: pick most "important" sentences (by word length & keyword freq)
   const sentences = text.match(/[^\.!\?]+[\.!\?]+/g) || [text];
   if (sentences.length <= sentCount) return sentences.join(" ");
   // Simple scoring: by length + unique word count
   const wordFreq = {};
   text.toLowerCase().split(/\W+/).forEach(w => { if(w.length>2) wordFreq[w]=(wordFreq[w]||0)+1; });
   const scored = sentences.map(s => {
     const words = s.toLowerCase().split(/\W+/);
     let score = 0;
     words.forEach(w => { score += (wordFreq[w]||0); });
     score += words.length * 0.5; // favor longer
     return { s, score };
   });
   scored.sort((a, b) => b.score - a.score);
   return scored.slice(0, sentCount).map(e => e.s.trim()).join(" ");
 }
}
