/*
  The pop-up viewer: opens a piece larger when someone selects it, shows any
  extra photos of it, and flips to the previous or next piece in the same
  group with the buttons or the arrow keys. Pieces with an artist statement
  show a link to it. Without JavaScript, selecting a piece opens its photo,
  or its statement page if it has one.
*/
(function () {
  "use strict";
  var dlg = document.getElementById("viewer");
  if (!dlg || typeof dlg.showModal !== "function") { return; }

  var pics = dlg.querySelector(".viewer-pics");
  var caption = dlg.querySelector(".viewer-caption");
  var count = dlg.querySelector(".viewer-count");
  var closeBtn = dlg.querySelector("[data-close]");
  var group = [];
  var index = 0;

  function photosFor(link) {
    var img = link.querySelector("img");
    var list = [{ src: link.getAttribute("data-full") || link.getAttribute("href"), alt: img ? img.alt : "" }];
    (link.getAttribute("data-more") || "").split(";").forEach(function (part) {
      var bits = part.split("|");
      if (bits[0] && bits[0].trim()) {
        list.push({ src: bits[0].trim(), alt: (bits[1] || "").trim() });
      }
    });
    return list;
  }

  function render() {
    var link = group[index];
    var photos = photosFor(link);
    pics.innerHTML = "";
    photos.forEach(function (p) {
      var img = document.createElement("img");
      img.src = p.src;
      img.alt = p.alt;
      img.decoding = "async";
      pics.appendChild(img);
    });
    pics.scrollTop = 0;
    var cap = link.parentNode.querySelector("figcaption");
    caption.innerHTML = cap ? cap.innerHTML : "";
    if (photos.length > 1) {
      var hint = document.createElement("p");
      hint.className = "viewer-hint";
      hint.textContent = "This piece has " + photos.length + " photos. Scroll to see them all.";
      caption.appendChild(hint);
    }
    count.textContent = (index + 1) + " of " + group.length;
  }

  function open(link) {
    group = Array.prototype.slice.call(link.closest(".gallery").querySelectorAll(".work-pic"));
    index = group.indexOf(link);
    render();
    document.documentElement.classList.add("viewing");
    dlg.showModal();
    closeBtn.focus();
  }

  function go(step) {
    index = (index + step + group.length) % group.length;
    render();
  }

  document.addEventListener("click", function (e) {
    var link = e.target.closest ? e.target.closest(".work-pic") : null;
    if (!link || e.metaKey || e.ctrlKey || e.shiftKey) { return; }
    e.preventDefault();
    open(link);
  });

  dlg.addEventListener("click", function (e) {
    var btn = e.target.closest("button");
    if (btn && btn.hasAttribute("data-go")) { go(parseInt(btn.getAttribute("data-go"), 10)); return; }
    if (btn && btn.hasAttribute("data-close")) { dlg.close(); return; }
    if (e.target === dlg || e.target === pics) { dlg.close(); }
  });

  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
  });

  dlg.addEventListener("close", function () {
    document.documentElement.classList.remove("viewing");
    if (group[index]) { group[index].focus({ preventScroll: false }); }
  });
})();
