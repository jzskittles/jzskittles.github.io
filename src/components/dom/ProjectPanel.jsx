import { useRouter } from 'next/router'

export default function ProjectPanel({ id, name, startDate, endDate, numGroups }) {
  const router = useRouter()
  const clicked = async (e) => {
    console.log("clicked! " + id)
    router.push("/blockbyblock/" + id)
  }
  return (
    <div
      style={{ maxWidth: 'calc(100% - 28px)' }} onClick={clicked}>
      <div className='tracking-wider'>
        <div>Project Name: {name}</div>
        <div>Number of Groups: {numGroups}</div>
        <div>Workshop Dates: {startDate} - {endDate}</div>
      </div>
    </div>
  )
}
