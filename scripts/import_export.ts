import fs from 'fs';
import path from 'path';
import { supabase } from './seed_client';

/**
 * Loads the CSV files exported from the Supabase dashboard (supabase/export/<table>_rows.csv)
 * into the tables created by supabase/migrations/00_init.sql.
 * Usage: npx tsx scripts/import_export.ts [dir]   (default: supabase/export)
 *
 * Why a script instead of the dashboard's CSV import: the export writes arrays as JSON
 * (["a","b"]), which Postgres array columns do not accept as text, and the tables must be
 * loaded in a specific order (see TABLES).
 */

type ColumnType = 'text' | 'int' | 'bool' | 'json' | 'nullable';

interface TableSpec {
  name: string;
  columns: Record<string, ColumnType>;
}

// Order matters:
// - cosmos_maps before topics: inserting a topic creates an empty map with the same id
//   (ON CONFLICT DO NOTHING), so the real map must already be there.
// - topics before articles, articles before article_contents (foreign keys).
const TABLES: TableSpec[] = [
  { name: 'cosmos_maps', columns: { id: 'text', map_type: 'text', theme: 'text', nodes: 'json', created_at: 'text' } },
  { name: 'topics', columns: { id: 'text', name: 'text', description: 'nullable', article_count: 'int', sort_order: 'int', created_at: 'text' } },
  {
    name: 'articles',
    columns: {
      id: 'text', title: 'text', topic_id: 'nullable', summary: 'nullable', tags: 'json', is_published: 'bool',
      created_at: 'text', updated_at: 'text', published_at: 'nullable',
    },
  },
  { name: 'article_contents', columns: { id: 'text', content: 'text' } },
  {
    name: 'textbooks',
    columns: {
      id: 'text', title: 'text', description: 'nullable', authors: 'json', cover_image_url: 'nullable', pdf_url: 'nullable',
      sort_order: 'int', created_at: 'text', updated_at: 'text',
    },
  },
  {
    name: 'models',
    columns: {
      id: 'text', name: 'text', description: 'nullable', task_type: 'nullable', metadata_url: 'nullable',
      file_size_bytes: 'int', version: 'text', format: 'text', created_at: 'text', updated_at: 'text',
    },
  },
  // users and user_progress are not imported: accounts start fresh on Firebase.
];

const BATCH_SIZE = 100;

/** RFC 4180 CSV: quoted fields may contain commas, newlines and "" (an escaped quote). */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || r[0] !== '');
}

function convert(value: string, type: ColumnType): unknown {
  switch (type) {
    case 'int': return value === '' ? null : Number(value);
    case 'bool': return value === 'true';
    case 'json': return value === '' ? null : JSON.parse(value);
    case 'nullable': return value === '' ? null : value;
    default: return value;
  }
}

async function importTable(dir: string, spec: TableSpec) {
  const file = path.join(dir, `${spec.name}_rows.csv`);
  if (!fs.existsSync(file)) {
    console.log(`- ${spec.name}: no file, skipped`);
    return;
  }

  const [header, ...lines] = parseCsv(fs.readFileSync(file, 'utf8'));
  const rows = lines.map(values => {
    const row: Record<string, unknown> = {};
    header.forEach((col, i) => {
      const type = spec.columns[col];
      if (type) row[col] = convert(values[i] ?? '', type);
    });
    return row;
  });

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const { error } = await supabase.from(spec.name).upsert(rows.slice(i, i + BATCH_SIZE));
    if (error) throw new Error(`${spec.name}: ${error.message}`);
  }
  console.log(`- ${spec.name}: ${rows.length} rows`);
}

async function main() {
  const dir = path.resolve(process.cwd(), process.argv[2] ?? 'supabase/export');
  console.log(`Importing from ${dir}`);
  for (const spec of TABLES) await importTable(dir, spec);
  console.log('✅ Import completed.');
  process.exit(0);
}

main().catch(error => {
  console.error('❌ Import failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
