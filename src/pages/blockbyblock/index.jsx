import ProjectPanel from '@/components/dom/ProjectPanel'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

// Dom components go here
export default function Page() {
  const router = useRouter()
  const [workshops, setWorkshops] = useState([])

  const fetchWorkshops = async () => {
    const response = await fetch('/api/workshops')
    const data = await response.json()
    setWorkshops(data)
  }

  useEffect(() => {
    fetchWorkshops()
  }, [router.query.slug])

  return (
    <div>
      <>
        {workshops.map((workshop) => {
          return (
            <ProjectPanel key={workshop.id} id={workshop.id} name={workshop.name} startDate={workshop.startDate} endDate={workshop.endDate} numGroups={workshop.numGroups} />
          )
        })}
      </>
      <Link href='/createnewproject'> + Create New Project</Link>
    </div>
  )
}

export async function getServerSideProps() {
  return { props: { title: 'Index' } }
}
