<template>
	<div class="auth-container">
		<div class="auth-box">
			<h1>{{ isLogin ? "Log In" : "Create Account" }}</h1>

			<form @submit.prevent="handleSubmit">
				<div class="form-group">
					<label for="email">Email</label>
					<input
						id="email"
						v-model="form.email"
						type="email"
						placeholder="your@email.com"
						required
					/>
				</div>

				<div class="form-group">
					<label for="password">Password</label>
					<input
						id="password"
						v-model="form.password"
						type="password"
						placeholder="••••••••"
						required
					/>
				</div>

				<div v-if="!isLogin" class="form-group">
					<label for="confirm">Confirm Password</label>
					<input
						id="confirm"
						v-model="form.confirmPassword"
						type="password"
						placeholder="••••••••"
						required
						@input="validatePasswords"
					/>
					<span v-if="passwordError" class="error-text">{{ passwordError }}</span>
				</div>

				<div v-if="!isLogin" class="form-group">
					<label for="username">Username</label>
					<input
						id="username"
						v-model="form.username"
						type="text"
						placeholder="your_username"
						required
					/>
				</div>

				<div v-if="error" class="error-message">{{ error }}</div>

				<button type="submit" class="auth-btn" :disabled="loading || passwordError.length > 0">
					{{ loading ? "Loading..." : isLogin ? "Log In" : "Create Account" }}
				</button>
			</form>

			<div class="toggle-auth">
				<span>{{ isLogin ? "Don't have an account?" : "Already have an account?" }}</span>
				<button type="button" @click="isLogin = !isLogin" class="toggle-btn">
					{{ isLogin ? "Sign Up" : "Log In" }}
				</button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useAuthStore } from "@/store/auth";
import { useUserStore } from "@/store/user";
import {useToast} from 'vue-toast-notification';
import 'vue-toast-notification/dist/theme-sugar.css';

const $toast = useToast();


const authStore = useAuthStore();
const userStore = useUserStore();

const isLogin = ref(true);
const loading = ref(false);
const error = ref("");
const passwordError = ref("");

const form = ref({
	email: "",
	password: "",
	confirmPassword: "",
	username: "",
});

function validatePasswords() {
	if (form.value.password !== form.value.confirmPassword) {
		passwordError.value = "Passwords do not match";
	} else {
		passwordError.value = "";
	}
}

async function handleSubmit() {
	error.value = "";
	loading.value = true;

	try {
		if (isLogin.value) {
			// SIGN IN
			await authStore.signIn(form.value.email, form.value.password);
			// redirect to home
			window.location.hash = "#/";
		} else {
			// SIGN UP + CREATE PROFILE
			validatePasswords();
			if (passwordError.value) {
				loading.value = false;
				return;
			}

			await authStore.signUp(form.value.email, form.value.password);
			const token = authStore.getAuthToken();
			if (token) {
				await userStore.createProfile(form.value.username, token);
				$toast.success('Account created successfully! You may log in now.', {
					position: 'top',
					duration: 5000,
				});
			}
		}
	} catch (err: any) {
		error.value = err.message || "Authentication failed";
	} finally {
		loading.value = false;
	}
}
</script>

<style scoped>
.auth-container {
	display: flex;
	align-items: center;
	justify-content: center;
	background: linear-gradient(135deg, var(--bg) 0%, #1a2332 100%);
	padding: 1rem;
}

.auth-box {
	background: var(--panel);
	border-radius: 16px;
	padding: 2rem;
	width: 100%;
	max-width: 400px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.auth-box h1 {
	font-size: 1.75rem;
	font-weight: 700;
	margin-bottom: 1.5rem;
	color: var(--text);
}

.form-group {
	margin-bottom: 1.25rem;
}

.form-group label {
	display: block;
	font-size: 0.9rem;
	font-weight: 600;
	margin-bottom: 0.5rem;
	color: var(--muted);
}

.form-group input {
	width: 100%;
	padding: 0.75rem;
	border-radius: 8px;
	border: 2px solid rgba(255, 255, 255, 0.05);
	background: rgba(255, 255, 255, 0.02);
	color: var(--text);
	font-size: 1rem;
	transition: all 0.2s ease;
	box-sizing: border-box;
}

.form-group input:focus {
	outline: none;
	border-color: var(--accent);
	box-shadow: 0 0 0 3px rgba(255, 122, 24, 0.1);
}

.error-text {
	display: block;
	color: #ff6b6b;
	font-size: 0.8rem;
	margin-top: 0.25rem;
}

.error-message {
	background: rgba(255, 107, 107, 0.1);
	border-left: 4px solid #ff6b6b;
	color: #ff8a8a;
	padding: 0.75rem;
	border-radius: 6px;
	margin-bottom: 1rem;
	font-size: 0.9rem;
}

.auth-btn {
	width: 100%;
	padding: 0.9rem;
	background: linear-gradient(180deg, var(--accent) 0%, var(--accent-600) 100%);
	color: #0b0b0b;
	border: none;
	border-radius: 8px;
	font-weight: 700;
	font-size: 1rem;
	cursor: pointer;
	transition: all 0.2s ease;
	margin-bottom: 1rem;
}

.auth-btn:hover:not(:disabled) {
	transform: translateY(-2px);
	box-shadow: 0 12px 24px rgba(255, 122, 24, 0.3);
}

.auth-btn:disabled {
	opacity: 0.5;
	cursor: not-allowed;
}

.toggle-auth {
	text-align: center;
	color: var(--muted);
	font-size: 0.9rem;
}

.toggle-btn {
	background: none;
	border: none;
	color: var(--accent);
	font-weight: 700;
	cursor: pointer;
	margin-left: 0.5rem;
	text-decoration: none;
	transition: all 0.2s ease;
}

.toggle-btn:hover {
	color: var(--accent-600);
	text-decoration: underline;
}
</style>

