import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{
                    padding: '20px',
                    color: '#fff',
                    backgroundColor: '#030712',
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    textAlign: 'center'
                }}>
                    <h2>¡Ups! Algo salió mal.</h2>
                    <p style={{ opacity: 0.7, marginBottom: '20px' }}>
                        Hubo un error al cargar la aplicación.
                    </p>
                    {this.state.error && (
                        <details style={{ whiteSpace: 'pre-wrap', textAlign: 'left', background: 'rgba(255,255,255,0.1)', padding: '10px', borderRadius: '8px', maxWidth: '100%', overflow: 'auto' }}>
                            {this.state.error.toString()}
                        </details>
                    )}
                    <button
                        onClick={() => window.location.reload()}
                        style={{
                            marginTop: '20px',
                            padding: '10px 20px',
                            background: '#38bdf8',
                            border: 'none',
                            borderRadius: '8px',
                            color: 'white',
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        Recargar Aplicación
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
