import { EmptyState } from "@/components/common/EmptyState";
import { AppShell } from "@/components/layout/AppShell";

export default function MyPage() {
  return (
    <AppShell title="マイページ">
      <EmptyState
        title="マイページは未実装です"
        description="後続の feature/my-page で実装予定です。"
      />
    </AppShell>
  );
}
