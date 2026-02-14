export default function Controls({ onStart, onStop }) {
    return (
        <div className="controls">
            <button className="start" onClick={onStart}>
                ▶ Iniciar
            </button>
            <button className="stop" onClick={onStop}>
                ⏸ Parar
            </button>
        </div>
    )
}
