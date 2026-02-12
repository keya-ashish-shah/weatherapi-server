const { runTests } = require("../tests/validationUnitTests");

(async () => {
  const ok = await runTests();
  process.exit(ok ? 0 : 1);
})();
