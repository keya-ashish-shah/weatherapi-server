const assert = require("assert");
const {
  validateRegister,
  validateLogin,
  validateWeather,
} = require("../middleware/validationMiddleware");

function makeRes() {
  return {
    statusCode: null,
    jsonData: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(obj) {
      this.jsonData = obj;
      return this;
    },
  };
}

async function runMiddleware(mw, req) {
  const res = makeRes();
  let nextCalled = false;
  await new Promise((resolve) => {
    const next = () => {
      nextCalled = true;
      resolve();
    };
    try {
      const ret = mw(req, res, next);
      if (ret && typeof ret.then === "function") {
        ret.then(() => resolve()).catch(() => resolve());
      } else {
        // wait a tick: middleware may have called next synchronously
        setImmediate(resolve);
      }
    } catch (e) {
      // middleware threw synchronously
      setImmediate(resolve);
    }
  });
  return { nextCalled, res, req };
}

async function runTests() {
  const results = [];
  try {
    // validateRegister - valid
    {
      const email = `test${Date.now()}@example.com`;
      const req = { body: { name: "Alice", email, dob: "1990-01-01", password: "secret123" } };
      const { nextCalled, res, req: outReq } = await runMiddleware(validateRegister, req);
      assert.strictEqual(nextCalled, true, "validateRegister should call next for valid input");
      assert.strictEqual(outReq.body.email, email.toLowerCase());
      results.push("register valid: PASS");
    }

    // validateRegister - invalid email
    {
      const req = { body: { name: "Bob", email: "bad@@", dob: "1990-01-01", password: "secret123" } };
      const { nextCalled, res } = await runMiddleware(validateRegister, req);
      assert.strictEqual(nextCalled, false, "validateRegister should NOT call next for invalid email");
      assert.strictEqual(res.statusCode, 400);
      results.push("register invalid email: PASS");
    }

    // validateRegister - missing fields
    {
      const req = { body: { email: "a@b.com" } };
      const { nextCalled, res } = await runMiddleware(validateRegister, req);
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      results.push("register missing fields: PASS");
    }

    // validateRegister - short password
    {
      const req = { body: { name: "C", email: "c@d.com", dob: "1990-01-01", password: "123" } };
      const { nextCalled, res } = await runMiddleware(validateRegister, req);
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      results.push("register short password: PASS");
    }

    // validateLogin - valid
    {
      const req = { body: { email: "u@e.com", password: "pw12345" } };
      const { nextCalled } = await runMiddleware(validateLogin, req);
      assert.strictEqual(nextCalled, true);
      results.push("login valid: PASS");
    }

    // validateLogin - missing password
    {
      const req = { body: { email: "u@e.com" } };
      const { nextCalled, res } = await runMiddleware(validateLogin, req);
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      results.push("login missing password: PASS");
    }

    // validateWeather - GET with city
    {
      const req = { method: "GET", query: { city: "London" } };
      const { nextCalled, req: outReq } = await runMiddleware(validateWeather, req);
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(outReq.query.city, "London");
      results.push("weather GET city valid: PASS");
    }

    // validateWeather - GET with lat/lon strings (conversion)
    {
      const req = { method: "GET", query: { latitude: "51.5", longitude: "-0.1" } };
      const { nextCalled, req: outReq } = await runMiddleware(validateWeather, req);
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(typeof outReq.query.latitude, "number");
      assert.strictEqual(typeof outReq.query.longitude, "number");
      results.push("weather GET lat/lon conversion: PASS");
    }

    // validateWeather - GET invalid (no params)
    {
      const req = { method: "GET", query: {} };
      const { nextCalled, res } = await runMiddleware(validateWeather, req);
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      results.push("weather GET missing params: PASS");
    }

    // validateWeather - POST valid lat/lon
    {
      const req = { method: "POST", body: { latitude: 40.7, longitude: -74.0 } };
      const { nextCalled } = await runMiddleware(validateWeather, req);
      assert.strictEqual(nextCalled, true);
      results.push("weather POST lat/lon valid: PASS");
    }

    // validateWeather - POST invalid lat without lon
    {
      const req = { method: "POST", body: { latitude: 10 } };
      const { nextCalled, res } = await runMiddleware(validateWeather, req);
      assert.strictEqual(nextCalled, false);
      assert.strictEqual(res.statusCode, 400);
      results.push("weather POST lat without lon: PASS");
    }

    console.log("All validation tests passed:");
    results.forEach((r) => console.log(" -", r));
    return true;
  } catch (err) {
    console.error("Test failure:", err.message || err);
    return false;
  }
}

if (require.main === module) {
  (async () => {
    const ok = await runTests();
    process.exit(ok ? 0 : 1);
  })();
}

module.exports = { runTests };
