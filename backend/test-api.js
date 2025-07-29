const https = require("https");
const http = require("http");

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith("https");
    const module = isHttps ? https : http;

    const requestOptions = {
      method: options.method || "GET",
      headers: options.headers || {},
    };

    const req = module.request(url, requestOptions, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on("error", reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

async function testAPI() {
  try {
    // First login with instructor account
    console.log("Testing instructor login...");
    const loginResponse = await makeRequest(
      "http://localhost:3761/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: "instructor1@test.com",
          password: "password123",
        }),
      }
    );

    console.log("Login response status:", loginResponse.status);
    console.log("Login response:", loginResponse.data);

    if (!loginResponse.data.success || !loginResponse.data.data.token) {
      console.log("Login failed");
      return;
    }

    const token = loginResponse.data.data.token;
    console.log("Got token:", token.substring(0, 20) + "...");

    // Test enrollments/instructor endpoint
    console.log("\nTesting /api/enrollments/instructor endpoint...");
    const enrollmentsResponse = await makeRequest(
      "http://localhost:3761/api/enrollments/instructor",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Enrollments response status:", enrollmentsResponse.status);
    console.log(
      "Enrollments data:",
      JSON.stringify(enrollmentsResponse.data, null, 2)
    );

    // Test analytics/instructor/overview endpoint
    console.log("\nTesting /api/analytics/instructor/overview endpoint...");
    const overviewResponse = await makeRequest(
      "http://localhost:3761/api/analytics/instructor/overview",
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Overview response status:", overviewResponse.status);
    console.log(
      "Overview data:",
      JSON.stringify(overviewResponse.data, null, 2)
    );
  } catch (error) {
    console.error("Test error:", error);
  }
}

testAPI();
