const initSqlJs = require('sql.js');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, 'adarshgram.db');
let sqlDb = null;
let dbWrapper = null;
let saveTimer = null;

/* ── Persistence helpers ───────────────────────────────── */
function scheduleSave() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(saveNow, 1500);
}

function saveNow() {
  if (!sqlDb) return;
  try {
    const data = sqlDb.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
  } catch (e) {
    console.error('DB save error:', e.message);
  }
}

/* ── Compatibility wrapper (mimics better-sqlite3) ─────── */
class Stmt {
  constructor(db, sql) {
    this._db = db;
    this._sql = sql;
  }

  _flat(args) {
    return args.reduce((acc, a) => acc.concat(Array.isArray(a) ? a : [a]), []);
  }

  _toRows(result) {
    if (!result || result.length === 0) return [];
    const { columns, values } = result[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
  }

  /** INSERT / UPDATE / DELETE */
  run(...args) {
    const params = this._flat(args);
    try {
      this._db.run(this._sql, params);
    } catch (e) {
      console.error('DB run error:', e.message, '\nSQL:', this._sql);
      throw e;
    }
    const idRes = this._db.exec('SELECT last_insert_rowid() as id');
    const lastInsertRowid = idRes[0]?.values[0]?.[0] || 0;
    scheduleSave();
    return { lastInsertRowid };
  }

  /** SELECT – first row */
  get(...args) {
    const params = this._flat(args);
    try {
      const result = this._db.exec(this._sql, params);
      return this._toRows(result)[0];
    } catch (e) {
      console.error('DB get error:', e.message, '\nSQL:', this._sql);
      return undefined;
    }
  }

  /** SELECT – all rows */
  all(...args) {
    const params = this._flat(args);
    try {
      const result = this._db.exec(this._sql, params);
      return this._toRows(result);
    } catch (e) {
      console.error('DB all error:', e.message, '\nSQL:', this._sql);
      return [];
    }
  }
}

class DbWrapper {
  prepare(sql) { return new Stmt(sqlDb, sql); }

  exec(sql) {
    try { sqlDb.exec(sql); } catch (e) { console.error('DB exec error:', e.message); throw e; }
    scheduleSave();
    return this;
  }

