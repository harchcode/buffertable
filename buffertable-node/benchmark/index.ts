import Benchmark from 'benchmark';

const suite = new Benchmark.Suite();

suite
  .add('JSON stringify and parse', function() {
    const tmp = JSON.stringify({ abc: 'def' });
    JSON.parse(tmp);
  })
  .on('cycle', function(event) {
    console.log(String(event.target));
  })
  .on('complete', function() {
    console.log('Fastest is ' + this.filter('fastest').map('name'));
  })
  .run({ async: true });
