import { useLiveVotes } from "../hooks/useLiveVotes";

export default function LivePolls() {
  const { polls, isLoading, isError, refetch } = useLiveVotes();

  if (isLoading) return <div style={{ padding: 24 }}>Loading polls…</div>;
  if (isError)
    return (
      <div style={{ padding: 24 }}>
        Error loading polls. <button onClick={() => refetch()}>Retry</button>
      </div>
    );

  return (
    <div style={{ maxWidth: 1000, margin: "32px auto", padding: 12 }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 20,
        }}
      >
        <h1 style={{ margin: 0 }}>Live Polls</h1>
        <div>
          <button
            onClick={() => refetch()}
            style={{ padding: "6px 10px", cursor: "pointer" }}
          >
            Refresh
          </button>
        </div>
      </header>

      <div>
        {polls.length === 0 && (
          <div style={{ color: "#666" }}>No polls yet</div>
        )}

        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}
        >
          {polls.map((p) => (
            <div
              key={p.id}
              style={{
                padding: 14,
                borderRadius: 8,
                background: "#0f1724",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.03)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                }}
              >
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  {p.question}
                </div>
                <div style={{ fontSize: 12, color: "#9aa4b2" }}>
                  {new Date(p.createdAt).toLocaleString()}
                </div>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                {p.options.map((o) => (
                  <div
                    key={o.id}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "8px 10px",
                      borderRadius: 8,
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={{ textAlign: "start" }}>
                      <p>{o.text}</p>
                      <p>{o.id}</p>
                    </div>
                    <div
                      style={{
                        minWidth: 48,
                        textAlign: "right",
                        color: "#9aa4b2",
                      }}
                    >
                      {o.votes}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
