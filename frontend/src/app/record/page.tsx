import { EmptyState } from "@/components/common/EmptyState";
import { AppShell } from "@/components/layout/AppShell";

export default function RecordPage() {
  return (
    <AppShell title="記録">
      <EmptyState
        title="記録画面は未実装です"
        description="後続の feature/daily-log-page で実装予定です。"
      />
    </AppShell>
  );
}
