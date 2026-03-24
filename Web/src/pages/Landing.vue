<template>
	<div class="landing-root">
		<header class="top-nav">
			<a href="#/" class="brand">Snipets</a>
			<div class="nav-actions">
				<a href="#/privacy" class="auth-cta">Privacy</a>
				<a :href="authCtaHref" class="auth-cta">{{ authCtaLabel }}</a>
			</div>
		</header>

		<main>
			<section class="hero" id="top">
				<div class="hero-inner">
					<h1 class="hero-title" aria-label="Snipets">
						Snipets<span class="title-caret" aria-hidden="true"></span>
					</h1>
					<p class="hero-subtitle">
						<span class="ink-highlight">Annotate</span> the web.
					</p>
					<div class="hero-actions">
						<a
							href="https://chromewebstore.google.com/detail/your-extension-id-placeholder"
							target="_blank"
							rel="noopener noreferrer"
							class="hero-button hero-button--primary"
						>
							Get Chrome Extension
						</a>
						<a :href="authCtaHref" class="hero-button hero-button--ghost">{{ authCtaLabel }}</a>
					</div>
					<a href="#how-it-works" class="scroll-indicator">Scroll to explore</a>
				</div>
			</section>

			<section id="how-it-works" class="content-section" data-reveal>
				<div class="section-grid">
					<h2>How it works</h2>
					<p>
						Start remembering important ideas. Highlight text from any page, save
						them with context, and come back later with search, grouping, and social discovery.
					</p>
				</div>
			</section>

			<section class="content-section workflow-section" data-reveal>
				<div class="workflow-layout">
					<div class="card-grid card-grid--two-by-two">
						<article class="step-card">
							<span class="step-number">01</span>
							<h3>Install the extension</h3>
							<p>
								Add the extension to chrome, select some text, right-click and save to your snippets library.
							</p>
						</article>
						<article class="step-card">
							<span class="step-number">02</span>
							<h3>Create your account</h3>
							<p>
								Create an account with a simple email and password to privately store and sync your snippets.
							</p>
						</article>
						<article class="step-card">
							<span class="step-number">03</span>
							<h3>Highlight and save snippets</h3>
							<p>
								Highlight snippets you like, group them, search them, review them.
							</p>
						</article>
						<article class="step-card">
							<span class="step-number">04</span>
							<h3>Add friends!</h3>
							<p>
								Follow your friends, discover their highlights, and share effortlessly.
							</p>
						</article>
					</div>

					<aside class="demo-panel" aria-label="Snipets demo video">
						<p class="demo-kicker">Have a look</p>
						<video class="demo-video" autoplay muted loop playsinline preload="metadata">
							<source src="/snipets_demo.mp4" type="video/mp4" />
							Your browser does not support the video tag.
						</video>
						<p class="demo-caption">
							Highlight and save in seconds. Access your snippets later, whenever you need.
						</p>
					</aside>
				</div>
			</section>

			<section class="content-section final-cta" data-reveal>
				<h2>Ready to start collecting?</h2>
				<p>Start with the extension, then jump into your snippets workspace.</p>
				<div class="hero-actions">
					<a
						href="https://chromewebstore.google.com/detail/your-extension-id-placeholder"
						target="_blank"
						rel="noopener noreferrer"
						class="hero-button hero-button--primary"
					>
						Open Chrome Store Link
					</a>
					<a :href="authCtaHref" class="hero-button hero-button--ghost">{{ authCtaLabel }}</a>
				</div>
			</section>
		</main>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "@/store/auth";

const authStore = useAuthStore();

const authCtaLabel = computed(() => (authStore.isAuthenticated ? "See snippets" : "Login"));
const authCtaHref = computed(() => (authStore.isAuthenticated ? "#/snippets" : "#/auth"));

let observer: IntersectionObserver | null = null;

onMounted(() => {
	const revealTargets = document.querySelectorAll<HTMLElement>("[data-reveal]");

	observer = new IntersectionObserver(
		(entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					entry.target.classList.add("is-visible");
					observer?.unobserve(entry.target);
				}
			});
		},
		{ threshold: 0.16 }
	);

	revealTargets.forEach((target) => observer?.observe(target));
});

onBeforeUnmount(() => {
	observer?.disconnect();
	observer = null;
});
</script>

<style scoped>
@import url("https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap");

