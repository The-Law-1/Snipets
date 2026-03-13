import { showToast } from "./toaster";
import { MessageType } from "./types";


function openLoginPage() {
	chrome.runtime.sendMessage({ type: MessageType.OPEN_LOGIN_PAGE });
}

function openWebApp() {
	chrome.runtime.sendMessage({ type: MessageType.OPEN_WEB_APP });
}

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
	let handled = false;

	if (msg.type === MessageType.OPEN_WEB_APP) {
		showToast(msg.message, openWebApp);
		handled = true;
	}

	if (msg.type === MessageType.LOGIN_REQUIRED) {
		showToast(msg.message, openLoginPage);
		handled = true;
	}

	if (msg.type === MessageType.SHOW_ALERT) {
		showToast(msg.message);
		handled = true;
	}

	if (handled) {
		sendResponse({ ok: true });
	}
});
