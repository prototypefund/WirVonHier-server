import Agenda from 'agenda';
import mongoose from 'mongoose';
import { geolocateBusinesses } from './geoserviceAgenda';
import { imageCleanupJob } from './imageCleanup';

export const jobs: { agenda: Agenda } = { agenda: (null as unknown) as Agenda };

export class Jobs {
  public agenda!: Agenda;

  constructor(mongo: typeof mongoose) {
    this.agenda = new Agenda();
    const collection = mongo.connection.collection('jobs_agenda').conn.db;

    this.agenda
      .mongo(collection, 'jobs_agenda')
      .maxConcurrency(1)
      .name('agenda' + '-' + process.pid);
    jobs.agenda = this.agenda;
  }

  public async start(): Promise<void> {
    await this.agenda.start();
    geolocateBusinesses(this.agenda);
    imageCleanupJob(this.agenda);
  }
}
