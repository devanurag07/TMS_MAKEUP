"use client";

import { Button } from "@/components/ui/button";
import MirrorQuestion, {
  MirrorOption,
} from "@/design-system/components/forms/mirror-question";
import React, { Fragment, useState } from "react";
import { useTranslations } from "next-intl";

export interface MirrorQuestionProps {
  question: string;
  key: string;
  options: MirrorOption[];
  multiSelect?: boolean;
}

interface QuestionsComponentProps {
  questions: MirrorQuestionProps[];
  answers: { [key: string]: string[] };
  onAnswerChange: (questionKey: string, value: string[]) => void;
  onSubmit?: () => void;
}

const QuestionsComponent = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
}: QuestionsComponentProps) => {
  const t = useTranslations();
  const [currentPage, setCurrentPage] = useState(0);

  return (
    <div className="flex flex-col justify-between items-center h-full mt-20">
      {questions
        .slice(currentPage * 2, (currentPage + 1) * 2)
        .map((question) => (
          <Fragment key={question.key}>
            <MirrorQuestion
              question={question.question}
              options={question.options}
              multiSelect={question.multiSelect}
              value={answers[question.key] || []}
              answers={answers}
              onChange={(value) => onAnswerChange(question.key, value)}
            />
          </Fragment>
        ))}

      <div className="flex justify-center w-full gap-4">
        {currentPage > 0 && (
          <Button
            onClick={() => setCurrentPage(currentPage - 1)}
            className="bg-black text-5xl py-10 px-12 border-2 border-white hover:bg-gray"
          >
            {t("common.back")}
          </Button>
        )}
        {currentPage < Math.ceil(questions.length / 2) - 1 && (
          <Button
            onClick={() => setCurrentPage(currentPage + 1)}
            className="text-5xl py-10 px-12"
          >
            {t("common.next")}
          </Button>
        )}
        {Object.keys(answers).length >= questions.length && (
          <Button onClick={() => onSubmit?.()} className="text-5xl py-10 px-12">
            {t("common.proceed")}
          </Button>
        )}
      </div>
    </div>
  );
};

export default QuestionsComponent;
