import { getValidAuthToken } from "./refresh";
import { APITokenError, MessageType } from "./types";

const MENU_ID = "send-selected-text" as const;

type Settings = {
	endpoint?: string;
	apiKey?: string;
};

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: MENU_ID,
		title: "Save snippet to Snipets",
		contexts: ["selection"],
	});
});

// Helper to read settings from storage
async function getSettings(): Promise<Settings> {
	const endpoint = process.env.EDGE_URL;
	if (!endpoint) {
		throw new Error("No API endpoint configured. Please set EDGE_URL in your environment variables.");
	}

	const apiKey = await getValidAuthToken();
	return { endpoint, apiKey };
}

// Send the selected text to your API
async function sendSelectedText(text: string, pageUrl?: string, pageTitle?: string): Promise<Response> {
	const { endpoint, apiKey } = await getSettings();

	if (!endpoint) {
		throw new Error("No endpoint configured. Strange error should not happen as it's configured by developer.");
	}

	if (!apiKey) {
		throw new APITokenError("No API key saved. Please click on extension icon to create account or sign in.");
	}

	// Payload now includes URL and title
	const body = JSON.stringify({
		text,
		url: pageUrl,
		title: pageTitle || "Untitled",
	});

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		Authorization: `Bearer ${apiKey}`,
	};

	const path = `${endpoint}/snippets`;

	return fetch(path, {
		method: "POST",
		headers,
		body,
	});
}

async function openSignInPopup() {
	await notify("Unauthorized", "Invalid or expired token, click this pop-up to sign in again.", MessageType.LOGIN_REQUIRED);
}

chrome.runtime.onMessage.addListener((msg) => {
	if (msg?.type === MessageType.OPEN_LOGIN_PAGE) {
		const popupUrl = chrome.runtime.getURL("popup.html");
		chrome.tabs.create({ url: popupUrl });
	}
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
	if (info.menuItemId !== MENU_ID) return;

	const selected = (info.selectionText || "").trim();
	if (!selected) {
		console.warn("No selection text detected.");
		return;
	}

	const pageUrl = info.pageUrl || tab?.url || "";
	const pageTitle = tab?.title || "Untitled";

	try {
		const res = await sendSelectedText(selected, pageUrl, pageTitle);
		if (!res.ok) {
			if (res.status === 401) {
				openSignInPopup();
				return;
			}
			await notify("API Error:", `${res.status} ${res.statusText}`);
		} else {
			await notify("Saved ✓", `Snippet saved to Snipets!`);
		}
	} catch (err: any) {
		// if error a certain type APIKeyError e.g. token expired, then open popup to let user sign in again
		if (err instanceof APITokenError) {
			openSignInPopup();
			return;
		}
		await notify("Failed to save", err?.message || String(err));
	}
});

// Simple user feedback via notification
async function notify(title: string, message?: string, type: MessageType = MessageType.SHOW_ALERT) {

	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]?.id) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: type,
				message: `${title}\n${message || ""}`,
			});
		}
	});
}
