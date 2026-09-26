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
