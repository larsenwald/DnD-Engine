/*
- `entriesArr` → the “entries” property array of a species object
- returns: string[]  (each element is a complete Markdown block of an individual feature)
- options.headLevel lets you pick how many # symbols you want (default 3)
 */
function entriesToMarkdownArray(entriesArr, options = {}) {
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
      const name   = it.name ? `**${stripTags(it.name)}**` : '';
      const body   = (it.entries || []).map(e => render(e, depth + 1)).join('\n');
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
