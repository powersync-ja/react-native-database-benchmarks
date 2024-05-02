import Benchmark, { BenchmarkBatched, BenchmarkResults } from '../interface/benchmark';
import { DBAdapter } from '../interface/db_adapter';
import { roundToTwoDigits } from './utils';

export class BenchmarkSuite {
  benchmarks: { name: string; dbAdapter: DBAdapter }[];

  constructor(benchmarks: { name: string; dbAdapter: DBAdapter }[]) {
    this.benchmarks = benchmarks;
  }

  async runBenchmarks(): Promise<BenchmarkResults[]> {
    let results = [];
    for (const benchmark of this.benchmarks) {
      for (let i = 0; i < 3; i++) {
        let bm = new Benchmark(benchmark.name, benchmark.dbAdapter);
        results.push(await bm.runAll());
      }
      // for (let i = 0; i < 3; i++) {
      //   let bmb = new BenchmarkBatched(`${benchmark.name}-batched`, benchmark.dbAdapter);
      //   results.push(await bmb.runAll());
      // }
    }
    return results;
    // console.log('');
    // let s = `,Test,${results.map((r) => r.suite).join(',')}`;
    // console.log(s);
    // let first: BenchmarkResults = results[0];
    // for (let i = 0; i < first.results.length; i++) {
    //   let test = first.results[i].test;
    //   let s = `,${test}`;
    //   for (const rr of results) {
    //     let r3 = rr.results[i].duration;
    //     s += `,${r3}`;
    //   }
    //   console.log(s);
    // }
  }
}
