const TOAST_CONTAINER_ID = "snipets-toast-container";
const TOAST_DURATION_MS = 5000;
const TOAST_ANIMATION_MS = 180;

function getToastContainer() {
	let container = document.getElementById(TOAST_CONTAINER_ID);
	if (container) {
		return container;
	}

	container = document.createElement("div");
	container.id = TOAST_CONTAINER_ID;
	Object.assign(container.style, {
		position: "fixed",
		top: "16px",
		left: "50%",
		transform: "translateX(-50%)",
		display: "flex",
		flexDirection: "column",
		gap: "8px",
		zIndex: "10000",
		width: "auto"
	});
	document.body.appendChild(container);
	return container;
}

export function showToast(message: string, onClick?: () => void) {
	const container = getToastContainer();
	const toast = document.createElement("div");
	toast.textContent = message;
	Object.assign(toast.style, {
		position: "relative",
		overflow: "hidden",
		background: "#0f172a",
		color: "#f8fafc",
		padding: "10px 14px",
		borderRadius: "8px",
		fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
		fontSize: "14px",
		lineHeight: "1.4",
		boxShadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
		opacity: "0",
		transform: "translateY(-6px)",
		transition: `opacity ${TOAST_ANIMATION_MS}ms ease, transform ${TOAST_ANIMATION_MS}ms ease`,
		pointerEvents: "auto",
        textAlign: "center",
	});

    if (onClick !== undefined) {
        toast.style.cursor = "pointer";
    }

	const progressBar = document.createElement("div");
	Object.assign(progressBar.style, {
		position: "absolute",
		left: "0",
		bottom: "0",
		height: "3px",
		width: "100%",
		background: "rgba(248, 250, 252, 0.45)",
		transformOrigin: "left center",
		transform: "scaleX(1)",
		transition: `transform ${TOAST_DURATION_MS}ms linear`
	});
	toast.appendChild(progressBar);

	container.appendChild(toast);
	requestAnimationFrame(() => {
		toast.style.opacity = "1";
		toast.style.transform = "translateY(0)";
		progressBar.style.transform = "scaleX(0)";
	});

	const timeoutId = setTimeout(() => {
		toast.style.opacity = "0";
		toast.style.transform = "translateY(-6px)";
		setTimeout(() => toast.remove(), TOAST_ANIMATION_MS);
	}, TOAST_DURATION_MS);

	toast.addEventListener("click", () => {
        onClick?.();
		toast.style.opacity = "0";
		toast.style.transform = "translateY(-6px)";
		clearTimeout(timeoutId);
		setTimeout(() => toast.remove(), TOAST_ANIMATION_MS);
	});
}