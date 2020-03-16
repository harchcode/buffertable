/* eslint no-console: 0 */
/*
  - Serializing and parsing is faster with BufferTable, which is expected because the serializing and parsing is very minimal.
  - 
*/

import * as Benchmark from 'benchmark';
import { BufferTable, i8, str, i32, bool } from '../src/node';

const suite = new Benchmark.Suite();

let tbs = 0;
let jabs = 0;
let jobs = 0;

suite
  .add('BufferTable', function() {
    const tb = BufferTable.create([i8, str, i32, str, bool, str]);

    for (let i = 1; i <= 100; i++) {
      tb.addRow([
        i,
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce volutpat, arcu ac vulputate sodales, quam tortor faucibus lectus, sit amet convallis lectus nulla sit amet elit. Nullam consequat neque metus, sed lacinia lectus rhoncus ac. Nunc mattis tristique mauris in fermentum. Vestibulum porttitor lacinia justo, non feugiat ante porttitor ac. Nam hendrerit leo tortor, ut vestibulum elit interdum vel. Proin dictum auctor tortor, a pellentesque quam pretium nec. Donec varius tortor eu rutrum sollicitudin. Sed in condimentum eros, at ornare arcu. Sed lacinia augue eu orci ornare, malesuada viverra risus maximus. Duis fermentum turpis nec arcu malesuada iaculis. Donec luctus, mi nec efficitur posuere, ex augue faucibus elit, vitae mattis nisl magna vitae nulla. Phasellus sed leo ut turpis efficitur sagittis. Donec eget libero eget nisi tincidunt luctus.',
        i * 247183,
        'Suspendisse non neque efficitur, lobortis elit sit amet, suscipit orci. Ut placerat vitae orci feugiat congue. Donec bibendum, tortor non vulputate aliquet, nunc nunc ornare nulla, sit amet molestie est massa quis lacus. Sed eget pretium risus. Proin lacinia velit at lacus eleifend tempor. Proin magna ligula, rutrum vitae nunc sit amet, auctor congue dui. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec nec venenatis augue. Suspendisse mollis metus non porttitor fringilla. Suspendisse in elit ac orci interdum bibendum. Suspendisse mollis efficitur tempor.',
        i % 2 === 0,
        'Curabitur et nisi malesuada, congue risus in, pharetra elit. Duis eget libero porttitor, facilisis nisl sit amet, mollis est. Quisque eleifend lacinia leo et lobortis. Sed ut vestibulum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget fringilla est. Vivamus scelerisque pulvinar nisi non rutrum. Duis porttitor sit amet leo quis vestibulum. Sed ac sem iaculis, pellentesque sem vitae, luctus metus. Cras quis eros non turpis rhoncus volutpat a vel est. Suspendisse porta nulla eu neque pulvinar, ac fermentum lectus bibendum. In hac habitasse platea dictumst. Cras nunc libero, porta at ante non, lobortis tempus velit. Curabitur lorem nibh, accumsan in euismod id, porta non felis. Curabitur condimentum maximus mi.'
      ]);
    }

    const buffer = tb.getBuffer();
    if (!tbs) tbs = buffer.length;
    const tb2 = BufferTable.from(buffer);

    tb2.setData(0, 2, 100);
    tb2.setData(0, 1, 'Boba');
    tb2.setData(1, 0, 5);
    tb2.setData(3, 4, false);
    tb2.deleteRow(0);

    const buffer2 = tb.getBuffer();
    BufferTable.from(buffer2);
  })
  .add('JSON array', function() {
    const tb: (number | boolean | string)[][] = [];

    for (let i = 1; i <= 100; i++) {
      tb.push([
        i,
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce volutpat, arcu ac vulputate sodales, quam tortor faucibus lectus, sit amet convallis lectus nulla sit amet elit. Nullam consequat neque metus, sed lacinia lectus rhoncus ac. Nunc mattis tristique mauris in fermentum. Vestibulum porttitor lacinia justo, non feugiat ante porttitor ac. Nam hendrerit leo tortor, ut vestibulum elit interdum vel. Proin dictum auctor tortor, a pellentesque quam pretium nec. Donec varius tortor eu rutrum sollicitudin. Sed in condimentum eros, at ornare arcu. Sed lacinia augue eu orci ornare, malesuada viverra risus maximus. Duis fermentum turpis nec arcu malesuada iaculis. Donec luctus, mi nec efficitur posuere, ex augue faucibus elit, vitae mattis nisl magna vitae nulla. Phasellus sed leo ut turpis efficitur sagittis. Donec eget libero eget nisi tincidunt luctus.',
        i * 247183,
        'Suspendisse non neque efficitur, lobortis elit sit amet, suscipit orci. Ut placerat vitae orci feugiat congue. Donec bibendum, tortor non vulputate aliquet, nunc nunc ornare nulla, sit amet molestie est massa quis lacus. Sed eget pretium risus. Proin lacinia velit at lacus eleifend tempor. Proin magna ligula, rutrum vitae nunc sit amet, auctor congue dui. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec nec venenatis augue. Suspendisse mollis metus non porttitor fringilla. Suspendisse in elit ac orci interdum bibendum. Suspendisse mollis efficitur tempor.',
        i % 2 === 0,
        'Curabitur et nisi malesuada, congue risus in, pharetra elit. Duis eget libero porttitor, facilisis nisl sit amet, mollis est. Quisque eleifend lacinia leo et lobortis. Sed ut vestibulum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget fringilla est. Vivamus scelerisque pulvinar nisi non rutrum. Duis porttitor sit amet leo quis vestibulum. Sed ac sem iaculis, pellentesque sem vitae, luctus metus. Cras quis eros non turpis rhoncus volutpat a vel est. Suspendisse porta nulla eu neque pulvinar, ac fermentum lectus bibendum. In hac habitasse platea dictumst. Cras nunc libero, porta at ante non, lobortis tempus velit. Curabitur lorem nibh, accumsan in euismod id, porta non felis. Curabitur condimentum maximus mi.'
      ]);
    }

    const json = JSON.stringify(tb);
    if (!jabs) jabs = json.length;
    const tb2 = JSON.parse(json);

    tb2[0][2] = 100;
    tb2[0][1] = 'Boba';
    tb2[1][0] = 5;
    tb2[3][4] = false;
    tb2.splice(0, 1);

    const json2 = JSON.stringify(tb2);
    JSON.parse(json2);
  })
  .add('JSON object', function() {
    const tb: {
      id: number;
      string1: string;
      integer1: number;
      string2: string;
      boolean1: boolean;
      string3: string;
    }[] = [];

    for (let i = 1; i <= 100; i++) {
      tb.push({
        id: i,
        string1:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce volutpat, arcu ac vulputate sodales, quam tortor faucibus lectus, sit amet convallis lectus nulla sit amet elit. Nullam consequat neque metus, sed lacinia lectus rhoncus ac. Nunc mattis tristique mauris in fermentum. Vestibulum porttitor lacinia justo, non feugiat ante porttitor ac. Nam hendrerit leo tortor, ut vestibulum elit interdum vel. Proin dictum auctor tortor, a pellentesque quam pretium nec. Donec varius tortor eu rutrum sollicitudin. Sed in condimentum eros, at ornare arcu. Sed lacinia augue eu orci ornare, malesuada viverra risus maximus. Duis fermentum turpis nec arcu malesuada iaculis. Donec luctus, mi nec efficitur posuere, ex augue faucibus elit, vitae mattis nisl magna vitae nulla. Phasellus sed leo ut turpis efficitur sagittis. Donec eget libero eget nisi tincidunt luctus.',
        integer1: i * 247183,
        string2:
          'Suspendisse non neque efficitur, lobortis elit sit amet, suscipit orci. Ut placerat vitae orci feugiat congue. Donec bibendum, tortor non vulputate aliquet, nunc nunc ornare nulla, sit amet molestie est massa quis lacus. Sed eget pretium risus. Proin lacinia velit at lacus eleifend tempor. Proin magna ligula, rutrum vitae nunc sit amet, auctor congue dui. Interdum et malesuada fames ac ante ipsum primis in faucibus. Donec nec venenatis augue. Suspendisse mollis metus non porttitor fringilla. Suspendisse in elit ac orci interdum bibendum. Suspendisse mollis efficitur tempor.',
        boolean1: i % 2 === 0,
        string3:
          'Curabitur et nisi malesuada, congue risus in, pharetra elit. Duis eget libero porttitor, facilisis nisl sit amet, mollis est. Quisque eleifend lacinia leo et lobortis. Sed ut vestibulum odio. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc eget fringilla est. Vivamus scelerisque pulvinar nisi non rutrum. Duis porttitor sit amet leo quis vestibulum. Sed ac sem iaculis, pellentesque sem vitae, luctus metus. Cras quis eros non turpis rhoncus volutpat a vel est. Suspendisse porta nulla eu neque pulvinar, ac fermentum lectus bibendum. In hac habitasse platea dictumst. Cras nunc libero, porta at ante non, lobortis tempus velit. Curabitur lorem nibh, accumsan in euismod id, porta non felis. Curabitur condimentum maximus mi.'
      });
    }

    const json = JSON.stringify(tb);
    if (!jobs) jobs = json.length;
    const tb2 = JSON.parse(json);

    tb2[0].integer1 = 100;
    tb2[0].string1 = 'Boba';
    tb2[1].id = 5;
    tb2[3].boolean1 = false;
    tb2.splice(0, 1);

    const json2 = JSON.stringify(tb2);
    JSON.parse(json2);
  })
  .on('cycle', function(event: Benchmark.Event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
    console.log(`TBS: ${tbs} bytes`);
    console.log(`JABS: ${jabs} bytes`);
    console.log(`JOBS: ${jobs} bytes`);
  })
  // run async
  .run({ async: true });
