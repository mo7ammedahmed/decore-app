import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import DangerButton from '@/Components/DangerButton';
import { useId } from 'react';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmLabel?: string;
    danger?: boolean;
    processing?: boolean;
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    danger = true,
    processing = false,
}: ConfirmDialogProps) {
    // Unique ids so the dialog is announced with its title and description.
    const titleId = useId();
    const messageId = useId();

    return (
        <Modal
            show={open}
            onClose={onClose}
            maxWidth="sm"
            labelledBy={titleId}
            describedBy={messageId}
        >
            <div className="p-7">
                <h3 id={titleId} className="font-heading text-2xl italic text-white">
                    {title}
                </h3>
                <p id={messageId} className="mt-3 text-sm leading-relaxed text-white/55">
                    {message}
                </p>

                <div className="mt-7 flex items-center justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    {danger ? (
                        <DangerButton onClick={onConfirm} disabled={processing}>
                            {processing ? 'Working…' : confirmLabel}
                        </DangerButton>
                    ) : (
                        <PrimaryButton onClick={onConfirm} disabled={processing}>
                            {processing ? 'Working…' : confirmLabel}
                        </PrimaryButton>
                    )}
                </div>
            </div>
        </Modal>
    );
}
