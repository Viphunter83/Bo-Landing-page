import HomePage from './components/HomePage'

export default function RootPage({
    searchParams
}: {
    searchParams: { vibe?: string, promoCode?: string }
}) {
    // Directly render the English version on root to preserve Telegram Hash Params.
    // We mock the params to 'en'.
    return <HomePage lang="en" searchParams={searchParams} />
}
