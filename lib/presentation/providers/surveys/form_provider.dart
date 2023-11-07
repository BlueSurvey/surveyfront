import 'package:dio/dio.dart';
import 'package:encuestas_app/config/constants/environment.dart';
import 'package:encuestas_app/infrastructure/mappers/mappers.dart';
import 'package:encuestas_app/survey/survey.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class FormState {
  final String id;
  final Survey? survey;
  final bool isLoading;
  final bool isSaving;
  final bool created;
  final bool isValid;
  final String message;
  final bool isPosting;
  final String openInput;
  final List<String> answers;

  FormState({
    required this.id,
    this.survey,
    this.isLoading = true,
    this.isSaving = false,
    this.isValid = false,
    this.created = false,
    this.message = '',
    this.isPosting = false,
    this.openInput = '',
    this.answers = const [],
  });

  FormState copywith({
    String? id,
    Survey? survey,
    bool? isLoading,
    bool? isSaving,
    bool? isValid,
    bool? created,
    String? message,
    bool? isPosting,
    String? openInput,
    List<String>? answers,
  }) =>
      FormState(
        id: id ?? this.id,
        survey: survey ?? this.survey,
        isLoading: isLoading ?? this.isLoading,
        isSaving: isSaving ?? this.isSaving,
        isValid: isValid ?? this.isValid,
        created: created ?? this.created,
        message: message ?? this.message,
        isPosting: isPosting ?? this.isPosting,
        openInput: openInput ?? this.openInput,
        answers: answers ?? this.answers,
      );
}

class FormNotifier extends StateNotifier<FormState> {
  FormNotifier({
    required String surveyId,
  }) : super(FormState(id: surveyId)) {
    loadFormSurvey();
  }

  Future loadFormSurvey() async {
    try {
      final response = await Dio(BaseOptions(baseUrl: Environment.apiUrl))
          .get('/form/${state.id}');
      final survey = SurveyMapper.fromJson(response.data);
      state = state.copywith(isLoading: false, survey: survey);
    } catch (error) {
      throw Exception();
    }
  }

  Future onFormSubmit(
      surveyId, openOptions, singleOptions, multipleOptions) async {
    try {
      final responses = {
        'surveyId': surveyId,
        'open': openOptions,
        'singleOption': singleOptions,
        'multipleOption': multipleOptions,
      };

      state = state.copywith(isPosting: true);
      await saveAnswers(responses);
      state = state.copywith(isPosting: false);
      return true;
    } catch (error) {
      return false;
    }
  }

  Future saveAnswers(Map<String, dynamic> responses) async {
    try {
      final response = await Dio(BaseOptions(baseUrl: Environment.apiUrl))
          .post('/form', data: {
        'responses': responses,
      });
      final answersSaved = response.data;
      return answersSaved;
    } catch (error) {
      throw Exception();
    }
  }
}

final formProvider = StateNotifierProvider.autoDispose
    .family<FormNotifier, FormState, String>((ref, surveyId) {
  return FormNotifier(surveyId: surveyId);
});
