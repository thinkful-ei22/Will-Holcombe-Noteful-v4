'use strict';

const express = require('express');
const mongoose = require('mongoose');

const Note = require('../models/note');
const Folder = require('../models/folder');
const Tag = require('../models/tag');
const passport =  require('passport');

function validateFolderId(folderId, userId) {
  if (folderId === undefined) {
    // console.log('HELLO');
    return Promise.resolve();
  }
  if (!mongoose.Types.ObjectId.isValid(folderId)) {
    
    
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    //console.log('ERROR FOLDER BLOCK', err);
    return Promise.reject(err);
  }
  return Folder.count({ _id: folderId, userId })
    .then(count => {
      
      
      if (count === 0) {
        const err = new Error('The `folderId` is not valid');
        err.status = 400;
        
        return Promise.reject(err);
      }
    });
}

function validateTagIds(tags, userId) {
  if (tags === undefined) {
    return Promise.resolve();
  }
  if (!Array.isArray(tags)) {
    const err = new Error('The `tags` must be an array');
    err.status = 400;
    return Promise.reject(err);
  }
  //how to verify if tag exists 
  return Tag.find({ $and: [{ _id: { $in: tags }, userId }] })
    .then(results => {
      if(results ===undefined||tags.length !== results.length) {
        const err = new Error('The `tags` array contains an invalid id');
        err.status = 400;
        //console.log('ERROR TAGS', err);
        return Promise.reject(err);
      }
      // return Promise.resolve();
      
    });
    
}


const router = express.Router();
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));
/* ========== GET/READ ALL ITEMS ========== */




router.get('/', (req, res, next) => {
  //const { id } = req.params;
  const userId = req.user.id;

  const { searchTerm, folderId, tagId} = req.query;

  let filter = { userId };//not _id: userId etc.
  
  if (searchTerm) {
    const re = new RegExp(searchTerm, 'i');
    filter.$or = [{ 'title': re }, { 'content': re }];
  }

  if (folderId) {
    filter.folderId = folderId;
  }

  if (tagId) {
    // filter.tags = tags;
    filter.tags = tagId;
  }

  Note.find(filter)
    .populate('tags')
    .sort({ updatedAt: 'desc' })
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findOne({ _id: id, userId })
    .populate('tags')
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  //tags default to empty if no value passed in
  const { title, content, tags=[] } = req.body;
  const userId = req.user.id;
  const folderId = req.body.folderId ? req.body.folderId : undefined;
  const newNote = { title, content, folderId, tags, userId };
  // For folders, verify the folderId is a valid ObjectId and the item belongs to 
  // the current user. If the validation fails, then return an 
  // error message 'The folderId is not valid' with status 400.

  
  /***** Never trust users - validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }
  if (mongoose.Types.ObjectId.isValid(folderId)) {
    newNote.folderId = folderId;
  }
  //if (mongoose.Types.ObjectId.isValid(tagsId)) {
  //newNote.tagsId = tagsId;
  tags.forEach( tag => { if(!mongoose.Types.ObjectId.isValid(tag.id)){
    const err = new Error('Invalid tag ID');
    err.status = 400;
    return next(err);
  }
  });
  

  Promise.all([
    validateFolderId(folderId, userId),
    validateTagIds(tags, userId)
  ])

  //if all on one line then dont need return statment
    .then(()=> Note.create(newNote))
    .then(result => {
      //console.log(res.title);
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => {
      //console.log('CATCH BLOCK ERROR', err);
      next(err);
    });
    
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const { id } = req.params;
  const { title, content, folderId, tags = [] } = req.body;
  const userId = req.user.id;
  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if (title === '') {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if (folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  if (tags) {
    const badIds = tags.filter((tag) => !mongoose.Types.ObjectId.isValid(tag));
    if (badIds.length) {
      const err = new Error('The tags `id` is not valid');
      err.status = 400;
      return next(err);
    }
  }

  const updateNote = { title, content, folderId, tags };

  Note.findByIdAndUpdate({ _id: id, userId }, updateNote, { new: true })
    .then(result => {
      if (result) {
        res.json(result);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const { id } = req.params;
  const userId = req.user.id;
  /***** Never trust users - validate input *****/
  if (!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  Note.findByIdAndRemove({ _id: id, userId })
    .then(() => {
      res.sendStatus(204);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;