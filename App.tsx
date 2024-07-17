import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, SafeAreaView, ScrollView } from 'react-native';
import { BenchmarkSuite } from './database/benchmark-suite';
import { OPSqliteAdapter, ExpoSqliteAdapter } from './adapters/adapters';
// import { PowersyncSqliteAdapter } from './adapters/powersync-sqlite-adapter';
import { readString } from 'react-native-csv';
import { Table, Rows } from 'react-native-reanimated-table';
import 'react-native-get-random-values'; //[Error: crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported]
/**
 * RNQuickSqliteAdapter requires removing the @journeyapps/react-native-quick-sqlite libraries
 * Running the tests requires a manual switch from journeyapps to react-native-quick-sqlite
 * They cannot both be added into the same project as their build configs conflict.
 */
import { RNQuickSqliteAdapter } from './adapters/rn-quick-sqlite-adapter';

export default function App() {
  const [times, setTimes] = useState<number>(0);
  const [csvString, setCsvString] = useState<string>('');
  const [json, setJson] = useState<any[]>([]);
  const [jsonBatched, setJsonBatched] = useState<any[]>([]);

  useEffect(() => {
    const runTests = async () => {
      try {
        let opSqliteAdapter = new OPSqliteAdapter();
        let expoSqliteAdapter = new ExpoSqliteAdapter();
        // let psSqliteAdapter = new PowersyncSqliteAdapter();
        let rnQuickSqliteAdapter = new RNQuickSqliteAdapter();
        let benchmarks = [
          // { name: 'op-sqlite', dbAdapter: opSqliteAdapter }
          // { name: 'ps-sqlite', dbAdapter: psSqliteAdapter }
          // { name: 'rn-quick-sqlite', dbAdapter: rnQuickSqliteAdapter }
          { name: 'expo-sqlite', dbAdapter: expoSqliteAdapter }
        ];
        let benchmarkSuite = new BenchmarkSuite(benchmarks);
        let s = await benchmarkSuite.runBenchmarks();
        let sb = await benchmarkSuite.runBatchedBenchmarks();

        let json = readString(s, {
          delimiter: ','
        });
        setJson(json.data);

        let jsonBatched = readString(sb, { delimiter: ',' });
        setJsonBatched(jsonBatched.data);

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
        <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }} style={{ paddingBottom: 10 }}>
          <Rows data={json} />
        </Table>
        <Table borderStyle={{ borderWidth: 2, borderColor: '#c8e1ff' }} style={{ paddingBottom: 20 }}>
          <Rows data={jsonBatched} />
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
