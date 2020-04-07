/* eslint-disable @typescript-eslint/no-explicit-any */
import parse from 'csv-parse';

export class TransformDataService {
  parseCSV(csv: string): any {
    return new Promise((resolve) => {
      const output: any = [];
      const parser = parse({
        delimiter: '\t',
        columns: true, // we parse headeers
      });

      parser.on('readable', function () {
        let record;
        while ((record = parser.read())) {
          output.push(record);
        }
      });

      parser.on('error', function () {
        // Catch any error
      });

      parser.on('end', function () {
        resolve(output);
      });
      parser.write(csv);
      parser.end();
    });
  }
}

export const transformDataService = new TransformDataService();
