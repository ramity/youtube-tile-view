(() => {
  function isWatchPage() {
    return window.location.pathname.startsWith('/watch');
  }

  function isTheaterMode() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    return Boolean(watchFlexy && watchFlexy.hasAttribute('theater'));
  }

  function shouldHideTopbar() {
    return isWatchPage() && isTheaterMode();
  }

  function triggerResize() {
    // Notify YouTube player internal calculations of layout dimension changes
    window.dispatchEvent(new Event('resize'));
  }

  function hideTopbar() {
    if (shouldHideTopbar() && !document.documentElement.classList.contains('yt-topbar-hidden')) {
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

  function syncTopbarState() {
    if (!shouldHideTopbar()) {
      showTopbar();
      return;
    }

    const video = document.querySelector('video.html5-main-video');
    if (video && !video.paused && !video.ended && video.readyState > 2) {
      hideTopbar();
    } else {
      showTopbar();
    }
  }

  function attachVideoListeners(video) {
    if (!video || video._ytpCustomListenersAttached) return;
    video._ytpCustomListenersAttached = true;

    // When video starts playing: squish and vanish topbar (if in theater mode)
    video.addEventListener('play', () => {
      if (shouldHideTopbar()) {
        hideTopbar();
      }
    });

    video.addEventListener('playing', () => {
      if (shouldHideTopbar()) {
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
    syncTopbarState();
  }

  function observePlayer() {
    const video = document.querySelector('video.html5-main-video');
    if (video) {
      attachVideoListeners(video);
    }
  }

  // Observe ytd-watch-flexy for theater attribute changes
  let currentWatchFlexy = null;
  const theaterObserver = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'theater') {
        syncTopbarState();
      }
    }
  });

  function observeTheaterMode() {
    const watchFlexy = document.querySelector('ytd-watch-flexy');
    if (watchFlexy && watchFlexy !== currentWatchFlexy) {
      theaterObserver.disconnect();
      currentWatchFlexy = watchFlexy;
      theaterObserver.observe(watchFlexy, {
        attributes: true,
        attributeFilter: ['theater']
      });
      syncTopbarState();
    }
  }

  // Observe DOM for video element additions or replacements and watch-flexy creation
  const observer = new MutationObserver(() => {
    observePlayer();
    observeTheaterMode();
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
    observeTheaterMode();
  });

  // Initial setup
  observeTheaterMode();
  observePlayer();
  syncTopbarState();
})();
