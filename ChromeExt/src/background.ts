import { getValidAuthToken } from "./refresh";

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
		throw new Error("No endpoint configured. Open the extension Options and set an API endpoint.");
	}

	if (!apiKey) {
		throw new Error("No API key configured. Please sign in from the Options page.");
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
		const res = await sendSelectedText(selected, pageUrl, pageTitle);
		if (!res.ok) {
			if (res.status === 401) {
				const popupUrl = chrome.runtime.getURL("popup.html");
				await notify("Unauthorized", "Invalid or expired token, opening login page in 4 seconds. If popup is blocked, follow this link: " + popupUrl);
				setTimeout(async () => {
					await chrome.tabs.create({ url: popupUrl });
				}, 4000);
				return;
			}
			await notify("API Error:", `${res.status} ${res.statusText}`);
		} else {
			await notify("Saved ✓", `Snippet saved to Snipets!`);
		}
	} catch (err: any) {
		await notify("Failed to save", err?.message || String(err));
	}
});

// Simple user feedback via notification
async function notify(title: string, message?: string) {
	chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
		if (tabs[0]?.id) {
			chrome.tabs.sendMessage(tabs[0].id, {
				type: "SHOW_ALERT",
				message: `${title}\n${message || ""}`,
			});
		}
	});
}
