chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
	if (msg.type === "SHOW_ALERT") {
		alert(msg.message);
	}
});
