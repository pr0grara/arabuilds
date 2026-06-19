var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// .wrangler/tmp/bundle-Zi7YuE/strip-cf-connecting-ip-header.js
function stripCfConnectingIPHeader(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader.apply(null, argArray)
    ]);
  }
});

// .wrangler/tmp/pages-PdxXnU/functionsWorker-0.1965927324667618.mjs
var __defProp2 = Object.defineProperty;
var __name2 = /* @__PURE__ */ __name((target, value) => __defProp2(target, "name", { value, configurable: true }), "__name");
function stripCfConnectingIPHeader2(input, init) {
  const request = new Request(input, init);
  request.headers.delete("CF-Connecting-IP");
  return request;
}
__name(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
__name2(stripCfConnectingIPHeader2, "stripCfConnectingIPHeader");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    return Reflect.apply(target, thisArg, [
      stripCfConnectingIPHeader2.apply(null, argArray)
    ]);
  }
});
var LABELS = {
  business_name: "Business name",
  contact_name: "Contact name",
  phone: "Phone",
  email: "Email",
  website: "Website",
  gbp_link: "Google Business Profile",
  main_trade: "Main trade",
  business_description: "Description",
  services_offered: "Services offered",
  services_other: "Other services (custom)",
  services_want_more: "Wants more of",
  services_want_less: "Wants less of / avoid",
  ideal_job: "Ideal job",
  min_job_size: "Minimum job size",
  area_current: "Areas currently served",
  area_target: "Target areas",
  travel_distance: "Travel distance",
  business_stage: "Business stage",
  licensed: "Licensed",
  insured: "Insured",
  crew_size: "Crew size",
  capacity_per_month: "Monthly capacity",
  lead_response_time: "Lead response time",
  lead_sources: "Lead sources",
  leads_per_month: "Leads / month",
  close_rate: "Close rate",
  lead_issues: "Lead issues",
  has_website: "Has website",
  has_gbp: "Has GBP",
  review_count: "Review count",
  has_photos: "Has work photos",
  has_before_after: "Before/after photos",
  proof: "Trust proof",
  lead_tracking: "Lead tracking",
  estimate_method: "Estimate method",
  estimate_followup: "Estimate follow-up",
  slowdowns: "Operational slowdowns",
  main_goal: "Main goal",
  target_revenue: "Target revenue",
  success_definition: "Success looks like",
  worries: "Worries",
  help_interest: "Help interested in",
  involvement_level: "Involvement level",
  anything_else: "Anything else"
};
var REQUIRED = ["contact_name", "phone", "email", "main_trade", "business_stage", "area_current", "main_goal"];
var norm = /* @__PURE__ */ __name2((v) => Array.isArray(v) ? v.join(", ") : v == null ? "" : String(v), "norm");
function summarize(data) {
  const lines = [];
  lines.push("CONTRACTOR GROWTH INTAKE \u2014 arabuilds");
  if (data.classification)
    lines.push("Internal classification: " + data.classification);
  if (data.classification_reasons)
    lines.push("Signals: " + data.classification_reasons);
  lines.push("");
  for (const key in LABELS) {
    if (data[key] == null || data[key] === "")
      continue;
    lines.push(LABELS[key] + ": " + norm(data[key]));
  }
  return lines.join("\n");
}
__name(summarize, "summarize");
__name2(summarize, "summarize");
var json = /* @__PURE__ */ __name2((obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json" } }), "json");
function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
__name(escapeHtml, "escapeHtml");
__name2(escapeHtml, "escapeHtml");
async function onRequestPost(context) {
  const { request, env } = context;
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ success: false, message: "Invalid JSON" }, 400);
  }
  if (body.botcheck)
    return json({ success: true });
  const missing = REQUIRED.filter((f) => !body[f] || norm(body[f]).trim() === "");
  if (missing.length) {
    return json({ success: false, message: "Missing required field(s): " + missing.join(", ") }, 400);
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(norm(body.email))) {
    return json({ success: false, message: "Invalid email" }, 400);
  }
  if (!env.DB) {
    return json({ success: false, message: "Storage not configured" }, 500);
  }
  const now = (/* @__PURE__ */ new Date()).toISOString();
  try {
    await env.DB.prepare(
      `INSERT INTO intakes
         (created_at, business_name, contact_name, phone, email, main_trade,
          business_stage, main_goal, area_current, classification, classification_reasons, data)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
    ).bind(
      now,
      norm(body.business_name),
      norm(body.contact_name),
      norm(body.phone),
      norm(body.email),
      norm(body.main_trade),
      norm(body.business_stage),
      norm(body.main_goal),
      norm(body.area_current),
      norm(body.classification),
      norm(body.classification_reasons),
      JSON.stringify(body)
    ).run();
  } catch (err) {
    return json({ success: false, message: "Could not save submission" }, 500);
  }
  context.waitUntil(sendAlert(env, body).catch(() => {
  }));
  return json({ success: true });
}
__name(onRequestPost, "onRequestPost");
__name2(onRequestPost, "onRequestPost");
async function sendAlert(env, body) {
  if (!env.RESEND_API_KEY || !env.ALERT_TO)
    return;
  const who = norm(body.business_name) || norm(body.contact_name) || "contractor";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + env.RESEND_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: env.ALERT_FROM || "AraBuilds Intake <onboarding@resend.dev>",
      to: [env.ALERT_TO],
      reply_to: norm(body.email) || void 0,
      subject: `New intake \u2014 ${norm(body.classification) || "Lead"} \u2014 ${who}`,
      text: summarize(body)
    })
  });
  if (!res.ok)
    throw new Error("Resend " + res.status);
}
__name(sendAlert, "sendAlert");
__name2(sendAlert, "sendAlert");
var CLASSES = ["Foundation Client", "Growth Client", "Operator Client", "Not Ready / Needs Basics"];
async function onRequestGet(context) {
  const { request, env } = context;
  const expected = env.ADMIN_USER && env.ADMIN_PASS ? "Basic " + btoa(`${env.ADMIN_USER}:${env.ADMIN_PASS}`) : null;
  const provided = request.headers.get("Authorization");
  if (!expected || provided !== expected) {
    return new Response("Authentication required.", {
      status: 401,
      headers: { "WWW-Authenticate": 'Basic realm="arabuilds admin", charset="UTF-8"' }
    });
  }
  if (!env.DB)
    return new Response("Storage not configured.", { status: 500 });
  const url = new URL(request.url);
  const cls = url.searchParams.get("class") || "";
  const q = (url.searchParams.get("q") || "").trim();
  const where = [];
  const binds = [];
  if (cls) {
    where.push("classification = ?");
    binds.push(cls);
  }
  if (q) {
    where.push("(business_name LIKE ? OR contact_name LIKE ? OR email LIKE ? OR area_current LIKE ?)");
    const like = "%" + q + "%";
    binds.push(like, like, like, like);
  }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const rows = (await env.DB.prepare(
    `SELECT * FROM intakes ${whereSql} ORDER BY created_at DESC LIMIT 1000`
  ).bind(...binds).all()).results || [];
  if (url.searchParams.get("format") === "csv") {
    return csvResponse(rows);
  }
  const counts = (await env.DB.prepare(
    `SELECT classification, COUNT(*) AS n FROM intakes GROUP BY classification`
  ).all()).results || [];
  return new Response(renderPage(rows, counts, { cls, q }), {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
__name(onRequestGet, "onRequestGet");
__name2(onRequestGet, "onRequestGet");
function csvResponse(rows) {
  const cols = ["id", "created_at", "classification", "business_name", "contact_name", "phone", "email", "main_trade", "business_stage", "main_goal", "area_current", "classification_reasons", "data"];
  const esc = /* @__PURE__ */ __name2((v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"', "esc");
  const lines = [cols.join(",")];
  for (const r of rows)
    lines.push(cols.map((c) => esc(r[c])).join(","));
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="arabuilds-intakes.csv"'
    }
  });
}
__name(csvResponse, "csvResponse");
__name2(csvResponse, "csvResponse");
function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return iso;
  }
}
__name(fmtDate, "fmtDate");
__name2(fmtDate, "fmtDate");
function detailsHtml(dataJson) {
  let data;
  try {
    data = JSON.parse(dataJson);
  } catch {
    return escapeHtml(dataJson || "");
  }
  const parts = [];
  for (const key in LABELS) {
    if (data[key] == null || data[key] === "")
      continue;
    parts.push(`<div class="dt">${escapeHtml(LABELS[key])}</div><div class="dd">${escapeHtml(norm(data[key]))}</div>`);
  }
  return `<div class="detail">${parts.join("")}</div>`;
}
__name(detailsHtml, "detailsHtml");
__name2(detailsHtml, "detailsHtml");
function renderPage(rows, counts, state) {
  const countMap = Object.fromEntries(counts.map((c) => [c.classification || "\u2014", c.n]));
  const total = counts.reduce((s, c) => s + c.n, 0);
  const chip = /* @__PURE__ */ __name2((label, value) => {
    const active = state.cls === value ? " active" : "";
    const n = value ? countMap[value] || 0 : total;
    const href = value ? `?class=${encodeURIComponent(value)}` : "?";
    return `<a class="chip${active}" href="${href}">${escapeHtml(label)} <b>${n}</b></a>`;
  }, "chip");
  const rowsHtml = rows.map((r) => {
    const tag = (r.classification || "\u2014").replace(" Client", "").replace(" / Needs Basics", "");
    const cl = (r.classification || "").toLowerCase().includes("operator") ? "op" : (r.classification || "").toLowerCase().includes("growth") ? "gr" : (r.classification || "").toLowerCase().includes("foundation") ? "fn" : "nr";
    return `<tbody class="row">
      <tr class="head" onclick="this.closest('tbody').classList.toggle('open')">
        <td class="when">${escapeHtml(fmtDate(r.created_at))}</td>
        <td><span class="tag ${cl}">${escapeHtml(tag)}</span></td>
        <td>${escapeHtml(r.business_name || "\u2014")}<div class="sub">${escapeHtml(r.contact_name || "")}</div></td>
        <td>${escapeHtml(r.main_trade || "\u2014")}</td>
        <td>${escapeHtml(r.area_current || "\u2014")}</td>
        <td class="contact"><a href="tel:${escapeHtml(r.phone || "")}" onclick="event.stopPropagation()">${escapeHtml(r.phone || "")}</a><div class="sub"><a href="mailto:${escapeHtml(r.email || "")}" onclick="event.stopPropagation()">${escapeHtml(r.email || "")}</a></div></td>
        <td class="caret">\u25B8</td>
      </tr>
      <tr class="body"><td colspan="7">${detailsHtml(r.data)}</td></tr>
    </tbody>`;
  }).join("");
  const csvHref = `?format=csv${state.cls ? "&class=" + encodeURIComponent(state.cls) : ""}${state.q ? "&q=" + encodeURIComponent(state.q) : ""}`;
  return `<!doctype html><html lang="en"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Intake admin \u2014 arabuilds</title><meta name="robots" content="noindex">
<style>
  :root{--bg:#0b0c0a;--fg:#d7dccf;--dim:#6b7264;--accent:#62e36b;--line:#1c1f1a;--field:#101210;--field-line:#2a2e26;--mono:"SF Mono",ui-monospace,"JetBrains Mono",Menlo,Consolas,monospace}
  *{box-sizing:border-box;margin:0;padding:0}
  body{background:var(--bg);color:var(--fg);font-family:var(--mono);font-size:14px;line-height:1.6;padding:clamp(16px,4vw,36px);background-image:repeating-linear-gradient(0deg,rgba(255,255,255,.012) 0 1px,transparent 1px 3px)}
  a{color:var(--accent);text-decoration:none}
  h1{font-size:clamp(20px,4vw,28px);letter-spacing:-.4px;margin-bottom:4px}
  h1 .accent{color:var(--accent)}
  .meta{color:var(--dim);font-size:12px;margin-bottom:22px}
  .bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-bottom:18px}
  .chip{border:1px solid var(--field-line);color:var(--fg);padding:7px 12px;border-radius:2px;font-size:12.5px}
  .chip b{color:var(--accent);margin-left:4px}
  .chip.active{border-color:var(--accent);background:rgba(98,227,107,.08)}
  form.search{margin-left:auto;display:flex;gap:8px}
  input[type=text]{font-family:var(--mono);font-size:13px;color:var(--fg);background:var(--field);border:1px solid var(--field-line);border-radius:2px;padding:7px 11px}
  input[type=text]:focus{outline:none;border-color:var(--accent)}
  .btn{border:1px solid var(--field-line);color:var(--dim);padding:7px 12px;border-radius:2px;font-size:12.5px;cursor:pointer;background:transparent}
  .btn:hover{border-color:var(--accent);color:var(--accent)}
  table{width:100%;border-collapse:collapse;font-size:13px}
  thead th{text-align:left;color:var(--dim);font-size:11px;letter-spacing:1.5px;text-transform:uppercase;padding:0 12px 10px;border-bottom:1px solid var(--line);font-weight:400}
  tbody.row{border-bottom:1px solid var(--line)}
  tr.head{cursor:pointer}
  tr.head:hover td{background:rgba(255,255,255,.02)}
  td{padding:12px;vertical-align:top}
  .when{color:var(--dim);white-space:nowrap;font-size:12px}
  .sub{color:var(--dim);font-size:12px}
  .contact{white-space:nowrap}
  .caret{color:var(--dim);text-align:right}
  tbody.open .caret{color:var(--accent)}
  .tag{font-size:11px;padding:3px 8px;border-radius:2px;border:1px solid var(--field-line);white-space:nowrap}
  .tag.op{color:#62e36b;border-color:#2f5f33}
  .tag.gr{color:#62b6e3;border-color:#2f4f5f}
  .tag.fn{color:#e3c062;border-color:#5f562f}
  .tag.nr{color:#e38062;border-color:#5f372f}
  tr.body{display:none}
  tbody.open tr.body{display:table-row}
  .detail{display:grid;grid-template-columns:auto 1fr;gap:4px 18px;padding:8px 4px 16px;border-top:1px dashed var(--line)}
  .dt{color:var(--dim)}
  .dd{color:var(--fg)}
  .empty{color:var(--dim);padding:40px 0;text-align:center}
  @media(max-width:720px){.t-hide{display:none}form.search{width:100%;margin:8px 0 0}.detail{grid-template-columns:1fr;gap:1px 0}.dt{margin-top:8px}}
</style></head><body>
  <h1>intake<span class="accent"> admin</span></h1>
  <div class="meta">${total} total submission${total === 1 ? "" : "s"} \xB7 click a row to expand \xB7 <a href="${csvHref}">download CSV \u2193</a></div>
  <div class="bar">
    ${chip("All", "")}
    ${CLASSES.map((c) => chip(c.replace(" Client", "").replace(" / Needs Basics", ""), c)).join("")}
    <form class="search" method="get">
      ${state.cls ? `<input type="hidden" name="class" value="${escapeHtml(state.cls)}">` : ""}
      <input type="text" name="q" placeholder="search name, email, area\u2026" value="${escapeHtml(state.q)}">
      <button class="btn" type="submit">search</button>
    </form>
  </div>
  ${rows.length ? `<table>
    <thead><tr>
      <th>When</th><th>Tier</th><th>Business</th><th class="t-hide">Trade</th><th class="t-hide">Area</th><th>Contact</th><th></th>
    </tr></thead>
    ${rowsHtml}
  </table>` : '<div class="empty">No submissions yet.</div>'}
</body></html>`;
}
__name(renderPage, "renderPage");
__name2(renderPage, "renderPage");
var routes = [
  {
    routePath: "/api/intake",
    mountPath: "/api",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/admin",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  }
];
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
__name2(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name2(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name2(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name2(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name2(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name2(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
__name2(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
__name2(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name2(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
__name2(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
__name2(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
__name2(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
__name2(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
__name2(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
__name2(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
__name2(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");
__name2(pathToRegexp, "pathToRegexp");
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
__name2(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name2(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: () => {
            isFailOpen = true;
          }
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name2((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");
var drainBody = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
__name2(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name2(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
__name2(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
__name2(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");
__name2(__facade_invoke__, "__facade_invoke__");
var __Facade_ScheduledController__ = /* @__PURE__ */ __name(class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
}, "__Facade_ScheduledController__");
__name2(__Facade_ScheduledController__, "__Facade_ScheduledController__");
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name2(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name2(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
__name2(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
__name2(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;

// node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default2 = drainBody2;

// node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError2(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError2(e.cause)
  };
}
__name(reduceError2, "reduceError");
var jsonError2 = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError2(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default2 = jsonError2;

// .wrangler/tmp/bundle-Zi7YuE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__2 = [
  middleware_ensure_req_body_drained_default2,
  middleware_miniflare3_json_error_default2
];
var middleware_insertion_facade_default2 = middleware_loader_entry_default;

// node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__2 = [];
function __facade_register__2(...args) {
  __facade_middleware__2.push(...args.flat());
}
__name(__facade_register__2, "__facade_register__");
function __facade_invokeChain__2(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__2(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__2, "__facade_invokeChain__");
function __facade_invoke__2(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__2(request, env, ctx, dispatch, [
    ...__facade_middleware__2,
    finalMiddleware
  ]);
}
__name(__facade_invoke__2, "__facade_invoke__");

// .wrangler/tmp/bundle-Zi7YuE/middleware-loader.entry.ts
var __Facade_ScheduledController__2 = class {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof __Facade_ScheduledController__2)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
__name(__Facade_ScheduledController__2, "__Facade_ScheduledController__");
function wrapExportedHandler2(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__2(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__2(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler2, "wrapExportedHandler");
function wrapWorkerEntrypoint2(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__2 === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__2.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__2) {
    __facade_register__2(middleware);
  }
  return class extends klass {
    #fetchDispatcher = (request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    };
    #dispatcher = (type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__2(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    };
    fetch(request) {
      return __facade_invoke__2(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint2, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY2;
if (typeof middleware_insertion_facade_default2 === "object") {
  WRAPPED_ENTRY2 = wrapExportedHandler2(middleware_insertion_facade_default2);
} else if (typeof middleware_insertion_facade_default2 === "function") {
  WRAPPED_ENTRY2 = wrapWorkerEntrypoint2(middleware_insertion_facade_default2);
}
var middleware_loader_entry_default2 = WRAPPED_ENTRY2;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__2 as __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default2 as default
};
//# sourceMappingURL=functionsWorker-0.1965927324667618.js.map
