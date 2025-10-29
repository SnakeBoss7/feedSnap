// utils/severity.js
const KEYWORDS = [
  'critical','vulnerability','vulnerable','buffer overflow','buffer-overflow',
  'data leak','data leakage','crash','panic','xss','cross-site','sql injection',
  'rce','privilege escalation','unauthorized','exploit'
];

function titleBase(title = '') {
  title = title.toLowerCase();
  if (title.includes('bug')) return 35;            // bugs are prioritized
  if (title.includes('complaint')) return 25;
  if (title.includes('improvement')) return 15;
  if (title.includes('feature')) return 10;
  if (title.includes('general')) return 5;
  return 10;
}

function ratingComponent(rating) {
  // rating expected 0-5 (or null). Lower rating → higher severity
  if (rating == null) return 10;
  // invert: 5->0, 4->5, 3->10, 2->20, 1->30, 0->40
  return Math.max(0, (5 - rating) * 8);
}

function keywordBoost(desc = '') {
  const d = desc.toLowerCase();
  let boost = 0;
  for (const kw of KEYWORDS) {
    if (d.includes(kw)) boost += (kw.includes('critical') || kw.includes('vulnerability')) ? 20 : 10;
  }
  return Math.min(boost, 50); // cap
}

function lengthBoost(desc = '') {
  const words = desc.trim().split(/\s+/).filter(Boolean).length;
  if (words > 200) return 10;
  if (words > 100) return 7;
  if (words > 40) return 4;
  return 0;
}

function presenceBoost(feedback) {
  let b = 0;
  if (feedback.email) b += 3;
  if (feedback.status === false || feedback.status === 'open') b += 5;
  return b;
}

function computeSeverity(feedback = {}) {
  // feedback: { title, rating, description, email, status }
  const base = titleBase(feedback.title);
  const rating = ratingComponent(feedback.rating);
  const keywords = keywordBoost(feedback.description || '');
  const len = lengthBoost(feedback.description || '');
  const pres = presenceBoost(feedback);

  let raw = base + rating + keywords + len + pres; // raw approx 0-120
  raw = Math.max(0, Math.min(raw, 100)); // clamp 0-100

  // map to 1-10
  const severity = Math.ceil(raw / 10);
  // console.log({severity});
  return Math.max(1, Math.min(severity, 10));
};
module.exports = {computeSeverity};
// let num = computeSeverity({"title":"complaint","status":"true","rating":5,"description":"There is a that causes a crash. adn There is a that causes a crash. adn i can probably say that its thatThere is a that causes a crash. adn i can probably say that its thatThere is a that causes a crash. adn i can probably say that its that i can probably say that its that","email":"rahuldharwal12005@gamil.com"})