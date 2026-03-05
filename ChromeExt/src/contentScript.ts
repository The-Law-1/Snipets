import { showToast } from "./toaster";
import { MessageType } from "./types";


function openLoginPage() {
	console.log("Opening login page...");
	chrome.runtime.sendMessage({ type: MessageType.OPEN_LOGIN_PAGE });
}

chrome.runtime.onMessage.addListener((msg) => {
	if (msg.type === MessageType.LOGIN_REQUIRED) {
		showToast(msg.message, openLoginPage);
	}

	if (msg.type === MessageType.SHOW_ALERT) {
		showToast(msg.message);
	}
});
