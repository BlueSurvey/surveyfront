import 'dart:io';
import 'package:encuestas_app/presentation/providers/providers.dart';
import "package:encuestas_app/presentation/widgets/widgets.dart";
import 'package:encuestas_app/question/question.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:open_file/open_file.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:path_provider/path_provider.dart';

class ResultsScreen extends ConsumerWidget {
  final String surveyId;
  const ResultsScreen({super.key, required this.surveyId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final resultState = ref.watch(surveyProvider(surveyId));
    ref.watch(surveyProvider(surveyId).notifier).loadSurvey();

    return Scaffold(
      backgroundColor: const Color(0xFFf0f4fc),
      appBar: AppBar(
        backgroundColor: const Color(0xFFf0f4fc),
      ),
      body: resultState.isLoading
          ? const FullScreenLoader()
          : ResultsView(questions: resultState.survey!.questions),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF5D89BF),
        onPressed: () async {
          await makeAndSavePdf(resultState.survey!.questions, resultState.survey!.title);
        },
        child: const Icon(Icons.download, color: Colors.white,),
      ),
    );
  }

  Future<void> makeAndSavePdf(List<Question> questions, String title) async {
    final pdfWidgets = await makePdf(questions, title);
    final pdf = pw.Document();
    pdf.addPage(pw.MultiPage(build: (pw.Context context) {
      return pdfWidgets;
    }));

    final file = await saveDocument('encuesta_reporte.pdf', pdf);
    openFile(file);
  }

  Future<List<pw.Widget>> makePdf(List<Question> questions, String title) async {
    final List<pw.Widget> pdfWidgets = [];

    pdfWidgets.add(pw.Text(title, style: pw.TextStyle(fontSize: 24, fontWeight: pw.FontWeight.bold)));
    pdfWidgets.add(pw.SizedBox(height: 2 * PdfPageFormat.cm));

    for (final question in questions) {
      if (question.typeQuestion == 'open') {
        pdfWidgets.add(openQuestionWidgetToPdf(question));
      } else if (question.typeQuestion == 'singleOption' ||
          question.typeQuestion == 'multipleOption') {
        pdfWidgets.add(singleOptionQuestionWidgetToPdf(question));
      }
    }
    return pdfWidgets;
  }

  pw.Widget openQuestionWidgetToPdf(Question question) {
    final headers = ['Respuestas', 'Cantidad'];

    final dataQuestion = question.answers
        .map((answer) => [answer.answer, answer.count])
        .toList();

    return pw.Column(children: [
      pw.Text(question.question),
      pw.SizedBox(height: 5),
      pw.TableHelper.fromTextArray(
        tableWidth: pw.TableWidth.max,
        headers: headers,
        data: dataQuestion,
        border: pw.TableBorder.all(width: 0.1, color: PdfColors.grey300),
        headerStyle: pw.TextStyle(fontWeight: pw.FontWeight.bold,),
        headerDecoration: const pw.BoxDecoration(
          color: PdfColors.grey300,
        ),
        cellAlignment: pw.Alignment.center
      ),
      pw.SizedBox(height: 50),
    ]);
  }

  pw.Widget singleOptionQuestionWidgetToPdf(Question question) {
    final answers =
        question.answers.map((answer) => [answer.answer, answer.count]);

    List<List<dynamic>> dataTable = answers
        .map((tuple) => [tuple[0], tuple[1]]) 
        .toList();

    final maxCount =
        dataTable.fold<int>(0, (max, row) => row[1] > max ? row[1] : max);

    final List<num> yAxisList = [];
    for (int i = 0; i <= maxCount + 2; i++) {
      yAxisList.add(i);
    }

    return pw.Column(children: [
      pw.Container(
        width: maxCount*150,
          child: pw.Chart(
            title: pw.Text(question.question),
            grid: pw.CartesianGrid(
              xAxis: pw.FixedAxis.fromStrings(
                List<String>.generate(
                    dataTable.length, (index) => dataTable[index][0] as String),
                marginStart: 30,
                marginEnd: 30,
                color: PdfColors.grey300
              ),
              yAxis: pw.FixedAxis(
                divisionsColor:PdfColors.grey300,
                yAxisList,
                divisions: true,
                color: PdfColors.grey300
              ),
            ),
            datasets: [
              pw.BarDataSet(
                width: maxCount*10,
                color: PdfColors.blue100,
                data: List<pw.PointChartValue>.generate(
                  dataTable.length,
                  (i) {
                    final v = dataTable[i][1] as num;
                    return pw.PointChartValue(i.toDouble(), v.toDouble());
                  },
                ),
              ),
            ],
          )),
      pw.SizedBox(height: 50),
    ]);
  }

  Future saveDocument(String name, pw.Document pdf) async {
    final bytes = await pdf.save();
    final dir = await getApplicationDocumentsDirectory();
    final file = File('${dir.path}/$name');

    await file.writeAsBytes(bytes);
    return file;
  }

  Future openFile(file) async {
    final downloadsDirectory = await getExternalStorageDirectory();

    if (downloadsDirectory != null) {
      final newPath = '${downloadsDirectory.path}/Resultados.pdf';

      await file.copy(newPath);

      await OpenFile.open(newPath);
    }
  }
}
class ResultsView extends StatelessWidget {
  final List<Question>? questions;

