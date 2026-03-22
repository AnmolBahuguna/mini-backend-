import { useParams } from 'react-router-dom'
import { PageHero } from '../components/layout/PageHero'

export function ReportDetailPage() {
  const { id } = useParams()

  return (
    <div>
      <PageHero title="Report Details" subtitle={`Viewing community report #${id || 'Unknown'}`} />
      <section className="page-wrap py-16">
        <div className="card">
          <h3 className="text-xl font-bold text-white">Report {id}</h3>
          <p className="mt-3 text-gray-300">This route is ready for backend-connected report details and timeline rendering.</p>
        </div>
      </section>
    </div>
  )
}
