const TOAST_CONTAINER_ID = "snipets-toast-container";
const TOAST_STYLE_ID = "snipets-toast-styles";
const TOAST_DURATION_MS = 10000;
const TOAST_ANIMATION_MS = 180;

function normalizeToastMessage(message: string) {
	return message
		.replace(/<br\s*\/?>/gi, "\n")
		.replace(/\\n/g, "\n");
}

function ensureToastStyles() {
	if (document.getElementById(TOAST_STYLE_ID)) {
		return;
	}

	const style = document.createElement("style");
	style.id = TOAST_STYLE_ID;
	style.textContent = `
		.snipets-toast-loader {
			width: 18px;
			height: 18px;
			border: 3px solid #FFF;
			border-bottom-color: transparent;
			border-radius: 50%;
			display: inline-block;
			box-sizing: border-box;
			animation: snipets-rotation 1s linear infinite;
			flex-shrink: 0;
		}

		@keyframes snipets-rotation {
			0% {
				transform: rotate(0deg);
			}
			100% {
				transform: rotate(360deg);
			}
		}
	`;
	document.head.appendChild(style);
}

const TOAST_THEME = {
	background: "#1b3934",
	text: "#f3eadc",
	border: "rgba(214, 189, 152, 0.22)",
	progress: "rgba(214, 189, 152, 0.6)",
	close: "#dcc7a9",
	hoverShadow: "0 8px 24px rgba(103, 125, 106, 0.35)",
};

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
	ensureToastStyles();
	const normalizedMessage = normalizeToastMessage(message);
	const isLoadingToast = normalizedMessage.toLowerCase().includes("sending snippet to server...");

	const container = getToastContainer();
	const toast = document.createElement("div");
	Object.assign(toast.style, {
		position: "relative",
		overflow: "hidden",
		background: TOAST_THEME.background,
		color: TOAST_THEME.text,
		border: `1px solid ${TOAST_THEME.border}`,
		padding: "10px 14px",
		borderRadius: "8px",
		fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
		fontSize: "14px",
		lineHeight: "1.4",
		boxShadow: TOAST_THEME.hoverShadow,
		opacity: "0",
		transform: "translateY(-6px)",
		transition: `opacity ${TOAST_ANIMATION_MS}ms ease, transform ${TOAST_ANIMATION_MS}ms ease`,
		pointerEvents: "auto",
		textAlign: "center",
		whiteSpace: "normal",
	});

	if (isLoadingToast) {
		const contentWrapper = document.createElement("div");
		Object.assign(contentWrapper.style, {
			display: "inline-flex",
			alignItems: "center",
			justifyContent: "center",
			gap: "8px",
		});

		const spinner = document.createElement("span");
		spinner.className = "snipets-toast-loader";

		const messageText = document.createElement("span");
		messageText.textContent = normalizedMessage;
		messageText.style.whiteSpace = "pre-line";

		contentWrapper.appendChild(messageText);
		contentWrapper.appendChild(spinner);
		toast.appendChild(contentWrapper);
	} else {
		toast.textContent = normalizedMessage;
		toast.style.whiteSpace = "pre-line";
	}

    if (onClick !== undefined) {
        toast.style.cursor = "pointer";
    }

    function closeToast(toastElement: HTMLDivElement) {
        toastElement.style.opacity = "0";
        toastElement.style.transform = "translateY(-6px)";
        setTimeout(() => toastElement.remove(), TOAST_ANIMATION_MS);
    }

    // add an X button to the right hand side, which when clicked will remove the toast immediately
    const closeButton = document.createElement("span");
    closeButton.textContent = "x";
    Object.assign(closeButton.style, {
        position: "absolute",
        top: "4px",
        right: "8px",
        fontSize: "16px",
        cursor: "pointer",
		color: TOAST_THEME.close,
    });
    closeButton.addEventListener("click", (e: MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        closeToast(toast);
    });
    toast.appendChild(closeButton);

	const progressBar = document.createElement("div");
	Object.assign(progressBar.style, {
		position: "absolute",
		left: "0",
		bottom: "0",
		height: "3px",
		width: "100%",
		background: TOAST_THEME.progress,
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
		closeToast(toast);
	}, TOAST_DURATION_MS);

	toast.addEventListener("click", () => {
        onClick?.();
		closeToast(toast);
		clearTimeout(timeoutId);
	});
}

export function closeLoadingToasts() {
  const container = getToastContainer();
  const loadingToasts = container.querySelectorAll("div:has(.snipets-toast-loader)");
  loadingToasts.forEach((toast:Element) => {
    (toast as HTMLElement).style.opacity = "0";
    (toast as HTMLElement).style.transform = "translateY(-6px)";
    setTimeout(() => toast.remove(), TOAST_ANIMATION_MS);
  });
}