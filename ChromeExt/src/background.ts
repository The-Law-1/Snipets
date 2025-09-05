const MENU_ID = "send-selected-text" as const;

type Settings = {
	endpoint?: string; // e.g. https://api.example.com/ingest
	apiKey?: string; // optional, if your API requires it
};

chrome.runtime.onInstalled.addListener(() => {
	chrome.contextMenus.create({
		id: MENU_ID,
		title: "Send selected text to API",
		contexts: ["selection"]
	});
});

// Helper to read settings from storage
async function getSettings(): Promise<Settings> {
	return new Promise((resolve) => {
		chrome.storage.sync.get(["endpoint", "apiKey"], (items) => {
			resolve({ endpoint: items.endpoint, apiKey: items.apiKey });
		});
	});
}

// Send the selected text to your API
async function sendSelectedText(text: string, pageUrl?: string, pageTitle?: string): Promise<Response> {
  const { endpoint, apiKey } = await getSettings();

  if (!endpoint) {
    throw new Error(
      "No endpoint configured. Open the extension Options and set an API endpoint."
    );
  }

  // Payload now includes URL and title
  const body = JSON.stringify({
    text,
    url: pageUrl,
    title: pageTitle,
  });

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) headers["Authorization"] = `Bearer ${apiKey}`;

  return fetch(endpoint, {
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
  const pageTitle = tab?.title || "";

  try {
    const res = await sendSelectedText(selected, pageUrl, pageTitle);
    if (!res.ok) {
      const text = await res.text();
      console.error("API error", res.status, text);
      await notify(
        `API error: ${res.status} ${res.statusText}`,
        text.slice(0, 120) || undefined
      );
    } else {
      await notify("Sent ✓", `Text + URL + title sent.`);
    }
  } catch (err: any) {
    console.error(err);
    await notify("Failed to send", err?.message || String(err));
  }
});

// Simple user feedback via notification
async function notify(title: string, message?: string) {
	// MV3: notifications permission not strictly required for basic usage
	// because chrome.notifications API requires explicit permission. Here we
	// fallback to the service worker console if notifications are unavailable.
	if (!chrome.notifications) {
		console.log(`[notify] ${title} - ${message ?? ""}`);
		return;
	}
	chrome.notifications.create({
		type: "basic",
		iconUrl: "icon-128.png", // Optional: add an icon file or remove this line
		title,
		message: message ?? ""
	});
}
