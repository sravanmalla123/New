const express = require('express');
const { getDb } = require('../database');

const router = express.Router();

// GET /api/stats - aggregate stats for homepage
router.get('/', (req, res) => {
  const db = getDb();

  const villages = db.prepare('SELECT COUNT(*) as total, COUNT(DISTINCT state) as states, COUNT(DISTINCT district) as districts FROM villages').get();
  const adarshGram = db.prepare("SELECT COUNT(*) as count FROM villages WHERE adarsh_gram_declared = 1").get();
  const vdpApproved = db.prepare("SELECT COUNT(*) as count FROM villages WHERE vdp_status = 'approved'").get();

  const households = db.prepare('SELECT SUM(total_households) as total, SUM(sc_population) as sc_pop, SUM(total_population) as total_pop FROM villages').get();
  const funds = db.prepare('SELECT SUM(amount_released) as released, SUM(amount_utilized) as utilized FROM funds').get();

  const images = db.prepare("SELECT COUNT(*) as count FROM gallery_images WHERE status = 'approved'").get();
  const applications = db.prepare("SELECT COUNT(*) as total, SUM(CASE WHEN status='approved' THEN 1 ELSE 0 END) as approved, SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) as pending FROM applications").get();
  const works = db.prepare("SELECT COUNT(*) as identified, SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) as completed FROM works").get();

  res.json({
    villages: {
      total: villages.total || 0,
      states: villages.states || 26,
      districts: villages.districts || 597,
    },
    adarsh_gram_declared: adarshGram.count || 0,
    vdp_approved: vdpApproved.count || 0,
    population: {
      total: households.total_pop || 73816529,
      sc: households.sc_pop || 40399700,
      households: households.total || 8394553,
    },
    funds: {
      released: funds.released || 117787469,
      utilized: funds.utilized || 99020643,
    },
    gallery_images: images.count || 0,
    applications: {
      total: applications.total || 0,
      approved: applications.approved || 0,
      pending: applications.pending || 0,
    },
    works: {
      identified: works.identified || 309248,
      completed: works.completed || 46245,
    }
  });
});

// GET /api/stats/top-states - top performing states
router.get('/top-states', (req, res) => {
  const db = getDb();
  const states = db.prepare(`
    SELECT state,
           COUNT(*) as village_count,
           AVG(score) as avg_score,
           SUM(CASE WHEN adarsh_gram_declared = 1 THEN 1 ELSE 0 END) as adarsh_declared
    FROM villages
    GROUP BY state
    ORDER BY avg_score DESC
    LIMIT 10
  `).all();
  res.json(states);
});

// GET /api/stats/news - latest news items
router.get('/news', (req, res) => {
  const db = getDb();
  const news = db.prepare('SELECT * FROM news_items WHERE is_active = 1 ORDER BY published_date DESC LIMIT 10').all();
  res.json(news);
});

module.exports = router;
