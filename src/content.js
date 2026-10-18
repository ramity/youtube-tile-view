(() => {
  function isWatchPage() {
    return window.location.pathname.startsWith('/watch');
  }

  function triggerResize() {
    // Notify YouTube player internal calculations of layout dimension changes
    window.dispatchEvent(new Event('resize'));
  }

  function hideTopbar() {
    if (isWatchPage() && !document.documentElement.classList.contains('yt-topbar-hidden')) {
      document.documentElement.classList.add('yt-topbar-hidden');
      setTimeout(triggerResize, 420);
    }
  }

  function showTopbar() {
    if (document.documentElement.classList.contains('yt-topbar-hidden')) {
      document.documentElement.classList.remove('yt-topbar-hidden');
      setTimeout(triggerResize, 420);
    }
  }

  function attachVideoListeners(video) {
    if (!video || video._ytpCustomListenersAttached) return;
    video._ytpCustomListenersAttached = true;

    // When video starts playing: squish and vanish topbar
    video.addEventListener('play', () => {
      if (isWatchPage()) {
        hideTopbar();
      }
    });

    video.addEventListener('playing', () => {
      if (isWatchPage()) {
        hideTopbar();
      }
    });

    // When video pauses, ends, or is waiting: ease topbar back in
    video.addEventListener('pause', () => {
      showTopbar();
    });

    video.addEventListener('ended', () => {
      showTopbar();
    });

    // Check state immediately in case it's already playing when listener attaches
    if (!video.paused && !video.ended && video.readyState > 2) {
      if (isWatchPage()) {
        hideTopbar();
      }
    } else {
      showTopbar();
    }
  }

  function observePlayer() {
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      attachVideoListeners(video);
    }
  }

  // Observe DOM for video element additions or replacements across navigations
  const observer = new MutationObserver(() => {
    observePlayer();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Handle YouTube internal SPA navigation
  window.addEventListener('yt-navigate-finish', () => {
    // Show topbar on navigation
    showTopbar();
    observePlayer();
  });

  // Initial setup: topbar is in place on initial load
  showTopbar();
  observePlayer();
})();
