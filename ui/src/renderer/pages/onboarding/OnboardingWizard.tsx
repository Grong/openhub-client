/**
 * @license
 * Copyright 2025-2026 NomiFun (nomifun.com)
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeStep from './steps/WelcomeStep';
import ApiKeyStep from './steps/ApiKeyStep';
import CompanionStep from './steps/CompanionStep';

import { ONBOARDING_SKIPPED_KEY } from "./constants";

const OnboardingWizard: React.FC = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const handleNext = () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const handleSkip = () => finish();

  const finish = () => {
    localStorage.setItem(ONBOARDING_SKIPPED_KEY, 'true');
    navigate('/guid');
  };

  const steps = [
    <WelcomeStep key='welcome' onNext={handleNext} onSkip={handleSkip} />,
    <ApiKeyStep key='apikey' onNext={handleNext} onSkip={handleSkip} />,
    <CompanionStep key='companion' onNext={handleNext} />,
  ];

  return (
    <div className='onboarding-wizard size-full flex items-center justify-center bg-fill-1'>
      <div className='onboarding-card w-420px rd-12px bg-white p-32px shadow-md'>
        {/* Step indicator */}
        <div className='flex justify-center gap-8px mb-24px'>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`h-6px rd-3px transition-all ${
                i === step ? 'w-24px bg-primary-6' : i < step ? 'w-12px bg-primary-4' : 'w-12px bg-fill-3'
              }`}
            />
          ))}
        </div>
        {steps[step]}
      </div>
    </div>
  );
};

export default OnboardingWizard;
