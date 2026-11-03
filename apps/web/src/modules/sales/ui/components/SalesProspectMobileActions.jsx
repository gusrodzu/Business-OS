import styles from './SalesProspectMobileActions.module.css';

// Action controls stay presentational; the parent owns selection and stage mutations.
export default function SalesProspectMobileActions({prospect, selected, stages, onToggle, onStage}) {
  const name = prospect.companyName || prospect.name;
  return <>
    <label className={styles.mobileSelection}>
      <input type="checkbox" checked={selected}
        onChange={(event) => onToggle(prospect.id, event.target.checked)}
        aria-label={`Seleccionar oportunidad ${name}`}/>
      <span>Seleccionar</span>
    </label>
    <label className={styles.mobileStage}>
      <span>Cambiar etapa</span>
      <select value={prospect.stage} onChange={(event) => onStage(prospect, event.target.value)}
        aria-label={`Etapa de ${name}`}>
        {stages.map((entry) => <option key={entry.id} value={entry.id}>{entry.label}</option>)}
      </select>
    </label>
  </>;
}
