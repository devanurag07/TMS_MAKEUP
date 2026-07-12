import MirrorFrame from "@/design-system/components/common/mirror-frame";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <MirrorFrame>
            {children}
        </MirrorFrame>
    );
}
