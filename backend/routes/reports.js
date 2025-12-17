const express = require('express');
const router = express.Router();

router.get('/weekly', (req, res) => {
  res.json({
    period: 'Semana 45 - 2023',
    totalChecklists: 15,
    completed: 12,
    pending: 3,
    completionRate: 80
  });
});

router.get('/monthly', (req, res) => {
  res.json({
    period: 'Noviembre 2023',
    totalChecklists: 60,
    completed: 48,
    pending: 12,
    completionRate: 80
  });
});

router.get('/annual', (req, res) => {
  res.json({
    period: '2023',
    totalChecklists: 720,
    completed: 650,
    pending: 70,
    completionRate: 90.3
  });
});

module.exports = router;