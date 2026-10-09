(function () {
  "use strict";

  var config = document.currentScript;
  var endpoint = new URL(config.dataset.endpoint);
  var live = config.dataset.track === "true" && window.location.hostname === config.dataset.siteHost;
  var button = document.getElementById("site-like");
  var status = document.getElementById("like-status");
  var count = document.getElementById("like-count");
  var views = document.getElementById("visitor-count");
  if (!button || !status || !count || !views) return;

  var storageKey = "sldyns:site-like";
  var saved = readSavedLike();
  var serverLikes = null;
  var serverTotal = null;
  var ready = false;
  var pending = false;
  var zh = document.documentElement.lang.toLowerCase().startsWith('zh');
  function t(en, cn) { return zh ? cn : en; }

  function readSavedLike() {
    try {
      var value = JSON.parse(localStorage.getItem(storageKey));
      return value && value.liked === true ? value : null;
    } catch (error) { return null; }
  }

  function render() {
    button.disabled = !live || !ready || pending || !!saved;
    button.setAttribute("aria-pressed", saved ? "true" : "false");
    document.getElementById("like-heart").textContent = saved ? "\u2665" : "\u2661";
    document.getElementById("like-label").textContent = saved ? t("Liked", "已点赞") : t("Like this site", "喜欢这个网站");
    var hasMinimum = saved && Number.isFinite(saved.minimum);
    var localMinimum = hasMinimum ? saved.minimum : 0;
    if (serverLikes !== null || hasMinimum) {
      count.textContent = Math.max(serverLikes || 0, localMinimum).toLocaleString("en-US");
    }
    // GoatCounter's TOTAL includes events, so exclude likes from site views.
    if (serverTotal !== null && serverLikes !== null) {
      views.textContent = Math.max(0, serverTotal - serverLikes).toLocaleString("en-US");
    }
  }

  function readCount(path, allowMissing) {
    return fetch(new URL("/counter/" + path + ".json", endpoint).href, {credentials: "omit"})
      .then(function (response) {
        if (!response.ok && !(allowMissing && response.status === 404)) {
          throw new Error("Counter unavailable");
        }
        return response.json();
      })
      .then(function (data) {
        // New events return 404 with a valid zero-count JSON until first used.
        if (typeof data.count !== "string" && typeof data.count !== "number") {
          throw new Error("Invalid count");
        }
        var digits = String(data.count).replace(/[\s,.]/g, "");
        if (!/^\d+$/.test(digits)) throw new Error("Invalid count");
        return Number(digits);
      });
  }

  readCount("TOTAL", false).then(function (value) {
    serverTotal = value;
    render();
  }).catch(function () { views.textContent = t("Unavailable", "暂不可用"); });

  readCount("site-like", true).then(function (value) {
    serverLikes = value;
    render();
  }).catch(function () { count.textContent = "\u2014"; });

  render();
  if (!live) {
    status.textContent = t("Open sldyns.github.io to like this site.", "请在 sldyns.github.io 正式网站点赞。");
    return;
  }

  var tracker = document.createElement("script");
  tracker.src = "https://gc.zgo.at/count.js";
  tracker.async = true;
  tracker.setAttribute("data-goatcounter", endpoint.href);
  tracker.onload = function () {
    ready = !!(window.goatcounter && window.goatcounter.url);
    render();
  };
  tracker.onerror = function () { status.textContent = t("Likes are temporarily unavailable.", "点赞功能暂不可用。"); };
  document.head.appendChild(tracker);

  button.addEventListener("click", function () {
    saved = readSavedLike() || saved;
    if (saved || pending || !ready) { render(); return; }
    if (window.goatcounter.filter()) {
      status.textContent = t("Likes are unavailable while statistics are disabled in this browser.", "此浏览器已停用统计，因此无法点赞。");
      return;
    }

    pending = true;
    status.textContent = t("Sending your like\u2026", "正在提交点赞……");
    render();

    // Use the documented URL API and image transport to confirm delivery.
    // Do not also call count(), which would send the same event twice.
    var request = new Image();
    var finished = false;
    var timeout = setTimeout(function () { finish(false); }, 10000);
    function finish(success) {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      pending = false;
      if (success) {
        saved = {liked: true, minimum: serverLikes === null ? null : serverLikes + 1};
        try { localStorage.setItem(storageKey, JSON.stringify(saved)); } catch (error) {}
        status.textContent = t("Thank you!", "谢谢你的喜欢！");
      } else {
        status.textContent = t("Your like could not be sent. Please try again.", "点赞未能提交，请重试。");
      }
      render();
    }
    request.onload = function () { finish(true); };
    request.onerror = function () { finish(false); };
    request.src = window.goatcounter.url({path: "site-like", title: "Website likes", event: true});
  });

  window.addEventListener("storage", function (event) {
    if (event.key === storageKey) { saved = readSavedLike() || saved; render(); }
  });
}());
