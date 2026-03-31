const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const jestBin = require.resolve('jest/bin/jest');
const originalArgs = process.argv.slice(2);
const startedAt = new Date();
const runId = startedAt.toISOString().replace(/[:.]/g, '-');
const evidenceDir = path.join(process.cwd(), 'testing', 'evidence');
fs.mkdirSync(evidenceDir, { recursive: true });

function hasFlag(args, flag) {
  return args.some((arg) => arg === flag || arg.startsWith(`${flag}=`));
}

function hasOption(args, option) {
  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === option || args[i].startsWith(`${option}=`)) {
      return true;
    }
  }
  return false;
}

function readOptionValue(args, option) {
  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (arg === option && i + 1 < args.length) {
      return args[i + 1];
    }
    if (arg.startsWith(`${option}=`)) {
      return arg.slice(option.length + 1);
    }
  }
  return null;
}

function pctString(bucket) {
  if (!bucket) return 'n/a';
  return `${bucket.pct}% (${bucket.covered}/${bucket.total})`;
}

const isWatchMode = hasFlag(originalArgs, '--watch') || hasFlag(originalArgs, '--watchAll');
const usesCoverage = hasFlag(originalArgs, '--coverage') || hasFlag(originalArgs, '--collectCoverage');
const jestArgs = [...originalArgs];

if (!isWatchMode && !hasFlag(jestArgs, '--verbose')) {
  jestArgs.push('--verbose');
}
if (!isWatchMode && !hasFlag(jestArgs, '--testLocationInResults')) {
  jestArgs.push('--testLocationInResults');
}

let resultsJsonPath = null;
if (!isWatchMode) {
  if (!hasFlag(jestArgs, '--json')) {
    jestArgs.push('--json');
  }

  if (!hasOption(jestArgs, '--outputFile')) {
    resultsJsonPath = path.join(evidenceDir, `jest-results-${runId}.json`);
    jestArgs.push('--outputFile', resultsJsonPath);
  } else {
    const value = readOptionValue(jestArgs, '--outputFile');
    resultsJsonPath = value ? path.resolve(process.cwd(), value) : null;
  }
}

const child = spawn(process.execPath, [jestBin, ...jestArgs], {
  env: process.env,
  stdio: ['inherit', 'pipe', 'pipe'],
});

let combinedOutput = '';

child.stdout.on('data', (chunk) => {
  const text = chunk.toString();
  combinedOutput += text;
  process.stdout.write(text);
});

child.stderr.on('data', (chunk) => {
  const text = chunk.toString();
  combinedOutput += text;
  process.stderr.write(text);
});

child.on('error', (error) => {
  process.stderr.write(`Failed to run Jest: ${error.message}\n`);
  process.exit(1);
});

