import { retrieve } from '@/lib/retrieval/retrieve';

const transitionHeading = 'Transition Warning Signs (Moving Toward Middle Stage)';

const transitionQueries = [
  'my mom needs help getting dressed now',
  'she gets confused in the afternoon',
  "she didn't recognize me yesterday",
];

async function runTest(query: string, expectedHeading?: string): Promise<boolean> {
  const startedAt = performance.now();

  try {
    const results = await retrieve(query, 1, 3);
    const latency = performance.now() - startedAt;
    const headingMatched = expectedHeading === undefined || results.some((result) => result.heading === expectedHeading);
    const topResult = results[0];
    const stageFilterPassed =
      expectedHeading !== undefined ||
      topResult === undefined ||
      !/^stages\/0[23] - /.test(topResult.doc_path);
    const latencyPassed = latency < 800;
    const passed = headingMatched && stageFilterPassed && latencyPassed;
    const details = [
      expectedHeading === undefined
        ? `top-1=${topResult?.heading ?? 'none'}`
        : `heading=${headingMatched ? 'match' : 'miss'}`,
      expectedHeading === undefined ? `stage-filter=${stageFilterPassed ? 'pass' : 'fail'}` : null,
      `latency=${latency.toFixed(0)}ms`,
    ]
      .filter((detail): detail is string => detail !== null)
      .join(', ');

    console.log(`${passed ? 'PASS' : 'FAIL'} ${query} (${details})`);
    return passed;
  } catch (error) {
    const latency = performance.now() - startedAt;
    console.log(`FAIL ${query} (error=${error instanceof Error ? error.message : String(error)}, latency=${latency.toFixed(0)}ms)`);
    return false;
  }
}

async function main(): Promise<void> {
  const transitionResults = await Promise.all(transitionQueries.map((query) => runTest(query, transitionHeading)));
  const earlyVariancePassed = await runTest('she forgets her keys sometimes');
  const allPassed = transitionResults.every(Boolean) && earlyVariancePassed;

  console.log(allPassed ? 'PASS retrieval validation' : 'FAIL retrieval validation');
  process.exitCode = allPassed ? 0 : 1;
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
