import { runAutomatedTests } from './numericalTests';

console.log('Running numerical analysis test suite...');
const summary = runAutomatedTests();

console.log(`\n========================================`);
console.log(`TOTAL TESTS: ${summary.total} | PASSED: ${summary.passed} | FAILED: ${summary.failed}`);
console.log(`Duration: ${summary.durationMs.toFixed(2)} ms`);
console.log(`========================================\n`);

summary.results.forEach((r, idx) => {
  const statusIcon = r.passed ? '✓ PASS' : '✗ FAIL';
  console.log(`${idx + 1}. [${statusIcon}] ${r.name}`);
  console.log(`   Expected: ${r.expected}`);
  console.log(`   Actual:   ${r.actual}`);
  if (r.errorMargin !== undefined) {
    console.log(`   Error:    ${r.errorMargin.toExponential(4)}`);
  }
  if (!r.passed) {
    console.log(`   Details:  ${r.details}`);
  }
});

if (summary.failed > 0) {
  process.exit(1);
} else {
  console.log('\nAll numerical validation tests passed successfully!');
}
