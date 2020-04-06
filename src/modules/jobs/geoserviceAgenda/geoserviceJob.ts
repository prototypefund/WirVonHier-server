import { config } from 'config';
import Agenda from 'agenda';
import { GeoService } from 'modules/services';

// ? config.mongoAgenda , config.agenda
const { user, pass } = config.mongo;
const mongoConnectionString = `mongodb://${user}:${pass}127.0.0.1:27017/wirvonhier`;

// Instantiation
const agenda = new Agenda();
agenda
  .database(mongoConnectionString, 'geoserviceAgenda')
  .maxConcurrency(1)
  .name('agenda' + '-' + process.pid);

agenda.define('geoservice-search-request', { priority: 'highest', concurrency: 1 }, (job, done) => {
  GeoService.updateData(GeoService.sendQuery(job.attrs.data));
  done();
});

(async function (): Promise<void> {
  // Wait for Connection befor saving a job
  await agenda.start();
  const geoserviceQuery = GeoService.getSearchQuery();
  await (await agenda.every('1 seconds', 'geoservice-search-request', { query: geoserviceQuery })).save();
})();
