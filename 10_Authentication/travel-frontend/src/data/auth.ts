const API_URL: string | undefined = import.meta.env
	.VITE_APP_TRAVEL_JOURNAL_API_URL as string | undefined;
if (!API_URL)
	throw new Error('API URL is required, are you missing a .env file?');
const baseURL: string = `${API_URL}/auth`;

export async function register(
	body: User & { password: string; confirmPassword: string },
) {
	const { firstName, lastName, email, password, confirmPassword, roles } =
		body;

	const res = await fetch(`${baseURL}/register`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			firstName,
			lastName,
			email,
			password,
			confirmPassword,
			roles,
		}),
		credentials: 'include',
	});

	if (!res.ok) throw new Error('Registration failed');
	const data = await res.json();
	return data;
}

export async function login(body: { email: string; password: string }) {
	const { email, password } = body;

	const res = await fetch(`${baseURL}/login`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ email, password }),
		credentials: 'include',
	});
	if (!res.ok) throw new Error('Login failed');
	const data = await res.json();
	return data;
}

export async function getMe() {
	const userRes = await fetch(`${baseURL}/me`, { credentials: 'include' });
	if (!userRes.ok) throw new Error('Login failed');
	return userRes.json();
}

export async function logout() {
	const res = await fetch(`${baseURL}/logout`, { method: 'DELETE' });
	if (!res.ok) throw new Error('Logout failed');
}
