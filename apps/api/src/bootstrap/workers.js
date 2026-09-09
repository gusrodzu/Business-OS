import {startIntegrationWorker, stopIntegrationWorker} from '../services/integrationWorker.js';
import {startIntelligenceWorker, stopIntelligenceWorker} from '../services/intelligenceWorker.js';
import {startHousekeepingWorker, stopHousekeepingWorker} from '../services/housekeepingWorker.js';
import {startAgendaReminderWorker, stopAgendaReminderWorker} from '../services/agendaReminderWorker.js';

const workers = [
  {name: 'integrations', start: startIntegrationWorker, stop: stopIntegrationWorker},
  {name: 'intelligence', start: startIntelligenceWorker, stop: stopIntelligenceWorker},
  {name: 'housekeeping', start: startHousekeepingWorker, stop: stopHousekeepingWorker},
  {name: 'agenda-reminders', start: startAgendaReminderWorker, stop: stopAgendaReminderWorker},
];

export function startWorkers() {
  for (const worker of workers) worker.start();
}

export function stopWorkers() {
  for (const worker of [...workers].reverse()) worker.stop();
}

export function listWorkers() {
  return workers.map(({name}) => name);
}
