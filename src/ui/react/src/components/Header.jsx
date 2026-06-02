export default function Header({ user, onLogout, onSettings }) {
	return (
		<header className="header">
			<span className="header-title">🤖 Grid Bot</span>
			{user && (
				<div className="header-user">
					<span className={`plan-badge plan-${user.plan?.toLowerCase()}`}>{user.plan}</span>
					<span className="header-email">{user.email}</span>
					<button className="logout-btn" onClick={onSettings}>⚙ Config</button>
					<button className="logout-btn" onClick={onLogout}>Sair</button>
				</div>
			)}
		</header>
	)
}
