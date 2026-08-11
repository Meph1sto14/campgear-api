const mongoose = require('mongoose');

/**
 * Menambahkan field wajib (createdBy, updatedBy, archived)
 * dan timestamps otomatis (createdAt, updatedAt) ke sebuah schema.
 */
function applyCommonFields(schema) {
  schema.add({
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    archived: { type: Boolean, default: false },
  });
  schema.set('timestamps', true); // otomatis isi createdAt & updatedAt
}

module.exports = applyCommonFields;