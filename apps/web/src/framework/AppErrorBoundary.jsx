import {Component} from 'react';
import styles from './AppErrorBoundary.module.css';

export default class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, info) {
    console.error('BuzzBee render error:', error, info);
  }

  handleReload = async () => {
    // A deploy can replace Vite's hashed chunks while a tab still references
    // the previous version. Recover public shell caches without touching ERP data.
    const message = this.state.error?.message || '';
    const staleChunk = /Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\\d]+ failed|ChunkLoadError/i.test(message);
    if (staleChunk) {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations
            .filter((registration) => registration.scope.startsWith(window.location.origin + '/'))
            .map((registration) => registration.unregister()));
        }
        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.filter((key) => key.startsWith('business-os-')).map((key) => caches.delete(key)));
        }
      } catch (error) {
        console.warn('No se pudo limpiar la caché pública del shell:', error);
      }
    }
    window.location.reload();
  };

  handleReset = () => {
    window.localStorage.removeItem('buzzbee-theme');
    window.localStorage.removeItem('erp-sidebar-collapsed');
    window.location.assign('/');
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className={styles.page}>
        <section className={styles.card}>
          <div className={styles.mark}>B</div>
          <span className={styles.eyebrow}>BuzzBee Foundation</span>
          <h1>No pudimos mostrar esta pantalla</h1>
          <p>
            La aplicación detectó un error de renderizado y lo contuvo para
            evitar una pantalla completamente en blanco.
          </p>
          {/Failed to fetch dynamically imported module|Importing a module script failed|Loading chunk [\\d]+ failed|ChunkLoadError/i.test(this.state.error?.message || '') ? (
            <p>Es posible que haya una versión nueva. Recarga para actualizar los archivos públicos sin borrar tus preferencias.</p>
          ) : null}

          <pre>{this.state.error?.message || 'Error desconocido'}</pre>

          <div className={styles.actions}>
            <button onClick={this.handleReload}>Recargar aplicación</button>
            <button className={styles.secondary} onClick={this.handleReset}>
              Restablecer interfaz
            </button>
          </div>
        </section>
      </main>
    );
  }
}
