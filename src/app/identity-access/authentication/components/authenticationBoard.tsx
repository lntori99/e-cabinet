"use client";

import {
  FiAlertTriangle,
  FiCheckCircle,
  FiKey,
  FiShieldOff,
  FiZap,
} from "react-icons/fi";
import { DetailRow, Table, Td, Th } from "@/common/table";
import { stamp } from "@/common/time";
import { StatusBadge, classificationTone } from "@/common/ui";
import { useAppDispatch, useAppSelector } from "@/core/hook";
import { selectTokens } from "@/core/slices/identity-slice";
import { selectUsers } from "@/core/slices/users-slice";
import { setTokenStatus } from "@/core/thunks-identity";
import {
  IDENTITY_PROVIDER,
  MFA_POLICIES,
  STEP_UP_RULES,
} from "@/data/identityAccess";
import { userName } from "../../components/iamStatus";

const IDP_TONE = {
  Connected: "green",
  Degraded: "amber",
  Unreachable: "red",
} as const;

export default function AuthenticationBoard() {
  const dispatch = useAppDispatch();
  const tokens = useAppSelector(selectTokens);
  const users = useAppSelector(selectUsers);

  const idp = IDENTITY_PROVIDER;
  const resilience = idp.resiliencePath;

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                FR-IAM-02 · Single sign-on
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                {idp.name}
              </h2>
            </div>
            <StatusBadge tone={IDP_TONE[idp.status]}>{idp.status}</StatusBadge>
          </header>

          <div className="mt-4 space-y-0.5">
            <DetailRow label="Protocol" value={idp.protocol} />
            <DetailRow label="Entity ID" value={idp.entityId} />
            <DetailRow label="Last handshake" value={stamp(idp.lastHandshake)} />
            <DetailRow
              label="Metadata refreshed"
              value={stamp(idp.metadataRefreshed)}
            />
          </div>

          <p className="mt-4 text-xs text-neutral-500 dark:text-neutral-400">
            Accounts are authenticated against the approved Government directory.
            The platform holds no password of its own for directory users.
          </p>
        </article>

        <article className="rounded-lg border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900">
          <header className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500 dark:text-neutral-400">
                FR-IAM-03 · Resilience path
              </p>
              <h2 className="mt-1 font-bold text-neutral-900 dark:text-neutral-100">
                Local authentication
              </h2>
            </div>
            <StatusBadge tone={resilience.enabled ? "amber" : "neutral"}>
              {resilience.enabled ? "Armed" : "Disabled"}
            </StatusBadge>
          </header>

          <div className="mt-4 space-y-0.5">
            <DetailRow label="Who may use it" value={resilience.scope} />
            <DetailRow
              label="Maximum window"
              value={`${resilience.maxHours} hours from the first local sign-in`}
            />
            <DetailRow
              label="Last used"
              value={resilience.lastUsed ? stamp(resilience.lastUsed) : "Never"}
            />
          </div>

          <p
            className="mt-4 flex items-start gap-2 text-xs"
            style={{ color: "var(--viz-warning)" }}
          >
            <FiZap size={14} className="mt-0.5 shrink-0" aria-hidden="true" />
            <span className="text-neutral-600 dark:text-neutral-300">
              The path opens only while the directory is unreachable, and every
              local sign-in is written to the audit log as a distinct event.
            </span>
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <div>
            <h2 className="font-bold">Multi-factor policy</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-IAM-04 — executive users, Secretariat users, administrators and
              all remote access must present a second factor.
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Role group</Th>
                <Th>Accepted factors</Th>
                <Th>Enforcement</Th>
              </tr>
            </thead>
            <tbody>
              {MFA_POLICIES.map((policy) => (
                <tr key={policy.role}>
                  <Td>
                    <span className="font-medium text-neutral-900 dark:text-neutral-100">
                      {policy.role}
                    </span>
                  </Td>
                  <Td>{policy.factors.join(" · ")}</Td>
                  <Td>
                    <span className="inline-flex items-center gap-1.5 whitespace-nowrap">
                      {policy.enforcement === "Always" ? (
                        <FiCheckCircle
                          size={13}
                          style={{ color: "var(--viz-good)" }}
                          aria-hidden="true"
                        />
                      ) : (
                        <FiAlertTriangle
                          size={13}
                          style={{ color: "var(--viz-warning)" }}
                          aria-hidden="true"
                        />
                      )}
                      {policy.enforcement}
                    </span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        <div className="space-y-3">
          <div>
            <h2 className="font-bold">Step-up thresholds</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-IAM-06 — opening a document above the configured classification
              demands a fresh challenge, however recently the user signed in.
            </p>
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Classification</Th>
                <Th>Challenge</Th>
                <Th align="right">Factor age</Th>
              </tr>
            </thead>
            <tbody>
              {STEP_UP_RULES.map((rule) => (
                <tr key={rule.classification}>
                  <Td>
                    <span className={`stamp ${classificationTone(rule.classification)}`}>
                      {rule.classification}
                    </span>
                  </Td>
                  <Td>{rule.requires}</Td>
                  <Td align="right">
                    <span className="font-mono">{rule.maxAgeMinutes} min</span>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <div>
            <h2 className="font-bold">FIDO2 token registry</h2>
            <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
              FR-IAM-05 — phishing-resistant hardware tokens issued to Cabinet
              members, Secretariat power users and technical administrators.
            </p>
          </div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {tokens.filter((t) => t.status === "Active").length} active of{" "}
            {tokens.length} issued
          </p>
        </div>

        <Table>
          <thead>
            <tr>
              <Th>Serial</Th>
              <Th>Holder</Th>
              <Th>Registered</Th>
              <Th>Last used</Th>
              <Th>Status</Th>
              <Th align="right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {tokens.map((token) => (
              <tr
                key={token.id}
                className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
              >
                <Td>
                  <span className="inline-flex items-center gap-2 font-mono">
                    <FiKey size={13} className="text-neutral-400" aria-hidden="true" />
                    {token.serial}
                  </span>
                  <span className="mt-0.5 block text-xs text-neutral-500 dark:text-neutral-400">
                    {token.model}
                  </span>
                </Td>
                <Td>{userName(users, token.holderId)}</Td>
                <Td>
                  <span className="font-mono">{token.registeredAt}</span>
                </Td>
                <Td>
                  <span className="font-mono">{stamp(token.lastUsed)}</span>
                </Td>
                <Td>
                  <StatusBadge
                    tone={
                      token.status === "Active"
                        ? "green"
                        : token.status === "Reported lost"
                          ? "amber"
                          : "neutral"
                    }
                  >
                    {token.status}
                  </StatusBadge>
                </Td>
                <Td align="right">
                  {token.status === "Revoked" ? (
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">
                      Withdrawn
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        dispatch(setTokenStatus(token.id, token.serial, "Revoked"))
                      }
                      className="inline-flex items-center gap-2 rounded-lg border border-seal-500 px-3 py-1.5 text-sm font-medium text-seal-500 transition hover:bg-seal-500 hover:text-white"
                    >
                      <FiShieldOff size={14} aria-hidden="true" />
                      Revoke
                    </button>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      </section>
    </div>
  );
}
