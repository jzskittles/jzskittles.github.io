import dynamic from 'next/dynamic'
import ProjectPanel from '@/components/dom/ProjectPanel'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
// Dynamic import is used to prevent a payload when the website starts, that includes threejs, r3f etc..
// WARNING ! errors might get obfuscated by using dynamic import.
// If something goes wrong go back to a static import to show the error.
// https://github.com/pmndrs/react-three-next/issues/49
const Logo = dynamic(() => import('@/components/canvas/Logo'), { ssr: false })

// Dom components go here
export default function Page(props) {
  const router = useRouter()
  const [workshops, setWorkshops] = useState([])
  const fetchWorkshops = async () => {
    const response = await fetch('/api/workshops')
    const data = await response.json()
    setWorkshops(data)
    console.log("FETCH", workshops, data)
  }
  useEffect(() => { fetchWorkshops() }, [router.query.slug])
  return (
    <div>
      <>
        {workshops.map((workshop) => {
          return (
            <ProjectPanel id={workshop.id} name={workshop.name} startDate={workshop.startDate} endDate={workshop.endDate} numGroups={workshop.numGroups} />
          )
        })}
      </>
      <Link href='/createnewproject'> + Create New Project</Link>
    </div>
  )
}

// Canvas components go here
// It will receive same props as the Page component (from getStaticProps, etc.)
//Page.canvas = (props) => <Logo scale={0.5} route='/blob' position-y={-1} />
Page.canvas = (props) => <Logo scale={0.5} route='/blockbyblock' position-y={-1} />

export async function getStaticProps() {
  return { props: { title: 'Index' } }
}
