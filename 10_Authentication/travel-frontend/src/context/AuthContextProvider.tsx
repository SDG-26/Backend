import type { ReactNode } from 'react';
import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import { getMe } from '@/data';

const AuthContextProvider = ({ children }: { children: ReactNode }) => {
	const [user, setUser] = useState<null | User>(null);
	const [authLoading, setAuthLoading] = useState(false);

	useEffect(() => {
		initialLogin();
		async function initialLogin() {
			try {
				setAuthLoading(true);
				const {
					user: { email, firstName, lastName, roles },
				} = await getMe();
				setUser({ email, firstName, lastName, roles });
			} catch (error) {
				console.log(error);
			} finally {
				setAuthLoading(false);
			}
		}
	}, []);

	return (
		<AuthContext.Provider value={{ user, setUser, authLoading }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthContextProvider;
