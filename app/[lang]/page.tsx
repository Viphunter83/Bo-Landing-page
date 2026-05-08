import HomePage from '../components/HomePage'

export default function Page({
  params,
  searchParams
}: {
  params: { lang: string }
  searchParams: { vibe?: string }
}) {
  return <HomePage lang={params.lang} searchParams={searchParams} />
}
