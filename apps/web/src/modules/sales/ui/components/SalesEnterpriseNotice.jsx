import styles from './SalesEnterpriseNotice.module.css';

export default function SalesEnterpriseNotice({message}) {
  if (!message) return null;

  const [tone, text] = message;
  return (
    <div className={`${styles.notice} ${tone === 'success' ? styles.success : styles.error}`} role={tone === 'success' ? 'status' : 'alert'}>
      {text}
    </div>
  );
}
