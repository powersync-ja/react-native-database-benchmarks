import Benchmark, { BenchmarkBatched, BenchmarkResults } from '../interface/benchmark';
import { DBAdapter } from '../interface/db_adapter';
import { roundToTwoDigits } from './utils';

export class BenchmarkSuite {
  benchmarks: { name: string; dbAdapter: DBAdapter }[];

  constructor(benchmarks: { name: string; dbAdapter: DBAdapter }[]) {
    this.benchmarks = benchmarks;
  }

  async runBenchmarks(): Promise<void> {
    let results = [];
    for (const benchmark of this.benchmarks) {
      for (let i = 0; i < 3; i++) {
        let bm = new Benchmark(benchmark.name, benchmark.dbAdapter);
        results.push(await bm.runAll());
      }
    }
    console.log('');
    let first: BenchmarkResults = results[0];
    this.calculateAverage(results, first);
  }

  async runBatchedBenchmarks() {
    let batch_results = [];
    for (const benchmark of this.benchmarks) {
      for (let i = 0; i < 3; i++) {
        let bmb = new BenchmarkBatched(`${benchmark.name}-batched`, benchmark.dbAdapter);
        batch_results.push(await bmb.runAll());
      }
    }
    console.log('');
    let second: BenchmarkResults = batch_results[0];
    this.calculateAverage(batch_results, second);
  }

  calculateAverage = (results: any[], benchmarkResults: BenchmarkResults) => {
    let s = `Test,${results.map((r) => r.suite).join(',')},Average\n`;
    for (let i = 0; i < benchmarkResults.results.length; i++) {
      let test = benchmarkResults.results[i].test;
      // let s = `,${test}`;
      s += `${test}`;
      let avg = 0;
      for (const rr of results) {
        let r3 = rr.results[i].duration;
        if (typeof r3 === 'number') {
          avg += r3;
        }
        s += `,${r3}`;
      }
      let average = avg / 3;
      s += `,${average.toFixed(2)}\n`;
    }
    console.log(s);
  };
}
