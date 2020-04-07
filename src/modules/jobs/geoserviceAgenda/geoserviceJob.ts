import Agenda from 'agenda';
import { geoService } from 'modules/services';

export async function geolocateBusinesses(agenda: Agenda): Promise<void> {
  agenda.define('geoservice-search-request', { priority: 'highest', concurrency: 1 }, (_job, done) => {
    geoService.locateAndUpdate(geoService.nextItem);
    done();
  });
  const job = await agenda.every('2 seconds', 'geoservice-search-request');
  job.save();
  geoService.init();
}
