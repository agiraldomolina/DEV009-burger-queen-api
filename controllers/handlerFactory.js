/*eslint-disable*/
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const APIFeatures = require('../utils/apiFeatures');

exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const newDoc = await Model.create(req.body);
    res.json(newDoc);
  });

  exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    const identifier = req.params.id;
    let filter
    identifier.includes('@')? filter = { email: identifier } : filter = { _id: identifier };
    let query = Model.findOne(filter);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.json(doc);
  });

  exports.getAll = (Model) =>  catchAsync(async (req, res,next) =>{
    let filter = {};
    if(req.params.userId) filter = { user: req.params.userId };
    //const docs = await Product.find();
    const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const docs = await features.query;
    //Send TO THE CLIENT
    res.json(docs);
});


exports.deleteOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });

  exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const identifier = req.params.id;
    let filter
    identifier.includes('@')? filter = { email: identifier } : filter = { _id: identifier };
    const doc = await Model.findOneAndUpdate(filter, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }
    await doc.save();
    res.json(doc);
  });