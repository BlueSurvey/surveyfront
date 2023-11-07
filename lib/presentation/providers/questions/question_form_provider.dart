import 'package:encuestas_app/answer/answer.dart';
import 'package:encuestas_app/answer/custom_text_controller.dart';
import 'package:encuestas_app/infrastructure/inputs/inputs.dart';
import 'package:encuestas_app/presentation/providers/providers.dart';
import 'package:encuestas_app/question/question.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:formz/formz.dart';
import 'package:flutter/scheduler.dart';

class QuestionFormState {
  final bool isValid;
  final bool isPosting;
  final bool isFormPosted;
  final QuestionInput questionInput;
  final List<Answer> answers;
  final List<FocusNode> answerFocusNodes;
  final List<CustomTextEditingController> controllers;

  QuestionFormState({
    this.isValid = false,
    this.isPosting = false,
    this.isFormPosted = false,
    this.questionInput = const QuestionInput.pure(),
    this.answers = const [],
    this.answerFocusNodes = const [],
    this.controllers = const [],
  });

  QuestionFormState copyWith({
    bool? isValid,
    bool? isPosting,
    bool? isFormPosted,
    QuestionInput? questionInput,
    List<Answer>? answers,
    List<FocusNode>? answerFocusNodes,
    List<CustomTextEditingController>? controllers,
  }) =>
      QuestionFormState(
        isValid: isValid ?? this.isValid,
        isPosting: isPosting ?? this.isPosting,
        isFormPosted: isFormPosted ?? this.isFormPosted,
        questionInput: questionInput ?? this.questionInput,
        answers: answers ?? this.answers,
        answerFocusNodes: answerFocusNodes ?? this.answerFocusNodes,
        controllers: controllers ?? this.controllers,
      );
}

class QuestionFormNotifier extends StateNotifier<QuestionFormState> {
  final Question? question;
  final QuestionNotifier? questionData;

  QuestionFormNotifier({
    this.question,
    this.questionData,
  }) : super(QuestionFormState(
          questionInput: QuestionInput.dirty(question!.question),
          answers: question.answers,
        )) {
    for (int i = 0; i < question!.answers.length; i++) {
      final newFocusNodes = FocusNode();
      final updateFocusNodes = List<FocusNode>.from(state.answerFocusNodes)
        ..add(newFocusNodes);
      state = state.copyWith(answerFocusNodes: updateFocusNodes);

      final newTextController = CustomTextEditingController(text: question!.answers[i].answer, count: question!.answers[i].count);

      final updatedControllers =
          List<CustomTextEditingController>.from(state.controllers)
            ..add(newTextController);
      state = state.copyWith(controllers: updatedControllers);
    }
  }

  onQuestionChanged(String value) {
    final newQuestion = QuestionInput.dirty(value);
    state = state.copyWith(
        questionInput: newQuestion, isValid: Formz.validate([newQuestion]));
  }

  addAnswer(context) {
    final newAnswer = Answer(answer: '');
    final updatedAnswers = List<Answer>.from(state.answers)..add(newAnswer);
    final newFocus = FocusNode();
    final answerFocusNodes = List<FocusNode>.from(state.answerFocusNodes)
      ..add(newFocus);
    final newController = CustomTextEditingController(text: newAnswer.answer);
    final updatedControllers =
        List<CustomTextEditingController>.from(state.controllers)..add(newController);
    state = state.copyWith(
        answers: updatedAnswers,
        answerFocusNodes: answerFocusNodes,
        controllers: updatedControllers);
    SchedulerBinding.instance.addPostFrameCallback((_) {
      FocusScope.of(context).requestFocus(newFocus);
    });
  }

  void deleteAnswer(int index) {
    final answerFocusNodes = List<FocusNode>.from(state.answerFocusNodes);
    final updatedAnswers = List<Answer>.from(state.answers);
    final controllers = List<CustomTextEditingController>.from(state.controllers);
    controllers.removeAt(index);
    answerFocusNodes.removeAt(index);
    updatedAnswers.removeAt(index);
    state = state.copyWith(
        answers: updatedAnswers,
        answerFocusNodes: answerFocusNodes,
        controllers: controllers); 
  }

  onFormSubmit(String surveyId) {

    final List<Answer> answers = [];

    for (var controller in state.controllers) {
      String textOfController = controller.text;
      int? countOfController = controller.count;
      final answer = Answer(answer: textOfController, count: countOfController);
      answers.add(answer);

    }
      touchField();
    if (!state.isValid) return false;

    final questionLike = {
      'id': question?.id,
      'surveyId': surveyId,
      'question': state.questionInput.value,
      'typeQuestion': question?.typeQuestion,
      'answers': answers
          .where((answer) => answer.answer.trim() != "")
          .map((answer) => {'answer': answer.answer, 'count':answer.count})
          .toList(),
    };
    questionData!.addQuestionData(questionLike);
  }

  touchField() {
    final question = QuestionInput.dirty(state.questionInput.value);
    state = state.copyWith(
        isFormPosted: true,
        questionInput: question,
        isValid: Formz.validate([question]));
  }
}

final questionFormProvider = StateNotifierProvider.autoDispose
    .family<QuestionFormNotifier, QuestionFormState, Question>((ref, question) {
  final questionPro = ref.read(questionProvider.notifier);

  return QuestionFormNotifier(
    question: question,
    questionData: questionPro,
  );
});

final textEditingControllerProvider =
    Provider.autoDispose<CustomTextEditingController>((ref) {
  return CustomTextEditingController();
});
