'use strict';

const express = require('express');
const passport =  require('passport');


const {
  getNotesHandler,
  getNoteByIdHandler,
  deleteNoteHandler,
  createNoteHandler,
  updateNoteHandler
}
  
  = require('../handlers/note-handlers');

const router = express.Router();
router.use('/', passport.authenticate('jwt', 
  { session: false, failWithError: true }));

router.route('/')
  .get(getNotesHandler)
  .post(createNoteHandler);



router.route('/:id')
.get(getNoteByIdHandler)
.put(updateNoteHandler)
.delete(deleteNoteHandler);

module.exports = router;