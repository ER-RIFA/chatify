function BorderAnimatedContainer({ children }) {
    return (
        <div
            className="w-full h-full p-[1px] rounded-lg
            [background:linear-gradient(45deg,#172033,theme(colors.slate.800)_50%,#172033)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,theme(colors.cyan.500)_86%,theme(colors.slate.600/.48)_90%)_border-box]
            border border-transparent
            animate-border
            flex
            overflow-hidden"
        >
            {children}
        </div>
    );
}

export default BorderAnimatedContainer;