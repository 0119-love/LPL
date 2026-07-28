import type { ReactNode } from "react";
import { Panel } from "./panel";
import { CommitteeConsensus } from "./committee-consensus";
import { CommitteeDisagreement } from "./committee-disagreement";
import { CommitteeMember, CommitteeTableHead, type CommitteeMemberData } from "./committee-member";

export function VerdictPanel({
  eyebrow,
  meta,
  consensus,
  disagreement,
  members,
  footer,
  className = "",
}: {
  eyebrow: ReactNode;
  meta?: ReactNode;
  consensus: {
    verdictLabel: string;
    score: number;
    scoreMax?: number;
    agree: number;
    total: number;
    confidence: number;
  };
  disagreement: { dimensions: { dimension: string; value: number }[]; title?: string };
  members: CommitteeMemberData[];
  footer?: ReactNode;
  className?: string;
}) {
  return (
    <Panel eyebrow={eyebrow} meta={meta} noPadding className={className}>
      <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
        <div className="lg:col-span-2 border-b lg:border-b-0 lg:border-r border-[var(--term-border)]">
          <CommitteeConsensus {...consensus} />
          <div className="px-5 pb-5">
            <CommitteeDisagreement {...disagreement} height={200} />
          </div>
        </div>

        <div className="lg:col-span-3 flex flex-col">
          <CommitteeTableHead />
          <div className="flex-1 divide-y divide-[var(--term-border)]">
            {members.map((member) => (
              <CommitteeMember
                key={member.id}
                initial={member.initial}
                role={member.role}
                description={member.description}
                verdict={member.verdict}
                score={member.score}
              />
            ))}
          </div>
          {footer}
        </div>
      </div>
    </Panel>
  );
}
