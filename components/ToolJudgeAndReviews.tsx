"use client";

import { useState } from "react";
import type { Machine } from "../content/machines";
import type { SettingPosterior } from "../lib/judge";
import MachineJudgeForm from "./MachineJudgeForm";
import PremiumMemberCard from "./PremiumMemberCard";
import MachineReviewsCard from "./MachineReviewsCard";

export default function ToolJudgeAndReviews({
  machine,
  isPremium,
}: {
  machine: Machine;
  isPremium: boolean;
}) {
  const [posteriors, setPosteriors] = useState<SettingPosterior[] | null>(null);

  return (
    <>
      <MachineJudgeForm
        machine={machine}
        isPremium={isPremium}
        onPosteriorsChange={setPosteriors}
      />
      <PremiumMemberCard machine={machine} isPremium={isPremium} posteriors={posteriors} />
      <MachineReviewsCard machineId={machine.id} />
    </>
  );
}
