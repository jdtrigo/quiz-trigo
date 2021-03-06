var models = require('../models/models.js');

// Autoload - factoriza el código si la ruta incluye :quizId
exports.load = function (req, res, next, quizId) {
  models.Quiz.find(
    {
      where : { id: Number(quizId) },
      include: [{ model: models.Comment }]
    }).then(function(quiz) {
      if (quiz) {
        req.quiz = quiz;
        next();
      } else {
        next(new Error('No existe quizId=' + quizId));
      }
    }).catch(function(error) { next(error); });
};


// GET quizes
exports.index = function (req, res) {

  if(req.query.search===undefined) {
    models.Quiz.findAll().then(
      function(quizes) {
        res.render('quizes/index.ejs', {quizes: quizes, errors: []});
      }
    ).catch(function(error) { next(error); });
  } else {
    var inputModificado = '%'+req.query.search.split(" ").join("%")+'%'; // también con una RegExp req.query.search.replace(/\s/g, "%") o con req.query.search.replace(" ", "%")
    models.Quiz.findAll({ where: ["lower(pregunta) like lower(?)", inputModificado],
                          order: 'pregunta ASC'}).then(
      function(quizes) {
        res.render('quizes/index.ejs', {quizes: quizes, errors: []});
      }
    ).catch(function(error) { next(error); });
  }
};

// GET quizes/question
exports.show = function (req, res) {
  res.render('quizes/show.ejs', {quiz: req.quiz, errors: []});
};


// GET quizes/:id/answer
exports.answer = function (req, res) {
  var resultado = 'Incorrecto';
  if (req.query.respuesta === req.quiz.respuesta) {
    resultado = 'Correcto';
  }
  res.render('quizes/answer', {quiz:req.quiz, respuesta: resultado, errors: []});
};

// GET quizes/:id/edit
exports.edit = function (req, res) {
  var quiz = req.quiz; // autoload de instancia de quiz
  res.render('quizes/edit', {quiz:quiz, errors: []});
};


// GET quizes/new
exports.new = function (req, res) {
  var quiz = models.Quiz.build (
      {pregunta: "Pregunta", respuesta: "Respuesta", tema: "Otro"}
  );

  res.render('quizes/new', {quiz: quiz, errors: []});
};


// POST quizes/create
exports.create = function (req, res) {
  var quiz = models.Quiz.build(req.body.quiz);

  quiz
  .validate()
  .then(function(err) {
    if (err) {
      res.render('quizes/new', {quiz: quiz, errors: err.errors});
    } else {
      quiz
      .save({fields: ["pregunta", "respuesta", "tema"]})
      .then(function(){
        res.redirect('/quizes');
      });
    }
  });
};


// PUT quizes/update
exports.update = function (req, res) {
  req.quiz.pregunta = req.body.quiz.pregunta;
  req.quiz.respuesta = req.body.quiz.respuesta;
  req.quiz.tema = req.body.quiz.tema;

  req.quiz
  .validate()
  .then(function(err) {
    if (err) {
      res.render('quizes/edit', {quiz: req.quiz, errors: err.errors});
    } else {
      req.quiz
      .save({fields: ["pregunta", "respuesta", "tema"]})
      .then(function(){
        res.redirect('/quizes');
      });
    }
  });
};


// DELETE quizes/delete
exports.destroy = function (req, res) {
  // borramos de la base de datos y mostarmos quizes
  req.quiz
  .destroy()
  .then(function(err) {
    res.redirect('/quizes');
  }).catch(function(error){next(error)});
};
