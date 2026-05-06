import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

export default function ConfirmDialog({
    open,
    onOpenChange,
    title,
    description,
    confirmLabel = 'Konfirmasi',
    cancelLabel = 'Batal',
    destructive = false,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel?: string;
    cancelLabel?: string;
    destructive?: boolean;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="rounded-3xl border border-border/80 bg-card shadow-md sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription className="leading-6">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:justify-end">
                    <Button variant="outline" onClick={() => onOpenChange(false)} className="sm:min-w-24">
                        {cancelLabel}
                    </Button>
                    <Button
                        variant={destructive ? 'destructive' : 'default'}
                        onClick={onConfirm}
                        className="sm:min-w-24"
                    >
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
