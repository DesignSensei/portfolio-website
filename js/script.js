(function () {
  "use strict";

  /* ---------------- page transition loader ---------------- */
  var pageLoader = document.getElementById("page-loader");
  if (pageLoader) {
    window.addEventListener("load", function () {
      setTimeout(function () {
        pageLoader.classList.add("hidden");
      }, 150);
    });

    document.addEventListener("click", function (e) {
      var link = e.target.closest("a[href]");
      if (!link) return;
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (
        link.target === "_blank" ||
        href.indexOf("mailto:") === 0 ||
        /^https?:\/\//.test(href)
      )
        return;
      e.preventDefault();
      pageLoader.classList.remove("hidden");
      setTimeout(function () {
        window.location.href = href;
      }, 380);
    });
  }

  /* ---------------- homepage widgets ---------------- */
  var nowDateEl = document.getElementById("now-date");
  if (nowDateEl) {
    nowDateEl.textContent = new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(new Date());
  }

  var tzOwnerEl = document.getElementById("tz-owner");
  var tzVisitorEl = document.getElementById("tz-visitor");
  var tzDiffEl = document.getElementById("tz-diff");
  var tzVisitorGmtEl = document.getElementById("tz-visitor-gmt");

  if (tzOwnerEl && tzVisitorEl && tzDiffEl) {
    var LAGOS_TZ = "Africa/Lagos";
    var LAGOS_UTC_OFFSET_MIN = 60; // Nigeria is UTC+1 year-round, no DST

    function renderTimezones() {
      var now = new Date();

      tzOwnerEl.textContent = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: LAGOS_TZ,
      }).format(now);

      tzVisitorEl.textContent = new Intl.DateTimeFormat(undefined, {
        hour: "2-digit",
        minute: "2-digit",
      }).format(now);

      var visitorOffsetMin = -now.getTimezoneOffset(); // minutes east of UTC

      if (tzVisitorGmtEl) {
        var sign = visitorOffsetMin >= 0 ? "+" : "-";
        var absMin = Math.abs(visitorOffsetMin);
        var wholeHours = Math.floor(absMin / 60);
        var minutesPart = absMin % 60;
        tzVisitorGmtEl.textContent =
          "GMT" +
          sign +
          wholeHours +
          (minutesPart
            ? ":" + (minutesPart < 10 ? "0" : "") + minutesPart
            : "");
      }

      var diffHours = Math.round(
        (LAGOS_UTC_OFFSET_MIN - visitorOffsetMin) / 60,
      );

      if (diffHours === 0) {
        tzDiffEl.textContent = "same time as you";
      } else if (diffHours > 0) {
        tzDiffEl.textContent = diffHours + "h ahead of you";
      } else {
        tzDiffEl.textContent = Math.abs(diffHours) + "h behind you";
      }
    }

    renderTimezones();
    setInterval(renderTimezones, 15000);
  }

  /* ---------------- practice interval timer ---------------- */
  var phaseEl = document.getElementById("timer-phase");
  var displayEl = document.getElementById("timer-display");
  var startBtn = document.getElementById("timer-start");
  var pauseBtn = document.getElementById("timer-pause");
  var resetBtn = document.getElementById("timer-reset");
  var workInput = document.getElementById("timer-work");
  var restInput = document.getElementById("timer-rest");

  if (phaseEl && displayEl && startBtn) {
    var timerId = null;
    var phase = "ready"; // ready | work | rest
    var remaining = parseInt(workInput.value, 10) || 30;

    function formatTime(totalSeconds) {
      var m = Math.floor(totalSeconds / 60);
      var s = totalSeconds % 60;
      return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
    }

    function render() {
      displayEl.textContent = formatTime(remaining);
      phaseEl.textContent = phase;
    }

    function tick() {
      remaining -= 1;
      if (remaining <= 0) {
        if (phase === "work") {
          phase = "rest";
          remaining = parseInt(restInput.value, 10) || 15;
        } else {
          phase = "work";
          remaining = parseInt(workInput.value, 10) || 30;
        }
      }
      render();
    }

    startBtn.addEventListener("click", function () {
      if (timerId) return;
      if (phase === "ready") {
        phase = "work";
        remaining = parseInt(workInput.value, 10) || 30;
        render();
      }
      timerId = setInterval(tick, 1000);
    });

    pauseBtn.addEventListener("click", function () {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
    });

    resetBtn.addEventListener("click", function () {
      if (timerId) {
        clearInterval(timerId);
        timerId = null;
      }
      phase = "ready";
      remaining = parseInt(workInput.value, 10) || 30;
      render();
    });

    render();
  }

  /* ---------------- french flashcards ---------------- */
  var card = document.getElementById("flashcard");
  var front = document.getElementById("flashcard-front");
  var prevBtn = document.getElementById("flashcard-prev");
  var nextBtn = document.getElementById("flashcard-next");

  if (card && front && prevBtn && nextBtn) {
    var deck = [
      { fr: "bonjour", en: "hello" },
      { fr: "merci", en: "thank you" },
      { fr: "s'il vous plaît", en: "please" },
      { fr: "construire", en: "to build" },
      { fr: "apprendre", en: "to learn" },
      { fr: "la santé", en: "health" },
      { fr: "le remède", en: "the remedy" },
      { fr: "le courage", en: "courage" },
      { fr: "toujours", en: "always" },
      { fr: "encore", en: "again / still" },
    ];
    var idx = 0;
    var flipped = false;

    function renderCard() {
      flipped = false;
      front.textContent = deck[idx].fr;
    }

    function flipCard() {
      flipped = !flipped;
      front.textContent = flipped ? deck[idx].en : deck[idx].fr;
    }

    card.addEventListener("click", flipCard);
    card.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        flipCard();
      }
    });

    prevBtn.addEventListener("click", function () {
      idx = (idx - 1 + deck.length) % deck.length;
      renderCard();
    });
    nextBtn.addEventListener("click", function () {
      idx = (idx + 1) % deck.length;
      renderCard();
    });

    renderCard();
  }

  /* ---------------- hover sound effect ---------------- */
  (function () {
    var audioCtx = null;

    document.addEventListener(
      "click",
      function unlockAudio() {
        if (!audioCtx) {
          var AC = window.AudioContext || window.webkitAudioContext;
          if (AC) audioCtx = new AC();
        } else if (audioCtx.state === "suspended") {
          audioCtx.resume();
        }
        document.removeEventListener("click", unlockAudio);
      },
      { once: true },
    );

    function playHoverTick() {
      if (!audioCtx) {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        audioCtx = new AC();
      }
      if (audioCtx.state === "suspended") audioCtx.resume();

      var osc = audioCtx.createOscillator();
      var gain = audioCtx.createGain();
      osc.type = "sine";
      osc.frequency.value = 720;
      gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        audioCtx.currentTime + 0.08,
      );
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.08);
    }

    document.querySelectorAll(".card").forEach(function (card) {
      card.addEventListener("mouseenter", playHoverTick);
    });
  })();

  /* ---------------- project showcase carousel ---------------- */
  var showcaseImgs = document.querySelectorAll(".showcase-img");
  if (showcaseImgs.length > 1) {
    var showcaseIdx = 0;
    setInterval(function () {
      showcaseImgs[showcaseIdx].classList.remove("active");
      showcaseIdx = (showcaseIdx + 1) % showcaseImgs.length;
      showcaseImgs[showcaseIdx].classList.add("active");
    }, 4000);
  }

  /* ---------------- case study accordions ---------------- */
  document
    .querySelectorAll(".case-section[data-expandable]")
    .forEach(function (section) {
      var toggle = section.querySelector(".case-toggle");
      var icon = section.querySelector(".case-toggle-icon");
      if (!toggle) return;
      toggle.addEventListener("click", function () {
        var expanded = section.classList.toggle("expanded");
        toggle.firstChild.textContent = expanded ? "Collapse " : "Read more ";
        if (icon) icon.textContent = expanded ? "−" : "+";
      });
    });

  /* ---------------- resume tabs ---------------- */
  var resumeTabs = document.querySelectorAll(".resume-tab");
  if (resumeTabs.length) {
    resumeTabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        var target = tab.getAttribute("data-tab");
        resumeTabs.forEach(function (t) {
          t.classList.toggle("active", t === tab);
        });
        document.querySelectorAll(".resume-panel").forEach(function (panel) {
          panel.classList.toggle(
            "active",
            panel.getAttribute("data-panel") === target,
          );
        });
      });
    });
  }

  /* ---------------- resume collapsible entries ---------------- */
  document
    .querySelectorAll(".resume-card[data-expandable]")
    .forEach(function (card) {
      var head = card.querySelector(".resume-card-head");
      var icon = card.querySelector(".resume-toggle-icon");
      head.addEventListener("click", function () {
        var expanded = card.classList.toggle("expanded");
        if (icon) icon.textContent = expanded ? "\u2212" : "+";
      });
    });

  /* ---------------- design works nav card: crossfading thumbnails ---------------- */
  var designBgImgs = document.querySelectorAll(".bg-design-works .bg-fade");
  if (designBgImgs.length > 1) {
    var designBgIdx = 0;
    setInterval(function () {
      designBgImgs[designBgIdx].classList.remove("active");
      designBgIdx = (designBgIdx + 1) % designBgImgs.length;
      designBgImgs[designBgIdx].classList.add("active");
    }, 3000);
  }

  /* ---------------- share links ---------------- */
  var shareLinks = document.querySelectorAll("[data-share]");
  if (shareLinks.length) {
    var pageUrl = encodeURIComponent(window.location.href);
    var pageTitle = encodeURIComponent(document.title);
    shareLinks.forEach(function (link) {
      var platform = link.getAttribute("data-share");
      if (platform === "x") {
        link.href =
          "https://twitter.com/intent/tweet?url=" +
          pageUrl +
          "&text=" +
          pageTitle;
      } else if (platform === "linkedin") {
        link.href =
          "https://www.linkedin.com/sharing/share-offsite/?url=" + pageUrl;
      }
    });
  }
})();
