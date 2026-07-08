import WDIOReporter from '@wdio/reporter';
import * as fs from 'fs';
import * as path from 'path';

interface ResultEntry {
  specFile: string;
  suite: string;
  test: string;
  tcId: string | null;
  state: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  timestamp: string;
}

/**
 * WDIO spawns one worker process per spec file, so each instance of this
 * reporter only ever sees its own file's tests. It writes one JSON file per
 * spec run rather than trying to share state across workers - generate-report.js
 * aggregates every file under mobile/reports/results/ and keeps the most
 * recent entry per test title, so a partial re-run only overwrites the tests
 * it actually re-ran.
 */
export default class JsonResultsReporter extends WDIOReporter {
  private results: ResultEntry[] = [];
  private currentSuite = '';

  constructor(options: Record<string, unknown>) {
    super(options);
  }

  onSuiteStart(suite: { title: string }): void {
    this.currentSuite = suite.title;
  }

  private record(test: { title: string; _duration?: number }, state: ResultEntry['state']): void {
    const tcMatch = test.title.match(/TC_\d+/);
    this.results.push({
      specFile: this.currentSuite,
      suite: this.currentSuite,
      test: test.title,
      tcId: tcMatch ? tcMatch[0] : null,
      state,
      durationMs: test._duration ?? 0,
      timestamp: new Date().toISOString(),
    });
  }

  onTestPass(test: { title: string; _duration?: number }): void {
    this.record(test, 'passed');
  }

  onTestFail(test: { title: string; _duration?: number }): void {
    this.record(test, 'failed');
  }

  onTestSkip(test: { title: string; _duration?: number }): void {
    this.record(test, 'skipped');
  }

  onRunnerEnd(): void {
    const outDir = path.join(process.cwd(), 'mobile', 'reports', 'results');
    fs.mkdirSync(outDir, { recursive: true });
    const safeSuite = (this.results[0]?.specFile ?? 'unknown').replace(/[^a-z0-9]+/gi, '-');
    const outFile = path.join(outDir, `${safeSuite}-${process.pid}-${Date.now()}.json`);
    fs.writeFileSync(outFile, JSON.stringify(this.results, null, 2));
  }
}
