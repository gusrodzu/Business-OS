import {Badge, Card} from '../../../../design-system/components';
import styles from './BudgetMonthlyComparison.module.css';

const months = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

// Purely presentational: Budgets owns tenant-scoped data and all mutations.
export default function BudgetMonthlyComparison({monthly, year, utilization, formatCurrency}) {
  const maxMonthly = Math.max(
    1,
    ...monthly.flatMap((item) => [item.planned, item.actual]),
  );

  return (
        <Card className={styles.chartCard}>
          <div className={styles.cardHeader}>
            <div>
              <h2>Presupuesto vs. gasto real</h2>
              <p>Comparativo mensual del ejercicio {year}.</p>
            </div>
            <Badge
              tone={utilization > 100 ? 'danger' : 'success'}
            >
              {utilization}% utilizado
            </Badge>
          </div>

          <div className={styles.chart}>
            {monthly.map((item) => (
              <div className={styles.month} key={item.month}>
                <div className={styles.bars}>
                  <span
                    className={styles.plannedBar}
                    style={{
                      height: `${Math.max(
                        4,
                        (item.planned / maxMonthly) * 100,
                      )}%`,
                    }}
                    title={`Presupuestado: ${formatCurrency(item.planned)}`}
                  />
                  <span
                    className={styles.actualBar}
                    style={{
                      height: `${Math.max(
                        4,
                        (item.actual / maxMonthly) * 100,
                      )}%`,
                    }}
                    title={`Ejecutado: ${formatCurrency(item.actual)}`}
                  />
                </div>
                <small>{months[item.month - 1].slice(0, 3)}</small>
              </div>
            ))}
          </div>

          <div className={styles.legend}>
            <span><i className={styles.plannedLegend} />Presupuestado</span>
            <span><i className={styles.actualLegend} />Ejecutado</span>
          </div>
        </Card>
  );
}
