import { MessageType } from "./types";

export function setupBackgroundMessageListeners() {
    chrome.runtime.onMessage.addListener((msg) => {
	if (msg?.type === MessageType.OPEN_LOGIN_PAGE) {
		const popupUrl = chrome.runtime.getURL("popup.html");
		chrome.tabs.create({ url: popupUrl });
	}
    if (msg?.type === MessageType.OPEN_WEB_APP) {
        const webAppUrl = process.env.SNIPPETS_WEB_APP_URL;
        chrome.tabs.create({ url: webAppUrl });
    }
});
}