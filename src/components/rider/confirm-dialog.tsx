import { Button } from "@/components/ui/button";

export function ConfirmDialog(props: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  cancelLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-fg/40 p-4 sm:items-center">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl bg-card p-5 shadow-[var(--shadow-border)]"
      >
        <h2 className="font-display text-xl font-medium">{props.title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{props.body}</p>
        <div className="mt-5 flex flex-col gap-2">
          <Button
            variant={props.danger ? "destructive" : "default"}
            size="lg"
            onClick={props.onConfirm}
          >
            {props.confirmLabel}
          </Button>
          <Button variant="outline" size="lg" onClick={props.onCancel}>
            {props.cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