.landing-root {
	background:
		radial-gradient(circle at 20% 15%, rgba(214, 189, 152, 0.14), transparent 40%),
		radial-gradient(circle at 88% 18%, rgba(103, 125, 106, 0.32), transparent 46%),
		linear-gradient(165deg, var(--landing-pine-900) 0%, var(--landing-pine-800) 45%, var(--landing-pine-700) 100%);
	color: var(--landing-text-strong);
	font-family: "Outfit", sans-serif;
	min-height: 100vh;
}

.top-nav {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	display: flex;
	justify-content: space-between;
	align-items: center;
	padding: 1.2rem clamp(1rem, 3vw, 2.8rem);
	z-index: 25;
	background: linear-gradient(180deg, rgba(26, 54, 54, 0.92) 0%, rgba(26, 54, 54, 0.35) 74%, transparent 100%);
	backdrop-filter: blur(3px);
}

.nav-actions {
	display: flex;
	align-items: center;
	gap: 0.6rem;
}

.brand {
	text-decoration: none;
	font-size: 1.05rem;
	font-weight: 600;
	letter-spacing: 0.12em;
	text-transform: uppercase;
	color: var(--landing-sand-200);
}

.auth-cta {
	text-decoration: none;
	padding: 0.55rem 1rem;
	border-radius: 999px;
	border: 1px solid rgba(214, 189, 152, 0.45);
	color: var(--landing-sand-200);
	font-weight: 600;
	font-size: 0.95rem;
	transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.auth-cta:hover {
	transform: translateY(-2px);
	background: rgba(214, 189, 152, 0.92);
	color: var(--landing-pine-900);
}

.hero {
	min-height: 100vh;
	display: grid;
	place-items: center;
	padding: 5rem 1.5rem 2rem;
}

.hero-inner {
	text-align: center;
	max-width: 760px;
}

.hero-title {
	font-family: "Playfair Display", serif;
	font-size: clamp(3.3rem, 12vw, 8rem);
	line-height: 0.95;
	letter-spacing: 0.01em;
	margin: 0;
	color: var(--landing-sand-200);
}

.title-caret {
	display: inline-block;
	width: 0.06em;
	height: 0.9em;
	margin-left: 0.08em;
	background: var(--landing-text-strong);
	animation: caret-blink 1.1s steps(1) infinite;
	vertical-align: -0.04em;
}

.hero-subtitle {
	font-size: clamp(1.05rem, 2.1vw, 1.45rem);
	line-height: 1.7;
	margin: 1.5rem auto 0;
	max-width: 620px;
	color: var(--landing-text-soft);
}

.ink-highlight {
	position: relative;
	display: inline-block;
	color: var(--landing-text-strong);
	z-index: 1;
	padding: 0 0.08em;
}

.ink-highlight::after {
	content: "";
	position: absolute;
	left: -0.05em;
	right: -0.05em;
	bottom: 0.13em;
	height: 0.42em;
	background: rgba(214, 189, 152, 0.42);
	border-radius: 999px;
	z-index: -1;
}

.hero-actions {
	margin-top: 1.9rem;
	display: flex;
	justify-content: center;
	flex-wrap: wrap;
	gap: 0.85rem;
}

.hero-button {
	text-decoration: none;
	font-weight: 600;
	padding: 0.78rem 1.25rem;
	border-radius: 999px;
	border: 1px solid transparent;
	transition: transform 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease, color 0.2s ease;
}

.hero-button:hover {
	transform: translateY(-2px);
}

.hero-button--primary {
	background: var(--landing-sand-200);
	color: var(--landing-pine-900);
	box-shadow: 0 10px 26px rgba(8, 16, 16, 0.34);
}

.hero-button--primary:hover {
	background: var(--landing-sand-100);
	box-shadow: 0 14px 28px rgba(8, 16, 16, 0.42);
}

.hero-button--ghost {
	border-color: rgba(214, 189, 152, 0.5);
	color: var(--landing-sand-200);
	background: rgba(64, 83, 76, 0.35);
}

.hero-button--ghost:hover {
	background: rgba(214, 189, 152, 0.9);
	color: var(--landing-pine-900);
}

.scroll-indicator {
	display: inline-block;
	margin-top: 2.3rem;
	color: rgba(214, 189, 152, 0.84);
	text-decoration: none;
	font-size: 0.95rem;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	border-bottom: 1px dashed rgba(214, 189, 152, 0.45);
	padding-bottom: 0.25rem;
	transition: color 0.2s ease, border-color 0.2s ease;
}

.scroll-indicator:hover {
	color: var(--landing-text-strong);
	border-color: rgba(246, 237, 220, 0.72);
}

.content-section {
	max-width: 1200px;
	margin: 0 auto;
	padding: clamp(3rem, 5vw, 4.8rem) clamp(1rem, 3.2vw, 2.2rem);
	opacity: 0;
	transform: translateY(26px);
	transition: opacity 0.75s ease, transform 0.75s ease;
}

.content-section.is-visible {
	opacity: 1;
	transform: translateY(0);
}

.section-grid {
	display: grid;
	grid-template-columns: minmax(220px, 320px) 1fr;
	gap: 1.2rem 2.4rem;
	align-items: start;
}

.section-grid h2 {
	margin: 0;
	font-family: "Playfair Display", serif;
	font-size: clamp(1.8rem, 3vw, 2.4rem);
	color: var(--landing-text-strong);
}

.section-grid p {
	margin: 0;
	font-size: clamp(1rem, 1.8vw, 1.2rem);
	line-height: 1.8;
	color: var(--landing-text-soft);
}

.card-grid {
	display: grid;
	grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
	gap: 1rem;
}

.card-grid--two-by-two {
	grid-template-columns: repeat(2, minmax(0, 1fr));
}

.workflow-section {
	padding-top: 0;
}

.workflow-layout {
	display: grid;
	grid-template-columns: minmax(0, 1fr) minmax(360px, 1.05fr);
	align-items: stretch;
	gap: 1.2rem;
}

.demo-panel {
	border: 1px solid rgba(214, 189, 152, 0.24);
	border-radius: 18px;
	padding: 0.9rem 0.9rem 0.95rem;
	background:
		linear-gradient(160deg, rgba(26, 54, 54, 0.58), rgba(64, 83, 76, 0.38)),
		repeating-linear-gradient(135deg, transparent 0 11px, rgba(214, 189, 152, 0.035) 11px 12px);
	box-shadow: 0 20px 34px rgba(10, 19, 19, 0.3);
}

.demo-kicker {
	margin: 0 0 0.6rem;
	font-size: 0.78rem;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	font-weight: 700;
	color: rgba(246, 237, 220, 0.9);
}

.demo-video {
	width: 100%;
	aspect-ratio: 4 / 3;
	min-height: clamp(350px, 38vw, 460px);
	display: block;
	border-radius: 12px;
	border: 1px solid rgba(214, 189, 152, 0.24);
	background: rgba(11, 24, 24, 0.65);
	object-fit: cover;
}

.demo-caption {
	margin: 0.7rem 0 0;
	line-height: 1.55;
	font-size: 0.92rem;
	color: var(--landing-text-soft);
}

.step-card {
	border: 1px solid rgba(214, 189, 152, 0.14);
	border-radius: 16px;
	padding: 1rem 1.05rem 1.2rem;
	background:
		linear-gradient(150deg, rgba(26, 54, 54, 0.52), rgba(64, 83, 76, 0.52)),
		repeating-linear-gradient(135deg, transparent 0 9px, rgba(214, 189, 152, 0.03) 9px 10px);
	transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
}

.step-card:hover {
	transform: translateY(-6px);
	border-color: rgba(214, 189, 152, 0.44);
	box-shadow: 0 16px 34px rgba(10, 19, 19, 0.34);
}

.step-number {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0.2rem 0.55rem;
	border-radius: 999px;
	font-size: 0.78rem;
	font-weight: 700;
	letter-spacing: 0.06em;
	background: rgba(214, 189, 152, 0.18);
	color: var(--landing-text-strong);
}

.step-card h3 {
	margin: 0.65rem 0 0.55rem;
	font-size: 1.08rem;
	color: var(--landing-text-strong);
}

.step-card p {
	margin: 0;
	line-height: 1.65;
	font-size: 0.95rem;
	color: var(--landing-text-soft);
}

.final-cta {
	text-align: center;
	padding-bottom: 5rem;
}

.final-cta h2 {
	font-family: "Playfair Display", serif;
	font-size: clamp(1.8rem, 4vw, 2.5rem);
	margin: 0;
	color: var(--landing-text-strong);
}

.final-cta p {
	max-width: 680px;
	margin: 1rem auto 0;
	color: var(--landing-text-soft);
	line-height: 1.7;
}

@keyframes caret-blink {
	0%,
	49% {
		opacity: 1;
	}
	50%,
	100% {
		opacity: 0;
	}
}

@media (max-width: 760px) {
	.section-grid {
		grid-template-columns: 1fr;
	}

	.card-grid--two-by-two {
		grid-template-columns: 1fr;
	}

	.workflow-layout {
		grid-template-columns: 1fr;
	}

	.top-nav {
		padding: 1rem;
	}

	.brand {
		font-size: 0.95rem;
	}
}
</style>