child.on('close', (code) => {
  const finishedAt = new Date();
  const wallMs = finishedAt.getTime() - startedAt.getTime();

  const commandLine = `jest ${jestArgs.join(' ')}`.trim();
  const metrics = [];

  metrics.push('=== Evidence Metadata ===');
  metrics.push(`Started: ${startedAt.toISOString()}`);
  metrics.push(`Finished: ${finishedAt.toISOString()}`);
  metrics.push(`Wall Time (ms): ${wallMs}`);
  metrics.push(`Working Directory: ${process.cwd()}`);
  metrics.push(`Node Version: ${process.version}`);
  metrics.push(`Platform: ${process.platform} ${process.arch}`);
  metrics.push(`Watch Mode: ${isWatchMode}`);
  metrics.push(`Coverage Requested: ${usesCoverage}`);

  let parsedResults = null;
  if (resultsJsonPath && fs.existsSync(resultsJsonPath)) {
    try {
      parsedResults = JSON.parse(fs.readFileSync(resultsJsonPath, 'utf8'));
    } catch (error) {
      metrics.push(`Results JSON Parse Error: ${error.message}`);
    }
  }

  if (parsedResults) {
    const runtimeForSuite = (suite) => {
      if (typeof suite?.startTime === 'number' && typeof suite?.endTime === 'number') {
        return Math.max(0, suite.endTime - suite.startTime);
      }
      if (suite?.perfStats?.runtime && suite.perfStats.runtime > 0) {
        return suite.perfStats.runtime;
      }
      if (
        typeof suite?.perfStats?.start === 'number' &&
        typeof suite?.perfStats?.end === 'number'
      ) {
        return Math.max(0, suite.perfStats.end - suite.perfStats.start);
      }
      return 0;
    };

    const totalRuntimeMs = (parsedResults.testResults || []).reduce(
      (sum, suite) => sum + runtimeForSuite(suite),
      0
    );

    const slowestSuites = [...(parsedResults.testResults || [])]
      .sort((a, b) => runtimeForSuite(b) - runtimeForSuite(a))
      .slice(0, 10);

    const failedAssertions = [];
    for (const suite of parsedResults.testResults || []) {
      for (const assertion of suite.assertionResults || []) {
        if (assertion.status === 'failed') {
          failedAssertions.push({
            suite: suite.name,
            title: assertion.fullName,
          });
        }
      }
    }

    metrics.push('');
    metrics.push('=== Jest Metrics ===');
    metrics.push(`Success: ${parsedResults.success}`);
    metrics.push(`Suites: ${parsedResults.numPassedTestSuites}/${parsedResults.numTotalTestSuites} passed, ${parsedResults.numFailedTestSuites} failed, ${parsedResults.numPendingTestSuites} pending`);
    metrics.push(`Tests: ${parsedResults.numPassedTests}/${parsedResults.numTotalTests} passed, ${parsedResults.numFailedTests} failed, ${parsedResults.numPendingTests} pending, ${parsedResults.numTodoTests} todo`);
    metrics.push(`Total Suite Runtime (ms): ${totalRuntimeMs}`);
    if (parsedResults.snapshot) {
      metrics.push(`Snapshots: ${parsedResults.snapshot.matched || 0} matched, ${parsedResults.snapshot.unmatched || 0} unmatched, ${parsedResults.snapshot.added || 0} added`);
    }

    metrics.push('');
    metrics.push('=== Slowest Test Files (ms) ===');
    if (slowestSuites.length === 0) {
      metrics.push('None');
    } else {
      for (const suite of slowestSuites) {
        const name = path.relative(process.cwd(), suite.name || 'unknown');
        metrics.push(`${runtimeForSuite(suite)}ms - ${name}`);
      }
    }

    metrics.push('');
    metrics.push('=== Failed Assertions ===');
    if (failedAssertions.length === 0) {
      metrics.push('None');
    } else {
      for (const item of failedAssertions) {
        metrics.push(`${path.relative(process.cwd(), item.suite)} :: ${item.title}`);
      }
    }
  }

  if (usesCoverage) {
    const coveragePath = path.join(process.cwd(), 'coverage', 'coverage-summary.json');
    if (fs.existsSync(coveragePath)) {
      try {
        const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
        const coverageEntries = Object.entries(coverage).filter(
          ([file]) => file !== 'total'
        );

        metrics.push('');
        metrics.push('=== Coverage Totals ===');
        metrics.push(`Lines: ${pctString(coverage.total?.lines)}`);
        metrics.push(`Statements: ${pctString(coverage.total?.statements)}`);
        metrics.push(`Functions: ${pctString(coverage.total?.functions)}`);
        metrics.push(`Branches: ${pctString(coverage.total?.branches)}`);

        metrics.push('');
        metrics.push('=== Coverage by File ===');
        if (coverageEntries.length === 0) {
          metrics.push('No per-file coverage entries available.');
        } else {
          for (const [file, bucket] of coverageEntries.sort((a, b) => a[0].localeCompare(b[0]))) {
            metrics.push(
              `${file} | lines ${pctString(bucket.lines)} | stmts ${pctString(bucket.statements)} | funcs ${pctString(bucket.functions)} | branches ${pctString(bucket.branches)}`
            );
          }
        }
      } catch (error) {
        metrics.push('');
        metrics.push('=== Coverage Metrics ===');
        metrics.push(`Coverage Parse Error: ${error.message}`);
      }
    } else {
      metrics.push('');
      metrics.push('=== Coverage Metrics ===');
      metrics.push('Coverage summary file was not found for this run.');
    }
  }

  const header = [
    `Timestamp: ${finishedAt.toISOString()}`,
    `Command: ${commandLine}`,
    `Exit Code: ${code ?? 1}`,
    '',
  ].join('\n');

  const body = `${header}${combinedOutput}\n\n${metrics.join('\n')}\n`;
  const runFile = path.join(evidenceDir, `jest-output-${runId}.txt`);
  const latestFile = path.join(evidenceDir, 'latest.txt');

  fs.writeFileSync(runFile, body, 'utf8');
  fs.writeFileSync(latestFile, body, 'utf8');

  process.stdout.write(`\nSaved test evidence: ${path.relative(process.cwd(), runFile)}\n`);
  process.exit(code ?? 1);
});