  pragma(str) {
    try { sqlDb.run(`PRAGMA ${str}`); } catch (_) {}
    return this;
  }
}

function getDb() {
  if (!dbWrapper) throw new Error('DB not initialized');
  return dbWrapper;
}

/* ── Init ───────────────────────────────────────────────── */
async function initDatabase() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    sqlDb = new SQL.Database(fs.readFileSync(DB_PATH));
  } else {
    sqlDb = new SQL.Database();
  }

  process.on('exit', saveNow);
  process.on('SIGINT',  () => { saveNow(); process.exit(0); });
  process.on('SIGTERM', () => { saveNow(); process.exit(0); });

  dbWrapper = new DbWrapper();

  // Schema
  sqlDb.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'public',
      org_name TEXT,
      org_type TEXT,
      phone TEXT,
      state TEXT,
      status TEXT NOT NULL DEFAULT 'active',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS villages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      state TEXT NOT NULL,
      district TEXT NOT NULL,
      block TEXT NOT NULL,
      gram_panchayat TEXT,
      phase INTEGER DEFAULT 1,
      score REAL DEFAULT 0,
      sc_population INTEGER DEFAULT 0,
      total_population INTEGER DEFAULT 0,
      total_households INTEGER DEFAULT 0,
      status TEXT DEFAULT 'active',
      lat REAL DEFAULT 20.5937,
      lng REAL DEFAULT 78.9629,
      vdp_status TEXT DEFAULT 'pending',
      adarsh_gram_declared INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS village_indicators (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      village_id INTEGER NOT NULL,
      indicator_name TEXT NOT NULL,
      target INTEGER DEFAULT 0,
      achieved INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS gallery_images (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      village_id INTEGER,
      uploaded_by INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      category TEXT DEFAULT 'development',
      filename TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      show_on_home INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      approved_at TEXT
    );

    CREATE TABLE IF NOT EXISTS applications (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      org_name TEXT NOT NULL,
      org_type TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      city TEXT,
      state TEXT,
      pincode TEXT,
      contact_person TEXT NOT NULL,
      contact_designation TEXT,
      areas_of_interest TEXT,
      proposed_contribution TEXT,
      student_count INTEGER DEFAULT 0,
      faculty_count INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      admin_notes TEXT,
      user_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      reviewed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS news_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      content TEXT,
      link TEXT,
      is_active INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      published_date TEXT NOT NULL DEFAULT (datetime('now')),
      created_by INTEGER
    );

    CREATE TABLE IF NOT EXISTS funds (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      state TEXT NOT NULL,
      district TEXT,
      amount_released REAL DEFAULT 0,
      amount_utilized REAL DEFAULT 0,
      financial_year TEXT,
      sanction_order TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS works (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      village_id INTEGER NOT NULL,
      work_name TEXT NOT NULL,
      category TEXT,
      status TEXT DEFAULT 'identified',
      fund_amount REAL DEFAULT 0,
      completion_date TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  seedData(dbWrapper);
  console.log('✅ Database initialized (sql.js / pure JS — no native build required)');
}

/* ── Seed ───────────────────────────────────────────────── */
function seedData(db) {
  const existing = db.prepare('SELECT COUNT(*) as count FROM users').get();
  if (existing && existing.count > 0) return;

  const hash = pwd => bcrypt.hashSync(pwd, 10);

  // Users
  db.prepare('INSERT INTO users (name,email,password,role,org_name,state,status) VALUES (?,?,?,?,?,?,?)').run('Super Admin', 'admin@adarshgram.gov.in', hash('Admin@123'), 'super_admin', 'Ministry of Social Justice', 'Delhi', 'active');
  db.prepare('INSERT INTO users (name,email,password,role,org_name,state,status) VALUES (?,?,?,?,?,?,?)').run('Maharashtra Admin', 'mh.admin@adarshgram.gov.in', hash('Admin@123'), 'state_admin', 'Maharashtra State Office', 'Maharashtra', 'active');
  db.prepare('INSERT INTO users (name,email,password,role,org_name,state,status) VALUES (?,?,?,?,?,?,?)').run('IIT Bombay', 'iitb@adarshgram.gov.in', hash('College@123'), 'college', 'IIT Bombay', 'Maharashtra', 'active');

  // Villages
  const iv = db.prepare('INSERT INTO villages (name,state,district,block,gram_panchayat,phase,score,sc_population,total_population,total_households,lat,lng,vdp_status,adarsh_gram_declared) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  const villages = [
    ['Rampur Kalan','Rajasthan','Jaipur','Amber','Rampur GP',1,82.5,450,1200,280,26.9124,75.7873,'approved',1],
    ['Sukhapur','Maharashtra','Nashik','Sinnar','Sukhapur GP',2,75.3,320,980,220,19.8762,73.7903,'approved',1],
    ['Khairpur','Uttar Pradesh','Lucknow','Malihabad','Khairpur GP',1,68.7,510,1450,340,26.8467,80.9462,'pending',0],
    ['Basantpur','Madhya Pradesh','Bhopal','Berasia','Basantpur GP',3,91.2,280,820,195,23.2599,77.4126,'approved',1],
    ['Nandpur','Gujarat','Anand','Petlad','Nandpur GP',2,79.8,190,750,175,22.5645,72.9289,'approved',1],
    ['Chandanpur','Karnataka','Mysuru','H D Kote','Chandanpur GP',1,63.4,380,1100,260,12.2958,76.6394,'pending',0],
    ['Vijayanagar','Andhra Pradesh','Kurnool','Nandyal','Vijayanagar GP',2,85.6,420,1350,310,15.4909,78.4937,'approved',1],
    ['Shivpur','Bihar','Patna','Danapur','Shivpur GP',1,55.2,640,1800,420,25.5941,85.1376,'pending',0],
    ['Laxmipur','Odisha','Bhubaneswar','Khordha','Laxmipur GP',3,88.9,350,1050,245,20.2961,85.8245,'approved',1],
    ['Amritpur','Punjab','Amritsar','Majitha','Amritpur GP',2,72.1,290,870,205,31.6340,74.8723,'approved',0],
    ['Gaonkheda','Maharashtra','Pune','Haveli','Gaonkheda GP',1,66.8,410,1240,290,18.5204,73.8567,'pending',0],
    ['Sunderpur','Assam','Kamrup','Hajo','Sunderpur GP',2,71.4,480,1380,325,26.1445,91.7362,'approved',1],
  ];
  for (const v of villages) iv.run(...v);

  // Indicators for first 5 villages
  const ii = db.prepare('INSERT INTO village_indicators (village_id,indicator_name,target,achieved) VALUES (?,?,?,?)');
  const indicators = ['Households with IHHL','Children in Primary School','Children in Middle School','Health Protection Scheme','Children Immunised','PMAY-G Housing','Electricity Connections','LPG Connections','Internet Connectivity','Skill Development Training','SHG Members'];
  for (let vid = 1; vid <= 5; vid++) {
    for (const ind of indicators) {
      const t = Math.floor(Math.random() * 200) + 100;
      const a = Math.floor(t * (0.5 + Math.random() * 0.5));
      ii.run(vid, ind, t, a);
    }
  }

  // News
  const inw = db.prepare('INSERT INTO news_items (title,content,link,is_active,is_featured,published_date,created_by) VALUES (?,?,?,1,?,?,1)');
  inw.run('New Sanction Orders Released for FY 2025-26','Ministry of Social Justice has released sanction orders for 15 states.','#',1,'2025-10-16');
  inw.run('15,915 Villages Declared Adarsh Gram','A milestone: 15,915 villages across India have been declared as Adarsh Gram.','#',1,'2025-09-20');
  inw.run('IIT Bombay Partners for Village Development','IIT Bombay signs MoU for technical expertise in Nashik district.','#',0,'2025-08-15');
  inw.run('Best District Award 2025 Announced','Jaipur district wins Best District Award for outstanding implementation.','#',0,'2025-07-10');
  inw.run('Phase 3 Village Development Plans Approved','DLCCs approved VDPs for 2,500 new villages in Phase 3.','#',0,'2025-06-25');
  inw.run('Skill Development Camp Conducted in Bihar','3,500 youth trained in vocational skills across Patna district.','#',0,'2025-05-12');

  // Funds
  const ifu = db.prepare('INSERT INTO funds (state,district,amount_released,amount_utilized,financial_year,sanction_order) VALUES (?,?,?,?,?,?)');
  ifu.run('Maharashtra','Nashik',85000000,72000000,'2025-26','SO/MH/2025/001');
  ifu.run('Rajasthan','Jaipur',92000000,81000000,'2025-26','SO/RJ/2025/001');
  ifu.run('Uttar Pradesh','Lucknow',110000000,89000000,'2025-26','SO/UP/2025/001');
  ifu.run('Gujarat','Anand',65000000,59000000,'2025-26','SO/GJ/2025/001');
  ifu.run('Karnataka','Mysuru',78000000,67000000,'2025-26','SO/KA/2025/001');

  // Applications
  const iap = db.prepare('INSERT INTO applications (org_name,org_type,email,phone,address,city,state,pincode,contact_person,contact_designation,areas_of_interest,proposed_contribution,student_count,faculty_count,status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)');
  iap.run('NIT Nagpur','University','nitnagpur@edu.in','9876543210','Nagpur Technical Campus','Nagpur','Maharashtra','440010','Dr. R. Sharma','Dean Outreach','Infrastructure, Roads, Water Supply','Structural designs and surveys for 3 villages',120,15,'pending');
  iap.run('Pune University','University','pune.univ@edu.in','9876501234','Ganeshkhind Road','Pune','Maharashtra','411007','Prof. S. Kulkarni','Head CSR','Education, Skill Development, Women Empowerment','Curriculum design and teaching support',200,25,'approved');
  iap.run('Rajasthan Technical University','University','rtu@edu.in','9812345678','Rawatbhata Road','Kota','Rajasthan','324010','Dr. M. Joshi','Registrar','Solar Energy, Water Conservation','Install solar panels in 5 villages',80,10,'pending');

  // Gallery images (metadata only - no actual files for placeholders)
  const igi = db.prepare("INSERT INTO gallery_images (village_id,uploaded_by,title,description,category,filename,status,show_on_home,created_at,approved_at) VALUES (?,?,?,?,?,?,?,?,datetime('now',?),datetime('now',?))");
  igi.run(1,3,'Road Construction Progress','New internal roads being laid in Rampur Kalan village','infrastructure','placeholder_1.jpg','approved',1,'-5 days','-4 days');
  igi.run(2,3,'Solar Panel Installation','Solar panels installed for 45 households','energy','placeholder_2.jpg','approved',1,'-10 days','-9 days');
  igi.run(4,1,'Adarsh Gram Declaration Ceremony','Official declaration of Basantpur as Adarsh Gram','ceremony','placeholder_3.jpg','approved',1,'-15 days','-14 days');
  igi.run(5,1,'School Construction Completed','New primary school building ready in Nandpur','education','placeholder_4.jpg','approved',1,'-20 days','-19 days');
  igi.run(7,1,'Water Supply Pipeline','Piped water supply reaching every household in Vijayanagar','water','placeholder_5.jpg','approved',1,'-25 days','-24 days');
  igi.run(9,1,'Women SHG Meeting','Active Self Help Group meeting with 45 women members','social','placeholder_6.jpg','approved',0,'-30 days','-29 days');

  saveNow();
  console.log('✅ Database seeded with sample data');
  console.log('   👤 Admin: admin@adarshgram.gov.in / Admin@123');
  console.log('   🏫 College: iitb@adarshgram.gov.in / College@123');
}

module.exports = { getDb, initDatabase };
