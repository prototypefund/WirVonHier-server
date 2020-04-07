/* eslint-disable */
import * as fs from 'fs';
import * as path from 'path';
import parse from 'csv-parse';

export function parseCSV(): Promise<any> {
  return new Promise((resolve) => {
    const output: any = [];
    const parser = parse({
      delimiter: '\t',
      columns: true,
    })
    // Use the readable stream api
    parser.on('readable', function(){
      let record
      while (record = parser.read()) {
        output.push(record)
      }
    })
    // Catch any error
    parser.on('error', function(err){
      console.error(err.message)
    })
    // When we are done, test that the parsed output matched what expected
    parser.on('end', function(){
      resolve(output);
    })
    const rawData = fs.readFileSync(path.resolve(__dirname, './data.txt'));
    parser.write(rawData)
    parser.end()
  })
}