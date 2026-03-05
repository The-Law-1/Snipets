import { showToast } from "./toaster";
import { MessageType } from "./types";


function openLoginPage() {
	chrome.runtime.sendMessage({ type: MessageType.OPEN_LOGIN_PAGE });
}

function openWebApp() {
	chrome.runtime.sendMessage({ type: MessageType.OPEN_WEB_APP });
}

chrome.runtime.onMessage.addListener((msg) => {

	if (msg.type === MessageType.OPEN_WEB_APP) {
		showToast(msg.message, openWebApp);
	}

	if (msg.type === MessageType.LOGIN_REQUIRED) {
		showToast(msg.message, openLoginPage);
	}

	if (msg.type === MessageType.SHOW_ALERT) {
		showToast(msg.message);
	}
});
