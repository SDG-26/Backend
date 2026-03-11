import { Link, NavLink, useNavigate } from 'react-router';
import useAuth from '@/context/useAuth';
import { logout } from '@/data';
import { toast } from 'react-toastify';

const Navbar = () => {
	const navigate = useNavigate();
	const { user, setUser } = useAuth();

	const handleLogout = async () => {
		try {
			await logout();
			setUser(null);
			navigate('/');
		} catch (error: unknown) {
			const message = (error as { message: string }).message;
			toast.error(message);
		}
	};

	return (
		<div className='navbar bg-base-100'>
			<div className='flex-1'>
				<Link to='/' className='btn btn-ghost text-xl'>
					Travel journal
					<span role='img' aria-labelledby='airplane'>
						🛫
					</span>
					<span role='img' aria-labelledby='heart'>
						❤️
					</span>
				</Link>
			</div>
			<div className='flex-none'>
				<ul className='menu menu-horizontal px-1'>
					<li>
						<NavLink to='/'>Home</NavLink>
					</li>
					{user ? (
						<>
							<li>
								<NavLink to='/create'>Create post</NavLink>
							</li>
							<li>
								<button type='button' onClick={handleLogout}>
									Logout
								</button>
							</li>
						</>
					) : (
						<>
							<li>
								<NavLink to='/register'>Register</NavLink>
							</li>
							<li>
								<NavLink to='/login'>Login</NavLink>
							</li>
						</>
					)}
				</ul>
			</div>
		</div>
	);
};

export default Navbar;
