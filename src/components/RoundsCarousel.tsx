import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoundCard from "./RoundCard";
import { type RoundView } from "../lib/api";

type Props = {
  rounds: RoundView[];
  addr: string | null;
  head: number | null;
  /** wallet's on-chain bets grouped by round id */
  betsByRound?: Record<number, Array<{ mode: string; pick: string }>>;
  onNeedConnect: () => void;
  onOpenPF: (b: number) => void;
  onBet: (roundId: number, info: { mode: string; pick: string }) => void;
};

/** cards shown per carousel page — the number of live rounds itself is uncapped */
const PAGE_SIZE = 2;


export default function RoundsCarousel({ rounds, addr, head, onNeedConnect, onOpenPF, onBet }: Props) {
  const pages = Math.max(1, Math.ceil(rounds.length / PAGE_SIZE));
  const [page, setPage] = React.useState(0);

  React.useEffect(() => {
    if (page > pages - 1) setPage(pages - 1);
  }, [pages, page]);

  const showNav = rounds.length > PAGE_SIZE;

  const pageGroups: RoundView[][] = [];
  for (let i = 0; i < rounds.length; i += PAGE_SIZE) {
    pageGroups.push(rounds.slice(i, i + PAGE_SIZE));
  }

  return (
    <div className="rounds-carousel">
      <div className="rc-stage">
        {showNav && (
          <button
            className="rc-arrow rc-arrow-left"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="Previous rounds"
          >
            <ChevronLeft size={22} strokeWidth={3} />
          </button>
        )}

        <div className="rc-viewport">
          <div
            className="rc-track"
            style={{ transform: `translateX(-${page * 100}%)` }}
          >
            {pageGroups.map((group, gi) => (
              <div className="rc-page" key={gi}>
                <div className="rounds">
                  {group.map((r) => {
                    const globalIdx = gi * PAGE_SIZE + group.indexOf(r);
                    return (
                      <RoundCard
                        key={r.id}
                        round={r}
                        slot={globalIdx === 0 ? "closing" : "open"}
                        addr={addr}
                        head={head}
                        onNeedConnect={onNeedConnect}
                        onOpenPF={onOpenPF}
                        onBet={(info) => onBet(r.id, info)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {showNav && (
          <button
            className="rc-arrow rc-arrow-right"
            onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
            disabled={page >= pages - 1}
            aria-label="Next rounds"
          >
            <ChevronRight size={22} strokeWidth={3} />
          </button>
        )}
      </div>

      {showNav && (
        <div className="rc-dots" role="tablist">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              className={`rc-dot ${i === page ? "active" : ""}`}
              onClick={() => setPage(i)}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
