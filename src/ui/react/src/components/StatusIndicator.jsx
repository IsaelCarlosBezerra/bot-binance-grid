export default function StatusIndicator({ enabled }) {
	return (
		<div className="status">
			<div className={`dot ${enabled ? "on" : "off"}`}></div>
			<div>{enabled ? "Bot em execução" : "Bot desligado"}</div>
		</div>
	)
}
