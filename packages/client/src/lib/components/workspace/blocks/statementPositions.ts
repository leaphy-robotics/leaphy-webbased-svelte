/**
 * findStatements.ts
 *
 * Finds the Y positions (height) of every statement area in a Zelos-rendered
 * Blockly block SVG path.
 *
 * ─── What is a "statement area"? ────────────────────────────────────────────
 *
 * A Blockly block is drawn as a single closed SVG <path>. It has one or more
 * horizontal content rows called "statement areas" — the regions between
 * child-block cutouts (notches). There is always at least one: the top header
 * row. Each child-block slot adds a notch and then another statement row below.
 *
 *   ┌──────────────────────────────────────┐  ← top of statement [0]
 *   │  "while true"  header row            │
 *   └──────────────────┐                   │  ← bottom of statement [0]
 *         notch        │  (child slot)     │
 *   ┌──────────────────┘                   │  ← top of statement [1]
 *   │  body row                            │
 *   └──────────────────────────────────────┘  ← bottom of statement [1]
 *
 * ─── How the geometry works ─────────────────────────────────────────────────
 *
 * In Zelos, the right wall of the block uses a distinctive pair of arc
 * commands to mark the corners of each statement row:
 *
 *   RIGHT-WALL ENTRY  a 4 4 0 0,1  4,4   (relative, sweep=1, dx=+4, dy=+4)
 *   RIGHT-WALL EXIT   a 4 4 0 0,1 -4,4   (relative, sweep=1, dx=-4, dy=+4)
 *
 * The Y coordinate *just before* the ENTRY arc  = top of the statement area.
 * The Y coordinate *just before* the EXIT  arc  = bottom of the statement area.
 *
 * The very last arc of the path (`a 4 4 0 0,1 -4,-4`, dy=-4) closes the
 * bottom-left corner and is intentionally not matched by the exit signature
 * (dy sign differs).
 *
 * Child-block notch arcs use sweep=0 and are entirely ignored by this algorithm.
 */

export interface StatementPosition {
	/** Absolute Y coordinate of the top edge of the statement area. */
	top: number;
	/** Absolute Y coordinate of the bottom edge of the statement area. */
	bottom: number;
	/** Height of the statement area in SVG units (bottom − top). */
	height: number;
}

// ─── Internal types ──────────────────────────────────────────────────────────

interface PathToken {
	/** Normalised uppercase command letter. */
	cmd: string;
	args: number[];
	/** True when the original letter was uppercase (absolute coordinates). */
	absolute: boolean;
}

// ─── SVG path tokeniser ──────────────────────────────────────────────────────

function tokenisePath(d: string): PathToken[] {
	return d
		.trim()
		.split(/(?=[MmAaHhVvCcLlZz])/)
		.filter(Boolean)
		.map((seg) => {
			const raw = seg.trim();
			const letter = raw[0];
			const absolute = letter === letter.toUpperCase();
			const args = raw
				.slice(1)
				.trim()
				.split(/[\s,]+/)
				.filter(Boolean)
				.map(Number);
			return { cmd: letter.toUpperCase(), args, absolute };
		});
}

// ─── Arc signature matchers ──────────────────────────────────────────────────

/** Top-right corner of a statement row — relative `a 4 4 0 0,1 4,4`. */
function isRightWallEntry(t: PathToken): boolean {
	if (t.cmd !== 'A' || t.absolute) return false;
	const [rx, ry, , , sweep, dx, dy] = t.args;
	return rx === 4 && ry === 4 && sweep === 1 && dx === 4 && dy === 4;
}

/** Bottom-right corner of a statement row — relative `a 4 4 0 0,1 -4,4`. */
function isRightWallExit(t: PathToken): boolean {
	if (t.cmd !== 'A' || t.absolute) return false;
	const [rx, ry, , , sweep, dx, dy] = t.args;
	return rx === 4 && ry === 4 && sweep === 1 && dx === -4 && dy === 4;
}

// ─── Y-position tracker ──────────────────────────────────────────────────────

/** Advance (or set) the running absolute Y given one path token. */
function advanceY(y: number, token: PathToken): number {
	switch (token.cmd) {
		case 'M': // m/M  x,y
			return token.absolute ? token.args[1] : y + (token.args[1] ?? 0);
		case 'V': // v/V  y
			return token.absolute ? token.args[0] : y + token.args[0];
		case 'L': // l/L  x,y
			return token.absolute ? token.args[1] : y + (token.args[1] ?? 0);
		case 'C': // c/C  cp1x,cp1y, cp2x,cp2y, x,y  — endpoint is args[4..5]
			return token.absolute ? token.args[5] : y + token.args[5];
		case 'A': // a/A  rx,ry,x-rot,large-arc,sweep, dx,dy — endpoint dy is args[6]
			return token.absolute ? token.args[6] : y + token.args[6];
		case 'H': // horizontal line — no Y change
		case 'Z': // close path — no Y change
		default:
			return y;
	}
}

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Parse a Zelos Blockly SVG path and return the position of every statement
 * area, ordered top-to-bottom.
 *
 * @param d  The `d` attribute string of the block's SVG <path> element.
 * @returns  Array of statement positions (one per content row).
 *
 * @example
 * const stmts = findStatementPositions(blockPathD);
 * // stmts[0] → { top: 0, bottom: 44, height: 44 }   (header row)
 * // stmts[1] → { top: 72, bottom: 100, height: 28 }  (body row)
 */
export function findStatementPositions(d: string): StatementPosition[] {
	const tokens = tokenisePath(d);
	const statements: StatementPosition[] = [];

	let y = 0;
	// Y snapshot taken at the RIGHT-WALL ENTRY arc; null outside a row.
	let rowTopY: number | null = null;

	for (const token of tokens) {
		// Check arc signatures BEFORE advancing Y so we capture the Y at the
		// start of the arc, not after it.
		if (isRightWallEntry(token)) {
			rowTopY = y;
		} else if (isRightWallExit(token) && rowTopY !== null) {
			statements.push({ top: rowTopY, bottom: y, height: y - rowTopY });
			rowTopY = null;
		}

		y = advanceY(y, token);
	}

	return statements;
}
