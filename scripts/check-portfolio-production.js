const fs = require("fs");
const path = require("path");

const root = process.cwd();
const failures = [];

function read(relPath) {
  return fs.readFileSync(path.join(root, relPath), "utf8");
}

function mustMatch(relPath, pattern, message) {
  const text = read(relPath);
  if (!pattern.test(text)) failures.push(`${relPath}: ${message}`);
}

mustMatch("script.js", /signInAnonymously/, "contact writes must use Firebase anonymous auth");
mustMatch("script.js", /const CONTACT_LIMITS = Object\.freeze\(/, "contact limits must be centralized");
mustMatch("script.js", /cooldownMs:\s*60000/, "contact form must throttle repeated sends locally");
mustMatch("script.js", /EMAIL_PATTERN/, "contact form must validate optional email");
mustMatch("script.js", /submitted_by:\s*user\.uid/, "contact payload must include the authenticated writer");
mustMatch("script.js", /page_path:\s*location\.pathname\.slice\(0, 120\)/, "contact payload must include bounded page path context");
mustMatch("script.js", /toast\.append\(icon, text\)/, "toast must avoid interpolating arbitrary HTML");
mustMatch("script.js", /cfCompany/, "contact form must include a honeypot check");

mustMatch("index.html", /id="cfNome"[^>]+maxlength="80"/, "name input must enforce max length");
mustMatch("index.html", /id="cfEmail"[^>]+maxlength="240"/, "email input must enforce max length");
mustMatch("index.html", /id="cfCompany"/, "contact form must include honeypot input");
mustMatch("index.html", /id="cfMsg"[^>]+maxlength="2000"/, "message input must enforce max length");
mustMatch("style.css", /\.cf-hp\s*\{/, "honeypot input must be visually hidden");

mustMatch("firestore.rules", /function validPortfolioMessage\(/, "Firestore rules must validate portfolio messages");
mustMatch("firestore.rules", /data\.keys\(\)\.hasOnly\(\['nome', 'email', 'mensagem', 'page_path', 'submitted_by', 'created_at'\]\)/, "message rules must reject unexpected fields");
mustMatch("firestore.rules", /data\.submitted_by == request\.auth\.uid/, "message rules must bind writer uid");
mustMatch("firestore.rules", /data\.created_at == request\.time/, "message rules must require server timestamp");
mustMatch("firestore.rules", /portfolioString\(data\.mensagem, 1, 2000\)/, "message rules must cap message size");
mustMatch("firestore.rules", /allow create: if signedIn\(\) && validPortfolioMessage\(request\.resource\.data\)/, "message creates must require auth and schema validation");

mustMatch(".github/workflows/quality.yml", /check-portfolio-production\.js/, "quality workflow must run Portfolio production checks");
mustMatch("scripts/check-repo-contracts.js", /check-portfolio-production\.js/, "repo contracts must require Portfolio production checks");

if (failures.length) {
  console.error("PORTFOLIO_PRODUCTION_CHECK_FAILED");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("PORTFOLIO_PRODUCTION_CHECK_OK");
