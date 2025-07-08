/*
- `entriesArr` → the “entries” property array of a species object
- returns: string[]  (each element is a complete Markdown block of an individual feature)
- options.headLevel lets you pick how many # symbols you want (default 3)
 */
function speciesEntriesToMarkdownArray(entriesArr, options = {}) {
  const HEAD = '#'.repeat(options.headLevel ?? 3);   // default ###

  // ── helper: strip {@tag stuff} but keep the human part ──────────
  const stripTags = (txt) =>
    txt.replace(/{@([^}]+)}/g, (_m, inner) => {
      // inner looks like "spell Fire Bolt|XPHB"
      const body = inner.split('|')[0];             // ditch |source
      const firstSpace = body.indexOf(' ');
      return firstSpace === -1 ? body : body.slice(firstSpace + 1);
    });

  // ── helper: tables → pipe Markdown ──────────────────────────────
  const renderTable = (tbl) => {
    const header = tbl.colLabels.join(' | ');
    const bar    = tbl.colLabels.map(()=>'---').join(' | ');
    const rows   = tbl.rows.map(r => r.join(' | ')).join('\n');
    return `${tbl.caption ? `**${tbl.caption}**\n` : ''}| ${header} |\n| ${bar} |\n| ${rows} |`;
  };

  // ── helper: lists (hang-style) ──────────────────────────────────
    const renderList = (lst, depth = 0) => {
    const pad = '  '.repeat(depth);
    return lst.items.map(it => {
      // 👉 if the item is just a string, output a simple bullet
      if (typeof it === 'string') return `${pad}- ${stripTags(it)}`;

      // otherwise treat it as the usual object-with-entries
      const name = it.name ? `**${stripTags(it.name)}**` : '';
      const body = (it.entries || []).map(e => render(e, depth + 1)).join('\n');
      return `${pad}- ${name}${name && body ? '\n' : ''}${body}`;
    }).join('\n');
  };

  // ── recursive renderer ──────────────────────────────────────────
  const render = (node, depth = 0) => {
    if (typeof node === 'string') return '  '.repeat(depth) + stripTags(node);

    switch (node.type) {
      case 'list':    return renderList(node, depth);
      case 'table':   return renderTable(node);
      case 'entries': {
        const head = node.name ? `${HEAD} ${stripTags(node.name)}` : '';
        const body = node.entries.map(e => render(e, depth)).join('\n');
        return `${head}${head && body ? '\n' : ''}${body}`;
      }
      default:        // unknown → stringify for now
        return '  '.repeat(depth) + stripTags(JSON.stringify(node));
    }
  };

  // ── MAIN LOOP ───────────────────────────────────────────────────
  return entriesArr.map(trait => {
    const title = `${HEAD} ${stripTags(trait.name)}`;
    const body  = trait.entries.map(e => render(e)).join('\n');
    return `${title}\n${body}`;
  });
}


/*
`classFeatures` – the 2-D array from 5e.tools data:
      index 0 → level 1 features (array)
      index 1 → level 2 features (array)
      ...
returns: string[]  (each element = a complete Markdown block)

options.headLevel  : how many # symbols to use for headings (default 3)
options.showLevel  : if true, prefix the heading with “Lv X – ” (default true)
 */
function classFeaturesToMarkdownArray (classFeatures, options = {}) {
  const HEAD   = '#'.repeat(options.headLevel ?? 3);
  const withLv = options.showLevel ?? true;

  const stripTags = (txt) =>
    txt.replace(/{@([^}]+)}/g, (_m, inner) => {
      const body = inner.split('|')[0];
      const firstSpace = body.indexOf(' ');
      return firstSpace === -1 ? body : body.slice(firstSpace + 1);
    });

  const renderTable = (tbl) => {
    const header = tbl.colLabels.join(' | ');
    const bar    = tbl.colLabels.map(()=>'---').join(' | ');
    const rows   = tbl.rows.map(r => r.join(' | ')).join('\n');
    return `${tbl.caption ? `**${tbl.caption}**\n` : ''}| ${header} |\n| ${bar} |\n| ${rows} |`;
  };

    const renderList = (lst, depth = 0) => {
    const pad = '  '.repeat(depth);
    return lst.items.map(it => {
      // 👉 if the item is just a string, output a simple bullet
      if (typeof it === 'string') return `${pad}- ${stripTags(it)}`;

      // otherwise treat it as the usual object-with-entries
      const name = it.name ? `**${stripTags(it.name)}**` : '';
      const body = (it.entries || []).map(e => render(e, depth + 1)).join('\n');
      return `${pad}- ${name}${name && body ? '\n' : ''}${body}`;
    }).join('\n');
  };

  const render = (node, depth = 0) => {
    if (typeof node === 'string') return '  '.repeat(depth) + stripTags(node);

    switch (node.type) {
      case 'list':    return renderList(node, depth);
      case 'table':   return renderTable(node);
      case 'entries': {
        const head = node.name ? `${'  '.repeat(depth)}**${stripTags(node.name)}**\n` : '';
        const body = node.entries.map(e => render(e, depth + 1)).join('\n');
        return head + body;
      }
      case 'inset': {
        // Markdown block-quote: > Fancy Sidebar
        const title = node.name ? `> **${stripTags(node.name)}**\n` : '> ';
        const body  = node.entries
                        .map(e => render(e, depth))
                        .join('\n')
                        .split('\n')
                        .map(line => `> ${line}`)          // prefix every line with “> ”
                        .join('\n');
        return `${title}${body}`;
      }
      case 'refClassFeature': {
        // grab the bit before the first “|”
        const name = node.classFeature.split('|')[0];
        // render it as a nested bullet
        return `${'  '.repeat(depth)}- _See feature:_ **${stripTags(name)}**`;
      }
            /*handle optional-feature pointers */
      case 'refOptionalfeature': {
        const name = node.optionalfeature.split('|')[0];
        return `${'  '.repeat(depth)}- **${stripTags(name)}**`;
      }

      /* handle “choose X options” blocks */
      case 'options': {
        const qty  = node.count ?? node.choose ?? 1;
        const lead = `${'  '.repeat(depth)}*Choose ${qty === 1 ? 'one' : qty} of the following:*`;
        const list = (node.entries || [])
                       .map(e => render(e, depth + 1))
                       .join('\n');
        return `${lead}\n${list}`;
      }
      default:
        return '  '.repeat(depth) + stripTags(JSON.stringify(node));
    }
  };

  /* ─── MAIN LOOP ─── */
  const out = [];
  if (!Array.isArray(classFeatures[0])) {
    // looks flat, so regroup by .level
    const grouped = [];
    classFeatures.forEach(obj => {
      const idx = obj.level - 1;
      (grouped[idx] ??= []).push(obj);
    });
    classFeatures = grouped;
}

  classFeatures.forEach((featureArr, idx) => {
    const level = idx + 1;                // array index → character level
    featureArr.forEach((feat) => {
      const title = `${HEAD} ${withLv ? `Lv ${level} – ` : ''}${stripTags(feat.name)}`;
      const body  = (feat.entries || []).map(e => render(e)).join('\n');
      out.push(`${title}\n${body}`);
    });
  });

  return out;
}
