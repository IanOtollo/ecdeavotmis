import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { ClipboardList } from "lucide-react";
import { format } from "date-fns";

export default function AuditLog() {
  const logs = useQuery(api.auditLogs.list, { limit: 100 });

  return (
    <div className="page-container space-y-6">
      <div>
        <h1 className="section-heading">Audit Log</h1>
        <p className="text-sm text-muted-foreground mt-1">Last 100 system actions</p>
      </div>

      {logs === undefined ? (
        <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="h-10 w-10 text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground text-sm">No audit entries yet</p>
        </div>
      ) : (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {["Time", "User", "Action", "Entity"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {logs.map((log) => (
                <tr key={log._id} className="data-table-row">
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
                    {format(new Date(log.createdAt), "dd MMM yyyy HH:mm")}
                  </td>
                  <td className="px-4 py-3 font-medium">{log.userName}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">{log.action.replace(/_/g, " ")}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.entity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
