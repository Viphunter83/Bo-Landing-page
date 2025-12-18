export default function LangLayout({
    children,
    params
}: {
    children: React.ReactNode
    params: { lang: string }
}) {
    return (
        <div lang={params.lang} dir={params.lang === 'ar' ? 'rtl' : 'ltr'}>
            {children}
        </div>
    )
}
