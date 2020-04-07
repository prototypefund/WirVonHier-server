import Agenda from 'agenda';
import mongoose from 'mongoose';
import { geolocateBusinesses } from './geoserviceAgenda';

export class Jobs {
  private agenda!: Agenda;

  constructor(mongo: typeof mongoose) {
    this.agenda = new Agenda();
    const collection = mongo.connection.collection('jobs_agenda').conn.db;

    this.agenda
      .mongo(collection, 'jobs_agenda')
      .maxConcurrency(1)
      .name('agenda' + '-' + process.pid);
  }

  public async start(): Promise<void> {
    await this.agenda.start();
    geolocateBusinesses(this.agenda);
  }
}