  const ResultsView({super.key, this.questions});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            "Resultados",
            style: TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 28,
              color: Color(0xFF303030),
            ),
          ),
          const SizedBox(
            height: 20,
          ),
          Expanded(
            child: questions!.isEmpty
                ? const Center(
                    child: Text(
                    'No hay preguntas',
                    style: TextStyle(color: Color(0xFF6B6B6B)),
                  ))
                : ListView.builder(
                    itemCount: questions?.length ?? 0,
                    itemBuilder: (context, index) {
                      final question = questions![index];
                      switch (question.typeQuestion) {
                        case 'open':
                          return OpenQuestionWidget(question: question);
                        case 'singleOption':
                        case 'multipleOption':
                          return SingleOptionQuestionWidget(
                            question: question,
                          );
                        default:
                          return const SizedBox();
                      }
                    },
                  ),
          ),
        ],
      ),
    );
  }
}

class OpenQuestionWidget extends StatelessWidget {
  final Question? question;
  const OpenQuestionWidget({super.key, required this.question});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        Text(question!.question,
            style: const TextStyle(
                fontSize: 16,
                color: Color(0xFF7F8691),
                fontWeight: FontWeight.w500)),
        const SizedBox(
          height: 20,
        ),
        DataTable(
          headingRowColor: MaterialStateProperty.all( const Color(0xFF2561A9)),
          border: null,
          columns: const [
            DataColumn(
                label: Text(
              'Respuestas',
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
            )),
            DataColumn(
                label: Text(
              'Cantidad',
              style:
                  TextStyle(color: Colors.white, fontWeight: FontWeight.w500),
            )),
          ],
          rows: question!.answers
              .map((answer) => DataRow(
                    cells: [
                      DataCell(Text(
                        answer.answer,
                        style: const TextStyle(color: Color(0xFF7F8691)),
                      )),
                      DataCell(Text(answer.count.toString(),
                          style: const TextStyle(color: Color(0xFF7F8691)))),
                    ],
                  ))
              .toList(),
        ),
        const SizedBox(
          height: 50,
        )
      ],
    );
  }
}

class SingleOptionQuestionWidget extends StatelessWidget {
  final Question? question;
  const SingleOptionQuestionWidget({super.key, this.question});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text(question!.question,
            style: const TextStyle(
                fontSize: 16,
                color: Color(0xFF7F8691),
                fontWeight: FontWeight.w500)),
        const SizedBox(
          height: 20,
        ),
        BarChartResult(answers: question!.answers),
        const SizedBox(
          height: 50,
        )
      ],
    );
  }
}
