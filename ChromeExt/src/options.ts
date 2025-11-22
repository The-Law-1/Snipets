function byId<T extends HTMLElement = HTMLElement>(id: string): T {
	const el = document.getElementById(id);
	if (!el) throw new Error(`Missing element: #${id}`);
	return el as T;
}

const endpointInput = byId<HTMLInputElement>("endpoint");
const apiKeyInput = byId<HTMLInputElement>("apiKey");
const saveButton = byId<HTMLButtonElement>("save");
const statusSpan = byId<HTMLSpanElement>("status");

// Load saved settings into the form
chrome.storage.sync.get(["endpoint", "apiKey"], (items) => {
	endpointInput.value = items.endpoint || "";
	apiKeyInput.value = items.apiKey || "";
});

saveButton.addEventListener("click", () => {
	const endpoint = endpointInput.value.trim();
	const apiKey = apiKeyInput.value.trim();

	chrome.storage.sync.set({ endpoint, apiKey }, () => {
		statusSpan.textContent = "Saved.";
		setTimeout(() => (statusSpan.textContent = ""), 1500);
	});
});
