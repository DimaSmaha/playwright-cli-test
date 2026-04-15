import fs from "fs";
import path from "path";
import { XMLParser } from "fast-xml-parser";
import { chromium } from "@playwright/test";
import { KNOWN_ISSUES } from "./knownIssues";
import { pathToFileURL } from "url";

const JUNIT_PATH = "./junitreports/test-results.xml";
const OUTPUT_DIR = "./pdf-reports";
const ISSUE_URL = (id: string) => `https://tracker.local/${id}`;

type TestCase = {
  name: string;
  duration: number;
  status: "passed" | "failed" | "skipped";
  failure?: string;
  retries: number;
  location?: string;
  tags: string[];
  cleanName: string;
};

function parseXML(): any {
  const xml = fs.readFileSync(JUNIT_PATH, "utf-8");
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "@_",
  });
  return parser.parse(xml);
}

function extractTags(name: string) {
  return name.match(/@\w+/g) || [];
}

function cleanName(name: string) {
  return name.replace(/@\w+/g, "").trim();
}

function parseFailure(failureText: string) {
  if (!failureText) return {};

  const retries = (failureText.match(/Retry #/g) || []).length;

  const getField = (label: string) => {
    const match = failureText.match(new RegExp(`${label}: (.*)`));
    return match?.[1] || "";
  };

  const locationMatch = failureText.match(/(\S+\.ts:\d+:\d+)/);

  return {
    error: getField("Error"),
    locator: getField("Locator"),
    expected: getField("Expected"),
    timeout: getField("Timeout"),
    retries,
    location: locationMatch?.[1],
  };
}

function normalizeTestCase(tc: any): TestCase {
  const name = tc["@_name"];
  const tags = extractTags(name);
  const clean = cleanName(name);

  let status: TestCase["status"] = "passed";
  if (tc.failure) status = "failed";
  else if (tc.skipped !== undefined) status = "skipped";

  const failureData = parseFailure(tc.failure?.["#text"] || "");

  return {
    name,
    duration: Number(tc["@_time"] || 0),
    status,
    failure: tc.failure?.["#text"],
    retries: failureData.retries || 0,
    location: failureData.location,
    tags,
    cleanName: clean,
  };
}

function buildHTML(suites: any[]) {
  const allTests = suites.flatMap((s) => s.testcase);
  const normalized = allTests.map(normalizeTestCase);

  const total = normalized.length;
  const passed = normalized.filter((t) => t.status === "passed").length;
  const failed = normalized.filter((t) => t.status === "failed").length;
  const skipped = normalized.filter((t) => t.status === "skipped").length;

  const passRate = ((passed / total) * 100).toFixed(1);

  return `
  <html>
  <body style="font-family: sans-serif">
    <h1>Test Report</h1>
    <div>Pass rate: ${passRate}%</div>

    <div>
      ${normalized
        .map((tc) => {
          const issue = KNOWN_ISSUES[tc.cleanName];

          return `
        <div style="border:1px solid #ccc; margin:8px; padding:8px">
          <b>${tc.status.toUpperCase()}</b> - ${tc.name}
          <div>Duration: ${tc.duration}</div>

          ${tc.tags.map((t) => `<span>${t}</span>`).join(" ")}

          ${
            issue
              ? `<div style="color:orange">
                  Known Issue: <a href="${ISSUE_URL(issue)}">${issue}</a>
                </div>`
              : ""
          }

          ${tc.status === "failed" ? `<pre>${tc.failure}</pre>` : ""}
        </div>
        `;
        })
        .join("")}
    </div>
  </body>
  </html>
  `;
}

async function generatePDF(html: string) {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

  const fileName = `report-${Date.now()}.pdf`;
  const htmlPath = path.join(OUTPUT_DIR, "temp.html");
  const pdfPath = path.join(OUTPUT_DIR, fileName);

  fs.writeFileSync(htmlPath, html);

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const fileUrl = pathToFileURL(htmlPath).href;

  await page.goto(fileUrl, { waitUntil: "networkidle" });

  await page.pdf({
    path: pdfPath,
    format: "A4",
    printBackground: true,
    margin: { top: "0px", bottom: "0px", left: "0px", right: "0px" },
  });

  await browser.close();
  fs.unlinkSync(htmlPath);

  console.log("PDF generated:", pdfPath);
}

async function main() {
  const parsed = parseXML();

  const suites = parsed.testsuites?.testsuite || [parsed.testsuite];

  const html = buildHTML(Array.isArray(suites) ? suites : [suites]);

  await generatePDF(html);
}

main();
