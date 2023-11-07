import 'package:flutter/material.dart';

class CustomTextEditingController extends TextEditingController {
  final int? count;

  CustomTextEditingController({String? text, this.count = 0})
      : super(text: text);
}
