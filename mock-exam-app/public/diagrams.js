/**
 * Scenario illustrations (inline SVG).
 * Each diagram shows the scenario's SETUP and CONSTRAINTS only. The design decision
 * the questions ask about is drawn as an amber "?" so the picture never gives away an answer.
 * Colors come from CSS custom properties (see .dg rules in style.css), so diagrams follow the theme.
 */
window.ExamDiagrams = (function () {
  const W = 720, H = 330;
  let seq = 0;

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const lines = (s) => (Array.isArray(s) ? s : s ? [s] : []);

  const ICONS = {
    lock: '<path d="M3 6V4.5a3 3 0 0 1 6 0V6" fill="none" stroke-width="1.6"/><rect x="1.5" y="6" width="9" height="6" rx="1.5" stroke="none"/>',
    shield: '<path d="M6 .8 11 2.8v3.4c0 3-2.2 5.2-5 6-2.8-.8-5-3-5-6V2.8Z" stroke="none"/>',
    clock: '<circle cx="6" cy="6.5" r="5" fill="none" stroke-width="1.6"/><path d="M6 3.8v2.9l2 1.3" fill="none" stroke-width="1.6"/>',
    bolt: '<path d="M7 .5 1.5 7.2h3.7L4.5 12.5 10.5 5.3H6.7Z" stroke="none"/>',
    warn: '<path d="M6 .8 11.6 11.5H.4Z" stroke="none"/><path d="M6 4.6v3.4M6 9.3v.9" stroke-width="1.4" class="ico-cut"/>',
    code: '<path d="M4 3 1 6.5 4 10M8 3l3 3.5L8 10" fill="none" stroke-width="1.6"/>',
  };

  function kit(n) {
    const mk = (kind) => `url(#ah-${n}-${kind || 'n'})`;
    return {
      box(x, y, w, h, title, sub, kind = 'svc') {
        const subs = lines(sub);
        const total = 1 + subs.length;
        const lh = 15;
        const top = y + h / 2 - ((total - 1) * lh) / 2 + 4;
        let t = `<text class="t-title" x="${x + w / 2}" y="${top}">${esc(title)}</text>`;
        subs.forEach((s, i) => { t += `<text class="t-sub" x="${x + w / 2}" y="${top + (i + 1) * lh}">${esc(s)}</text>`; });
        return `<g class="n n-${kind}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="10"/>${t}</g>`;
      },
      db(x, y, w, h, title, sub, kind = 'data') {
        const ry = 7;
        const subs = lines(sub);
        let t = `<text class="t-title" x="${x + w / 2}" y="${y + h / 2 + 4 + (subs.length ? -4 : 3)}">${esc(title)}</text>`;
        subs.forEach((s, i) => { t += `<text class="t-sub" x="${x + w / 2}" y="${y + h / 2 + 15 + i * 14}">${esc(s)}</text>`; });
        return `<g class="n n-${kind}"><path d="M${x} ${y + ry}v${h - 2 * ry}a${w / 2} ${ry} 0 0 0 ${w} 0v${-(h - 2 * ry)}a${w / 2} ${ry} 0 0 0 ${-w} 0Z"/>` +
          `<path class="db-lid" d="M${x} ${y + ry}a${w / 2} ${ry} 0 0 0 ${w} 0"/>${t}</g>`;
      },
      zone(x, y, w, h, label, kind = 'zone') {
        return `<g class="z z-${kind}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"/>` +
          (label ? `<text class="t-zone" x="${x + 12}" y="${y + 18}">${esc(label)}</text>` : '') + '</g>';
      },
      arrow(pts, o = {}) {
        const d = pts.map((p, i) => (i ? 'L' : 'M') + p[0] + ' ' + p[1]).join(' ');
        const cls = `a a-${o.kind || 'n'}${o.dash ? ' a-dash' : ''}`;
        const sw = o.width ? ` style="stroke-width:${o.width}"` : '';
        let s = `<path class="${cls}" d="${d}"${sw} marker-end="${mk(o.kind)}"${o.both ? ` marker-start="${mk(o.kind)}"` : ''}/>`;
        if (o.label) {
          const [lx, ly] = o.at || [(pts[0][0] + pts[pts.length - 1][0]) / 2, (pts[0][1] + pts[pts.length - 1][1]) / 2 - 8];
          s += `<text class="t-edge${o.kind ? ' t-' + o.kind : ''}" x="${lx}" y="${ly}">${esc(o.label)}</text>`;
        }
        return s;
      },
      tag(x, y, text, kind = 'info', icon) {
        const w = Math.round(text.length * 6.3 + (icon ? 34 : 20));
        const x0 = x - w / 2;
        const ic = icon ? `<g class="ico" transform="translate(${x0 + 9} ${y - 6.5})">${ICONS[icon]}</g>` : '';
        return `<g class="tag tag-${kind}"><rect x="${x0}" y="${y - 11}" width="${w}" height="22" rx="11"/>${ic}` +
          `<text x="${x0 + w / 2 + (icon ? 8 : 0)}" y="${y + 4}">${esc(text)}</text></g>`;
      },
      ask(x, y, label, below) {
        return `<g class="ask"><circle cx="${x}" cy="${y}" r="13"/><text x="${x}" y="${y + 5}">?</text>` +
          (label ? `<text class="t-ask" x="${x}" y="${below ? y + 30 : y - 20}">${esc(label)}</text>` : '') + '</g>';
      },
      diamond(cx, cy, r, title) {
        return `<g class="n n-q"><path d="M${cx} ${cy - r}L${cx + r} ${cy}L${cx} ${cy + r}L${cx - r} ${cy}Z"/>` +
          `<text class="t-title" x="${cx}" y="${cy + 4}">${esc(title)}</text></g>`;
      },
      text(x, y, s, cls = 't-note', anchor) {
        return `<text class="${cls}" x="${x}" y="${y}"${anchor ? ` style="text-anchor:${anchor}"` : ''}>${esc(s)}</text>`;
      },
      bar(x, y, w, h, kind = 'svc') {
        return `<rect class="bar bar-${kind}" x="${x}" y="${y}" width="${w}" height="${h}" rx="4"/>`;
      },
      line(x1, y1, x2, y2, cls = 'guide') {
        return `<line class="${cls}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`;
      },
    };
  }

  function wrap(n, body, title) {
    const marker = (kind) => `<marker id="ah-${n}-${kind}" viewBox="0 0 10 10" refX="9" refY="5" markerUnits="userSpaceOnUse" markerWidth="11" markerHeight="11" orient="auto-start-reverse"><path class="mk mk-${kind}" d="M0 0L10 5L0 10Z"/></marker>`;
    return `<svg class="dg" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}" xmlns="http://www.w3.org/2000/svg">` +
      `<defs>${['n', 'risk', 'ok', 'q'].map(marker).join('')}</defs>${body}</svg>`;
  }

  const DIAGRAMS = {
    // 1. Low-code support + data governance
    1: (k) => [
      k.zone(250, 50, 210, 230, 'Low-code agent platform'),
      k.zone(490, 20, 215, 290, ''),
      k.text(502, 300, 'ENTERPRISE DATA SOURCES', 't-zone'),
      k.box(20, 125, 120, 64, 'Customer', 'signed in via SSO', 'user'),
      k.box(275, 85, 160, 64, 'Support agent', 'orders · returns · policy', 'agent'),
      k.box(275, 200, 160, 54, 'Generative LLM', '', 'svc'),
      k.box(510, 50, 175, 60, 'Google Drive', 'per-document ACLs', 'data'),
      k.box(510, 135, 175, 60, 'SharePoint', 'per-document ACLs', 'data'),
      k.db(510, 220, 175, 70, 'Product catalog', 'structured DB'),
      k.arrow([[140, 150], [273, 120]], { kind: 'risk' }),
      k.tag(195, 95, 'card #s · SSNs', 'risk', 'shield'),
      k.ask(206, 150, 'redact?', true),
      k.arrow([[355, 149], [355, 198]]),
      k.arrow([[435, 110], [508, 80]], { dash: true }),
      k.arrow([[435, 117], [508, 165]], { dash: true }),
      k.arrow([[435, 124], [508, 250]], { dash: true }),
      k.ask(470, 135),
      k.tag(355, 305, 'minimal custom code', 'info', 'code'),
      k.tag(597, 20, 'users see only what they may read', 'lock', 'lock'),
    ],

    // 2. IDE developers + MCP toolbox
    2: (k) => [
      k.zone(15, 30, 185, 280, 'Developers · 50+ analysts'),
      k.box(35, 60, 145, 48, 'VS Code', '', 'user'),
      k.box(35, 122, 145, 48, 'Antigravity IDE', '', 'user'),
      k.box(35, 205, 145, 70, 'Coding agent', ['natural language', '→ SQL + analytics'], 'agent'),
      k.box(290, 125, 150, 80, 'Tool layer', ['no bespoke drivers', 'in prompts / app code'], 'q'),
      k.ask(440, 125),
      k.arrow([[180, 225], [240, 225], [240, 150], [288, 150]], { label: 'local CLI testing', at: [255, 140] }),
      k.arrow([[180, 255], [260, 255], [260, 185], [288, 185]], { label: 'serverless · HTTPS', at: [268, 275] }),
      k.tag(365, 55, 'schema payloads bloat context', 'warn', 'warn'),
      k.arrow([[365, 67], [365, 122]], { kind: 'risk', dash: true }),
      k.zone(490, 30, 215, 280, '16 database instances'),
      ...[0, 1, 2, 3].flatMap((r) => [
        k.db(510, 58 + r * 62, 80, 48, 'PostgreSQL', ''),
        k.db(610, 58 + r * 62, 80, 48, 'AlloyDB', ''),
      ]),
      k.arrow([[440, 165], [505, 165]], { both: true }),
    ],

    // 3. Healthcare multimodal GraphRAG
    3: (k) => [
      k.zone(12, 30, 150, 285, 'Patient data'),
      k.db(27, 55, 120, 64, 'EHR tables', 'structured'),
      k.box(27, 140, 120, 56, 'Consult notes', 'unstructured text', 'data'),
      k.box(27, 220, 120, 70, 'X-ray images', ['Cloud Storage', 'multimodal'], 'data'),
      k.box(190, 130, 105, 70, 'Ingestion', ['chunk · embed'], 'q'),
      k.ask(295, 130),
      k.arrow([[147, 87], [188, 150]]),
      k.arrow([[147, 168], [188, 165]]),
      k.arrow([[147, 255], [188, 180]]),
      k.zone(320, 45, 170, 255, 'Retrieval store'),
      k.tag(405, 30, 'CMEK required', 'lock', 'lock'),
      k.box(335, 75, 140, 56, 'Vector index', 'embeddings', 'data'),
      k.box(335, 150, 140, 70, 'Knowledge graph', ['patients · treatments', 'relationships'], 'data'),
      k.ask(405, 262, 'which backend?', false),
      k.arrow([[295, 165], [333, 140]]),
      k.zone(515, 20, 195, 295, 'Hybrid · concurrent'),
      k.box(528, 46, 82, 44, 'Keyword', '', 'svc'),
      k.box(618, 46, 82, 44, 'Semantic', '', 'svc'),
      k.arrow([[569, 90], [598, 142]]),
      k.arrow([[659, 90], [630, 142]]),
      k.ask(613, 157, ''),
      k.text(640, 161, 'fuse', 't-ask', 'start'),
      k.box(545, 192, 140, 48, 'Clinical agent', '', 'agent'),
      k.box(545, 262, 140, 40, 'Clinician', '', 'user'),
      k.arrow([[613, 171], [613, 190]]),
      k.arrow([[613, 240], [613, 260]], { both: true }),
      k.arrow([[475, 103], [526, 68]], { dash: true }),
      k.arrow([[475, 185], [640, 90]], { dash: true }),
    ],

    // 4. High-concurrency order processing + state lifetimes
    4: (k) => [
      k.box(15, 55, 110, 56, 'Shopper', 'flash sale', 'user'),
      k.tag(70, 30, 'peak traffic', 'warn', 'bolt'),
      k.box(180, 48, 170, 70, 'Root orchestrator', ['ADK'], 'agent'),
      k.ask(350, 48, 'workflow?', false),
      k.arrow([[125, 83], [178, 83]]),
      k.box(440, 20, 160, 42, 'Inventory check', '', 'agent'),
      k.box(440, 72, 160, 42, 'Payment validation', '', 'agent'),
      k.box(440, 124, 160, 42, 'Shipping estimate', '', 'agent'),
      k.arrow([[350, 75], [438, 41]]),
      k.arrow([[350, 83], [438, 93]]),
      k.arrow([[350, 91], [438, 145]]),
      k.tag(660, 93, 'independent', 'info'),
      // state lifetime timeline
      k.zone(15, 190, 690, 128, 'State lifetime'),
      k.line(165, 212, 165, 312), k.line(335, 212, 335, 312), k.line(500, 212, 500, 312, 'guide guide-strong'),
      k.text(250, 228, 'Session A · turn 1', 't-axis', 'middle'),
      k.text(415, 228, 'Session A · turn 2', 't-axis', 'middle'),
      k.text(600, 228, 'Session B (days later)', 't-axis', 'middle'),
      k.text(28, 258, 'scratch data', 't-lane'),
      k.text(28, 296, 'member tier', 't-lane'),
      k.bar(170, 246, 160, 18, 'risk'),
      k.text(340, 260, '✕ discard at turn end', 't-risk'),
      k.bar(170, 284, 525, 18, 'ok'),
      k.ask(140, 255), k.ask(140, 293),
    ],

    // 5. Cross-org A2A
    5: (k) => [
      k.zone(15, 40, 290, 240, 'GCP project · NA subsidiary'),
      k.zone(415, 40, 290, 240, 'GCP project · EU subsidiary'),
      k.line(360, 34, 360, 300, 'guide guide-strong'),
      k.text(360, 318, 'network & organisational boundary', 't-axis', 'middle'),
      k.box(45, 75, 220, 70, 'North America agent', ['consumer'], 'agent'),
      k.box(45, 195, 220, 55, 'Shipper', 'international inquiry', 'user'),
      k.arrow([[155, 193], [155, 147]]),
      k.box(445, 75, 230, 70, 'Europe agent', ['provider · own codebase'], 'agent'),
      k.db(445, 180, 230, 72, 'Customs PDFs', 'binary artifacts'),
      k.arrow([[675, 145], [675, 178]], { both: true }),
      k.arrow([[265, 95], [443, 95]], { label: 'delegate inquiry', at: [320, 87] }),
      k.arrow([[443, 128], [265, 128]], { label: 'long-running result + PDF', at: [355, 150], kind: 'ok' }),
      k.ask(360, 111, ''),
      k.tag(155, 168, 'SPIFFE ID', 'lock', 'shield'),
      k.tag(560, 168, 'SPIFFE ID', 'lock', 'shield'),
      k.tag(360, 17, 'OIDC token · IAM-verified', 'lock', 'lock'),
      k.tag(360, 262, 'no HTTP timeouts', 'warn', 'clock'),
    ],

    // 6. CI/CD evaluation gate
    6: (k) => [
      k.box(12, 130, 108, 66, 'Commit', ['new prompt /', 'model version'], 'user'),
      k.box(145, 130, 108, 66, 'Cloud Build', 'trigger', 'svc'),
      k.box(278, 130, 108, 66, 'Staging', 'candidate agent', 'svc'),
      k.box(411, 120, 118, 86, 'Evaluation', ['vs golden', 'dataset'], 'q'),
      k.ask(529, 120),
      k.db(420, 20, 100, 62, 'Golden set', 'prompts · refs'),
      k.arrow([[470, 82], [470, 118]]),
      k.arrow([[120, 163], [143, 163]]),
      k.arrow([[253, 163], [276, 163]]),
      k.arrow([[386, 163], [409, 163]]),
      k.diamond(585, 163, 48, 'score ≥ min'),
      k.arrow([[529, 163], [535, 163]]),
      k.box(638, 40, 78, 50, 'Production', '', 'ok'),
      k.box(638, 240, 78, 50, 'Halt build', 'flag failure', 'risk'),
      k.arrow([[585, 115], [585, 65], [636, 65]], { kind: 'ok', label: 'pass', at: [568, 95] }),
      k.arrow([[585, 211], [585, 265], [636, 265]], { kind: 'risk', label: 'fail', at: [568, 240] }),
      k.tag(250, 250, 'trajectory: tool order · precision', 'info'),
      k.tag(250, 285, 'final output: groundedness', 'info'),
      k.arrow([[380, 262], [430, 208]], { dash: true }),
      k.tag(240, 55, 'no manual intervention', 'warn', 'bolt'),
    ],

    // 7. Canary rollout
    7: (k) => [
      k.box(12, 128, 100, 64, 'Customers', 'claims', 'user'),
      k.arrow([[112, 160], [168, 160]]),
      k.diamond(200, 160, 30, 'split'),
      k.zone(265, 30, 290, 245, 'Serverless · Python-native'),
      k.ask(540, 30),
      k.tag(410, 290, 'sub-second cold starts', 'warn', 'clock'),
      k.box(300, 62, 220, 64, 'Claims agent v1', 'stable', 'agent'),
      k.box(300, 188, 220, 64, 'Claims agent v2', 'candidate', 'svc'),
      k.arrow([[222, 140], [260, 94], [298, 94]], { width: 7, label: '90%', at: [248, 86] }),
      k.arrow([[222, 180], [260, 220], [298, 220]], { width: 2, label: '10%', at: [248, 238] }),
      k.box(595, 125, 115, 70, 'Monitoring', ['error rate', 'latency'], 'svc'),
      k.arrow([[520, 94], [593, 145]], { dash: true }),
      k.arrow([[520, 220], [593, 175]], { dash: true }),
      k.arrow([[652, 195], [652, 322], [200, 322], [200, 192]], { kind: 'risk', dash: true, label: 'spike → instant rollback, zero downtime', at: [560, 316] }),
    ],

    // 8. Observability: trace waterfall
    8: (k) => {
      const rows = [
        ['user turn', 0, 160, 360, 'svc', 0],
        ['call_llm', 1, 168, 52, 'agent', 0],
        ['tool: lookup', 1, 222, 36, 'svc', 0],
        ['call_llm', 1, 260, 44, 'agent', 0],
        ['tool: lookup', 1, 306, 36, 'risk', 1],
        ['call_llm', 1, 344, 44, 'agent', 0],
        ['tool: lookup', 1, 390, 36, 'risk', 1],
        ['call_llm', 1, 428, 44, 'agent', 0],
        ['tool: lookup', 1, 474, 38, 'risk', 1],
      ];
      const out = [k.zone(12, 20, 515, 295, 'Trace · one request')];
      rows.forEach(([label, depth, x, w, kind], i) => {
        const y = 48 + i * 28;
        out.push(k.text(28 + depth * 14, y + 13, label, depth ? 't-lane' : 't-lane t-strong'));
        out.push(k.bar(x, y, w, 18, kind));
      });
      out.push(
        k.tag(415, 302, 'same tool, again and again', 'risk', 'warn'),
        k.tag(170, 302, 'no exception raised', 'warn', 'warn'),
        k.box(560, 40, 150, 56, 'Cloud Trace', 'spans', 'svc'),
        k.db(560, 180, 150, 76, 'BigQuery', ['tokens · cost', 'telemetry']),
        k.arrow([[527, 68], [558, 68]]),
        k.arrow([[527, 160], [540, 160], [540, 215], [558, 215]], { dash: true }),
        k.ask(635, 140, 'no code changes?', false),
        k.tag(635, 290, '$ token bill ↑', 'warn'),
      );
      return out;
    },

    // 9. Principal Access Boundary
    9: (k) => [
      k.box(15, 30, 150, 56, 'Attacker', 'prompt injection', 'risk'),
      k.arrow([[165, 58], [222, 118]], { kind: 'risk' }),
      k.zone(205, 95, 215, 130, '', 'q'),
      k.box(225, 120, 175, 70, 'Analysis agent', ['service account /', 'agent identity'], 'agent'),
      k.ask(312, 95, 'boundary on principal?', false),
      k.tag(312, 250, 'fail-closed · additive', 'lock', 'lock'),
      k.zone(460, 18, 250, 140, 'Allowed · analysis project', 'ok'),
      k.box(475, 55, 105, 52, 'Market data', 'queries', 'data'),
      k.db(592, 50, 105, 66, 'Ledgers', 'GCS buckets'),
      k.arrow([[400, 140], [440, 140], [440, 81], [473, 81]], { kind: 'ok' }),
      k.zone(460, 180, 250, 140, 'Out of scope · other projects', 'risk'),
      k.db(475, 215, 105, 66, 'HR records', ''),
      k.db(592, 215, 105, 66, 'Other DBs', ''),
      k.arrow([[400, 170], [440, 170], [440, 248], [473, 248]], { kind: 'risk', dash: true }),
      k.text(585, 305, 'stray resource-level grants exist', 't-note', 'middle'),
      k.text(15, 305, 'Goal: even a hijacked agent cannot reach these', 't-note', 'start'),
    ],

    // 10. Agent Gateway + Model Armor
    10: (k) => [
      k.zone(10, 30, 110, 280, 'Clients'),
      k.box(22, 62, 86, 44, 'IDE', '', 'user'),
      k.box(22, 128, 86, 44, 'Web app', '', 'user'),
      k.box(22, 194, 86, 44, 'CLI', '', 'user'),
      k.box(145, 110, 90, 100, 'Ingress', ['auth ·', 'prompt scan'], 'q'),
      k.ask(235, 110),
      k.arrow([[108, 84], [143, 140]]), k.arrow([[108, 150], [143, 160]]), k.arrow([[108, 216], [143, 180]]),
      k.zone(260, 30, 200, 280, 'VPC-SC perimeter', 'lock'),
      k.box(278, 60, 164, 44, 'Agent A', '', 'agent'),
      k.box(278, 118, 164, 44, 'Agent B', '', 'agent'),
      k.box(278, 176, 164, 44, 'Agent C', '', 'agent'),
      k.box(278, 245, 164, 50, 'Agent Registry', 'approved catalog', 'svc'),
      k.arrow([[235, 160], [276, 140]]),
      k.box(485, 110, 90, 100, 'Egress', ['default', 'deny'], 'q'),
      k.ask(575, 110),
      k.arrow([[442, 140], [483, 150]]),
      k.arrow([[530, 210], [530, 270], [444, 270]], { dash: true, label: 'lookup', at: [490, 262] }),
      k.zone(600, 30, 110, 280, 'External'),
      k.box(612, 62, 86, 44, 'SaaS API', 'registered', 'ok'),
      k.box(612, 128, 86, 44, 'Web API', 'registered', 'ok'),
      k.box(612, 194, 86, 44, 'unknown.io', 'unregistered', 'risk'),
      k.arrow([[575, 145], [610, 90]], { kind: 'ok' }), k.arrow([[575, 160], [610, 150]], { kind: 'ok' }),
      k.arrow([[575, 180], [610, 214]], { kind: 'risk', dash: true }),
      k.tag(190, 290, 'short-input injection', 'risk', 'warn'),
      k.tag(655, 285, 'PII out', 'risk', 'shield'),
    ],

    // 11. Renewable energy technician assistant (Agent Designer) + public solar chat
    11: (k) => [
      k.box(15, 55, 125, 64, 'Field technician', ['substation ID', 'cert tier'], 'user'),
      k.zone(170, 20, 300, 170, 'Agent Designer'),
      k.box(190, 48, 150, 60, 'Technician assistant', 'troubleshooting', 'agent'),
      k.box(190, 122, 150, 56, 'System instructions', 'single paragraph', 'q'),
      k.ask(340, 122),
      k.arrow([[265, 122], [265, 110]]),
      k.arrow([[140, 80], [188, 78]]),
      k.db(500, 26, 130, 64, 'Manuals', 'turbines · inverters'),
      k.box(500, 118, 170, 56, 'Ticketing system', 'machine-readable JSON', 'svc'),
      k.arrow([[340, 68], [498, 58]], { dash: true, label: 'retrieve', at: [420, 55] }),
      k.arrow([[340, 92], [498, 146]], { kind: 'risk', label: 'alert codes', at: [440, 135] }),
      k.tag(125, 205, 'console only · no developers', 'info', 'code'),
      k.tag(340, 205, 'never skip isolation check', 'warn', 'bolt'),
      k.tag(598, 195, '~15% fail to parse', 'risk', 'warn'),
      k.zone(15, 225, 690, 98, 'Public website chat · 6-week launch'),
      k.box(35, 255, 120, 52, 'Solar customer', 'residential', 'user'),
      k.box(250, 250, 180, 62, 'Chat platform', ['2 designers · no Python'], 'q'),
      k.ask(430, 250),
      k.arrow([[155, 281], [248, 281]]),
      k.box(500, 243, 195, 34, '400 PDF guides', '', 'data'),
      k.box(500, 283, 195, 34, 'Billing REST API · OpenAPI', '', 'data'),
      k.arrow([[430, 270], [498, 260]], { dash: true }),
      k.arrow([[430, 292], [498, 300]], { dash: true }),
    ],

    // 12. Aviation maintenance assistant on Conversational Agents (Dialogflow CX)
    12: (k) => [
      k.box(12, 130, 110, 64, 'Technician', ['voice · hangar'], 'user'),
      k.tag(67, 105, 'noise · silence', 'warn', 'warn'),
      k.zone(140, 20, 380, 300, 'Conversational Agents (CX)'),
      k.box(160, 45, 100, 36, 'Engine', '', 'svc'),
      k.box(275, 45, 100, 36, 'Avionics', '', 'svc'),
      k.box(390, 45, 110, 36, 'Cabin safety', '', 'svc'),
      k.arrow([[210, 81], [210, 103]], { dash: true }),
      k.arrow([[325, 81], [325, 103]], { dash: true }),
      k.arrow([[445, 81], [445, 103]], { dash: true }),
      k.box(160, 105, 340, 66, 'Default Start Flow', '60 pages · all teams', 'q'),
      k.ask(500, 105),
      k.arrow([[122, 162], [158, 140]], { both: true }),
      k.tag(330, 190, 'edits break other teams’ routes', 'risk', 'warn'),
      k.box(160, 215, 140, 56, 'InspectCompressor', 'webhook sets score', 'svc'),
      k.ask(300, 215),
      k.box(380, 212, 125, 36, 'ReplaceBlade', '', 'svc'),
      k.box(380, 270, 125, 36, 'RoutineSignoff', '', 'svc'),
      k.arrow([[300, 236], [378, 230]], { label: 'score > 7', at: [340, 222] }),
      k.arrow([[300, 256], [378, 288]], { label: '“looks clean”', at: [330, 294] }),
      k.box(545, 38, 160, 56, 'Inventory webhook', 'needs part # · date', 'svc'),
      k.arrow([[500, 150], [543, 80]], { dash: true }),
      k.tag(600, 110, 'times out', 'risk', 'clock'),
      k.tag(625, 140, 'raw text parsed in code', 'risk'),
      k.db(545, 168, 160, 80, 'Maintenance records', ['30 yrs scanned logs', 'photos · wiring PDFs']),
      k.box(545, 270, 160, 44, 'Vendor OCR pipeline', 'text only · to retire', 'risk'),
      k.ask(705, 270),
      k.arrow([[625, 248], [625, 268]]),
      k.arrow([[545, 292], [512, 292]], { kind: 'risk', dash: true }),
    ],

    // 13. Clinical trial team adopting agents-cli
    13: (k) => [
      k.tag(82, 22, 'agents-cli setup', 'info', 'code'),
      k.box(12, 40, 140, 70, 'Developer', ['+ AI coding assistant'], 'user'),
      k.box(185, 40, 145, 70, 'Prototype', ['local · 2 days', 'eval dataset slot'], 'q'),
      k.ask(330, 40),
      k.box(365, 40, 145, 70, 'Deploy infra', ['Dockerfile · Terraform', 'Cloud Build'], 'q'),
      k.ask(510, 40),
      k.box(550, 40, 160, 70, 'Cloud Run', 'via CI/CD', 'ok'),
      k.arrow([[152, 75], [183, 75]]),
      k.arrow([[330, 75], [363, 75]]),
      k.arrow([[510, 75], [548, 75]]),
      k.tag(257, 130, 'target undecided · security review', 'warn', 'lock'),
      k.tag(437, 155, 'keep custom agent.py', 'lock', 'lock'),
      k.tag(630, 130, 'dev: live browser chat', 'info'),
      k.zone(12, 180, 420, 140, 'Project layout'),
      k.box(30, 212, 110, 44, 'app/', 'original', 'svc'),
      k.box(230, 212, 150, 44, 'src/eligibility/', 'new location', 'agent'),
      k.ask(380, 212),
      k.arrow([[140, 234], [228, 234]], { label: 'moved', at: [184, 226] }),
      k.box(30, 266, 130, 44, 'agents-cli', 'deploy · playground', 'svc'),
      k.arrow([[160, 288], [228, 250]], { kind: 'risk', dash: true, label: 'agent not found', at: [215, 300] }),
      k.zone(455, 180, 255, 140, 'CI pipeline'),
      k.box(475, 208, 215, 46, 'Smoke test · 1 prompt', 'fail build on error', 'q'),
      k.ask(690, 208),
      k.box(475, 270, 215, 40, 'Full evaluation suite', '', 'svc'),
      k.arrow([[582, 254], [582, 268]]),
    ],

    // 14. Automotive manufacturer exposing systems via MCP
    14: (k) => [
      k.zone(12, 20, 215, 130, 'Laptop'),
      k.box(25, 45, 85, 50, 'Coding', 'assistant', 'user'),
      k.box(130, 45, 88, 50, 'MCP server', 'plant DB', 'q'),
      k.arrow([[110, 70], [128, 70]], { both: true }),
      k.db(137, 103, 76, 40, 'Docker DB', ''),
      k.zone(245, 20, 300, 300, 'Private VPC · production', 'lock'),
      k.box(260, 50, 120, 56, 'ADK agents', 'Cloud Run', 'agent'),
      k.box(410, 50, 120, 56, 'MCP server', 'own scaling · IAM', 'q'),
      k.arrow([[380, 78], [408, 78]], { both: true }),
      k.ask(530, 50),
      k.box(260, 150, 140, 56, 'Agent DB tools', 'custom per team', 'risk'),
      k.ask(400, 150),
      k.db(430, 132, 100, 44, 'Cloud SQL', ''),
      k.db(430, 184, 100, 44, 'Spanner', ''),
      k.db(430, 236, 100, 44, 'AlloyDB', ''),
      k.arrow([[400, 170], [428, 154]]), k.arrow([[400, 178], [428, 206]]), k.arrow([[400, 186], [428, 258]]),
      k.tag(330, 230, 'connections exhausted', 'risk', 'warn'),
      k.tag(345, 300, 'passwords baked in image', 'risk', 'shield'),
      k.zone(565, 20, 145, 175, 'Other team'),
      k.box(578, 45, 120, 64, 'Shared MCP', ['30 tools', 'incl. halt_line'], 'svc'),
      k.box(578, 130, 120, 52, 'Line monitor', 'needs 3 tools', 'agent'),
      k.arrow([[638, 109], [638, 128]], { both: true }),
      k.ask(698, 130),
      k.tag(638, 212, 'cannot modify', 'lock', 'lock'),
      k.tag(638, 250, 'no secrets in images', 'lock', 'lock'),
      k.tag(638, 285, 'IAM auth only', 'lock', 'shield'),
      k.zone(12, 170, 215, 150, 'Share an agent'),
      k.box(25, 198, 190, 48, 'Supply-chain agent', 'ADK', 'agent'),
      k.box(25, 266, 190, 44, 'Claude Code · IDEs', 'MCP clients', 'user'),
      k.arrow([[120, 264], [120, 248]]),
      k.ask(215, 246),
    ],

    // 15. Telecom analytics with Agent Skills and Data Agent Kit
    15: (k) => [
      k.zone(12, 20, 230, 300, 'Coding assistant · IDE'),
      k.box(30, 45, 190, 44, '40 Agent Skills', 'growing library', 'svc'),
      k.ask(220, 45),
      k.tag(127, 106, 'context at session start?', 'warn', 'warn'),
      k.box(30, 125, 190, 90, 'outage SKILL.md', ['1,200 lines: procedure', '+ parser script + 3GPP', '+ topology schema'], 'q'),
      k.ask(220, 125),
      k.tag(125, 235, 'script rewritten, not run', 'risk', 'warn'),
      k.box(30, 260, 190, 46, 'Analyst', 'pastes schemas by hand', 'user'),
      k.zone(262, 20, 180, 300, 'Data'),
      k.db(280, 50, 145, 70, 'BigQuery', '5G · fiber telemetry'),
      k.box(280, 145, 145, 56, 'dbt models', 'run · lineage', 'data'),
      k.arrow([[220, 283], [352, 283], [352, 203]], { kind: 'risk', dash: true, label: 'guesses columns', at: [300, 300] }),
      k.ask(352, 245),
      k.zone(462, 20, 248, 300, 'ADK agent'),
      k.box(480, 48, 210, 56, 'Root agent', 'Gemini Pro · talks to engineers', 'agent'),
      k.box(480, 140, 210, 56, '25 telemetry MCP tools', 'raw results: 1000s of rows', 'svc'),
      k.arrow([[585, 138], [585, 106]], { kind: 'risk', label: 'fills context', at: [632, 126] }),
      k.ask(690, 140),
      k.box(480, 215, 210, 44, './skills/outage', 'SKILL.md · scripts · refs', 'data'),
      k.arrow([[480, 237], [470, 237], [470, 76], [478, 76]], { dash: true }),
      k.ask(690, 215),
      k.tag(585, 290, 'Pro chat · cheap telemetry', 'info', 'bolt'),
    ],

    // 16. Media localization with dynamic ADK orchestration
    16: (k) => [
      k.zone(12, 20, 340, 155, 'Coordinator · LLM delegation'),
      k.box(30, 45, 130, 56, 'Coordinator', 'builds delivery plan', 'agent'),
      k.box(195, 40, 145, 26, 'SubtitlingAgent', '', 'agent'),
      k.box(195, 72, 145, 26, 'DubbingAgent', '', 'agent'),
      k.box(195, 104, 145, 26, 'ComplianceAgent', '', 'agent'),
      k.box(195, 136, 145, 26, 'FormatValidation', '', 'q'),
      k.ask(340, 136),
      k.arrow([[160, 60], [193, 53]]), k.arrow([[160, 70], [193, 85]]),
      k.arrow([[160, 80], [193, 117]]), k.arrow([[160, 90], [193, 149]]),
      k.tag(95, 125, 'same description ×2', 'risk', 'warn'),
      k.tag(95, 155, 'validator answers user', 'risk'),
      k.zone(372, 20, 338, 155, 'Routing · deterministic'),
      k.box(385, 66, 80, 52, 'Session', 'studio_tier', 'user'),
      k.box(490, 62, 80, 60, 'Router', 'no LLM', 'q'),
      k.ask(570, 62),
      k.box(600, 38, 100, 28, 'V1 · stable', '', 'agent'),
      k.box(600, 78, 100, 28, 'V2 · 10%', '', 'svc'),
      k.box(600, 118, 100, 40, 'Enterprise', 'high-capacity', 'agent'),
      k.arrow([[465, 92], [488, 92]]),
      k.arrow([[570, 82], [598, 52]]), k.arrow([[570, 92], [598, 92]]), k.arrow([[570, 102], [598, 138]]),
      k.arrow([[700, 92], [708, 92], [708, 52], [702, 52]], { kind: 'ok', dash: true }),
      k.text(385, 150, 'V2 fails → fall back to V1', 't-note', 'start'),
      k.zone(12, 190, 698, 132, 'Pipeline'),
      k.box(28, 228, 105, 50, 'Checksum', 'LlmAgent + tool', 'risk'),
      k.ask(133, 228),
      k.box(153, 228, 95, 50, 'Dubbing', '', 'agent'),
      k.box(268, 228, 95, 50, 'Subtitling', '', 'agent'),
      k.box(383, 228, 85, 50, 'QA', '', 'agent'),
      k.box(488, 228, 100, 50, 'Compliance', '', 'agent'),
      k.box(608, 228, 90, 50, 'Deliver', '', 'ok'),
      k.arrow([[133, 253], [151, 253]]), k.arrow([[248, 253], [266, 253]]), k.arrow([[363, 253], [381, 253]]),
      k.arrow([[468, 253], [486, 253]]), k.arrow([[588, 253], [606, 253]]),
      k.arrow([[440, 228], [440, 202], [200, 202], [200, 226]], { kind: 'risk', dash: true, label: 'rework ≤ 3, then human', at: [330, 198] }),
      k.arrow([[410, 228], [410, 214], [315, 214], [315, 226]], { kind: 'risk', dash: true }),
      k.arrow([[425, 278], [425, 300], [653, 300], [653, 280]], { dash: true, label: 'internal preview: skip', at: [540, 294] }),
      k.tag(130, 302, '4 levels of nesting', 'warn', 'warn'),
      k.ask(225, 302),
    ],

    // 17. Private banking assistant: state scopes + long-term memory
    17: (k) => [
      k.box(12, 40, 100, 56, 'Client', 'advisory chat', 'user'),
      k.zone(135, 20, 230, 150, 'Cloud Run · autoscaled'),
      k.box(150, 45, 60, 40, 'inst 1', '', 'svc'),
      k.box(222, 45, 60, 40, 'inst 2', '', 'svc'),
      k.box(294, 45, 60, 40, 'inst N', '', 'svc'),
      k.arrow([[112, 66], [148, 66]]),
      k.box(150, 108, 204, 46, 'InMemorySessionService', 'per instance', 'risk'),
      k.ask(354, 108),
      k.tag(190, 190, 'forgets portfolio mid-chat', 'risk', 'warn'),
      k.zone(12, 210, 353, 110, 'State lifetime'),
      k.line(252, 225, 252, 315, 'guide guide-strong'),
      k.text(200, 238, 'conversation 1', 't-axis', 'middle'),
      k.text(305, 238, 'conversation 2', 't-axis', 'middle'),
      k.text(28, 264, 'market_open', 't-lane'),
      k.text(28, 300, 'portfolio_id', 't-lane'),
      k.bar(150, 252, 205, 16, 'ok'),
      k.bar(150, 288, 98, 16, 'agent'),
      k.text(258, 301, '✕ reset', 't-risk', 'start'),
      k.ask(128, 260), k.ask(128, 296),
      k.zone(385, 20, 325, 300, 'Long-term memory'),
      k.box(400, 45, 140, 60, 'Session ends', 'client confirms', 'svc'),
      k.arrow([[470, 105], [470, 148]]),
      k.ask(470, 127),
      k.db(400, 150, 140, 80, 'Memory store', ['RAG · transcripts']),
      k.ask(540, 150),
      k.box(565, 150, 130, 34, 'old: conservative', '', 'risk'),
      k.box(565, 196, 130, 34, 'new: aggressive', '', 'ok'),
      k.arrow([[540, 180], [563, 167]], { dash: true }),
      k.arrow([[540, 200], [563, 213]], { dash: true }),
      k.tag(630, 250, 'both retrieved', 'risk', 'warn'),
      k.tag(470, 272, 'per-client isolation', 'lock', 'lock'),
      k.tag(470, 302, '≤ 7-year retention', 'lock', 'clock'),
      k.tag(630, 290, 'auditable history', 'lock', 'shield'),
    ],

    // 18. Hotel concierge agents acting on guests' behalf
    18: (k) => [
      k.tag(255, 20, 'no shared creds · no raw secrets', 'lock', 'lock'),
      k.box(12, 120, 100, 60, 'Guest', 'loyalty member', 'user'),
      k.box(180, 115, 150, 70, 'Concierge agent', 'ADK', 'agent'),
      k.arrow([[112, 150], [178, 150]], { both: true }),
      k.box(400, 25, 140, 50, 'Airline loyalty', 'SaaS · OAuth 2.0', 'data'),
      k.box(560, 25, 145, 50, 'Property mgmt', 'hotel API key', 'data'),
      k.arrow([[270, 115], [270, 50], [398, 50]], { dash: true }),
      k.arrow([[315, 115], [315, 92], [632, 92], [632, 77]], { dash: true }),
      k.ask(350, 71),
      k.zone(400, 110, 310, 110, 'Partner’s cloud · other framework'),
      k.box(530, 138, 165, 64, 'Booking agent', 'partner-owned', 'agent'),
      k.arrow([[330, 160], [528, 170]], { label: 'spa · yacht booking', at: [470, 150] }),
      k.ask(420, 165),
      k.tag(612, 235, 'up to 10 min · 60 s timeout', 'warn', 'clock'),
      k.box(12, 230, 120, 56, 'Booking note', 'hidden injection', 'risk'),
      k.arrow([[100, 230], [190, 187]], { kind: 'risk', dash: true }),
      k.box(180, 230, 150, 56, 'charge_guest', 'tool', 'svc'),
      k.arrow([[255, 185], [255, 228]]),
      k.ask(330, 230),
      k.tag(255, 305, '> $1,000 or non-refundable → confirm', 'warn', 'bolt'),
      k.box(420, 262, 280, 58, '~40 agents · 12 MCP servers · skills', ['duplicated · no approved-endpoint list'], 'q'),
      k.ask(700, 262),
    ],

    // 19. Mining exploration RAG over a large corpus
    19: (k) => [
      k.db(12, 28, 130, 72, '500k reports', ['tables · multi-column']),
      k.box(165, 38, 110, 56, 'Chunking', 'fixed-size', 'q'),
      k.ask(275, 38),
      k.box(310, 38, 120, 56, 'RAG Engine', 'index', 'svc'),
      k.arrow([[142, 66], [163, 66]]),
      k.arrow([[275, 66], [308, 66]]),
      k.tag(220, 115, 'rows split from headers', 'risk', 'warn'),
      k.box(12, 150, 120, 66, 'Geologist', ['site code', '+ concept'], 'user'),
      k.box(165, 135, 110, 44, 'Keyword', 'misses synonyms', 'svc'),
      k.box(165, 187, 110, 44, 'Vector', 'misses codes', 'svc'),
      k.arrow([[132, 172], [163, 157]]), k.arrow([[132, 194], [163, 209]]),
      k.arrow([[275, 157], [290, 173]]), k.arrow([[275, 209], [290, 193]]),
      k.ask(300, 183, 'merge?', false),
      k.box(325, 155, 100, 56, '50 passages', '', 'data'),
      k.arrow([[313, 183], [323, 183]]),
      k.ask(455, 183, 'top 5?', true),
      k.arrow([[425, 183], [442, 183]]),
      k.box(480, 155, 105, 56, 'Model', 'synthesis', 'agent'),
      k.arrow([[468, 183], [478, 183]]),
      k.box(610, 155, 100, 56, 'Answer', '', 'user'),
      k.arrow([[585, 183], [608, 183]]),
      k.tag(430, 130, 'best passage ranked #12', 'risk', 'warn'),
      k.tag(645, 130, 'invented figures', 'risk', 'warn'),
      k.zone(12, 245, 698, 78, 'Evaluation'),
      k.box(30, 268, 150, 44, 'Eval suite', 'ROUGE vs reference', 'svc'),
      k.ask(180, 268),
      k.box(290, 268, 130, 44, 'results_v1.json', 'chunk 500', 'data'),
      k.box(460, 268, 130, 44, 'results_v2.json', 'chunk 200', 'data'),
      k.arrow([[420, 290], [458, 290]], { label: 'baseline →', at: [439, 262] }),
      k.ask(590, 268),
      k.tag(655, 290, 'avg 4.3 → 4.2', 'warn', 'warn'),
    ],

    // 20. FinTech settlement agents in production
    20: (k) => [
      k.zone(12, 20, 210, 150, 'Fraud scoring', 'q'),
      k.box(28, 44, 178, 44, 'Fraud-scoring agent', '', 'agent'),
      k.ask(206, 44),
      k.text(28, 112, '• accelerator not on serverless', 't-note', 'start'),
      k.text(28, 132, '• mainframe sidecar', 't-note', 'start'),
      k.text(28, 152, '• DaemonSet on every node', 't-note', 'start'),
      k.box(250, 40, 150, 50, 'Reconciliation', 'Agent Runtime', 'agent'),
      k.box(250, 110, 150, 50, 'Notifications', 'Cloud Run', 'agent'),
      k.zone(470, 20, 240, 150, 'Company VPC', 'lock'),
      k.db(560, 50, 130, 86, 'Cloud SQL', 'private IP'),
      k.arrow([[400, 65], [558, 82]]),
      k.arrow([[400, 135], [558, 110]]),
      k.ask(440, 70), k.ask(440, 128),
      k.tag(310, 20, 'golden set: 30% fail', 'risk', 'warn'),
      k.tag(335, 183, 'no public internet', 'lock', 'shield'),
      k.zone(12, 205, 330, 115, 'Cost reporting'),
      k.box(28, 232, 110, 50, 'Cloud Trace', 'manual export', 'svc'),
      k.box(165, 232, 90, 50, 'Sheets', 'monthly', 'risk'),
      k.box(270, 232, 60, 50, 'Finance', '', 'user'),
      k.arrow([[138, 257], [163, 257]]), k.arrow([[255, 257], [268, 257]]),
      k.tag(150, 305, 'SQL · by agent & segment · 13 mo', 'info'),
      k.ask(290, 305),
      k.zone(362, 205, 348, 115, 'Release · canary'),
      k.box(378, 235, 100, 36, 'v1 · 90%', '', 'agent'),
      k.box(378, 280, 100, 34, 'v2 · 10%', '', 'svc'),
      k.box(510, 238, 90, 72, 'Dashboards', ['latency ✓', 'errors ✓'], 'ok'),
      k.arrow([[478, 253], [508, 262]], { dash: true }),
      k.arrow([[478, 297], [508, 290]], { dash: true }),
      k.ask(650, 274, 'promote today?', false),
    ],
  };

  function render(scenarioId) {
    const fn = DIAGRAMS[scenarioId];
    if (!fn) return '';
    const n = ++seq;
    const sc = (window.EXAM_DATA && window.EXAM_DATA.scenarios.find((s) => s.id === scenarioId)) || {};
    return wrap(n, fn(kit(n)).join(''), `Scenario ${scenarioId} diagram: ${sc.title || ''}`);
  }

  return { render, has: (id) => !!DIAGRAMS[id] };
})();
