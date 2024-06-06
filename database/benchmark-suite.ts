import Benchmark, { BenchmarkBatched, BenchmarkResults } from '../interface/benchmark';
import { DBAdapter } from '../interface/db_adapter';
import { roundToTwoDigits } from './utils';

export class BenchmarkSuite {
  benchmarks: { name: string; dbAdapter: DBAdapter }[];

  constructor(benchmarks: { name: string; dbAdapter: DBAdapter }[]) {
    this.benchmarks = benchmarks;
  }

  async runBenchmarks(): Promise<string> {
    let results = [];
    for (const benchmark of this.benchmarks) {
      for (let i = 0; i < 3; i++) {
        let bm = new Benchmark(benchmark.name, benchmark.dbAdapter);
        results.push(await bm.runAll());
      }
    }
    console.log('');
    let first: BenchmarkResults = results[0];
    const csv: string = this.calculateAverage(results, first);
    return csv;
  }

  async runBatchedBenchmarks(): Promise<string> {
    let batch_results = [];
    for (const benchmark of this.benchmarks) {
      for (let i = 0; i < 3; i++) {
        let bmb = new BenchmarkBatched(`${benchmark.name}-batched`, benchmark.dbAdapter);
        batch_results.push(await bmb.runAll());
      }
    }
    console.log('');
    let second: BenchmarkResults = batch_results[0];
    const csv: string = this.calculateAverage(batch_results, second);
    return csv;
  }

  calculateAverage = (results: any[], benchmarkResults: BenchmarkResults) => {
    let s = `Test,${results.map((r) => r.suite).join(',')},Average\n`;
    for (let i = 0; i < benchmarkResults.results.length; i++) {
      let test = benchmarkResults.results[i].test;
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
    console.log(`Here are the results in CSV format:\n${s}`);
    return s;
  };
}
