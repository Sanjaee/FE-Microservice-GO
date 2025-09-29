import React from "react";
import { Check, Clock } from "lucide-react";

interface Step {
  id: string;
  title: string;
  completed: boolean;
  current: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
}

export default function ProgressIndicator({ steps }: ProgressIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step.completed
                    ? "bg-green-500 text-white"
                    : step.current
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {step.completed ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <span
                className={`text-xs mt-2 ${
                  step.completed || step.current
                    ? "text-gray-900"
                    : "text-gray-500"
                }`}
              >
                {step.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-4 ${
                  step.completed ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
