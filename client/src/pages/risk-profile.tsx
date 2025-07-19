import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const riskQuestions = [
  {
    id: "q1",
    question: "What is your investment time horizon?",
    options: [
      { value: "1-2 years", score: 1, label: "1-2 years" },
      { value: "3-5 years", score: 2, label: "3-5 years" },
      { value: "6-10 years", score: 3, label: "6-10 years" },
      { value: "10+ years", score: 4, label: "More than 10 years" },
    ],
  },
  {
    id: "q2",
    question: "How would you react to a 20% portfolio decline?",
    options: [
      { value: "sell-all", score: 1, label: "Sell all investments immediately" },
      { value: "sell-some", score: 2, label: "Sell some investments" },
      { value: "hold", score: 3, label: "Hold and wait for recovery" },
      { value: "buy-more", score: 4, label: "Buy more at lower prices" },
    ],
  },
  {
    id: "q3",
    question: "What percentage of your total wealth is this investment?",
    options: [
      { value: "75-100%", score: 1, label: "75-100%" },
      { value: "50-75%", score: 2, label: "50-75%" },
      { value: "25-50%", score: 3, label: "25-50%" },
      { value: "0-25%", score: 4, label: "Less than 25%" },
    ],
  },
  {
    id: "q4",
    question: "What is your primary investment goal?",
    options: [
      { value: "preservation", score: 1, label: "Capital preservation" },
      { value: "income", score: 2, label: "Regular income" },
      { value: "balanced", score: 3, label: "Balanced growth" },
      { value: "aggressive-growth", score: 4, label: "Aggressive growth" },
    ],
  },
];

export default function RiskProfile() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showResults, setShowResults] = useState(false);

  const handleAnswer = (questionId: string, score: number) => {
    setAnswers({ ...answers, [questionId]: score });
  };

  const nextQuestion = () => {
    if (currentQuestion < riskQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const calculateRiskProfile = () => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxScore = riskQuestions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    if (percentage <= 25) return { type: "Conservative", color: "text-green-600", description: "Focus on capital preservation with lower volatility" };
    if (percentage <= 60) return { type: "Moderate", color: "text-amber-600", description: "Balanced approach with moderate risk for steady growth" };
    if (percentage <= 80) return { type: "Moderate Aggressive", color: "text-orange-600", description: "Higher growth potential with increased volatility" };
    return { type: "Aggressive", color: "text-red-600", description: "Maximum growth potential with high risk tolerance" };
  };

  const restartAssessment = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  if (showResults) {
    const profile = calculateRiskProfile();
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0);
    const maxScore = riskQuestions.length * 4;
    const percentage = (totalScore / maxScore) * 100;

    return (
      <div>
        <header className="bg-white border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Risk Profile Results</h2>
              <p className="text-slate-600">Your personalized investment risk assessment</p>
            </div>
          </div>
        </header>

        <div className="p-6 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Your Risk Profile</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <div className="w-32 h-32 mx-auto rounded-full bg-slate-100 flex items-center justify-center">
                <span className={`text-3xl font-bold ${profile.color}`}>
                  {Math.round(percentage)}%
                </span>
              </div>
              
              <div>
                <h3 className={`text-2xl font-bold ${profile.color}`}>{profile.type}</h3>
                <p className="text-slate-600 mt-2">{profile.description}</p>
              </div>

              <Progress value={percentage} className="w-full" />

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900">Recommended Allocation</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    {profile.type === "Conservative" && (
                      <>
                        <div>Stocks: 30-40%</div>
                        <div>Bonds/Gold: 50-60%</div>
                        <div>Cash: 10-20%</div>
                      </>
                    )}
                    {profile.type === "Moderate" && (
                      <>
                        <div>Stocks: 60-70%</div>
                        <div>Bonds/Gold: 25-30%</div>
                        <div>Cash: 5-10%</div>
                      </>
                    )}
                    {(profile.type === "Moderate Aggressive" || profile.type === "Aggressive") && (
                      <>
                        <div>Stocks: 80-90%</div>
                        <div>Bonds/Gold: 10-15%</div>
                        <div>Cash: 0-5%</div>
                      </>
                    )}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-lg">
                  <h4 className="font-semibold text-slate-900">Key Characteristics</h4>
                  <div className="mt-2 space-y-1 text-sm">
                    {profile.type === "Conservative" && (
                      <>
                        <div>• Low volatility</div>
                        <div>• Capital preservation</div>
                        <div>• Steady returns</div>
                      </>
                    )}
                    {profile.type === "Moderate" && (
                      <>
                        <div>• Balanced approach</div>
                        <div>• Moderate growth</div>
                        <div>• Managed risk</div>
                      </>
                    )}
                    {(profile.type === "Moderate Aggressive" || profile.type === "Aggressive") && (
                      <>
                        <div>• High growth potential</div>
                        <div>• Higher volatility</div>
                        <div>• Long-term focus</div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-4">
                <Button onClick={restartAssessment} variant="outline" className="flex-1">
                  Retake Assessment
                </Button>
                <Button className="flex-1">
                  Create Portfolio
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const progress = ((currentQuestion + 1) / riskQuestions.length) * 100;
  const question = riskQuestions[currentQuestion];
  const currentAnswer = answers[question.id];

  return (
    <div>
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Risk Profile Assessment</h2>
            <p className="text-slate-600">Answer a few questions to determine your risk tolerance</p>
          </div>
        </div>
      </header>

      <div className="p-6 max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center mb-4">
              <span className="text-sm text-slate-500">
                Question {currentQuestion + 1} of {riskQuestions.length}
              </span>
              <span className="text-sm font-medium text-slate-900">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-900">
              {question.question}
            </h3>

            <RadioGroup
              value={currentAnswer?.toString()}
              onValueChange={(value) => {
                const option = question.options.find(opt => opt.score.toString() === value);
                if (option) {
                  handleAnswer(question.id, option.score);
                }
              }}
              className="space-y-3"
            >
              {question.options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2 p-3 border border-slate-200 rounded-lg hover:bg-slate-50">
                  <RadioGroupItem value={option.score.toString()} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!currentAnswer}
              >
                {currentQuestion === riskQuestions.length - 1 ? "View Results" : "Next"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
