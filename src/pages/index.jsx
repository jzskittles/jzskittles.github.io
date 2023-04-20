import Link from 'next/link'

export default function Page(props) {
  return (
    <div>
      <Link href='/blockbyblock'>Block by Block</Link>
    </div>
  )
}

export async function getStaticProps() {
  return { props: { title: 'Index' } }
}
