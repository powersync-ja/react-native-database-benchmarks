import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { BenchmarkSuite } from './database/benchmark-suite';
import { OPSqliteAdapter, ExpoSqliteAdapter, ExpoNextSqliteAdapter } from './adapters/adapters';
// import { PowersyncSqliteAdapter } from './adapters/powersync-sqlite-adapter';
import { BenchmarkResults } from './interface/benchmark';
import { readString } from 'react-native-csv';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
/**
 * RNQuickSqliteAdapter requires removing the @journeyapps/react-native-quick-sqlite libraries
 * Running the tests requires a manual switch from journeyapps to react-native-quick-sqlite
 * They cannot both be added into the same project as their build configs conflict.
 */
import { RNQuickSqliteAdapter } from './adapters/rn-quick-sqlite-adapter';

export default function App() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>([]);
  const [times, setTimes] = useState<number>(0);
  const [csvString, setCsvString] = useState<string>('');
  const [json, setJson] = useState<any[]>([]);

  let groupByN = (n: number, arr: any[]) => {
    let result = [];
    for (let i = 0; i < arr.length; i += n) result.push(arr.slice(i, i + n));
    return result;
  };

  useEffect(() => {
    const runTests = async () => {
      try {
        let opSqliteAdapter = new OPSqliteAdapter();
        let expoSqliteAdapter = new ExpoSqliteAdapter();
        // let psSqliteAdapter = new PowersyncSqliteAdapter();
        let expoNextAdapter = new ExpoNextSqliteAdapter();
        let rnQuickSqliteAdapter = new RNQuickSqliteAdapter();
        let benchmarks = [
          // { name: 'op-sqlite', dbAdapter: opSqliteAdapter }
          // { name: 'ps-sqlite', dbAdapter: psSqliteAdapter }
          { name: 'rn-quick-sqlite', dbAdapter: rnQuickSqliteAdapter }
          // { name: 'expo-sqlite', dbAdapter: expoSqliteAdapter }
          // { name: 'expo-next-sqlite', dbAdapter: expoNextAdapter }
        ];
        let benchmarkSuite = new BenchmarkSuite(benchmarks);
        let results = await benchmarkSuite.runBenchmarks();

        let first: BenchmarkResults = results[0];
        let s = `Test,${results.map((r) => r.suite).join(',')},Average\n`;
        for (let i = 0; i < first.results.length; i++) {
          let test = first.results[i].test;
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
        let json = readString(s, {
          delimiter: ','
        });
        console.log(json);
        setJson(json.data);
        setCsvString(s);
      } catch (err) {
        console.error(err);
      }
    };

    runTests().then(() => console.log('DONE'));
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.container}>
          <Text>React native benchmarks</Text>
        </View>
        {!!times && <Text>Normal query {times.toFixed(2)} ms</Text>}
        {!!csvString && <Text>{csvString}</Text>}
        <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }}>
          <Rows data={json} />
        </Table>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center'
  },
  head: { height: 40, backgroundColor: '#f1f8ff' },
  text: { margin: 6 }
});
