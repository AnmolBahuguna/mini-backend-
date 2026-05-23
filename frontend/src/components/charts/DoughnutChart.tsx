import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'
import { LoadingSkeleton } from '../ui/LoadingSkeleton'

ChartJS.register(ArcElement, Tooltip, Legend)

type Props = {
  labels: string[]
  values: number[]
}

export function DoughnutChart({ labels, values }: Props) {
  if (!values || values.length === 0) {
    return <LoadingSkeleton rows={4} className="mx-auto h-64 w-64" />
  }

  return (
    <div className="mx-auto h-64 w-64">
      <Doughnut
        data={{
          labels,
          datasets: [
            {
              data: values,
              backgroundColor: ['#DC2626', '#D97706', '#059669'],
              borderColor: '#0A0F1E',
              borderWidth: 2,
            },
          ],
        }}
        options={{
          plugins: {
            legend: {
              labels: {
                color: '#F9FAFB',
              },
            },
          },
        }}
      />
    </div>
  )
}
