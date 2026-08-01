export default function LoadingState({ label = 'Loading…' }: { label?: string }) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-accent" />
            <p className="text-sm text-white/40">{label}</p>
        </div>
    );
}
