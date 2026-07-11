import Link from 'next/link'
import { NewExerciseForm } from './form'

export default async function NewExercisePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params

  return (
    <div className="page">
      <header className="page-header">
        <Link href={`/${slug}`} className="back">
          &larr;
        </Link>
        <h1>New exercise</h1>
      </header>

      <NewExerciseForm slug={slug} />
    </div>
  )
}
