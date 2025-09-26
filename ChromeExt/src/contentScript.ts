import Toastify from 'toastify-js';
// ...existing code...
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "SHOW_ALERT") {
    alert(msg.message); // Keep alert for verification
  }
});