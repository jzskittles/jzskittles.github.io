import { useRouter } from 'next/router'

export default function ProjectPanel({ id, name, startDate, endDate, numGroups }) {
  const router = useRouter()
  const clicked = async (e) => {
    router.push("/blockbyblock/" + id)
  }
  return (
    <>
      <div >
        <div className='tracking-wider' style={{
          padding: "20px", border: "1px solid", borderRadius: "10px", maxWidth: "600px", margin: "auto", backgroundColor: "#CEE3F6", color: "#000000"
        }} onClick={clicked}>
          <div>Project Name: {name}</div>
          <div>Number of Groups: {numGroups}</div>
          <div>Workshop Dates: {startDate} - {endDate}</div>
        </div>
      </div>
    </>
  )
}
