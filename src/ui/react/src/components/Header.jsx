export default function Header({ user, onLogout, onSettings }) {
	return (
		<header className="header">
			<div className="header-logo">
				<div className="header-logo-icon">🤖</div>
				<span>Grid Bot</span>
			</div>
			{user && (
				<div className="header-user">
					<span className={`plan-badge plan-${user.plan?.toLowerCase()}`}>{user.plan}</span>
					<span className="header-email">{user.email}</span>
					<button className="icon-btn" onClick={onSettings} title="Configurações">⚙</button>
					<button className="icon-btn" onClick={onLogout} title="Sair">↪</button>
				</div>
			)}
		</header>
	)
}
