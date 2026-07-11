import { notFound } from 'next/navigation'

export default async function SlugLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const expected = process.env.SECRET_SLUG

  if (!expected || slug !== expected) {
    notFound()
  }

  return <main>{children}</main>
}
