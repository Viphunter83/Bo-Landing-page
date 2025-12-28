import Home from './[lang]/page'

export default function RootPage({
    searchParams
}: {
    searchParams: { vibe?: string, promoCode?: string }
}) {
    // Directly render the English version on root to preserve Telegram Hash Params.
    // We mock the params to 'en'.
    return (
        <div lang="en" dir="ltr">
            <Home
                params={{ lang: 'en' }}
                searchParams={searchParams}
            />
        </div>
    )
}
