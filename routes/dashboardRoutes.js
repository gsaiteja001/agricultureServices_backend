// // routes/dashboardRoutes.js
// const express = require('express');
// const router = express.Router();
// const sequelize = require('../config/database');
// const models = require('../models/index'); 

// // Helper function to get primary key field for a model
// const getPrimaryKeyField = (model) => Object.keys(model.primaryKeys)[0];

// // GET: Fetch all rows from a table
// router.get('/:table', async (req, res) => {
//   const { table } = req.params;
//   const model = models[table];
//   if (!model) return res.status(400).json({ error: 'Invalid table name' });

//   try {
//     const data = await model.findAll();
//     res.json(data);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // GET: Fetch table structure (column names)
// router.get('/structure/:table', async (req, res) => {
//   const { table } = req.params;
//   const model = models[table];
//   if (!model) return res.status(400).json({ error: 'Invalid table name' });

//   try {
//     const columns = Object.keys(model.rawAttributes);
//     res.json({ columns });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // GET: Fetch foreign key options for a table
// router.get('/foreignKeys/:table', async (req, res) => {
//   const { table } = req.params;
//   const model = models[table];
//   if (!model) return res.status(400).json({ error: 'Invalid table name' });

//   try {
//     const foreignKeys = {};
//     const associations = model.associations;

//     for (const key in associations) {
//       const association = associations[key];
//       const foreignKey = association.foreignKey;
//       const targetModel = association.target;
//       const data = await targetModel.findAll({
//         attributes: [
//           [getPrimaryKeyField(targetModel), 'id'],
//           sequelize.literal(`CONCAT_WS(' - ', ${Object.keys(targetModel.rawAttributes).join(', ')}) AS displayValue`),
//         ],
//       });
//       foreignKeys[foreignKey] = data;
//     }
//     res.json(foreignKeys);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // POST: Add a new row to a table
// router.post('/:table', async (req, res) => {
//   const { table } = req.params;
//   const model = models[table];
//   if (!model) return res.status(400).json({ error: 'Invalid table name' });

//   try {
//     const newRow = await model.create(req.body);
//     res.status(201).json(newRow);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // PUT: Update a row in a table
// router.put('/:table/:id', async (req, res) => {
//   const { table, id } = req.params;
//   const model = models[table];
//   if (!model) return res.status(400).json({ error: 'Invalid table name' });

//   try {
//     const primaryKeyField = getPrimaryKeyField(model);
//     const [updated] = await model.update(req.body, { where: { [primaryKeyField]: id } });
//     if (updated) {
//       const updatedRow = await model.findOne({ where: { [primaryKeyField]: id } });
//       res.json(updatedRow);
//     } else {
//       res.status(404).json({ error: 'Row not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // DELETE: Delete a row from a table
// router.delete('/:table/:id', async (req, res) => {
//   const { table, id } = req.params;
//   const model = models[table];
//   if (!model) return res.status(400).json({ error: 'Invalid table name' });

//   try {
//     const primaryKeyField = getPrimaryKeyField(model);
//     const deleted = await model.destroy({ where: { [primaryKeyField]: id } });
//     if (deleted) {
//       res.json({ message: 'Row deleted' });
//     } else {
//       res.status(404).json({ error: 'Row not found' });
//     }
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// module.exports = router;
