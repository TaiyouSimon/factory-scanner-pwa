if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("SW registered: ", registration);
      })
      .catch((registrationError) => {
        console.log("SW registration failed: ", registrationError);
      });
  });
}

let deferredPrompt: any;

window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallPromotion();
});

function showInstallPromotion() {
  const installBanner = document.createElement("div");
  installBanner.innerHTML = `
    <div style="position: fixed; top: 20px; right: 20px; background: #1976d2; color: white; padding: 12px 20px; border-radius: 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.2); z-index: 10000; cursor: pointer;">
      App available - Click to install
    </div>
  `;
  installBanner.onclick = () => installPWA();
  document.body.appendChild(installBanner);

  setTimeout(() => installBanner.remove(), 10000);
}

function installPWA() {
  if (deferredPrompt) {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult: any) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      deferredPrompt = null;
    });
  }
}

window.addEventListener("appinstalled", () => {
  console.log("PWA was installed");
  deferredPrompt = null;
});
