import { ArcElement, Chart as ChartJS, Legend, Tooltip } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

type Props = {
  labels: string[]
  values: number[]
}

export function DoughnutChart({ labels, values }: Props) {
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
