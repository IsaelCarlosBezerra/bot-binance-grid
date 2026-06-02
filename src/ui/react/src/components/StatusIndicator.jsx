export default function StatusIndicator({ enabled }) {
	return (
		<div className="status">
			<div className={`status-dot ${enabled ? "on" : "off"}`} />
			<span style={{ color: enabled ? "var(--success)" : "var(--text-3)", fontWeight: 500 }}>
				{enabled ? "Bot em execução" : "Bot pausado"}
			</span>
		</div>
	)
}
