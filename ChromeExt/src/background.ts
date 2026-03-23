import { setupBackgroundMessageListeners } from "./backgroundMessageListeners";
import { getValidAuthToken } from "./refresh";
import { APITokenError, MessageType } from "./types";

const MENU_ID = "send-selected-text" as const;

setupBackgroundMessageListeners();

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
		throw new Error("No API endpoint configured. Developer messed up his build.");
	}

	const snippetsWebAppUrl = process.env.SNIPPETS_WEB_APP_URL;
	if (!snippetsWebAppUrl) {
		throw new Error("No Snippets web app URL configured. Developer messed up his build.");
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
    notify("Got it!", "Sending snippet to server...", MessageType.LOADING, tab?.id);

		const res = await sendSelectedText(selected, pageUrl, pageTitle);
		if (!res.ok) {
			if (res.status === 401) {
				await notify(
					"Unauthorized",
					"Invalid or expired token, click this pop-up to sign in or create your account.",
					MessageType.LOGIN_REQUIRED,
					tab?.id
				);
				return;
			}
			await notify("API Error:", `${res.status} ${res.statusText}`, MessageType.SHOW_ALERT, tab?.id);
		} else {
			await notify(
				"Saved ✓",
				`Snippet saved to Snipets!\nClick this notification to view.`,
				MessageType.OPEN_WEB_APP,
				tab?.id
			);
		}
	} catch (err: any) {
		// if error a certain type APIKeyError e.g. token expired, then open popup to let user sign in again
		if (err instanceof APITokenError) {
			await notify(
				"Unauthorized",
				"Invalid or expired token, click this pop-up to sign in or create your account.",
				MessageType.LOGIN_REQUIRED,
				tab?.id
			);
			return;
		}
		await notify("Failed to save", err?.message || String(err), MessageType.SHOW_ALERT, tab?.id);
	}
});

async function showFallbackRefreshNotification(message: string): Promise<void> {
	const iconUrl = chrome.runtime.getURL("assets/icon128.png");
	await chrome.notifications.create({
		type: "basic",
		iconUrl,
		title: "Snipets",
		message,
	});
}

async function getCurrentActiveTabId(): Promise<number | undefined> {
	const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
	return tabs[0]?.id;
}

// Simple user feedback via notification
async function notify(title: string, message?: string, type: MessageType = MessageType.SHOW_ALERT, tabId?: number) {
	const messageText = `${title}\n${message || ""}`;
	const resolvedTabId = tabId ?? (await getCurrentActiveTabId());

	if (!resolvedTabId) {
		console.log("No active tab found to send message to.");
		await showFallbackRefreshNotification(`Page disconnected\nSnipets is not yet active on this tab, please refresh and try again.`);
		return;
	}

	await new Promise<void>((resolve) => {
		chrome.tabs.sendMessage(
			resolvedTabId,
			{
				type: type,
				message: messageText,
			},
			() => {
				const lastErrorMessage = chrome.runtime.lastError?.message || "";
				console.log("Message send result:", { lastErrorMessage });

				if (
					lastErrorMessage &&
					lastErrorMessage.includes("Receiving end does not exist.")
				) {
					void showFallbackRefreshNotification(
						`Extension has not yet loaded on this page, please refresh then try again.`
					);
				}
				resolve();
			}
		);
	});
}
