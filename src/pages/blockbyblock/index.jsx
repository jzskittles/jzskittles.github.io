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
      <h1>Block By Block Workshops</h1>
      <>
        {workshops.map((workshop) => {
          return (
            <ProjectPanel key={workshop.id} id={workshop.id} name={workshop.name} startDate={workshop.startDate} endDate={workshop.endDate} numGroups={workshop.numGroups} />
          )
        })}
      </>
      <div style={{ padding: "20px", border: "1px solid", borderRadius: "10px", maxWidth: "600px", margin: "auto", backgroundColor: "#9DC8EB", color: "#000000" }}>
        <Link href='/createnewproject'> + Create New Project</Link>
      </div>
    </div>
  )
}

export async function getServerSideProps() {
  return { props: { title: 'Index' } }
}
