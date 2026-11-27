/*
  Two small things that run on every page:
  1. The back button on artist statement pages returns you to the page you
     came from.
  2. A hidden knight. Type the Konami code on a keyboard
     (up up down down left right left right B A) and he comes on.
*/
(function () {
  "use strict";

  /* ---------- 1. back button ---------- */
  // Goes to the previous page. If there isn't one (someone typed the address
  // or used a bookmark), the link takes them to Selected Work instead.
  var back = document.querySelector("[data-back]");
  if (back) {
    back.addEventListener("click", function (e) {
      if (document.referrer && history.length > 1) { e.preventDefault(); history.back(); }
    });
  }

  /* ---------- 2. the knight ---------- */
  // Sprite: "Fantasy Knight" by aamatniekss (itch.io), lighter colour with
  // outline. knight.png holds 42 frames side by side, each 82 x 43 pixels:
  // 0-9 run, 10-19 the two-hit attack combo, 20-29 idle, 30-41 roll.
  var FW = 82, FH = 43, SCALE = 4, TOTAL = 42;
  var RUN = [0, 10], COMBO = [10, 20], IDLE = [20, 30], ROLL = [31, 40]; // roll skips the getting-up frames
  var BODY_CX = 31 * SCALE;   // the knight's middle, measured from the frame's left edge
  var running = false;

  function summon() {
    if (running) { return; }
    running = true;
    var img = new Image();
    img.onload = start;
    img.onerror = function () { running = false; };
    img.src = "knight.png";
  }

  function start() {
    var knight = document.createElement("div");
    knight.className = "knight";
    knight.setAttribute("aria-hidden", "true");
    knight.innerHTML = '<div class="knight-body"></div><p class="knight-says">Huzzah!</p>';
    document.body.appendChild(knight);
    var body = knight.querySelector(".knight-body");
    var says = knight.querySelector(".knight-says");
    body.style.width = FW * SCALE + "px";
    body.style.height = FH * SCALE + "px";
    body.style.backgroundSize = FW * SCALE * TOTAL + "px " + FH * SCALE + "px";
    says.style.left = BODY_CX + "px";

    var timer = null;
    function show(i) { body.style.backgroundPosition = (-i * FW * SCALE) + "px 0"; }
    function play(range, ms, loop, then) {
      clearInterval(timer);
      var i = range[0];
      show(i);
      timer = setInterval(function () {
        i++;
        if (i >= range[1]) {
          if (loop) { i = range[0]; }
          else { clearInterval(timer); if (then) { then(); } return; }
        }
        show(i);
      }, ms);
    }
    function done() { clearInterval(timer); knight.remove(); running = false; }

    var startX = -FW * SCALE;
    var midX = Math.round(window.innerWidth / 2 - BODY_CX);
    var endX = window.innerWidth + 20;

    if (window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      knight.style.transform = "translateX(" + midX + "px)";
      show(IDLE[0]);
      says.classList.add("show");
      knight.animate([{ opacity: 0 }, { opacity: 1, offset: 0.15 }, { opacity: 1, offset: 0.85 }, { opacity: 0 }],
        { duration: 3000 }).onfinish = done;
      return;
    }

    // come in from the left
    play(RUN, 75, true);
    knight.animate([{ transform: "translateX(" + startX + "px)" }, { transform: "translateX(" + midX + "px)" }],
      { duration: 1900, easing: "linear", fill: "forwards" }).onfinish = function () {
      // two-hit combo while he shouts
      says.classList.add("show");
      play(COMBO, 90, false, function () {
        // catch his breath
        play(IDLE, 100, true);
        setTimeout(function () {
          says.classList.remove("show");
          // roll out
          play(ROLL, 65, true);
          knight.animate([{ transform: "translateX(" + midX + "px)" }, { transform: "translateX(" + endX + "px)" }],
            { duration: 1400, easing: "linear", fill: "forwards" }).onfinish = done;
        }, 900);
      });
    };
  }

  var CODE = "ArrowUp ArrowUp ArrowDown ArrowDown ArrowLeft ArrowRight ArrowLeft ArrowRight b a";
  var typed = [];
  document.addEventListener("keydown", function (e) {
    var k = e.key && e.key.length === 1 ? e.key.toLowerCase() : e.key;
    typed.push(k);
    if (typed.length > 10) { typed.shift(); }
    if (typed.join(" ") === CODE) { typed = []; summon(); }
  });
})();
