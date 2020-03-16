/* eslint no-console: 0 */
/*
  - Serializing and parsing is faster with BufferTable, which is expected because the serializing and parsing is very minimal.
  - 
*/

import * as Benchmark from 'benchmark';
import { BufferTable, BType } from '../src';

let tb: BufferTable;
let json1: (number | boolean | string)[][];
let json2: {
  id: number;
  string1: string;
  integer1: number;
  string2: string;
  boolean1: boolean;
  string3: string;
}[];

let suite = new Benchmark.Suite();

suite
  .add('BufferTable addRow', () => {
    tb = BufferTable.create([
      BType.I8,
      BType.STR,
      BType.I32,
      BType.STR,
      BType.BOOL,
      BType.STR
    ]);

    for (let i = 1; i <= 100; i++) {
      tb.addRow([
        i,
        'Lorem',
        i * 247183,
        'Suspendisse',
        i % 2 === 0,
        'Curabitur et nisi malesuada, congue risus in, pharetra elit. Duis eget libero porttitor, facilisis nisl sit amet, mollis est. Quisque eleifend lacinia leo et lobortis. Sed ut vestibulum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget fringilla est. Vivamus scelerisque pulvinar nisi non rutrum. Duis porttitor sit amet leo quis vestibulum. Sed ac sem iaculis, pellentesque sem vitae, luctus metus. Cras quis eros non turpis rhoncus volutpat a vel est. Suspendisse porta nulla eu neque pulvinar, ac fermentum lectus bibendum. In hac habitasse platea dictumst. Cras nunc libero, porta at ante non, lobortis tempus velit. Curabitur lorem nibh, accumsan in euismod id, porta non felis. Curabitur condimentum maximus mi.'
      ]);
    }
  })
  .add('JSON Array add', () => {
    json1 = [];

    for (let i = 1; i <= 100; i++) {
      json1.push([
        i,
        'Lorem',
        i * 247183,
        'Suspendisse',
        i % 2 === 0,
        'Curabitur et nisi malesuada, congue risus in, pharetra elit. Duis eget libero porttitor, facilisis nisl sit amet, mollis est. Quisque eleifend lacinia leo et lobortis. Sed ut vestibulum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget fringilla est. Vivamus scelerisque pulvinar nisi non rutrum. Duis porttitor sit amet leo quis vestibulum. Sed ac sem iaculis, pellentesque sem vitae, luctus metus. Cras quis eros non turpis rhoncus volutpat a vel est. Suspendisse porta nulla eu neque pulvinar, ac fermentum lectus bibendum. In hac habitasse platea dictumst. Cras nunc libero, porta at ante non, lobortis tempus velit. Curabitur lorem nibh, accumsan in euismod id, porta non felis. Curabitur condimentum maximus mi.'
      ]);
    }
  })
  .add('JSON Object add', () => {
    json2 = [];

    for (let i = 1; i <= 100; i++) {
      json2.push({
        id: i,
        string1: 'Lorem',
        integer1: i * 247183,
        string2: 'Suspendisse',
        boolean1: i % 2 === 0,
        string3:
          'Curabitur et nisi malesuada, congue risus in, pharetra elit. Duis eget libero porttitor, facilisis nisl sit amet, mollis est. Quisque eleifend lacinia leo et lobortis. Sed ut vestibulum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget fringilla est. Vivamus scelerisque pulvinar nisi non rutrum. Duis porttitor sit amet leo quis vestibulum. Sed ac sem iaculis, pellentesque sem vitae, luctus metus. Cras quis eros non turpis rhoncus volutpat a vel est. Suspendisse porta nulla eu neque pulvinar, ac fermentum lectus bibendum. In hac habitasse platea dictumst. Cras nunc libero, porta at ante non, lobortis tempus velit. Curabitur lorem nibh, accumsan in euismod id, porta non felis. Curabitur condimentum maximus mi.'
      });
    }
  })
  .on('cycle', function(event: Benchmark.Event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: false });

suite = new Benchmark.Suite();
suite
  .add('BufferTable serializing and deserializing', () => {
    const buffer = tb.toUint8Array();
    const tb2 = BufferTable.from(buffer);

    tb2.setData(0, 2, 100);
    tb2.setData(0, 1, 'Boba');
    tb2.setData(1, 0, 5);
    tb2.setData(3, 4, false);
    tb2.deleteRow(0);

    const buffer2 = tb.toUint8Array();
    BufferTable.from(buffer2);
  })
  .add('JSON array stringify and parse', () => {
    const str = JSON.stringify(json1);
    const json = JSON.parse(str);

    json[0][2] = 100;
    json[0][1] = 'Boba';
    json[1][0] = 5;
    json[3][4] = false;
    json.splice(0, 1);

    const str2 = JSON.stringify(json);
    JSON.parse(str2);
  })
  .add('JSON object stringify and parse', () => {
    const str = JSON.stringify(json1);
    const json = JSON.parse(str);

    json[0].integer1 = 100;
    json[0].string1 = 'Boba';
    json[1].id = 5;
    json[3].boolean1 = false;
    json.splice(0, 1);

    const str2 = JSON.stringify(json);
    JSON.parse(str2);
  })
  .on('cycle', function(event: Benchmark.Event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
