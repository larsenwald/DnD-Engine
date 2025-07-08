class Roll {
  static d(roll, sides, adv){//function(how many dice to roll, how many sides of each die). returns array of rolls
        const output = [];
        for (let i = 0; i < roll; i++) {
            const currentRoll = Math.floor(Math.random() * sides) + 1;
            const rollObject = {val: currentRoll, d:sides};
            if (currentRoll === sides) rollObject.crit = true;
            if (currentRoll === 1) rollObject.fumble = true;
            output.push(rollObject);
        }

        //if adv is 'adv', sort the array so that the highest roll is first. if adv is 'dis', sort the array so that the lowest roll is first.
        if (adv === 'adv') output.sort((a,b) => b.val - a.val);
        if (adv === 'dis') output.sort((a,b) => a.val - b.val);
        return output;
    }
     static string (rollString) {
    if (typeof rollString !== 'string' || !rollString.trim()) {
      throw new Error('Roll.roll › rollString must be a non-empty string.');
    }

    /* 1. TOKENISE (split into terms and ± operators, preserving order) */
    const terms = Roll.#tokenise(rollString);

    /* 2. RESOLVE EACH TERM                                                  */
    const descParts   = [];           //  left of the colon
    const resultParts = [];           //  right of the colon
    let   runningTotal = 0;
    let   pendingOp    = '+';         //  default for first term

    for (const term of terms) {
      /* --- operators simply set the pendingOp for the next value --- */
      if (term.type === 'op') {
        pendingOp = term.value;                      // '+'  or  '-'
        descParts.push(pendingOp);
        resultParts.push(pendingOp);
        continue;
      }

      /* --- dice or flat modifiers --- */
      const handled = term.type === 'dice'
        ? Roll.#handleDice(term)
        : Roll.#handleFlat(term);

      descParts.push(handled.desc);
      resultParts.push(handled.display);

      runningTotal = (pendingOp === '+')
        ? runningTotal + handled.total
        : runningTotal - handled.total;

      pendingOp = '+';          //  reset; next op will overwrite
    }

    /* 3. GLUE IT TOGETHER                                                  */
    const descStr   = descParts.join(' ').replace(/\s([+\-])\s/g, ' $1 ');
    const resultStr = resultParts.join(' ').replace(/\s([+\-])\s/g, ' $1 ');
    return `${descStr}: ${resultStr} = ${runningTotal}`;
  }

  /* ────────────────────────────────────────────────────────────────────────── */
  /*  HELPERS – PARSING                                                      */
  /* ────────────────────────────────────────────────────────────────────────── */

  /**
   * Break the user string into a flat list of *terms*:
   *    {type:'op',   value:'+'}                       – explicit operators
   *    {type:'dice', ...parsedDiceData }              – dice groups
   *    {type:'mod',  value:5, label:'proficiency'}    – flat numbers
   */
  static #tokenise (str) {
    const tokens   = [];
    let   current  = '';
    let   depth    = 0;   // depth inside [square-brackets] so we don’t split “+”  inside a label

    const push = () => {
      if (!current.trim()) return;
      tokens.push(Roll.#parseTerm(current.trim()));
      current = '';
    };

    for (const c of str) {
      if (c === '[') depth++;
      if (c === ']') depth--;

      if ((c === '+' || c === '-') && depth === 0) {
        push();
        tokens.push({type: 'op', value: c});
      } else {
        current += c;
      }
    }
    push();        // final chunk

    if (!tokens.length) throw new Error('Roll.roll › nothing to roll!');

    return tokens;
  }

  /**
   * Parse one *term* (already stripped of + / -)
   */
  static #parseTerm (raw) {
    /* — label ( [something] ) — */
    let  label = '';
    const labelMatch = raw.match(/\[([^\]]+)]$/);
    if (labelMatch) {
      label = labelMatch[1].trim();
      raw   = raw.slice(0, labelMatch.index).trim();
    }

    /* — dice? — */
    if (raw.toLowerCase().includes('d')) {
      return {...Roll.#parseDice(raw), label};
    }

    /* — flat modifier — */
    const n = Number(raw);
    if (!Number.isFinite(n)) {
      throw new Error(`Roll.roll › invalid token “${raw}”`);
    }
    return {type:'mod', value:n, label};
  }

  /**
   * Parse dice notation such as “4d6kh3rr<3”
   * Returns a structured object, still *type:"dice"* so the main loop can
   * dispatch on it.
   */
  static #parseDice (raw) {
    const diceRe = /^(\d*)d(\d+)(.*)$/i;
    const m = raw.match(diceRe);
    if (!m) throw new Error(`Roll.roll › invalid dice syntax “${raw}”`);

    const count = m[1] ? parseInt(m[1], 10) : 1;
    const sides = parseInt(m[2], 10);
    let   suf   = m[3] ?? '';
    if (count < 1 || count > 1000) throw new Error('Roll.roll › dice count must be 1-1000');
    if (sides < 1 || sides > 1e6)  throw new Error('Roll.roll › sides must be 1-1 000 000');

    /* ---- flags / suffixes ---- */
    suf = suf.toLowerCase();
    const adv   = suf.includes('adv');
    const dis   = suf.includes('dis');
    if (adv && dis) throw new Error('Roll.roll › Cannot have both adv and dis on one group');

    const keepDropMatch = suf.match(/([k|d][h|l])(\d*)/);   // kh3  kl1  dl2  dh
    const keepDrop = keepDropMatch
      ? {code: keepDropMatch[1], n: keepDropMatch[2] ? +keepDropMatch[2] : 1}
      : null;

    const rerollMatch = suf.match(/(rr|r)(?:([<>]=?|=)?(\d+))?/); // r1   rr<3
    let reroll = null;
    if (rerollMatch) {
      const [, rrFlag, cmp, num] = rerollMatch;
      reroll = {
        recursive : rrFlag === 'rr',
        cmp       : cmp     || '=',     // default “=”
        thresh    : num ? +num : 1
      };
    }

    return {
      type  : 'dice',
      raw   : raw,
      count,
      sides,
      adv,
      dis,
      keepDrop,
      reroll
    };
  }

  /* ────────────────────────────────────────────────────────────────────────── */
  /*  HELPERS – ROLLING                                                      */
  /* ────────────────────────────────────────────────────────────────────────── */

  static #handleFlat (term) {
    const desc = term.label
      ? `${term.value} (${term.label})`
      : `${term.value}`;
    return {
      desc,
      display : String(term.value),
      total   : term.value
    };
  }

  static #handleDice (t) {
    /* 1. Roll the dice (including advantage / rerolls) */
    if (t.adv || t.dis) {                       // advantage / disadvantage
      return Roll.#rollWithAdvDis(t);
    }

    /* Regular bucket of dice, maybe with keep/drop and/or reroll */
    const rolls   = [];                         // [{val, kept, dispStr}]
    let   keptSum = 0;

    for (let i = 0; i < t.count; i++) {
      const {val, chain}  = Roll.#rollOne(t.sides, t.reroll);
      rolls.push({idx:i, val, chain});
    }

    /* ----- keep / drop handling ----- */
    let keptFlag = Array(t.count).fill(true);

    if (t.keepDrop) {
      const n = t.keepDrop.n;
      if (n < 0 || n > t.count) throw new Error('Roll.roll › invalid keep/drop count');

      const sortedIdx = rolls
        .map((r,i)=>[i,r.val])
        .sort((a,b)=>a[1]-b[1])                 // ascending
        .map(pair=>pair[0]);                    // indices only

      switch (t.keepDrop.code) {
        case 'kh':                             // keep highest n
          keptFlag = keptFlag.map(()=>false);
          sortedIdx.slice(-n).forEach(i=>keptFlag[i]=true);
          break;
        case 'kl':                             // keep lowest n
          keptFlag = keptFlag.map(()=>false);
          sortedIdx.slice(0, n).forEach(i=>keptFlag[i]=true);
          break;
        case 'dh':                             // drop highest n
          sortedIdx.slice(-n).forEach(i=>keptFlag[i]=false);
          break;
        case 'dl':                             // drop lowest n
          sortedIdx.slice(0, n).forEach(i=>keptFlag[i]=false);
          break;
      }
    }

    /* ----- build display & sum ----- */
    const pieces = [];
    rolls.forEach((r,i)=>{
      const str = Roll.#markCrits(r.chain, t.sides);
      const wrapped = keptFlag[i] ? `{${str}}` : str;
      pieces.push(wrapped);
      if (keptFlag[i]) keptSum += r.val;
    });

    const display = (t.count === 1 && !t.keepDrop)
      ? pieces[0]                                // no parentheses
      : `(${pieces.join(', ')})`;

    const suffix = Roll.#rebuildSuffix(t);       // for left-of-colon text
    const desc   = `${t.count}d${t.sides}${suffix}` + (t.label ? ` (${t.label})` : '');

    return {desc, display, total: keptSum};
  }

  /**
   * Roll n dice with advantage/disadvantage (roll two per die, keep one).
   * Display pairs separated by “ | ” and brace the kept value.
   */
  static #rollWithAdvDis (t) {
    const pairsStr  = [];
    let   total     = 0;

    for (let i=0; i<t.count; i++) {
      const r1 = Roll.#rand(t.sides);
      const r2 = Roll.#rand(t.sides);

      const keepFirst = t.adv ? (r1 >= r2) : (r1 <= r2);   // adv = higher, dis = lower
      const kVal      = keepFirst ? r1 : r2;
      total          += kVal;

      const show = v => Roll.#markCrits(String(v), t.sides);
      const pStr = keepFirst
        ? `{${show(r1)}}, ${show(r2)}`
        : `${show(r1)}, {${show(r2)}}`;

      pairsStr.push(pStr);
    }

    const display = `(${pairsStr.join(' | ')})`;
    const suffix  = Roll.#rebuildSuffix(t);
    const desc    = `${t.count}d${t.sides}${suffix}` + (t.label ? ` (${t.label})` : '');

    return {desc, display, total};
  }

  /* ----  single die, respecting (r) & (rr)  ---- */
  static #rollOne (sides, rerollCfg) {
    const chain = [];
    let   val   = Roll.#rand(sides);
    let   loops = 0;

    const cmpFn = rerollCfg
      ? Roll.#makeCmp(rerollCfg.cmp, rerollCfg.thresh)
      : ()=>false;                                 // never reroll

    while (rerollCfg && cmpFn(val)) {
      chain.push(val);
      val   = Roll.#rand(sides);
      loops++;
      if (!rerollCfg.recursive || loops >= 100) break;   // safety
    }
    chain.push(val);
    return {val, chain: chain.map(String)};
  }

  /* ────────────────────────────────────────────────────────────────────────── */
  /*  HELPERS – UTILS                                                        */
  /* ────────────────────────────────────────────────────────────────────────── */
  static #rand (sides) {                    // 1-based random
    return Math.floor(Math.random() * sides) + 1;
  }

  static #makeCmp (cmp, thresh) {
    switch (cmp) {
      case '<'  : return v => v <  thresh;
      case '<=' : return v => v <= thresh;
      case '>'  : return v => v >  thresh;
      case '>=' : return v => v >= thresh;
      case '='  : return v => v === thresh;
      default   : return v => v === thresh; // default “=”
    }
  }

  /**
   * Add “!” or “~” decoration to numbers already in string form, respecting
   * reroll chains which come through as  ['1','2','15']  etc.
   */
  static #markCrits (str, sides) {
    const mark = n => {
      const v = +n;
      return v === 1   ? `${v}~`
           : v === sides ? `${v}!`
           : n;
    };
    if (str.includes('→')) {
      // already an arrow-joined chain, mark each piece
      return str.split('→').map(mark).join('→');
    }
    // simple number
    return mark(str);
  }

  /*  Rebuild the flag suffix (adv, kh3, r1 …) so the left-hand description
      echoes exactly what the user asked, even if they omitted the leading “1”. */
  static #rebuildSuffix (t) {
    let suffix = '';
    if (t.adv) suffix += 'adv';
    if (t.dis) suffix += 'dis';
    if (t.keepDrop) suffix += t.keepDrop.code + t.keepDrop.n;
    if (t.reroll) {
      const op = t.reroll.cmp === '=' ? '' : t.reroll.cmp;
      suffix += (t.reroll.recursive ? 'rr' : 'r') + op + t.reroll.thresh;
    }
    return suffix;
  }
}