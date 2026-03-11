import useAuth from '@/context/useAuth';
import { useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';

const ProtectedLayout = () => {
	const { user, authLoading } = useAuth();
	const navigate = useNavigate();

	useEffect(() => {
		if (authLoading) return;
		if (!user) navigate('/login');
	}, [user, navigate, authLoading]);

	if (authLoading) return <p>Loading...</p>;
	if (!user) return null;
	return <Outlet />;
};

export default ProtectedLayout;
